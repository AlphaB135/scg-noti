import { Request, Response, NextFunction } from 'express'
import { prisma } from '../../prisma'
import { z } from 'zod'
import * as fs from 'fs'
import * as path from 'path'
import { nanoid } from 'nanoid'

// ตรวจสอบและสร้างโฟลเดอร์
const publicDir = path.join(__dirname, '../../public')
const uploadsDir = path.join(publicDir, 'uploads')
const profileImagesDir = path.join(uploadsDir, 'profiles')

function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`Created directory: ${dir}`)
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error)
      throw error
    }
  } else {
    try {
      // Test write access
      fs.accessSync(dir, fs.constants.W_OK)
      console.log(`Directory exists and is writable: ${dir}`)
    } catch (error) {
      console.error(`Directory ${dir} is not writable:`, error)
      throw error
    }
  }
}

try {
  ensureDirectoryExists(publicDir)
  ensureDirectoryExists(uploadsDir)
  ensureDirectoryExists(profileImagesDir)
} catch (error) {
  console.error('Error setting up upload directories:', error)
  throw new Error('Could not create or access upload directories. Please check permissions.')
}

const updateProfileSchema = z.object({
  email: z.string().email({
    message: "กรุณากรอกอีเมลให้ถูกต้อง"
  }),
  employeeProfile: z.object({
    firstName: z.string({
      required_error: "กรุณากรอกชื่อ"
    }),
    lastName: z.string({
      required_error: "กรุณากรอกนามสกุล"  
    }),
    position: z.string().optional(),
    nickname: z.string().optional(),
    profileImageUrl: z.string()
      .optional()
      .refine(
        (val) => !val || val.startsWith('data:image/'),
        {
          message: "รูปภาพต้องอยู่ในรูปแบบ base64 และเป็นไฟล์รูปภาพเท่านั้น"
        }
      )
  })
})

/**
 * บันทึกไฟล์รูปและสร้าง URL
 */
async function saveProfileImage(userId: string, base64Data: string): Promise<string> {
  try {
    console.log('Starting image save process for user:', userId);
    
    // Ensure directories exist and are writable
    try {
      if (!fs.existsSync(profileImagesDir)) {
        fs.mkdirSync(profileImagesDir, { recursive: true });
      }
      // Test write permissions
      const testFile = path.join(profileImagesDir, '.test');
      fs.writeFileSync(testFile, '');
      fs.unlinkSync(testFile);
      console.log('Directory exists and is writable:', profileImagesDir);
    } catch (error) {
      console.error('Directory check or write test failed:', error);
      throw new Error('Unable to write to image storage directory')
    }
    
    // แยก metadata และ binary data
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      console.error('Invalid image format');
      throw new Error('Invalid image format - must be a base64 encoded image');
    }
    
    const [, format, binaryData] = matches;
    if (!['jpeg', 'png', 'gif'].includes(format.toLowerCase())) {
      console.error('Unsupported image format:', format);
      throw new Error('Unsupported image format - must be JPEG, PNG, or GIF');
    }
    console.log('Image format:', format);

    if (!binaryData) {
      console.error('No binary data found in base64 string');
      throw new Error('Invalid image data - no binary content found');
    }

    // แปลง base64 เป็น buffer
    const imageBuffer = Buffer.from(binaryData, 'base64');
    if (imageBuffer.length === 0) {
      throw new Error('Invalid image data - empty buffer');
    }
    console.log('Image buffer size:', imageBuffer.length);

    // สร้างชื่อไฟล์แบบ unique
    const fileName = `${userId}_${nanoid(6)}.jpg`;
    const filePath = path.join(profileImagesDir, fileName);
    console.log('Saving image to:', filePath);
      // บันทึกไฟล์
    try {
      await fs.promises.writeFile(filePath, imageBuffer);
      console.log('Image saved successfully to:', filePath);
      // Verify file was written
      const stats = await fs.promises.stat(filePath);
      console.log('File size:', stats.size, 'bytes');
      if (stats.size === 0) {
        throw new Error('File was created but is empty');
      }
    } catch (error) {
      console.error('Error writing file:', error);
      throw new Error('Failed to save image file');
    }

    // ลบไฟล์เก่า
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { 
          employeeProfile: true,
          adminProfile: true
        }
      });

      const oldImageUrl = user?.employeeProfile?.profileImageUrl || user?.adminProfile?.profileImageUrl;
      if (oldImageUrl) {
        const oldFileName = oldImageUrl.split('/').pop();
        if (oldFileName) {
          const oldFilePath = path.join(profileImagesDir, oldFileName);
          if (fs.existsSync(oldFilePath)) {
            await fs.promises.unlink(oldFilePath);
            console.log('Old image deleted:', oldFileName);
          }
        }
      }
    } catch (error) {
      console.warn('Error cleaning up old image:', error);
    }

    // Return URL relative to the /uploads directory
    const imageUrl = `/uploads/profiles/${fileName}`;
    console.log('Returning image URL:', imageUrl);
    return imageUrl;
    
  } catch (error) {
    console.error('Error in saveProfileImage:', error);
    throw error;
  }
}

/**
 * PUT /api/users/profile
 * อัพเดทข้อมูลโปรไฟล์ผู้ใช้
 */
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const data = updateProfileSchema.parse(req.body);

    // อัพเดทข้อมูลผู้ใช้และโปรไฟล์
    await prisma.$transaction(async (tx) => {
      // อัพเดทอีเมล
      await tx.user.update({
        where: { id: userId },
        data: { email: data.email }
      });

      let profileImageUrl;
      try {
        if (data.employeeProfile.profileImageUrl?.startsWith('data:image/')) {
          profileImageUrl = await saveProfileImage(userId, data.employeeProfile.profileImageUrl);
        }
      } catch (error) {
        console.error('Error saving profile image:', error);
        res.status(500).json({ 
          error: 'ไม่สามารถบันทึกรูปโปรไฟล์ได้',
          details: error instanceof Error ? [error.message] : ['Unknown error']
        });
        return;
      }

      // อัพเดทข้อมูลโปรไฟล์
      if (req.user!.role === 'ADMIN') {
        await tx.adminProfile.update({
          where: { userId },
          data: {
            firstName: data.employeeProfile.firstName,
            lastName: data.employeeProfile.lastName,
            position: data.employeeProfile.position,
            nickname: data.employeeProfile.nickname,
            profileImageUrl
          }
        });
      } else {
        await tx.employeeProfile.update({
          where: { userId },
          data: {
            firstName: data.employeeProfile.firstName,
            lastName: data.employeeProfile.lastName,
            position: data.employeeProfile.position,
            nickname: data.employeeProfile.nickname,
            profileImageUrl
          }
        });
      }
    });

    // ดึงข้อมูลที่อัพเดทแล้ว
    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        employeeProfile: true,
        adminProfile: true
      }
    });

    res.json(updatedUser);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: 'ข้อมูลไม่ถูกต้อง',
        details: err.errors.map(e => e.message)
      });
      return;
    }

    next(err);
  }
}
