import { PrismaClient } from '@prisma/client'
import mockData from './mock_team_notifications.json'

const prisma = new PrismaClient()

type MockNotification = {
  id: string
  title: string
  message: string
  scheduledAt: string
  type: string
  category: string
  link: string
  urgencyDays: number
  repeatIntervalDays: number
  createdBy: string
}

async function main() {
  const { teams, systemNotifications } = mockData as {
    teams: Record<string, MockNotification[]>
    systemNotifications: MockNotification[]
  }

  console.log('🔐 Seeding system notifications...')
  for (const n of systemNotifications) {
    await prisma.notification.create({
      data: {
        id: n.id,
        title: n.title,
        message: n.message,
        scheduledAt: new Date(n.scheduledAt),
        type: n.type,
        category: n.category,
        link: n.link,
        urgencyDays: n.urgencyDays,
        repeatIntervalDays: n.repeatIntervalDays,
        createdBy: n.createdBy,
        recipients: { create: [{ type: 'ALL' }] },
      },
    })
  }

  console.log('🔗 Seeding team notifications...')
  for (const [teamName, notifs] of Object.entries(teams)) {
    const team = await prisma.team.findFirst({ where: { name: teamName } })
    if (!team) {
      console.warn(`Team not found: ${teamName}`)
      continue
    }
    for (const n of notifs) {
      await prisma.notification.create({
        data: {
          id: n.id,
          title: n.title,
          message: n.message,
          scheduledAt: new Date(n.scheduledAt),
          type: n.type,
          category: n.category,
          link: n.link,
          urgencyDays: n.urgencyDays,
          repeatIntervalDays: n.repeatIntervalDays,
          createdBy: n.createdBy,
          recipients: { create: [{ type: 'GROUP', groupId: team.id }] },
        },
      })
    }
  }

  console.log('🎉 Mock team notifications seeded.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
