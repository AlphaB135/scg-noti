import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

/**
 * Simple JWT middleware for testing - bypasses session checks
 */
export const testAuthMiddleware: RequestHandler = async (req, res, next) => {
  console.log('🧪 [testAuth] Testing authentication...');
  
  // Check for token in Authorization header or cookies
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    token = req.cookies?.token;
  }
  
  if (!token) {
    console.warn('🧪 [testAuth] No token provided');
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  
  try {
    // Verify JWT token
    const payload = jwt.verify(token, JWT_SECRET!) as any;
    console.log('🧪 [testAuth] JWT payload:', payload);
    
    // Extract user info from token
    const userId = payload.userId || payload.id;
    const role = payload.role;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
    }
    
    // Attach user to request
    req.user = { id: userId, role: role || 'EMPLOYEE' };
    
    console.log('🧪 [testAuth] User authenticated:', req.user);
    next();
    
  } catch (err) {
    console.error('🧪 [testAuth] Token verification failed:', err);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
