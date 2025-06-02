"use client"

import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Team } from "@/lib/team-data"

interface TeamSelectorProps {
  teams: Team[]
  selectedTeamId: string
  onSelectTeam: (teamId: string) => void
}

export function TeamSelector({ teams, selectedTeamId, onSelectTeam }: TeamSelectorProps) {
  const selectedTeam = teams.find((team) => team.id === selectedTeamId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 border-red-800/20">
          <span className="font-medium">{selectedTeam?.name || "เลือกทีม"}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {teams.map((team) => (
          <DropdownMenuItem key={team.id} onClick={() => onSelectTeam(team.id)}>
            <span className="flex items-center">
              {team.name}
              {selectedTeamId === team.id && <Check className="ml-2 h-4 w-4" />}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
