// ============================================================
// Campusly — Shared TypeScript Types
// ============================================================

export type UserRole = 'student' | 'faculty' | 'admin' | 'alumni';

export type AppPage =
  | 'dashboard'
  | 'attendance'
  | 'grades'
  | 'bus'
  | 'events'
  | 'marketplace'
  | 'requests'
  | 'alumni'
  | 'admin'
  | 'profile'
  | 'timetable'
  | 'library'
  | 'fees';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  studentId?: string;
  phone?: string;
  year?: number;
  semester?: number;
}

export interface NavItem {
  id: AppPage;
  label: string;
  icon: string; // Lucide icon name
  roles: UserRole[];
}

export interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  progress: number;
  grade?: string;
  schedule?: string;
}

export interface AttendanceRecord {
  id: string;
  courseCode: string;
  courseName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  totalClasses: number;
  attended: number;
  percentage: number;
}

export interface GradeRecord {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  gradePoints: number;
  semester: number;
  instructor: string;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  stops: BusStop[];
  currentLocation?: { lat: number; lng: number };
  eta?: string;
  status: 'on-time' | 'delayed' | 'cancelled';
  driver?: string;
  capacity: number;
  occupancy: number;
}

export interface BusStop {
  id: string;
  name: string;
  time: string;
  passed: boolean;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'academic' | 'cultural' | 'sports' | 'workshop' | 'seminar';
  organizer: string;
  capacity: number;
  registered: number;
  image?: string;
  isRegistered?: boolean;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'books' | 'electronics' | 'furniture' | 'clothing' | 'other';
  condition: 'new' | 'like-new' | 'good' | 'fair';
  seller: string;
  sellerAvatar?: string;
  images: string[];
  createdAt: string;
  status: 'available' | 'sold' | 'reserved';
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'it-support' | 'hostel' | 'library' | 'transport' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolution?: string;
}

export interface AlumniMember {
  id: string;
  name: string;
  graduationYear: number;
  degree: string;
  department: string;
  currentCompany?: string;
  currentRole?: string;
  location?: string;
  linkedin?: string;
  avatar?: string;
  isConnected?: boolean;
}

// Notification type
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}
