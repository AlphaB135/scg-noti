import { RPAHeader } from "@/components/rpa/rpa-header"
import { RPATriggerForm } from "@/components/rpa/rpa-trigger-form"
import { RPAStatusCard } from "@/components/rpa/rpa-status-card"

export default function RPAPage() {
  return (
    <div className="space-y-6">
      <RPAHeader />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RPATriggerForm />
        </div>
        <div className="lg:col-span-2">
          <RPAStatusCard />
        </div>
      </div>
    </div>
  )
}
