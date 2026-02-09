import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || 'dZWKjfrDy2DkrsDifPC';
  
  try {
    // Get project details
    const projectDoc = await adminDb.collection('projects').doc(projectId).get();
    
    if (!projectDoc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const projectData = projectDoc.data();
    
    // Create a test GitHub activity
    const testActivity = {
      projectId,
      repositoryFullName: `${projectData?.githubOwner}/${projectData?.githubRepo}`,
      activityType: 'commit',
      title: '🧪 TEST: Webhook test activity',
      githubUsername: 'test-user',
      branch: 'main',
      githubUrl: `https://github.com/${projectData?.githubOwner}/${projectData?.githubRepo}`,
      githubId: `test-${Date.now()}`,
      avatarUrl: 'https://github.com/github.png',
      createdAt: Timestamp.now()
    };
    
    const activityRef = await adminDb.collection('githubActivity').add(testActivity);
    
    return NextResponse.json({ 
      success: true,
      message: 'Test activity created - check your GitHub tab!',
      project: {
        id: projectId,
        name: projectData?.name,
        githubOwner: projectData?.githubOwner,
        githubRepo: projectData?.githubRepo,
        fullName: `${projectData?.githubOwner}/${projectData?.githubRepo}`
      },
      activity: {
        id: activityRef.id,
        ...testActivity,
        createdAt: 'just now'
      }
    });
    
  } catch (error: any) {
    console.error('[Test Webhook] Error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      message: error.message 
    }, { status: 500 });
  }
}
