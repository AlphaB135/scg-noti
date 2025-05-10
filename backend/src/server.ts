// 📁 backend/src/server.ts
import express from 'express'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth'
import routes from './routes'

const app = express()

// ใน development ให้เปิด CORS ระหว่าง localhost:5173 → 3001
if (process.env.NODE_ENV === 'development') {
  // ถ้าใช้ ES modules จริงๆ อาจต้องใช้ dynamic import หรือ require
  const cors = require('cors')
  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    })
  )
}

app.use(express.json())
app.use(cookieParser())

// Mount auth routes ก่อน
app.use('/api/auth', authRouter)

// Mount router หลักอื่นๆ
app.use('/api', routes)

app.listen(3001, () => console.log('API ↯ http://localhost:3001'))
