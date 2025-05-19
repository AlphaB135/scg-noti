import { BarChart3, TrendingUp, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Member {
  id: string
  name: string
  position: string
  department: string
  avatar: string
  completedTasks: number
  totalTasks: number
  pendingTasks: number
  lateTasks: number
  status: "normal" | "warning" | "critical"
  lastActive: string
}

interface TeamStatsProps {
  members: Member[]
}

export function TeamStats({ members }: TeamStatsProps) {
  // Calculate team statistics
  const totalMembers = members.length
  const totalTasks = members.reduce((sum, member) => sum + member.totalTasks, 0)
  const completedTasks = members.reduce((sum, member) => sum + member.completedTasks, 0)
  const pendingTasks = members.reduce((sum, member) => sum + member.pendingTasks, 0)
  const lateTasks = members.reduce((sum, member) => sum + member.lateTasks, 0)

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Count members by status
  const membersWithIssues = members.filter((m) => m.status === "warning" || m.status === "critical").length

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-red-800" />
            สถิติทีม
          </CardTitle>
          <CardDescription>ภาพรวมประสิทธิภาพของทีม</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">อัตราความสำเร็จ</span>
                <span className="text-sm font-medium">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-red-800 h-2.5 rounded-full" style={{ width: `${completionRate}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-green-800 text-xl font-bold">{completedTasks}</div>
                <div className="text-green-600 text-sm">งานเสร็จสิ้น</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-yellow-800 text-xl font-bold">{pendingTasks}</div>
                <div className="text-yellow-600 text-sm">งานรอดำเนินการ</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-red-800 text-xl font-bold">{lateTasks}</div>
                <div className="text-red-600 text-sm">งานล่าช้า</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-blue-800 text-xl font-bold">{totalTasks}</div>
                <div className="text-blue-600 text-sm">งานทั้งหมด</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-800" />
            สมาชิกที่ต้องติดตาม
          </CardTitle>
          <CardDescription>สมาชิกที่มีงานล่าช้าหรือต้องการความช่วยเหลือ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{membersWithIssues}</p>
              <p className="text-sm text-gray-500">จาก {totalMembers} คน</p>
            </div>
            <div
              className={`text-sm px-3 py-1 rounded-full ${
                membersWithIssues > totalMembers / 3 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
              }`}
            >
              {membersWithIssues > totalMembers / 3 ? "ต้องการการดูแล" : "สถานะดี"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-red-800" />
            แนวโน้ม
          </CardTitle>
          <CardDescription>การเปลี่ยนแปลงประสิทธิภาพในช่วง 30 วันที่ผ่านมา</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">+12%</p>
              <p className="text-sm text-gray-500">อัตราความสำเร็จของงาน</p>
            </div>
            <div className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-800">เพิ่มขึ้น</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
