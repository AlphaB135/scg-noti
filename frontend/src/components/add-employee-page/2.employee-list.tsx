import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface EmployeeListProps {
  filteredEmployees: Employee[]
  departments: string[]
  activeTab: string
  setActiveTab: (tab: string) => void
  handleSelectAll: () => void
  handleEmployeeSelection: (id: string) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function EmployeeList({
  filteredEmployees,
  departments,
  activeTab,
  setActiveTab,
  handleSelectAll,
  handleEmployeeSelection,
  currentPage,
  totalPages,
  onPageChange,
}: EmployeeListProps) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
          {departments.map((dept) => (
            <TabsTrigger key={dept} value={dept}>
              {dept}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="m-0">
          <EmployeeTable
            employees={filteredEmployees}
            handleSelectAll={handleSelectAll}
            handleEmployeeSelection={handleEmployeeSelection}
            allSelected={filteredEmployees.length > 0 && filteredEmployees.every((emp) => emp.selected)}
          />
        </TabsContent>

        {departments.map((dept) => (
          <TabsContent key={dept} value={dept} className="m-0">
            <EmployeeTable
              employees={filteredEmployees.filter((emp) => emp.department === dept)}
              handleSelectAll={() => {
                const allSelected = filteredEmployees
                  .filter((emp) => emp.department === dept)
                  .every((emp) => emp.selected)
                handleSelectAll()
              }}
              handleEmployeeSelection={handleEmployeeSelection}
              allSelected={
                filteredEmployees.filter((emp) => emp.department === dept).length > 0 &&
                filteredEmployees.filter((emp) => emp.department === dept).every((emp) => emp.selected)
              }
              departmentName={dept}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      )}
    </div>
  )
}