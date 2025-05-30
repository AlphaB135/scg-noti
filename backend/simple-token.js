// Simple token generator for testing
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key';
const userId = '374021e2-a633-4505-8135-0014c7e7a2e8';

// Create token matching authMiddleware expectations
const token = jwt.sign(
  { 
    sessionId: 'test-session-id', // This won't exist in DB but let's see the error
    userId: userId,
    role: 'EMPLOYEE',
    exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
  }, 
  JWT_SECRET
);

console.log('Token:', token);
console.log('Test:', `curl -X GET http://localhost:3001/api/timeline -H "Authorization: Bearer ${token}"`);
