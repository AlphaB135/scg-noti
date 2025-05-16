/**
 * @fileoverview มิดเดิลแวร์สำหรับตรวจสอบความถูกต้องของคำขอ (Request) โดยใช้ Zod schemas
 * ทำหน้าที่ตรวจสอบข้อมูลที่ส่งมากับ request ทั้ง body, query parameters และ URL parameters
 * ในเส้นทาง Express พร้อมการตรวจสอบประเภทข้อมูล
 * 
 * คุณสมบัติ:
 * - รองรับการตรวจสอบประเภทข้อมูลอัตโนมัติจาก Zod schemas
 * - แสดงข้อความแจ้งข้อผิดพลาดอย่างละเอียด
 * - แปลงประเภทข้อมูลอัตโนมัติ
 * - รองรับการตรวจสอบข้อมูลแบบซ้อนกัน
 */

import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

/**
 * อินเตอร์เฟซสำหรับกำหนดค่าการตรวจสอบคำขอ
 * ระบุส่วนต่างๆ ของคำขอที่ต้องการตรวจสอบและสคีมาที่ใช้
 * 
 * @interface ValidateSchema
 * @property {z.ZodType<any, any>} [body] - สคีมาสำหรับ request body
 * @property {z.ZodType<any, any>} [query] - สคีมาสำหรับพารามิเตอร์ query
 * @property {z.ZodType<any, any>} [params] - สคีมาสำหรับพารามิเตอร์ URL
 */
type ValidateSchema = {
  body?: z.ZodType<any, any>
  query?: z.ZodType<any, any>
  params?: z.ZodType<any, any>
}

/**
 * สร้างฟังก์ชันมิดเดิลแวร์สำหรับตรวจสอบข้อมูลคำขอด้วย Zod schemas
 * 
 * @param {ValidateSchema} schema - อ็อบเจกต์ที่ประกอบด้วย Zod schemas สำหรับการตรวจสอบ
 * @returns {Function} ฟังก์ชันมิดเดิลแวร์ Express
 * 
 * @example
 * // ตรวจสอบ request body
 * router.post('/users',
 *   validateRequest({
 *     body: z.object({
 *       email: z.string().email(),
 *       name: z.string().min(2)
 *     })
 *   }),
 *   createUser
 * )
 * 
 * @example
 * // ตรวจสอบพารามิเตอร์ query
 * router.get('/users',
 *   validateRequest({
 *     query: z.object({
 *       page: z.string().transform(Number).default('1'),
 *       limit: z.string().transform(Number).default('10')
 *     })
 *   }),
 *   listUsers
 * )
 * 
 * @throws {400} Bad Request - เมื่อการตรวจสอบไม่ผ่าน พร้อมข้อความแจ้งข้อผิดพลาดโดยละเอียด
 * @throws {500} Internal Server Error - เมื่อเกิดข้อผิดพลาดที่ไม่คาดคิดในกระบวนการตรวจสอบ
 */
export const validateRequest = (schema: ValidateSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body if schema provided
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body)
      }
      
      // Validate query parameters if schema provided
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query)
      }
      
      // Validate URL parameters if schema provided
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params)
      }
      
      // Continue to next middleware if validation passes
      next()
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        })
      }
      
      // Handle unexpected errors
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}
