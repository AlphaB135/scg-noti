import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { Employee } from "@/lib/api/employees"

interface EmployeeListProps {
  employees: Employee[]
  selectedIds: string[]
  onSelect: (id: string) => void
  onSelectAll: () => void
}

export default function EmployeeList({
  employees,
  selectedIds,
  onSelect,
  onSelectAll,
}: EmployeeListProps) {
  const allSelected = employees.length > 0 && selectedIds.length === employees.length

  return (
    <div className="space-y-4">
      {/* Select All */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="select-all"
          checked={allSelected}
          onCheckedChange={onSelectAll}
        />
        <label
          htmlFor="select-all"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          เลือกทั้งหมด
        </label>
      </div>

      {/* Employee List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedIds.includes(employee.id)}
                  onCheckedChange={() => onSelect(employee.id)}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </p>
                    {employee.nickname && (
                      <span className="text-sm text-gray-500">({employee.nickname})</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{employee.employeeCode}</p>
                  <p className="text-sm text-gray-500">{employee.position} • {employee.department}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
