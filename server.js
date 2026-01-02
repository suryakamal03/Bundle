/**
 * Socket.IO Server for Real-Time Group Chat
 * 
 * Handles WebSocket connections for project-based group chat
 * Features:
 * - Project room management
 * - Real-time message broadcasting
 * - Firebase Firestore message persistence
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { createServer } = require('http')
const { Server } = require('socket.io')
const { initializeApp, cert, getApps } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')

// Initialize Firebase Admin using environment variables
let db
try {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  db = getFirestore()
  console.log('✅ Firebase initialized successfully')
  console.log('📦 Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message)
  process.exit(1)
}

// Create HTTP server
const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Socket.IO Chat Server Running\n')
})

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Track active connections
const activeUsers = new Map() // userId -> { socketId, userName, projects: Set }

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`)

  // User joins with their info
  socket.on('user:join', ({ userId, userName }) => {
    activeUsers.set(userId, {
      socketId: socket.id,
      userName,
      projects: new Set()
    })
    socket.userId = userId
    socket.userName = userName
    console.log(`👤 User joined: ${userName} (${userId})`)
  })

  // Join a project chat room
  socket.on('project:join', async ({ projectId, userId, userName }) => {
    try {
      socket.join(projectId)
      
      // Track user's projects
      if (activeUsers.has(userId)) {
        activeUsers.get(userId).projects.add(projectId)
      }

      console.log(`📂 ${userName} joined project room: ${projectId}`)

      // Broadcast to room that user joined
      socket.to(projectId).emit('user:joined', {
        userName,
        userId,
        timestamp: new Date().toISOString()
      })

      // Send recent messages to the newly joined user
      const messagesRef = db.collection('projects').doc(projectId).collection('messages')
      const snapshot = await messagesRef
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get()

      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse()

      socket.emit('messages:history', messages)

    } catch (error) {
      console.error('Error joining project:', error)
      socket.emit('error', { message: 'Failed to join project chat' })
    }
  })

  // Send a message
  socket.on('message:send', async ({ projectId, message }) => {
    try {
      const { senderId, senderName, text } = message
      
      if (!text || !text.trim()) {
        return socket.emit('error', { message: 'Message text is required' })
      }

      const timestamp = new Date()
      const messageData = {
        projectId,
        senderId,
        senderName,
        text: text.trim(),
        timestamp: timestamp,
        createdAt: FieldValue.serverTimestamp(),
        time24h: timestamp.toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      }

      // Save to Firestore
      const messagesRef = db.collection('projects').doc(projectId).collection('messages')
      const docRef = await messagesRef.add(messageData)

      const savedMessage = {
        id: docRef.id,
        ...messageData,
        timestamp: timestamp.toISOString()
      }

      // Broadcast to all users in the project room (including sender)
      io.to(projectId).emit('message:received', savedMessage)

      console.log(`💬 Message sent in ${projectId} by ${senderName}`)

    } catch (error) {
      console.error('Error sending message:', error)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  // User is typing indicator
  socket.on('typing:start', ({ projectId, userName }) => {
    socket.to(projectId).emit('user:typing', { userName })
  })

  socket.on('typing:stop', ({ projectId, userName }) => {
    socket.to(projectId).emit('user:stopped-typing', { userName })
  })

  // Leave project room
  socket.on('project:leave', ({ projectId, userId, userName }) => {
    socket.leave(projectId)
    
    if (activeUsers.has(userId)) {
      activeUsers.get(userId).projects.delete(projectId)
    }

    socket.to(projectId).emit('user:left', {
      userName,
      userId,
      timestamp: new Date().toISOString()
    })

    console.log(`📂 ${userName} left project room: ${projectId}`)
  })

  // Disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      const userData = activeUsers.get(socket.userId)
      if (userData) {
        // Notify all project rooms the user was in
        userData.projects.forEach(projectId => {
          socket.to(projectId).emit('user:left', {
            userName: socket.userName,
            userId: socket.userId,
            timestamp: new Date().toISOString()
          })
        })
        activeUsers.delete(socket.userId)
      }
      console.log(`👋 User disconnected: ${socket.userName}`)
    }
    console.log(`🔌 Client disconnected: ${socket.id}`)
  })
})

// Start server
const PORT = process.env.SOCKET_PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`
  🚀 Socket.IO Chat Server Running
  📡 Port: ${PORT}
  🌐 CORS: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
  `)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  httpServer.close(() => {
    console.log('HTTP server closed')
  })
})
