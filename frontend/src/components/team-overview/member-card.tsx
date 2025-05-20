import { AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

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
  teamId: string
}

interface MemberCardProps {
  member: Member
}

export function MemberCard({ member }: MemberCardProps) {
  const completionRate = Math.round((member.completedTasks / member.totalTasks) * 100)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return <CheckCircle className="h-4 w-4 mr-1" />
      case "warning":
        return <Clock className="h-4 w-4 mr-1" />
      case "critical":
        return <AlertTriangle className="h-4 w-4 mr-1" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "normal":
        return "ปกติ"
      case "warning":
        return "ควรติดตาม"
      case "critical":
        return "น่าเป็นห่วง"
      default:
        return ""
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 border-2 border-red-800/10">
              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback className="bg-red-800/10 text-red-800">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <h3 className="font-medium">{member.name}</h3>
              <p className="text-gray-500 text-sm">{member.position}</p>
            </div>
          </div>

          <Badge className={getStatusColor(member.status)} variant="secondary">
            <span className="flex items-center text-xs">
              {getStatusIcon(member.status)}
              {getStatusText(member.status)}
            </span>
          </Badge>
        </div>

        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-500">ความคืบหน้า</span>
            <span className="text-xs font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-1.5" />

          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-green-50 p-2 rounded-md">
              <span className="block font-medium text-green-700">{member.completedTasks}</span>
              <span className="text-green-600">เสร็จสิ้น</span>
            </div>

            <div className="bg-blue-50 p-2 rounded-md">
              <span className="block font-medium text-blue-700">{member.pendingTasks}</span>
              <span className="text-blue-600">รอดำเนินการ</span>
            </div>

            <div className="bg-red-50 p-2 rounded-md">
              <span className="block font-medium text-red-700">{member.lateTasks}</span>
              <span className="text-red-600">ล่าช้า</span>
            </div>
          </div>
        </div>

        <div className="mt-3 text-right">
          <span className="text-xs text-gray-400">อัพเดทล่าสุด: {member.lastActive}</span>
        </div>
      </div>
    </div>
  )
}
