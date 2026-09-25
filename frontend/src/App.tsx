import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { AppLayout } from "./components/layout/AppLayout";

const Login = lazy(() =>
  import("./pages/Login").then((module) => ({ default: module.Login })),
);
const Signup = lazy(() =>
  import("./pages/Signup").then((module) => ({ default: module.Signup })),
);
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })),
);
const NewOrder = lazy(() =>
  import("./pages/NewOrder").then((module) => ({ default: module.NewOrder })),
);
const Orders = lazy(() =>
  import("./pages/Orders").then((module) => ({ default: module.Orders })),
);
const Invoices = lazy(() =>
  import("./pages/Invoices").then((module) => ({ default: module.Invoices })),
);
const InvoiceDetail = lazy(() =>
  import("./pages/InvoiceDetail").then((module) => ({
    default: module.InvoiceDetail,
  })),
);
const Customers = lazy(() =>
  import("./pages/Customers").then((module) => ({ default: module.Customers })),
);
const Products = lazy(() =>
  import("./pages/Products").then((module) => ({ default: module.Products })),
);
const Reports = lazy(() =>
  import("./pages/Reports").then((module) => ({ default: module.Reports })),
);
const AiExtraction = lazy(() =>
  import("./pages/AiExtraction").then((module) => ({
    default: module.AiExtraction,
  })),
);
const Automation = lazy(() =>
  import("./pages/Automation").then((module) => ({
    default: module.Automation,
  })),
);
const UserManual = lazy(() =>
  import("./pages/UserManual").then((module) => ({
    default: module.UserManual,
  })),
);
const Settings = lazy(() =>
  import("./pages/Settings").then((module) => ({ default: module.Settings })),
);
const Profile = lazy(() =>
  import("./pages/Profile").then((module) => ({ default: module.Profile })),
);
const Purchases = lazy(() =>
  import("./pages/Purchases").then((module) => ({ default: module.Purchases })),
);

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <Suspense
                fallback={
                  <div className="route-loading" role="status">
                    Loading your workspace…
                  </div>
                }
              >
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
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;
