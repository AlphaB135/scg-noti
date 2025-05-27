"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/app-layout";
import {
  notificationsApi,
  approvalsApi,
  dashboardApi,
  rpaApi,
} from "@/lib/real-api";
import ReminderTabs from "@/components/manage-reminder/reminder-tabs";
import ReminderFilters from "@/components/manage-reminder/reminder-filters";
import AddReminderDialog from "@/components/manage-reminder/add-reminder-dialog";
import EditReminderDialog from "@/components/manage-reminder/edit-reminder-dialog";
import DeleteReminderDialog from "@/components/manage-reminder/delete-reminder-dialog";
import PasswordDialog from "@/components/manage-reminder/password-dialog";
import ConfettiAnimation from "@/components/ui/confetti-animation";
import {
  checkIsUrgent,
  formatThaiDate,
  getDueDateStatus,
  getFrequencyText,
  getStatusBadge,
  getTypeIcon,
} from "@/components/manage-reminder/reminder-utils";
import { useToast } from "@/hooks/use-toast";

// Convert UnifiedTask to Reminder type for the UI
type Reminder = {
  id: number | string;
  title: string;
  details: string;
  date: string;
  frequency: string;
  link?: string;
  password?: string;
  username?: string;
  impact?: string;
  status: "completed" | "incomplete" | "overdue";
  type?: string;
  isUrgent?: boolean;
  hasLogin?: boolean;
};

const convertTaskToReminder = (task: UnifiedTask): Reminder => {
  // Create password string from username and password if they exist
  let passwordData = "";
  if (task.hasLogin && (task.username || task.password)) {
    passwordData = `user: ${task.username || ""}\npassword: ${
      task.password || ""
    }`;
  }

  return {
    id: task.id,
    title: task.title,
    details: task.details,
    date: task.dueDate,
    frequency: task.frequency,
    link: task.link,
    password: passwordData,
    username: task.username,
    impact: task.impact,
    status: task.status,
    type: task.type,
    isUrgent: task.isUrgent,
    hasLogin: task.hasLogin,
  };
};

