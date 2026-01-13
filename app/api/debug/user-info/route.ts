import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId parameter required' }, { status: 400 });
    }

    console.log('[Debug] Fetching user info for:', userId);

    // Get user document
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    
    // Get user settings document
    const settingsDoc = await adminDb.collection('userSettings').doc(userId).get();
    const settingsData = settingsDoc.exists ? settingsDoc.data() : null;

    return NextResponse.json({
      userId,
      users_collection: {
        exists: true,
        name: userData?.name,
        email: userData?.email,
        githubUsername: userData?.githubUsername,
        full_data: userData
      },
      userSettings_collection: {
        exists: settingsDoc.exists,
        fullName: settingsData?.fullName,
        githubUsername: settingsData?.githubUsername,
        full_data: settingsData
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Debug] Error fetching user info:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user info',
      message: error.message 
    }, { status: 500 });
  }
}
