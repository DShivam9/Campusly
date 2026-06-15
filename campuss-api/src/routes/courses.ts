import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/courses
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    let where: any = {};

    if (role === 'student') {
      where = { enrollments: { some: { studentId: userId } } };
    } else if (role === 'faculty') {
      where = { facultyId: userId };
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        faculty: { select: { fullName: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { code: 'asc' },
    });

    const formatted = courses.map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      faculty: c.faculty?.fullName || 'TBA',
      department: c.department,
      credits: c.credits,
      semester: c.semester,
      academicYear: c.academicYear,
      enrolledStudents: c._count.enrollments,
    }));

    res.json({ courses: formatted });
  } catch (err) {
    console.error('Courses GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/courses/:id/students — faculty/admin gets enrolled students
router.get('/:id/students', authenticate, requireRole('faculty', 'admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: req.params.id as string },
      include: {
        student: { select: { id: true, fullName: true, email: true, department: true } },
      },
    });

    const students = enrollments.map(e => e.student);
    res.json({ students });
  } catch (err) {
    console.error('Course students error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const createCourseSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  department: z.string().optional(),
  credits: z.number().min(1).optional(),
  semester: z.number().optional(),
  academicYear: z.string().optional(),
});

// POST /api/courses — admin creates course
router.post('/', authenticate, requireRole('admin'), validate(createCourseSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await prisma.course.create({ data: req.body });
    res.status(201).json(course);
  } catch (err) {
    console.error('Course POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/courses/:id/enroll — student enrolls
router.post('/:id/enroll', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id as string;
    const studentId = req.user!.userId;

    const existing = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });

    if (existing) {
      res.status(409).json({ error: 'Already enrolled' });
      return;
    }

    await prisma.enrollment.create({ data: { studentId, courseId } });
    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (err) {
    console.error('Course enroll error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
