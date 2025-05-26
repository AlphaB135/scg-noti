"use client"

import { TooltipTrigger } from "@/components/ui/tooltip"

import type React from "react"

import { Users, Plus, Trash2, Settings2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { type Team, type TeamMember, permissionColors, permissionDescriptions } from "@/components/types/team"
import { toast } from "react-toastify"
import { teamsApi } from "@/api/teams"

interface TeamManagementProps {
  teams: Team[]
  currentTeam: Team | null
  setCurrentTeam: (team: Team) => void
  setIsCreateTeamDialogOpen: (isOpen: boolean) => void
  handleOpenRemoveLeaderDialog: (leader: TeamMember) => void
  handleOpenPermissionDialog: (member: TeamMember) => void
  handleRemoveMember: (memberId: string) => void
  handleDeleteTeam: () => void
}

export default function TeamManagement({
  teams,
  currentTeam,
  setCurrentTeam,
  setIsCreateTeamDialogOpen,
  handleOpenRemoveLeaderDialog,
  handleOpenPermissionDialog,
  handleRemoveMember,
  handleDeleteTeam,
}: TeamManagementProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-red-600" />
            จัดการทีม
          </CardTitle>
          <Button
            onClick={() => setIsCreateTeamDialogOpen(true)}
            className="bg-red-700 hover:bg-red-800 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            สร้างทีมใหม่
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {teams.length === 0 ? (
          <EmptyTeamState />
        ) : (
          <TeamContent
            teams={teams}
            currentTeam={currentTeam}
            setCurrentTeam={setCurrentTeam}
            handleOpenRemoveLeaderDialog={handleOpenRemoveLeaderDialog}
            handleOpenPermissionDialog={handleOpenPermissionDialog}
            handleRemoveMember={handleRemoveMember}
            handleDeleteTeam={handleDeleteTeam}
          />
        )}
      </CardContent>
    </Card>
  )
}

function EmptyTeamState() {
  return (
    <div className="text-center py-12 px-4">
      <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <Users className="h-8 w-8 text-red-400" />
      </div>
      <p className="text-gray-600 font-medium mb-1">ยังไม่มีทีม</p>
      <p className="text-gray-500 text-sm">กรุณาสร้างทีมใหม่เพื่อเริ่มต้นใช้งาน</p>
    </div>
  )
}

interface TeamContentProps {
  teams: Team[]
  currentTeam: Team | null
  setCurrentTeam: (team: Team) => void
  handleOpenRemoveLeaderDialog: (leader: TeamMember) => void
  handleOpenPermissionDialog: (member: TeamMember) => void
  handleRemoveMember: (memberId: string) => void
  handleDeleteTeam: () => void
}

function TeamContent({
  teams,
  currentTeam,
  setCurrentTeam,
  handleOpenRemoveLeaderDialog,
  handleOpenPermissionDialog,
  handleRemoveMember,
  handleDeleteTeam,
}: TeamContentProps) {
  return (
    <div className="space-y-4">
      {!currentTeam && <TeamBadges teams={teams} currentTeam={currentTeam} setCurrentTeam={setCurrentTeam} />}

      {currentTeam && (
        <TeamDetails
          currentTeam={currentTeam}
          setCurrentTeam={setCurrentTeam}
          teams={teams}
          handleOpenRemoveLeaderDialog={handleOpenRemoveLeaderDialog}
          handleOpenPermissionDialog={handleOpenPermissionDialog}
          handleRemoveMember={handleRemoveMember}
          handleDeleteTeam={handleDeleteTeam}
        />
      )}
    </div>
  )
}

interface TeamBadgesProps {
  teams: Team[]
  currentTeam: Team | null
  setCurrentTeam: (team: Team) => void
}

