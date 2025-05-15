"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { simulateApiDelay } from "@/lib/mock-data"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(false)

  const profileFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    title: z.string().optional(),
    department: z.string().optional(),
    bio: z.string().max(160, { message: "Bio must not be longer than 160 characters." }).optional(),
  })

  type ProfileFormValues = z.infer<typeof profileFormSchema>

  // This would come from your user context or API in a real app
  const defaultValues: Partial<ProfileFormValues> = {
    name: "Shogun",
    email: "shokun159@gmail.com",
    title: "Developer",
    department: "IT Department",
    bio: "ตื่นมาก็หล่อ พอให้พอใจ แต่ยังง่วงอยู่ไง ขอนอนต่ออีกที",
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  })

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)

    try {
      // Simulate API call
      await simulateApiDelay(1000)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-noto">
      <Card>
        <CardHeader>
          <CardTitle>โปรไฟล์</CardTitle>
          <CardDescription>การตั้งค่าและจัดการข้อมูลส่วนบุคคล</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
              <AvatarFallback className="text-2xl">SG</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="font-medium">รูปโปรไฟล์</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  อัพโหลด
                </Button>
                <Button variant="outline" size="sm" className="text-red-500">
                  ลบรูปโปรไฟล์
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size 1MB.</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อจริง</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>อีเมล</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ตำแหน่งงาน</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your job title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>แผนก</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your department" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write a short bio about yourself" className="resize-none" {...field} />
                    </FormControl>
                    <FormDescription>คำอธิบายสั้น ๆ สำหรับโปรไฟล์ของคุณ ( ไม่เกิน 160 ตัวอักษร )</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading} className="bg-[#E2001A] hover:bg-[#C0001A] text-white">
                  {isLoading ? "Saving..." : "บันทึกการเปลี่ยนแปลง"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
