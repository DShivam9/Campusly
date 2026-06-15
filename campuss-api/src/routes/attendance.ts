import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/attendance — student sees their records, faculty sees for their courses
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const courseId = req.query.courseId as string | undefined;

    let where: any = {};

    if (role === 'student') {
      where.studentId = userId;
    } else if (role === 'faculty') {
      where.course = { facultyId: userId };
    }

    if (courseId) {
      where.courseId = courseId;
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        course: { select: { code: true, name: true } },
        student: { select: { id: true, fullName: true } },
      },
      orderBy: { date: 'desc' },
      take: 200,
    });

    // Also compute summary per course for the student
    if (role === 'student') {
      const courseIds = [...new Set(records.map(r => r.courseId))];
      const summary = courseIds.map(cId => {
        const courseRecords = records.filter(r => r.courseId === cId);
        const total = courseRecords.length;
        const present = courseRecords.filter(r => r.status === 'present' || r.status === 'late').length;
        return {
          courseId: cId,
          courseCode: courseRecords[0]?.course.code,
          courseName: courseRecords[0]?.course.name,
          totalClasses: total,
          attended: present,
          percentage: total > 0 ? Math.round((present / total) * 100) : 0,
        };
      });
      res.json({ records, summary });
      return;
    }

    res.json({ records });
  } catch (err) {
    console.error('Attendance GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const markAttendanceSchema = z.object({
  courseId: z.string().uuid(),
  date: z.string(),
  entries: z.array(z.object({
    studentId: z.string().uuid(),
    status: z.enum(['present', 'absent', 'late']),
  })),
});

// POST /api/attendance — faculty marks attendance
router.post('/', authenticate, requireRole('faculty', 'admin'), validate(markAttendanceSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, date, entries } = req.body;
    const markedBy = req.user!.userId;

    const records = entries.map((e: any) => ({
      studentId: e.studentId,
      courseId,
      date: new Date(date),
      status: e.status,
      markedBy,
    }));

    await prisma.attendanceRecord.createMany({ data: records, skipDuplicates: true });
    res.status(201).json({ message: 'Attendance marked', count: records.length });
  } catch (err) {
    console.error('Attendance POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
