// backend/prisma/seed-security-log.ts
import { PrismaClient } from '@prisma/client'
import rawLogs from './mock-security-logs.json'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Clearing existing security logs…')
  await prisma.securityLog.deleteMany()

  console.log('📥 Seeding security logs from JSON…')
  const data = rawLogs.map((entry: any) => ({
    id:         entry.id,
    userId:     entry.userId,
    action:     entry.action,
    ipAddress:  entry.ipAddress,
    userAgent:  entry.userAgent,
    createdAt:  new Date(entry.createdAt),
  }))

  await prisma.securityLog.createMany({ data })
  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
