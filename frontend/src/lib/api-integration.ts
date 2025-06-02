// Define the UnifiedTask type that will be used throughout the application
export type UnifiedTask = {
  id: string | number
  title: string
  details: string
  dueDate: string
  status: "completed" | "incomplete" | "overdue"
  priority: "high" | "medium" | "low" | "pending"
  done: boolean
  frequency: "no-repeat" | "daily" | "weekly" | "monthly" | "yearly" | "quarterly"
  impact?: string
  link?: string
  hasLogin?: boolean
  username?: string
  password?: string
  type?: string
  isUrgent?: boolean
}

// Local storage keys
const TASKS_STORAGE_KEY = "reminder-tasks"

// Helper function to generate a unique ID
const generateId = (): string => {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString()
}

// Helper function to check if a task is overdue
const isOverdue = (dueDate: string): boolean => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const taskDate = new Date(dueDate)
  taskDate.setHours(0, 0, 0, 0)

  return taskDate < today
}

// Helper function to check if a task is urgent (due within 3 days)
const isUrgent = (dueDate: string): boolean => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const taskDate = new Date(dueDate)
  taskDate.setHours(0, 0, 0, 0)

  const diffTime = taskDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays >= 0 && diffDays <= 3
}

// Helper function to calculate task priority
const calculatePriority = (task: Partial<UnifiedTask>): "high" | "medium" | "low" => {
  if (task.dueDate && isOverdue(task.dueDate)) {
    return "high"
  }

  if (task.dueDate && isUrgent(task.dueDate)) {
    return "medium"
  }

  return "low"
}

// Helper function to get all tasks from local storage
const getTasksFromStorage = (): UnifiedTask[] => {
  const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY)
  return tasksJson ? JSON.parse(tasksJson) : []
}

// Helper function to save tasks to local storage
const saveTasksToStorage = (tasks: UnifiedTask[]): void => {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
}

// API for task management
export const unifiedApi = {
  // Get all tasks
  getAll: async (): Promise<UnifiedTask[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const tasks = getTasksFromStorage()

    // Update status based on due date
    return tasks.map((task) => {
      if (task.status !== "completed" && isOverdue(task.dueDate)) {
        return { ...task, status: "overdue" }
      }
      return task
    })
  },

  // Get a single task by ID
  getById: async (id: string): Promise<UnifiedTask | null> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const tasks = getTasksFromStorage()
    return tasks.find((task) => String(task.id) === id) || null
  },

  // Create a new task
  create: async (task: Omit<UnifiedTask, "id">): Promise<UnifiedTask> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const tasks = getTasksFromStorage()

    // Calculate priority and status
    const priority = calculatePriority(task)
    const status = task.done ? "completed" : isOverdue(task.dueDate) ? "overdue" : "incomplete"

    // Create new task with ID
    const newTask: UnifiedTask = {
      ...task,
      id: generateId(),
      priority,
      status,
      isUrgent: isUrgent(task.dueDate),
    }

    // Add to tasks and save
    tasks.push(newTask)
    saveTasksToStorage(tasks)

    return newTask
  },

  // Update an existing task
  update: async (id: string, updates: Partial<UnifiedTask>): Promise<UnifiedTask | null> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const tasks = getTasksFromStorage()
    const taskIndex = tasks.findIndex((task) => String(task.id) === id)

    if (taskIndex === -1) {
      return null
    }

    // Calculate new priority if due date changed
    let priority = tasks[taskIndex].priority
    if (updates.dueDate) {
      priority = calculatePriority({ ...tasks[taskIndex], ...updates })
    }

    // Update status if done state changed
    let status = tasks[taskIndex].status
    if (updates.done !== undefined) {
      status = updates.done ? "completed" : isOverdue(tasks[taskIndex].dueDate) ? "overdue" : "incomplete"
    } else if (updates.dueDate) {
      status = tasks[taskIndex].done ? "completed" : isOverdue(updates.dueDate) ? "overdue" : "incomplete"
    }

    // Update task
    const updatedTask: UnifiedTask = {
      ...tasks[taskIndex],
      ...updates,
      priority,
      status,
      isUrgent: updates.dueDate ? isUrgent(updates.dueDate) : tasks[taskIndex].isUrgent,
    }

    tasks[taskIndex] = updatedTask
    saveTasksToStorage(tasks)

    return updatedTask
  },

  // Update task status
  updateStatus: async (id: string, status: "DONE" | "PENDING"): Promise<UnifiedTask | null> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const tasks = getTasksFromStorage()
    const taskIndex = tasks.findIndex((task) => String(task.id) === id)

    if (taskIndex === -1) {
      return null
    }

    // Update task status
    const done = status === "DONE"
    const newStatus = done ? "completed" : isOverdue(tasks[taskIndex].dueDate) ? "overdue" : "incomplete"

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      done,
      status: newStatus,
    }

    saveTasksToStorage(tasks)

    return tasks[taskIndex]
  },

  // Delete a task
  delete: async (id: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const tasks = getTasksFromStorage()
    const filteredTasks = tasks.filter((task) => String(task.id) !== id)

    if (filteredTasks.length === tasks.length) {
      return false
    }

    saveTasksToStorage(filteredTasks)
    return true
  },
}
