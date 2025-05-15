import { PieChart, Pie, Tooltip } from "recharts"

type MonthlyProgressProps = {
  doneCount: number
  incompleteCnt: number
  totalTasks: number
  progressPercent: number
  currentMonth: Date
}

export default function MonthlyProgress({
  doneCount,
  incompleteCnt,
  totalTasks,
  progressPercent,
  currentMonth,
}: MonthlyProgressProps) {
  // แปลงเดือนเป็นภาษาไทย
  const getThaiMonthName = (date: Date) => {
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
    return monthNames[date.getMonth()]
  }

  // คอมโพเนนต์สำหรับแสดง tooltip ในกราฟ
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
    <section className="relative isolate w-full md:w-1/3 overflow-hidden rounded-3xl border border-gray-100/70 bg-white/70 backdrop-blur-sm shadow-xl ring-1 ring-black/5 transition hover:scale-[1.02] duration-300 md:flex md:flex-col">
      {/* light gradient tint */}
      <div className="absolute inset-0 pointer-events-none" />
      <div className="relative z-10 p-6 flex-1 flex flex-col">
        {/* Heading */}
        <h2 className="mb-4 text-center text-xl font-bold tracking-tight text-gray-800">
          สรุปความคืบหน้างานเดือน : {getThaiMonthName(currentMonth)}
        </h2>

        {/* Donut chart - ปรับให้ขยายตามพื้นที่ */}
        <div className="relative mx-auto flex flex-1 items-center justify-center w-full">
          <PieChart width={200} height={200} className="mx-auto">
            {/* ✅ วาดสีเทาก่อน (พื้นหลัง) */}
            <Pie
              data={[{ name: "ยังไม่เสร็จ", value: incompleteCnt }]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              cornerRadius={50}
              dataKey="value"
              stroke="none"
              fill="#e5e7eb"
            />

            {/* ✅ วาดวงเขียวซ้อนทับหลังสุด (ความคืบหน้า) */}
            <Pie
              data={[{ name: "เสร็จแล้ว", value: doneCount }]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
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
            <span className="text-3xl font-bold">{progressPercent}%</span>
            <span className="mt-1 text-xs">
              {doneCount} จาก {totalTasks} งาน
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center gap-8 text-sm font-medium text-gray-700">
          <div className="flex items-center gap-2">
            <span className="block h-3 w-3 rounded-full bg-gradient-to-b from-red-800 to-red-900" />
            เสร็จแล้ว
          </div>
          <div className="flex items-center gap-2">
            <span className="block h-3 w-3 rounded-full bg-gray-300" />
            ยังไม่เสร็จ
          </div>
        </div>
      </div>
    </section>
  )
}
