"use client"

import { useState, useEffect } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AppLayout from "@/components/layout/app-layout"

// Import components
import TeamManagement from "@/components/add-employee-page/1.team-management"
import EmployeeList from "@/components/add-employee-page/2.employee-list"
import CreateTeamDialog from "@/components/add-employee-page/3.create-team-dialog"
import RemoveLeaderDialog from "@/components/add-employee-page/4.remove-leader-dialog"
import PermissionDialog from "@/components/add-employee-page/5.permission-dialog"

// Import types
import type { Employee, Team, TeamMember, PermissionLevel } from "@/components/types/team"

export default function AddEmployeePage() {
  // State
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [newTeamName, setNewTeamName] = useState("")
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false)
  const [isRemoveLeaderDialogOpen, setIsRemoveLeaderDialogOpen] = useState(false)
  const [selectedLeaderToRemove, setSelectedLeaderToRemove] = useState<TeamMember | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedPermission, setSelectedPermission] = useState<PermissionLevel>("member")
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [selectedMemberForPermission, setSelectedMemberForPermission] = useState<TeamMember | null>(null)

  // Fetch employees data (mock data for demo)
  useEffect(() => {
    // In a real application, you would fetch this data from an API
    const mockEmployees: Employee[] = Array.from({ length: 50 }, (_, i) => ({
      id: `emp-${i + 1}`,
      name: `พนักงาน ${i + 1}`,
      department: `แผนก ${Math.floor(i / 10) + 1}`,
      position: i % 5 === 0 ? "ผู้จัดการ" : "พนักงาน",
      email: `employee${i + 1}@selfsync.com`,
    }))

    setEmployees(mockEmployees)
    setFilteredEmployees(mockEmployees)
  }, [])

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

  // Create new team
  const handleCreateTeam = () => {
    if (newTeamName.trim() === "") return

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: newTeamName,
      members: [],
    }

    setTeams([...teams, newTeam])
    setCurrentTeam(newTeam)
    setNewTeamName("")
    setIsCreateTeamDialogOpen(false)
  }

  // Add selected employees to current team
  const handleAddToTeam = (asLeader: boolean) => {
    if (!currentTeam) return

    const selectedEmployees = filteredEmployees.filter((emp) => emp.selected)
    if (selectedEmployees.length === 0) return

    const newMembers: TeamMember[] = selectedEmployees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      position: emp.position,
      email: emp.email,
      isLeader: asLeader,
      permissionLevel: asLeader ? "leader" : "member",
    }))

    // Update current team with new members
    const updatedTeam = {
      ...currentTeam,
      members: [...currentTeam.members, ...newMembers],
    }

    // Update teams list
    setTeams(teams.map((team) => (team.id === currentTeam.id ? updatedTeam : team)))
    setCurrentTeam(updatedTeam)

    // Clear selection
    setFilteredEmployees((prev) =>
      prev.map((emp) => ({
        ...emp,
        selected: false,
      })),
    )
  }

  // Remove member from team
  const handleRemoveMember = (memberId: string) => {
    if (!currentTeam) return

    const updatedMembers = currentTeam.members.filter((member) => member.id !== memberId)
    const updatedTeam = {
      ...currentTeam,
      members: updatedMembers,
    }

    setTeams(teams.map((team) => (team.id === currentTeam.id ? updatedTeam : team)))
    setCurrentTeam(updatedTeam)
  }

  // Open remove leader dialog
  const handleOpenRemoveLeaderDialog = (leader: TeamMember) => {
    setSelectedLeaderToRemove(leader)
    setIsRemoveLeaderDialogOpen(true)
  }

  // Remove leader (either completely or change to regular member)
  const handleRemoveLeader = (keepAsMember: boolean) => {
    if (!currentTeam || !selectedLeaderToRemove) return

    let updatedMembers: TeamMember[]

    if (keepAsMember) {
      // Change from leader to regular member
      updatedMembers = currentTeam.members.map((member) =>
        member.id === selectedLeaderToRemove.id ? { ...member, isLeader: false, permissionLevel: "member" } : member,
      )
    } else {
      // Remove completely
      updatedMembers = currentTeam.members.filter((member) => member.id !== selectedLeaderToRemove.id)
    }

    const updatedTeam = {
      ...currentTeam,
      members: updatedMembers,
    }

    setTeams(teams.map((team) => (team.id === currentTeam.id ? updatedTeam : team)))
    setCurrentTeam(updatedTeam)
    setIsRemoveLeaderDialogOpen(false)
    setSelectedLeaderToRemove(null)
  }

  // Open permission dialog
  const handleOpenPermissionDialog = (member: TeamMember) => {
    setSelectedMemberForPermission(member)
    setSelectedPermission(member.permissionLevel)
    setIsPermissionDialogOpen(true)
  }

  // Update member permission
  const handleUpdatePermission = () => {
    if (!currentTeam || !selectedMemberForPermission) return

    const updatedMembers = currentTeam.members.map((member) =>
      member.id === selectedMemberForPermission.id
        ? {
            ...member,
            permissionLevel: selectedPermission,
            // If changing to leader, update isLeader flag
            isLeader: selectedPermission === "leader" || selectedPermission === "admin" ? true : member.isLeader,
          }
        : member,
    )

    const updatedTeam = {
      ...currentTeam,
      members: updatedMembers,
    }

    setTeams(teams.map((team) => (team.id === currentTeam.id ? updatedTeam : team)))
    setCurrentTeam(updatedTeam)
    setIsPermissionDialogOpen(false)
    setSelectedMemberForPermission(null)
  }

  // Filter employees by department
  const departments = [...new Set(employees.map((emp) => emp.department))].sort()

  return (
    <AppLayout title="เพิ่มพนักงานใหม่" description="จัดการทีมและกำหนดสิทธิ์การใช้งาน">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Management Section */}
        <div className="lg:col-span-1">
          <TeamManagement
            teams={teams}
            currentTeam={currentTeam}
            setCurrentTeam={setCurrentTeam}
            setIsCreateTeamDialogOpen={setIsCreateTeamDialogOpen}
            handleOpenRemoveLeaderDialog={handleOpenRemoveLeaderDialog}
            handleOpenPermissionDialog={handleOpenPermissionDialog}
            handleRemoveMember={handleRemoveMember}
          />
        </div>

        {/* Employee Selection Section */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold">รายชื่อพนักงาน</CardTitle>
                {currentTeam && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select
                      value={selectedPermission}
                      onValueChange={(value: PermissionLevel) => setSelectedPermission(value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="เลือกสิทธิ์การใช้งาน" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">แอดมินทีม</SelectItem>
                        <SelectItem value="leader">หัวหน้าทีม</SelectItem>
                        <SelectItem value="member">สมาชิก</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToTeam(true)}
                        className="bg-red-700 hover:bg-red-800 text-white"
                        size="sm"
                        disabled={!filteredEmployees.some((emp) => emp.selected)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        เพิ่มเป็นหัวหน้าทีม
                      </Button>
                      <Button
                        onClick={() => handleAddToTeam(false)}
                        className="bg-red-700 hover:bg-red-800 text-white"
                        size="sm"
                        disabled={!filteredEmployees.some((emp) => emp.selected)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        เพิ่มเป็นสมาชิกทีม
                      </Button>
                    </div>
                  </div>
                )}
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
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <CreateTeamDialog
        isOpen={isCreateTeamDialogOpen}
        setIsOpen={setIsCreateTeamDialogOpen}
        newTeamName={newTeamName}
        setNewTeamName={setNewTeamName}
        handleCreateTeam={handleCreateTeam}
      />

      <RemoveLeaderDialog
        isOpen={isRemoveLeaderDialogOpen}
        setIsOpen={setIsRemoveLeaderDialogOpen}
        selectedLeader={selectedLeaderToRemove}
        handleRemoveLeader={handleRemoveLeader}
      />

      <PermissionDialog
        isOpen={isPermissionDialogOpen}
        setIsOpen={setIsPermissionDialogOpen}
        selectedMember={selectedMemberForPermission}
        selectedPermission={selectedPermission}
        setSelectedPermission={setSelectedPermission}
        handleUpdatePermission={handleUpdatePermission}
      />
    </AppLayout>
  )
}
