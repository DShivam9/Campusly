import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/library — browse catalog and see issued books
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    const search = req.query.search as string | undefined;
    const tab = req.query.tab as string | undefined; // 'catalog' or 'issued'

    let where: any = {};
    if (tab === 'issued') {
      where.borrowerId = userId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    const books = await prisma.libraryBook.findMany({
      where,
      orderBy: { title: 'asc' },
    });

    // Stats
    const allBooks = await prisma.libraryBook.findMany();
    const totalCatalog = allBooks.length;
    const myIssued = allBooks.filter(b => b.borrowerId === userId).length;
    const overdue = allBooks.filter(b => b.borrowerId === userId && b.status === 'overdue').length;
    const available = allBooks.filter(b => b.status === 'available').length;

    res.json({
      books: books.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        status: b.status,
        copies: b.copies,
        dueDate: b.dueDate,
        category: b.category,
      })),
      stats: { totalCatalog, myIssued, overdue, available },
    });
  } catch (err) {
    console.error('Library error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
