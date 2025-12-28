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
    const updates: any = {
      updatedAt: new Date()
    }
    
    if (data.fullName !== undefined) updates.fullName = data.fullName
    if (data.githubUsername !== undefined) updates.githubUsername = data.githubUsername
    
    await updateDoc(doc(db, 'userSettings', userId), updates)
    
    // Also update the users collection
    const userUpdates: any = {}
    if (data.fullName !== undefined) userUpdates.name = data.fullName
    if (data.githubUsername !== undefined) userUpdates.githubUsername = data.githubUsername
    
    await updateDoc(doc(db, 'users', userId), userUpdates)
  } catch (error) {
    console.error('Error updating profile:', error)
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
