export type SectionName = "notification" | "team" | "admin" | "superadmin" | ""

export interface NavSection {
  id: SectionName
  label: string
  icon: string
  paths: string[]
  items?: Array<{
    path: string
    label: string
  }>
}

export const navConfig: NavSection[] = [
  {
    id: "notification",
    label: "ระบบการแจ้งเตือน",
    icon: "Bell",
    paths: ["/dashboard", "/manage", "/userlogs"],
    items: [
      { path: "/dashboard", label: "เตือนความจำ" },
      { path: "/manage", label: "ตั้งค่าการแจ้งเตือน" },
      { path: "/userlogs", label: "ประวัติการดำเนินการ" }
    ]
  },
  {
    id: "team",
    label: "จัดการทีม",
    icon: "Users",
    paths: ["/audit-logs", "/teammember"],
    items: [
      { path: "/audit-logs", label: "ประวัติการดำเนินการพนักงาน" },
      { path: "/teammember", label: "สมาชิกในทีม" }
    ]
  },
  {
    id: "admin",
    label: "แอดมิน",
    icon: "CheckCircle",
    paths: ["/add-team", "/import-employees"],
    items: [
      { path: "/add-team", label: "สร้างทีม" },
      { path: "/import-employees", label: "นำเข้ารายชื่อพนักงาน" }
    ]
  },
  {
    id: "superadmin",
    label: "ซุปเปอร์แอดมิน",
    icon: "Database",
    paths: ["/superadmin"],
    items: [
      { path: "/superadmin", label: "ประวัติการดำเนินการทั้งหมด" }
    ]
  }
]