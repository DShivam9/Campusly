import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/timetable — student's weekly timetable
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user!;

    let entries: any[] = [];
    if (role === 'student') {
      entries = await prisma.timetableEntry.findMany({
        where: { studentId: userId },
        include: { course: { select: { code: true, name: true } } },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });
    } else if (role === 'faculty') {
      entries = await prisma.timetableEntry.findMany({
        where: { course: { facultyId: userId } },
        include: { course: { select: { code: true, name: true } } },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });
      // Deduplicate (same course+day+time appears for each student)
      const seen = new Set<string>();
      entries = entries.filter(e => {
        const key = `${e.courseId}-${e.dayOfWeek}-${e.startTime}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } else {
      entries = [];
    }

    // Group by day
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const grouped: Record<string, any[]> = {};
    for (const day of dayOrder) grouped[day] = [];

    for (const e of entries) {
      const day = e.dayOfWeek;
      if (grouped[day]) {
        grouped[day].push({
          id: e.id,
          time: `${e.startTime} - ${e.endTime}`,
          subject: e.course.name,
          code: e.course.code,
          room: e.room,
          type: e.type,
        });
      }
    }

    res.json({ timetable: grouped });
  } catch (err) {
    console.error('Timetable error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
