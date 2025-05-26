export interface User {
  id: string;
  email: string;
  status: string;
  role: string;
}

export interface EmployeeProfile {
  employeeCode: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  position?: string;
}

export interface Employee extends User {
  employeeProfile: EmployeeProfile;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
}

export interface EmployeeResponse extends PaginatedResponse<Employee> {}