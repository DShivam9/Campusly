import {
  BookOpen,
  Clock,
  GraduationCap,
  TrendingUp,
  Calendar,
  Bell,
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import * as api from '../../lib/api';

const ICON_MAP: Record<string, any> = {
  Clock, GraduationCap, BookOpen, TrendingUp,
};

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, error } = useApi(() => api.fetchDashboard(), []);
  const { data: timetableData } = useApi(() => api.fetchTimetable(), []);
  const { data: notifData } = useApi(() => api.fetchNotifications(), []);

  const firstName = user?.fullName?.split(' ')[0] || 'Student';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/60 gap-3">
        <AlertTriangle className="w-8 h-8 text-white/50" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const stats = data?.stats || {};

  // Today's schedule from timetable
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const schedule = (timetableData?.timetable?.[today] || []).map((cls: any) => ({
    time: cls.time?.split(' - ')[0] || cls.time,
    subject: cls.subject,
    room: cls.room,
    status: 'upcoming',
  }));

  // Recent activity from notifications
  const activity = (notifData?.notifications || []).slice(0, 5).map((n: any) => ({
    text: n.title + (n.body ? `: ${n.body}` : ''),
    time: new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    type: n.type === 'error' ? 'warning' : n.type === 'warning' ? 'warning' : n.type === 'success' ? 'success' : 'info',
  }));

  const statCards = [
    { label: 'Attendance', value: stats.attendancePercentage != null ? `${stats.attendancePercentage}%` : '—', change: '', iconKey: 'Clock' },
    { label: 'Courses', value: stats.courses ?? stats.totalCourses ?? '—', change: 'Enrolled', iconKey: 'GraduationCap' },
    { label: 'Events', value: stats.upcomingEvents ?? '—', change: 'Upcoming', iconKey: 'BookOpen' },
    { label: 'Notifications', value: stats.unreadNotifications ?? stats.pendingRequests ?? '—', change: 'Unread', iconKey: 'TrendingUp' },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {firstName}</h1>
        <p className="text-white/50 mt-1">Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = ICON_MAP[stat.iconKey] || Clock;
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white/80" />
                </div>
                <span className="text-xs font-medium text-white/50">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-white/50 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* 2-Column Layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-3 card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-white/70" />
              <h3 className="text-base font-semibold text-white">Today's Schedule</h3>
            </div>
            <button 
              onClick={() => navigate('/timetable')}
              className="text-xs text-white/50 hover:text-white font-medium flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {schedule.length === 0 && (
              <p className="text-sm text-white/40 text-center py-6">No classes scheduled today</p>
            )}
            {schedule.map((cls: any, i: number) => (
              <div
                key={i}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors border ${
                  cls.status === 'ongoing'
                    ? 'bg-white/5 border-white/10'
                    : 'bg-transparent border-transparent hover:bg-white/[0.04]'
                }`}
              >
                <div className="text-sm font-medium text-white/50 w-20 flex-shrink-0">{cls.time}</div>
                <div className={`w-1 h-8 rounded-full flex-shrink-0 ${
                  cls.status === 'completed' ? 'bg-white' :
                  cls.status === 'ongoing' ? 'bg-white' : 'bg-white/20'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/90">{cls.subject}</p>
                  <p className="text-xs text-white/40">{cls.room}</p>
                </div>
                {cls.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />}
                {cls.status === 'ongoing' && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-white text-black font-bold">LIVE</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 card-dark p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-white/70" />
            <h3 className="text-base font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {activity.length === 0 && (
              <p className="text-sm text-white/40 text-center py-6">No recent activity</p>
            )}
            {activity.map((item: any, i: number) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-transparent hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-white/50" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80">{item.text}</p>
                  <p className="text-xs text-white/35 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
