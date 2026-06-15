import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { getNavItemsForRole } from '../../config/navigation';
import type { UserRole, AppPage } from '../../types';

interface AppLayoutProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  userRole: UserRole;
  userName: string;
  children: React.ReactNode;
}

function getLucideIcon(name: string): React.ElementType<any> {
  const icons = LucideIcons as unknown as Record<string, React.ElementType<any>>;
  return icons[name] || LucideIcons.Circle;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activePage,
  onNavigate,
  userRole,
  userName,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = getNavItemsForRole(userRole);
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* ─── Sidebar ─── */}
      <aside
        className={`
          fixed md:relative z-50 h-screen flex flex-col
          bg-surface-50 border-r border-white/[0.06]
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo Area */}
        <div className={`flex items-center border-b border-white/[0.06] ${sidebarCollapsed ? 'justify-center px-3 py-5' : 'px-5 py-5'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <LucideIcons.GraduationCap className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h1 className="text-lg font-bold text-white leading-none">Campusly</h1>
              </motion.div>
            )}
          </div>
        </div>

        {/* User Card */}
        <div className={`border-b border-white/[0.06] ${sidebarCollapsed ? 'px-3 py-4' : 'px-4 py-4'}`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
              {userInitial}
            </div>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-hidden min-w-0"
              >
                <p className="text-sm font-semibold text-white truncate">{userName}</p>
                <p className="text-xs text-white/50 capitalize">{userRole}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
          {navItems.map((item) => {
            const Icon = getLucideIcon(item.icon);
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 rounded-lg transition-all duration-200
                  ${sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                  }
                `}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-white' : 'text-white/35'}`} />
                {!sidebarCollapsed && (
                  <span className="text-[13px] truncate">{item.label}</span>
                )}
                {isActive && !sidebarCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse Toggle (desktop) */}
        <div className="hidden md:flex border-t border-white/[0.06] px-2.5 py-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-200"
          >
            {sidebarCollapsed ? (
              <LucideIcons.PanelRightOpen className="w-[18px] h-[18px]" />
            ) : (
              <>
                <LucideIcons.PanelLeftOpen className="w-[18px] h-[18px]" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3.5 bg-surface-50 border-b border-white/[0.06]">
          {/* Left: mobile menu + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              <LucideIcons.Menu className="w-5 h-5 text-white/60" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {navItems.find(item => item.id === activePage)?.label || 'Dashboard'}
              </h2>
            </div>
          </div>

          {/* Right: search + notifications */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => alert('Search functionality coming soon!')}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              <LucideIcons.Search className="w-[18px] h-[18px] text-white/45" />
            </button>
            <button 
              onClick={() => alert('You have no new notifications.')}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors relative"
            >
              <LucideIcons.Bell className="w-[18px] h-[18px] text-white/45" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-surface">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 md:hidden z-40"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
