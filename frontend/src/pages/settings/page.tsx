"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import settings components
import ProfileSettings from "@/components/settings/profile-settings"
import NotificationPreferences from "@/components/settings/notification-preferences"
import SystemSettings from "@/components/settings/system-settings"
import AppearanceSettings from "@/components/settings/appearance-settings"
import SecuritySettings from "@/components/settings/security-settings"
import IntegrationSettings from "@/components/settings/integration-settings"
import DataManagement from "@/components/settings/data-management"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <AppLayout title="การตั้งค่า" description="จัดการการตั้งค่าบัญชีของคุณและปรับแต่งการตั้งค่าระบบ">
      <div className="mt-4">
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-7 gap-2">
            <TabsTrigger value="profile" className="font-noto">
              โปรไฟล์
            </TabsTrigger>
            <TabsTrigger value="notifications" className="font-noto">
              การแจ้งเตือน
            </TabsTrigger>
            <TabsTrigger value="system" className="font-noto">
              ระบบ
            </TabsTrigger>
            <TabsTrigger value="appearance" className="font-noto">
              ลักษณะ
            </TabsTrigger>
            <TabsTrigger value="security" className="font-noto">
              ความปลอดภัย
            </TabsTrigger>
            <TabsTrigger value="integrations" className="font-noto">
              การเชื่อมต่อ
            </TabsTrigger>
            <TabsTrigger value="data" className="font-noto">
              ข้อมูล
            </TabsTrigger>
          </TabsList>

          {/* ===== PROFILE SETTINGS ===== */}
          <TabsContent value="profile" className="space-y-4">
            <ProfileSettings />
          </TabsContent>

          {/* ===== NOTIFICATION SETTINGS ===== */}
          <TabsContent value="notifications" className="space-y-4">
            <NotificationPreferences />
          </TabsContent>

          {/* ===== SYSTEM SETTINGS ===== */}
          <TabsContent value="system" className="space-y-4">
            <SystemSettings />
          </TabsContent>

          {/* ===== APPEARANCE SETTINGS ===== */}
          <TabsContent value="appearance" className="space-y-4">
            <AppearanceSettings />
          </TabsContent>

          {/* ===== SECURITY SETTINGS ===== */}
          <TabsContent value="security" className="space-y-4">
            <SecuritySettings />
          </TabsContent>

          {/* ===== INTEGRATION SETTINGS ===== */}
          <TabsContent value="integrations" className="space-y-4">
            <IntegrationSettings />
          </TabsContent>

          {/* ===== DATA MANAGEMENT ===== */}
          <TabsContent value="data" className="space-y-4">
            <DataManagement />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
