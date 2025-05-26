import rateLimit from 'express-rate-limit'

/**
 * Rate limiter สำหรับ Employee API endpoints
 * จำกัด 100 requests ต่อ IP ต่อ 15 นาที
 */
export const employeeApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: {
    error: 'Too many requests from this IP',
    detail: 'Please try again after 15 minutes'
  }
})

/**
 * Rate limiter สำหรับ Authentication endpoints
 * จำกัด 10 login attempts ต่อ IP ต่อ 15 นาที
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many login attempts',
    detail: 'Please try again after 15 minutes'
  }
})

/**
 * Rate limiter สำหรับป้องกัน burst requests
 * จำกัด 50 requests ต่อ IP ต่อ 1 นาที
 */
export const burstLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: {
    error: 'Too many requests in a short time',
    detail: 'Please slow down'
  }
})
