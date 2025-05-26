import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

interface UserProfileProps {
  currentUser: {
    id: string
    name: string
    role: string
    avatar: string
    department: string
  }
  auditLogs: any[]
}

export default function UserProfile({ currentUser, auditLogs }: UserProfileProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-red-100">
            <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
            <AvatarFallback className="bg-red-100 text-red-800 text-lg">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-gray-800">{currentUser.name}</h2>
            <p className="text-gray-500">
              {currentUser.role} • {currentUser.department}
            </p>
          </div>
          <div className="flex-1"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">{auditLogs.length}</p>
              <p className="text-sm text-gray-500">การดำเนินการทั้งหมด</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">
                {auditLogs.filter((log) => log.actionType === "task_completed").length}
              </p>
              <p className="text-sm text-gray-500">งานที่เสร็จสิ้น</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg hidden md:block">
              <p className="text-2xl font-bold text-blue-700">
                {auditLogs.filter((log) => log.actionType === "task_created").length}
              </p>
              <p className="text-sm text-gray-500">งานที่สร้าง</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
