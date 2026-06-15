// ============================================================
// Campusly — Navigation Configuration
// ============================================================
import type { NavItem, UserRole } from '../types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',   label: 'Dashboard',    icon: 'LayoutDashboard', roles: ['student', 'faculty', 'admin', 'alumni'] },
  { id: 'admin',       label: 'Administration', icon: 'Settings',      roles: ['admin'] },
  { id: 'events',      label: 'Events',       icon: 'Calendar',        roles: ['student', 'faculty', 'admin', 'alumni'] },
  { id: 'marketplace', label: 'Marketplace',  icon: 'ShoppingBag',     roles: ['student', 'alumni', 'admin'] },
  { id: 'requests',    label: 'Requests',     icon: 'FileText',        roles: ['student', 'admin'] },
  { id: 'timetable',   label: 'Timetable',    icon: 'Clock',           roles: ['student', 'faculty'] },
  { id: 'attendance',  label: 'Attendance',   icon: 'ClipboardCheck',  roles: ['student', 'faculty'] },
  { id: 'grades',      label: 'Grades',       icon: 'GraduationCap',   roles: ['student', 'faculty'] },
  { id: 'library',     label: 'Library',      icon: 'BookOpen',        roles: ['student', 'faculty'] },
  { id: 'fees',        label: 'Fees',         icon: 'CreditCard',      roles: ['student'] },
  { id: 'bus',         label: 'Bus Tracking', icon: 'Bus',             roles: ['student'] },
  { id: 'alumni',      label: 'Alumni Network', icon: 'Users',         roles: ['student', 'alumni'] },
  { id: 'profile',     label: 'Profile',      icon: 'User',            roles: ['student', 'faculty', 'admin', 'alumni'] },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter(item => item.roles.includes(role));
}
