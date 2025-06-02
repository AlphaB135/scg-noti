/**
 * @fileoverview เส้นทางการเรียก API สำหรับจัดการข้อมูลพนักงาน
 */

import { Router } from 'express';
import employeeRouter from '../modules/employee/employee.router';

const router = Router();

router.use('/', employeeRouter);

export default router;
