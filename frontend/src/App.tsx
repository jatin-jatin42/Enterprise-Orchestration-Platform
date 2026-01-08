// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

// Auth Pages
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';

// Layout & Protected Route
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Dashboard Pages
import { Dashboard } from './pages/Dashboard/Dashboard';
import Interns from './pages/Interns/Interns';
import { LoadingSpinner } from './components/ui/LoadingSpinner'; 
import  LearningResourceCompo   from './pages/LeariningResource/LearningResource';
import Projects from './pages/Projects/Projects';
import ToolsTech from './pages/tool&tech/ToolsTech';


function App() {
  const { isAuthenticated, getProfile, status } = useAuthStore();

  // Load profile on app load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && !isAuthenticated) {
      getProfile().catch(() => {
        localStorage.removeItem('auth_token');
      });
    }
  }, [isAuthenticated, getProfile]);

  // Show loading spinner while verifying token on refresh
  if (status === 'loading' && localStorage.getItem('auth_token')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Checking authentication...</span>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              color: '#111827',
              fontSize: '14px',
              maxWidth: '500px',
              padding: '12px 18px',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
            loading: {
              duration: Infinity,
            },
          }}
        />

        <Routes>
          {/* 🔓 Public Routes */}
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
          />

          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />}
          />

          {/* 🔒 Protected Dashboard Routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Default dashboard page */}
            <Route index element={<Dashboard />} />

            {/* Interns Page */}
            <Route path="interns" element={<Interns />} />
            <Route path="learning" element={<LearningResourceCompo />} />
            <Route path="projects" element={<Projects />} />
            {/* Add more nested routes as needed */}

            {/* Tools & Tech Page - CORRECTED PATH */}
            <Route path="toolstech" element={<ToolsTech />} />
          </Route>

          {/* Redirect root → login/dashboard */}
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            }
          />

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600">Page not found</p>
                  <button
                    onClick={() =>
                      (window.location.href = isAuthenticated ? "/dashboard" : "/login")
                    }
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Go to {isAuthenticated ? "Dashboard" : "Login"}
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;