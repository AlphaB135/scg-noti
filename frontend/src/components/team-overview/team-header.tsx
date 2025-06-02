import { Users, Pencil } from "lucide-react"
import { useState } from "react"
import { TeamSelector } from "./team-selector"
import type { Team } from "@/lib/team-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TeamHeaderProps {
  teamName: string
  memberCount: number
  teams?: Team[]
  selectedTeamId?: string
  onSelectTeam?: (teamId: string) => void
  hasMultipleTeams?: boolean
  onRenameTeam?: (newName: string) => void // ✅ เพิ่มเพื่อให้แก้ชื่อได้
  isLeader: boolean
}

export function TeamHeader({
  teamName,
  memberCount,
  teams = [],
  selectedTeamId = "",
  onSelectTeam = () => {},
  hasMultipleTeams = false,
  onRenameTeam = () => {}, // ✅ default ไม่ทำอะไร
  isLeader,
}: TeamHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(teamName)

  const handleRename = () => {
    if (newName.trim()) {
      onRenameTeam(newName.trim())
      setIsEditing(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left: ชื่อทีมและคำอธิบาย */}
        <div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-2xl font-bold max-w-xs"
                />
                <Button size="sm" onClick={handleRename}>
                  บันทึก
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  ยกเลิก
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-800">{teamName}</h1>
                {isLeader && <Badge className="ml-2">หัวหน้าทีม</Badge>}
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setNewName(teamName)
                    setIsEditing(true)
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">ภาพรวมสมาชิกในทีม</p>
        </div>

        {/* Right: dropdown + member count */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 ml-auto">
          {hasMultipleTeams && teams.length > 0 && (
            <TeamSelector
              teams={teams}
              selectedTeamId={selectedTeamId}
              onSelectTeam={onSelectTeam}
            />
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-red-700" />
            <span>{memberCount} คน</span>
          </div>
        </div>
      </div>
    </div>
  )
}
