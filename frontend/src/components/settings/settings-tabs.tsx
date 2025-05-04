"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "./profile-settings"
import { NotificationPreferences } from "./notification-preferences"
import { SystemSettings } from "./system-settings"
import { AppearanceSettings } from "./appearance-settings"
import { SecuritySettings } from "./security-settings"
import { IntegrationSettings } from "./integration-settings"
import { DataManagement } from "./data-management"

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid grid-cols-2 md:grid-cols-7 gap-2">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="system">System</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
        <TabsTrigger value="data">Data</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="space-y-4">
        <ProfileSettings />
      </TabsContent>
      <TabsContent value="notifications" className="space-y-4">
        <NotificationPreferences />
      </TabsContent>
      <TabsContent value="system" className="space-y-4">
        <SystemSettings />
      </TabsContent>
      <TabsContent value="appearance" className="space-y-4">
        <AppearanceSettings />
      </TabsContent>
      <TabsContent value="security" className="space-y-4">
        <SecuritySettings />
      </TabsContent>
      <TabsContent value="integrations" className="space-y-4">
        <IntegrationSettings />
      </TabsContent>
      <TabsContent value="data" className="space-y-4">
        <DataManagement />
      </TabsContent>
    </Tabs>
  )
}
