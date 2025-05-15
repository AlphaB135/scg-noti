import  { prisma }from '../../prisma'
import type { CreateNotificationInput, ListQueryOpts } from './notification.dto'

/**
 * List notifications with pagination and total count
 */
export async function list(opts: ListQueryOpts) {
  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      skip: opts.skip,
      take: opts.take,
      orderBy: { scheduledAt: 'asc' },
    }),
    prisma.notification.count(),
  ])
  return { data, meta: { total, skip: opts.skip, take: opts.take } }
}

/**
 * Update the status of a notification
 */
export async function updateStatus(id: string, status: string) {
  return prisma.notification.update({
    where: { id },
    data: { status },
  })
}

/**
 * List recurring notifications (those with a repeatIntervalDays > 0)
 */
export async function listCycle(opts: ListQueryOpts) {
  return prisma.notification.findMany({
    where: { repeatIntervalDays: { gt: 0 } },
    skip: opts.skip,
    take: opts.take,
    orderBy: { scheduledAt: 'asc' },
  })
}

/**
 * Reschedule a notification by updating its scheduledAt date
 */
export async function reschedule(
  id: string,
  scheduledAt: Date
) {
  return prisma.notification.update({
    where: { id },
    data: { scheduledAt },
  })
}

/**
 * Create a new notification along with its recipients
 */
export async function create(
  input: CreateNotificationInput,
  createdBy: string
) {
  const { recipients, ...data } = input
  return prisma.notification.create({
    data: {
      ...data,
      createdBy,
      recipients: {
        create: recipients.map((r) => ({
          type: r.type,
          userId: r.userId,
          groupId: r.groupId,
          companyCode: r.companyCode,
        })),
      },
    },
    include: { recipients: true },
  })
}

/**
 * List notifications visible to the current user
 */
export async function listMine(
  userId: string,
  companyCode: string,
  teamIds: string[]
) {
  return prisma.notification.findMany({
    where: {
      OR: [
        { recipients: { some: { type: 'ALL' } } },
        { recipients: { some: { type: 'USER', userId } } },
        { recipients: { some: { type: 'GROUP', groupId: { in: teamIds } } } },
        { recipients: { some: { type: 'COMPANY', companyCode } } },
      ],
    },
    orderBy: { scheduledAt: 'asc' },
    include: { recipients: true },
  })
}
