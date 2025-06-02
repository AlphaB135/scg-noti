"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Plus, Shield, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import AppLayout from "@/components/layout/app-layout"

// Import components
import EmployeeList from "@/components/add-team/2.employee-list"
import PermissionDialog from "@/components/add-team/5.permission-dialog"

// Import types and API
import type { PermissionLevel, TeamMember } from "@/components/types/team"
import { employeesApi } from "@/lib/api/employees"
import type { User, Employee, EmployeeProfile } from "@/lib/api/employees/index"

// Custom types for this page
interface AdminEmployee {
  id: string;
  email: string;
  status: string;
  role: string;
  employeeProfile: EmployeeProfile;
  selected?: boolean;
  name: string;
  department: string;
  permissionLevel?: PermissionLevel;
}

interface ExtendedEmployee {
  id: string;
  email: string;
  status: string;
  role: string;
  employeeProfile: EmployeeProfile;
  selected?: boolean;
  name: string;
  department: string;
}

export default function AddAdminPage() {
  // State with proper typing
  const [employees, setEmployees] = useState<ExtendedEmployee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<ExtendedEmployee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedPermission, setSelectedPermission] = useState<PermissionLevel>("admin")
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<ExtendedEmployee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [admins, setAdmins] = useState<AdminEmployee[]>([])

  // State for pagination and data loading
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10) // Show 10 items per page

  // Fetch employees with proper typing
  const fetchEmployees = useCallback(
    async (page = 1) => {
      try {
        if (page === 1) {
          setIsLoading(true)
        }

        const response = await employeesApi.list({
          page,
          size: pageSize,
          sortBy: "firstName",
          sortOrder: "asc",
        })

        // Map response data to add selected flag and name
        const employeesWithSelect: ExtendedEmployee[] = response.data.map((emp) => ({
          id: emp.id,
          email: emp.email,
          status: emp.status,
          role: emp.role,
          employeeProfile: emp.employeeProfile,
          selected: false,
          name: `${emp.employeeProfile.firstName} ${emp.employeeProfile.lastName}`,
          department: emp.employeeProfile.position || "ไม่ระบุตำแหน่ง"
        }))

        setEmployees((prev) => 
          page === 1 ? employeesWithSelect : [...prev, ...employeesWithSelect]
        )

        // Update filtered employees with existing data
        setFilteredEmployees((prev) => {
          const newFiltered = 
            page === 1 ? employeesWithSelect : [...prev, ...employeesWithSelect]

          // Apply search filter
          if (searchQuery) {
            return newFiltered.filter((emp) => {
              const query = searchQuery.toLowerCase()
              const name = emp.name.toLowerCase()
              const position = emp.employeeProfile.position?.toLowerCase() || ""
              const code = emp.employeeProfile.employeeCode.toLowerCase()

              return name.includes(query) || position.includes(query) || code.includes(query)
            })
          }

          return newFiltered
        })

        setTotalPages(response.totalPages)
        setCurrentPage(page)
      } catch (error) {
        console.error("Error fetching employees:", error)
        toast.error("ไม่สามารถโหลดข้อมูลพนักงานได้")
      } finally {
        setIsLoading(false)
      }
    },
    [searchQuery, pageSize]
  )

  // Fetch admins (mock data for now)
  const fetchAdmins = useCallback(async () => {
    try {
      // This would be replaced with an actual API call
      // For now, we'll use mock data
      const mockAdmins = [
        {
          id: "1",
          name: "สมชาย ใจดี",
          email: "somchai@example.com",
          department: "ฝ่ายบุคคล",
          permissionLevel: "admin" as PermissionLevel,
          employeeProfile: {
            firstName: "สมชาย",
            lastName: "ใจดี",
            position: "ฝ่ายบุคคล",
            employeeCode: "EMP001",
          },
        },
        {
          id: "2",
          name: "วิชัย มั่นคง",
          email: "wichai@example.com",
          department: "ฝ่ายไอที",
          permissionLevel: "admin" as PermissionLevel,
          employeeProfile: {
            firstName: "วิชัย",
            lastName: "มั่นคง",
            position: "ฝ่ายไอที",
            employeeCode: "EMP002",
          },
        },
      ]

      setAdmins(mockAdmins as AdminEmployee[])
    } catch (error) {
      console.error("Error fetching admins:", error)
      toast.error("ไม่สามารถโหลดข้อมูลแอดมินได้")
    }
  }, [])

  // Handle infinite scroll
  const handleLoadMore = useCallback(() => {
    if (currentPage < totalPages && !isLoading) {
      fetchEmployees(currentPage + 1)
    }
  }, [currentPage, totalPages, isLoading, fetchEmployees])

  // Initial fetch
  useEffect(() => {
    fetchEmployees(1)
    fetchAdmins()
  }, [fetchEmployees, fetchAdmins])

  // Filter employees based on search
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEmployees(employees)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = employees.filter((emp) => {
      const name = `${emp.employeeProfile.firstName} ${emp.employeeProfile.lastName}`.toLowerCase()
      const position = emp.employeeProfile.position?.toLowerCase() || ""
      const code = emp.employeeProfile.employeeCode.toLowerCase()

      return name.includes(query) || position.includes(query) || code.includes(query)
    })

    setFilteredEmployees(filtered)
  }, [searchQuery, employees])

  // Handle employee selection
  const handleEmployeeSelection = (id: string) => {
    setFilteredEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, selected: !emp.selected } : emp)))
  }

  // Handle select all employees
  const handleSelectAll = () => {
    const allSelected = filteredEmployees.every((emp) => emp.selected)
    setFilteredEmployees((prev) =>
      prev.map((emp) => ({
        ...emp,
        selected: !allSelected,
      })),
    )
  }

  // Add selected employees as admins
  const handleAddAsAdmin = async () => {
    const selectedEmployees = filteredEmployees.filter((emp) => emp.selected)
    if (selectedEmployees.length === 0) return

    const loadingToast = toast.loading("กำลังเพิ่มแอดมิน...")

    try {
      // This would be replaced with an actual API call
      // For now, we'll just update the state
      const newAdmins = selectedEmployees.map((emp) => ({
        ...emp,
        permissionLevel: selectedPermission,
      }))

      setAdmins((prev) => [...prev, ...newAdmins])

      // Clear selection
      setFilteredEmployees((prev) => prev.map((emp) => ({ ...emp, selected: false })))

      toast.dismiss(loadingToast)
      toast.success("เพิ่มแอดมินเรียบร้อยแล้ว")
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error("Error adding admins:", error)
      toast.error("ไม่สามารถเพิ่มแอดมินได้")
    }
  }

  // Remove admin
  const handleRemoveAdmin = async (id: string) => {
    const loadingToast = toast.loading("กำลังลบแอดมิน...")

    try {
      // This would be replaced with an actual API call
      // For now, we'll just update the state
      setAdmins((prev) => prev.filter((admin) => admin.id !== id))

      toast.dismiss(loadingToast)
      toast.success("ลบแอดมินเรียบร้อยแล้ว")
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error("Error removing admin:", error)
      toast.error("ไม่สามารถลบแอดมินได้")
    }
  }

  // Open permission dialog
  const handleOpenPermissionDialog = (employee: ExtendedEmployee) => {
    setSelectedEmployee(employee)
    setIsPermissionDialogOpen(true)
  }

  // Update permission
  const handleUpdatePermission = async () => {
    if (!selectedEmployee) return

    const loadingToast = toast.loading("กำลังอัพเดทสิทธิ์...")

    try {
      // This would be replaced with an actual API call
      // For now, we'll just update the state
      setAdmins((prev) => [
        ...prev,
        {
          ...selectedEmployee,
          permissionLevel: selectedPermission,
        },
      ])

      toast.dismiss(loadingToast)
      toast.success("อัพเดทสิทธิ์เรียบร้อยแล้ว")
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error("Error updating permission:", error)
      toast.error("ไม่สามารถอัพเดทสิทธิ์ได้")
    }

    // Close dialog
    setIsPermissionDialogOpen(false)
    setSelectedEmployee(null)
  }

  // Filter employees by department
  const departments = [...new Set(employees.map((emp) => emp.department || "ไม่ระบุแผนก"))].sort()

  // Loading state UI
  if (isLoading && employees.length === 0) {
    return (
      <AppLayout title="เพิ่มแอดมิน" description="เพิ่มแอดมินใหม่จากพนักงานในบริษัท">
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-red-700 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="เพิ่มแอดมิน" description="เพิ่มแอดมินใหม่จากพนักงานในบริษัท">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Management Section */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold">แอดมินในระบบ</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {admins.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>ยังไม่มีแอดมิน กรุณาเพิ่มแอดมินใหม่</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                    <h4 className="text-sm font-medium mb-2 text-gray-700">รายชื่อแอดมิน</h4>
                    <div className="space-y-2">
                      {admins.map((admin) => (
                        <div
                          key={admin.id}
                          className="flex justify-between items-center p-3 rounded-md bg-gray-50 hover:bg-gray-100"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{admin.name}</p>
                              <Badge className="bg-red-700 hover:bg-red-800">
                                {admin.permissionLevel === "admin" ? "แอดมิน" : "ซุปเปอร์แอดมิน"}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">{admin.department}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() => handleRemoveAdmin(admin.id)}
                          >
                            ลบ
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee Selection Section */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold">รายชื่อพนักงาน</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    value={selectedPermission}
                    onValueChange={(value: PermissionLevel) => setSelectedPermission(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="เลือกสิทธิ์การใช้งาน" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-red-600" />
                          แอดมิน
                        </div>
                      </SelectItem>
                      <SelectItem value="superadmin">
                        <div className="flex items-center">
                          <UserCog className="h-4 w-4 mr-2 text-amber-600" />
                          ซุปเปอร์แอดมิน
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddAsAdmin}
                    className="bg-red-700 hover:bg-red-800 text-white"
                    size="sm"
                    disabled={!filteredEmployees.some((emp) => emp.selected)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    เพิ่มเป็นแอดมิน
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="ค้นหาพนักงานหรือแผนก..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EmployeeList
                filteredEmployees={filteredEmployees}
                departments={departments}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleSelectAll={handleSelectAll}
                handleEmployeeSelection={handleEmployeeSelection}
                currentPage={currentPage}
                totalPages={totalPages}
                onLoadMore={handleLoadMore}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Permission Dialog */}
      {selectedEmployee && (
        <PermissionDialog
          isOpen={isPermissionDialogOpen}
          setIsOpen={setIsPermissionDialogOpen}
          selectedMember={{
            id: selectedEmployee.id,
            name: `${selectedEmployee.employeeProfile.firstName} ${selectedEmployee.employeeProfile.lastName}`,
            department: selectedEmployee.employeeProfile.position || "ไม่ระบุตำแหน่ง",
            permissionLevel: selectedPermission,
            isLeader: false,
            membershipId: "",
            position: selectedEmployee.employeeProfile.position || "",
            email: selectedEmployee.email,
            role: "member"
          }}
          selectedPermission={selectedPermission}
          setSelectedPermission={setSelectedPermission}
          handleUpdatePermission={handleUpdatePermission}
        />
      )}
    </AppLayout>
  )
}
