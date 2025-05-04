"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { simulateApiDelay } from "@/lib/mock-data"
import { useTheme } from "next-themes"

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  // Appearance settings state
  const [density, setDensity] = useState("comfortable")
  const [fontSize, setFontSize] = useState(16)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [accentColor, setAccentColor] = useState("red")

  async function handleSave() {
    setIsLoading(true)

    try {
      // Simulate API call
      await simulateApiDelay(1000)
      toast.success("Appearance settings saved")
    } catch (error) {
      toast.error("Failed to save appearance settings")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Color Theme</Label>
            <RadioGroup value={theme || "light"} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
              <div>
                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-100 hover:text-accent-foreground peer-data-[state=checked]:border-[#E2001A] [&:has([data-state=checked])]:border-[#E2001A]"
                >
                  <div className="mb-2 rounded-md bg-white p-1 shadow-sm border">
                    <div className="space-y-2">
                      <div className="h-2 w-[80px] rounded-lg bg-[#E2001A]" />
                      <div className="h-2 w-[100px] rounded-lg bg-gray-200" />
                      <div className="h-2 w-[60px] rounded-lg bg-gray-200" />
                    </div>
                  </div>
                  <span>Light</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gray-950 p-4 hover:bg-gray-900 hover:text-accent-foreground peer-data-[state=checked]:border-[#E2001A] [&:has([data-state=checked])]:border-[#E2001A]"
                >
                  <div className="mb-2 rounded-md bg-gray-800 p-1 shadow-sm border border-gray-700">
                    <div className="space-y-2">
                      <div className="h-2 w-[80px] rounded-lg bg-[#E2001A]" />
                      <div className="h-2 w-[100px] rounded-lg bg-gray-600" />
                      <div className="h-2 w-[60px] rounded-lg bg-gray-600" />
                    </div>
                  </div>
                  <span className="text-white">Dark</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gradient-to-r from-white to-gray-950 p-4 hover:bg-gray-100 hover:text-accent-foreground peer-data-[state=checked]:border-[#E2001A] [&:has([data-state=checked])]:border-[#E2001A]"
                >
                  <div className="mb-2 rounded-md bg-gradient-to-r from-white to-gray-800 p-1 shadow-sm border">
                    <div className="space-y-2">
                      <div className="h-2 w-[80px] rounded-lg bg-[#E2001A]" />
                      <div className="h-2 w-[100px] rounded-lg bg-gradient-to-r from-gray-200 to-gray-600" />
                      <div className="h-2 w-[60px] rounded-lg bg-gradient-to-r from-gray-200 to-gray-600" />
                    </div>
                  </div>
                  <span>System</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Accent Color</Label>
            <RadioGroup value={accentColor} onValueChange={setAccentColor} className="grid grid-cols-5 gap-2">
              <div>
                <RadioGroupItem value="red" id="red" className="peer sr-only" />
                <Label
                  htmlFor="red"
                  className="flex aspect-square items-center justify-center rounded-md border-2 border-muted bg-[#E2001A] hover:opacity-90 peer-data-[state=checked]:border-black [&:has([data-state=checked])]:border-black"
                >
                  <span className="sr-only">Red</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="blue" id="blue" className="peer sr-only" />
                <Label
                  htmlFor="blue"
                  className="flex aspect-square items-center justify-center rounded-md border-2 border-muted bg-blue-600 hover:opacity-90 peer-data-[state=checked]:border-black [&:has([data-state=checked])]:border-black"
                >
                  <span className="sr-only">Blue</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="green" id="green" className="peer sr-only" />
                <Label
                  htmlFor="green"
                  className="flex aspect-square items-center justify-center rounded-md border-2 border-muted bg-green-600 hover:opacity-90 peer-data-[state=checked]:border-black [&:has([data-state=checked])]:border-black"
                >
                  <span className="sr-only">Green</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="purple" id="purple" className="peer sr-only" />
                <Label
                  htmlFor="purple"
                  className="flex aspect-square items-center justify-center rounded-md border-2 border-muted bg-purple-600 hover:opacity-90 peer-data-[state=checked]:border-black [&:has([data-state=checked])]:border-black"
                >
                  <span className="sr-only">Purple</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="orange" id="orange" className="peer sr-only" />
                <Label
                  htmlFor="orange"
                  className="flex aspect-square items-center justify-center rounded-md border-2 border-muted bg-orange-500 hover:opacity-90 peer-data-[state=checked]:border-black [&:has([data-state=checked])]:border-black"
                >
                  <span className="sr-only">Orange</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Interface Density</Label>
            <RadioGroup value={density} onValueChange={setDensity} className="grid grid-cols-3 gap-4">
              <div>
                <RadioGroupItem value="compact" id="compact" className="peer sr-only" />
                <Label
                  htmlFor="compact"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-gray-100 hover:text-accent-foreground peer-data-[state=checked]:border-[#E2001A] [&:has([data-state=checked])]:border-[#E2001A]"
                >
                  <div className="mb-2 space-y-1">
                    <div className="h-1.5 w-[80px] rounded-lg bg-gray-300" />
                    <div className="h-1.5 w-[100px] rounded-lg bg-gray-300" />
                    <div className="h-1.5 w-[60px] rounded-lg bg-gray-300" />
                  </div>
                  <span>Compact</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="comfortable" id="comfortable" className="peer sr-only" />
                <Label
                  htmlFor="comfortable"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-gray-100 hover:text-accent-foreground peer-data-[state=checked]:border-[#E2001A] [&:has([data-state=checked])]:border-[#E2001A]"
                >
                  <div className="mb-2 space-y-2">
                    <div className="h-2 w-[80px] rounded-lg bg-gray-300" />
                    <div className="h-2 w-[100px] rounded-lg bg-gray-300" />
                    <div className="h-2 w-[60px] rounded-lg bg-gray-300" />
                  </div>
                  <span>Comfortable</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="spacious" id="spacious" className="peer sr-only" />
                <Label
                  htmlFor="spacious"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-gray-100 hover:text-accent-foreground peer-data-[state=checked]:border-[#E2001A] [&:has([data-state=checked])]:border-[#E2001A]"
                >
                  <div className="mb-2 space-y-3">
                    <div className="h-2.5 w-[80px] rounded-lg bg-gray-300" />
                    <div className="h-2.5 w-[100px] rounded-lg bg-gray-300" />
                    <div className="h-2.5 w-[60px] rounded-lg bg-gray-300" />
                  </div>
                  <span>Spacious</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="font-size">Font Size ({fontSize}px)</Label>
              </div>
              <Slider
                id="font-size"
                min={12}
                max={20}
                step={1}
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="animations">Enable Animations</Label>
                <p className="text-sm text-muted-foreground">Show animations and transitions in the interface</p>
              </div>
              <Switch id="animations" checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sidebar-collapsed">Sidebar Collapsed by Default</Label>
                <p className="text-sm text-muted-foreground">Start with the sidebar collapsed when you log in</p>
              </div>
              <Switch id="sidebar-collapsed" checked={sidebarCollapsed} onCheckedChange={setSidebarCollapsed} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading} className="bg-[#E2001A] hover:bg-[#C0001A] text-white">
            {isLoading ? "Saving..." : "Save Appearance"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
