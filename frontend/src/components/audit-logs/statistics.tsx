import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { History, CheckCircle, ArrowRight } from "lucide-react"

interface StatisticsProps {
  auditLogs: any[]
}

export default function Statistics({ auditLogs }: StatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-gray-700">การดำเนินการทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3">
              <History className="text-blue-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{auditLogs.length}</p>
              <p className="text-sm text-gray-500">รายการ</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-gray-700">งานที่เสร็จสิ้น</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mr-3">
              <CheckCircle className="text-green-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {auditLogs.filter((log) => log.actionType === "task_completed").length}
              </p>
              <p className="text-sm text-gray-500">รายการ</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-gray-700">งานที่เลื่อนออกไป</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mr-3">
              <ArrowRight className="text-orange-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {auditLogs.filter((log) => log.actionType === "task_postponed").length}
              </p>
              <p className="text-sm text-gray-500">รายการ</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
