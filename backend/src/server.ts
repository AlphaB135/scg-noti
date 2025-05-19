/**
 * @fileoverview Main server configuration and setup for the SCG Notification System.
 * Configures Express application with security middleware, rate limiting, API routes,
 * and OpenAPI documentation.
 * 
 * Key features:
 * - Rate limiting for different endpoint types
 * - CORS configuration for development
 * - OpenAPI/Swagger documentation
 * - Error handling middleware
 * - Authentication and authorization
 */

/**
 * Core dependencies for Express server setup and security
 */
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'

// Rate limiter configurations
const rateLimitConfig = {
  windowMs: {
    auth: 15 * 60 * 1000,      // 15 minutes for auth
    standard: 5 * 60 * 1000,   // 5 minutes for regular endpoints
    burst: 1 * 60 * 1000       // 1 minute for burst protection
  },
  max: {
    auth: 10,          // 10 attempts per 15min window
    standard: 100,     // 100 requests per 5min window
    burst: 20         // 20 requests per minute burst limit
  }
}

// Enhanced rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs.auth,
  max: rateLimitConfig.max.auth,
  message: {
    error: 'Too many login attempts',
    detail: 'Please try again later',
    retryAfter: Math.ceil(rateLimitConfig.windowMs.auth / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP and fingerprint if available for better rate limiting
    return (req.body?.fingerprint 
      ? `${req.ip}-${req.body.fingerprint}`
      : req.ip) || req.ip // Ensure we always return a string
  }
})

// Standard API rate limiter
const apiLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs.standard,
  max: rateLimitConfig.max.standard,
  message: {
    error: 'Too many requests',
    detail: 'Please try again later',
    retryAfter: Math.ceil(rateLimitConfig.windowMs.standard / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for GET requests to docs
    return req.path.startsWith('/api/docs')
  }
})

// Burst protection rate limiter
const burstLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs.burst,
  max: rateLimitConfig.max.burst,
  message: {
    error: 'Request rate too high',
    detail: 'Please reduce request frequency',
    retryAfter: Math.ceil(rateLimitConfig.windowMs.burst / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Route imports for different API domains
 */
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

/**
 * Load and parse OpenAPI/Swagger documentation for API reference
 * Documentation is hosted at /api/docs endpoint
 */
const openapiDocument = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'))

/**
 * Initialize Express application
 */
const app = express()

/**
 * Configure CORS for development environment
 * - Allows requests from frontend dev server (port 5173)
 * - Enables credentials for authentication
 * - Disabled in production where nginx handles CORS
 */
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  }))
}

/**
 * Core middleware setup
 * - express.json(): Parse JSON request bodies with 10kb limit
 * - cookieParser: Parse cookies for auth tokens
 */
app.use(express.json({ limit: '5mb' })) // เพิ่มขนาด payload เป็น 5MB
app.use(cookieParser())

/**
 * Serve static files from public directory
 */
app.use('/api/uploads', express.static(path.join(__dirname, '../public/uploads')))

/**
 * Apply rate limiting middleware
 * Three tiers of protection:
 * 1. Auth limiter: Strict limits on login attempts (10 per 15min)
 * 2. API limiter: General API request limits (100 per 5min)
 * 3. Burst limiter: Protection against rapid-fire requests (20 per min)
 */
// Temporarily disabled rate limiting for development
// app.use('/api/auth/login', authLimiter)
// app.use('/api', apiLimiter)
// app.use('/api', burstLimiter)

/**
 * Mount API routes with proper prefixes
 * Routes are organized by domain and follow RESTful conventions:
 * - /api/auth: Authentication & session management
 * - /api/users: User account operations
 * - /api/employees: Employee profile management
 * - /api/teams: Team & collaboration features
 * - /api/security-logs: Audit logging
 * - /api/admin: Administrative functions
 * - /api/notifications: Notification system
 * - /api/dashboard: Analytics & reporting
 * - /api/mobile: Mobile app specific endpoints
 */
app.use('/api/auth', authRouter)
app.use('/api/users', usersRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/security-logs', securityLogRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/mobile', mobileRoutes)
// Mount base routes last to avoid conflicts
app.use('/api', routes)
app.use('/api/notifications/:id/approvals', approvalRoutes)
app.use('/api/teams/:teamId/timeline', timelineRoutes)

// Mount Swagger UI with enhanced configuration
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument, {
  swaggerOptions: {
    persistAuthorization: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SCG Noti API Documentation'
}))

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
