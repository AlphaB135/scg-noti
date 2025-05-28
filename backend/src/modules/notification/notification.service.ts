/**
 * @fileoverview เซอร์วิสสำหรับจัดการการแจ้งเตือนในระบบ SCG Notification
 * รองรับการสร้าง, แสดงรายการ, อัพเดทสถานะ และจัดการการแจ้งเตือนแบบวนซ้ำ
 * 
 * โมเดลที่เกี่ยวข้อง:
 * - Notification (การแจ้งเตือน)
 * - Recipient (ผู้รับการแจ้งเตือน)
 * - User (สำหรับ createdBy)
 * - Team (สำหรับการแจ้งเตือนแบบกลุ่ม)
 */

import { prisma } from '../../prisma'
import type { CreateNotificationInput, ListQueryOpts } from './notification.dto'
import { pushMessageWithRetry } from '../../integrations/line.service'
import { NOTIFICATION_RETRY_COUNT } from '../../config/env'

// Check if LINE notifications are enabled
const ENABLE_LINE = process.env.ENABLE_LINE === 'true'

/**
 * Format notification text for LINE message
 */
function formatNotificationText(notification: {
  type: string
  title: string
  message?: string | null
  link?: string | null
  linkUsername?: string | null
  linkPassword?: string | null
}): string {
  let text = `[${notification.type}] ${notification.title}\n${notification.message || ''}`;
  
  if (notification.link) {
    text += `\n🔗 ${notification.link}`;
  }
  if (notification.linkUsername) {
    text += `\n👤 Username: ${notification.linkUsername}`;
  }
  if (notification.linkPassword) {
    text += `\n🔑 Password: ${notification.linkPassword}`;
  }
  
  return text;
}

/**
 * Get list of recipients from notification recipients config
 */
async function getRecipientIds(recipients: CreateNotificationInput['recipients']): Promise<string[]> {
  const recipientIds: string[] = [];

  for (const recipient of recipients) {
    switch (recipient.type) {
      case 'USER':
        if (recipient.userId) {
          recipientIds.push(recipient.userId);
        }
        break;
      case 'GROUP':
        if (recipient.groupId) {
          const members = await prisma.teamMember.findMany({
            where: { teamId: recipient.groupId },
            select: { employeeId: true }
          });
          recipientIds.push(...members.map(m => m.employeeId));
        }
        break;
      case 'COMPANY':
        if (recipient.companyCode) {
          const employees = await prisma.employeeProfile.findMany({
            where: { companyCode: recipient.companyCode },
            select: { userId: true }
          });
          recipientIds.push(...employees.map(e => e.userId));
        }
        break;
      case 'ALL':
        const allEmployees = await prisma.employeeProfile.findMany({
          select: { userId: true }
        });
        recipientIds.push(...allEmployees.map(e => e.userId));
        break;
    }
  }
  
  return Array.from(new Set(recipientIds)); // Remove duplicates efficiently
}

/**
 * Send LINE notifications to recipients
 */
async function sendLineNotifications(
  recipientIds: string[],
  notificationText: string
): Promise<void> {
  // Check if LINE notifications are enabled
  if (!ENABLE_LINE) {
    // LINE notifications disabled - return silently
    return
  }

  const employees = await prisma.employeeProfile.findMany({
    where: {
      userId: { in: recipientIds },
      lineToken: { not: null }
    },
    select: {
      userId: true,
      lineToken: true
    }
  })

  await Promise.all(
    employees
      .filter((e): e is { userId: string; lineToken: string } => e.lineToken !== null)
      .map(employee =>
        pushMessageWithRetry(
          employee.lineToken,
          notificationText,
          NOTIFICATION_RETRY_COUNT
        ).catch(error =>
          console.error(
            `Failed to send LINE notification to ${employee.userId}:`,
            error
          )
        )
      )
  )
}

