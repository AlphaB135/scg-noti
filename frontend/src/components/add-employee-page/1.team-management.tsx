"use client"

import { Users, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type Team, type TeamMember, permissionColors, permissionDescriptions } from "@/components/types/team"

interface TeamManagementProps {
  teams: Team[]
  currentTeam: Team | null
  setCurrentTeam: (team: Team) => void
  setIsCreateTeamDialogOpen: (isOpen: boolean) => void
  handleOpenRemoveLeaderDialog: (leader: TeamMember) => void
  handleOpenPermissionDialog: (member: TeamMember) => void
  handleRemoveMember: (memberId: string) => void
}

export default function TeamManagement({
  teams,
  currentTeam,
  setCurrentTeam,
  setIsCreateTeamDialogOpen,
  handleOpenRemoveLeaderDialog,
  handleOpenPermissionDialog,
  handleRemoveMember,
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
}

function TeamContent({
  teams,
  currentTeam,
  setCurrentTeam,
  handleOpenRemoveLeaderDialog,
  handleOpenPermissionDialog,
  handleRemoveMember,
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
}

function TeamDetails({
  currentTeam,
  setCurrentTeam,
  teams,
  handleOpenRemoveLeaderDialog,
  handleOpenPermissionDialog,
  handleRemoveMember,
}: TeamDetailsProps) {
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
            // This is a simplified approach - in a real app, you'd update the state in the parent component
            setCurrentTeam(updatedTeam)
          }}
          className="max-w-[200px] text-sm"
          placeholder="ชื่อทีม"
        />
      </div>

      <div className="space-y-4">
        {/* Team Leaders */}
        <TeamLeaders
          leaders={currentTeam.members.filter((m) => m.isLeader)}
          handleOpenRemoveLeaderDialog={handleOpenRemoveLeaderDialog}
          handleOpenPermissionDialog={handleOpenPermissionDialog}
        />

        {/* Team Members */}
        <TeamMembers
          members={currentTeam.members.filter((m) => !m.isLeader)}
          handleOpenPermissionDialog={handleOpenPermissionDialog}
          handleRemoveMember={handleRemoveMember}
        />
      </div>
    </div>
  )
}

interface TeamLeadersProps {
  leaders: TeamMember[]
  handleOpenRemoveLeaderDialog: (leader: TeamMember) => void
  handleOpenPermissionDialog: (member: TeamMember) => void
}

function TeamLeaders({ leaders, handleOpenRemoveLeaderDialog, handleOpenPermissionDialog }: TeamLeadersProps) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2 text-gray-700">หัวหน้าทีม</h4>
      {leaders.length === 0 ? (
        <p className="text-sm text-gray-500 italic">ยังไม่มีหัวหน้าทีม</p>
      ) : (
        <ScrollArea className="h-[120px] rounded-md border p-2">
          <div className="space-y-2">
            {leaders.map((leader) => (
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
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-blue-600"
                    onClick={() => handleOpenPermissionDialog(leader)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-pencil"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
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
        </ScrollArea>
      )}
    </div>
  )
}

interface TeamMembersProps {
  members: TeamMember[]
  handleOpenPermissionDialog: (member: TeamMember) => void
  handleRemoveMember: (memberId: string) => void
}

function TeamMembers({ members, handleOpenPermissionDialog, handleRemoveMember }: TeamMembersProps) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2 text-gray-700">สมาชิกทีม</h4>
      {members.length === 0 ? (
        <p className="text-sm text-gray-500 italic">ยังไม่มีสมาชิกทีม</p>
      ) : (
        <ScrollArea className="h-[200px] rounded-md border p-2">
          <div className="space-y-2">
            {members.map((member) => (
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
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-blue-600"
                    onClick={() => handleOpenPermissionDialog(member)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-pencil"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-red-600"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
