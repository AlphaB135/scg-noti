"use client"

import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TeamFilterProps {
  statuses: string[]
  selectedStatus: string | null
  onSelectStatus: (status: string | null) => void
}

export function TeamFilter({ statuses, selectedStatus, onSelectStatus }: TeamFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 hidden md:inline">กรองตาม:</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <span>{selectedStatus || "สถานะ"}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onSelectStatus(null)}>
            <span className="flex items-center">
              ทั้งหมด
              {selectedStatus === null && <Check className="ml-2 h-4 w-4" />}
            </span>
          </DropdownMenuItem>
          {statuses.map((status) => (
            <DropdownMenuItem key={status} onClick={() => onSelectStatus(status)}>
              <span className="flex items-center">
                {status}
                {selectedStatus === status && <Check className="ml-2 h-4 w-4" />}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
