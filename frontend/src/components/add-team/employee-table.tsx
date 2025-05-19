import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Employee } from "@/lib/api/employees"

interface EmployeeTableProps {
  employees: (Employee & { selected?: boolean })[]
  handleSelectAll: () => void
  handleEmployeeSelection: (id: string) => void
  allSelected: boolean
  departmentName?: string
}

export default function EmployeeTable({
  employees,
  handleSelectAll,
  handleEmployeeSelection,
  allSelected,
  departmentName,
}: EmployeeTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No employees found {departmentName ? `in ${departmentName}` : ""}
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <Checkbox
                    checked={employee.selected}
                    onCheckedChange={() => handleEmployeeSelection(employee.id)}
                    aria-label={`Select ${employee.employeeProfile.firstName}`}
                  />
                </TableCell>
                <TableCell>
                  {employee.employeeProfile.firstName} {employee.employeeProfile.lastName}
                  {employee.employeeProfile.nickname && (
                    <span className="text-sm text-muted-foreground">
                      {" "}
                      ({employee.employeeProfile.nickname})
                    </span>
                  )}
                </TableCell>
                <TableCell>{employee.employeeProfile.position || "-"}</TableCell>
                <TableCell>{employee.email}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
