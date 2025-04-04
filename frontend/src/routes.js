import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminStats from './pages/admin/Stats';

// CA Pages
import CADashboard from './pages/ca/Dashboard';
import CAClients from './pages/ca/Clients';
import CADocuments from './pages/ca/Documents';

// Workspace Pages
import QuickAnalysis from './pages/workspace/QuickAnalysis';
import ClientAnalysis from './pages/workspace/ClientAnalysis';

// Profile & Settings Pages
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Layout
import Layout from './components/layout/Layout';

// Protected Route Component
const ProtectedRoute = ({ element, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return element;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute 
          element={<Layout />} 
          allowedRoles={['admin']} 
        />
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="stats" element={<AdminStats />} />
      </Route>
      
      {/* CA Routes */}
      <Route path="/ca" element={
        <ProtectedRoute 
          element={<Layout />} 
          allowedRoles={['ca']} 
        />
      }>
        <Route index element={<CADashboard />} />
        <Route path="clients" element={<CAClients />} />
        <Route path="documents" element={<CADocuments />} />
      </Route>
      
      {/* Workspace Routes */}
      <Route path="/workspace" element={
        <ProtectedRoute 
          element={<Layout />} 
          allowedRoles={['admin', 'ca']} 
        />
      }>
        <Route path="quick-analysis" element={<QuickAnalysis />} />
        <Route path="client-analysis/:clientId" element={<ClientAnalysis />} />
      </Route>
      
      {/* Profile & Settings Routes */}
      <Route path="/profile" element={
        <ProtectedRoute 
          element={<Layout />} 
          allowedRoles={['admin', 'ca']} 
        />
      }>
        <Route index element={<Profile />} />
      </Route>
      
      <Route path="/settings" element={
        <ProtectedRoute 
          element={<Layout />} 
          allowedRoles={['admin', 'ca']} 
        />
      }>
        <Route index element={<Settings />} />
      </Route>
      
      {/* Redirect to appropriate dashboard based on role */}
      <Route path="/" element={<AuthRedirect />} />
      
      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Component to redirect based on auth status and role
const AuthRedirect = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return <Navigate to="/ca" replace />;
};

export default AppRoutes;