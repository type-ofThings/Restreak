import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, initAuth } from './config/firebase';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Communities from './pages/Communities';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';

// Auth Component
import AuthForm from './components/auth/AuthForm';

// Protected Route Wrapper
function ProtectedRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-blue-600">
        Loading Restreak...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100">
        <Header user={user} />

        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthForm type="login" />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <AuthForm type="signup" />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user}>
                  <Dashboard user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/communities"
              element={
                <ProtectedRoute user={user}>
                  <Communities user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rewards"
              element={
                <ProtectedRoute user={user}>
                  <Rewards user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user}>
                  <Profile user={user} />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}