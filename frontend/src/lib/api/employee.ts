// employee.ts
import api from '../api'
import type { Employee } from '@/components/types/team'

// API Types
interface EmployeeResponse {
  id: string
  email: string
  employeeProfile: {
    firstName: string
    lastName: string
    employeeCode: string
    nickname?: string
    department?: string
    position?: string
  }
}

// Transform backend response to frontend Employee type
const transformEmployeeResponse = (employee: EmployeeResponse): Employee => ({
  id: employee.id,
  name: `${employee.employeeProfile.firstName} ${employee.employeeProfile.lastName}`,
  firstName: employee.employeeProfile.firstName,
  lastName: employee.employeeProfile.lastName,
  employeeCode: employee.employeeProfile.employeeCode,
  nickname: employee.employeeProfile.nickname,
  department: employee.employeeProfile.department || "",
  position: employee.employeeProfile.position || "",
  email: employee.email
})

export const employeeApi = {
  // List all employees
  list: () => 
    api.get<{ data: EmployeeResponse[] }>('/employees').then(r => ({
      data: r.data.data.map(transformEmployeeResponse)
    })),

  // Search employees
  search: (query: string) =>
    api.get<{ data: EmployeeResponse[] }>(`/employees/search`, {
      params: { query }
    }).then(r => ({
      data: r.data.data.map(transformEmployeeResponse)
    })),

  // Get employee by ID
  get: (id: string) =>
    api.get<EmployeeResponse>(`/employees/${id}`).then(r => transformEmployeeResponse(r.data))
}
