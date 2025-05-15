// 📁 backend/src/server.ts
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRouter from './routes/auth'
import routes from './routes'
import teamRoutes from './routes/team'
import securityLogRoutes from './routes/security-logs'
import employeeRoutes from './routes/employees'
import usersRoutes from './routes/users'
import adminRoutes from './routes/admin'
import notificationRoutes from './routes/notifications'
import approvalRoutes from './routes/approvals'
import dashboardRoutes from './routes/dashboard'
import timelineRoutes from './routes/timeline'
import mobileRoutes from './routes/mobile'

const app = express()

// CORS setup for development
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }))
}

// Middleware
app.use(express.json())
app.use(cookieParser())

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/users', usersRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/security-logs', securityLogRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/mobile', mobileRoutes)
app.use('/api', routes)
app.use('/api/notifications/:id/approvals', approvalRoutes)
app.use('/api/teams/:teamId/timeline', timelineRoutes)

// Error handler must be last
import errorHandler from './middleware/errorHandler'
app.use(errorHandler)

// Export app for testing
export { app }

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => console.log(`API ↯ http://localhost:${PORT}`))
}
