import { ApprovalsHeader } from "@/components/approvals/approvals-header"
import { ApprovalPopupForm } from "@/components/approvals/approval-popup-form"
import { ApprovalResponseForm } from "@/components/approvals/approval-response-form"

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <ApprovalsHeader />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApprovalPopupForm />
        <ApprovalResponseForm />
      </div>
    </div>
  )
}
