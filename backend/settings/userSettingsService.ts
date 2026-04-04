import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore'

export interface UserSettings {
  userId: string
  fullName: string
  email: string
  githubUsername?: string
  autoReminder: boolean
  reminderTime: string
  theme: 'light' | 'dark'
  updatedAt: any
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  try {
    const settingsRef = doc(db, 'userSettings', userId)
    const userRef = doc(db, 'users', userId)
    const [settingsDoc, userDoc] = await Promise.all([
      getDoc(settingsRef),
      getDoc(userRef)
    ])
    const userData = userDoc.exists() ? userDoc.data() : {}
    
    if (!settingsDoc.exists()) {
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }

      // Create default settings
      const defaultSettings: UserSettings = {
        userId,
        fullName: userData.name || userData.displayName || '',
        email: userData.email || '',
        githubUsername: userData.githubUsername || '',
        autoReminder: true,
        reminderTime: '09:00',
        theme: 'light',
        updatedAt: new Date()
      }

      try {
        await setDoc(settingsRef, defaultSettings)
      } catch (writeError) {
        // Return fallback data even if userSettings write is currently blocked.
        console.warn('[UserSettings] Could not create userSettings document, returning fallback data:', writeError)
      }
      return defaultSettings
    }

    const settingsData = settingsDoc.data() as Partial<UserSettings>
    const fullName = settingsData.fullName || (userData.name || userData.displayName || '')
    const email = settingsData.email || (userData.email || '')
    const githubUsername = settingsData.githubUsername || (userData.githubUsername || '')

    const normalizedSettings: UserSettings = {
      userId,
      fullName,
      email,
      githubUsername,
      autoReminder: settingsData.autoReminder ?? true,
      reminderTime: settingsData.reminderTime || '09:00',
      theme: (settingsData.theme as 'light' | 'dark') || 'light',
      updatedAt: settingsData.updatedAt || new Date()
    }

    if (
      settingsData.fullName !== fullName ||
      settingsData.email !== email ||
      settingsData.githubUsername !== githubUsername
    ) {
      try {
        await setDoc(settingsRef, {
          fullName,
          email,
          githubUsername,
          updatedAt: new Date()
        }, { merge: true })
      } catch (syncError) {
        // Do not fail settings load if sync-back write fails.
        console.warn('[UserSettings] Could not sync missing userSettings fields:', syncError)
      }
    }

    return normalizedSettings
  } catch (error) {
    console.error('Error getting user settings:', error)
    throw error
  }
}

export async function updateProfile(userId: string, data: { fullName?: string; githubUsername?: string }) {
  try {
    console.log('[UserSettings] Updating profile for user:', userId);
    console.log('[UserSettings] Update data:', data);
    
    const settingsRef = doc(db, 'userSettings', userId)
    const userRef = doc(db, 'users', userId)
    const currentUserDoc = await getDoc(userRef)
    const currentUserData = currentUserDoc.exists() ? currentUserDoc.data() : {}

    const updates: any = {
      updatedAt: new Date()
    }
    
    const normalizedFullName = data.fullName?.trim()
    const normalizedGithubUsername = data.githubUsername?.trim().toLowerCase()

    if (normalizedFullName !== undefined) updates.fullName = normalizedFullName
    if (normalizedGithubUsername !== undefined) updates.githubUsername = normalizedGithubUsername
    
    // Update users collection first (source of truth for profile fields).
    const userUpdates: any = {}
    if (normalizedFullName !== undefined) {
      userUpdates.name = normalizedFullName
      userUpdates.displayName = normalizedFullName
    }
    if (normalizedGithubUsername !== undefined) userUpdates.githubUsername = normalizedGithubUsername
    
    try {
      await updateDoc(userRef, userUpdates);
      console.log('[UserSettings] Updated users collection with:', userUpdates);
    } catch (error: any) {
      if (error.code === 'not-found') {
        console.log('[UserSettings] users document not found, creating it');
        await setDoc(userRef, {
          ...userUpdates,
          email: currentUserData.email || '',
          createdAt: new Date()
        }, { merge: true });
      } else {
        throw error;
      }
    }

    // Best effort: keep userSettings collection in sync.
    try {
      await updateDoc(settingsRef, {
        ...updates,
        email: currentUserData.email || ''
      });
      console.log('[UserSettings] Updated userSettings collection');
    } catch (error: any) {
      if (error.code === 'not-found') {
        console.log('[UserSettings] userSettings document not found, creating it');
        try {
          await setDoc(settingsRef, {
            userId,
            fullName: normalizedFullName || currentUserData.name || currentUserData.displayName || '',
            email: currentUserData.email || '',
            githubUsername: normalizedGithubUsername || currentUserData.githubUsername || '',
            autoReminder: true,
            reminderTime: '09:00',
            theme: 'light',
            updatedAt: new Date()
          }, { merge: true });
        } catch (createSettingsError) {
          console.warn('[UserSettings] Could not create userSettings document:', createSettingsError)
        }
      } else {
        console.warn('[UserSettings] Could not update userSettings document:', error)
      }
    }
    
    // Verify the update
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('[UserSettings] ✅ Verification - GitHub username in users collection:', userData.githubUsername);
    } else {
      console.error('[UserSettings] ❌ User document still does not exist after update!');
    }
    
    // Update assignedToName in all tasks where this user is assigned
    if (data.fullName !== undefined) {
      try {
        const tasksQuery = query(collection(db, 'tasks'), where('assignedTo', '==', userId));
        const tasksSnapshot = await getDocs(tasksQuery);
        
        if (!tasksSnapshot.empty) {
          const batch = writeBatch(db);
          tasksSnapshot.forEach((taskDoc) => {
            batch.update(taskDoc.ref, { assignedToName: data.fullName });
          });
          await batch.commit();
          console.log(`[UserSettings] Updated assignedToName in ${tasksSnapshot.size} tasks`);
          
          // Clear dashboard cache so changes appear immediately
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(`dashboard_cache_${userId}`);
          }
        }
      } catch (error) {
        console.error('[UserSettings] Error updating task assignee names:', error);
        // Don't throw - profile update succeeded, task update is a nice-to-have
      }
    }
  } catch (error) {
    console.error('[UserSettings] Error updating profile:', error)
    throw error
  }
}

export async function updateNotificationSettings(userId: string, data: { autoReminder?: boolean; reminderTime?: string }) {
  try {
    const updates: any = {
      updatedAt: new Date()
    }
    
    if (data.autoReminder !== undefined) updates.autoReminder = data.autoReminder
    if (data.reminderTime !== undefined) updates.reminderTime = data.reminderTime
    
    await updateDoc(doc(db, 'userSettings', userId), updates)
  } catch (error) {
    console.error('Error updating notification settings:', error)
    throw error
  }
}

export async function updateTheme(userId: string, theme: 'light' | 'dark') {
  try {
    await updateDoc(doc(db, 'userSettings', userId), {
      theme,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating theme:', error)
    throw error
  }
}
