/**
 * @fileoverview มิดเดิลแวร์สำหรับจัดการข้อผิดพลาดทั้งหมดในระบบ SCG Notification
 * รองรับการจัดการข้อผิดพลาดแบบรวมศูนย์ พร้อมการตอบกลับที่เหมาะสม
 * ตามประเภทของข้อผิดพลาดและการตั้งค่าสภาพแวดล้อม
 * 
 * คุณสมบัติ:
 * - จัดการข้อผิดพลาดจากฐานข้อมูล Prisma
 * - จัดรูปแบบข้อผิดพลาดจากการตรวจสอบความถูกต้อง
 * - จัดการข้อผิดพลาดจากการยืนยันตัวตน JWT
 * - แสดงรายละเอียดข้อผิดพลาดตามสภาพแวดล้อม
 * - บันทึกข้อผิดพลาดเพื่อการแก้ไขและพัฒนา
 */

import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'

/**
 * อินเตอร์เฟซสำหรับข้อผิดพลาดเฉพาะของแอปพลิเคชัน
 * @interface AppError
 * @extends Error
 */
interface AppError extends Error {
  /** รหัสสถานะ HTTP สำหรับการตอบกลับข้อผิดพลาด */
  status?: number
  /** รหัสข้อผิดพลาดเฉพาะของแอปพลิเคชัน */
  code?: string
  /** รายละเอียดหรือบริบทเพิ่มเติมของข้อผิดพลาด */
  details?: any
}

/**
 * มิดเดิลแวร์จัดการข้อผิดพลาดสำหรับแอปพลิเคชัน Express
 * 
 * @param {AppError} err - อ็อบเจกต์ข้อผิดพลาดที่เกิดขึ้นในแอปพลิเคชัน
 * @param {Request} req - อ็อบเจกต์คำขอ Express
 * @param {Response} res - อ็อบเจกต์การตอบกลับ Express
 * @param {NextFunction} next - ฟังก์ชันมิดเดิลแวร์ถัดไปของ Express
 * 
 * รองรับข้อผิดพลาดประเภทต่างๆ:
 * - ข้อผิดพลาดจากฐานข้อมูล Prisma (ข้อมูลซ้ำ, ไม่พบข้อมูล ฯลฯ)
 * - ข้อผิดพลาดจากการตรวจสอบความถูกต้อง (การตรวจสอบสคีมา, ประเภทข้อมูล)
 * - ข้อผิดพลาดจากการยืนยันตัวตน (การตรวจสอบ JWT, โทเค็นหมดอายุ)
 * - ข้อผิดพลาดของแอปพลิเคชัน (อินสแตนซ์ของ AppError)
 * - ข้อผิดพลาดที่ไม่คาดคิด (500 Internal Server Error)
 * 
 * รูปแบบการตอบกลับข้อผิดพลาด:
 * {
 *   error: string;      // ชื่อ/ประเภทข้อผิดพลาด
 *   detail: string;     // ข้อความอธิบายที่อ่านเข้าใจง่าย
 *   code?: string;      // รหัสข้อผิดพลาด (ถ้ามี)
 *   details?: any;      // รายละเอียดเพิ่มเติม (เฉพาะโหมดพัฒนา)
 *   stack?: string;     // สแตกเทรซ (เฉพาะโหมดพัฒนา)
 * }
 */
export default function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log detailed error information for debugging
  console.error('❌ Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    user: req.user?.id
  })

  // Handle Prisma database errors with specific responses
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        res.status(409).json({
          error: 'Conflict',
          detail: 'A record with this value already exists',
          code: err.code
        })
        return
      case 'P2025': // Record not found
        res.status(404).json({
          error: 'Not Found',
          detail: 'The requested record does not exist',
          code: err.code
        })
        return
      default:
        res.status(400).json({
          error: 'Database Error',
          detail: 'An error occurred while accessing the database',
          code: err.code
        })
        return
    }
  }

  // Handle validation errors
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    res.status(400).json({
      error: 'Validation Error',
      detail: err.message,
      errors: err.details
    })
    return
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Invalid Token',
      detail: 'The provided authentication token is invalid'
    })
    return
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Token Expired',
      detail: 'Please login again'
    })
    return
  }

  // Handle custom AppError with status
  if (err.status) {
    res.status(err.status).json({
      error: err.name,
      detail: err.message,
      code: err.code,
      ...(err.details && { details: err.details })
    })
    return
  }

  // Handle other errors
  res.status(500).json({
    error: 'Internal Server Error',
    detail: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
