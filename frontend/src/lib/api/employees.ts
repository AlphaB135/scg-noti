// employees.ts
import api from '../real-api'

export interface Employee {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  nickname?: string
  position?: string
  email: string
  status: string
  role: string
  department?: string
  name?: string
}

export interface PaginationParams {
  page?: number
  size?: number
  sortBy?: 'firstName' | 'lastName' | 'employeeCode'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

export type EmployeeResponse = PaginatedResponse<Employee>

export const employeesApi = {
  // List all employees
  list: (params: PaginationParams = { page: 1, size: 20 }): Promise<EmployeeResponse> =>
    api.get('/employees', { params }).then(r => r.data),

  // Search employees
  search: (query: string) => 
    api.get<EmployeeResponse>(`/employees/search?query=${encodeURIComponent(query)}`)
}
