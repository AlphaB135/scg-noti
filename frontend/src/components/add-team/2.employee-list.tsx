"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EmployeeTable from "./employee-table"
import type { Employee } from "@/lib/api/employees/index"

interface EmployeeListProps {
  filteredEmployees: (Employee & { selected?: boolean })[]
  departments: string[]
  activeTab: string
  setActiveTab: (tab: string) => void
  handleSelectAll: () => void
  handleEmployeeSelection: (id: string) => void
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
  isLoading: boolean
  onLoadMore?: () => void // Optional prop for infinite scroll
}

export default function EmployeeList({
  filteredEmployees,
  departments,
  activeTab,
  setActiveTab,
  handleSelectAll,
  handleEmployeeSelection,
  currentPage,
  totalPages,
  setCurrentPage,
  isLoading,
}: EmployeeListProps) {
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

        <TabsContent value="all" className="m-0">
          <EmployeeTable
            employees={filteredEmployees}
            handleSelectAll={handleSelectAll}
            handleEmployeeSelection={handleEmployeeSelection}
            allSelected={
              filteredEmployees.length > 0 &&
              filteredEmployees.every((emp) => emp.selected)
            }
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

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          <div className="inline-flex border rounded overflow-hidden">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm font-medium ${
                    page === currentPage
                      ? "bg-red-600 text-white"
                      : "hover:bg-red-100 text-gray-700"
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-5 w-5 border-2 border-red-700 border-t-transparent rounded-full"></div>
          </div>
        )}
      </Tabs>
    </div>
  )
}
