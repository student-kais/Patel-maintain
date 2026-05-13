import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Services from './pages/Services';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminShops from './pages/AdminShops';

function App() {
  return (
    <Router>
      <AuthProvider>
        <InventoryProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Private Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                {/* Common / Dashboard Redirect */}
                <Route index element={<Dashboard />} />

                {/* Shop Owner Only Routes */}
                <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="billing" element={<Billing />} />
                  <Route path="services" element={<Services />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Platform Admin Only Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="admin/shops" element={<AdminShops />} />
                </Route>
              </Route>
            </Route>
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#334155',
                color: '#fff',
              },
            }}
          />
        </InventoryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
