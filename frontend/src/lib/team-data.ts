export interface Member {
  id: string
  name: string
  position: string
  department: string
  teamId: string
  avatar: string
  completedTasks: number
  totalTasks: number
  pendingTasks: number
  lateTasks: number
  status: "normal" | "warning" | "critical"
  lastActive: string
}

export interface Team {
  id: string
  name: string
}

export let teams: Team[] = [
  {
    id: "team-1",
    name: "ทีมพัฒนาระบบ",
  },
  {
    id: "team-2",
    name: "ทีมออกแบบ UX/UI",
  },
  {
    id: "team-3",
    name: "ทีมทดสอบระบบ",
  },
]

export function renameTeam(teamId: string, newName: string) {
  const team = teams.find((t) => t.id === teamId)
  if (team) {
    team.name = newName
  }
}

export const teamMembers: Member[] = [
  {
    id: "member-1",
    name: "สมชาย ใจดี",
    position: "นักพัฒนาระบบอาวุโส",
    department: "พัฒนาระบบ",
    teamId: "team-1",
    avatar: "/placeholder.svg",
    completedTasks: 24,
    totalTasks: 30,
    pendingTasks: 4,
    lateTasks: 2,
    status: "normal",
    lastActive: "2 ชั่วโมงที่แล้ว",
  },
  {
    id: "member-2",
    name: "สมหญิง รักเรียน",
    position: "นักออกแบบ UX/UI",
    department: "ออกแบบ",
    teamId: "team-1",
    avatar: "/placeholder.svg",
    completedTasks: 18,
    totalTasks: 25,
    pendingTasks: 5,
    lateTasks: 2,
    status: "warning",
    lastActive: "1 วันที่แล้ว",
  },
  {
    id: "member-3",
    name: "มานะ ตั้งใจ",
    position: "นักพัฒนาระบบ",
    department: "พัฒนาระบบ",
    teamId: "team-1",
    avatar: "/placeholder.svg",
    completedTasks: 12,
    totalTasks: 20,
    pendingTasks: 3,
    lateTasks: 5,
    status: "critical",
    lastActive: "3 ชั่วโมงที่แล้ว",
  },
  {
    id: "member-4",
    name: "สุดา เก่งกล้า",
    position: "นักทดสอบระบบ",
    department: "ทดสอบระบบ",
    teamId: "team-1",
    avatar: "/placeholder.svg",
    completedTasks: 30,
    totalTasks: 35,
    pendingTasks: 5,
    lateTasks: 0,
    status: "normal",
    lastActive: "30 นาทีที่แล้ว",
  },
  {
    id: "member-5",
    name: "วิชัย ชำนาญ",
    position: "นักพัฒนาระบบ",
    department: "พัฒนาระบบ",
    teamId: "team-2",
    avatar: "/placeholder.svg",
    completedTasks: 15,
    totalTasks: 22,
    pendingTasks: 6,
    lateTasks: 1,
    status: "warning",
    lastActive: "5 ชั่วโมงที่แล้ว",
  },
  {
    id: "member-6",
    name: "นภา สวยงาม",
    position: "นักออกแบบกราฟิก",
    department: "ออกแบบ",
    teamId: "team-2",
    avatar: "/placeholder.svg",
    completedTasks: 28,
    totalTasks: 30,
    pendingTasks: 2,
    lateTasks: 0,
    status: "normal",
    lastActive: "1 ชั่วโมงที่แล้ว",
  },
  {
    id: "member-7",
    name: "ประสิทธิ์ มีชัย",
    position: "นักทดสอบระบบ",
    department: "ทดสอบระบบ",
    teamId: "team-3",
    avatar: "/placeholder.svg",
    completedTasks: 10,
    totalTasks: 20,
    pendingTasks: 5,
    lateTasks: 5,
    status: "critical",
    lastActive: "2 วันที่แล้ว",
  },
]
