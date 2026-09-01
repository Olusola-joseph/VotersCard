import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login';

// Admin Pages
import Dashboard from './pages/Admin/Dashboard';
import LGAs from './pages/Admin/LGAs';

// Officer Pages
import Scan from './pages/Officer/Scan';

// Placeholder components for remaining pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
    <p className="text-gray-600">This page is under development</p>
  </div>
);

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const loading = useAuthStore((state) => state.loading);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/dashboard" />} 
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/lgas"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <LGAs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wards"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <Placeholder title="Wards" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pus"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <Placeholder title="Polling Units" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/records"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <Placeholder title="Records" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <Placeholder title="Analytics" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officers"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <Placeholder title="Officers Management" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <Placeholder title="Settings" />
            </ProtectedRoute>
          }
        />

        {/* Officer Routes */}
        <Route
          path="/scan"
          element={
            <ProtectedRoute allowedRoles={['officer']}>
              <Scan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute allowedRoles={['officer']}>
              <Placeholder title="Distribution History" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mystats"
          element={
            <ProtectedRoute allowedRoles={['officer']}>
              <Placeholder title="My Statistics" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['officer', 'admin', 'super_admin']}>
              <Placeholder title="Profile" />
            </ProtectedRoute>
          }
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="/unauthorized" element={<Placeholder title="Unauthorized Access" />} />
        <Route path="*" element={<Placeholder title="404 - Page Not Found" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
