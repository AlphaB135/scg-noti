type Task = {
  id: string
  title: string
  description: string
  dueDate: Date
  completed: boolean
}

import { MonthCalendar } from "@/components/month-calendar"

type TaskCalendarProps = {
  tasks: Task[]
  setIsAddDialogOpen: (value: boolean) => void
  setEditTask: (task: Task | null) => void
  resetForm: () => void
}

export default function TaskCalendar({ tasks, setIsAddDialogOpen, setEditTask, resetForm }: TaskCalendarProps) {
  return (
    <section className="mt-6">
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-6">
        <MonthCalendar
          tasks={tasks}
          onMonthChange={(month, year) => {
            console.log(`Month changed to ${month}/${year}`)
          }}
          setIsAddDialogOpen={setIsAddDialogOpen}
          setEditTask={setEditTask}
          resetForm={resetForm}
        />
      </div>
    </section>
  )
}
