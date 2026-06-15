import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/events
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string | undefined;
    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: { select: { fullName: true } },
        _count: { select: { registrations: true } },
        registrations: {
          where: { userId: req.user!.userId },
          select: { id: true },
        },
      },
      orderBy: { startsAt: 'asc' },
    });

    const formatted = events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.startsAt.toISOString().split('T')[0],
      time: e.startsAt.toISOString().split('T')[1]?.substring(0, 5),
      location: e.venue,
      category: e.category,
      organizer: e.organizer?.fullName || 'Unknown',
      capacity: e.maxAttendees || 0,
      registered: e._count.registrations,
      isRegistered: e.registrations.length > 0,
    }));

    res.json({ events: formatted });
  } catch (err) {
    console.error('Events GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  venue: z.string().optional(),
  startsAt: z.string(),
  endsAt: z.string().optional(),
  category: z.string().optional(),
  maxAttendees: z.number().optional(),
});

// POST /api/events
router.post('/', authenticate, requireRole('admin'), validate(createEventSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await prisma.event.create({
      data: {
        ...req.body,
        startsAt: new Date(req.body.startsAt),
        endsAt: req.body.endsAt ? new Date(req.body.endsAt) : null,
        organizerId: req.user!.userId,
      },
    });
    res.status(201).json(event);
  } catch (err) {
    console.error('Event POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/events/:id
router.patch('/:id', authenticate, requireRole('admin'), validate(createEventSchema.partial()), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { startsAt, endsAt, ...rest } = req.body;
    
    const data: any = { ...rest };
    if (startsAt) data.startsAt = new Date(startsAt);
    if (endsAt) data.endsAt = new Date(endsAt);

    const event = await prisma.event.update({
      where: { id },
      data
    });
    res.json(event);
  } catch (err) {
    console.error('Event PATCH error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/events/:id/register
router.post('/:id/register', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = req.params.id as string;
    const userId = req.user!.userId;

    // Check if already registered
    const existing = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (existing) {
      // Unregister
      await prisma.eventRegistration.delete({ where: { id: existing.id } });
      res.json({ registered: false, message: 'Unregistered from event' });
      return;
    }

    // Check capacity
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: true } } },
    });

    if (event?.maxAttendees && event._count.registrations >= event.maxAttendees) {
      res.status(400).json({ error: 'Event is full' });
      return;
    }

    await prisma.eventRegistration.create({ data: { eventId, userId } });
    res.status(201).json({ registered: true, message: 'Registered for event' });
  } catch (err) {
    console.error('Event register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/events/:id
router.delete('/:id', authenticate, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.eventRegistration.deleteMany({ where: { eventId: req.params.id as string } });
    await prisma.event.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('Event DELETE error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
