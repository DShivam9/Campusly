import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  MessageSquare,
  Star,
  Calendar,
  ChevronRight,
  MapPin,
} from 'lucide-react';

const stats = [
  { label: 'Connections', value: '234', change: '+18', icon: Users, color: 'text-accent-light', bg: 'bg-accent-muted' },
  { label: 'Mentoring', value: '3', change: 'Active', icon: Star, color: 'text-amber-400', bg: 'bg-warning-muted' },
  { label: 'Job Referrals', value: '12', change: 'Open', icon: Briefcase, color: 'text-cyan-400', bg: 'bg-info-muted' },
  { label: 'Messages', value: '8', change: 'Unread', icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-success-muted' },
];

const upcomingEvents = [
  { title: 'Annual Alumni Meet 2024', date: 'Dec 15, 2024', location: 'Main Auditorium' },
  { title: 'Tech Talk: AI in Industry', date: 'Dec 20, 2024', location: 'Virtual' },
  { title: 'Career Fair 2025', date: 'Jan 10, 2025', location: 'Sports Complex' },
];

const mentorRequests = [
  { name: 'Priya Sharma', branch: 'CSE, 3rd Year', topic: 'Career in Cloud Computing' },
  { name: 'Amit Verma', branch: 'ECE, 4th Year', topic: 'Interview Preparation' },
  { name: 'Sneha Patel', branch: 'CSE, 2nd Year', topic: 'Open Source Contributions' },
];

export function AlumniDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, Alumni Member 👋</h1>
        <p className="text-white/50 mt-1">Stay connected with your alma mater</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
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
              <span className="text-xs font-medium text-emerald-400">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-white/45 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* 2-Column */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Events */}
        <div className="lg:col-span-3 card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent-light" />
              <h3 className="text-base font-semibold text-white">Upcoming Events</h3>
            </div>
            <button className="text-xs text-accent-light hover:text-accent font-medium flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((evt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-accent-light">{evt.date.split(' ')[0]}</span>
                  <span className="text-[10px] text-white/40">{evt.date.split(' ')[1]?.replace(',', '')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/90">{evt.title}</p>
                  <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {evt.location}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mentor Requests */}
        <div className="lg:col-span-2 card-dark p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Mentor Requests</h3>
          </div>
          <div className="space-y-3">
            {mentorRequests.map((req, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {req.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/85">{req.name}</p>
                  <p className="text-xs text-white/40">{req.branch}</p>
                  <p className="text-xs text-accent-light/70 mt-0.5">{req.topic}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