/**
 * แสดงรายการการแจ้งเตือนพร้อมการแบ่งหน้าและจำนวนทั้งหมด
 * 
 * @param {ListQueryOpts} opts - ตัวเลือกการแบ่งหน้า
 * @param {number} opts.skip - จำนวนรายการที่ต้องการข้าม
 * @param {number} opts.take - จำนวนรายการที่ต้องการดึง
 * @returns {Promise<{
 *   data: Notification[], // รายการการแจ้งเตือน
 *   meta: { 
 *     total: number,  // จำนวนทั้งหมด
 *     skip: number,   // จำนวนที่ข้าม
 *     take: number    // จำนวนที่ดึง
 *   }
 * }>} ผลลัพธ์การแจ้งเตือนพร้อมข้อมูลการแบ่งหน้า
 * 
 * @prismaModel Notification
 * @orderBy เรียงตามวันที่กำหนด (scheduledAt) จากน้อยไปมาก
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
 * อัพเดทสถานะของการแจ้งเตือน
 * 
 * @param {string} id - รหัสของการแจ้งเตือนที่ต้องการอัพเดท
 * @param {string} status - สถานะใหม่ ('DRAFT'|'PENDING'|'APPROVED'|'REJECTED')
 * @returns {Promise<Notification>} การแจ้งเตือนที่อัพเดทแล้ว
 * 
 * @prismaModel Notification
 * @throws {PrismaClientKnownRequestError} หากไม่พบการแจ้งเตือน
 */
export async function updateStatus(id: string, status: string) {
  return prisma.notification.update({
    where: { id },
    data: { status },
  })
}

/**
 * แสดงรายการการแจ้งเตือนแบบวนซ้ำ (ที่มี repeatIntervalDays > 0)
 * ใช้สำหรับจัดการรอบการแจ้งเตือนและกำหนดการแจ้งเตือนที่ต้องทำซ้ำ
 * 
 * @param {ListQueryOpts} opts - ตัวเลือกการแบ่งหน้า
 * @param {number} opts.skip - จำนวนรายการที่ต้องการข้าม
 * @param {number} opts.take - จำนวนรายการที่ต้องการดึง
 * @returns {Promise<Notification[]>} รายการการแจ้งเตือนแบบวนซ้ำ
 * 
 * @prismaModel Notification
 * @filter repeatIntervalDays > 0
 * @orderBy เรียงตามวันที่กำหนด (scheduledAt) จากน้อยไปมาก
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
 * กำหนดเวลาใหม่สำหรับการแจ้งเตือน
 * 
 * @param {string} id - รหัสของการแจ้งเตือนที่ต้องการกำหนดเวลาใหม่
 * @param {Date} scheduledAt - วันและเวลาที่ต้องการกำหนดใหม่
 * @returns {Promise<Notification>} การแจ้งเตือนที่อัพเดทแล้ว
 * 
 * @prismaModel Notification
 * @throws {PrismaClientKnownRequestError} หากไม่พบการแจ้งเตือน
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
 * Create a new notification and notify recipients via LINE
 */
export async function create(data: CreateNotificationInput & { createdBy: string }) {
  const recipientIds = await getRecipientIds(data.recipients)
  
  const notification = await prisma.notification.create({
    data: {
      title: data.title,
      message: data.message,
      type: data.type,
      category: data.category,
      link: data.link,
      linkUsername: data.linkUsername,
      linkPassword: data.linkPassword,
      urgencyDays: data.urgencyDays,
      repeatIntervalDays: data.repeatIntervalDays,
      scheduledAt: data.scheduledAt,
      dueDate: data.dueDate,
      createdBy: data.createdBy,
      recipients: {
        create: recipientIds.map(userId => ({
          type: 'USER',
          userId
        }))
      }
    }
  })

  // Send LINE notifications for SYSTEM and TODO types
  if (['SYSTEM', 'TODO'].includes(notification.type)) {
    const notificationText = formatNotificationText(notification)
    await sendLineNotifications(recipientIds, notificationText)
  }

  return notification
}

/**
 * Create multiple notifications and notify recipients via LINE
 */
