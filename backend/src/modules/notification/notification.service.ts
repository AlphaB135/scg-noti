// 📁 backend/src/modules/notification/notification.service.ts
import { prisma } from '../../prisma'
import type { ListQueryOpts } from './notification.dto'

export async function list(opts: ListQueryOpts) {
  return prisma.notification.findMany({
    skip: opts.skip,
    take: opts.take,
    orderBy: { scheduledAt: 'asc' },
    // ถ้าต้องกรองตามผู้ใช้งาน: where: { recipientId: opts.userId },
  })
}

export async function updateStatus(id: string, status: string) {
  return prisma.notification.update({
    where: { id },
    data: { status },
  })
}

export async function listCycle(opts: ListQueryOpts) {
  return prisma.notification.findMany({
    where: { frequency: { not: 'no-repeat' } },
    skip: opts.skip,
    take: opts.take,
    orderBy: { scheduledAt: 'asc' },
  })
}



export async function reschedule(
  id: string,
  dueDate: string,
  userId: string,
  reason: string
) {
  return prisma.notification.update({
    where: { id },
    data: {
      scheduledAt: new Date(dueDate),
      rescheduleReason: reason,
      rescheduledBy: { connect: { id: userId } },
      rescheduledAt: new Date(),
    },
  })
}
