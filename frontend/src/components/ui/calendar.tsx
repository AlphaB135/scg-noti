// frontend/src/components/ui/Calendar.tsx รอแก้
"use client"

import { DayPicker } from "react-day-picker"

export interface CalendarProps {
  /** The currently selected date (single-select mode) */
  selected?: Date
  /** Callback when the user picks a date */
  onSelect?: (date: Date | undefined) => void
  /** Extra classes on the wrapper div */
  className?: string
}

export function Calendar({
  selected,
  onSelect,
  className = "",
}: CalendarProps) {
  return (
    <div className={`p-3 bg-white rounded-md shadow ${className}`}>
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
      />
    </div>
  )
}

Calendar.displayName = "Calendar"