export async function createMany(
  dataArray: (CreateNotificationInput & { createdBy: string })[]
) {
  // Process recipients first
  const notificationsWithRecipients = await Promise.all(
    dataArray.map(async data => ({
      data,
      recipientIds: await getRecipientIds(data.recipients)
    }))
  )

  const notifications = await prisma.$transaction(
    notificationsWithRecipients.map(({ data, recipientIds }) =>
      prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type,
          category: data.category,
          link: data.link,
          linkUsername: data.linkUsername,
          linkPassword: data.linkPassword,
          urgencyDays: data.urgencyDays,
          repeatIntervalDays: data.repeatIntervalDays,
          scheduledAt: data.scheduledAt,
          dueDate: data.dueDate,
          createdBy: data.createdBy,
          recipients: {
            create: recipientIds.map(userId => ({
              type: 'USER',
              userId
            }))
          }
        }
      })
    )
  )

  // Send LINE notifications for SYSTEM and TODO types
  await Promise.all(
    notifications.map(async (notification, index) => {
      if (['SYSTEM', 'TODO'].includes(notification.type)) {
        const notificationText = formatNotificationText(notification)
        await sendLineNotifications(
          notificationsWithRecipients[index].recipientIds,
          notificationText
        )
      }
    })
  )

  return notifications
}

/**
 * Update a notification and re-notify recipients if needed
 */
export async function update(
  id: string,
  data: Partial<CreateNotificationInput>
) {
  let recipientIds: string[] = []
  if (data.recipients) {
    recipientIds = await getRecipientIds(data.recipients)
  }

  const updateData: any = { 
    ...data,
    // Handle nullable fields
    link: data.link === undefined ? undefined : data.link,
    linkUsername: data.linkUsername === undefined ? undefined : data.linkUsername,
    linkPassword: data.linkPassword === undefined ? undefined : data.linkPassword,
  };

  if (data.recipients) {
    updateData.recipients = {
      deleteMany: {},
      create: recipientIds.map(userId => ({
        type: 'USER',
        userId
      }))
    }
  }

  const notification = await prisma.notification.update({
    where: { id },
    data: updateData,
    include: {
      recipients: true
    }
  })

  // Re-send LINE notifications if content was updated for SYSTEM/TODO
  if (
    ['SYSTEM', 'TODO'].includes(notification.type) &&
    (data.title || data.message || data.link || data.linkUsername || data.linkPassword || data.recipients)
  ) {
    const notificationText = formatNotificationText(notification)
    const recipients = recipientIds.length > 0 ? recipientIds : (
      await prisma.recipient
        .findMany({
          where: { notificationId: id },
          select: { userId: true }
        })
    ).map(r => r.userId!).filter(Boolean)

    await sendLineNotifications(recipients, notificationText)
  }

  return notification
}

/**
 * ดึงรายการการแจ้งเตือนที่เกี่ยวข้องกับผู้ใช้ปัจจุบัน
 * รวมการแจ้งเตือนที่ผู้ใช้:
 * - เป็นผู้รับโดยตรง (USER)
 * - เป็นสมาชิกของทีมที่เป็นผู้รับ (GROUP)
 * - อยู่ในบริษัทที่เป็นผู้รับ (COMPANY)
 * - เป็นการแจ้งเตือนถึงทุกคน (ALL)
 * 
 * @param {string} userId - รหัสผู้ใช้ปัจจุบัน
 * @param {string} companyCode - รหัสบริษัทของผู้ใช้
 * @param {string[]} teamIds - รหัสทีมที่ผู้ใช้เป็นสมาชิก
 * @returns {Promise<(Notification & { recipients: Recipient[] })[]>} รายการการแจ้งเตือนที่เกี่ยวข้อง
 * 
 * @prismaModel Notification, Recipient (รวมในผลลัพธ์)
 * @orderBy เรียงตามวันที่กำหนด (scheduledAt) จากน้อยไปมาก
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
