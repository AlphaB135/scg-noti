import { AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Avatar className="h-14 w-14 border-2 border-red-800/20">
              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback className="bg-red-800/10 text-red-800">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h3 className="font-medium text-lg">{member.name}</h3>
              <p className="text-gray-500 text-sm">{member.position}</p>
            </div>
          </div>

          <div className="md:ml-auto flex flex-wrap gap-2">
            <Badge className={getStatusColor(member.status)} variant="secondary">
              <span className="flex items-center">
                {getStatusIcon(member.status)}
                {getStatusText(member.status)}
              </span>
            </Badge>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">ความคืบหน้างาน</span>
            <span className="text-sm font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-green-50 p-2 rounded-md">
                    <span className="block font-medium text-green-700">{member.completedTasks}</span>
                    <span className="text-green-600">เสร็จสิ้น</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>งานที่เสร็จสิ้นแล้ว</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-blue-50 p-2 rounded-md">
                    <span className="block font-medium text-blue-700">{member.pendingTasks}</span>
                    <span className="text-blue-600">รอดำเนินการ</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>งานที่อยู่ระหว่างดำเนินการ</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-red-50 p-2 rounded-md">
                    <span className="block font-medium text-red-700">{member.lateTasks}</span>
                    <span className="text-red-600">ล่าช้า</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>งานที่เลยกำหนดส่ง</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="mt-4 text-right">
          <span className="text-xs text-gray-500">อัพเดทล่าสุด: {member.lastActive}</span>
        </div>
      </div>
    </div>
  )
}
