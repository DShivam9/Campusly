import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/users/me — current user profile
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, email: true, fullName: true, role: true,
        department: true, avatarUrl: true, phone: true,
        enrollmentYear: true, createdAt: true,
      },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (err) {
    console.error('Users me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const updateProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  avatarUrl: z.string().optional(),
});

// PATCH /api/users/me — update own profile
router.patch('/me', authenticate, validate(updateProfileSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: req.body,
      select: {
        id: true, email: true, fullName: true, role: true,
        department: true, avatarUrl: true, phone: true, enrollmentYear: true,
      },
    });
    res.json({ user });
  } catch (err) {
    console.error('Users update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users — admin: list all users
router.get('/', authenticate, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;

    const where: any = {};
    if (role && role !== 'all') where.role = role;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, email: true, fullName: true, role: true,
        department: true, phone: true, enrollmentYear: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (err) {
    console.error('Users list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:id — admin: delete user
router.delete('/:id', authenticate, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('User delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
