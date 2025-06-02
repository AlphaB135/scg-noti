const jwt = require('jsonwebtoken');

// Use the same JWT_SECRET from .env
const JWT_SECRET = 'your-secret-key';

// Get user ID from the database first (we know there are users)
const userPayload = {
  id: '374021e2-a633-4505-8135-0014c7e7a2e8', // From our earlier check-data.js output
  role: 'EMPLOYEE'
};

// Create JWT token
const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' });

console.log('Generated JWT Token:');
console.log(token);
console.log('');
console.log('Test command:');
console.log(`curl -X GET http://localhost:3001/api/timeline -H "Authorization: Bearer ${token}"`);
