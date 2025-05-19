"use client"

import { Users, Plus, Trash2, Settings2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">จัดการทีม</CardTitle>
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
    <div className="text-center py-8 text-gray-500">
      <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
      <p>ยังไม่มีทีม กรุณาสร้างทีมใหม่</p>
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
      <TeamBadges teams={teams} currentTeam={currentTeam} setCurrentTeam={setCurrentTeam} />

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
    <div className="flex flex-wrap gap-2">
      {teams.map((team) => (
        <Badge
          key={team.id}
          variant={currentTeam?.id === team.id ? "default" : "outline"}
          className={`cursor-pointer text-sm py-1 px-3 ${
            currentTeam?.id === team.id ? "bg-red-700 hover:bg-red-800" : "hover:bg-red-100 hover:text-red-800"
          }`}
          onClick={() => setCurrentTeam(team)}
        >
          {team.name} ({team.members.length})
        </Badge>
      ))}
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
    const newName = e.target.value;
    try {
      const updatedTeam = await teamsApi.updateTeam(currentTeam.id, { name: newName });
      setCurrentTeam(updatedTeam);
    } catch (error) {
      console.error('Error updating team name:', error);
      toast.error('ไม่สามารถแก้ไขชื่อทีมได้');
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-md">ทีม: {currentTeam.name}</h3>
        <Input
          value={currentTeam.name}
          onChange={(e) => {
            const updatedTeam = {
              ...currentTeam,
              name: e.target.value,
            }
            setCurrentTeam(updatedTeam);
          }}
          onBlur={handleTeamNameChange}
          className="max-w-[200px] text-sm"
          placeholder="ชื่อทีม"
        />
      </div>

      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {/* Team Leaders */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-gray-700">หัวหน้าทีม</h4>
          {currentTeam.members.filter((m) => m.isLeader).length === 0 ? (
            <p className="text-sm text-gray-500 italic">ยังไม่มีหัวหน้าทีม</p>
          ) : (
            <div className="space-y-2">
              {currentTeam.members.filter((m) => m.isLeader).map((leader) => (
                <div
                  key={leader.id}
                  className="flex justify-between items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100"
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
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-blue-600"
                      onClick={() => handleOpenPermissionDialog(leader)}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
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
        <div>
          <h4 className="text-sm font-medium mb-2 text-gray-700">สมาชิกทีม</h4>
          {currentTeam.members.filter((m) => !m.isLeader).length === 0 ? (
            <p className="text-sm text-gray-500 italic">ยังไม่มีสมาชิกทีม</p>
          ) : (
            <div className="space-y-2">
              {currentTeam.members.filter((m) => !m.isLeader).map((member) => (
                <div
                  key={member.id}
                  className="flex justify-between items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100"
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
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-blue-600"
                      onClick={() => handleOpenPermissionDialog(member)}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
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
        <div className="mt-6">
          <Button 
            variant="destructive" 
            onClick={handleDeleteTeam}
            size="sm"
            className="w-full text-white bg-red-600 hover:bg-red-700 mt-2"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            ลบทีม
          </Button>
        </div>
      </div>
    </div>
  )
}
