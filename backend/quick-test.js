const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function quickTest() {
  try {
    console.log('🧪 Quick test starting...');
    
    // Get first user
    const user = await prisma.user.findFirst({
      include: { employeeProfile: true }
    });
    
    if (!user) {
      console.log('❌ No users found');
      return;
    }
    
    console.log('👤 Found user:', user.employeeProfile?.employeeCode, user.email);
    
    // Create a simple notification with recipient
    const notification = await prisma.notification.create({
      data: {
        title: "🧪 Timeline Test Notification",
        message: "This is a test notification for timeline testing",
        type: "ANNOUNCEMENT",
        status: "ACTIVE",
        createdBy: user.id,
        recipients: {
          create: {
            type: "USER",
            userId: user.id
          }
        }
      },
      include: {
        recipients: true
      }
    });
    
    console.log('📬 Created notification:', notification.id);
    console.log('📬 With recipients:', notification.recipients.length);
    
    // Create an approval
    const approval = await prisma.approval.create({
      data: {
        notificationId: notification.id,
        userId: user.id,
        response: "APPROVED",
        comment: "Timeline test approval"
      }
    });
    
    console.log('✅ Created approval:', approval.id);
    
    // Now test timeline query
    console.log('\n🔍 Testing Timeline Query...');
    
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { createdBy: user.id },
          {
            recipients: {
              some: { userId: user.id }
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        type: true
      },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: 5
    });
    
    console.log('📬 Found notifications for user:', notifications.length);
    if (notifications.length > 0) {
      console.log('📬 Sample notification:', {
        id: notifications[0].id,
        title: notifications[0].title,
        createdAt: notifications[0].createdAt
      });
    }
    
    const approvals = await prisma.approval.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        response: true,
        createdAt: true,
        notification: {
          select: { title: true }
        }
      },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: 5
    });
    
    console.log('✅ Found approvals for user:', approvals.length);
    if (approvals.length > 0) {
      console.log('✅ Sample approval:', {
        id: approvals[0].id,
        response: approvals[0].response,
        title: approvals[0].notification.title
      });
    }
    
    console.log('\n🎉 Quick test completed!');
    console.log('🔗 You can now test: curl http://localhost:3001/api/timeline -H "Authorization: Bearer <token>"');
    
  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickTest();
