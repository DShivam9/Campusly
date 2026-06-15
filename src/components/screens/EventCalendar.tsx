import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Star,
} from 'lucide-react';

const events = [
  { title: 'Tech Fest 2024', date: 'Dec 10-12', time: '9:00 AM', location: 'Main Auditorium', category: 'fest', attendees: 500 },
  { title: 'Guest Lecture: AI Ethics', date: 'Dec 15', time: '2:00 PM', location: 'Seminar Hall B', category: 'academic', attendees: 120 },
  { title: 'Cultural Night', date: 'Dec 18', time: '6:00 PM', location: 'Open Air Theatre', category: 'cultural', attendees: 800 },
  { title: 'Hackathon: Build for Good', date: 'Dec 20-21', time: '10:00 AM', location: 'CS Lab Block', category: 'tech', attendees: 200 },
  { title: 'Sports Day', date: 'Dec 22', time: '8:00 AM', location: 'Sports Ground', category: 'sports', attendees: 600 },
  { title: 'Semester Exams Begin', date: 'Jan 5', time: '9:00 AM', location: 'Exam Halls', category: 'exam', attendees: 0 },
];

const categoryColors: Record<string, { badge: string; dot: string }> = {
  fest: { badge: 'badge-accent', dot: 'bg-accent-light' },
  academic: { badge: 'badge-info', dot: 'bg-cyan-400' },
  cultural: { badge: 'badge-warning', dot: 'bg-amber-400' },
  tech: { badge: 'badge-success', dot: 'bg-emerald-400' },
  sports: { badge: 'badge-danger', dot: 'bg-red-400' },
  exam: { badge: 'badge-warning', dot: 'bg-amber-400' },
};

const categories = ['All', 'fest', 'academic', 'cultural', 'tech', 'sports', 'exam'];

export function EventCalendar() {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? events : events.filter(e => e.category === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Events & Calendar</h1>
        <p className="text-white/50 mt-1">Campus events and important dates</p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
              filter === cat
                ? 'bg-accent text-black'
                : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((event, i) => {
          const catStyle = categoryColors[event.category] || categoryColors.academic;
          return (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card-dark p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`badge ${catStyle.badge} capitalize`}>{event.category}</span>
                <button className="p-1 rounded hover:bg-white/[0.06] transition-colors">
                  <Star className="w-4 h-4 text-white/25 hover:text-amber-400" />
                </button>
              </div>
              <h3 className="text-base font-semibold text-white mb-3">{event.title}</h3>
              <div className="space-y-2 mt-auto">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{event.location}</span>
                </div>
                {event.attendees > 0 && (
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Users className="w-3.5 h-3.5" />
                    <span>{event.attendees} expected</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
