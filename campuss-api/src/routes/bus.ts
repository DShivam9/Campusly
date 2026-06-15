import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/bus/routes
router.get('/routes', authenticate, async (_req: Request, res: Response): Promise<void> => {
  try {
    const routes = await prisma.busRoute.findMany({
      include: {
        buses: {
          include: {
            locations: {
              orderBy: { recordedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const formatted = routes.map(route => ({
      id: route.id,
      routeNumber: route.routeCode,
      routeName: route.routeName,
      stops: route.stops,
      schedule: route.schedule,
      buses: route.buses.map(bus => ({
        id: bus.id,
        registration: bus.registration,
        capacity: bus.capacity,
        driver: bus.driverName,
        driverPhone: bus.driverPhone,
        currentLocation: bus.locations[0] ? {
          lat: bus.locations[0].lat,
          lng: bus.locations[0].lng,
          currentStop: bus.locations[0].currentStop,
          nextStop: bus.locations[0].nextStop,
          occupancy: bus.locations[0].occupancyPct,
        } : null,
      })),
    }));

    res.json({ routes: formatted });
  } catch (err) {
    console.error('Bus routes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bus/locations — latest locations for all buses
router.get('/locations', authenticate, async (_req: Request, res: Response): Promise<void> => {
  try {
    const buses = await prisma.bus.findMany({
      include: {
        route: { select: { routeCode: true, routeName: true } },
        locations: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    const locations = buses
      .filter(b => b.locations.length > 0)
      .map(b => ({
        busId: b.id,
        registration: b.registration,
        routeCode: b.route.routeCode,
        routeName: b.route.routeName,
        lat: b.locations[0].lat,
        lng: b.locations[0].lng,
        currentStop: b.locations[0].currentStop,
        nextStop: b.locations[0].nextStop,
        occupancyPct: b.locations[0].occupancyPct,
        recordedAt: b.locations[0].recordedAt,
      }));

    res.json({ locations });
  } catch (err) {
    console.error('Bus locations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
