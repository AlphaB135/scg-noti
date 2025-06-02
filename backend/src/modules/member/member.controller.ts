import { Request, Response, NextFunction } from 'express'
import { prisma } from '../../config/prismaClient'
import { z } from 'zod'

// Validation schema for bulk stats request
const bulkStatsSchema = z.object({
  memberIds: z.array(z.string()).min(1).max(50) // Limit to 50 members max for performance
})

/**
 * POST /api/members/bulk-stats
 * Get task statistics for multiple team members
 * 
 * @description Calculates task completion statistics for multiple members
 * by analyzing notifications and approvals assigned to them
 */
export async function getBulkMemberStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate request body
    const { memberIds } = bulkStatsSchema.parse(req.body)

    console.log(`🔍 Getting bulk stats for ${memberIds.length} members:`, memberIds)

    // Get member statistics by analyzing notifications and approvals
    const memberStats: Record<string, any> = {}

    // Process each member ID
    for (const memberId of memberIds) {
      try {
        // Get notifications assigned to this member
        const assignedNotifications = await prisma.recipient.findMany({
          where: {
            userId: memberId,
            notification: {
              category: 'TASK' // Only count task-type notifications
            }
          },
          include: {
            notification: {
              select: {
                id: true,
                status: true,
                scheduledAt: true,
                createdAt: true
              }
            }
          }
        })

        console.log(`📊 Member ${memberId} has ${assignedNotifications.length} assigned notifications`)

        // Get approvals made by this member (representing task completions)
        const approvals = await prisma.approval.findMany({
          where: {
            userId: memberId,
            notification: {
              category: 'TASK'
            }
          },
          include: {
            notification: {
              select: {
                id: true,
                status: true,
                scheduledAt: true
              }
            }
          }
        })

        console.log(`✅ Member ${memberId} has ${approvals.length} approvals/completions`)

        // Calculate task statistics
        const totalTasks = assignedNotifications.length
        const completedTasks = approvals.filter(a => a.response === 'APPROVED').length
        const pendingTasks = assignedNotifications.filter(r => 
          r.notification.status === 'PENDING' || r.notification.status === 'IN_PROGRESS'
        ).length

        // Calculate late tasks (overdue notifications)
        const now = new Date()
        const lateTasks = assignedNotifications.filter(r => {
          const scheduledAt = r.notification.scheduledAt
          return scheduledAt && new Date(scheduledAt) < now && 
                 (r.notification.status === 'PENDING' || r.notification.status === 'IN_PROGRESS')
        }).length

        // Determine status based on late tasks ratio
        let status: "normal" | "warning" | "critical" = "normal"
        if (totalTasks > 0) {
          const lateRatio = lateTasks / totalTasks
          if (lateRatio > 0.2) status = "critical"
          else if (lateRatio > 0.1 || pendingTasks > 5) status = "warning"
        }

        // Get last activity from recent approvals or notifications
        const lastActivity = await prisma.approval.findFirst({
          where: { userId: memberId },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        })

        const lastActive = lastActivity 
          ? formatLastActive(lastActivity.createdAt)
          : "ไม่มีกิจกรรมล่าสุด"

        memberStats[memberId] = {
          id: memberId,
          completedTasks,
          totalTasks,
          pendingTasks,
          lateTasks,
          status,
          lastActive,
          avatar: "/placeholder.svg"
        }

        console.log(`📈 Stats for member ${memberId}:`, memberStats[memberId])
      } catch (memberError) {
        console.error(`❌ Error calculating stats for member ${memberId}:`, memberError)
        // Provide fallback stats for this member
        memberStats[memberId] = {
          id: memberId,
          completedTasks: 0,
          totalTasks: 0,
          pendingTasks: 0,
          lateTasks: 0,
          status: "normal",
          lastActive: "ไม่มีข้อมูล",
          avatar: "/placeholder.svg"
        }
      }
    }

    console.log(`✨ Bulk stats calculation completed for ${memberIds.length} members`)

    res.json({
      success: true,
      data: memberStats
    })
  } catch (error) {
    console.error('❌ Error in getBulkMemberStats:', error)
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      })
      return
    }

    next(error)
  }
}

/**
 * Helper function to format last active time
 */
function formatLastActive(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInHours < 1) {
    return "เพิ่งใช้งาน"
  } else if (diffInHours < 24) {
    return `${diffInHours} ชั่วโมงที่แล้ว`
  } else if (diffInDays < 7) {
    return `${diffInDays} วันที่แล้ว`
  } else {
    return "มากกว่า 1 สัปดาห์"
  }
}
