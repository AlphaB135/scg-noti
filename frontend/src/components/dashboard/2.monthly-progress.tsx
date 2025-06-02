"use client"

import { PieChart, Pie, Tooltip } from "recharts"
import { useEffect, useState } from "react"

type MonthlyProgressProps = {
  doneCount: number
  incompleteCnt: number
  totalTasks: number
  progressPercent: number
  selectedMonth: number
  selectedYear: number
}

export default function MonthlyProgress({
  doneCount,
  incompleteCnt,
  totalTasks,
  progressPercent,
  selectedMonth,
  selectedYear,
}: MonthlyProgressProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Screen size detection
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768)
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Convert month to Thai language
  const getThaiMonthName = (month: number) => {
    const monthNames = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ]
    // Month is 1-based (January = 1) but array is 0-based
    return monthNames[month - 1]
  }

  // Custom tooltip component for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0]
      const msg = name === "เสร็จแล้ว" ? `ทำแล้ว ${value} งาน` : `เหลืออีก ${value} งาน`

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm text-gray-800">
          <div className="font-semibold">{name}</div>
          <div>{msg}</div>
        </div>
      )
    }
    return null
  }

  return (
    <section className="relative isolate w-full flex-1 overflow-hidden rounded-3xl border border-gray-100/70 bg-white/70 backdrop-blur-sm shadow-xl ring-1 ring-black/5 transition hover:scale-[1.02] duration-300 flex flex-col">
      {/* Light gradient tint */}
      <div className="absolute inset-0 pointer-events-none" />
      <div className="relative z-10 p-4 md:p-6 flex-1 flex flex-col">
        {/* Heading */}
        <div className="mb-2 md:mb-4 text-center">
          <h2 className="text-base md:text-xl font-bold tracking-tight text-gray-800">สรุปความคืบหน้างานเดือน :</h2>
          <h3 className="text-base md:text-xl font-bold tracking-tight text-gray-800 mt-1">
            {getThaiMonthName(selectedMonth)} {selectedYear}
          </h3>
        </div>

        {/* Donut chart - responsive sizing */}
        <div className="relative mx-auto flex flex-1 items-center justify-center w-full">
          <PieChart width={isMobile ? 150 : 200} height={isMobile ? 150 : 200} className="mx-auto">
            {/* Draw gray background first */}
            <Pie
              data={[{ name: "ยังไม่เสร็จ", value: incompleteCnt }]}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 45 : 60}
              outerRadius={isMobile ? 60 : 80}
              startAngle={90}
              endAngle={-270}
              cornerRadius={50}
              dataKey="value"
              stroke="none"
              fill="#e5e7eb"
            />

            {/* Draw red progress on top */}
            <Pie
              data={[{ name: "เสร็จแล้ว", value: doneCount }]}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 45 : 60}
              outerRadius={isMobile ? 60 : 80}
              startAngle={90}
              endAngle={90 - (360 * doneCount) / (totalTasks || 1)}
              cornerRadius={50}
              dataKey="value"
              stroke="none"
              fill="#96231e"
            />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} position={{ y: 90 }} />
          </PieChart>

          {/* Center label */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xl md:text-3xl font-bold">{progressPercent}%</span>
            <span className="mt-1 text-[10px] md:text-xs">
              {doneCount} จาก {totalTasks} งาน
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-2 md:mt-4 flex justify-center gap-4 md:gap-8 text-xs md:text-sm font-medium text-gray-700">
          <div className="flex items-center gap-1 md:gap-2">
            <span className="block h-2 w-2 md:h-3 md:w-3 rounded-full bg-gradient-to-b from-red-800 to-red-900" />
            เสร็จแล้ว
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <span className="block h-2 w-2 md:h-3 md:w-3 rounded-full bg-gray-300" />
            ยังไม่เสร็จ
          </div>
        </div>
      </div>
    </section>
  )
}
