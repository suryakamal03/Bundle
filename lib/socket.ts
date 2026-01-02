/**
 * Socket.IO Client Singleton
 * 
 * Provides a shared Socket.IO client instance for the entire app
 * Handles connection, reconnection, and error handling
 */

import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

class SocketClient {
  private socket: Socket | null = null
  private connected: boolean = false

  /**
   * Initialize and return the Socket.IO client
   */
  getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      })

      this.socket.on('connect', () => {
        this.connected = true
        console.log('✅ Socket.IO connected:', this.socket?.id)
      })

      this.socket.on('disconnect', (reason) => {
        this.connected = false
        console.log('❌ Socket.IO disconnected:', reason)
      })

      this.socket.on('connect_error', (error) => {
        console.error('🔴 Socket.IO connection error:', error.message)
      })

      this.socket.on('error', (error) => {
        console.error('🔴 Socket.IO error:', error)
      })
    }

    return this.socket
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.connected && this.socket !== null
  }

  /**
   * Disconnect the socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }
}

// Export singleton instance
export const socketClient = new SocketClient()
export const getSocket = () => socketClient.getSocket()
