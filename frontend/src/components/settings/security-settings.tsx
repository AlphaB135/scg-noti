"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { simulateApiDelay } from "@/lib/mock-data"
import { AlertCircle, Check, Copy, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export function SecuritySettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [apiKey, setApiKey] = useState("scg_api_" + Math.random().toString(36).substring(2, 15))

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: z.infer<typeof passwordSchema>) {
    setIsLoading(true)

    try {
      // Simulate API call
      await simulateApiDelay(1000)
      toast.success("Password changed successfully")
      form.reset()
    } catch (error) {
      toast.error("Failed to change password")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwoFactorToggle = async (checked: boolean) => {
    setTwoFactorEnabled(checked)
    if (checked) {
      setShowTwoFactorSetup(true)
    } else {
      setShowTwoFactorSetup(false)
      toast.success("Two-factor authentication disabled")
    }
  }

  const regenerateApiKey = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await simulateApiDelay(1000)
      setApiKey("scg_api_" + Math.random().toString(36).substring(2, 15))
      toast.success("API key regenerated successfully")
    } catch (error) {
      toast.error("Failed to regenerate API key")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    toast.success("API key copied to clipboard")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 8 characters and include uppercase, lowercase, number, and special
                      character.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="bg-[#E2001A] hover:bg-[#C0001A] text-white">
                {isLoading ? "Changing Password..." : "Change Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Require a verification code when logging in</p>
            </div>
            <Switch id="two-factor" checked={twoFactorEnabled} onCheckedChange={handleTwoFactorToggle} />
          </div>

          {showTwoFactorSetup && (
            <div className="mt-4 space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Setup Required</AlertTitle>
                <AlertDescription>
                  Scan the QR code below with your authenticator app to set up two-factor authentication.
                </AlertDescription>
              </Alert>

              <div className="flex justify-center p-4">
                <div className="border p-4 bg-white">
                  <img
                    src="/placeholder.svg?height=200&width=200"
                    alt="Two-factor authentication QR code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <div className="flex gap-2">
                  <Input id="verification-code" placeholder="Enter the 6-digit code" maxLength={6} />
                  <Button className="bg-[#E2001A] hover:bg-[#C0001A] text-white">
                    <Check className="mr-2 h-4 w-4" />
                    Verify
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                If you lose access to your authenticator app, you will need to contact support to regain access to your
                account.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>Manage API keys for programmatic access to the system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <Input id="api-key" value={apiKey} readOnly className="font-mono" />
              <Button variant="outline" size="icon" onClick={copyApiKey}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This key grants full access to the API. Keep it secure and do not share it.
            </p>
          </div>

          <Button variant="outline" onClick={regenerateApiKey} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate API Key
          </Button>

          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Regenerating your API key will invalidate the existing key and may break integrations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login Sessions</CardTitle>
          <CardDescription>Manage your active login sessions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="rounded-md border">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">Chrome on Windows • Bangkok, Thailand</p>
                  <p className="text-xs text-muted-foreground mt-1">Started 2 hours ago • IP: 192.168.1.1</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="border-t p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">Mobile App</p>
                  <p className="text-sm text-muted-foreground">iPhone • Bangkok, Thailand</p>
                  <p className="text-xs text-muted-foreground mt-1">Started 3 days ago • IP: 192.168.2.2</p>
                </div>
                <Button variant="outline" size="sm" className="text-red-500">
                  Revoke
                </Button>
              </div>
            </div>

            <Button variant="destructive">Revoke All Other Sessions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
