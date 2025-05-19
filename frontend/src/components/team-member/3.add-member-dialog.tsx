"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Employee } from "@/components/types/team"
import { ScrollArea } from "@/components/ui/scroll-area"
import { employeeApi } from "@/lib/api/employee"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface AddMemberDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  teamId: string
  onAddMember?: (employeeId: string) => void
}

export default function AddMemberDialog({ isOpen, setIsOpen, onAddMember }: AddMemberDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch available employees when dialog opens
  useEffect(() => {
    async function fetchEmployees() {
      try {
        setIsLoading(true)
        const { data } = await employeeApi.list()
        setEmployees(data)
      } catch (error) {
        console.error("Error fetching employees:", error)
        toast.error("ไม่สามารถโหลดข้อมูลพนักงานได้")
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchEmployees()
    }
  }, [isOpen])

  // Search employees when query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      return
    }

    const searchTimer = setTimeout(async () => {
      try {
        setIsLoading(true)
        const { data } = await employeeApi.search(searchQuery)
        setEmployees(data)
      } catch (error) {
        console.error("Error searching employees:", error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimer)
  }, [searchQuery])

  const handleAddMember = async (employeeId: string) => {
    onAddMember?.(employeeId)
    // Remove employee from the list
    setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>เพิ่มสมาชิกทีม</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <Input
            type="text"
            placeholder="ค้นหาพนักงาน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <p>กำลังโหลด...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50"
                  >
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{employee.name}</p>
                        {employee.nickname && (
                          <Badge variant="secondary" className="text-xs">
                            {employee.nickname}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {employee.employeeCode}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {employee.department} • {employee.position}
                      </p>
                    </div>
                    <Button onClick={() => handleAddMember(employee.id)} size="sm">
                      เพิ่ม
                    </Button>
                  </div>
                ))}
                {employees.length === 0 && (
                  <p className="text-center text-gray-500">ไม่พบพนักงานที่ค้นหา</p>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
