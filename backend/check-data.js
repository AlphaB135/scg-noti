const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Checking database data...');
    
    // Check users
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        email: true, 
        employeeProfile: { 
          select: { firstName: true, lastName: true } 
        } 
      },
      take: 5
    });
    console.log('👥 Users found:', users.length);
    if (users.length > 0) {
      console.log('First user:', JSON.stringify(users[0], null, 2));
    }
    
    // Check notifications
    const notificationCount = await prisma.notification.count();
    console.log('📬 Notification count:', notificationCount);
    
    if (notificationCount > 0) {
      const sampleNotifications = await prisma.notification.findMany({
        select: {
          id: true,
          title: true,
          createdBy: true,
          createdAt: true,
          recipients: {
            select: { userId: true }
          }
        },
        take: 3
      });
      console.log('Sample notifications:', JSON.stringify(sampleNotifications, null, 2));
    }
    
    // Check approvals
    const approvalCount = await prisma.approval.count();
    console.log('✅ Approval count:', approvalCount);
    
    if (approvalCount > 0) {
      const sampleApprovals = await prisma.approval.findMany({
        select: {
          id: true,
          userId: true,
          response: true,
          createdAt: true,
          notification: {
            select: { title: true }
          }
        },
        take: 3
      });
      console.log('Sample approvals:', JSON.stringify(sampleApprovals, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
