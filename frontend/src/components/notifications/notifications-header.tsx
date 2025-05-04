import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CreateNotificationDialog } from "./create-notification-dialog"

export function NotificationsHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Create, manage, and track all your notifications</p>
      </div>
      <CreateNotificationDialog>
        <Button className="bg-[#E2001A] hover:bg-[#C0001A] text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Notification
        </Button>
      </CreateNotificationDialog>
    </div>
  )
}
