import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'

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
    const settingsDoc = await getDoc(doc(db, 'userSettings', userId))
    
    if (!settingsDoc.exists()) {
      // Get user data from users collection
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }
      
      const userData = userDoc.data()
      
      // Create default settings
      const defaultSettings: UserSettings = {
        userId,
        fullName: userData.name || '',
        email: userData.email || '',
        githubUsername: userData.githubUsername || '',
        autoReminder: true,
        reminderTime: '09:00',
        theme: 'light',
        updatedAt: new Date()
      }
      
      await setDoc(doc(db, 'userSettings', userId), defaultSettings)
      return defaultSettings
    }
    
    return { ...settingsDoc.data(), userId } as UserSettings
  } catch (error) {
    console.error('Error getting user settings:', error)
    throw error
  }
}

export async function updateProfile(userId: string, data: { fullName?: string; githubUsername?: string }) {
  try {
    console.log('[UserSettings] Updating profile for user:', userId);
    console.log('[UserSettings] Update data:', data);
    
    const updates: any = {
      updatedAt: new Date()
    }
    
    if (data.fullName !== undefined) updates.fullName = data.fullName
    if (data.githubUsername !== undefined) updates.githubUsername = data.githubUsername
    
    // Update or create userSettings collection
    try {
      await updateDoc(doc(db, 'userSettings', userId), updates);
      console.log('[UserSettings] Updated userSettings collection');
    } catch (error: any) {
      if (error.code === 'not-found') {
        console.log('[UserSettings] userSettings document not found, creating it');
        await setDoc(doc(db, 'userSettings', userId), updates);
      } else {
        throw error;
      }
    }
    
    // Also update the users collection
    const userUpdates: any = {}
    if (data.fullName !== undefined) userUpdates.name = data.fullName
    if (data.githubUsername !== undefined) userUpdates.githubUsername = data.githubUsername
    
    try {
      await updateDoc(doc(db, 'users', userId), userUpdates);
      console.log('[UserSettings] Updated users collection with:', userUpdates);
    } catch (error: any) {
      if (error.code === 'not-found') {
        console.log('[UserSettings] users document not found, creating it');
        await setDoc(doc(db, 'users', userId), {
          ...userUpdates,
          createdAt: new Date()
        });
      } else {
        throw error;
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