function TeamBadges({ teams, currentTeam, setCurrentTeam }: TeamBadgesProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-700 mb-2">เลือกทีม</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {teams.map((team) => {
          const isActive = currentTeam?.id === team.id
          return (
            <button
              key={team.id}
              onClick={() => setCurrentTeam(team)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                isActive
                  ? "border-red-300 bg-red-50 shadow-sm"
                  : "border-gray-200 hover:border-red-200 hover:bg-red-50/50"
              }`}
            >
              <div className={`bg-red-100 text-red-700 p-2 rounded-full ${isActive ? "bg-red-200" : ""}`}>
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1 truncate">
                <p className={`font-medium truncate ${isActive ? "text-red-700" : "text-gray-800"}`}>{team.name}</p>
                <p className="text-xs text-gray-500">{team.members.length} สมาชิก</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface TeamDetailsProps {
  currentTeam: Team
  setCurrentTeam: (team: Team) => void
  teams: Team[]
  handleOpenRemoveLeaderDialog: (leader: TeamMember) => void
  handleOpenPermissionDialog: (member: TeamMember) => void
  handleRemoveMember: (memberId: string) => void
  handleDeleteTeam: () => void
}

function TeamDetails({
  currentTeam,
  setCurrentTeam,
  teams,
  handleOpenRemoveLeaderDialog,
  handleOpenPermissionDialog,
  handleRemoveMember,
  handleDeleteTeam,
}: TeamDetailsProps) {
  const handleTeamNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    try {
      const updatedTeam = await teamsApi.updateTeam(currentTeam.id, {
        name: newName,
      })
      setCurrentTeam(updatedTeam)
    } catch (error) {
      console.error("Error updating team name:", error)
      toast.error("ไม่สามารถแก้ไขชื่อทีมได้")
    }
  }

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-red-700 hover:text-red-800 hover:bg-red-50 mb-4 -ml-2"
        onClick={() => setCurrentTeam(null)}
      >
        ← ย้อนกลับไปเลือกกลุ่ม
      </Button>
      <div className="flex justify-between items-center mb-4 pb-3 border-b">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <div className="bg-red-100 text-red-700 p-1.5 rounded-full">
            <Users className="w-4 h-4" />
          </div>
          ทีม
        </h3>
        <Input
          value={currentTeam.name}
          onChange={(e) => {
            const updatedTeam = {
              ...currentTeam,
              name: e.target.value,
            }
            setCurrentTeam(updatedTeam)
          }}
          onBlur={handleTeamNameChange}
          className="max-w-[200px] text-sm border-red-200 focus-visible:ring-red-400"
          placeholder="ชื่อทีม"
        />
      </div>
      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {/* Team Leaders */}
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <h4 className="text-sm font-medium mb-3 text-gray-700 flex items-center gap-1.5">
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">หัวหน้าทีม</Badge>
          </h4>
          {currentTeam.members.filter((m) => m.isLeader).length === 0 ? (
            <p className="text-sm text-gray-500 italic py-2">ยังไม่มีหัวหน้าทีม</p>
          ) : (
            <div className="space-y-2">
              {currentTeam.members
                .filter((m) => m.isLeader)
                .map((leader) => (
                  <div
                    key={leader.id}
                    className="flex justify-between items-center p-2.5 rounded-md bg-white border border-gray-100 shadow-sm hover:border-red-100"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{leader.name}</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className={`text-xs ${permissionColors[leader.permissionLevel]}`}>
                                {leader.permissionLevel === "admin"
                                  ? "แอดมินทีม"
                                  : leader.permissionLevel === "leader"
                                    ? "หัวหน้าทีม"
                                    : "สมาชิก"}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{permissionDescriptions[leader.permissionLevel]}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-xs text-gray-500">{leader.department}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                        onClick={() => handleOpenPermissionDialog(leader)}
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => handleOpenRemoveLeaderDialog(leader)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Team Members */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-3 text-gray-700 flex items-center gap-1.5">
            <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">สมาชิกทีม</Badge>
          </h4>
          {currentTeam.members.filter((m) => !m.isLeader).length === 0 ? (
            <p className="text-sm text-gray-500 italic py-2">ยังไม่มีสมาชิกทีม</p>
          ) : (
            <div className="space-y-2">
              {currentTeam.members
                .filter((m) => !m.isLeader)
                .map((member) => (
                  <div
                    key={member.id}
                    className="flex justify-between items-center p-2.5 rounded-md bg-white border border-gray-100 shadow-sm hover:border-gray-200"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{member.name}</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className={`text-xs ${permissionColors[member.permissionLevel]}`}>
                                {member.permissionLevel === "admin"
                                  ? "แอดมินทีม"
                                  : member.permissionLevel === "leader"
                                    ? "หัวหน้าทีม"
                                    : "สมาชิก"}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{permissionDescriptions[member.permissionLevel]}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-xs text-gray-500">{member.department}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                        onClick={() => handleOpenPermissionDialog(member)}
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => handleRemoveMember(member.membershipId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Delete Team Button */}
        <div className="mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleDeleteTeam}
            size="sm"
            className="w-full text-red-600 hover:text-white border-red-200 hover:bg-red-600 hover:border-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            ลบทีม
          </Button>
        </div>
      </div>
    </div>
  )
}
