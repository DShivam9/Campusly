import { motion } from 'framer-motion';
import {
  Mail,
  Shield,
  Calendar,
  Bell,
  Lock,
  Moon,
  LogOut,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import * as api from '../../lib/api';

interface ProfileProps {
  userRole: 'student' | 'faculty' | 'admin' | 'alumni';
  onLogout: () => void;
}

const roleIcon: Record<string, string> = {
  student: '👤',
  faculty: '👨‍🏫',
  admin: '⚙️',
  alumni: '🎓',
};

export function Profile({ userRole, onLogout }: ProfileProps) {
  const { data, isLoading, error } = useApi(() => api.fetchMe(), []);

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

  const user = data?.user || {
    fullName: 'User',
    email: 'user@campus.edu',
    role: userRole,
    createdAt: '2022-08-15',
  };

  const settings = [
    { label: 'Email Notifications', status: 'Enabled', icon: Bell },
    { label: 'Two-Factor Auth', status: 'Enabled', icon: Lock },
    { label: 'Dark Mode', status: 'Active', icon: Moon },
    { label: 'Data Privacy', status: 'Protected', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-white/50 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-dark p-6"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center text-3xl">
            {roleIcon[user.role] || '👤'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white">{user.fullName}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-white/50">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="badge badge-accent capitalize">{user.role}</span>
              <span className="text-xs text-white/35 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {user.createdAt?.slice(0, 10) || '—'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Account Settings */}
      <div className="card-dark p-5">
        <h3 className="text-base font-semibold text-white mb-4">Account Settings</h3>
        <div className="space-y-2.5">
          {settings.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-accent-muted flex items-center justify-center flex-shrink-0">
                <s.icon className="w-4 h-4 text-accent-light" />
              </div>
              <span className="text-sm font-medium text-white/80 flex-1">{s.label}</span>
              <span className="badge badge-success text-[10px]">{s.status}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="card-dark p-5">
        <h3 className="text-base font-semibold text-white mb-4">Preferences</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Language</label>
            <select className="input-dark">
              <option className="bg-surface-100">English</option>
              <option className="bg-surface-100">Spanish</option>
              <option className="bg-surface-100">French</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Timezone</label>
            <select className="input-dark">
              <option className="bg-surface-100">IST (UTC+5:30)</option>
              <option className="bg-surface-100">EST (UTC-5)</option>
              <option className="bg-surface-100">PST (UTC-8)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3 rounded-lg text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
