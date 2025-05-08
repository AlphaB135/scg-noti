"use client"

import { useState, useEffect } from "react"

interface CircularProgressChartProps {
  completed: number
  incomplete: number
}

export function CircularProgressChart({ completed, incomplete }: CircularProgressChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-64 h-64 flex items-center justify-center">Loading chart...</div>
  }

  const radius = 80
  const circumference = 2 * Math.PI * radius

  const completedOffset = circumference - (circumference * completed) / 100
  const incompleteOffset = circumference - (circumference * incomplete) / 100

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 200 200" className="transform -rotate-90">
        {/* Background circle */}
        <circle cx="100" cy="100" r={radius} fill="transparent" stroke="#f3f4f6" strokeWidth="20" />

        {/* Completed segment */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="transparent"
          stroke="#22c55e"
          strokeWidth="20"
          strokeDasharray={circumference}
          strokeDashoffset={completedOffset}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-3xl font-bold">{completed}%</div>
        <div className="text-sm text-gray-500">เสร็จแล้ว</div>
      </div>

      <div className="absolute bottom-0 w-full flex justify-around text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span>เสร็จแล้ว</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
          <span>ยังไม่เสร็จ</span>
        </div>
      </div>
    </div>
  )
}
