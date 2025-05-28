import { useState } from "react"
import type { ReminderFormData } from "@/components/manage-reminder/reminder-form"
import ReminderForm from "@/components/manage-reminder/reminder-form"
import { useNavigate } from "react-router-dom"

export default function ManageReminderPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<ReminderFormData>({
    title: "",
    date: "",
    frequency: "no-repeat",
    details: "",
    link: "",
    password: "",
    username: "",
    impact: "",
    hasLogin: false,
  })

  const [hasLogin, setHasLogin] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitSuccess = () => {
    // Reset form
    setFormData({
      title: "",
      date: "",
      frequency: "no-repeat",
      details: "",
      link: "",
      password: "",
      username: "",
      impact: "",
      hasLogin: false,
    })
    // Redirect after short delay to allow toast to show
    setTimeout(() => {
      navigate("/dashboard")
    }, 1500)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold text-[#2c3e50] mb-6">
            สร้างการแจ้งเตือนใหม่
          </h1>
          <ReminderForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            hasLogin={hasLogin}
            setHasLogin={setHasLogin}
            onSubmit={handleSubmitSuccess}
          />
        </div>
      </div>
    </div>
  )
}