export default function ManageReminderPage() {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] =
    useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [hasLogin, setHasLogin] = useState(false);
  const [isEditPasswordAuthenticated, setIsEditPasswordAuthenticated] =
    useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successDescription, setSuccessDescription] = useState("");

  // Form state for new/edit reminder
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    frequency: "no-repeat",
    details: "",
    link: "",
    password: "",
    username: "",
    impact: "",
    hasLogin: false,
  });

  // Load reminders from API
  const loadReminders = async () => {
    setIsLoading(true);
    try {
      const response = await notificationsApi.getAll(currentPage, 20);
      const tasks = response.data; // เพราะ notificationsApi.getAll() คืน { data: [...] }
      const convertedReminders = tasks.map(convertTaskToReminder);
      setReminders(convertedReminders);

      // In a real implementation, you would get the total pages from the API response
      // For now, we'll just set it to 1 since we don't have that information
      setTotalPages(1);
    } catch (error) {
      console.error("Failed to load reminders:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลการแจ้งเตือนได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [currentPage]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Add new reminder
  const handleAddReminder = async () => {
    try {
      // ตรวจสอบว่ามีหัวข้องานอย่างน้อย
      if (!formData.title.trim()) {
        toast({
          title: "กรุณาระบุข้อมูล",
          description: "กรุณาระบุหัวข้องานอย่างน้อย",
          variant: "destructive",
        });
        return;
      }

      // Create a new task from form data
      const newTask: Omit<UnifiedTask, "id"> = {
        title: formData.title,
        details: formData.details || "ไม่มีรายละเอียด",
        dueDate: formData.date || new Date().toISOString().split("T")[0],
        status: "incomplete",
        priority: "pending", // Will be calculated by API
        done: false,
        frequency: formData.frequency as UnifiedTask["frequency"],
        impact: formData.impact || "ไม่ระบุ",
        link: formData.link,
        hasLogin: hasLogin,
        username: hasLogin ? formData.username : undefined,
        password: hasLogin ? formData.password : undefined,
        isUrgent: formData.date ? checkIsUrgent(formData.date) : false,
        type: typeFilter !== "all" ? typeFilter : undefined,
      };

      // Create the task via API
      await unifiedApi.create(newTask);

      // Reload reminders to get the updated list
      await loadReminders();

      // Close dialog
      setIsAddDialogOpen(false);

      // Set success message and show confetti
      setSuccessTitle("สร้างการแจ้งเตือนสำเร็จ!");
      setSuccessDescription(
        `การแจ้งเตือน "${formData.title}" ถูกสร้างเรียบร้อยแล้ว`
      );
      setShowConfetti(true);

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Failed to create reminder:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างการแจ้งเตือนได้",
        variant: "destructive",
      });

      // Close dialog in case of error
      setIsAddDialogOpen(false);
    }
  };

  // Edit reminder
  const handleEditReminder = async () => {
    if (!currentReminder) return;

    try {
      // Create updated task from form data
      const updatedTask: Partial<UnifiedTask> = {
        title: formData.title || currentReminder.title,
        details: formData.details || "ไม่มีรายละเอียด",
        dueDate: formData.date || currentReminder.date,
        frequency: formData.frequency as UnifiedTask["frequency"],
        impact: formData.impact || "ไม่ระบุ",
        link: formData.link,
        hasLogin: hasLogin,
        username: hasLogin ? formData.username : undefined,
        password: hasLogin ? formData.password : undefined,
      };

      // Update the task via API
      await unifiedApi.update(String(currentReminder.id), updatedTask);

      // Reload reminders to get the updated list
      await loadReminders();

      // Show success toast
      toast({
        title: "แก้ไขการแจ้งเตือนสำเร็จ",
        description: `แก้ไขการแจ้งเตือน "${formData.title}" เรียบร้อยแล้ว`,
      });

      // Close dialog and reset form
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to update reminder:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขการแจ้งเตือนได้",
        variant: "destructive",
      });
    }
  };

  // Delete reminder
  const handleDeleteReminder = async () => {
    if (!currentReminder) return;

    try {
      // Delete the task via API
      await unifiedApi.delete(String(currentReminder.id));

      // Reload reminders to get the updated list
      await loadReminders();

      // Show success toast
      toast({
        title: "ลบการแจ้งเตือนสำเร็จ",
        description: `ลบการแจ้งเตือน "${currentReminder.title}" เรียบร้อยแล้ว`,
      });

      // Close dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete reminder:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบการแจ้งเตือนได้",
        variant: "destructive",
      });
    }
  };

  // Open edit dialog and set current reminder
  const openEditDialog = (reminder: Reminder) => {
    setCurrentReminder(reminder);

    // Set hasLogin flag based on whether password exists
    const hasLoginValue = reminder.hasLogin || false;
    setHasLogin(hasLoginValue);

    // Extract username and password from the reminder's password field
    let username = reminder.username || "";
    let password = "";

    if (reminder.password) {
      const passwordLines = reminder.password.split("\n");

      for (const line of passwordLines) {
        if (line.toLowerCase().startsWith("User:")) {
          username = line.substring(line.indexOf(":") + 1).trim();
        } else if (line.toLowerCase().startsWith("Password:")) {
          password = line.substring(line.indexOf(":") + 1).trim();
        }
      }
    }

    // Initialize form data
    setFormData({
      title: reminder.title,
      date: reminder.date,
      frequency: reminder.frequency,
      details: reminder.details,
      link: reminder.link || "",
      username: username,
      password: password,
      impact: reminder.impact || "",
      hasLogin: hasLoginValue,
    });

    // If there's password data, we'll need authentication
    if (hasLoginValue) {
      setIsPasswordVisible(false);
      setIsEditPasswordAuthenticated(false);
      setIsEditDialogOpen(true);
    } else {
      // If no password data, just open the edit dialog normally
      setIsEditPasswordAuthenticated(true);
      setIsEditDialogOpen(true);
    }
  };

  // Handle authentication for editing password
  const handleEditAuthenticate = () => {
    // In a real system, verify the password against backend
    // For this example, we'll just accept any password
    setIsEditPasswordAuthenticated(true);
    toast({
      title: "ยืนยันตัวตนสำเร็จ",
      description: "คุณสามารถแก้ไขข้อมูลล็อกอินได้แล้ว",
    });
  };

  // Open delete dialog and set current reminder
  const openDeleteDialog = (reminder: Reminder) => {
    setCurrentReminder(reminder);
    setIsDeleteDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      date: new Date().toISOString().split("T")[0],
      frequency: "no-repeat",
      details: "",
      link: "",
      password: "",
      username: "",
      impact: "",
      hasLogin: false,
    });
    setHasLogin(false);
    setCurrentReminder(null);
    setIsEditPasswordAuthenticated(false);
  };

  // Handle authentication for viewing password
  const handleAuthenticate = () => {
    // ในระบบจริงควรมีการตรวจสอบรหัสผ่านกับ backend
    // สำหรับตัวอย่างนี้จะแสดงรหัสผ่านเมื่อกดปุ่มยืนยัน
    setIsPasswordVisible(true);
    toast({
      title: "ยืนยันตัวตนสำเร็จ",
      description: "คุณสามารถดูข้อมูลล็อกอินได้แล้ว",
    });
  };

  // Toggle reminder status
  const toggleReminderStatus = async (reminder: Reminder) => {
    try {
      const newStatus = reminder.status === "completed" ? "PENDING" : "DONE";
      await unifiedApi.updateStatus(String(reminder.id), newStatus);

      // Show success toast
      toast({
        title:
          reminder.status === "completed"
            ? "ยกเลิกการเสร็จสิ้น"
            : "ทำเครื่องหมายว่าเสร็จสิ้น",
        description: `${
          reminder.status === "completed"
            ? "ยกเลิกการเสร็จสิ้น"
            : "ทำเครื่องหมายว่าเสร็จสิ้น"
        } "${reminder.title}" เรียบร้อยแล้ว`,
      });

      // Reload reminders to get the updated list
      await loadReminders();
    } catch (error) {
      console.error("Failed to toggle reminder status:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเปลี่ยนสถานะการแจ้งเตือนได้",
        variant: "destructive",
      });
    }
  };

  // Filter reminders
  const filteredReminders = reminders
    .filter((reminder) => {
      const matchesSearch =
        reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reminder.details.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || reminder.status === statusFilter;
      const matchesType = typeFilter === "all" || reminder.type === typeFilter;
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "overdue" && reminder.status === "overdue") ||
        (activeTab === "urgent" && reminder.isUrgent) ||
        (activeTab === "incomplete" && reminder.status === "incomplete") ||
        (activeTab === "completed" && reminder.status === "completed");

      // Filter by date if needed
      let matchesDate = true;
      if (filterDate !== "all") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const reminderDate = new Date(reminder.date);
        reminderDate.setHours(0, 0, 0, 0);

        if (filterDate === "today") {
          matchesDate = reminderDate.getTime() === today.getTime();
        } else if (filterDate === "thisWeek") {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          matchesDate = reminderDate >= weekStart && reminderDate <= weekEnd;
        } else if (filterDate === "thisMonth") {
          matchesDate =
            reminderDate.getMonth() === today.getMonth() &&
            reminderDate.getFullYear() === today.getFullYear();
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesTab &&
        matchesDate
      );
    })
    .sort((a, b) => {
      // Sort by priority: overdue > urgent > incomplete > completed
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (a.status !== "overdue" && b.status === "overdue") return 1;
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      if (a.status === "incomplete" && b.status === "completed") return -1;
      if (a.status === "completed" && b.status === "incomplete") return 1;

      // If same priority, sort by date
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  // Count reminders by status
  const reminderCounts = {
    all: reminders.length,
    overdue: reminders.filter((r) => r.status === "overdue").length,
    urgent: reminders.filter((r) => r.isUrgent).length,
    incomplete: reminders.filter((r) => r.status === "incomplete").length,
    completed: reminders.filter((r) => r.status === "completed").length,
  };

  return (
    <AppLayout
      title="ตั้งค่าการแจ้งเตือน"
      description="สร้าง แก้ไข และลบการแจ้งเตือนต่างๆ"
    >
      <div className="bg-[#f8f9fc] min-h-screen">
        <div className="container mx-auto px-4 py-6">
          {/* Header with search and add button */}
          <div className="flex flex-col sm:flex-row gap-3 items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="ค้นหาการแจ้งเตือน..."
                className="pl-10 w-full border-gray-300 focus:border-[#2c3e50] focus:ring-[#2c3e50]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className="flex-1 sm:flex-none border-[#2c3e50] text-[#2c3e50] hover:bg-[#2c3e50] hover:text-white transition-colors"
              >
                ตัวกรอง {isFiltersVisible ? "▲" : "▼"}
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}
                className="flex-1 sm:flex-none bg-[#2c3e50] hover:bg-[#1a2530] text-white transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" /> สร้างการแจ้งเตือน
              </Button>
            </div>
          </div>

          {/* Filters section */}
          {isFiltersVisible && (
            <ReminderFilters
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              filterDate={filterDate}
              setFilterDate={setFilterDate}
            />
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12 bg-white rounded-xl shadow-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c3e50]"></div>
            </div>
          ) : (
            /* Tabs and reminder list */
            <ReminderTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              reminderCounts={reminderCounts}
              filteredReminders={filteredReminders}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onToggleStatus={toggleReminderStatus}
              onViewPassword={(reminder) => {
                setCurrentReminder(reminder);
                setIsPasswordVisible(false);
                setIsForgotPasswordDialogOpen(true);
              }}
              getStatusBadge={getStatusBadge}
              getFrequencyText={getFrequencyText}
              getTypeIcon={getTypeIcon}
              getDueDateStatus={getDueDateStatus}
              formatThaiDate={formatThaiDate}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="border-[#2c3e50] text-[#2c3e50]"
                >
                  ก่อนหน้า
                </Button>
                <div className="flex items-center px-4 bg-white rounded-md border border-[#e2e8f0]">
                  <span className="text-sm text-[#4a5568]">
                    หน้า {currentPage} จาก {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="border-[#2c3e50] text-[#2c3e50]"
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          )}

          {/* Success Animation */}
          <ConfettiAnimation
            isVisible={showConfetti}
            onComplete={() => setShowConfetti(false)}
            title={successTitle}
            description={successDescription}
          />
        </div>
      </div>

      {/* Add Reminder Dialog */}
      <AddReminderDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleAddReminder={handleAddReminder}
        hasLogin={hasLogin}
        setHasLogin={setHasLogin}
      />

      {/* Edit Reminder Dialog */}
      <EditReminderDialog
        isOpen={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setIsEditPasswordAuthenticated(false);
          }
        }}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleEditReminder={handleEditReminder}
        isPasswordProtected={!!currentReminder?.password}
        isEditPasswordAuthenticated={isEditPasswordAuthenticated}
        handleEditAuthenticate={handleEditAuthenticate}
        hasLogin={hasLogin}
        setHasLogin={setHasLogin}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteReminderDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        reminderTitle={currentReminder?.title || ""}
        handleDeleteReminder={handleDeleteReminder}
      />

      {/* View Password Dialog */}
      <PasswordDialog
        isOpen={isForgotPasswordDialogOpen}
        onOpenChange={(open) => {
          setIsForgotPasswordDialogOpen(open);
          if (!open) {
            setIsPasswordVisible(false);
          }
        }}
        reminderPassword={currentReminder?.password}
        isPasswordVisible={isPasswordVisible}
        handleAuthenticate={handleAuthenticate}
      />
    </AppLayout>
  );
}
