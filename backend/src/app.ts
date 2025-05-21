import { createServer } from 'http'
import { initWebSocket } from './services/websocket.service'

// ...existing imports...

const server = createServer(app)
initWebSocket(server)

// Change app.listen to server.listen
server.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`)
})