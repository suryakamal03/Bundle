import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/backend/integrations/githubService';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const signature = req.headers.get('x-hub-signature-256');
    const event = req.headers.get('x-github-event');
    const deliveryId = req.headers.get('x-github-delivery');
    const contentType = req.headers.get('content-type');
    
    console.log(`[Webhook ${deliveryId}] ===== START =====`);
    console.log(`[Webhook ${deliveryId}] Event: ${event}`);
    console.log(`[Webhook ${deliveryId}] Content-Type: ${contentType}`);
    console.log(`[Webhook ${deliveryId}] Has Signature: ${!!signature}`);
    
    if (!event) {
      console.error(`[Webhook ${deliveryId}] ERROR: Missing event type header`);
      return NextResponse.json({ error: 'Missing event type' }, { status: 400 });
    }

    // Parse payload based on content type
    let payload;
    let rawBody;
    
    try {
      rawBody = await req.text();
      console.log(`[Webhook ${deliveryId}] Raw body length: ${rawBody.length} bytes`);
      
      if (contentType?.includes('application/x-www-form-urlencoded')) {
        // GitHub sends form-encoded data with payload field
        console.log(`[Webhook ${deliveryId}] Parsing form-encoded data...`);
        const params = new URLSearchParams(rawBody);
        const payloadStr = params.get('payload');
        
        if (!payloadStr) {
          // Sometimes GitHub sends the JSON directly even with form content-type
          console.log(`[Webhook ${deliveryId}] No 'payload' param found, trying direct JSON parse...`);
          try {
            payload = JSON.parse(rawBody);
            console.log(`[Webhook ${deliveryId}] ✅ Parsed as direct JSON despite form content-type`);
          } catch {
            console.error(`[Webhook ${deliveryId}] ERROR: No payload field and not valid JSON`);
            console.error(`[Webhook ${deliveryId}] Body preview: ${rawBody.substring(0, 200)}`);
            return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
          }
        } else {
          payload = JSON.parse(payloadStr);
          console.log(`[Webhook ${deliveryId}] ✅ Parsed form-encoded payload successfully`);
        }
      } else {
        // JSON content type or fallback
        payload = JSON.parse(rawBody);
        console.log(`[Webhook ${deliveryId}] ✅ Parsed JSON payload successfully`);
      }
    } catch (parseError: any) {
      console.error(`[Webhook ${deliveryId}] ERROR parsing payload:`, parseError.message);
      return NextResponse.json({ error: 'Invalid payload format', details: parseError.message }, { status: 400 });
    }

    if (!payload.repository) {
      console.error(`[Webhook ${deliveryId}] ERROR: Invalid payload - missing repository`);
      console.error(`[Webhook ${deliveryId}] Payload keys:`, Object.keys(payload));
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { owner, name: repo } = payload.repository;
    const fullRepoName = `${owner.login}/${repo}`;

    console.log(`[Webhook ${deliveryId}] Repository: ${fullRepoName}`);

    // Check if projectId is provided in query params
    const { searchParams } = new URL(req.url);
    const projectIdParam = searchParams.get('projectId');
    let projectId: string;
    let projectName: string;

    if (projectIdParam) {
      // Direct project targeting via URL parameter
      console.log(`[Webhook ${deliveryId}] Using projectId from URL: ${projectIdParam}`);
      
      const projectDoc = await adminDb.collection('projects').doc(projectIdParam).get();
      
      if (!projectDoc.exists) {
        console.error(`[Webhook ${deliveryId}] ❌ Project not found: ${projectIdParam}`);
        return NextResponse.json({ 
          error: 'Project not found',
          projectId: projectIdParam,
          deliveryId
        }, { status: 404 });
      }
      
      const projectData = projectDoc.data();
      projectId = projectDoc.id;
      projectName = projectData?.name || 'Unknown';
      
      // Verify repository matches (security check)
      if (projectData?.githubOwner !== owner.login || projectData?.githubRepo !== repo) {
        console.warn(`[Webhook ${deliveryId}] ⚠️ Repository mismatch!`);
        console.warn(`[Webhook ${deliveryId}] Expected: ${projectData?.githubOwner}/${projectData?.githubRepo}`);
        console.warn(`[Webhook ${deliveryId}] Received: ${fullRepoName}`);
        return NextResponse.json({ 
          error: 'Repository mismatch - webhook configured for wrong repository',
          expected: `${projectData?.githubOwner}/${projectData?.githubRepo}`,
          received: fullRepoName,
          deliveryId
        }, { status: 400 });
      }
      
      console.log(`[Webhook ${deliveryId}] ✅ Matched to project: "${projectName}" (ID: ${projectId})`);
    } else {
      // Legacy: Find project by repository (for backwards compatibility)
      console.log(`[Webhook ${deliveryId}] No projectId param - searching for project with owner: "${owner.login}", repo: "${repo}"`);
      
      const projectsRef = adminDb.collection('projects');
      const querySnapshot = await projectsRef
        .where('githubOwner', '==', owner.login)
        .where('githubRepo', '==', repo)
        .get();

      if (querySnapshot.empty) {
        console.warn(`[Webhook ${deliveryId}] ⚠️ NO PROJECT FOUND`);
        console.warn(`[Webhook ${deliveryId}] Searched for owner="${owner.login}", repo="${repo}"`);
        
        // List all projects for debugging
        const allProjects = await projectsRef.limit(10).get();
        console.warn(`[Webhook ${deliveryId}] Available projects in DB (first 10):`);
        allProjects.forEach(doc => {
          const data = doc.data();
          console.warn(`  - ${data.name}: owner="${data.githubOwner}", repo="${data.githubRepo}"`);
        });
        
        return NextResponse.json({ 
          error: 'Project not found for this repository',
          repository: fullRepoName,
          deliveryId,
          searched: { owner: owner.login, repo },
          hint: 'Use ?projectId=YOUR_PROJECT_ID in webhook URL for project-specific webhooks'
        }, { status: 404 });
      }

      projectId = querySnapshot.docs[0].id;
      const projectData = querySnapshot.docs[0].data();
      projectName = projectData.name;
      
      console.log(`[Webhook ${deliveryId}] ✅ Matched to project: "${projectName}" (ID: ${projectId})`);
    }

    // Handle ping event
    if (event === 'ping') {
      console.log(`[Webhook ${deliveryId}] Ping received - responding with success`);
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook received successfully',
        repository: fullRepoName,
        projectId,
        projectName,
        deliveryId
      });
    }

    // Process event based on type
    try {
      switch (event) {
        case 'push':
          console.log(`[Webhook ${deliveryId}] Processing PUSH event...`);
          await githubService.processPushEvent(payload, projectId);
          console.log(`[Webhook ${deliveryId}] ✅ Successfully processed push event`);
          break;
          
        case 'pull_request':
          console.log(`[Webhook ${deliveryId}] Processing PULL_REQUEST event...`);
          await githubService.processPullRequestEvent(payload, projectId);
          console.log(`[Webhook ${deliveryId}] ✅ Successfully processed pull_request event`);
          break;
          
        case 'issues':
          console.log(`[Webhook ${deliveryId}] Processing ISSUES event...`);
          await githubService.processIssueEvent(payload, projectId);
          console.log(`[Webhook ${deliveryId}] ✅ Successfully processed issues event`);
          break;
          
        default:
          console.log(`[Webhook ${deliveryId}] ⚠️ Unhandled event type: ${event}`);
      }
    } catch (processingError: any) {
      console.error(`[Webhook ${deliveryId}] ❌ ERROR processing ${event} event:`, processingError.message);
      console.error(`[Webhook ${deliveryId}] Stack:`, processingError.stack);
      throw processingError;
    }

    const processingTime = Date.now() - startTime;
    console.log(`[Webhook ${deliveryId}] ===== COMPLETED in ${processingTime}ms =====`);

    return NextResponse.json({ 
      success: true, 
      event,
      projectId,
      projectName,
      repository: fullRepoName,
      deliveryId,
      processingTime: `${processingTime}ms`
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    const deliveryId = req.headers.get('x-github-delivery') || 'unknown';
    console.error(`[Webhook ${deliveryId}] ===== FAILED =====`);
    console.error(`[Webhook ${deliveryId}] Error:`, error.message);
    console.error(`[Webhook ${deliveryId}] Stack:`, error.stack);
    console.error(`[Webhook ${deliveryId}] Processing time: ${processingTime}ms`);
    
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      message: error.message,
      deliveryId,
      processingTime: `${processingTime}ms`
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/github',
    supportedEvents: ['push', 'pull_request', 'issues'],
    urlFormat: {
      projectSpecific: '/api/webhooks/github?projectId=YOUR_PROJECT_ID (recommended)',
      legacy: '/api/webhooks/github (finds first matching project by repo)'
    },
    instructions: {
      setup: [
        '1. Go to your GitHub repository settings',
        '2. Navigate to Webhooks section',
        '3. Click "Add webhook"',
        '4. Set Payload URL to: https://your-domain.com/api/webhooks/github?projectId=YOUR_PROJECT_ID',
        '5. Set Content type to: application/json',
        '6. Select events: Push, Pull requests, Issues',
        '7. Click "Add webhook"'
      ],
      projectSpecific: [
        'Each project gets a unique webhook URL with its projectId',
        'This allows multiple projects to track the same GitHub repository',
        'Find your project-specific URL in the Webhook tab of your project'
      ],
      localDevelopment: [
        '1. Install ngrok: npm install -g ngrok',
        '2. Run your dev server: npm run dev',
        '3. In a new terminal, run: ngrok http 3000',
        '4. Copy the HTTPS URL from ngrok (e.g., https://abc123.ngrok.io)',
        '5. Use this URL in GitHub webhook: https://abc123.ngrok.io/api/webhooks/github?projectId=YOUR_PROJECT_ID'
      ]
    }
  });
}
