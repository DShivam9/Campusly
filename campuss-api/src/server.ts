import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import attendanceRoutes from './routes/attendance';
import gradesRoutes from './routes/grades';
import busRoutes from './routes/bus';
import eventsRoutes from './routes/events';
import marketplaceRoutes from './routes/marketplace';
import requestsRoutes from './routes/requests';
import alumniRoutes from './routes/alumni';
import usersRoutes from './routes/users';
import notificationsRoutes from './routes/notifications';
import coursesRoutes from './routes/courses';
import timetableRoutes from './routes/timetable';
import libraryRoutes from './routes/library';
import feesRoutes from './routes/fees';
import adminRoutes from './routes/admin';
import messagesRoutes from './routes/messages';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
}));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messagesRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Campusly API running on http://localhost:${PORT}`);
});

export default app;
