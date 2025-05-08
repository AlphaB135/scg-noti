"use client"

import { useState } from "react"
import { X } from "lucide-react"

const NotificationFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      description: "",
      triggerDate: "",
      repeatInterval: "none",
      targetRoles: [],
      targetUsers: "",
      externalLink: "",
    },
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (e) => {
    const { value, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      targetRoles: checked ? [...prev.targetRoles, value] : prev.targetRoles.filter((role) => role !== value),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? "แก้ไขการแจ้งเตือน" : "สร้างการแจ้งเตือนใหม่"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หัวข้อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่แจ้งเตือน <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="triggerDate"
                value={formData.triggerDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ความถี่การแจ้งเตือน</label>
              <select
                name="repeatInterval"
                value={formData.repeatInterval}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="none">ไม่ต้องแจ้งซ้ำ</option>
                <option value="daily">ทุกวัน</option>
                <option value="weekly">ทุกสัปดาห์</option>
                <option value="monthly">ทุกเดือน</option>
                <option value="yearly">ทุกปี</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">กลุ่มผู้รับการแจ้งเตือน</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="role-admin"
                    value="ADMIN"
                    checked={formData.targetRoles.includes("ADMIN")}
                    onChange={handleRoleChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="role-admin" className="ml-2 text-sm text-gray-700">
                    ผู้ดูแลระบบ
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="role-supervisor"
                    value="SUPERVISOR"
                    checked={formData.targetRoles.includes("SUPERVISOR")}
                    onChange={handleRoleChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="role-supervisor" className="ml-2 text-sm text-gray-700">
                    หัวหน้างาน
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="role-employee"
                    value="EMPLOYEE"
                    checked={formData.targetRoles.includes("EMPLOYEE")}
                    onChange={handleRoleChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="role-employee" className="ml-2 text-sm text-gray-700">
                    พนักงานทั่วไป
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสพนักงานเฉพาะ (คั่นด้วยเครื่องหมาย ,)</label>
              <input
                type="text"
                name="targetUsers"
                value={formData.targetUsers}
                onChange={handleChange}
                placeholder="เช่น E001, E002, E003"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์ภายนอก</label>
              <input
                type="url"
                name="externalLink"
                value={formData.externalLink}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">แนบไฟล์</label>
              <input
                type="file"
                name="file"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
            >
              {initialData ? "บันทึกการแก้ไข" : "สร้างการแจ้งเตือน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NotificationFormModal
