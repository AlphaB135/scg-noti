/******************************************************************
 *  prisma/seed-all.ts
 *  - ล้างข้อมูลตามลำดับ Foreign-Key
 *  - เติม Users  (mock-users.json)
 *  - เติม SecurityLog (mock-security-logs.json)
 *  - เติม Notification + Recipient + Attachment (system + todo)
 *  - เติม Teams และ Team Notifications (mock_team_notifications.json)
 ******************************************************************/
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import fs from 'fs'

const prisma = new PrismaClient()

// ── Mock Data ────────────────────────────────────────────────────
const users        = JSON.parse(fs.readFileSync('./prisma/mock-users.json',           'utf8')).users
const sysData      = JSON.parse(fs.readFileSync('./prisma/system-notifications.json',  'utf8'))
const todoData     = JSON.parse(fs.readFileSync('./prisma/todo-notifications.json',    'utf8'))
const secLogs      = JSON.parse(fs.readFileSync('./prisma/mock-security-logs.json',     'utf8'))
const teamNotiData = JSON.parse(fs.readFileSync('./prisma/mock_team_notifications.json','utf8'))

// ── Clear database ─────────────────────────────────────────────────
async function clearDatabase() {
  console.log('🧹 Clearing tables in FK-safe order…')
  await prisma.$transaction([
    prisma.notificationAttachment.deleteMany(),
    prisma.recipient.deleteMany(),
    prisma.approval.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.teamMember.deleteMany(),
    prisma.team.deleteMany(),
    prisma.session.deleteMany(),
    prisma.securityLog.deleteMany(),
    prisma.adminProfile.deleteMany(),
    prisma.employeeProfile.deleteMany(),
    prisma.user.deleteMany(),
  ])
}

// ── Seed Users ─────────────────────────────────────────────────────
async function seedUsers() {
  console.log('👤 Seeding users…')
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10)
    await prisma.user.create({
      data: {
        id:           u.id,
        email:        u.email,
        passwordHash: hash,
        role:         u.role,
        status:       u.status,
        adminProfile: {
          create: {
            firstName:       u.employeeProfile.firstName,
            lastName:        u.employeeProfile.lastName,
            nickname:        u.employeeProfile.nickname ?? undefined,
            position:        u.employeeProfile.position ?? undefined,
            profileImageUrl: u.employeeProfile.profileImageUrl ?? undefined,
          }
        },
        employeeProfile: {
          create: {
            companyCode:     u.employeeProfile.companyCode,
            employeeCode:    u.employeeProfile.employeeCode,
            firstName:       u.employeeProfile.firstName,
            lastName:        u.employeeProfile.lastName,
            nickname:        u.employeeProfile.nickname ?? undefined,
            position:        u.employeeProfile.position ?? undefined,
            profileImageUrl: u.employeeProfile.profileImageUrl ?? undefined,
            lineToken:       u.employeeProfile.lineToken ?? undefined,
          }
        }
      }
    })
  }
  console.log(`✅ Users seeded (${users.length})`)
}

// ── Seed Security Logs ────────────────────────────────────────────
async function seedSecurityLog() {
  console.log('🔐 Seeding security logs…')
  await prisma.securityLog.createMany({ data: secLogs })
  console.log(`✅ SecurityLog seeded (${secLogs.length})`)
}

// ── Seed Notifications ─────────────────────────────────────────────
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

// ── Seed Teams ────────────────────────────────────────────────────
async function seedTeams() {
  console.log('🌳 Seeding teams…')
  const teamsObj = (teamNotiData as { teams: Record<string, any[]> }).teams
  for (const teamName of Object.keys(teamsObj)) {
    const existing = await prisma.team.findFirst({ where: { name: teamName } })
    if (!existing) {
      await prisma.team.create({ data: { name: teamName } })
      console.log(`✅ Team created: ${teamName}`)
    }
  }
}

// ── Seed Team Notifications ───────────────────────────────────────
async function seedTeamNotifications() {
  console.log('🔗 Seeding team notifications…')
  const teamsObj = (teamNotiData as { teams: Record<string, any[]> }).teams
  for (const [teamName, notifs] of Object.entries(teamsObj)) {
    const team = await prisma.team.findFirst({ where: { name: teamName } })
    if (!team) {
      console.warn(`Team not found: ${teamName}`)
      continue
    }
    for (const n of notifs) {
      // Upsert to avoid duplicates
      await prisma.notification.upsert({
        where: { id: n.id },
        update: {},
        create: {
          id:                 n.id,
          title:              n.title,
          message:            n.message,
          scheduledAt:        n.scheduledAt ? new Date(n.scheduledAt) : undefined,
          type:               n.type,
          category:           n.category,
          link:               n.link,
          urgencyDays:        n.urgencyDays,
          repeatIntervalDays: n.repeatIntervalDays,
          createdBy:          n.createdBy,
          recipients: {
            create: [{ type: 'GROUP', groupId: team.id }]
          }
        }
      })
    }
  }
  console.log('✅ Team notifications seeded')
}

// ── Main Flow ────────────────────────────────────────────────────
async function main() {
  await clearDatabase()
  await seedUsers()
  await seedSecurityLog()
  await seedNotifications()
  await seedTeams()
  await seedTeamNotifications()
  console.log('🎉 ALL SEED TASKS COMPLETED')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
