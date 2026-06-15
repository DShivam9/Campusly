import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formatted = notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.body,
      type: n.type,
      read: n.isRead,
      createdAt: n.createdAt.toISOString(),
    }));

    res.json({ notifications: formatted });
  } catch (err) {
    console.error('Notifications GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id as string },
      data: { isRead: true },
    });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error('Notification read error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    console.error('Notification read-all error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
