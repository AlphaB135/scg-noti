export type PermissionLevel = "admin" | "leader" | "member"

export type Employee = {
  id: string
  name: string
  department: string
  position: string
  email: string
  selected?: boolean
}

export type TeamMember = {
  id: string
  name: string
  department: string
  position: string
  email: string
  isLeader: boolean
  permissionLevel: PermissionLevel
  role: "หัวหน้างาน" | "พนักงาน" // Add this line to indicate role
}

export type Team = {
  id: string
  name: string
  members: TeamMember[]
}

// Permission descriptions
export const permissionDescriptions = {
  admin: "จัดการพนักงานและทีมทั้งหมดได้",
  leader: "เพิ่ม/ลบสมาชิกในทีมตัวเองได้",
  member: "แก้ไขข้อมูลทีมได้",
}

// Permission badge colors
export const permissionColors = {
  admin: "bg-red-700 hover:bg-red-800",
  leader: "bg-amber-600 hover:bg-amber-700",
  member: "bg-blue-600 hover:bg-blue-700",
}

// Role badge colors
export const roleColors = {
  หัวหน้างาน: "bg-purple-600 hover:bg-purple-700",
  พนักงาน: "bg-green-600 hover:bg-green-700",
}
