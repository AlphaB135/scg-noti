/**
 * @fileoverview Controller for managing notifications in the Sexport async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const data = updateStatusSchema.parse(req.body);
    
    // Update notification via service
    const notification = await updateNotificationStatus(id, data.status);
    
    // Invalidate caches
    await CacheService.invalidateNotificationCaches();
    
    res.json({
      id: notification.id,
      status: notification.status,
      updatedAt: notification.updatedAt
    });
  } catch (err) {
    next(err);
  }
}stem.
 * Handles creation, updates, listing, and scheduling of notifications with proper
 * caching and database interactions.
 */

import { Request, Response, NextFunction } from 'express'
import { prisma } from '../../prisma'
import { BadRequestError } from '../../lib/errors'
import { CacheService } from '../../services/cache.service'
import type { Notification } from '@prisma/client'
import { createNotificationSchema, updateNotificationSchema, updateStatusSchema } from './notification.dto'
import { create, update, updateStatus as updateNotificationStatus } from './notification.service'

/**
 * Creates a new notification with recipients and approval workflow.
 * 
 * @param {Request} req - Express request object containing notification data in body
 *                       and authenticated user in req.user
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Resolves when notification is created
 * @throws {BadRequestError} If required fields are missing
 * @throws {Error} If database operations fail
 * 
 * @endpoint POST /api/notifications
 * @auth Requires authenticated user
 */
export async function createNotification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const notificationData = createNotificationSchema.parse({
      ...req.body,
      createdBy: req.user!.id
    });

    // Use the service to create the notification
    const notification = await create({
      ...notificationData,
      createdBy: req.user!.id
    });

    // Invalidate caches to ensure fresh data
    await CacheService.invalidateNotificationCaches()

    res.status(201).json(notification)
  } catch (err) {
    next(err)
  }
}

/**
 * Updates the status of an existing notification.
 * 
 * @param {Request} req - Express request object containing status in body
 *                       and notification ID in params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Resolves when notification is updated
 * @throws {Error} If notification not found or update fails
 * 
 * @endpoint PATCH /api/notifications/:id
 * @auth Requires authenticated user
 */
export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const validatedData = updateStatusSchema.parse(req.body);
    
    const notification = await updateNotificationStatus(id, validatedData.status);
    
    await CacheService.invalidateNotificationCaches();
    
    res.json(notification);
  } catch (err) {
    next(err);
  }
}

/**
 * Updates a notification with new data including linkUsername and linkPassword.
 * 
 * @param {Request} req - Express request object containing notification data in body
 *                       and notification ID in params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Resolves when notification is updated
 * @throws {Error} If notification not found or update fails
 * 
 * @endpoint PUT /api/notifications/:id
 * @auth Requires authenticated user
 */
export async function updateNotification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    
    // Validate update data
    const updateData = updateNotificationSchema.parse(req.body);

    // Call service to handle update
    const notification = await update(id, updateData);

    // Invalidate caches
    await CacheService.invalidateNotificationCaches();

    res.json(notification);
  } catch (err) {
    next(err);
  }
}

/**
 * Lists notifications with pagination, filtering, and full relational data.
 * 
 * @param {Request} req - Express request object containing query parameters:
 *                       - page: Current page number (default: 1)
 *                       - limit: Items per page (default: 20)
 *                       - status: Optional status filter
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Resolves with paginated notifications
 * @throws {BadRequestError} If pagination parameters are invalid
 * 
 * @endpoint GET /api/notifications
 * @auth Requires authenticated user
 */
export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {    // Parse and validate parameters
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const status = req.query.status as Notification['status'] | undefined
    const month = parseInt(req.query.month as string)
    const year = parseInt(req.query.year as string)

    if (page < 1) throw new BadRequestError('Page must be >= 1')
    if (limit < 1) throw new BadRequestError('Limit must be >= 1')

    // Build dynamic where clause for filtering
    let where: any = {
      ...(status && { status })
    }

    // Add company-based filtering if not SUPERADMIN
    if (req.user?.role !== 'SUPERADMIN' && req.companyCode) {
      where.OR = [
        { recipients: { some: { type: 'ALL' } } },
        { recipients: { some: { type: 'COMPANY', companyCode: req.companyCode } } },
        {
          recipients: { 
            some: { 
              type: 'GROUP',
              groupId: {
                in: (await prisma.team.findMany({
                  where: {
                    members: {
                      some: {
                        user: {
                          employeeProfile: {
                            companyCode: req.companyCode
                          }
                        }
                      }
                    }
                  },
                  select: { id: true }
                })).map(t => t.id)
              }
            }
          }
        }
      ]
    }

    // Add date range filter if month and year are provided
    if (!isNaN(month) && !isNaN(year)) {
      const startOfMonth = new Date(year, month - 1, 1)
      const endOfMonth = new Date(year, month, 0, 23, 59, 59)
      
      where.scheduledAt = {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }

    // Fetch notifications and total count in parallel for efficiency
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          recipients: true,
          approvals: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  employeeProfile: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.notification.count({ where })
    ])

    res.json({
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Lists notifications relevant to the current user, including:
 * - Direct notifications (where user is recipient)
 * - Team notifications (where user's team is recipient)
 * - Global notifications (type = 'ALL')
 * 
 * @param {Request} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Resolves with user's notifications
 * @throws {Error} If query fails
 * 
 * @endpoint GET /api/notifications/mine
 * @auth Requires authenticated user
 */
export async function listMyNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id
    const companyCode = req.companyCode

    if (!companyCode) {
      throw new BadRequestError('Company code is required')
    }

    // Get user's team IDs
    const teamIds = (await prisma.teamMember.findMany({
      where: { employeeId: userId },
      select: { teamId: true }
    })).map(tm => tm.teamId)

    // Complex query to fetch notifications based on multiple recipient types
    const notifications = await prisma.notification.findMany({
      where: {
        recipients: {
          some: {
            OR: [
              // Direct notifications to user
              { userId },
              // Global notifications (if SUPERADMIN)
              ...(req.user?.role === 'SUPERADMIN' ? [{ type: 'ALL' }] : []),
              // Company notifications for user's company
              { type: 'COMPANY', companyCode },
              // Team notifications for user's teams
              { type: 'GROUP', groupId: { in: teamIds } }
            ]
          }
        }
      },
      include: {
        recipients: true,
        approvals: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                employeeProfile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(notifications)
  } catch (err) {
    next(err)
  }
}

/**
 * Reschedules a notification by updating its scheduledAt time and resetting status.
 * 
 * @param {Request} req - Express request object containing:
 *                       - id: Notification ID in params
 *                       - scheduledAt: New schedule time in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Resolves when notification is rescheduled
 * @throws {Error} If notification not found or update fails
 * 
 * @endpoint POST /api/notifications/:id/reschedule
 * @auth Requires authenticated user
 */
export async function reschedule(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params
    const { scheduledAt } = req.body

    const notification = await prisma.notification.update({
      where: { id },
      data: { 
        scheduledAt: new Date(scheduledAt),
        // Reset status to pending since we're rescheduling
        status: 'PENDING'
      },
      include: {
        recipients: true,
        approvals: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                employeeProfile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Invalidate caches since we modified a notification
    await CacheService.invalidateNotificationCaches()

    res.json(notification)
  } catch (err) {
    next(err)
  }
}
