import WebSocket from 'ws'
import { Server } from 'http'
import { IncomingMessage } from 'http'
import { parse } from 'url'

let wss: WebSocket.Server
const HEARTBEAT_INTERVAL = 30000 // 30 seconds
const CLIENT_TIMEOUT = 35000 // 35 seconds

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
  userId?: string;
}

// Initialize WebSocket server
export function initWebSocket(server: Server) {
  wss = new WebSocket.Server({ 
    server,
    verifyClient: (info) => {
      const url = parse(info.req.url || '')
      // Only allow connections to /ws path
      return url.pathname === '/'
    }
  })

  // Setup heartbeat interval
  const heartbeat = setInterval(function ping() {
    wss.clients.forEach((ws) => {
      const client = ws as ExtendedWebSocket
      if (client.isAlive === false) {
        console.log('Client timed out, terminating connection')
        return client.terminate()
      }
      
      client.isAlive = false
      client.ping()
    })
  }, HEARTBEAT_INTERVAL)

  wss.on('close', function close() {
    clearInterval(heartbeat)
  })

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const client = ws as ExtendedWebSocket
    console.log('New client connected')
    client.isAlive = true

    // Set up error handling
    client.on('error', (error) => {
      console.error('WebSocket error:', error)
    })

    // Handle pong messages for keepalive
    client.on('pong', () => {
      client.isAlive = true
    })

    // Handle client messages
    client.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        handleClientMessage(client, message)
      } catch (error) {
        console.error('Error handling client message:', error)
        sendErrorToClient(client, 'Invalid message format')
      }
    })

    client.on('close', () => {
      console.log('Client disconnected')
      client.isAlive = false
    })

    // Send initial connection success message
    sendToClient(client, {
      type: 'CONNECTION_STATUS',
      data: { status: 'connected' }
    })
  })
}

interface NotificationUpdateMessage {
  status: 'PENDING' | 'DONE' | 'IN_PROGRESS' | 'OVERDUE'
  id: string
  message?: string
  reopenHistory?: Array<{date: string; reason: string}>
}

// Broadcast notification update to all connected clients
export function broadcastNotificationUpdate(notification: NotificationUpdateMessage) {
  if (!wss) {
    console.warn('WebSocket server not initialized')
    return
  }

  const message = {
    type: 'NOTIFICATION_UPDATE',
    data: notification
  }

  broadcastToAll(message)
}

// Helper function to broadcast message to all connected clients
function broadcastToAll(message: any) {
  const messageStr = JSON.stringify(message)
  let sentCount = 0

  wss.clients.forEach((ws) => {
    const client = ws as ExtendedWebSocket
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(messageStr)
        sentCount++
      } catch (error) {
        console.error('Error sending message to client:', error)
      }
    }
  })

  console.log(`Broadcasted message to ${sentCount} clients`)
}

// Send message to specific client
function sendToClient(client: ExtendedWebSocket, message: any) {
  if (client.readyState === WebSocket.OPEN) {
    try {
      client.send(JSON.stringify(message))
    } catch (error) {
      console.error('Error sending message to client:', error)
    }
  }
}

// Send error message to client
function sendErrorToClient(client: ExtendedWebSocket, message: string) {
  sendToClient(client, {
    type: 'ERROR',
    data: { message }
  })
}

// Handle incoming client messages
function handleClientMessage(ws: ExtendedWebSocket, message: any) {
  switch (message.type) {
    case 'PING':
      sendToClient(ws, { type: 'PONG' })
      break
    case 'SUBSCRIBE':
      // Handle subscription requests
      break
    default:
      sendErrorToClient(ws, 'Unknown message type')
  }
}

// Get WebSocket server instance
export function getWebSocketServer() {
  return wss
}

// Get connected clients count
export function getConnectedClientsCount() {
  return wss ? wss.clients.size : 0
}
