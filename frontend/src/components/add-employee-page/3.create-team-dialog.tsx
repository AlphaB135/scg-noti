"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CreateTeamDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  newTeamName: string
  setNewTeamName: (name: string) => void
  handleCreateTeam: () => void
}

export default function CreateTeamDialog({
  isOpen,
  setIsOpen,
  newTeamName,
  setNewTeamName,
  handleCreateTeam,
}: CreateTeamDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>สร้างทีมใหม่</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="team-name" className="text-sm font-medium">
              ชื่อทีม
            </label>
            <Input
              id="team-name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="กรอกชื่อทีม"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleCreateTeam}
            className="bg-red-700 hover:bg-red-800 text-white"
            disabled={!newTeamName.trim()}
          >
            สร้างทีม
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
