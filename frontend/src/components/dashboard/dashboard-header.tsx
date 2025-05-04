import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Here's an overview of your notification system</p>
      </div>
      <Button asChild className="bg-[#E2001A] hover:bg-[#C0001A] text-white">
        <Link href="/notifications">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Notification
        </Link>
      </Button>
    </div>
  )
}
