// member-stats.ts
import api from '../api'
import { cache, CACHE_KEYS } from '../utils/cache-utils'

// Types for member task statistics
export interface MemberTaskStats {
  id: string
  completedTasks: number
  totalTasks: number
  pendingTasks: number
  lateTasks: number
  status: "normal" | "warning" | "critical"
  lastActive: string
  avatar?: string
}

export interface TeamMemberStats {
  teamId: string
  teamName: string
  members: MemberTaskStats[]
}

// Member Stats API
export const memberStatsApi = {
  // Get task statistics for all members in a team
  getTeamMemberStats: async (teamId: string): Promise<MemberTaskStats[]> => {
    try {
      const response = await api.get<{ data: MemberTaskStats[] }>(`/teams/${teamId}/member-stats`)
      return response.data.data
    } catch (error) {
      console.warn('Member stats API not available, generating mock data:', error)
      // Return mock data if API is not available
      return generateMockMemberStats()
    }
  },

  // Get task statistics for a specific member
  getMemberStats: async (memberId: string): Promise<MemberTaskStats> => {
    try {
      const response = await api.get<{ data: MemberTaskStats }>(`/members/${memberId}/stats`)
      return response.data.data
    } catch (error) {
      console.warn('Member stats API not available, generating mock data:', error)
      // Return mock data if API is not available
      return generateMockMemberStatsForUser(memberId)
    }
  },

  // Bulk get statistics for multiple members
  getBulkMemberStats: async (memberIds: string[]): Promise<Record<string, MemberTaskStats>> => {
    const cacheKey = CACHE_KEYS.BULK_MEMBER_STATS(memberIds);
    
    // Check cache first
    const cached = cache.get<Record<string, MemberTaskStats>>(cacheKey);
    if (cached) {
      console.log('Using cached member stats for:', memberIds.length, 'members');
      return cached;
    }

    try {
      const response = await api.post<{ data: Record<string, MemberTaskStats> }>('/members/bulk-stats', { memberIds })
      const result = response.data.data;
      
      // Cache the result for 2 minutes
      cache.set(cacheKey, result, 2);
      
      return result;
    } catch (error) {
      console.warn('Bulk member stats API not available, generating mock data:', error)
      // Return mock data if API is not available
      const mockStats: Record<string, MemberTaskStats> = {}
      memberIds.forEach(id => {
        mockStats[id] = generateMockMemberStatsForUser(id)
      })
      
      // Cache mock data for 1 minute only
      cache.set(cacheKey, mockStats, 1);
      
      return mockStats;
    }
  }
}

// Mock data generators (for development/fallback)
function generateMockMemberStats(): MemberTaskStats[] {
  return [
    {
      id: "1",
      completedTasks: 8,
      totalTasks: 12,
      pendingTasks: 3,
      lateTasks: 1,
      status: "warning",
      lastActive: "2 ชั่วโมงที่แล้ว",
      avatar: "/placeholder.svg"
    },
    {
      id: "2", 
      completedTasks: 15,
      totalTasks: 18,
      pendingTasks: 2,
      lateTasks: 1,
      status: "normal",
      lastActive: "1 ชั่วโมงที่แล้ว",
      avatar: "/placeholder.svg"
    }
  ]
}

function generateMockMemberStatsForUser(memberId: string): MemberTaskStats {
  // Generate consistent mock data based on member ID
  const seed = memberId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (max: number) => (seed * 9301 + 49297) % max

  const totalTasks = 8 + random(15) // 8-22 tasks
  const completedTasks = Math.floor(totalTasks * (0.4 + random(40) / 100)) // 40-80% completion
  const lateTasks = random(4) // 0-3 late tasks
  const pendingTasks = totalTasks - completedTasks - lateTasks

  // Determine status based on late tasks ratio
  const lateRatio = lateTasks / totalTasks
  let status: "normal" | "warning" | "critical" = "normal"
  if (lateRatio > 0.2) status = "critical"
  else if (lateRatio > 0.1 || pendingTasks > 5) status = "warning"

  const hoursAgo = 1 + random(48) // 1-48 hours ago
  const lastActive = hoursAgo === 1 ? "1 ชั่วโมงที่แล้ว" : `${hoursAgo} ชั่วโมงที่แล้ว`

  return {
    id: memberId,
    completedTasks,
    totalTasks,
    pendingTasks,
    lateTasks,
    status,
    lastActive,
    avatar: "/placeholder.svg"
  }
}
