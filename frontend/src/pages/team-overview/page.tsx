"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { TeamHeader } from "@/components/team-overview/team-header";
import { MemberCard } from "@/components/team-overview/member-card";
import { TeamStats } from "@/components/team-overview/team-stats";
import { TeamFilter } from "@/components/team-overview/team-filter";
import { teams, teamMembers, renameTeam } from "@/lib/team-data";
import { MemberDetailsModal } from "@/components/team-overview/member-details-modal";
import AppLayout from "@/components/layout/app-layout";

export default function TeamOverviewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "completed" | "late" | "pending" | "all" | null
  >(null);

  const [_, forceUpdate] = useState(0);
  // Get the selected team
  const selectedTeam =
    teams.find((team) => team.id === selectedTeamId) || teams[0];

  // Get team members for the selected team
  const currentTeamMembers = teamMembers.filter(
    (member) => member.teamId === selectedTeamId
  );

  // Filter members based on search query and status filter
  const statusPriority = { critical: 0, warning: 1, normal: 2 };

  const filteredMembers = currentTeamMembers
    .filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.position.toLowerCase().includes(searchQuery.toLowerCase());

      // Convert status to display text for filtering
      const statusText = getStatusText(member.status);
      const matchesStatus = !filterStatus || statusText === filterStatus;

      return matchesSearch && matchesStatus;
    })

    .sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

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
    (sum, member) => sum + member.totalTasks,
    0
  );
  const completedTasks = currentTeamMembers.reduce(
    (sum, member) => sum + member.completedTasks,
    0
  );
  const pendingTasks = currentTeamMembers.reduce(
    (sum, member) => sum + member.pendingTasks,
    0
  );
  const lateTasks = currentTeamMembers.reduce(
    (sum, member) => sum + member.lateTasks,
    0
  );
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Handle statistic box click
  const handleStatsClick = (type: "completed" | "late" | "pending" | "all") => {
    setModalType(type);
    setModalOpen(true);
  };

  // Get filtered members for modal based on type
  const getFilteredMembersForModal = () => {
    switch (modalType) {
      case "completed":
        return currentTeamMembers.filter((member) => member.completedTasks > 0);
      case "late":
        return currentTeamMembers.filter((member) => member.lateTasks > 0);
      case "pending":
        return currentTeamMembers.filter((member) => member.pendingTasks > 0);
      case "all":
        return currentTeamMembers;
      default:
        return [];
    }
  };

  return (
    <AppLayout title="ภาพรวมทีม" description="ข้อมูลสมาชิกและความคืบหน้าของทีม">
      <TeamHeader
        teamName={selectedTeam?.name || "ทีมพัฒนาระบบ"}
        memberCount={currentTeamMembers.length}
        teams={teams}
        selectedTeamId={selectedTeamId}
        onSelectTeam={setSelectedTeamId}
        hasMultipleTeams={teams.length > 1}
        onRenameTeam={(newName) => {
          renameTeam(selectedTeamId, newName);
          forceUpdate((n) => n + 1); // 🔥 trigger render จริง
        }}
      />

      <div className="mt-6">
        <TeamStats
          completedTasks={completedTasks}
          pendingTasks={pendingTasks}
          lateTasks={lateTasks}
          totalTasks={totalTasks}
          completionRate={completionRate}
          onStatsClick={handleStatsClick}
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
            <MemberCard key={member.id} member={member} />
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
