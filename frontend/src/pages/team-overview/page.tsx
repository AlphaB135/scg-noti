"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import AppLayout from "@/components/layout/app-layout"
import { TeamHeader } from "@/components/team-overview/team-header"
import { MemberCard } from "@/components/team-overview/member-card"
import { TeamStats } from "@/components/team-overview/team-stats"
import { TeamFilter } from "@/components/team-overview/team-filter"
import { teamMembers, teams } from "@/lib/team-data"

export default function TeamOverviewPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || "")

  // Get the selected team
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) || teams[0]

  // Get team members for the selected team
  const currentTeamMembers = teamMembers.filter((member) => member.teamId === selectedTeamId)

  // Filter members based on search query and status filter
  const filteredMembers = currentTeamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position.toLowerCase().includes(searchQuery.toLowerCase())

    // Convert status to display text for filtering
    const statusText = getStatusText(member.status)
    const matchesStatus = !filterStatus || statusText === filterStatus

    return matchesSearch && matchesStatus
  })

  // Get unique statuses for filter
  const statuses = ["ปกติ", "ควรติดตาม", "น่าเป็นห่วง"]

  // Helper function to convert status to display text
  function getStatusText(status: string): string {
    switch (status) {
      case "normal":
        return "ปกติ"
      case "warning":
        return "ควรติดตาม"
      case "critical":
        return "น่าเป็นห่วง"
      default:
        return ""
    }
  }

  // Check if the current user is a team leader with multiple teams
  const hasMultipleTeams = teams.length > 1

  return (
    <AppLayout title="ภาพรวมสมาชิกในทีม" description="ดูข้อมูลและสถานะของสมาชิกในทีมทั้งหมด">
      <TeamHeader
        teamName={selectedTeam?.name || "ทีมพัฒนาระบบ"}
        memberCount={currentTeamMembers.length}
        teams={teams}
        selectedTeamId={selectedTeamId}
        onSelectTeam={setSelectedTeamId}
        hasMultipleTeams={hasMultipleTeams}
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
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

            <TeamFilter statuses={statuses} selectedStatus={filterStatus} onSelectStatus={setFilterStatus} />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => <MemberCard key={member.id} member={member} />)
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">ไม่พบสมาชิกที่ตรงกับเงื่อนไขการค้นหา</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <TeamStats members={currentTeamMembers} />
        </div>
      </div>
    </AppLayout>
  )
}
