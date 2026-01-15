import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const inviteServiceAdmin = {
  async acceptInvite(inviteId: string, userId: string): Promise<{ success: boolean; message: string; projectId?: string }> {
    try {
      const inviteRef = adminDb.collection('invites').doc(inviteId);
      const inviteDoc = await inviteRef.get();

      if (!inviteDoc.exists) {
        return { success: false, message: 'Invite not found' };
      }

      const invite = inviteDoc.data();
      
      if (!invite) {
        return { success: false, message: 'Invalid invite data' };
      }

      if (invite.status === 'accepted') {
        return { success: false, message: 'Invite already used' };
      }

      if (invite.status === 'expired') {
        return { success: false, message: 'Invite expired' };
      }

      const projectRef = adminDb.collection('projects').doc(invite.projectId);
      const projectDoc = await projectRef.get();

      if (!projectDoc.exists) {
        return { success: false, message: 'Project not found' };
      }

      const projectData = projectDoc.data();
      if (projectData?.members && projectData.members.includes(userId)) {
        return { success: false, message: 'You are already a member of this project' };
      }

      // Update project members using Admin SDK
      await projectRef.update({
        members: FieldValue.arrayUnion(userId)
      });

      // Mark invite as accepted
      await inviteRef.update({
        status: 'accepted',
        acceptedBy: userId,
        acceptedAt: FieldValue.serverTimestamp()
      });

      return {
        success: true,
        message: 'Successfully joined the project',
        projectId: invite.projectId
      };
    } catch (error: any) {
      console.error('Error in acceptInvite:', error);
      return {
        success: false,
        message: error.message || 'Failed to accept invite'
      };
    }
  },

  async createInvite(projectId: string, createdBy: string): Promise<{ inviteId: string; inviteLink: string }> {
    // Check if there's already a pending invite for this project
    const invitesSnapshot = await adminDb.collection('invites')
      .where('projectId', '==', projectId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();
    
    // If a pending invite exists, return it
    if (!invitesSnapshot.empty) {
      const existingInvite = invitesSnapshot.docs[0];
      return {
        inviteId: existingInvite.id,
        inviteLink: `/invites/${existingInvite.id}`
      };
    }
    
    // Otherwise create a new invite
    const inviteData = {
      projectId,
      createdBy,
      createdAt: FieldValue.serverTimestamp(),
      status: 'pending'
    };

    const docRef = await adminDb.collection('invites').add(inviteData);
    
    return {
      inviteId: docRef.id,
      inviteLink: `/invites/${docRef.id}`
    };
  }
};
