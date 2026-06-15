import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/alumni
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const department = req.query.department as string | undefined;

    const where: any = { role: 'alumni' };
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (department && department !== 'all') {
      where.department = department;
    }

    const alumni = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        department: true,
        enrollmentYear: true,
        avatarUrl: true,
        phone: true,
        company: true,
        position: true,
      },
      orderBy: { fullName: 'asc' },
    });

    const formatted = alumni.map(a => ({
      id: a.id,
      name: a.fullName,
      graduationYear: a.enrollmentYear ? a.enrollmentYear + 4 : null,
      department: a.department,
      avatar: a.avatarUrl,
      company: a.company,
      role: a.position, // Mapping position to 'role' for frontend compatibility
    }));

    res.json({ alumni: formatted });
  } catch (err) {
    console.error('Alumni GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
