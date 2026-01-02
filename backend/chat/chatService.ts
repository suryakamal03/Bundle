/**
 * Chat Message Service
 * 
 * Handles Firestore operations for chat messages
 * Provides real-time subscription and message retrieval
 */

import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface ChatMessage {
  id: string
  projectId: string
  senderId: string
  senderName: string
  text: string
  timestamp: string
  time24h: string
  createdAt?: any
}

/**
 * Subscribe to real-time chat messages for a project
 */
export const subscribeToChatMessages = (
  projectId: string,
  onMessages: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void,
  messageLimit: number = 100
) => {
  try {
    const messagesRef = collection(db, 'projects', projectId, 'messages')
    const q = query(
      messagesRef,
      orderBy('timestamp', 'asc'),
      limit(messageLimit)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const messages: ChatMessage[] = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            projectId: data.projectId,
            senderId: data.senderId,
            senderName: data.senderName,
            text: data.text,
            timestamp: data.timestamp instanceof Timestamp 
              ? data.timestamp.toDate().toISOString()
              : data.timestamp,
            time24h: data.time24h || new Date(data.timestamp).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            createdAt: data.createdAt
          }
        })
        
        onMessages(messages)
      },
      (error) => {
        console.error('[ChatService] Subscription error:', error)
        if (onError) onError(error)
      }
    )

    return unsubscribe
  } catch (error) {
    console.error('[ChatService] Subscribe error:', error)
    if (onError) onError(error as Error)
    return () => {}
  }
}

/**
 * Add a message to Firestore (backup - primarily handled by Socket.IO server)
 */
export const addChatMessage = async (
  projectId: string,
  senderId: string,
  senderName: string,
  text: string
): Promise<string> => {
  try {
    const timestamp = new Date()
    const messagesRef = collection(db, 'projects', projectId, 'messages')
    
    const docRef = await addDoc(messagesRef, {
      projectId,
      senderId,
      senderName,
      text: text.trim(),
      timestamp: timestamp.toISOString(),
      time24h: timestamp.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      createdAt: Timestamp.now()
    })

    return docRef.id
  } catch (error) {
    console.error('[ChatService] Add message error:', error)
    throw error
  }
}

export const chatService = {
  subscribeToChatMessages,
  addChatMessage
}
