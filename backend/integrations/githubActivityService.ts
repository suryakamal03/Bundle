import { collection, query, where, orderBy, limit, getDocs, Unsubscribe, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GitHubActivity } from '@/types';

const sortByCreatedAtDesc = (activities: GitHubActivity[]): GitHubActivity[] => {
  return [...activities].sort((a, b) => {
    const aTime = (a.createdAt as any)?.toDate?.()?.getTime?.() || 0;
    const bTime = (b.createdAt as any)?.toDate?.()?.getTime?.() || 0;
    return bTime - aTime;
  });
};

export const githubActivityService = {
  async getActivitiesByProject(projectId: string, limitCount: number = 20): Promise<GitHubActivity[]> {
    try {
      const q = query(
        collection(db, 'githubActivity'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as GitHubActivity));
    } catch (error) {
      // Fallback for index issues: query by project only, then sort client-side.
      const fallbackQuery = query(
        collection(db, 'githubActivity'),
        where('projectId', '==', projectId),
        limit(limitCount)
      );

      const fallbackSnapshot = await getDocs(fallbackQuery);
      const fallbackActivities = fallbackSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as GitHubActivity));

      return sortByCreatedAtDesc(fallbackActivities);
    }
  },

  subscribeToActivities(
    projectId: string,
    callback: (activities: GitHubActivity[]) => void,
    onError?: (error: Error) => void,
    limitCount: number = 20
  ): Unsubscribe {
    console.log('[githubActivityService] Creating subscription for project:', projectId)
    
    const q = query(
      collection(db, 'githubActivity'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(
      q, 
      (snapshot) => {
        console.log('[githubActivityService] Received snapshot with', snapshot.docs.length, 'activities')
        const activities = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        } as GitHubActivity));
        callback(activities);
      },
      (error) => {
        console.error('[githubActivityService] Subscription error:', error)

        // Fallback subscription without orderBy to avoid index-related failures.
        const fallbackQuery = query(
          collection(db, 'githubActivity'),
          where('projectId', '==', projectId),
          limit(limitCount)
        );

        onSnapshot(
          fallbackQuery,
          (fallbackSnapshot) => {
            const fallbackActivities = fallbackSnapshot.docs.map(doc => ({
              ...doc.data(),
              id: doc.id
            } as GitHubActivity));
            callback(sortByCreatedAtDesc(fallbackActivities));
          },
          (fallbackError) => {
            console.error('[githubActivityService] Fallback subscription error:', fallbackError)
            if (onError) {
              onError(fallbackError as Error)
            }
          }
        );
      }
    );
  }
};

