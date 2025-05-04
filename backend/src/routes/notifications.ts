// 📁 backend/src/routes/notifications.ts
import { Router, RequestHandler } from 'express'
import { prisma } from '../config/prismaClient'

const router = Router()

// GET /notifications
// ดึงรายการ notification ทั้งหมด (อาจใส่ pagination ต่อได้)
export const listNotifications: RequestHandler = async (_req, res) => {
  try {
    const list = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(list)
    return
  } catch (err) {
    console.error('❌ [NOTIF GET ALL]', err)
    res.status(500).json({ message: 'Internal server error' })
    return
  }
}

// GET /notifications/:id
export const getNotification: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    const notif = await prisma.notification.findUnique({ where: { id } })
    if (!notif) {
      res.status(404).json({ message: 'Notification not found' })
      return
    }
    res.json(notif)
    return
  } catch (err) {
    console.error('❌ [NOTIF GET]', err)
    res.status(500).json({ message: 'Internal server error' })
    return
  }
}

// POST /notifications
export const createNotification: RequestHandler = async (req, res) => {
  try {
    const { title, message, scheduledAt, status } = req.body
    const notif = await prisma.notification.create({
      data: {
        title,
        message,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        status: status ?? 'PENDING',
      },
    })
    res.status(201).json(notif)
    return
  } catch (err) {
    console.error('❌ [NOTIF CREATE]', err)
    res.status(500).json({ message: 'Internal server error' })
    return
  }
}

// PUT /notifications/:id
export const updateNotification: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    const { title, message, scheduledAt, status } = req.body
    const updated = await prisma.notification.update({
      where: { id },
      data: {
        title,
        message,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        status,
      },
    })
    res.json(updated)
    return
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ message: 'Notification not found' })
      return
    }
    console.error('❌ [NOTIF UPDATE]', err)
    res.status(500).json({ message: 'Internal server error' })
    return
  }
}

// DELETE /notifications/:id
export const deleteNotification: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.notification.delete({ where: { id } })
    res.sendStatus(204)
    return
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ message: 'Notification not found' })
      return
    }
    console.error('❌ [NOTIF DELETE]', err)
    res.status(500).json({ message: 'Internal server error' })
    return
  }
}

// สุดท้าย mount router
router.get('/',         listNotifications)
router.get('/:id',      getNotification)
router.post('/',        createNotification)
router.put('/:id',      updateNotification)
router.delete('/:id',   deleteNotification)

export default router
