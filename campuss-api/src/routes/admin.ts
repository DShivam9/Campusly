import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';

const router = Router();

// Only admin
router.use(authenticate, requireRole('admin'));

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  fullName: z.string().min(1),
  role: z.enum(['student', 'faculty', 'admin', 'alumni']),
  department: z.string().optional(),
  enrollmentYear: z.number().optional(),
  phone: z.string().optional(),
});

const updateUserSchema = z.object({
  fullName: z.string().optional(),
  role: z.enum(['student', 'faculty', 'admin', 'alumni']).optional(),
  department: z.string().optional(),
  enrollmentYear: z.number().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

// POST /api/admin/users - Admin creating a user
router.post('/users', validate(createUserSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, role, department, enrollmentYear, phone } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, fullName, role, department, enrollmentYear, phone }
    });
    res.status(201).json(user);
  } catch (err) {
    console.error('Admin Create User error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/users/:id - Admin editing a user
router.patch('/users/:id', validate(updateUserSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const updated = await prisma.user.update({
      where: { id },
      data: req.body
    });
    res.json(updated);
  } catch (err) {
    console.error('Admin Update User error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/events - Oversight view of all events
router.get('/events', async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      include: {
        organizer: { select: { fullName: true } },
        _count: { select: { registrations: true } }
      },
      orderBy: { startsAt: 'desc' }
    });
    res.json({ events });
  } catch (err) {
    console.error('Admin Events GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/marketplace/pending
router.get('/marketplace/pending', async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.marketplaceListing.findMany({
      where: { status: 'pending' },
      include: {
        seller: { select: { id: true, fullName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formatted = items.map(item => ({
      ...item,
      seller: item.seller.fullName,
      sellerAvatar: item.seller.avatarUrl,
    }));
    
    res.json({ items: formatted });
  } catch (err) {
    console.error('Admin Marketplace GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/marketplace/:id
router.patch('/marketplace/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    
    const id = req.params.id as string;
    const updated = await prisma.marketplaceListing.update({
      where: { id },
      data: { status }
    });
    res.json(updated);
  } catch (err) {
    console.error('Admin Marketplace PATCH error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/requests/pending
router.get('/requests/pending', async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.serviceRequest.findMany({
      where: { status: 'pending' },
      include: {
        student: { select: { id: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formatted = requests.map(r => ({
      ...r,
      studentName: r.student.fullName
    }));
    
    res.json({ requests: formatted });
  } catch (err) {
    console.error('Admin Requests GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/requests/:id
router.patch('/requests/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['processing', 'completed', 'rejected', 'pending'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    const id = req.params.id as string;
    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: { 
        status,
        handledBy: req.user!.userId
      }
    });
    res.json(updated);
  } catch (err) {
    console.error('Admin Requests PATCH error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
