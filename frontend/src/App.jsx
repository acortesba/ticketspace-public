import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PageLayout from './components/layout/PageLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TicketView from './pages/TicketView';

// Placeholder Pages
const HostPlaceholder = () => <div className="p-8 text-white"><h2>Host Dashboard (Coming Soon)</h2></div>;
const AdminPlaceholder = () => <div className="p-8 text-white"><h2>Admin Panel (Coming Soon)</h2></div>;
const EventsPlaceholder = () => <div className="p-8 text-white"><h2>Events Discovery (Coming Soon)</h2></div>;
const NotFound = () => <div className="p-8 text-white text-center mt-20"><h2 className="text-4xl font-bold mb-4">404</h2><p>Page not found</p></div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<PageLayout />}>
        {/* Public Routes */}
        <Route index element={<Landing />} />
        <Route path="events" element={<EventsPlaceholder />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Protected Routes - Buyers & Above */}
        <Route element={<ProtectedRoute allowedRoles={['buyer', 'staff', 'host', 'admin', 'super_admin']} />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ticket/:token" element={<TicketView />} />
        </Route>

        {/* Protected Routes - Hosts & Above */}
        <Route element={<ProtectedRoute allowedRoles={['host', 'admin', 'super_admin']} />}>
          <Route path="host" element={<HostPlaceholder />} />
        </Route>

        {/* Protected Routes - Admins & Above */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
          <Route path="admin" element={<AdminPlaceholder />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
