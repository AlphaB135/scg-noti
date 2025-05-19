"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, UserPlus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Employee } from "@/types/team"

interface AddMemberDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  teamId: string
  teamName: string
}

export default function AddMemberDialog({ isOpen, setIsOpen, teamId, teamName }: AddMemberDialogProps) {
  const [employees, setEmployees] = useState<(Employee & { selected: boolean; role: "หัวหน้างาน" | "พนักงาน" })[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<
    (Employee & { selected: boolean; role: "หัวหน้างาน" | "พนักงาน" })[]
  >([])
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch available employees (mock data for demo)
  useEffect(() => {
    if (isOpen) {
      // In a real application, you would fetch this data from an API
      // and filter out employees who are already in the team
      const mockEmployees: (Employee & { selected: boolean; role: "หัวหน้างาน" | "พนักงาน" })[] = Array.from(
        { length: 20 },
        (_, i) => ({
          id: `emp-${i + 20}`, // Different IDs from existing team members
          name: `พนักงาน ${i + 20}`,
          department: `แผนก ${Math.floor(i / 5) + 1}`,
          position: i % 5 === 0 ? "ผู้จัดการ" : "พนักงาน",
          email: `employee${i + 20}@selfsync.com`,
          selected: false,
          role: "พนักงาน", // Default role
        }),
      )

      setEmployees(mockEmployees)
      setFilteredEmployees(mockEmployees)
    } else {
      // Reset state when dialog closes
      setSearchQuery("")
    }
  }, [isOpen])

  // Filter employees based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEmployees(employees)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query) ||
          emp.position.toLowerCase().includes(query),
      )
      setFilteredEmployees(filtered)
    }
  }, [searchQuery, employees])

  // Handle employee selection
  const handleEmployeeSelection = (id: string) => {
    setEmployees(employees.map((emp) => (emp.id === id ? { ...emp, selected: !emp.selected } : emp)))
    setFilteredEmployees(filteredEmployees.map((emp) => (emp.id === id ? { ...emp, selected: !emp.selected } : emp)))
  }

  // Handle role change
  const handleRoleChange = (id: string, role: "หัวหน้างาน" | "พนักงาน") => {
    setEmployees(employees.map((emp) => (emp.id === id ? { ...emp, role } : emp)))
    setFilteredEmployees(filteredEmployees.map((emp) => (emp.id === id ? { ...emp, role } : emp)))
  }

  // Handle select all employees
  const handleSelectAll = () => {
    const allSelected = filteredEmployees.every((emp) => emp.selected)
    const updatedEmployees = employees.map((emp) => {
      if (filteredEmployees.some((filtered) => filtered.id === emp.id)) {
        return { ...emp, selected: !allSelected }
      }
      return emp
    })

    setEmployees(updatedEmployees)
    setFilteredEmployees(filteredEmployees.map((emp) => ({ ...emp, selected: !allSelected })))
  }

  // Handle add members
  const handleAddMembers = () => {
    // In a real app, this would send a request to add the selected employees to the team
    const selectedEmployees = employees.filter((emp) => emp.selected)
    console.log("Adding employees to team:", selectedEmployees)

    // Close dialog
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>เพิ่มสมาชิกใหม่เข้าทีม {teamName}</DialogTitle>
        </DialogHeader>
        <div className="pt-6 pb-4">
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="ค้นหาพนักงาน..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <div className="flex items-center p-3 border-b bg-gray-50">
              <div className="flex items-center">
                <Checkbox
                  id="select-all"
                  checked={filteredEmployees.length > 0 && filteredEmployees.every((emp) => emp.selected)}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="ml-2 text-sm font-medium">
                  เลือกทั้งหมด
                </label>
              </div>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="divide-y">
                {filteredEmployees.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">ไม่พบข้อมูลพนักงาน</div>
                ) : (
                  filteredEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center p-3 hover:bg-gray-50">
                      <Checkbox
                        id={employee.id}
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
                      {employee.selected && (
                        <Select
                          value={employee.role}
                          onValueChange={(value) => handleRoleChange(employee.id, value as "หัวหน้างาน" | "พนักงาน")}
                        >
                          <SelectTrigger className="w-[140px] ml-2">
                            <SelectValue placeholder="เลือกตำแหน่ง" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="หัวหน้างาน">หัวหน้างาน</SelectItem>
                            <SelectItem value="พนักงาน">พนักงาน</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleAddMembers}
            className="bg-red-700 hover:bg-red-800 text-white"
            disabled={!employees.some((emp) => emp.selected)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            เพิ่มสมาชิก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
