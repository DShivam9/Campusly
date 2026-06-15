import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/requests
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const status = req.query.status as string | undefined;

    const where: any = {};
    if (role === 'student') {
      where.studentId = userId;
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    const requests = await prisma.serviceRequest.findMany({
      where,
      include: {
        student: { select: { fullName: true } },
        handler: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = requests.map(r => ({
      id: r.id,
      title: r.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: r.description,
      category: r.type,
      priority: r.priority,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      assignedTo: r.handler?.fullName,
      studentName: r.student.fullName,
    }));

    res.json({ requests: formatted });
  } catch (err) {
    console.error('Requests GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const createRequestSchema = z.object({
  type: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

// POST /api/requests
router.post('/', authenticate, validate(createRequestSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await prisma.serviceRequest.create({
      data: {
        ...req.body,
        studentId: req.user!.userId,
      },
    });
    res.status(201).json(request);
  } catch (err) {
    console.error('Request POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const updateRequestSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'rejected']).optional(),
});

// PATCH /api/requests/:id — admin updates status
router.patch('/:id', authenticate, requireRole('admin'), validate(updateRequestSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await prisma.serviceRequest.update({
      where: { id: req.params.id as string },
      data: {
        ...req.body,
        handledBy: req.user!.userId,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error('Request PATCH error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
