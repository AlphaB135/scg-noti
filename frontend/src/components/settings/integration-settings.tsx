"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { simulateApiDelay } from "@/lib/mock-data"
import { AlertCircle, Check, ExternalLink, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface Integration {
  id: string
  name: string
  description: string
  connected: boolean
  status: "active" | "inactive" | "error"
  lastSync?: string
}

export function IntegrationSettings() {
  const [isLoading, setIsLoading] = useState(false)

  // Mock integrations data
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "email",
      name: "Email Service",
      description: "Send notifications via email using SMTP",
      connected: true,
      status: "active",
      lastSync: "2023-05-01T10:30:00Z",
    },
    {
      id: "sms",
      name: "SMS Gateway",
      description: "Send notifications via SMS",
      connected: false,
      status: "inactive",
    },
    {
      id: "slack",
      name: "Slack",
      description: "Send notifications to Slack channels",
      connected: true,
      status: "error",
      lastSync: "2023-04-28T14:15:00Z",
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      description: "Send notifications to Microsoft Teams channels",
      connected: false,
      status: "inactive",
    },
    {
      id: "webhook",
      name: "Webhook",
      description: "Send notifications to custom webhooks",
      connected: true,
      status: "active",
      lastSync: "2023-05-02T09:45:00Z",
    },
  ])

  const toggleIntegration = async (id: string, enabled: boolean) => {
    setIsLoading(true)

    try {
      // Simulate API call
      await simulateApiDelay(1000)

      setIntegrations(
        integrations.map((integration) =>
          integration.id === id
            ? {
                ...integration,
                connected: enabled,
                status: enabled ? "active" : "inactive",
                lastSync: enabled ? new Date().toISOString() : integration.lastSync,
              }
            : integration,
        ),
      )

      toast.success(`${enabled ? "Enabled" : "Disabled"} ${integrations.find((i) => i.id === id)?.name} integration`)
    } catch (error) {
      toast.error(`Failed to ${enabled ? "enable" : "disable"} integration`)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const syncIntegration = async (id: string) => {
    setIsLoading(true)

    try {
      // Simulate API call
      await simulateApiDelay(1500)

      setIntegrations(
        integrations.map((integration) =>
          integration.id === id
            ? {
                ...integration,
                status: "active",
                lastSync: new Date().toISOString(),
              }
            : integration,
        ),
      )

      toast.success(`Synced ${integrations.find((i) => i.id === id)?.name} integration`)
    } catch (error) {
      toast.error("Failed to sync integration")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
          <CardDescription>Configure the email service for sending notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-server">SMTP Server</Label>
              <Input id="smtp-server" defaultValue="smtp.scg.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input id="smtp-port" defaultValue="587" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-username">Username</Label>
              <Input id="smtp-username" defaultValue="notifications@scg.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-password">Password</Label>
              <Input id="smtp-password" type="password" defaultValue="••••••••••••" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="smtp-ssl">Use SSL/TLS</Label>
              <p className="text-sm text-muted-foreground">Enable secure connection for email sending</p>
            </div>
            <Switch id="smtp-ssl" defaultChecked />
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline">Test Connection</Button>

            <Button className="bg-[#E2001A] hover:bg-[#C0001A] text-white">Save Email Settings</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>External Integrations</CardTitle>
          <CardDescription>Connect with external services for notifications and data exchange.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1 mb-4 md:mb-0">
                <div className="flex items-center">
                  <h3 className="font-medium">{integration.name}</h3>
                  <div className="ml-2">{getStatusBadge(integration.status)}</div>
                </div>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
                {integration.lastSync && (
                  <p className="text-xs text-muted-foreground">
                    Last synced: {new Date(integration.lastSync).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {integration.connected && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => syncIntegration(integration.id)}
                    disabled={isLoading}
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Sync
                  </Button>
                )}

                <Button variant="outline" size="sm" disabled={isLoading}>
                  <ExternalLink className="mr-2 h-3 w-3" />
                  Configure
                </Button>

                <div className="flex items-center gap-2">
                  <Switch
                    id={`integration-${integration.id}`}
                    checked={integration.connected}
                    onCheckedChange={(checked) => toggleIntegration(integration.id, checked)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full">
            <Check className="mr-2 h-4 w-4" />
            Add New Integration
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>Configure webhooks for real-time notification delivery.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Webhooks allow external systems to receive real-time updates from the notification system. Make sure your
              endpoint is secure and can handle the expected volume of requests.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input id="webhook-url" defaultValue="https://api.example.com/webhooks/notifications" />
            <p className="text-xs text-muted-foreground">The URL that will receive webhook POST requests</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-secret">Webhook Secret</Label>
            <div className="flex gap-2">
              <Input id="webhook-secret" type="password" defaultValue="whsec_abcdefghijklmnopqrstuvwxyz" />
              <Button variant="outline" size="sm">
                Regenerate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Used to verify that requests are coming from SCG Notification System
            </p>
          </div>

          <div className="space-y-2">
            <Label>Event Types</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch id="event-notification-created" defaultChecked />
                <Label htmlFor="event-notification-created">Notification Created</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="event-notification-updated" defaultChecked />
                <Label htmlFor="event-notification-updated">Notification Updated</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="event-notification-approved" defaultChecked />
                <Label htmlFor="event-notification-approved">Notification Approved</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="event-notification-rejected" defaultChecked />
                <Label htmlFor="event-notification-rejected">Notification Rejected</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline">Test Webhook</Button>

            <Button className="bg-[#E2001A] hover:bg-[#C0001A] text-white">Save Webhook Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
