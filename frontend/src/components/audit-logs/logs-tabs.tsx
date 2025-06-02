import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { History, FileText, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { JSX } from "react"

interface LogsTabsProps {
  filteredLogs: any[]
  groupedLogs: { [date: string]: any[] }
  formatGroupDate: (date: string) => string
  getActionTypeColor: (actionType: string) => string
  getActionTypeIcon: (actionType: string) => JSX.Element
  getActionTypeText: (actionType: string) => string
  formatDate: (date: string) => string
}

export default function LogsTabs({
  filteredLogs,
  groupedLogs,
  formatGroupDate,
  getActionTypeColor,
  getActionTypeIcon,
  getActionTypeText,
  formatDate,
}: LogsTabsProps) {
  return (
    <Tabs defaultValue="timeline" className="mb-6">
      <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
        <TabsTrigger value="timeline" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          <span>ไทม์ไลน์</span>
        </TabsTrigger>
        <TabsTrigger value="table" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>ตารางข้อมูล</span>
        </TabsTrigger>
      </TabsList>

      {/* ===== TIMELINE VIEW ===== */}
      <TabsContent value="timeline" className="mt-4">
        {Object.keys(groupedLogs).length > 0 ? (
          Object.keys(groupedLogs)
            .sort()
            .reverse()
            .map((date) => (
              <div key={date} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-red-700" />
                  {formatGroupDate(date)}
                </h3>
                <div className="relative border-l-2 border-gray-200 pl-6 ml-3 space-y-6">
                  {groupedLogs[date].map((log) => (
                    <div key={log.id} className="relative">
                      {/* จุดบนไทม์ไลน์ */}
                      <div className="absolute -left-[31px] mt-1.5 h-4 w-4 rounded-full bg-red-700 border-4 border-white shadow-sm"></div>

                      {/* การ์ดแสดงข้อมูล */}
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                            <div className="flex items-center gap-2 mb-2 md:mb-0">
                              <Badge className={getActionTypeColor(log.actionType)} variant="secondary">
                                <span className="flex items-center gap-1">
                                  {getActionTypeIcon(log.actionType)}
                                  {getActionTypeText(log.actionType)}
                                </span>
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(log.actionDate).toLocaleTimeString("th-TH", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-700">ดำเนินการโดย: {log.actionBy}</div>
                          </div>

                          <h4 className="text-base font-semibold text-gray-800 mb-1">{log.taskTitle}</h4>

                          <p className="text-sm text-gray-600">{log.details}</p>

                          {/* แสดงค่าเก่าและค่าใหม่ถ้ามี */}
                          {(log.oldValue || log.newValue) && (log.oldValue?.trim() !== "" || log.newValue?.trim() !== "") && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm border-l-4 border-blue-200">
                              {log.oldValue && log.oldValue.trim() !== "" && (
                                <div className="text-red-600 mb-2">
                                  <span className="font-medium">ค่าเดิม:</span> 
                                  <span className="ml-2 px-2 py-1 bg-red-100 rounded text-red-700">{log.oldValue}</span>
                                </div>
                              )}
                              {log.newValue && log.newValue.trim() !== "" && (
                                <div className="text-green-600">
                                  <span className="font-medium">ค่าใหม่:</span> 
                                  <span className="ml-2 px-2 py-1 bg-green-100 rounded text-green-700">{log.newValue}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-200">
              <History className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">ไม่พบประวัติการดำเนินการ</h3>
            <p className="text-gray-500">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหาและการกรอง</p>
          </div>
        )}
      </TabsContent>

      {/* ===== TABLE VIEW ===== */}
      <TabsContent value="table" className="mt-4">
        <Card>
          <CardContent className="p-0">
            {filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่และเวลา
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ชื่องาน
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        การดำเนินการ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ผู้ดำเนินการ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        รายละเอียด
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(log.actionDate)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.taskTitle}</td>
                        <td className="px-4 py-3">
                          <Badge className={getActionTypeColor(log.actionType)} variant="secondary">
                            <span className="flex items-center gap-1">
                              {getActionTypeIcon(log.actionType)}
                              {getActionTypeText(log.actionType)}
                            </span>
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{log.actionBy}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                  <History className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">ไม่พบประวัติการดำเนินการ</h3>
                <p className="text-gray-500">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหาและการกรอง</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
