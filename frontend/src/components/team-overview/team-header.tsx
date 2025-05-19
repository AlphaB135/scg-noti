import { Users } from "lucide-react"
import { TeamSelector } from "./team-selector"
import type { Team } from "@/lib/team-data"

interface TeamHeaderProps {
  teamName: string
  memberCount: number
  teams?: Team[]
  selectedTeamId?: string
  onSelectTeam?: (teamId: string) => void
  hasMultipleTeams?: boolean
}

export function TeamHeader({
  teamName,
  memberCount,
  teams = [],
  selectedTeamId = "",
  onSelectTeam = () => {},
  hasMultipleTeams = false,
}: TeamHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-red-800 to-red-900 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{teamName}</h1>
          <p className="text-white/80 mt-1">ภาพรวมสมาชิกในทีม</p>

          {hasMultipleTeams && teams.length > 0 && (
            <div className="mt-3 ">
              <TeamSelector teams={teams} selectedTeamId={selectedTeamId} onSelectTeam={onSelectTeam} />
            </div>
          )}
        </div>
        <div className="flex items-center bg-white/10 px-4 py-2 rounded-lg">
          <Users className="h-5 w-5 mr-2" />
          <span className="font-medium">{memberCount} คน</span>
        </div>
      </div>
    </div>
  )
}
