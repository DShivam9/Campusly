import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppPage } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Screens
import { Landing } from './components/screens/Landing';
import { LearnMore } from './components/screens/LearnMore';
import { Auth } from './components/screens/Auth';
import { Dashboard } from './components/screens/Dashboard';
import { FacultyDashboard } from './components/screens/FacultyDashboard';
import { AlumniDashboard } from './components/screens/AlumniDashboard';
import { Attendance } from './components/screens/Attendance';
import { Grades } from './components/screens/Grades';
import { BusTracking } from './components/screens/BusTracking';
import { Events } from './components/screens/Events';
import { Marketplace } from './components/screens/Marketplace';
import { Requests } from './components/screens/Requests';
import { AlumniNetwork } from './components/screens/AlumniNetwork';
import { Admin } from './components/screens/Admin';
import { Profile } from './components/screens/Profile';
import { Timetable } from './components/screens/Timetable';
import { Library } from './components/screens/Library';
import { Fees } from './components/screens/Fees';

// Layout
import { AppLayout } from './components/layout/AppLayout';

const queryClient = new QueryClient();

// ProtectedRoute
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

// Redirects logged in users away from auth / landing
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return <>{children}</>;
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full">
      {children}
    </div>
  );
}

function AppLayoutWrapper() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const userRole = user?.role || 'student';
  const userName = user?.fullName || 'User';
  
  // Extract active page from pathname (e.g., /app/dashboard -> dashboard)
  const pathnameParts = location.pathname.split('/');
  const activePage = (pathnameParts[2] || 'dashboard') as AppPage;

  const handleNavigate = (page: AppPage) => {
    navigate(`/app/${page}`);
  };

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={handleNavigate}
      userRole={userRole}
      userName={userName}
    >
      <Outlet />
    </AppLayout>
  );
}

function AppRoutes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const userRole = user?.role || 'student';
  
  const getDashboard = () => {
    if (userRole === 'admin') return <Admin />;
    if (userRole === 'faculty') return <FacultyDashboard />;
    if (userRole === 'alumni') return <AlumniDashboard />;
    return <Dashboard />;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/learnmore" element={<PublicRoute><LearnMore onBack={() => navigate('/')} /></PublicRoute>} />
          <Route path="/auth" element={<PublicRoute><Auth onLogin={() => navigate('/app/dashboard')} /></PublicRoute>} />

          <Route path="/app" element={
            <ProtectedRoute>
              <AppLayoutWrapper />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<PageWrapper>{getDashboard()}</PageWrapper>} />
            <Route path="attendance" element={<PageWrapper><Attendance /></PageWrapper>} />
            <Route path="grades" element={<PageWrapper><Grades /></PageWrapper>} />
            <Route path="bus" element={<PageWrapper><BusTracking /></PageWrapper>} />
            <Route path="events" element={<PageWrapper><Events /></PageWrapper>} />
            <Route path="marketplace" element={<PageWrapper><Marketplace /></PageWrapper>} />
            <Route path="requests" element={<PageWrapper><Requests /></PageWrapper>} />
            <Route path="alumni" element={<PageWrapper><AlumniNetwork /></PageWrapper>} />
            <Route path="admin" element={<PageWrapper><Admin /></PageWrapper>} />
            <Route path="profile" element={<PageWrapper><Profile userRole={userRole} onLogout={handleLogout} /></PageWrapper>} />
            <Route path="timetable" element={<PageWrapper><Timetable /></PageWrapper>} />
            <Route path="library" element={<PageWrapper><Library /></PageWrapper>} />
            <Route path="fees" element={<PageWrapper><Fees /></PageWrapper>} />
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}