import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';

import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { NewOrder } from './pages/NewOrder';
import { Orders } from './pages/Orders';
import { Invoices } from './pages/Invoices';
import { InvoiceDetail } from './pages/InvoiceDetail';
import { Customers } from './pages/Customers';
import { Products } from './pages/Products';
import { Reports } from './pages/Reports';
import { AiExtraction } from './pages/AiExtraction';
import { Automation } from './pages/Automation';
import { UserManual } from './pages/UserManual';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Purchases } from './pages/Purchases';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Application Routes */}
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="orders/new" element={<NewOrder />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="invoices" element={<Invoices />} />
                  <Route path="invoices/:id" element={<InvoiceDetail />} />
                  <Route path="purchases" element={<Purchases />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="products" element={<Products />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="ai-extraction" element={<AiExtraction />} />
                  <Route path="automation" element={<Automation />} />
                  <Route path="manual" element={<UserManual />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;
