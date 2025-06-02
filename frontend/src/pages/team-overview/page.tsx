//team-overview

"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { TeamHeader } from "@/components/team-overview/team-header";
import { MemberCard } from "@/components/team-overview/member-card";
import { TeamStats } from "@/components/team-overview/team-stats";
import { TeamFilter } from "@/components/team-overview/team-filter";
import { MemberDetailsModal } from "@/components/team-overview/member-details-modal";
import AppLayout from "@/components/layout/app-layout";
import { teamsApi } from "@/lib/api/teams";
import { notificationsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Team } from "@/components/types/team";

// Task status interfaces for member stats
interface MemberTaskStats {
  completedTasks: number;
  totalTasks: number;
  pendingTasks: number;
  lateTasks: number;
  status: "normal" | "warning" | "critical";
  lastActive: string;
  avatar: string;
}

interface Member {
  id: string;
  name: string;
  position: string;
  department: string;
  avatar: string;
  completedTasks: number;
  totalTasks: number;
  pendingTasks: number;
  lateTasks: number;
  status: "normal" | "warning" | "critical";
  lastActive: string;
  teamId: string;
}

// No longer need MemberWithStats interface since we're using Member interface

export default function TeamOverviewPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Derive isLeader from user role
  const isLeader = user?.role === "TEAM_LEAD" || user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"completed" | "late" | "pending" | "all" | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [memberStats, setMemberStats] = useState<Record<string, MemberTaskStats>>({});

  // Notification handling functions
  const sendTeamNotification = async (message: string) => {
    if (!selectedTeamId) return;
    const team = teams.find(t => t.id === selectedTeamId);
    if (!team || !team.members || team.members.length === 0) {
      toast({
        title: "ไม่พบสมาชิกในทีม",
        description: "ไม่สามารถส่งการแจ้งเตือนได้เพราะทีมไม่มีสมาชิก",
        variant: "destructive"
      });
      return;
    }
    try {
      await notificationsApi.create({
        title: "Team Overview Alert",
        message,
        scheduledAt: new Date().toISOString(),
        recipients: team.members.map(member => ({
          type: "USER",
          userId: member.id // ถ้า member มี userId ให้เปลี่ยนเป็น member.userId
        }))
      });

      toast({
        title: "Notification sent",
        description: "Team notification sent successfully"
      });
    } catch (error) {
      console.error("Failed to send team notification:", error);
      toast({
        title: "Error",
        description: "Failed to send team notification",
        variant: "destructive"
      });
    }
  };

  const sendMemberNotification = async (memberId: string, message: string) => {
    try {
      await notificationsApi.create({
        title: "Member Task Alert",
        message,
        scheduledAt: new Date().toISOString(),
        recipients: [{ type: "USER", userId: memberId }]
      });

      toast({
        title: "Notification sent",
        description: "Member notification sent successfully"
      });
    } catch (error) {
      console.error("Failed to send member notification:", error);
      toast({
        title: "Error",
        description: "Failed to send member notification",
        variant: "destructive"
      });
    }
  };

  // Load teams data
  useEffect(() => {
    async function loadTeams() {
      try {
        setIsLoading(true);
        const result = await teamsApi.list();
        setTeams(result.data);
        if (result.data.length > 0) {
          setSelectedTeamId(result.data[0].id);
        }
      } catch (error) {
        console.error("Error loading teams:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTeams();
  }, []);

  // Generate task stats and convert API member data to our format
  useEffect(() => {
    const stats: Record<string, MemberTaskStats> = {};
    teams.forEach(team => {
      team.members.forEach(member => {
        if (!stats[member.id]) {
          // Generate random stats for demo - replace with real data
          const totalTasks = Math.floor(Math.random() * 30) + 10;
          const completedTasks = Math.floor(Math.random() * totalTasks);
          const lateTasks = Math.floor(Math.random() * (totalTasks - completedTasks));
          const pendingTasks = totalTasks - completedTasks - lateTasks;

          let status: MemberTaskStats["status"] = "normal";
          if (lateTasks > 5) status = "critical";
          else if (lateTasks > 2 || pendingTasks > 10) status = "warning";

          stats[member.id] = {
            totalTasks,
            completedTasks,
            lateTasks,
            pendingTasks,
            status,
            lastActive: "1 ชั่วโมงที่แล้ว", // Mock data - should come from API
            avatar: `/placeholder.svg?id=${member.id}` // Placeholder avatar URL
          };
        }
      });
    });
    setMemberStats(stats);
  }, [teams]);

  // Get the selected team
  const selectedTeam = teams.find(team => team.id === selectedTeamId) || teams[0];

  // Get team members with stats for the selected team
  const currentTeamMembers: Member[] = selectedTeam?.members.map(member => ({
    id: member.id,
    name: member.name,
    position: member.position,
    department: member.department,
    teamId: selectedTeam.id,
    ...memberStats[member.id]
  })) || [];

  // Filter members based on search query and status filter
  const statusPriority = { critical: 0, warning: 1, normal: 2 };

  const filteredMembers = currentTeamMembers
    .filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.position.toLowerCase().includes(searchQuery.toLowerCase());

      const statusText = getStatusText(memberStats[member.id]?.status || "normal");
      const matchesStatus = !filterStatus || statusText === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => statusPriority[memberStats[a.id]?.status || "normal"] - statusPriority[memberStats[b.id]?.status || "normal"]);

  // Get unique statuses for filter
  const statuses = ["ปกติ", "ควรติดตาม", "น่าเป็นห่วง"];

  // Helper function to convert status to display text
  function getStatusText(status: string): string {
    switch (status) {
      case "normal":
        return "ปกติ";
      case "warning":
        return "ควรติดตาม";
      case "critical":
        return "น่าเป็นห่วง";
      default:
        return "";
    }
  }

  // Calculate team statistics
  const totalTasks = currentTeamMembers.reduce(
    (sum, member) => sum + (memberStats[member.id]?.totalTasks || 0),
    0
  );
  const completedTasks = currentTeamMembers.reduce(
    (sum, member) => sum + (memberStats[member.id]?.completedTasks || 0),
    0
  );
  const pendingTasks = currentTeamMembers.reduce(
    (sum, member) => sum + (memberStats[member.id]?.pendingTasks || 0),
    0
  );
  const lateTasks = currentTeamMembers.reduce(
    (sum, member) => sum + (memberStats[member.id]?.lateTasks || 0),
    0
  );
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Handle statistic box click
  const handleStatsClick = (type: "completed" | "late" | "pending" | "all") => {
    setModalType(type);
    setModalOpen(true);
  };

  // Get filtered members for modal based on type
  const getFilteredMembersForModal = () => {
    if (!modalType) return [];
    
    return currentTeamMembers.filter(member => {
      const stats = memberStats[member.id];
      if (!stats) return false;
      
      switch (modalType) {
        case "completed":
          return stats.completedTasks > 0;
        case "late":
          return stats.lateTasks > 0;
        case "pending":
          return stats.pendingTasks > 0;
        case "all":
          return true;
        default:
          return false;
      }
    }).map(member => ({
      ...member,
      ...memberStats[member.id]
    }));
  };

  // Handle team rename
  const handleRenameTeam = async (newName: string) => {
    if (!selectedTeam) return;

    try {
      const updatedTeam = await teamsApi.update(selectedTeam.id, { name: newName });
      setTeams(teams.map(team => team.id === updatedTeam.id ? updatedTeam : team));
    } catch (error) {
      console.error("Error renaming team:", error);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="ภาพรวมทีม" description="ข้อมูลสมาชิกและความคืบหน้าของทีม">
        <div className="flex justify-center items-center h-[200px]">
          <div className="animate-pulse text-gray-500">กำลังโหลดข้อมูล...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="ภาพรวมทีม" description="ข้อมูลสมาชิกและความคืบหน้าของทีม">
      <TeamHeader
        teamName={selectedTeam?.name || "ทีมพัฒนาระบบ"}
        memberCount={currentTeamMembers.length}
        teams={teams}
        selectedTeamId={selectedTeamId}
        onSelectTeam={setSelectedTeamId}
        hasMultipleTeams={teams.length > 1}
        onRenameTeam={handleRenameTeam}
        isLeader={isLeader}
      />

      <div className="mt-6">
        <TeamStats
          completedTasks={completedTasks}
          pendingTasks={pendingTasks} 
          lateTasks={lateTasks}
          totalTasks={totalTasks}
          completionRate={completionRate}
          onStatsClick={handleStatsClick}
          onNotifyTeam={sendTeamNotification}
        />
      </div>

      <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="ค้นหาสมาชิก..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>

        <TeamFilter
          statuses={statuses}
          selectedStatus={filterStatus}
          onSelectStatus={setFilterStatus}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <MemberCard 
              key={member.id} 
              member={member}
              onNotify={sendMemberNotification}
            />
          ))
        ) : (
          <div className="col-span-full bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">
              ไม่พบสมาชิกที่ตรงกับเงื่อนไขการค้นหา
            </p>
          </div>
        )}
      </div>

      {/* Member Details Modal */}
      <MemberDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        members={getFilteredMembersForModal()}
        type={modalType}
      />
    </AppLayout>
  );
}
