import { NotificationsHeader } from "@/components/notifications/notifications-header"
import { NotificationsTable } from "@/components/notifications/notifications-table"
import { NotificationStats } from "@/components/notifications/notification-stats"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <NotificationsHeader />
      <NotificationStats />
      <NotificationsTable />
    </div>
  )
}
