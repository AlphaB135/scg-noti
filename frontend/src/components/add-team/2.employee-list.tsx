"use client"

import EmployeeTable from "./employee-table"
import type { Employee } from "@/lib/api/employees/index"

interface EmployeeListProps {
  filteredEmployees: (Employee & { selected?: boolean })[]
  handleSelectAll: () => void
  handleEmployeeSelection: (id: string) => void
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
  isLoading: boolean
  onLoadMore?: () => void // Optional prop for infinite scroll
}

export default function EmployeeList({
  filteredEmployees,
  handleSelectAll,
  handleEmployeeSelection,
  currentPage,
  totalPages,
  setCurrentPage,
  isLoading,
}: EmployeeListProps) {
  return (
    <div className="space-y-4 relative">
      <EmployeeTable
        employees={filteredEmployees}
        handleSelectAll={handleSelectAll}
        handleEmployeeSelection={handleEmployeeSelection}
        allSelected={
          filteredEmployees.length > 0 &&
          filteredEmployees.every((emp) => emp.selected)
        }
      />

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <div className="inline-flex border rounded overflow-hidden">
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm font-medium ${
                  page === currentPage
                    ? "bg-red-600 text-white"
                    : "hover:bg-red-100 text-gray-700"
                }`}
              >
                {page}
              </button>
            )
          })}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin h-5 w-5 border-2 border-red-700 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  )
}
