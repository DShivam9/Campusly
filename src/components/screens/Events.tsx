import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Loader2,
  AlertTriangle,
  X,
  FileEdit,
  Trash2,
  Plus
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../lib/api';

const categoryColors: Record<string, string> = {
  tech: 'border-white/10 text-white/40',
  social: 'border-white/20 text-white/60',
  sports: 'border-white/30 text-white/80',
  academic: 'border-white/25 text-white/70',
  cultural: 'border-white/15 text-white/50',
};

export function Events() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const { data, isLoading, error, refetch } = useApi(() => api.fetchEvents(), []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/60 gap-3">
        <AlertTriangle className="w-8 h-8 text-white/40" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const allEvents = data?.events || [];
  const categories = ['all', ...new Set(allEvents.map((e: any) => e.category || 'other'))];

  const filtered = allEvents.filter((e: any) => {
    const matchesSearch = !search || e.title?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || e.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-white/50 mt-1">Discover campus events and activities</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
            className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
                filter === cat
                  ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                  : 'bg-white/[0.03] text-white/30 border-white/[0.06] hover:bg-white/[0.06]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <p className="text-sm text-white/40 text-center py-8 col-span-full">No events found</p>
        )}
        {filtered.map((event: any, i: number) => {
          const catClass = categoryColors[event.category] || categoryColors.academic;
          return (
            <motion.div
              key={event.id || i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card-dark p-5 hover:border-white/[0.12] transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{event.icon || '📅'}</div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${catClass}`}>
                  {event.category || 'event'}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white/90 mb-2 group-hover:text-white transition-colors">
                {event.title}
              </h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-white/45">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/45">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/45">
                  <Users className="w-3.5 h-3.5" />
                  <span>{event.attendees} attending</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => setSelectedEvent(event)}
                  className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-white/[0.03] hover:bg-white text-white/40 hover:text-black border border-white/[0.06] hover:border-white transition-all duration-300"
                >
                  View Details
                </button>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button 
                      onClick={() => { setEditingEvent(event); setIsEventModalOpen(true); }}
                      className="p-2 rounded-lg bg-white/[0.03] hover:bg-white text-white/20 hover:text-black border border-white/[0.06] hover:border-white transition-all"
                    >
                      <FileEdit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={async () => {
                        if (window.confirm('Delete event?')) {
                          await api.deleteEvent(event.id);
                          refetch();
                        }
                      }}
                      className="p-2 rounded-lg bg-white/[0.03] hover:bg-red-500 text-white/20 hover:text-white border border-white/[0.06] hover:border-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Event Details/Register Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-lg bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="h-32 bg-white/5 relative">
                <div className="absolute -bottom-6 left-6 text-5xl bg-zinc-900 p-4 rounded-2xl border border-white/10">
                  {selectedEvent.icon || '📅'}
                </div>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/70 backdrop-blur-md transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 pt-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${categoryColors[selectedEvent.category] || categoryColors.academic}`}>
                    {selectedEvent.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">{selectedEvent.title}</h2>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  {selectedEvent.description || "Join us for this exciting campus event! Bring your ID and passion."}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 text-white/50">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <Calendar className="w-4 h-4 text-white/40" />
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-bold">
                      <div className="text-white/20">Date</div>
                      {selectedEvent.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-white/50">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <MapPin className="w-4 h-4 text-white/40" />
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-bold">
                      <div className="text-white/20">Location</div>
                      {selectedEvent.location}
                    </div>
                  </div>
                </div>

                <button
                  disabled={isRegistering}
                  onClick={async () => {
                    setIsRegistering(true);
                    try {
                      await api.registerForEvent(selectedEvent.id);
                      setSelectedEvent(null);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsRegistering(false);
                    }
                  }}
                  className="w-full py-4 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 disabled:opacity-20 transition-all flex items-center justify-center gap-2"
                >
                  {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : "Secure My Spot"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {isEventModalOpen && (
        <EventModal 
          event={editingEvent} 
          onClose={() => setIsEventModalOpen(false)} 
          onSave={() => { setIsEventModalOpen(false); refetch(); }} 
        />
      )}
    </div>
  );
}

const EventModal = ({ event, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    venue: event?.location || event?.venue || '',
    startsAt: event?.startsAt ? new Date(event.startsAt).toISOString().slice(0, 16) : '',
    category: event?.category || 'academic',
    maxAttendees: event?.capacity || event?.maxAttendees || 100,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (event) {
        await api.updateEvent(event.id, formData);
      } else {
        await api.createEvent(formData);
      }
      onSave();
    } catch (err: any) {
      alert(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-lg p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{event ? 'Edit Event' : 'Create New Event'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white p-2"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-white/30">Event Title</label>
            <input 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="input-dark text-sm w-full" required 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-white/30">Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="input-dark text-sm min-h-[100px] w-full py-2" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/30">Date & Time</label>
              <input 
                type="datetime-local" 
                value={formData.startsAt} 
                onChange={e => setFormData({...formData, startsAt: e.target.value})} 
                className="input-dark text-sm w-full" required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/30">Venue</label>
              <input 
                value={formData.venue} 
                onChange={e => setFormData({...formData, venue: e.target.value})} 
                className="input-dark text-sm w-full" required 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/30">Category</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})} 
                className="input-dark text-sm w-full"
              >
                <option value="academic">Academic</option>
                <option value="cultural">Cultural</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="sports">Sports</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/30">Max Capacity</label>
              <input 
                type="number" 
                value={formData.maxAttendees} 
                onChange={e => setFormData({...formData, maxAttendees: parseInt(e.target.value)})} 
                className="input-dark text-sm w-full" 
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-zinc-200 transition-all flex justify-center mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : event ? 'Update Event' : 'Publish Event'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
