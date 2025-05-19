"use client"

import { useEffect, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import EmployeeTable from "./employee-table"
import type { Employee } from "@/lib/api/employees"

interface EmployeeListProps {
  filteredEmployees: (Employee & { selected?: boolean })[]
  departments: string[]
  activeTab: string
  setActiveTab: (tab: string) => void
  handleSelectAll: () => void
  handleEmployeeSelection: (id: string) => void
  currentPage: number
  totalPages: number
  onLoadMore: () => void
  isLoading: boolean
}

export default function EmployeeList({
  filteredEmployees,
  departments,
  activeTab,
  setActiveTab,
  handleSelectAll,
  handleEmployeeSelection,
  isLoading,
  onLoadMore,
}: EmployeeListProps) {  const scrollRef = useRef<HTMLDivElement>(null)

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const threshold = 100 // ระยะห่างจากด้านล่างที่จะโหลดข้อมูลเพิ่ม

    // เมื่อ scroll ใกล้ถึงด้านล่าง
    if (scrollHeight - scrollTop - clientHeight < threshold && !isLoading) {
      onLoadMore()
    }
  }, [onLoadMore, isLoading])

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll)
      return () => scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return (
    <div className="space-y-4 relative">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
          {departments.map((dept) => (
            <TabsTrigger key={dept} value={dept}>
              {dept}
            </TabsTrigger>
          ))}
        </TabsList>

        <div ref={scrollRef} style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <TabsContent value="all" className="m-0">
            <EmployeeTable
              employees={filteredEmployees}
              handleSelectAll={handleSelectAll}
              handleEmployeeSelection={handleEmployeeSelection}
              allSelected={filteredEmployees.length > 0 && filteredEmployees.every((emp) => emp.selected)}
            />
          </TabsContent>

          {departments.map((dept) => (
            <TabsContent key={dept} value={dept} className="m-0">
              <EmployeeTable
                employees={filteredEmployees.filter((emp) => emp.employeeProfile.position === dept)}
                handleSelectAll={() => {
                  const deptEmployees = filteredEmployees.filter((emp) => emp.employeeProfile.position === dept)
                  const allSelected = deptEmployees.every((emp) => emp.selected)
                  deptEmployees.forEach((emp) => handleEmployeeSelection(emp.id))
                }}
                handleEmployeeSelection={handleEmployeeSelection}
                allSelected={
                  filteredEmployees.filter((emp) => emp.employeeProfile.position === dept).length > 0 &&
                  filteredEmployees.filter((emp) => emp.employeeProfile.position === dept).every((emp) => emp.selected)
                }
                departmentName={dept}
              />
            </TabsContent>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-5 w-5 border-2 border-red-700 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}
