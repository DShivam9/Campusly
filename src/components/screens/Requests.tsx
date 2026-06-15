import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  X,
  Send,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../lib/api';

const statusStyles: Record<string, { badge: string; icon: typeof Clock }> = {
  open: { badge: 'border-white/10 text-white/40', icon: Clock },
  'in-progress': { badge: 'border-white/20 text-white/60 font-medium', icon: Clock },
  approved: { badge: 'border-white/30 text-white font-bold', icon: CheckCircle2 },
  rejected: { badge: 'border-white/10 text-white/20 line-through', icon: AlertCircle },
  pending: { badge: 'border-white/20 text-white/60', icon: Clock },
};

export function Requests() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [filter, setFilter] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: 'Academic',
    description: '',
    priority: 'Normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data, isLoading, error, refetch } = useApi(() => api.fetchRequests(), []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center text-amber-500 p-20 animate-in fade-in slide-in-from-bottom-4">
        <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm font-black uppercase tracking-widest">{error}</p>
      </div>
    );
  }

  const allRequests = data?.requests || [];
  const statuses = ['all', ...new Set(allRequests.map((r: any) => r.status || 'open'))];
  const filtered = filter === 'all' ? allRequests : allRequests.filter((r: any) => r.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Requests</h1>
          <p className="text-white/50 mt-1">
            {isAdmin ? 'Moderate and manage campus service requests' : 'Track your campus requests and applications'}
          </p>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-white text-black px-4 py-2 rounded text-xs font-bold hover:bg-zinc-200 transition-all flex items-center gap-2 self-start"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {statuses.map((s: string) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
              filter === s
                ? 'bg-white text-black border-white'
                : 'bg-white/[0.03] text-white/30 border-white/[0.06] hover:bg-white/[0.06]'
            }`}
          >
            {s === 'in-progress' ? 'In Progress' : s}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-white/40 text-center py-8">No requests found</p>
        )}
        {filtered.map((req: any, i: number) => {
          const style = statusStyles[req.status] || statusStyles.open;
          return (
            <motion.div
              key={req.id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card-dark p-5 flex items-center gap-4 hover:border-white/[0.08] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white/30" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white/90">{req.title || req.type}</h3>
                  {isAdmin && req.user && (
                    <span className="text-[10px] text-white/30 truncate">by {req.user.fullName}</span>
                  )}
                </div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/20 mt-1">
                  Submitted {req.date || req.createdAt?.split('T')[0] || '—'}
                  {req.description && ` · ${req.description}`}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {isAdmin && req.status === 'open' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        await api.updateRequestStatus(req.id, 'approved');
                        refetch();
                      }}
                      className="px-3 py-1.5 rounded bg-white text-black text-[10px] font-bold uppercase hover:bg-zinc-200 transition-all"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={async () => {
                        await api.updateRequestStatus(req.id, 'rejected');
                        refetch();
                      }}
                      className="px-3 py-1.5 rounded border border-white/10 text-white hover:bg-white/5 text-[10px] font-bold uppercase transition-all"
                    >
                      Reject
                    </button>
                  </div>
                )}
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${style.badge} flex-shrink-0`}>
                  {req.status === 'in-progress' ? 'In Progress' : req.status}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">New Request</h2>
                <button 
                  onClick={() => setIsCreating(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  try {
                    await api.postRequest(newRequest);
                    setIsCreating(false);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="p-6 space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Request Type</label>
                    <select
                      value={newRequest.type}
                      onChange={e => setNewRequest({ ...newRequest, type: e.target.value })}
                      className="input-dark w-full"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Library">Library</option>
                      <option value="Infrastructure">Infrastructure</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Priority</label>
                    <select
                      value={newRequest.priority}
                      onChange={e => setNewRequest({ ...newRequest, priority: e.target.value })}
                      className="input-dark w-full"
                    >
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Normal">Normal</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Description</label>
                  <textarea
                    required
                    value={newRequest.description}
                    onChange={e => setNewRequest({ ...newRequest, description: e.target.value })}
                    placeholder="Provide details about your request..."
                    className="input-dark w-full min-h-[120px] py-3"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    disabled={isSubmitting}
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/30 font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
