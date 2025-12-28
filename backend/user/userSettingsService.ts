import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

export interface UserSettings {
  fullName: string
  email: string
  githubUsername?: string
  autoReminder: boolean
  reminderTime: string // Format: "HH:MM" (24-hour)
  theme: 'light' | 'dark'
}

export const userSettingsService = {
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const settingsDoc = await getDoc(doc(db, 'userSettings', userId))
      
      if (!settingsDoc.exists()) {
        return null
      }
      
      return settingsDoc.data() as UserSettings
    } catch (error) {
      console.error('Error getting user settings:', error)
      throw error
    }
  },

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    try {
      const settingsRef = doc(db, 'userSettings', userId)
      const settingsDoc = await getDoc(settingsRef)
      
      if (settingsDoc.exists()) {
        await updateDoc(settingsRef, settings)
      } else {
        // Create with defaults if doesn't exist
        await setDoc(settingsRef, {
          autoReminder: true,
          reminderTime: '09:00',
          theme: 'light',
          ...settings
        })
      }
    } catch (error) {
      console.error('Error updating user settings:', error)
      throw error
    }
  },

  async initializeUserSettings(userId: string, email: string, fullName: string): Promise<void> {
    try {
      const settingsRef = doc(db, 'userSettings', userId)
      const settingsDoc = await getDoc(settingsRef)
      
      if (!settingsDoc.exists()) {
        await setDoc(settingsRef, {
          fullName,
          email,
          githubUsername: '',
          autoReminder: true,
          reminderTime: '09:00',
          theme: 'light'
        })
      }
    } catch (error) {
      console.error('Error initializing user settings:', error)
      throw error
    }
  }
}
