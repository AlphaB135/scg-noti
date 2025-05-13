import { prisma } from '../../prisma'
import type { ListQueryOpts, CreateNotificationInput } from './notification.dto'

export async function list(opts: ListQueryOpts) {
  return prisma.notification.findMany({
    skip: opts.skip,
    take: opts.take,
    orderBy: { scheduledAt: 'asc' },
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

// ฟังก์ชันสร้างแจ้งเตือนใหม่
export async function create(input: CreateNotificationInput, userId: string) {
  return prisma.notification.create({
    data: {
      title:              input.title,
      message:            input.message,
      scheduledAt:        new Date(input.scheduledAt),
      type:               input.type,
      category:           input.category,
      link:               input.link,
      urgencyDays:        input.urgencyDays,
      repeatIntervalDays: input.repeatIntervalDays,
      createdBy:          userId,            // ตรงนี้เป็น scalar String ตาม Prisma schema
    },
  })
}