const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🔨 Creating test data...');
    
    // Get first user to use as creator/recipient
    const firstUser = await prisma.user.findFirst({
      select: { id: true, email: true }
    });
    
    if (!firstUser) {
      console.log('❌ No users found! Please run seed:users first');
      return;
    }
    
    console.log('👤 Using user:', firstUser.email);
    
    // Create a test notification
    const notification = await prisma.notification.create({
      data: {
        title: "ทดสอบการแจ้งเตือน Timeline",
        message: "นี่คือการแจ้งเตือนทดสอบสำหรับ Timeline API",
        type: "ANNOUNCEMENT",
        priority: "MEDIUM",
        status: "ACTIVE",
        createdBy: firstUser.id,
        recipients: {
          create: {
            userId: firstUser.id
          }
        }
      },
      include: {
        recipients: true
      }
    });
    
    console.log('📬 Created notification:', notification.id);
    
    // Create a test approval for the notification
    const approval = await prisma.approval.create({
      data: {
        notificationId: notification.id,
        userId: firstUser.id,
        response: "APPROVED",
        comment: "ทดสอบการอนุมัติ"
      }
    });
    
    console.log('✅ Created approval:', approval.id);
    
    console.log('🎉 Test data created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
