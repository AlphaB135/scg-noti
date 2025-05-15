"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import type { Employee } from "@/components/types/team"

interface EmployeeListProps {
  filteredEmployees: Employee[]
  departments: string[]
  activeTab: string
  setActiveTab: (tab: string) => void
  handleSelectAll: () => void
  handleEmployeeSelection: (id: string) => void
}

export default function EmployeeList({
  filteredEmployees,
  departments,
  activeTab,
  setActiveTab,
  handleSelectAll,
  handleEmployeeSelection,
}: EmployeeListProps) {
  return (
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
          allSelected={filteredEmployees.length > 0 && filteredEmployees.every((emp) => emp.selected)}
        />
      </TabsContent>

      {departments.map((dept) => (
        <TabsContent key={dept} value={dept} className="m-0">
          <EmployeeTable
            employees={filteredEmployees.filter((emp) => emp.department === dept)}
            handleSelectAll={() => {
              const allSelected = filteredEmployees
                .filter((emp) => emp.department === dept)
                .every((emp) => emp.selected)

              // This is a simplified approach - in a real app, you'd update the state in the parent component
              // setFilteredEmployees((prev) =>
              //   prev.map((emp) => (emp.department === dept ? { ...emp, selected: !allSelected } : emp))
              // );
            }}
            handleEmployeeSelection={handleEmployeeSelection}
            allSelected={
              filteredEmployees.filter((emp) => emp.department === dept).length > 0 &&
              filteredEmployees.filter((emp) => emp.department === dept).every((emp) => emp.selected)
            }
            departmentName={dept}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}

interface EmployeeTableProps {
  employees: Employee[]
  handleSelectAll: () => void
  handleEmployeeSelection: (id: string) => void
  allSelected: boolean
  departmentName?: string
}

function EmployeeTable({
  employees,
  handleSelectAll,
  handleEmployeeSelection,
  allSelected,
  departmentName,
}: EmployeeTableProps) {
  return (
    <div className="rounded-md border">
      <div className="flex items-center p-3 border-b bg-gray-50">
        <div className="flex items-center">
          <Checkbox
            id={departmentName ? `select-all-${departmentName}` : "select-all"}
            checked={allSelected}
            onCheckedChange={handleSelectAll}
          />
          <label
            htmlFor={departmentName ? `select-all-${departmentName}` : "select-all"}
            className="ml-2 text-sm font-medium"
          >
            เลือกทั้งหมด{departmentName ? `ใน ${departmentName}` : ""}
          </label>
        </div>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="divide-y">
          {employees.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {departmentName ? "ไม่พบข้อมูลพนักงานในแผนกนี้" : "ไม่พบข้อมูลพนักงาน"}
            </div>
          ) : (
            employees.map((employee) => (
              <div key={employee.id} className="flex items-center p-3 hover:bg-gray-50">
                <Checkbox
                  id={departmentName ? `${departmentName}-${employee.id}` : employee.id}
                  checked={employee.selected}
                  onCheckedChange={() => handleEmployeeSelection(employee.id)}
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium">{employee.name}</p>
                      <p className="text-xs text-gray-500">{employee.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{employee.position}</p>
                      <p className="text-xs text-gray-400">{employee.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
