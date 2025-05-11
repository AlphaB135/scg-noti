/******************************************************************
 *  prisma/seed-all.ts
 *  - ล้างข้อมูลตามลำดับ Foreign-Key
 *  - เติม Users  (mock-users.json)
 *  - เติม SecurityLog (mock-security-logs.json)
 *  - เติม Notification + Recipient + Attachment
 ******************************************************************/
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import fs from 'fs'

const prisma = new PrismaClient()

// ── mock data ────────────────────────────────────────────────────
const users     = JSON.parse(fs.readFileSync('./prisma/mock-users.json', 'utf8')).users
const sysData   = JSON.parse(fs.readFileSync('./prisma/system-notifications.json','utf8'))
const todoData  = JSON.parse(fs.readFileSync('./prisma/todo-notifications.json','utf8'))
const secLogs   = JSON.parse(fs.readFileSync('./prisma/mock-security-logs.json','utf8'))

async function clearDatabase() {
  console.log('🧹 Clearing tables in FK-safe order…')
  await prisma.$transaction([
    // child tables of Notification
    prisma.notificationAttachment.deleteMany(),
    prisma.recipient.deleteMany(),
    prisma.approval.deleteMany(),

    // Notification (foreign keys: Attachment, Recipient, Approval)
    prisma.notification.deleteMany(),

    // child tables of User
    prisma.session.deleteMany(),
    prisma.securityLog.deleteMany(),
    prisma.adminProfile.deleteMany(),
    prisma.employeeProfile.deleteMany(),

    // User (root)
    prisma.user.deleteMany(),
  ])
}

/* ----------------------------------------------------------------
 * 1) Users  ••••••••••••••••••••••••••••••••••••••••••••••••••••••
 * ----------------------------------------------------------------*/
async function seedUsers() {
  console.log('👤 Seeding users…')
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10)
    await prisma.user.create({
      data: {
        id: u.id,
        email: u.email,
        passwordHash: hash,
        role: u.role,
        status: u.status,
        adminProfile: {
          create: {
            firstName: u.employeeProfile.firstName,
            lastName:  u.employeeProfile.lastName,
            nickname:  u.employeeProfile.nickname,
            position:  u.employeeProfile.position,
            profileImageUrl: u.employeeProfile.profileImageUrl,
          },
        },
        employeeProfile: {
          create: {
            companyCode:  u.employeeProfile.companyCode,
            employeeCode: u.employeeProfile.employeeCode,
            firstName:    u.employeeProfile.firstName,
            lastName:     u.employeeProfile.lastName,
            nickname:     u.employeeProfile.nickname,
            position:     u.employeeProfile.position,
            profileImageUrl: u.employeeProfile.profileImageUrl,
            lineToken:    u.employeeProfile.lineToken ?? null,
          },
        },
      },
    })
  }
  console.log(`✅ Users seeded (${users.length})`)
}

/* ----------------------------------------------------------------
 * 2) SecurityLog ••••••••••••••••••••••••••••••••••••••••••••••••
 * ----------------------------------------------------------------*/
async function seedSecurityLog() {
  console.log('🔐 Seeding security logs…')
  await prisma.securityLog.createMany({ data: secLogs })
  console.log(`✅ SecurityLog seeded (${secLogs.length})`)
}

/* ----------------------------------------------------------------
 * 3) Notifications ••••••••••••••••••••••••••••••••••••••••••••••
 * ----------------------------------------------------------------*/
async function seedNotifications() {
  console.log('🌐 Seeding SYSTEM notifications…')
  await prisma.notification.createMany({ data: sysData.Notification })
  await prisma.recipient.createMany({ data: sysData.Recipient })
  await prisma.notificationAttachment.createMany({ data: sysData.NotificationAttachment })

  console.log('📝 Seeding TODO notifications…')
  await prisma.notification.createMany({ data: todoData.Notification })
  await prisma.recipient.createMany({ data: todoData.Recipient })
  await prisma.notificationAttachment.createMany({ data: todoData.NotificationAttachment })

  console.log('✅ Notifications seeded')
}

async function main() {
  await clearDatabase()
  await seedUsers()
  await seedSecurityLog()
  await seedNotifications()
  console.log('🎉 ALL SEED TASKS COMPLETED')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
