"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notificationsApi } from "@/lib/api";
import type { Task } from "@/lib/types/task";

/**
 * props:
 *  onCreated(newTask) – callback ให้หน้า Dashboard เอา task ที่สร้างไปเก็บ / รีเฟรช state ด้านนอก
 */
export default function AddNotificationButton({
  onCreated,
}: {
  onCreated: (task: Task) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    details: "",
    impact: "",
    frequency: "no-repeat",
    link: "",
    hasLogin: false,
    username: "",
    password: "",
  });

  /* ---------- handlers ---------- */
  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelect = (val: string) =>
    setForm((prev) => ({ ...prev, frequency: val }));

  const reset = () =>
    setForm({
      title: "",
      date: "",
      details: "",
      impact: "",
      frequency: "no-repeat",
      link: "",
      hasLogin: false,
      username: "",
      password: "",
    });

  const handleSave = async () => {
    if (
      !form.title.trim() ||
      !form.date ||
      !form.details.trim() ||
      !form.impact.trim()
    )
      return;

    setSaving(true);
    try {
      /* === 1. เรียก API สร้าง Notification === */
      const msg =
        `${form.details}\n\nผลกระทบ: ${form.impact}` +
        (form.hasLogin
          ? `\n\nข้อมูลการเข้าสู่ระบบ:\nUsername: ${form.username}\nPassword: ${form.password}`
          : "");

      const res = await notificationsApi.create({
        title: form.title,
        message: msg,
        type: "TODO",
        scheduledAt: new Date(form.date).toISOString(),
        category: "TASK",
        link: form.link || undefined,
        urgencyDays: 3,
        repeatIntervalDays: 0,
        recipients: [{ type: "ALL" }],
      } as any);

      console.log("Notification created successfully:", res);

      /* === 2. map เป็น Task แล้วส่งกลับ caller === */
      const newTask: Task = {
        id: res.id,
        title: res.title,
        details: res.message,
        dueDate: res.scheduledAt?.split("T")[0] || "",
        done: false,
        priority: "pending",
        frequency: form.frequency as Task["frequency"],
        impact: form.impact,
        link: form.link,
        hasLogin: form.hasLogin,
        username: form.username,
        password: form.password,
      };

      onCreated(newTask); // แจ้งหน้า Dashboard
      reset();
      setOpen(false);
    } catch (err) {
      console.error("Failed to create notification:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-b from-red-700 to-red-800 hover:bg-red-700 text-white text-xs md:text-sm py-1 md:py-2 px-2 md:px-3 h-auto"
      >
        <Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
        เพิ่มงาน
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-[90vw] md:max-w-[75vw] h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-base md:text-xl">
              สร้างการแจ้งเตือนใหม่
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 md:gap-4 py-2 md:py-4">
            {/* --- Title --- */}
            <div className="grid gap-1 md:gap-2">
              <Label htmlFor="title" className="text-xs md:text-sm">
                หัวข้องาน <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleInput}
                placeholder="กรอกหัวข้องาน"
                required
                className="text-sm"
              />
            </div>

            {/* --- Date --- */}
            <div className="grid gap-1 md:gap-2">
              <Label htmlFor="date" className="text-xs md:text-sm">
                วันที่แจ้งเตือน <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleInput}
                required
                className="text-sm"
              />
            </div>

            {/* --- Frequency --- */}
            <div className="grid gap-1 md:gap-2">
              <Label htmlFor="frequency" className="text-xs md:text-sm">
                ความถี่ <span className="text-red-500">*</span>
              </Label>
              <Select value={form.frequency} onValueChange={handleSelect}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="เลือกความถี่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-repeat">เตือนไม่ทำซ้ำ</SelectItem>
                  <SelectItem value="yearly">ทุกปี</SelectItem>
                  <SelectItem value="monthly">ทุกเดือน</SelectItem>
                  <SelectItem value="weekly">ทุกสัปดาห์</SelectItem>
                  <SelectItem value="daily">ทุกวัน</SelectItem>
                  <SelectItem value="quarterly">ทุกไตรมาส</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* --- Details & impact --- */}
            <div className="grid gap-1 md:gap-2">
              <Label htmlFor="details" className="text-xs md:text-sm">
                รายละเอียด <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="details"
                name="details"
                value={form.details}
                onChange={handleInput}
                placeholder="กรอกรายละเอียดเพิ่มเติม"
                required
                className="min-h-[80px] md:min-h-[100px] text-sm"
              />
            </div>

            <div className="grid gap-1 md:gap-2">
              <Label htmlFor="impact" className="text-xs md:text-sm">
                ผลกระทบหากงานไม่เสร็จ <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="impact"
                name="impact"
                value={form.impact}
                onChange={handleInput}
                placeholder="ระบุความเสียหายหากงานไม่เสร็จ"
                required
                className="min-h-[80px] md:min-h-[100px] text-sm"
              />
            </div>

            {/* --- Optional link --- */}
            <div className="grid gap-1 md:gap-2">
              <Label htmlFor="link" className="text-xs md:text-sm">
                ลิงก์ (ถ้ามี)
              </Label>
              <Input
                id="link"
                name="link"
                value={form.link}
                onChange={handleInput}
                placeholder="https://example.com"
                type="url"
                className="text-sm"
              />
            </div>

            {/* --- Login toggle --- */}
            <div className="grid gap-1 md:gap-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasLogin"
                  name="hasLogin"
                  checked={form.hasLogin}
                  onChange={handleInput}
                  className="h-4 w-4 rounded border-gray-300 text-red-600"
                />
                <Label htmlFor="hasLogin" className="text-xs md:text-sm">
                  งานที่ต้องมีการล็อคอิน
                </Label>
              </div>

              {form.hasLogin && (
                <div className="grid gap-3 md:gap-4 mt-2 p-2 md:p-3 bg-gray-50 rounded-md">
                  <div className="grid gap-1 md:gap-2">
                    <Label htmlFor="username" className="text-xs md:text-sm">
                      Username
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      value={form.username}
                      onChange={handleInput}
                      placeholder="username"
                      className="text-sm"
                    />
                  </div>
                  <div className="grid gap-1 md:gap-2">
                    <Label htmlFor="password" className="text-xs md:text-sm">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      value={form.password}
                      onChange={handleInput}
                      placeholder="password"
                      type="text"
                      className="text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
            <Button
              variant="outline"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className="w-full sm:w-auto"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !form.title.trim() ||
                !form.date ||
                !form.details.trim() ||
                !form.impact.trim()
              }
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {saving ? "กำลังบันทึก..." : "สร้างการแจ้งเตือน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
