"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, AlertCircle, FileSpreadsheet, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import AppLayout from "@/components/layout/app-layout"
import { toast } from "sonner"
import * as XLSX from 'xlsx'

interface EmployeeRow {
  employeeCode: string
  firstName: string
  lastName: string
  nickname?: string
  position: string
  email: string
  department: string
}

interface DuplicateEmployee {
  employeeCode: string
  email: string
}

interface ImportResponse {
  imported: number
}

interface CheckDuplicatesResponse {
  duplicates: DuplicateEmployee[]
}

type ExcelRow = Record<string, string | number | boolean | null>

export default function ImportEmployeesPage() {
  const navigate = useNavigate()
  const [isUploading, setIsUploading] = useState(false)
  const [previewData, setPreviewData] = useState<EmployeeRow[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const validateRow = (row: ExcelRow, rowIndex: number): { isValid: boolean; error?: string } => {
    if (!row.employeeCode) return { isValid: false, error: `แถวที่ ${rowIndex + 1}: ไม่มีรหัสพนักงาน` }
    if (!row.firstName) return { isValid: false, error: `แถวที่ ${rowIndex + 1}: ไม่มีชื่อพนักงาน` }
    if (!row.lastName) return { isValid: false, error: `แถวที่ ${rowIndex + 1}: ไม่มีนามสกุลพนักงาน` }
    if (!row.email) return { isValid: false, error: `แถวที่ ${rowIndex + 1}: ไม่มีอีเมลพนักงาน` }
    if (!row.position) return { isValid: false, error: `แถวที่ ${rowIndex + 1}: ไม่มีตำแหน่งพนักงาน` }
    if (!row.department) return { isValid: false, error: `แถวที่ ${rowIndex + 1}: ไม่มีแผนกพนักงาน` }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(row.email.toString())) {
      return { isValid: false, error: `แถวที่ ${rowIndex + 1}: รูปแบบอีเมลไม่ถูกต้อง` }
    }

    return { isValid: true }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('ขนาดไฟล์เกิน 10MB')
      return
    }

    try {
      setIsUploading(true)
      setErrors([])
      const data = await readExcelFile(file)
      
      // Validate data
      const errors: string[] = []
      const validData = data.map((row: ExcelRow, index: number) => {
        const validation = validateRow(row, index)
        if (!validation.isValid && validation.error) {
          errors.push(validation.error)
        }
        return row as unknown as EmployeeRow
      })

      if (errors.length > 0) {
        setErrors(errors)
        toast.error(`พบข้อผิดพลาด ${errors.length} รายการ`)
      } else {
        setPreviewData(validData)
        toast.success(`อ่านข้อมูลสำเร็จ: ${validData.length} รายการ`)
      }
    } catch (error) {
      console.error('Error reading file:', error)
      toast.error('ไม่สามารถอ่านไฟล์ได้')
    } finally {
      setIsUploading(false)
    }
  }

  const readExcelFile = (file: File): Promise<ExcelRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const firstSheet = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheet]
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[]
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = (error) => reject(error)
      reader.readAsBinaryString(file)
    })
  }

  const handleImport = async () => {
    if (previewData.length === 0) {
      toast.error('ไม่มีข้อมูลที่จะนำเข้า')
      return
    }

    const loadingToast = toast.loading('กำลังตรวจสอบและนำเข้าข้อมูล...')
    
    try {
      // ตรวจสอบข้อมูลซ้ำก่อนนำเข้า
      const response = await fetch('/api/employees/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCodes: previewData.map(emp => emp.employeeCode),
          emails: previewData.map(emp => emp.email)
        })
      })

      const { duplicates } = await response.json() as CheckDuplicatesResponse
      
      if (duplicates && duplicates.length > 0) {
        toast.dismiss(loadingToast)
        toast.error(`พบข้อมูลซ้ำ ${duplicates.length} รายการ`)
        
        // แสดงข้อมูลที่ซ้ำ
        setErrors(duplicates.map(dup => 
          `พบข้อมูลซ้ำ: ${dup.employeeCode} - ${dup.email}`
        ))
        return
      }

      // ถ้าไม่มีข้อมูลซ้ำ ทำการนำเข้าข้อมูล
      const importResponse = await fetch('/api/employees/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: previewData })
      })

      if (!importResponse.ok) throw new Error('Import failed')

      const result = await importResponse.json() as ImportResponse
      toast.dismiss(loadingToast)
      toast.success(`นำเข้าข้อมูลสำเร็จ: ${result.imported} รายการ`)
      setPreviewData([])
      setErrors([])
      
      // Navigate back to team management after successful import
      navigate('/add-team')
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error importing data:', error)
      toast.error('ไม่สามารถนำเข้าข้อมูลได้')
    }
  }

  return (
    <AppLayout title="นำเข้าพนักงานจาก Excel" description="นำเข้ารายชื่อพนักงานจากไฟล์ Excel">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/add-team')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          กลับไปหน้าจัดการทีม
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-red-700" />
              นำเข้าข้อมูลพนักงาน
            </CardTitle>
            <CardDescription>
              นำเข้ารายชื่อพนักงานผ่านไฟล์ Excel ตามรูปแบบที่กำหนด
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>คำแนะนำการนำเข้าข้อมูล</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>ไฟล์ Excel ต้องประกอบด้วยคอลัมน์: รหัสพนักงาน, ชื่อ, นามสกุล, ชื่อเล่น (ถ้ามี), ตำแหน่ง, อีเมล, แผนก</li>
                  <li>ขนาดไฟล์ไม่เกิน 10MB</li>
                  <li>รองรับไฟล์ .xlsx และ .xls เท่านั้น</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* File Upload */}
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <span className="text-gray-600">
                  {isUploading ? 'กำลังอัพโหลด...' : 'คลิกเพื่อเลือกไฟล์ Excel'}
                </span>
                <span className="text-sm text-gray-500 mt-1">
                  รองรับไฟล์ .xlsx, .xls
                </span>
              </label>
            </div>

            {/* Validation Errors */}
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>พบข้อผิดพลาดในไฟล์</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Preview Table */}
            {previewData.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">ตัวอย่างข้อมูล</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัสพนักงาน</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">นามสกุล</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อเล่น</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ตำแหน่ง</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">อีเมล</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">แผนก</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.slice(0, 5).map((employee, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{employee.employeeCode}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{employee.firstName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{employee.lastName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{employee.nickname || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{employee.position}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{employee.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{employee.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  แสดง 5 รายการแรกจากทั้งหมด {previewData.length} รายการ
                </div>
              </div>
            )}
          </CardContent>
          
          {/* Footer */}
          {previewData.length > 0 && (
            <CardFooter className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/add-team')}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleImport}
                disabled={previewData.length === 0 || isUploading}
                className="bg-red-700 hover:bg-red-800 text-white"
              >
                {isUploading ? 'กำลังนำเข้าข้อมูล...' : 'นำเข้าข้อมูล'}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}
