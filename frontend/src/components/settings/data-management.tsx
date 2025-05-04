"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { simulateApiDelay } from "@/lib/mock-data"
import { AlertCircle, ArrowDownToLine, ArrowUpFromLine, Calendar, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

export function DataManagement() {
  const [isLoading, setIsLoading] = useState(false)
  const [exportFormat, setExportFormat] = useState("json")
  const [exportProgress, setExportProgress] = useState(0)
  const [importProgress, setImportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i)
        await simulateApiDelay(300)
      }

      toast.success("Data exported successfully")

      // Simulate download
      setTimeout(() => {
        const link = document.createElement("a")
        link.href = "#"
        link.download = `scg-notifications-export-${new Date().toISOString().split("T")[0]}.${exportFormat}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }, 500)
    } catch (error) {
      toast.error("Failed to export data")
      console.error(error)
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const handleImport = async () => {
    setIsImporting(true)
    setImportProgress(0)

    try {
      // Simulate import progress
      for (let i = 0; i <= 100; i += 5) {
        setImportProgress(i)
        await simulateApiDelay(200)
      }

      toast.success("Data imported successfully")
    } catch (error) {
      toast.error("Failed to import data")
      console.error(error)
    } finally {
      setIsImporting(false)
      setImportProgress(0)
    }
  }

  const handlePurgeData = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await simulateApiDelay(2000)
      toast.success("Data purged successfully")
    } catch (error) {
      toast.error("Failed to purge data")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="export" className="space-y-4">
        <TabsList className="grid grid-cols-3 gap-2">
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="purge">Purge Data</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Export your notification data for backup or migration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="export-format">Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger id="export-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data to Export</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-notifications" defaultChecked />
                    <Label htmlFor="export-notifications">Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-approvals" defaultChecked />
                    <Label htmlFor="export-approvals">Approval Logs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-users" defaultChecked />
                    <Label htmlFor="export-users">User Data</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-settings" />
                    <Label htmlFor="export-settings">System Settings</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="export-start-date" className="text-xs">
                      Start Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="export-start-date"
                        type="date"
                        className="pl-8"
                        defaultValue={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="export-end-date" className="text-xs">
                      End Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="export-end-date"
                        type="date"
                        className="pl-8"
                        defaultValue={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isExporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Export Progress</Label>
                    <span className="text-sm">{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-[#E2001A] hover:bg-[#C0001A] text-white"
              >
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export Data"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>Import notification data from a file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Importing data will merge with existing data. Make sure your import file is in the correct format.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="import-file">Import File</Label>
                <Input id="import-file" type="file" />
                <p className="text-xs text-muted-foreground">Supported formats: JSON, CSV, XLSX</p>
              </div>

              <div className="space-y-2">
                <Label>Import Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="import-overwrite" />
                    <Label htmlFor="import-overwrite">Overwrite existing data</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="import-validate" defaultChecked />
                    <Label htmlFor="import-validate">Validate before importing</Label>
                  </div>
                </div>
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Import Progress</Label>
                    <span className="text-sm">{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="bg-[#E2001A] hover:bg-[#C0001A] text-white"
              >
                <ArrowUpFromLine className="mr-2 h-4 w-4" />
                {isImporting ? "Importing..." : "Import Data"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="purge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purge Data</CardTitle>
              <CardDescription>Permanently delete old or unnecessary data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This action is irreversible. Purged data cannot be recovered. Consider exporting a backup before
                  proceeding.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Data to Purge</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="purge-notifications" />
                    <Label htmlFor="purge-notifications">Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="purge-approvals" />
                    <Label htmlFor="purge-approvals">Approval Logs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="purge-activity" />
                    <Label htmlFor="purge-activity">Activity Logs</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purge-older-than">Purge Data Older Than</Label>
                <Select defaultValue="90">
                  <SelectTrigger id="purge-older-than">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">6 months</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="all">All data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purge-confirmation">Type "PURGE" to confirm</Label>
                <Input id="purge-confirmation" placeholder="PURGE" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="destructive" onClick={handlePurgeData} disabled={isLoading}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isLoading ? "Purging..." : "Purge Data"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
