import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/grades — student sees their grades, faculty sees grades for their courses
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user!;

    let where: any = {};
    if (role === 'student') {
      where.studentId = userId;
    } else if (role === 'faculty') {
      where.course = { facultyId: userId };
    }

    const grades = await prisma.grade.findMany({
      where,
      include: {
        course: { select: { code: true, name: true, credits: true } },
        student: { select: { id: true, fullName: true } },
      },
      orderBy: { course: { code: 'asc' } },
    });

    // Compute GPA-like summary for students
    if (role === 'student') {
      const courseMap = new Map<string, { code: string; name: string; credits: number; totalScore: number; totalMax: number }>();
      for (const g of grades) {
        if (!courseMap.has(g.courseId)) {
          courseMap.set(g.courseId, {
            code: g.course.code,
            name: g.course.name,
            credits: g.course.credits,
            totalScore: 0,
            totalMax: 0,
          });
        }
        const c = courseMap.get(g.courseId)!;
        c.totalScore += g.score;
        c.totalMax += g.maxScore;
      }

      const courseSummary = Array.from(courseMap.entries()).map(([courseId, data]) => {
        const pct = data.totalMax > 0 ? Math.round((data.totalScore / data.totalMax) * 100) : 0;
        let grade = 'F';
        if (pct >= 90) grade = 'A+';
        else if (pct >= 80) grade = 'A';
        else if (pct >= 70) grade = 'B+';
        else if (pct >= 60) grade = 'B';
        else if (pct >= 50) grade = 'C';
        else if (pct >= 40) grade = 'D';
        return { courseId, ...data, percentage: pct, grade };
      });

      res.json({ grades, courseSummary });
      return;
    }

    res.json({ grades });
  } catch (err) {
    console.error('Grades GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const addGradeSchema = z.object({
  courseId: z.string().uuid(),
  studentId: z.string().uuid(),
  component: z.string().min(1),
  score: z.coerce.number().min(0),
  maxScore: z.coerce.number().min(1),
});

// POST /api/grades — faculty enters a grade
router.post('/', authenticate, requireRole('faculty', 'admin'), validate(addGradeSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, studentId, component, score, maxScore } = req.body;
    const grade = await prisma.grade.create({
      data: { courseId, studentId, component, score, maxScore, gradedBy: req.user!.userId },
    });
    res.status(201).json(grade);
  } catch (err) {
    console.error('Grade POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
