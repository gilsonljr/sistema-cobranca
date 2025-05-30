import React, { Suspense, ReactNode } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import AuthService from '../services/AuthService';
import { UserRole } from '../types/User';

// Import pages directly for now (we'll implement lazy loading later)
import LoginPage from '../pages/LoginPage';
import PasswordResetPage from '../pages/PasswordResetPage';
import DashboardPage from '../pages/DashboardPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import ReportsPage from '../pages/ReportsPage';
import TrackingPage from '../pages/TrackingPage';
import DuplicateOrdersPage from '../pages/DuplicateOrdersPage';
import SettingsPage from '../pages/SettingsPage';
import ExamplePage from '../pages/ExamplePage';
import TestLoginPage from '../pages/TestLoginPage';
import { Order } from '../types/Order';

// Loading component
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

// Auth guard component
interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const isAuthenticated = AuthService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole) {
    const hasRequiredRole = AuthService.hasRole(requiredRole);
    if (!hasRequiredRole) {
      return <Navigate to="/" />;
    }
  }

  return <>{children}</>;
};

// Mock data for demonstration
const mockOrders: Order[] = [];

// Define routes
export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/reset-password',
    element: <PasswordResetPage />,
  },
  {
    path: '/test-login',
    element: <TestLoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <DashboardPage
          orders={mockOrders}
          onOrdersUpdate={() => {}}
          selectedStatus={null}
          onStatusSelect={() => {}}
          clearAllOrders={() => {}}
        />
      </AuthGuard>
    ),
  },
  {
    path: '/admin',
    element: (
      <AuthGuard requiredRole="admin">
        <AdminDashboardPage />
      </AuthGuard>
    ),
  },
  {
    path: '/reports',
    element: (
      <AuthGuard requiredRole={['admin', 'supervisor']}>
        <ReportsPage orders={mockOrders} />
      </AuthGuard>
    ),
  },
  {
    path: '/tracking',
    element: (
      <AuthGuard>
        <TrackingPage />
      </AuthGuard>
    ),
  },
  {
    path: '/duplicates',
    element: (
      <AuthGuard requiredRole={['admin', 'supervisor']}>
        <DuplicateOrdersPage />
      </AuthGuard>
    ),
  },
  {
    path: '/settings',
    element: (
      <AuthGuard requiredRole="admin">
        <SettingsPage />
      </AuthGuard>
    ),
  },
  {
    path: '/example',
    element: (
      <AuthGuard>
        <ExamplePage />
      </AuthGuard>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

// Preload critical routes (placeholder for now)
export const preloadCriticalRoutes = () => {
  // We'll implement this later with proper lazy loading
  console.log('Preloading critical routes...');
};
