import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { employeesApi, type Employee } from "@/lib/api/employees"
import { toast } from "sonner"

interface AddMemberDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  teamId: string
  onAddMember: (employeeId: string) => Promise<void>
}

export default function AddMemberDialog({
  isOpen,
  setIsOpen,
  onAddMember
}: AddMemberDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch initial employee list
  useEffect(() => {
    async function fetchEmployees() {
      try {
        setIsLoading(true)
        const { data } = await employeesApi.list()
        setEmployees(data.data)
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

  // Handle search
  useEffect(() => {
    async function searchEmployees() {
      if (!searchQuery.trim()) {
        const { data } = await employeesApi.list()
        setEmployees(data.data)
        return
      }

      try {
        setIsLoading(true)
        const { data } = await employeesApi.search(searchQuery)
        setEmployees(data.data)
      } catch (error) {
        console.error("Error searching employees:", error)
        toast.error("ไม่สามารถค้นหาพนักงานได้")
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(() => {
      searchEmployees()
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>เพิ่มสมาชิกทีม</DialogTitle>
        </DialogHeader>

        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="ค้นหาพนักงาน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Employee List */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-center py-4 text-gray-500">กำลังโหลด...</p>
            ) : employees.length === 0 ? (
              <p className="text-center py-4 text-gray-500">ไม่พบข้อมูลพนักงาน</p>
            ) : (
              employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                >
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
                    <p className="text-sm text-gray-500">{employee.department} • {employee.position}</p>
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        await onAddMember(employee.id)
                        toast.success(`เพิ่ม ${employee.firstName} เข้าทีมเรียบร้อยแล้ว`)
                      } catch (error) {
                        console.error("Error adding member:", error)
                        toast.error("ไม่สามารถเพิ่มสมาชิกได้")
                      }
                    }}
                  >
                    เพิ่มในทีม
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
