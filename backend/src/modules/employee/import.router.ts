import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../middleware/validate';
import { prisma } from '../../config/prismaClient';
import { hashPassword } from '../auth/auth.service';

const router = Router();

const validateImportEmployees = [
  body('employees').isArray().withMessage('employees must be an array'),
  body('employees.*.employeeCode').isString().notEmpty().withMessage('employeeCode is required'),
  body('employees.*.email').isEmail().withMessage('Invalid email'),
  body('employees.*.firstName').isString().notEmpty().withMessage('firstName is required'),
  body('employees.*.lastName').isString().notEmpty().withMessage('lastName is required'),
  body('employees.*.position').optional().isString(),
  body('employees.*.companyCode').isString().notEmpty().withMessage('companyCode is required'),
  validate,
];

router.post('/import', validateImportEmployees, async (req, res) => {
  const { employees } = req.body;

  try {
    const results = await prisma.$transaction(async (prisma) => {
      const imported = [];

      for (const emp of employees) {
        const defaultPassword = `${emp.employeeCode}@123`; // สร้างรหัสผ่านเริ่มต้น
        const passwordHash = await hashPassword(defaultPassword);

        // Create user with employee profile
        const user = await prisma.user.create({
          data: {
            email: emp.email,
            passwordHash,
            role: 'EMPLOYEE',
            employeeProfile: {
              create: {
                employeeCode: emp.employeeCode,
                firstName: emp.firstName,
                lastName: emp.lastName,
                position: emp.position,
                companyCode: emp.companyCode,
              },
            },
            notificationPref: {
              create: {
                emailEnabled: true,
                pushEnabled: true,
                smsEnabled: false,
                digestFreq: 'DAILY',
              },
            },
            appearancePref: {
              create: {
                theme: 'LIGHT',
                accentColor: 'RED',
                density: 'COMFORTABLE',
              },
            },
          },
          include: {
            employeeProfile: true,
          },
        });

        imported.push(user);
      }

      return { imported: imported.length };
    });

    res.json(results);
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import employees' });
  }
});

export default router;
