"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserMinus, LogOut, Users, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/app-layout";
import {
  type Team,
  type TeamMember,
  permissionColors,
  roleColors,
} from "@/components/types/team";
import LeaveTeamDialog from "@/components/team-member/1.leave-team-dialog";
import RemoveMemberDialog from "@/components/team-member/2.remove-member-dialog";
import AddMemberDialog from "@/components/team-member/3.add-member-dialog";
import { teamsApi } from "@/lib/api/teams";
import { useToast } from "@/hooks/use-toast";

export default function TeamMembersPage() {
  const { toast } = useToast();
  
  // State
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [isLeaveTeamDialogOpen, setIsLeaveTeamDialogOpen] = useState(false);
  const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] =
    useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);  

  // Mock current user (in a real app, this would come from authentication)
  const currentUser = {
    id: "emp-1",
    name: "พนักงาน 1",
    department: "แผนก 1",
    position: "ผู้จัดการ",
    email: "employee1@selfsync.com",
  };
  // Load teams and members data
  const loadTeams = async () => {
    try {
      const result = await teamsApi.list();
      setTeams(result.data);
      if (result.data.length > 0) {
        setCurrentTeam(result.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      toast({
        title: "Error",
        description: "ไม่สามารถดึงข้อมูลทีมได้",
        variant: "destructive"
      });
    }
  };

  // Fetch teams data from API
  useEffect(() => {
    loadTeams();
  }, [toast]);

  // Set filtered members when current team changes
  useEffect(() => {
    if (currentTeam) {
      setFilteredMembers(currentTeam.members);

      // Set current user role based on their membership in the team
      const userMember = currentTeam.members.find(
        (member) => member.id === currentUser.id
      );
      if (userMember) {
        // setCurrentUserRole(userMember.permissionLevel); // This line was using the removed state
      } else {
        // setCurrentUserRole("member"); // This line was using the removed state
      }
    }
  }, [currentTeam, currentUser.id]); // Added currentUser.id to dependency array if it influences role

  // Filter members based on search query
  useEffect(() => {
    if (!currentTeam) return;

    if (searchQuery.trim() === "") {
      setFilteredMembers(currentTeam.members);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = currentTeam.members.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.department.toLowerCase().includes(query) ||
          member.position.toLowerCase().includes(query)
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, currentTeam]);

  // Handle add member (mock implementation)
  const handleAddMember = () => {
    // In a real app, this would open a dialog to select employees to add
    setIsAddMemberDialogOpen(true);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Check if current user is in the team
  const isUserInTeam =
    currentTeam?.members.some((member) => member.id === currentUser.id) ||
    false;
  // Check if current user is a leader
  const isUserLeader =
    currentTeam?.members.some(
      (member) => member.id === currentUser.id && member.role === 'LEADER'
    ) || false;

  return (
    <AppLayout
      title="สมาชิกในทีม"
      description="ดูรายละเอียดและจัดการสมาชิกในทีม"
    >
      <div className="space-y-6">
        {/* Current User Profile */}
        {currentTeam && (
          <Card className="border-l-4 border-l-red-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-gray-200">
                  <AvatarImage
                    src={`/placeholder.svg?height=64&width=64`}
                    alt={currentUser.name}
                  />
                  <AvatarFallback className="text-lg bg-red-100 text-red-800">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {currentUser.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {currentUser.position} • {currentUser.department}
                      </p>
                    </div>
                    {currentTeam.members.some(
                      (member) => member.id === currentUser.id
                    ) ? (
                      <div className="flex flex-wrap gap-2">                        {currentTeam.members.find(
                          (member) => member.id === currentUser.id
                        )?.role === 'LEADER' ? (
                          <Badge className="bg-amber-600 hover:bg-amber-700">
                            <UserCog className="h-3 w-3 mr-1" />
                            หัวหน้าทีม {currentTeam.name}
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-600 hover:bg-blue-700">
                            <Users className="h-3 w-3 mr-1" />
                            สมาชิกทีม {currentTeam.name}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-gray-300 text-gray-500"
                      >
                        ไม่ได้เป็นสมาชิกในทีมนี้
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      {currentTeam.members.some(
                        (member) => member.id === currentUser.id
                      )                        ? currentTeam.members.find(
                            (member) => member.id === currentUser.id
                          )?.role === 'LEADER'
                          ? "คุณมีสิทธิ์ในการจัดการสมาชิกและเพิ่มตำแหน่งในทีมนี้"
                          : "คุณสามารถดูข้อมูลและออกจากทีมได้"
                        : "คุณไม่มีสิทธิ์ในการจัดการทีมนี้"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold">เลือกทีม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.length === 0 ? (
                <p className="text-gray-500">ไม่พบข้อมูลทีม</p>
              ) : (
                teams.map((team) => {
                  const isActive = currentTeam?.id === team.id;
                  return (
                    <button
                      key={team.id}
                      onClick={() => setCurrentTeam(team)}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left shadow-sm ${
                        isActive
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="bg-red-100 text-red-700 p-2 rounded-md">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            isActive ? "text-red-700" : "text-gray-800"
                          }`}
                        >
                          {team.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {team.members.length} สมาชิก
                        </p>                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        {currentTeam && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold">
                  สมาชิกในทีม: {currentTeam.name}
                </CardTitle>
                <div className="flex gap-2">
                  {isUserInTeam && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => setIsLeaveTeamDialogOpen(true)}
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      ออกจากทีม
                    </Button>
                  )}
                  {/* Only show Add Member button if user is a leader */}
                  {isUserLeader && (
                    <Button
                      className="bg-red-700 hover:bg-red-800 text-white"
                      size="sm"
                      onClick={handleAddMember}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      เพิ่มสมาชิก
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-2 flex gap-2 items-center">
                <div className="relative flex-1">
                  <Input
                    placeholder="ค้นหาสมาชิก..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">
                    ทั้งหมด ({currentTeam.members.length})
                  </TabsTrigger>                  <TabsTrigger value="leaders">
                    หัวหน้าทีม (
                    {currentTeam.members.filter((m) => m.role === 'LEADER').length})
                  </TabsTrigger>
                  <TabsTrigger value="members">
                    สมาชิก (
                    {currentTeam.members.filter((m) => m.role !== 'LEADER').length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="m-0">
                  <MembersList
                    members={filteredMembers}
                    currentUserId={currentUser.id}
                    isUserLeader={isUserLeader}
                    onRemoveMember={(member) => {
                      setSelectedMember(member);
                      setIsRemoveMemberDialogOpen(true);
                    }}
                    getInitials={getInitials}
                    setIsLeaveTeamDialogOpen={setIsLeaveTeamDialogOpen}
                  />
                </TabsContent>                <TabsContent value="leaders" className="m-0">
                  <MembersList
                    members={filteredMembers.filter((m) => m.role === 'LEADER')}
                    currentUserId={currentUser.id}
                    isUserLeader={isUserLeader}
                    onRemoveMember={(member) => {
                      setSelectedMember(member);
                      setIsRemoveMemberDialogOpen(true);
                    }}
                    getInitials={getInitials}
                    setIsLeaveTeamDialogOpen={setIsLeaveTeamDialogOpen}
                  />
                </TabsContent>

                <TabsContent value="members" className="m-0">
                  <MembersList
                    members={filteredMembers.filter((m) => m.role !== 'LEADER')}
                    currentUserId={currentUser.id}
                    isUserLeader={isUserLeader}
                    onRemoveMember={(member) => {
                      setSelectedMember(member);
                      setIsRemoveMemberDialogOpen(true);
                    }}
                    getInitials={getInitials}
                    setIsLeaveTeamDialogOpen={setIsLeaveTeamDialogOpen}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>      {/* Leave Team Dialog */}
      <LeaveTeamDialog
        isOpen={isLeaveTeamDialogOpen}
        setIsOpen={setIsLeaveTeamDialogOpen}
        teamName={currentTeam?.name || ""}
        onConfirm={() => {
          // Handle leave team logic here
          console.log("User leaving team");
          loadTeams();
          setIsLeaveTeamDialogOpen(false);
        }}
        isLeader={isUserLeader}
      />

      {/* Remove Member Dialog */}
      <RemoveMemberDialog
        isOpen={isRemoveMemberDialogOpen}
        setIsOpen={setIsRemoveMemberDialogOpen}
        memberName={selectedMember?.name || ""}
        onConfirm={() => {
          // Handle remove member logic here
          console.log("Removing member:", selectedMember?.name);
          loadTeams();
          setIsRemoveMemberDialogOpen(false);
        }}
      />
      {/* Add Member Dialog */}
      <AddMemberDialog
        isOpen={isAddMemberDialogOpen}
        setIsOpen={setIsAddMemberDialogOpen}
        teamId={currentTeam?.id || ""}
        teamName={currentTeam?.name || ""}
      />
    </AppLayout>
  );
}

interface MembersListProps {
  members: TeamMember[];
  currentUserId: string;
  isUserLeader: boolean;
  onRemoveMember: (member: TeamMember) => void;
  getInitials: (name: string) => string;
  setIsLeaveTeamDialogOpen: (isOpen: boolean) => void;
}

function MembersList({
  members,
  currentUserId,
  isUserLeader,
  onRemoveMember,
  getInitials,
  setIsLeaveTeamDialogOpen,
}: MembersListProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
        <p>ไม่พบข้อมูลสมาชิก</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <Card key={member.id} className="overflow-hidden">            <div
              className={`h-2 ${
                member.role === 'LEADER' ? "bg-amber-500" : "bg-blue-500"
              }`}
            />
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-gray-200">
                  <AvatarImage
                    src={`/placeholder.svg?height=64&width=64`}
                    alt={member.name}
                  />                  <AvatarFallback
                    className={`text-lg ${
                      member.role === 'LEADER'
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">                    <div>
                      <h3 className="font-medium text-base">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.position}</p>
                      {/* Show leader badge */}
                      {member.role === 'LEADER' && (
                        <Badge className="bg-amber-600 hover:bg-amber-700 text-white mt-1">
                          <UserCog className="h-3 w-3 mr-1" />
                          หัวหน้าทีม
                        </Badge>
                      )}
                    </div>                    <div className="flex flex-col gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Badge
                                className={`${
                                  permissionColors[member.permissionLevel]
                                }`}
                              >
                                {member.role === 'LEADER' ? (
                                  <UserCog className="h-3 w-3 mr-1" />
                                ) : (
                                  <Users className="h-3 w-3 mr-1" />
                                )}
                                {member.permissionLevel === "admin"
                                  ? "แอดมินทีม"
                                  : member.permissionLevel === "leader"
                                  ? "หัวหน้าทีม"
                                  : "สมาชิก"}
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {member.permissionLevel === "admin" &&
                              "สามารถจัดการพนักงานและทีมทั้งหมดได้"}
                            {member.permissionLevel === "leader" &&
                              "สามารถเพิ่ม/ลบสมาชิกในทีมตัวเองได้"}
                            {member.permissionLevel === "member" &&
                              "สามารถแก้ไขข้อมูลทีมได้"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>                      {/* Add role badge */}                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Badge className={`${roleColors[member.role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"}`}>
                                {member.role}
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {member.role === "หัวหน้างาน"
                              ? "สามารถเพิ่มตำแหน่งในทีมได้"
                              : "สมาชิกในทีม"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      แผนก: {member.department}
                    </p>
                    <p className="text-xs text-gray-500">
                      อีเมล: {member.email}
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    {/* Show remove button only if current user is leader and not removing themselves */}
                    {isUserLeader && member.id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onRemoveMember(member)}
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        นำออกจากทีม
                      </Button>
                    )}

                    {/* Show leave team button if this is the current user */}
                    {member.id === currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setIsLeaveTeamDialogOpen(true)}
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        ออกจากทีม
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
