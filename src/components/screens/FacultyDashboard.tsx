import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Calendar,
  ChevronRight,
  FileText,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import * as api from '../../lib/api';

export function FacultyDashboard() {
  const { user } = useAuth();
  const { data, isLoading, error } = useApi(() => api.fetchDashboard(), []);
  const { data: timetableData } = useApi(() => api.fetchTimetable(), []);

  const firstName = user?.fullName?.split(' ')[0] || 'Professor';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-accent-light animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/60 gap-3">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const stats = data?.stats || {};

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents ?? '—', change: '', icon: Users, color: 'text-accent-light', bg: 'bg-accent-muted' },
    { label: 'Courses', value: stats.courses ?? '—', change: 'Active', icon: BookOpen, color: 'text-cyan-400', bg: 'bg-info-muted' },
    { label: 'Upcoming Events', value: stats.upcomingEvents ?? '—', change: '', icon: ClipboardCheck, color: 'text-amber-400', bg: 'bg-warning-muted' },
    { label: 'Avg Attendance', value: '—', change: '', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-success-muted' },
  ];

  // Get today's classes from timetable
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = timetableData?.timetable?.[today] || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Good Morning, Prof. {firstName} 👋</h1>
          <p className="text-white/50 mt-1">Your teaching overview for today</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.location.href = '/app/attendance'}
            className="px-4 py-2 bg-accent text-black text-xs font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
          >
            <ClipboardCheck className="w-4 h-4" />
            Post Attendance
          </button>
          <button 
            onClick={() => window.location.href = '/app/grades'}
            className="px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-lg border border-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Post Grades
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {stat.change && <span className="text-xs font-medium text-emerald-400">{stat.change}</span>}
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-white/45 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* 2-Column */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Schedule */}
        <div className="lg:col-span-3 card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent-light" />
              <h3 className="text-base font-semibold text-white">Today's Classes</h3>
            </div>
            <button className="text-xs text-accent-light hover:text-accent font-medium flex items-center gap-1">
              Full Schedule <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {todayClasses.length === 0 && (
              <p className="text-sm text-white/40 text-center py-6">No classes scheduled today</p>
            )}
            {todayClasses.map((cls: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="text-sm font-medium text-white/50 w-20 flex-shrink-0">{cls.time?.split(' - ')[0] || cls.time}</div>
                <div className="w-1 h-8 rounded-full bg-accent-light/40 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/90">{cls.subject}</p>
                  <p className="text-xs text-white/40">{cls.room}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Info */}
        <div className="lg:col-span-2 card-dark p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-accent-light" />
            <h3 className="text-base font-semibold text-white">Upcoming Events</h3>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-white/40 text-center py-6">
              {stats.upcomingEvents ? `${stats.upcomingEvents} events upcoming` : 'No upcoming events'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
