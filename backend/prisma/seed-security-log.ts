// prisma/seed-security-log.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const logs = [
  {
    userId: 'f1c1fc83-ae57-4119-99b8-e1bd12a15bf3',
    action: 'LOGIN_SUCCESS',
    ipAddress: '192.168.1.137',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    createdAt: new Date('2025-04-25T15:10:48.300091Z'),
  },
  {
    userId: 'f1c1fc83-ae57-4119-99b8-e1bd12a15bf3',
    action: 'LOGIN_FAILURE',
    ipAddress: '192.168.1.200',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
    createdAt: new Date('2025-05-01T03:01:55.300138Z'),
  },
];

async function main() {
  console.log('🧹 Clearing existing security logs...');
  await prisma.securityLog.deleteMany();

  console.log('📥 Seeding new logs...');
  for (const log of logs) {
    await prisma.securityLog.create({ data: log });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
