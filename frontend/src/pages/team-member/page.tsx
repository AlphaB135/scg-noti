"use client"

import { useState, useEffect } from "react"
import { UserPlus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import AppLayout from "@/components/layout/app-layout"
import EmployeeList from "@/components/team-member/employee-list"
import { type Team } from "@/components/types/team" 
import { useAuth } from "@/hooks/use-auth"
import { teamsApi } from "@/lib/api/teams"
import { employeesApi, type Employee } from "@/lib/api/employees"
import { toast } from "sonner"

export default function TeamMember() {
  // State for teams
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // State for employees
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])

  const { user: currentUser } = useAuth()

  // Fetch teams data
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true)
        const { data } = await teamsApi.list()
        
        if (!data) {
          console.error("No data received from teams API")
          toast.error("ไม่สามารถโหลดข้อมูลทีมได้")
          return
        }
        
        console.log("Teams data received:", data)
        setTeams(data)
        
        if (data.length > 0) {
          setCurrentTeam(data[0])
        }
      } catch (error) {
        console.error("Error fetching teams:", error)
        if (error instanceof Error) {
          toast.error(`ไม่สามารถโหลดข้อมูลทีมได้: ${error.message}`)
        } else {
          toast.error("ไม่สามารถโหลดข้อมูลทีมได้")
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (currentUser) {
      fetchTeams()
    }
  }, [currentUser])

  // Fetch employees data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true)
        const response = await employeesApi.list()
        const employeeList = response.data || []
        setEmployees(employeeList)
        setFilteredEmployees(employeeList.map(emp => ({
          ...emp,
          name: `${emp.firstName} ${emp.lastName}`
        })))
      } catch (error) {
        console.error("Error fetching employees:", error)
        toast.error("ไม่สามารถโหลดข้อมูลพนักงานได้")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  // Filter employees based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees.map(emp => ({
        ...emp,
        name: emp.name || `${emp.firstName} ${emp.lastName}`
      })))
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = employees.filter(
      (emp) =>
        emp.firstName.toLowerCase().includes(query) ||
        emp.lastName.toLowerCase().includes(query) ||
        (emp.nickname?.toLowerCase().includes(query) ?? false) ||
        emp.employeeCode.toLowerCase().includes(query) ||
        (emp.position?.toLowerCase().includes(query) ?? false) ||
        (emp.department?.toLowerCase().includes(query) ?? false)
    )
    
    setFilteredEmployees(filtered.map(emp => ({
      ...emp,
      name: emp.name || `${emp.firstName} ${emp.lastName}`
    })))
  }, [searchQuery, employees])

  // Handle employee selection
  const handleSelectEmployee = (id: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id]
    )
  }

  // Handle select all employees
  const handleSelectAllEmployees = () => {
    setSelectedEmployeeIds((prev) =>
      prev.length === filteredEmployees.length ? [] : filteredEmployees.map((emp) => emp.id)
    )
  }

  // Handle add selected employees to team
  const handleAddSelectedToTeam = async (asLeader: boolean) => {
    if (!currentTeam || selectedEmployeeIds.length === 0) return

    try {      
      // Add all members in parallel
      await Promise.all(
        selectedEmployeeIds.map(employeeId =>
          teamsApi.addMember(currentTeam.id, employeeId, asLeader)
        )
      )
      
      // Refresh team data once after all additions
      const updatedTeam = await teamsApi.get(currentTeam.id)
      
      // Update teams list with the latest team data
      setTeams((prevTeams) =>
        prevTeams.map((team) => (team.id === currentTeam.id ? updatedTeam : team))
      )
      setCurrentTeam(updatedTeam)

      // Clear selection
      setSelectedEmployeeIds([])
      toast.success("เพิ่มสมาชิกเรียบร้อยแล้ว")
    } catch (error) {
      console.error("Error adding members:", error)
      toast.error("ไม่สามารถเพิ่มสมาชิกได้")
    }
  }

  // Add loading state UI
  if (isLoading) {
    return (
      <AppLayout title="Team Members" description="จัดการสมาชิกทีม">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Team Members" description="จัดการสมาชิกทีม">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Teams */}
        <div className="space-y-4">
          {/* Team Actions */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">รายชื่อทีม</h2>
            <Button
              onClick={() => setIsCreateTeamDialogOpen(true)}
              className="bg-red-700 hover:bg-red-800 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              สร้างทีมใหม่
            </Button>
          </div>

          {/* Team List */}
          <div className="flex gap-2 flex-wrap">
            {teams.map((team) => (
              <Badge
                key={team.id}
                variant={currentTeam?.id === team.id ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setCurrentTeam(team)}
              >
                {team.name} ({team.members.length})
              </Badge>
            ))}
          </div>

          {/* Current Team Details */}
          {currentTeam && (
            <Card>
              <CardHeader>
                <CardTitle>{currentTeam.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {currentTeam.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.position}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Employees */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>รายชื่อพนักงานทั้งหมด</CardTitle>
                {currentTeam && selectedEmployeeIds.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddSelectedToTeam(true)}
                      className="bg-red-700 hover:bg-red-800 text-white"
                      size="sm"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      เพิ่มเป็นหัวหน้าทีม
                    </Button>
                    <Button
                      onClick={() => handleAddSelectedToTeam(false)}
                      className="bg-red-700 hover:bg-red-800 text-white"
                      size="sm"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      เพิ่มเป็นสมาชิก
                    </Button>
                  </div>
                )}
              </div>
              <div className="relative">
                <Input
                  placeholder="ค้นหาพนักงาน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-3"
                />
              </div>
            </CardHeader>
            <CardContent>
              <EmployeeList
                employees={filteredEmployees}
                selectedIds={selectedEmployeeIds}
                onSelect={handleSelectEmployee}
                onSelectAll={handleSelectAllEmployees}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Team Dialog */}
      <Dialog open={isCreateTeamDialogOpen} onOpenChange={setIsCreateTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>สร้างทีมใหม่</DialogTitle>
            <DialogDescription>กรอกชื่อทีมที่ต้องการสร้าง</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="teamname">ชื่อทีม</Label>
              <Input
                id="teamname"
                placeholder="กรอกชื่อทีม..."
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateTeamDialogOpen(false)
                setNewTeamName("")
              }}
            >
              ยกเลิก
            </Button>
            <Button
              className="bg-red-700 hover:bg-red-800 text-white"
              onClick={async () => {
                if (!newTeamName.trim()) return
                try {
                  const newTeam = await teamsApi.create({ name: newTeamName })
                  setTeams([...teams, newTeam])
                  setCurrentTeam(newTeam)
                  setNewTeamName("")
                  setIsCreateTeamDialogOpen(false)
                  toast.success("สร้างทีมเรียบร้อยแล้ว")
                } catch (error) {
                  console.error("Error creating team:", error)
                  toast.error("ไม่สามารถสร้างทีมได้")
                }
              }}
              disabled={!newTeamName.trim()}
            >
              สร้างทีม
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
