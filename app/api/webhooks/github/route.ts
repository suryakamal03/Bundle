import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/backend/integrations/githubService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-hub-signature-256');
    const event = req.headers.get('x-github-event');
    
    if (!event) {
      return NextResponse.json({ error: 'Missing event type' }, { status: 400 });
    }

    const payload = await req.json();

    if (!payload.repository) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { owner, name: repo } = payload.repository;
    const fullRepoName = `${owner.login}/${repo}`;

    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('githubOwner', '==', owner.login),
      where('githubRepo', '==', repo)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ 
        error: 'Project not found for this repository',
        repository: fullRepoName
      }, { status: 404 });
    }

    const projectId = querySnapshot.docs[0].id;

    switch (event) {
      case 'push':
        await githubService.processPushEvent(payload, projectId);
        break;
      case 'pull_request':
        await githubService.processPullRequestEvent(payload, projectId);
        break;
      case 'issues':
        await githubService.processIssueEvent(payload, projectId);
        break;
      default:
        console.log(`Unhandled event type: ${event}`);
    }

    return NextResponse.json({ 
      success: true, 
      event,
      projectId,
      repository: fullRepoName
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      message: error.message 
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
