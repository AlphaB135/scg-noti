// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import fs from 'fs'

const prisma = new PrismaClient()
const mockData = JSON.parse(fs.readFileSync('./prisma/mock-users.json', 'utf-8')).users

async function main() {
  console.log('🧹 Clearing existing users and related data...')
  await prisma.securityLog.deleteMany({})
  await prisma.adminProfile.deleteMany({})
  await prisma.employeeProfile.deleteMany({})
  await prisma.user.deleteMany({
    where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
  })

  for (const user of mockData) {
    const passwordHash = await bcrypt.hash(user.password, 10)

    const createdUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash,
        role: user.role,
        status: user.status,
        adminProfile: {
          create: {
            firstName: user.employeeProfile.firstName,
            lastName: user.employeeProfile.lastName,
            nickname: user.employeeProfile.nickname,
            position: user.employeeProfile.position,
            profileImageUrl: user.employeeProfile.profileImageUrl,
          },
        },
        employeeProfile: {
          create: {
            companyCode: user.employeeProfile.companyCode,
            employeeCode: user.employeeProfile.employeeCode,
            firstName: user.employeeProfile.firstName,
            lastName: user.employeeProfile.lastName,
            nickname: user.employeeProfile.nickname,
            position: user.employeeProfile.position,
            profileImageUrl: user.employeeProfile.profileImageUrl,
            lineToken: user.employeeProfile.lineToken ?? null,
          },
        },
      },
    })

    console.log(`✅ Seeded: ${createdUser.email} (${createdUser.role})`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
