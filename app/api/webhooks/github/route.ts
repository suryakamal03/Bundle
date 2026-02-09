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
      if (contentType?.includes('application/json')) {
        // GitHub sends JSON directly
        rawBody = await req.text();
        payload = JSON.parse(rawBody);
        console.log(`[Webhook ${deliveryId}] Parsed JSON payload successfully`);
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        // GitHub sends form-encoded data with payload field
        rawBody = await req.text();
        const params = new URLSearchParams(rawBody);
        const payloadStr = params.get('payload');
        if (!payloadStr) {
          console.error(`[Webhook ${deliveryId}] ERROR: No payload field in form data`);
          return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
        }
        payload = JSON.parse(payloadStr);
        console.log(`[Webhook ${deliveryId}] Parsed form-encoded payload successfully`);
      } else {
        // Fallback: try parsing as JSON
        rawBody = await req.text();
        payload = JSON.parse(rawBody);
        console.log(`[Webhook ${deliveryId}] Parsed fallback JSON payload successfully`);
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

    // Handle ping event
    if (event === 'ping') {
      console.log(`[Webhook ${deliveryId}] Ping received - responding with success`);
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook received successfully',
        repository: fullRepoName,
        deliveryId
      });
    }

    // Find project by repository
    console.log(`[Webhook ${deliveryId}] Searching for project with owner: "${owner.login}", repo: "${repo}"`);
    
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
        searched: { owner: owner.login, repo }
      }, { status: 404 });
    }

    const projectId = querySnapshot.docs[0].id;
    const projectData = querySnapshot.docs[0].data();
    const projectName = projectData.name;
    
    console.log(`[Webhook ${deliveryId}] ✅ Matched to project: "${projectName}" (ID: ${projectId})`);

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
    instructions: {
      setup: [
        '1. Go to your GitHub repository settings',
        '2. Navigate to Webhooks section',
        '3. Click "Add webhook"',
        '4. Set Payload URL to: https://your-domain.com/api/webhooks/github',
        '5. Set Content type to: application/json',
        '6. Select events: Push, Pull requests, Issues',
        '7. Click "Add webhook"'
      ],
      localDevelopment: [
        '1. Install ngrok: npm install -g ngrok',
        '2. Run your dev server: npm run dev',
        '3. In a new terminal, run: ngrok http 3000',
        '4. Copy the HTTPS URL from ngrok (e.g., https://abc123.ngrok.io)',
        '5. Use this URL in GitHub webhook: https://abc123.ngrok.io/api/webhooks/github'
      ]
    }
  });
}
