import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/marketplace
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const where: any = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    // Role-based visibility
    if (req.user!.role !== 'admin') {
      where.OR = [
        { status: 'approved' },
        { sellerId: req.user!.userId } // Users can see their own pending/rejected items
      ];
    }

    if (search) {
      const searchFilter = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      };
      
      if (where.OR) {
        // If we already have an OR for status, we must combine carefully
        const existingOr = where.OR;
        delete where.OR;
        where.AND = [
          { OR: existingOr },
          searchFilter
        ];
      } else {
        where.OR = searchFilter.OR;
      }
    }

    const items = await prisma.marketplaceListing.findMany({
      where,
      include: {
        seller: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      category: item.category,
      condition: item.condition,
      seller: item.seller.fullName,
      sellerAvatar: item.seller.avatarUrl,
      sellerId: item.seller.id,
      images: item.imageUrls,
      createdAt: item.createdAt.toISOString(),
      status: item.status,
    }));

    res.json({ items: formatted });
  } catch (err) {
    console.error('Marketplace GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const createListingSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  category: z.string().optional(),
  condition: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
});

// POST /api/marketplace
router.post('/', authenticate, validate(createListingSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const listing = await prisma.marketplaceListing.create({
      data: {
        ...req.body,
        imageUrls: req.body.imageUrls || [],
        sellerId: req.user!.userId,
      },
    });
    res.status(201).json(listing);
  } catch (err) {
    console.error('Marketplace POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/marketplace/:id
router.patch('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const listing = await prisma.marketplaceListing.findUnique({ where: { id: req.params.id as string } });
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    if (listing.sellerId !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const updated = await prisma.marketplaceListing.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    console.error('Marketplace PATCH error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/marketplace/:id
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const listing = await prisma.marketplaceListing.findUnique({ where: { id: req.params.id as string } });
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    if (listing.sellerId !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.marketplaceListing.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    console.error('Marketplace DELETE error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
