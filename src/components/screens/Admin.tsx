import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  ShieldCheck, 
  Trash2, 
  UserPlus, 
  FileEdit, 
  Calendar, 
  X,
  Activity,
  Users,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import * as api from '../../lib/api';

export const Admin: React.FC = () => {
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  // Data Fetching
  const { data: usersData, isLoading: isLoadingUsers, refetch: refetchUsers } = useApi(() => api.fetchUsers(roleFilter ? { role: roleFilter } : undefined), [roleFilter]);
  const { data: dashData, refetch: refetchDash } = useApi(() => api.fetchDashboard(), []);
  const { data: marketData, refetch: refetchMarket } = useApi(() => api.fetchPendingMarketplaceItems(), []);
  const { data: requestsData, refetch: refetchRequests } = useApi(() => api.fetchPendingRequests(), []);
  const { data: recentEventsData } = useApi(() => api.fetchEvents(), []);
  
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setIsDeleting(id);
    try {
      await api.deleteUser(id);
      refetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setIsDeleting(null);
    }
  };

  const stats = dashData?.stats || {};
  const pendingActionsCount = (marketData?.items?.length || 0) + (requestsData?.requests?.length || 0);
  
  const adminStats = [
    { label: 'Total Users', value: stats.totalUsers || '—', icon: <Users className="w-5 h-5" />, color: 'text-white' },
    { label: 'Active Events', value: stats.totalEvents || '—', icon: <Calendar className="w-5 h-5" />, color: 'text-white' },
    { label: 'Pending Actions', value: pendingActionsCount, icon: <Activity className="w-5 h-5 text-amber-500" />, color: 'text-amber-500' },
    { label: 'System Status', value: 'ONLINE', icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-10">
      {/* Header & Quick Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold text-white tracking-tighter">Command Center</h1>
          <p className="text-white/40 mt-2 text-lg">Absolute oversight of campus operations</p>
        </div>
        
        <div className="flex gap-4">
          <Link to="/requests" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group">
            <span className="text-[10px] uppercase font-bold text-white/40 group-hover:text-white">Moderation Queue</span>
            <ExternalLink className="w-3 h-3 text-white/20" />
          </Link>
          <button 
            onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
            className="bg-white text-black px-6 py-2.5 rounded-lg text-xs font-black shadow-xl hover:bg-zinc-200 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            CREATE NEW USER
          </button>
        </div>
      </div>

      {/* Hero Pulse Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card-dark p-8 border-white/[0.03] hover:border-white/[0.08] transition-all relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              {stat.icon}
            </div>
            <p className="text-white/30 text-[10px] uppercase font-bold tracking-[0.2em] mb-4">{stat.label}</p>
            <p className={`text-4xl font-extralight tracking-tighter ${stat.color}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main User Control Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">User Directory</h2>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-zinc-950 border border-white/10 text-white/40 text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-white/30 transition-all cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
              <option value="alumni">Alumni</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-dark overflow-hidden border-white/[0.04]"
          >
            {isLoadingUsers ? (
              <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-white/10" /></div>
            ) : (
              <table className="w-full text-left">
                <thead className="text-[10px] uppercase font-black tracking-widest text-white/20 border-b border-white/[0.03]">
                  <tr>
                    <th className="py-6 px-6">Identity</th>
                    <th className="py-6 px-4">Clearance</th>
                    <th className="py-6 px-4">Contact / Depth</th>
                    <th className="py-6 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {usersData?.users?.map((u: any) => (
                    <tr key={u.id} className="group hover:bg-white/[0.01] transition-all">
                      <td className="py-5 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white/90 group-hover:text-white">{u.fullName}</span>
                          <span className="text-xs text-white/30 font-mono tracking-tighter mt-0.5">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/5 ${
                          u.role === 'admin' ? 'text-white border-white/20 bg-white/5' : 'text-white/40'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/50">{u.department || 'N/A'}</span>
                          {u.company && (
                            <span className="text-[10px] text-white/20 uppercase font-bold tracking-tighter mt-1">
                              @ {u.company} · {u.position}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center gap-4 justify-end opacity-20 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingUser(u); setIsUserModalOpen(true); }}
                            className="text-white hover:scale-110 transition-all"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={isDeleting === u.id}
                            className="text-white hover:text-red-500 hover:scale-110 transition-all"
                          >
                            {isDeleting === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        </div>

        {/* System Pulse / Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-2">System Pulse</h2>
          
          <div className="card-dark p-6 space-y-6 border-white/[0.04] h-fit">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-bold text-white/30 uppercase tracking-widest">
                <span>Recent Events</span>
                <Link to="/events" className="hover:text-white transition-colors">Manage All</Link>
              </div>
              <div className="space-y-3">
                {recentEventsData?.events?.slice(0, 3).map((e: any) => (
                  <div key={e.id} className="flex items-center gap-3 group translate-z-0">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                      <Calendar className="w-4 h-4 text-white/20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/80 truncate group-hover:text-white transition-colors">{e.title}</p>
                      <p className="text-[10px] text-white/20">{new Date(e.startsAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) || <p className="text-[10px] text-white/20 italic">No recent events recorded</p>}
              </div>
            </div>

            <div className="h-px bg-white/[0.04]" />

            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-bold text-white/30 uppercase tracking-widest">
                <span>Pending Approvals</span>
                <Link to="/requests" className="hover:text-white transition-colors">Review Queue</Link>
              </div>
              <div className="space-y-3">
                {requestsData?.requests?.length === 0 ? (
                  <p className="text-[10px] text-white/20 italic">No pending requests</p>
                ) : (
                  requestsData?.requests?.slice(0, 3).map((req: any) => (
                    <div key={req.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-amber-500/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white/80 truncate group-hover:text-white transition-colors">{req.title || req.type}</p>
                          <p className="text-[10px] text-white/20 uppercase tracking-widest">{req.studentName}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={async () => {
                            await api.updateRequestStatus(req.id, 'processing');
                            refetchRequests();
                            refetchDash();
                          }}
                          className="p-1 px-2 rounded bg-white text-black text-[8px] font-black uppercase hover:bg-zinc-200"
                        >
                          Process
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="h-px bg-white/[0.04]" />

            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-bold text-white/30 uppercase tracking-widest">
                <span>Marketplace Activity</span>
                <Link to="/app/marketplace" className="hover:text-white transition-colors">Moderate</Link>
              </div>
              <div className="space-y-3">
                {marketData?.items?.length === 0 ? (
                  <p className="text-[10px] text-white/20 italic">No pending marketplace items</p>
                ) : (
                  marketData?.items?.slice(0, 5).map((item: any) => (
                    <div key={item.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-xl">
                          {item.image || '📦'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white/80 truncate group-hover:text-white transition-colors">{item.title}</p>
                          <p className="text-[10px] text-white/20 uppercase tracking-widest mt-0.5">₹{item.price} · {item.seller}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={async () => {
                            await api.updateMarketplaceItemStatus(item.id, 'approved');
                            refetchMarket();
                            refetchDash();
                          }}
                          className="p-1 px-2 rounded bg-white text-black text-[8px] font-black uppercase hover:bg-zinc-200 transition-all"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={async () => {
                            await api.updateMarketplaceItemStatus(item.id, 'rejected');
                            refetchMarket();
                            refetchDash();
                          }}
                          className="p-1 px-2 rounded border border-white/10 text-white/40 text-[8px] font-black uppercase hover:bg-white/5 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      {isUserModalOpen && (
        <UserModal 
          user={editingUser} 
          onClose={() => setIsUserModalOpen(false)} 
          onSave={() => { setIsUserModalOpen(false); refetchUsers(); }} 
        />
      )}
    </div>
  );
};

// ─── User Management Modal ───

const UserModal = ({ user, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    fullName: user?.fullName || '',
    password: '',
    role: user?.role || 'student',
    department: user?.department || '',
    phone: user?.phone || '',
    company: user?.company || '',
    position: user?.position || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user) {
        const { password, ...updateData } = formData;
        if (!password) delete (updateData as any).password;
        await api.updateUser(user.id, updateData);
      } else {
        await api.createUser(formData);
      }
      onSave();
    } catch (err: any) {
      alert(err.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg p-10 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{user ? 'Refine Profile' : 'Initialize Identity'}</h2>
            <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mt-1">{user ? 'Update access credentials' : 'Deploy new campus access'}</p>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white p-2 transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-white/30">Registry Name</label>
              <input 
                value={formData.fullName} 
                onChange={e => setFormData({...formData, fullName: e.target.value})} 
                className="input-dark text-sm w-full py-3" required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-white/30">Network Email</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                className="input-dark text-sm w-full py-3" required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-white/30">Security Clearance (Role)</label>
              <select 
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})} 
                className="input-dark text-sm w-full py-3 appearance-none cursor-pointer"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Administrator</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-white/30">Security Code (Password)</label>
              <input 
                type="password" 
                placeholder={user ? "Leave blank to keep current" : "Set initial password"}
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                className="input-dark text-sm w-full py-3" 
                required={!user}
              />
            </div>
          </div>

          <div className="h-px bg-white/5 my-4" />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-white/30">Department Zone</label>
              <input 
                value={formData.department} 
                onChange={e => setFormData({...formData, department: e.target.value})} 
                className="input-dark text-sm w-full py-3" 
                placeholder="N/A"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-white/30">Primary Comm (Phone)</label>
              <input 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                className="input-dark text-sm w-full py-3" 
                placeholder="+91..."
              />
            </div>
          </div>

          {formData.role === 'alumni' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 gap-6 border-t border-white/5 pt-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-white/30">Industry Anchor (Company)</label>
                <input 
                  value={formData.company} 
                  onChange={e => setFormData({...formData, company: e.target.value})} 
                  className="input-dark text-sm w-full py-3" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-white/30">Deployment (Position)</label>
                <input 
                  value={formData.position} 
                  onChange={e => setFormData({...formData, position: e.target.value})} 
                  className="input-dark text-sm w-full py-3" 
                />
              </div>
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all flex justify-center mt-10 shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : user ? 'COMMIT PROFILE UPDATE' : 'INITIALIZE USER ACCESS'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
