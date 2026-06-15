// ============================================================
// Campusly — API Client
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Token storage ───
let accessToken: string | null = localStorage.getItem('campusly_token');

export function setToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem('campusly_token', token);
  } else {
    localStorage.removeItem('campusly_token');
  }
}

export function getToken(): string | null {
  return accessToken;
}

// ─── Generic fetch wrapper ───
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error || 'Request failed', body.details);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  status: number;
  details?: any;
  constructor(status: number, message: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// ─── Auth endpoints ───
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    department: string | null;
    avatarUrl: string | null;
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Dashboard ───
export async function fetchDashboard() {
  return apiFetch<{ role: string; stats: Record<string, number> }>('/dashboard/stats');
}

// ─── Users ───
export async function fetchMe() {
  return apiFetch<{ user: any }>('/users/me');
}

export async function updateProfile(data: Record<string, any>) {
  return apiFetch<{ user: any }>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function fetchUsers(params?: { role?: string; search?: string }) {
  const qs = new URLSearchParams();
  if (params?.role) qs.set('role', params.role);
  if (params?.search) qs.set('search', params.search);
  const query = qs.toString();
  return apiFetch<{ users: any[] }>(`/users${query ? '?' + query : ''}`);
}

export async function deleteUser(id: string) {
  return apiFetch<{ message: string }>(`/users/${id}`, { method: 'DELETE' });
}

// ─── Timetable ───
export async function fetchTimetable() {
  return apiFetch<{ timetable: Record<string, any[]> }>('/timetable');
}

// ─── Courses ───
export async function fetchCourses() {
  return apiFetch<{ courses: any[] }>('/courses');
}

export async function fetchCourseStudents(courseId: string) {
  return apiFetch<{ students: any[] }>(`/courses/${courseId}/students`);
}

// ─── Attendance ───
export async function fetchAttendance(params?: { courseId?: string }) {
  const qs = params?.courseId ? `?courseId=${params.courseId}` : '';
  return apiFetch<{ attendance?: any[]; records?: any[]; summary?: any[] }>(`/attendance${qs}`);
}

export async function markAttendance(data: { courseId: string; date: string; entries: { studentId: string; status: string }[] }) {
  return apiFetch<any>('/attendance', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Grades ───
export async function fetchGrades() {
  return apiFetch<{ grades: any[]; courseSummary: any[] }>('/grades');
}

export async function addGrade(data: { courseId: string; studentId: string; component: string; score: number; maxScore: number }) {
  return apiFetch<any>('/grades', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Library ───
export async function fetchLibrary(params?: { search?: string; tab?: string }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.tab) qs.set('tab', params.tab);
  const query = qs.toString();
  return apiFetch<{ books: any[]; stats: any }>(`/library${query ? '?' + query : ''}`);
}

// ─── Fees ───
export async function fetchFees() {
  return apiFetch<{ breakdown: any[]; paymentHistory: any[]; stats: any }>('/fees');
}

// ─── Marketplace ───
export async function fetchMarketplace(params?: { category?: string; search?: string }) {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.search) qs.set('search', params.search);
  const query = qs.toString();
  return apiFetch<{ items: any[] }>(`/marketplace${query ? '?' + query : ''}`);
}

export async function postMarketplaceItem(data: { title: string; description?: string; price: number; category?: string; condition?: string; imageUrls?: string[] }) {
  return apiFetch<any>('/marketplace', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Events ───
export async function fetchEvents(params?: { category?: string }) {
  const qs = params?.category ? `?category=${params.category}` : '';
  return apiFetch<{ events: any[] }>(`/events${qs}`);
}

export async function registerForEvent(id: string) {
  return apiFetch<{ registered: boolean; message: string }>(`/events/${id}/register`, {
    method: 'POST',
  });
}

// ─── Requests ───
export async function fetchRequests(params?: { status?: string }) {
  const qs = params?.status ? `?status=${params.status}` : '';
  return apiFetch<{ requests: any[] }>(`/requests${qs}`);
}

export async function postRequest(data: { type: string; description: string; priority: string }) {
  return apiFetch<any>('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Alumni ───
export async function fetchAlumni(params?: { search?: string; department?: string }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.department) qs.set('department', params.department);
  const query = qs.toString();
  return apiFetch<{ alumni: any[] }>(`/alumni${query ? '?' + query : ''}`);
}

// ─── Bus Tracking ───
export async function fetchBusRoutes(): Promise<{ routes: any[] }> {
  return apiFetch('/bus/routes');
}

// ─── Admin — User Management ───
export async function createUser(data: any): Promise<any> {
  return apiFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: string, data: any): Promise<any> {
  return apiFetch(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Admin — Event Management ───
export async function fetchAdminEvents(): Promise<{ events: any[] }> {
  return apiFetch('/admin/events');
}

export async function createEvent(data: any): Promise<any> {
  return apiFetch('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEvent(id: string, data: any): Promise<any> {
  return apiFetch(`/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id: string): Promise<any> {
  return apiFetch(`/events/${id}`, {
    method: 'DELETE',
  });
}

// ─── Admin Moderation ───
export async function fetchPendingMarketplaceItems() {
  return apiFetch<{ items: any[] }>('/admin/marketplace/pending');
}

export async function updateMarketplaceItemStatus(id: string, status: 'approved' | 'rejected') {
  return apiFetch<any>(`/admin/marketplace/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function fetchPendingRequests() {
  return apiFetch<{ requests: any[] }>('/admin/requests/pending');
}

export async function updateRequestStatus(id: string, status: string) {
  return apiFetch<any>(`/admin/requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ─── Notifications ───
export async function fetchNotifications() {
  return apiFetch<{ notifications: any[] }>('/notifications');
}

