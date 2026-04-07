import { NextRequest, NextResponse } from 'next/server';
import { inviteServiceAdmin } from '@/backend/projects/inviteServiceAdmin';

function isLocalOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received invite creation request:', body);
    
    const { projectId, userId } = body;

    if (!projectId || !userId) {
      console.error('Missing required fields:', { projectId, userId });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Creating invite for project:', projectId, 'by user:', userId);
    const result = await inviteServiceAdmin.createInvite(projectId, userId);
    console.log('Invite created successfully:', result);

    const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
    const forwardedHost = req.headers.get('x-forwarded-host');
    const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
    const requestOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : req.nextUrl.origin;
    const baseOrigin = configuredBaseUrl && !isLocalOrigin(configuredBaseUrl)
      ? configuredBaseUrl
      : requestOrigin;
    const absoluteInviteLink = new URL(result.inviteLink, baseOrigin).toString();

    return NextResponse.json({
      success: true,
      inviteId: result.inviteId,
      inviteLink: absoluteInviteLink
    });

  } catch (error: any) {
    console.error('Error creating invite:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to create invite', message: error.message },
      { status: 500 }
    );
  }
}
