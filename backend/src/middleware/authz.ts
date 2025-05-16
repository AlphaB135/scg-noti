/**
 * @fileoverview มิดเดิลแวร์สำหรับการจัดการสิทธิ์การเข้าถึงตามบทบาทในระบบ SCG Notification
 * ควบคุมการเข้าถึงทรัพยากรตามบทบาทของผู้ใช้และสิทธิ์ที่กำหนด
 * 
 * บทบาทที่รองรับ:
 * - SUPERADMIN: เข้าถึงระบบทั้งหมด
 * - ADMIN: เข้าถึงส่วนการจัดการ
 * - USER: เข้าถึงฟังก์ชันทั่วไป
 * - TEAM_LEAD: เข้าถึงการจัดการทีม
 * - EMPLOYEE: เข้าถึงพื้นฐานสำหรับพนักงาน
 */

import { Request, Response, NextFunction } from 'express'

/**
 * สร้างฟังก์ชันมิดเดิลแวร์สำหรับตรวจสอบว่าผู้ใช้ที่เข้าสู่ระบบมีบทบาทที่ต้องการหรือไม่
 * 
 * @param {string[]} roles - อาร์เรย์ของบทบาทที่อนุญาตให้เข้าถึงทรัพยากร
 * @returns {Function} ฟังก์ชันมิดเดิลแวร์ Express
 * 
 * @example
 * // อนุญาตเฉพาะแอดมินและซูเปอร์แอดมิน
 * router.get('/admin/dashboard', authorize(['ADMIN', 'SUPERADMIN']), handler)
 * 
 * @example
 * // อนุญาตผู้ใช้ที่เข้าสู่ระบบทุกคน
 * router.get('/profile', authorize(['USER', 'ADMIN', 'SUPERADMIN']), handler)
 * 
 * @throws {403} Forbidden - เมื่อบทบาทของผู้ใช้ไม่ตรงกับที่กำหนด
 * @throws {401} Unauthorized - เมื่อไม่พบข้อมูลผู้ใช้ในคำขอ (จัดการโดย auth middleware)
 */
export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Extract user role from authenticated request
    const userRole = (req.user as any)?.role

    // Check if user has required role
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      })
      return
    }

    // Allow access if role check passes
    next()
  }
}
