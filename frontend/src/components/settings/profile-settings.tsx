"use client"

import { useState, useEffect, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { settingsApi, type UserProfile } from "@/lib/api/settings"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ApiError {
  response?: {
    data?: {
      error?: string;
      details?: string[];
    };
  };
  message: string;
}

export default function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (1MB = 1024 * 1024 bytes)
      if (file.size > 1024 * 1024) {
        toast.error("ไฟล์ต้องมีขนาดไม่เกิน 1MB");
        return;
      }

      // Check file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast.error("รองรับเฉพาะไฟล์ JPG, PNG และ GIF เท่านั้น");
        return;
      }

      // สร้าง canvas เพื่อบีบอัดรูปภาพ
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // คำนวณขนาดใหม่ให้ความกว้างไม่เกิน 800px แต่รักษาสัดส่วนภาพ
        let width = img.width;
        let height = img.height;
        if (width > 800) {
          height = height * (800 / width);
          width = 800;
        }

        // กำหนดขนาด canvas
        canvas.width = width;
        canvas.height = height;

        // วาดรูปลง canvas และบีบอัด
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // บีบอัดเป็น JPEG คุณภาพ 70%
        
        setPreviewImage(compressedBase64);
        form.setValue('avatarBase64', compressedBase64);
      };

      // อ่านไฟล์เป็น Data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle remove image
  const handleRemoveImage = () => {
    setPreviewImage(null);
    form.setValue('avatarBase64', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const profileFormSchema = z.object({
    firstName: z.string().min(2, { 
      message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร" 
    }),
    lastName: z.string().min(2, { 
      message: "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร" 
    }),
    email: z.string().email({ 
      message: "กรุณากรอกอีเมลให้ถูกต้อง"
    }),
    position: z.string().optional(),
    nickname: z.string().optional(),
    avatarBase64: z.string().optional()
  });

  type ProfileFormValues = z.infer<typeof profileFormSchema>;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      position: '',
      nickname: '',
      avatarBase64: ''
    }
  });

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await settingsApi.getProfile();
        setProfileData(data);
        if (data?.employeeProfile) {
          form.reset({
            firstName: data.employeeProfile.firstName || '',
            lastName: data.employeeProfile.lastName || '',
            email: data.email || '',
            position: data.employeeProfile.position || '',
            nickname: data.employeeProfile.nickname || '',
            avatarBase64: ''
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
      }
    };
    loadProfile();
  }, [form]);

  async function onSubmit(values: ProfileFormValues) {
    setIsLoading(true);

    try {
      // อัพเดทโปรไฟล์
      await settingsApi.updateProfile({
        email: values.email,
        employeeProfile: {
          firstName: values.firstName,
          lastName: values.lastName,
          position: values.position,
          nickname: values.nickname,
          profileImageUrl: values.avatarBase64 ? `data:image/jpeg;base64,${values.avatarBase64.split(',')[1]}` : undefined
        }
      });

      // รอให้อัพเดทข้อมูลเสร็จ
      const updatedProfile = await settingsApi.getProfile();
      setProfileData(updatedProfile);

      // แสดง popup เมื่อเสร็จสิ้น
      toast.success("บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว", {
        duration: 3000,
        position: "top-center",
      });

      // ถ้ามีการอัพโหลดรูปภาพ ให้แสดงข้อความเพิ่มเติม
      if (values.avatarBase64) {
        toast.success("อัพโหลดรูปโปรไฟล์เรียบร้อยแล้ว", {
          duration: 3000,
          position: "top-center",
        });
      }
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      
      // Handle Zod validation errors from backend
      const details = apiError.response?.data?.details;
      if (details && details.length > 0) {
        details.forEach((detail) => {
          toast.error(detail, {
            duration: 3000,
            position: "top-center",
          });
        });
      } else {
        toast.error(apiError.response?.data?.error || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง", {
          duration: 3000,
          position: "top-center",
        });
      }
    } finally {
      setIsLoading(false);
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
            <Avatar className="h-24 w-24">              <AvatarImage 
                src={previewImage || profileData?.employeeProfile?.profileImageUrl || "/placeholder.svg"}
                alt={profileData?.employeeProfile?.firstName || "Profile"}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <AvatarFallback className="text-2xl">
                {profileData?.employeeProfile?.firstName?.[0]?.toUpperCase() || 'P'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="font-medium">รูปโปรไฟล์</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleUploadClick}>
                  อัพโหลด
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500" 
                  onClick={handleRemoveImage}
                  disabled={!previewImage}
                >
                  ลบรูปโปรไฟล์
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size 1MB.</p>              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/gif"
                onChange={e => handleFileSelect(e)}
              />
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อจริง</FormLabel>
                      <FormControl>
                        <Input placeholder="กรอกชื่อจริง" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>นามสกุล</FormLabel>
                      <FormControl>
                        <Input placeholder="กรอกนามสกุล" {...field} />
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
                        <Input placeholder="กรอกอีเมล" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ตำแหน่งงาน</FormLabel>
                      <FormControl>
                        <Input placeholder="กรอกตำแหน่งงาน" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อเล่น</FormLabel>
                      <FormControl>
                        <Input placeholder="กรอกชื่อเล่น" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
