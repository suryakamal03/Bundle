import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    // Get all projects with GitHub info
    const projectsRef = adminDb.collection('projects');
    const snapshot = await projectsRef.get();
    
    const projects = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        githubOwner: data.githubOwner || 'NOT SET',
        githubRepo: data.githubRepo || 'NOT SET',
        fullName: data.githubOwner && data.githubRepo ? `${data.githubOwner}/${data.githubRepo}` : 'INCOMPLETE'
      };
    });

    // Get recent webhook events
    const eventsRef = adminDb.collection('github_events');
    const eventsSnapshot = await eventsRef.orderBy('createdAt', 'desc').limit(10).get();
    
    const recentEvents = eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        eventType: data.eventType,
        action: data.action,
        repository: data.repository?.fullName,
        sender: data.sender?.login,
        createdAt: data.createdAt?.toDate().toISOString()
      };
    });

    // Get recent GitHub activities
    const activitiesRef = adminDb.collection('githubActivity');
    const activitiesSnapshot = await activitiesRef.orderBy('createdAt', 'desc').limit(10).get();
    
    const recentActivities = activitiesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        projectId: data.projectId,
        activityType: data.activityType,
        title: data.title,
        githubUsername: data.githubUsername,
        createdAt: data.createdAt?.toDate().toISOString()
      };
    });

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      webhookEndpoint: '/api/webhooks/github',
      projects,
      recentWebhookEvents: recentEvents,
      recentGitHubActivities: recentActivities,
      instructions: {
        setup: [
          '1. Check that your GitHub repository matches one of the projects above',
          '2. Webhook URL should be: https://your-domain.com/api/webhooks/github',
          '3. Content type: application/json',
          '4. Events: push, pull_request, issues',
          '5. Check Recent Deliveries in GitHub webhook settings for errors'
        ]
      }
    });
  } catch (error: any) {
    console.error('[Webhook Debug] Error:', error);
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      message: error.message 
    }, { status: 500 });
  }
}
