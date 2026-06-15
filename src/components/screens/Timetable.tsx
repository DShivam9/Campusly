import { motion } from 'framer-motion';
import { Clock, MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import * as api from '../../lib/api';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const typeStyles: Record<string, { badge: string; border: string }> = {
  lecture: { badge: 'badge-accent', border: 'border-accent/20' },
  lab: { badge: 'badge-success', border: 'border-emerald-500/20' },
  tutorial: { badge: 'badge-info', border: 'border-cyan-500/20' },
};

export function Timetable() {
  const { data, isLoading, error } = useApi(() => api.fetchTimetable(), []);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

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

  const timetable = data?.timetable || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Timetable</h1>
        <p className="text-white/50 mt-1">Your weekly class schedule</p>
      </div>

      <div className="space-y-6">
        {days.map((day, di) => {
          const classes = timetable[day] || [];
          const isToday = day === today;

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: di * 0.08 }}
              className="card-dark p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <h3 className={`text-base font-semibold ${isToday ? 'text-accent-light' : 'text-white/80'}`}>
                  {day}
                </h3>
                {isToday && <span className="badge badge-accent text-[10px]">Today</span>}
                <span className="text-xs text-white/30 ml-auto">{classes.length} classes</span>
              </div>

              {classes.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {classes.map((cls: any, ci: number) => {
                    const style = typeStyles[cls.type] || typeStyles.lecture;
                    return (
                      <div
                        key={ci}
                        className={`p-3 rounded-lg bg-white/[0.02] border ${style.border} hover:bg-white/[0.04] transition-colors`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`badge ${style.badge} text-[10px] capitalize`}>{cls.type}</span>
                        </div>
                        <p className="text-sm font-medium text-white/90 mb-2">{cls.subject}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-white/40">
                            <Clock className="w-3 h-3" />
                            <span>{cls.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-white/40">
                            <MapPin className="w-3 h-3" />
                            <span>{cls.room}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-white/30">No classes scheduled</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
