import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/fees — student's fee records
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;

    const records = await prisma.feeRecord.findMany({
      where: { studentId: userId },
      orderBy: { dueDate: 'asc' },
    });

    const breakdown = records.map(r => ({
      id: r.id,
      item: r.item,
      amount: r.amount,
      status: r.status,
      dueDate: r.dueDate,
      semester: r.semester,
    }));

    const paymentHistory = records
      .filter(r => r.status === 'paid' && r.paidAt)
      .map(r => ({
        date: r.paidAt,
        amount: r.amount,
        method: r.method || 'Unknown',
        ref: r.txnRef || '—',
        item: r.item,
      }))
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

    const totalFee = records.reduce((s, r) => s + r.amount, 0);
    const paidAmount = records.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0);
    const overdueCount = records.filter(r => r.status === 'overdue').length;

    res.json({
      breakdown,
      paymentHistory,
      stats: { totalFee, paidAmount, pendingAmount: totalFee - paidAmount, overdueCount },
    });
  } catch (err) {
    console.error('Fees error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
