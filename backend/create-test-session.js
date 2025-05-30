const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

async function createTestSession() {
  try {
    console.log('🔧 Creating test session...');
    
    // Get first user
    const user = await prisma.user.findFirst({
      include: { employeeProfile: true }
    });
    
    if (!user) {
      console.log('❌ No users found');
      return;
    }
    
    console.log('👤 Found user:', user.employeeProfile?.employeeCode, user.email);
    
    // Create a session in DB (like the login process does)
    const fingerprint = `127.0.0.1|curl/7.68.0`; // Mock fingerprint for testing
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    const session = await prisma.session.create({
      data: { 
        userId: user.id, 
        fingerprint, 
        expiresAt 
      },
    });
    
    console.log('📝 Created session:', session.id);
    
    // Create JWT token (like the login process does)
    const JWT_SECRET = 'your-secret-key'; // Same as in .env
    const token = jwt.sign(
      { 
        sessionId: session.id,
        userId: user.id,
        role: user.role
      }, 
      JWT_SECRET, 
      { expiresIn: '15m' }
    );
    
    console.log('🔑 Generated JWT Token:');
    console.log(token);
    console.log('');
    console.log('🧪 Test command:');
    console.log(`curl -X GET http://localhost:3001/api/timeline -H "Authorization: Bearer ${token}" -H "User-Agent: curl/7.68.0"`);
    console.log('');
    console.log('🧪 Alternative test with cookie:');
    console.log(`curl -X GET http://localhost:3001/api/timeline -H "Cookie: token=${token}" -H "User-Agent: curl/7.68.0"`);
    
  } catch (error) {
    console.error('❌ Failed to create test session:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSession();
