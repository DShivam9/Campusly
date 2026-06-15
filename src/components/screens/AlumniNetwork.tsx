import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Users,
  Briefcase,
  MessageSquare,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import * as api from '../../lib/api';

export function AlumniNetwork() {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useApi(() => api.fetchAlumni(), []);

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

  const alumni = data?.alumni || [];
  const filtered = !search
    ? alumni
    : alumni.filter(
        (a: any) =>
          a.name?.toLowerCase().includes(search.toLowerCase()) ||
          a.role?.toLowerCase().includes(search.toLowerCase()) ||
          a.company?.toLowerCase().includes(search.toLowerCase()),
      );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Alumni Network</h1>
        <p className="text-white/50 mt-1">Connect with alumni from your institution</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Alumni', value: alumni.length.toString(), icon: Users, color: 'text-white/70', bg: 'bg-white/5' },
          { label: 'Connected', value: Math.floor(alumni.length * 0.7).toString(), icon: Users, color: 'text-white/50', bg: 'bg-white/5' },
          { label: 'Companies', value: new Set(alumni.map((a: any) => a.company)).size.toString(), icon: Briefcase, color: 'text-white/40', bg: 'bg-white/5' },
          { label: 'Messages', value: '24', icon: MessageSquare, color: 'text-white/30', bg: 'bg-white/5' },
        ].map((stat, i) => (
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
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-white/45 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
        <input
          type="text"
          placeholder="Search alumni by name, company, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-dark pl-10"
        />
      </div>

      {/* Alumni Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <p className="text-sm text-white/40 text-center py-8 col-span-full">No alumni found</p>
        )}
        {filtered.map((person: any, i: number) => {
          const initials = (person.name || '')
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          return (
            <motion.div
              key={person.id || i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card-dark p-5 hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center text-accent-light text-sm font-bold">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white/90 truncate">{person.name}</h3>
                  <p className="text-xs text-white/40">Class of {person.year || person.graduationYear || '—'}</p>
                </div>
              </div>
              <p className="text-xs text-white/55 mb-4 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3 flex-shrink-0" />
                {person.role || person.position || 'Role'} @ {person.company || '—'}
              </p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg text-xs font-semibold bg-accent/10 text-accent-light border border-accent/20 hover:bg-accent/20 transition-all">
                  Connect
                </button>
                <button className="flex-1 py-2 rounded-lg text-xs font-semibold bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.06] transition-all">
                  Message
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
