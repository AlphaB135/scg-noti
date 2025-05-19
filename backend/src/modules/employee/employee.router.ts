import { Router } from 'express';
import { prisma } from '../../config/prismaClient';
import { authMiddleware } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/authz';
import { companyAuth } from '../../middleware/company-auth';

const router = Router();

// Apply authentication to all employee routes
router.use(authMiddleware);

// GET /api/employees
router.get('/',
  authorize(['ADMIN', 'SUPERADMIN']),
  companyAuth(false), // Don't require exact company match for listing
  async (req, res) => {
    try {
      const where = req.user?.role === 'SUPERADMIN' ? 
        { employeeProfile: { isNot: null } } :
        { employeeProfile: { companyCode: req.companyCode } };

      const employees = await prisma.user.findMany({
        where,
        include: {
          employeeProfile: true
        }
      });

      res.json({
        success: true,
        data: employees
      });
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({
        success: false,
        error: 'Could not fetch employees'
      });
    }
});

// GET /api/employees/:id
router.get('/:id',
  authorize(['USER', 'ADMIN', 'SUPERADMIN']),
  companyAuth(false), 
  async (req, res) => {
    try {
      const employee = await prisma.user.findUnique({
        where: {
          id: req.params.id
        },
        include: {
          employeeProfile: true
        }
      });

      if (!employee || !employee.employeeProfile) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found'
        });
      }

      // Verify company access
      if (req.user?.role !== 'SUPERADMIN' &&
          employee.employeeProfile.companyCode !== req.companyCode) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to view this employee'
        });
      }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      error: 'Could not fetch employee'
    });
  }
});

export default router;
