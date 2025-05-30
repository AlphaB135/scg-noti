// backend/src/controllers/timeline.controller.ts

import { Request, Response } from 'express';
import { prisma } from '../config/prismaClient';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

interface TimelineCursor {
  createdAt: string;
  id: string;
}

interface TimelineEvent {
  id: string;
  type: 'notification' | 'approval';
  title: string;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
  message?: string;
  metadata?: Record<string, any>;
}

/**
 * Get timeline events for the authenticated user
 * Combines Notification and Approval events in chronological order
 */
export async function getTimeline(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('🕒 [Timeline] User ID:', userId);

    // Parse query parameters
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const cursorParam = req.query.cursor as string;
    const typesParam = req.query.types as string;

    console.log('🕒 [Timeline] Query params:', { limit, cursorParam, typesParam });

    // Decode cursor if provided
    let cursor: TimelineCursor | undefined;
    if (cursorParam) {
      try {
        cursor = JSON.parse(Buffer.from(cursorParam, 'base64').toString());
      } catch (error) {
        return res.status(400).json({ message: 'Invalid cursor format' });
      }
    }

    // Parse types filter
    const allowedTypes = ['notification', 'approval'];
    const types = typesParam ? 
      typesParam.split(',').filter(t => allowedTypes.includes(t)) : 
      allowedTypes;

    // Build where conditions for cursor-based pagination
    const cursorCondition = cursor ? {
      OR: [
        { createdAt: { lt: new Date(cursor.createdAt) } },
        {
          createdAt: new Date(cursor.createdAt),
          id: { lt: cursor.id }
        }
      ]
    } : {};

    // Fetch notifications where user is recipient or creator
    let notificationPromise: Promise<any[]> = Promise.resolve([]);
    if (types.includes('notification')) {
      notificationPromise = prisma.notification.findMany({
        where: {
          AND: [
            cursorCondition,
            {
              OR: [
                { createdBy: userId },
                {
                  recipients: {
                    some: { userId: userId }
                  }
                }
              ]
            }
          ]
        },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          type: true,
          message: true
        },
        orderBy: [
          { createdAt: 'desc' },
          { id: 'desc' }
        ],
        take: limit + 1 // Take one extra to check if there are more
      });
    }

    // Fetch approvals by user
    let approvalPromise: Promise<any[]> = Promise.resolve([]);
    if (types.includes('approval')) {
      approvalPromise = prisma.approval.findMany({
        where: {
          AND: [
            cursorCondition,
            { userId: userId }
          ]
        },
        select: {
          id: true,
          response: true,
          createdAt: true,
          notification: {
            select: {
              title: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' },
          { id: 'desc' }
        ],
        take: limit + 1
      });
    }

    const [notifications, approvals] = await Promise.all([notificationPromise, approvalPromise]);

    console.log('🕒 [Timeline] Query results:', {
      notificationCount: notifications.length,
      approvalCount: approvals.length
    });

    // Map notifications to timeline events
    const notificationEvents: TimelineEvent[] = notifications.map(notification => {
      // Detect if notification was edited
      const wasEdited = notification.updatedAt && 
                       new Date(notification.updatedAt).getTime() !== new Date(notification.createdAt).getTime();
      
      // Create metadata to help frontend detect edits
      const metadata: Record<string, any> = {
        notificationId: notification.id,
        type: notification.type,
        hasEdit: wasEdited
      };
      
      if (wasEdited) {
        metadata.editedAt = notification.updatedAt;
        metadata.originalCreatedAt = notification.createdAt;
      }

      return {
        id: notification.id,
        type: 'notification' as const,
        title: notification.title,
        status: notification.status,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        message: notification.message,
        metadata
      };
    });

    // Map approvals to timeline events
    const approvalEvents: TimelineEvent[] = approvals.map(approval => ({
      id: approval.id,
      type: 'approval' as const,
      title: `Approval: ${approval.notification.title}`,
      status: approval.response,
      createdAt: approval.createdAt,
      metadata: {
        approvalId: approval.id,
        notificationTitle: approval.notification.title,
        response: approval.response
      }
    }));

    // Merge and sort all events
    const allEvents = [...notificationEvents, ...approvalEvents]
      .sort((a, b) => {
        // Sort by createdAt desc, then by id desc for stable ordering
        const dateCompare = b.createdAt.getTime() - a.createdAt.getTime();
        return dateCompare !== 0 ? dateCompare : b.id.localeCompare(a.id);
      })
      .slice(0, limit + 1); // Limit results

    // Determine if there are more results
    const hasMore = allEvents.length > limit;
    const events = hasMore ? allEvents.slice(0, limit) : allEvents;

    // Calculate next cursor
    let nextCursor: string | null = null;
    if (hasMore && events.length > 0) {
      const lastEvent = events[events.length - 1];
      const cursorData: TimelineCursor = {
        createdAt: lastEvent.createdAt.toISOString(),
        id: lastEvent.id
      };
      nextCursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');
    }

    res.json({
      events,
      nextCursor,
      hasMore
    });

  } catch (error) {
    console.error('Timeline API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
