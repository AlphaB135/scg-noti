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

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      setImageError(null);
      
      try {
        // Format file size for display
        const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        
        // Check file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
          throw new Error(`รูปภาพมีขนาดใหญ่เกินไป (${fileSizeInMB} MB) กรุณาใช้รูปที่มีขนาดไม่เกิน 2MB`);
        }

        // Check file type
        if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
          throw new Error("กรุณาเลือกไฟล์รูปภาพ (jpg, png หรือ gif)");
        }

        // Load and optimize image
        const img = await createImageBitmap(file);
        
        // Scale image to max 200x200 while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > 200) {
            height = Math.round(height * (200 / width));
            width = 200;
          }
        } else {
          if (height > 200) {
            width = Math.round(width * (200 / height));
            height = 200;
          }
        }

        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("ไม่สามารถสร้าง canvas context ได้");
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const base64Image = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
        
        // Validate final size
        const base64Size = base64Image.length * (3/4) - 2; // Approximate size in bytes
        if (base64Size > 100 * 1024) { // 100KB limit
          throw new Error("รูปภาพมีขนาดใหญ่เกินไป กรุณาใช้รูปที่มีความละเอียดต่ำลง");
        }

        setPreviewImage(base64Image);
        setBase64Image(base64Image);
        toast.success("อัพโหลดรูปภาพเรียบร้อยแล้ว");
      } catch (error) {
        console.error("Image processing error:", error);
        setImageError(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการประมวลผลรูปภาพ");
        toast.error("ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setIsProcessingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  // Handle upload click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle remove image
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setImageError(null);
    setBase64Image(null);
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
    nickname: z.string().optional()
  });

  type ProfileFormValues = z.infer<typeof profileFormSchema>;
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      position: '',
      nickname: ''
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
            nickname: data.employeeProfile.nickname || ''
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
      const profileData = {
        email: values.email,
        employeeProfile: {
          firstName: values.firstName,
          lastName: values.lastName,
          position: values.position,
          nickname: values.nickname,
          // รูปภาพต้องส่งในรูปแบบ data:image/jpeg;base64,...
          profileImageUrl: base64Image && base64Image.startsWith('data:image/') ? base64Image : undefined
        }
      };
      
      await settingsApi.updateProfile(profileData);

      // รอให้อัพเดทข้อมูลเสร็จ
      const updatedProfile = await settingsApi.getProfile();
      setProfileData(updatedProfile);

      // แสดง popup เมื่อเสร็จสิ้น
      toast.success("บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว", {
        duration: 3000,
        position: "top-center",
      });      
      // ถ้ามีการอัพโหลดรูปภาพ ให้แสดงข้อความเพิ่มเติม
      if (base64Image) {
        toast.success("อัพโหลดรูปโปรไฟล์เรียบร้อยแล้ว", {
          duration: 3000,
          position: "top-center",
        });
      }    } catch (error) {
      console.error('Profile update error:', error);
      const apiError = error as ApiError;
      
      // Handle Zod validation errors from backend
      const details = apiError.response?.data?.details;
      if (details && details.length > 0) {
        details.forEach((detail) => {
          console.log('Validation error:', detail);
          toast.error(detail, {
            duration: 3000,
            position: "top-center",
          });
        });
      } else {
        const errorMessage = apiError.response?.data?.error || 
                           (apiError.message.includes('Network') ? 
                             "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้" : 
                             "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
        console.log('API error:', errorMessage);
        toast.error(errorMessage, {
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
            <Avatar className="h-24 w-24">              
              <AvatarImage 
                src={previewImage || (profileData?.employeeProfile?.profileImageUrl ? `/api/uploads/profiles/${profileData.employeeProfile.profileImageUrl.split('/').pop()}` : "/placeholder.svg")}
                alt={profileData?.employeeProfile?.firstName || "Profile"}
                onError={(e) => {
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleUploadClick}
                  disabled={isProcessingImage}
                >
                  {isProcessingImage ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⭮</span>
                      กำลังประมวลผล...
                    </span>
                  ) : "อัพโหลด"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500" 
                  onClick={handleRemoveImage}
                  disabled={!previewImage || isProcessingImage}
                >
                  ลบรูปโปรไฟล์
                </Button>
              </div>            
              {imageError ? (
                <p className="text-xs text-red-500">{imageError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  รองรับไฟล์ JPG, PNG หรือ GIF ขนาดไม่เกิน 2MB
                  <br />
                  แนะนำขนาดภาพ 800x800 พิกเซล หรือใหญ่กว่า
                </p>
              )}
              <input
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
