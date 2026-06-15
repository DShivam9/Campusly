import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/messages/peers - list users you can message (alumni + all users)
// For simplicity, just return a list of alumni and faculty
router.get('/peers', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: { not: req.user!.userId },
        role: { in: ['alumni', 'faculty'] }
      },
      select: {
        id: true, fullName: true, role: true, avatarUrl: true, department: true
      }
    });
    res.json({ peers: users });
  } catch (err) {
    console.error('Messages GET peers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/messages/:peerId
router.get('/:peerId', authenticate, async (req: Request, res: Response): Promise<void> => {
  const peerId = req.params.peerId as string;
  const myId = req.user!.userId;
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: peerId },
          { senderId: peerId, receiverId: myId }
        ]
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ messages });
  } catch (err) {
    console.error('Messages GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const sendSchema = z.object({
  receiverId: z.string().uuid(),
  content: z.string().min(1)
});

// POST /api/messages
router.post('/', authenticate, validate(sendSchema), async (req: Request, res: Response): Promise<void> => {
  const { receiverId, content } = req.body;
  try {
    const message = await prisma.message.create({
      data: {
        senderId: req.user!.userId,
        receiverId,
        content
      }
    });
    res.status(201).json({ message });
  } catch (err) {
    console.error('Messages POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
