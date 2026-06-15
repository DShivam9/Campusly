import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user!;

    if (role === 'student') {
      const [enrollmentCount, attendanceRecords, upcomingEvents, unreadNotifications] = await Promise.all([
        prisma.enrollment.count({ where: { studentId: userId } }),
        prisma.attendanceRecord.findMany({ where: { studentId: userId } }),
        prisma.event.count({ where: { startsAt: { gte: new Date() } } }),
        prisma.notification.count({ where: { userId, isRead: false } }),
      ]);

      const totalClasses = attendanceRecords.length;
      const present = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
      const attendancePct = totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 0;

      res.json({
        role: 'student',
        stats: {
          courses: enrollmentCount,
          attendancePercentage: attendancePct,
          upcomingEvents,
          unreadNotifications,
        },
      });
      return;
    }

    if (role === 'faculty') {
      const [courseCount, totalStudents, upcomingEvents] = await Promise.all([
        prisma.course.count({ where: { facultyId: userId } }),
        prisma.enrollment.count({
          where: { course: { facultyId: userId } },
        }),
        prisma.event.count({ where: { startsAt: { gte: new Date() } } }),
      ]);

      res.json({
        role: 'faculty',
        stats: {
          courses: courseCount,
          totalStudents,
          upcomingEvents,
        },
      });
      return;
    }

    if (role === 'admin') {
      const [totalUsers, totalCourses, pendingRequests, upcomingEvents] = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.serviceRequest.count({ where: { status: 'pending' } }),
        prisma.event.count({ where: { startsAt: { gte: new Date() } } }),
      ]);

      res.json({
        role: 'admin',
        stats: {
          totalUsers,
          totalCourses,
          pendingRequests,
          upcomingEvents,
        },
      });
      return;
    }

    if (role === 'alumni') {
      const [totalAlumni, upcomingEvents, marketplaceListings] = await Promise.all([
        prisma.user.count({ where: { role: 'alumni' } }),
        prisma.event.count({ where: { startsAt: { gte: new Date() } } }),
        prisma.marketplaceListing.count({ where: { isSold: false } }),
      ]);

      res.json({
        role: 'alumni',
        stats: {
          totalAlumni,
          upcomingEvents,
          marketplaceListings,
        },
      });
      return;
    }

    res.json({ role, stats: {} });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
