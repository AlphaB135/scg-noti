import { DashboardStats }      from '@/components/dashboard/dashboard-stats'
import { DashboardHeader }     from '@/components/dashboard/dashboard-header'
import { RecentNotifications } from '@/components/dashboard/recent-notifications'
import { ApprovalActivity }     from '@/components/dashboard/approval-activity'


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentNotifications />
        <ApprovalActivity />
      </div>
    </div>
  )
}
