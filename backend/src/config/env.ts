// 📁 backend/src/config/env.ts
import dotenv from 'dotenv'
dotenv.config()

// Security settings
export const JWT_SECRET = process.env.JWT_SECRET!
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'

// Rate limiting
export const AUTH_RATE_LIMIT_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX) || 10
export const AUTH_RATE_LIMIT_WINDOW_MS = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000
export const API_RATE_LIMIT_MAX = Number(process.env.API_RATE_LIMIT_MAX) || 100
export const API_RATE_LIMIT_WINDOW_MS = Number(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000
export const BURST_RATE_LIMIT_MAX = Number(process.env.BURST_RATE_LIMIT_MAX) || 50
export const BURST_RATE_LIMIT_WINDOW_MS = Number(process.env.BURST_RATE_LIMIT_WINDOW_MS) || 60 * 1000

// Caching
export const EMPLOYEE_CACHE_TTL = Number(process.env.EMPLOYEE_CACHE_TTL) || 300 // 5 minutes
export const SEARCH_CACHE_TTL = Number(process.env.SEARCH_CACHE_TTL) || 60 // 1 minute

// Redis config
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

// LINE OA Configuration
export const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!
export const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!

// Notification settings
export const NOTIFICATION_RETRY_COUNT = Number(process.env.NOTIFICATION_RETRY_COUNT) || 1
export const NOTIFICATION_RETRY_DELAY = Number(process.env.NOTIFICATION_RETRY_DELAY) || 1000 // 1 second
