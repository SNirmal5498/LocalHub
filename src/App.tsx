import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { NotificationProvider } from './context/NotificationContext.js';

import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { CartDrawer } from './components/common/CartDrawer.js';

import { LandingPage } from './pages/LandingPage.js';
import { DiscoveryPage } from './pages/DiscoveryPage.js';
import { CategoriesPage } from './pages/CategoriesPage.js';
import { StorefrontPage } from './pages/StorefrontPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.js';
import { CustomerOrdersPage } from './pages/CustomerOrdersPage.js';
import { CustomerOrderDetailPage } from './pages/CustomerOrderDetailPage.js';
import { CustomerFavoritesPage } from './pages/CustomerFavoritesPage.js';
import { CustomerProfilePage } from './pages/CustomerProfilePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { ContactPage } from './pages/ContactPage.js';

import { BusinessDashboardLayout } from './components/layout/BusinessDashboardLayout.js';
import { BusinessDashboardPage } from './pages/business/BusinessDashboardPage.js';
import { BusinessCreatePage } from './pages/business/BusinessCreatePage.js';
import { BusinessProfilePage } from './pages/business/BusinessProfilePage.js';
import { BusinessProductsPage } from './pages/business/BusinessProductsPage.js';
import { BusinessServicesPage } from './pages/business/BusinessServicesPage.js';
import { BusinessOffersPage } from './pages/business/BusinessOffersPage.js';
import { BusinessOrdersPage } from './pages/business/BusinessOrdersPage.js';
import { BusinessReviewsPage } from './pages/business/BusinessReviewsPage.js';
import { BusinessAnalyticsPage } from './pages/business/BusinessAnalyticsPage.js';
import { BusinessMessagesPage } from './pages/business/BusinessMessagesPage.js';
import { BusinessSettingsPage } from './pages/business/BusinessSettingsPage.js';

import { AdminDashboardLayout } from './components/layout/AdminDashboardLayout.js';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminBusinessesPage } from './pages/admin/AdminBusinessesPage.js';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.js';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.js';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage.js';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage.js';

// Route guard for business owners
const RequireOwner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user || (user.role !== 'owner' && user.role !== 'business_owner' && user.role !== 'admin')) {
    return <Navigate to="/login?redirect=/business/dashboard" replace />;
  }
  return <>{children}</>;
};

// Route guard for superadmin
const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login?redirect=/admin/dashboard" replace />;
  }
  return <>{children}</>;
};

// Route guard for customers
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Public layout wrapper (includes navbar, footer, cart drawer)
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                {/* Public & Customer Routes */}
                <Route
                  path="/"
                  element={
                    <PublicLayout>
                      <LandingPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/businesses"
                  element={
                    <PublicLayout>
                      <DiscoveryPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <PublicLayout>
                      <CategoriesPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/business/:slug"
                  element={
                    <PublicLayout>
                      <StorefrontPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <PublicLayout>
                      <RequireAuth>
                        <CheckoutPage />
                      </RequireAuth>
                    </PublicLayout>
                  }
                />
                <Route
                  path="/order-success/:orderId"
                  element={
                    <PublicLayout>
                      <RequireAuth>
                        <OrderConfirmationPage />
                      </RequireAuth>
                    </PublicLayout>
                  }
                />
                <Route
                  path="/customer/orders"
                  element={
                    <PublicLayout>
                      <RequireAuth>
                        <CustomerOrdersPage />
                      </RequireAuth>
                    </PublicLayout>
                  }
                />
                <Route
                  path="/customer/orders/:id"
                  element={
                    <PublicLayout>
                      <RequireAuth>
                        <CustomerOrderDetailPage />
                      </RequireAuth>
                    </PublicLayout>
                  }
                />
                <Route
                  path="/customer/favorites"
                  element={
                    <PublicLayout>
                      <RequireAuth>
                        <CustomerFavoritesPage />
                      </RequireAuth>
                    </PublicLayout>
                  }
                />
                <Route
                  path="/customer/profile"
                  element={
                    <PublicLayout>
                      <RequireAuth>
                        <CustomerProfilePage />
                      </RequireAuth>
                    </PublicLayout>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <PublicLayout>
                      <LoginPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicLayout>
                      <RegisterPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/business/register"
                  element={
                    <PublicLayout>
                      <RegisterPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <PublicLayout>
                      <AboutPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <PublicLayout>
                      <ContactPage />
                    </PublicLayout>
                  }
                />

                {/* Business Registration for New Owner */}
                <Route
                  path="/business/new"
                  element={
                    <RequireAuth>
                      <PublicLayout>
                        <BusinessCreatePage />
                      </PublicLayout>
                    </RequireAuth>
                  }
                />

                {/* Business Owner Portal */}
                <Route
                  path="/business"
                  element={
                    <RequireOwner>
                      <BusinessDashboardLayout />
                    </RequireOwner>
                  }
                >
                  <Route index element={<Navigate to="/business/dashboard" replace />} />
                  <Route path="dashboard" element={<BusinessDashboardPage />} />
                  <Route path="profile" element={<BusinessProfilePage />} />
                  <Route path="products" element={<BusinessProductsPage />} />
                  <Route path="services" element={<BusinessServicesPage />} />
                  <Route path="offers" element={<BusinessOffersPage />} />
                  <Route path="orders" element={<BusinessOrdersPage />} />
                  <Route path="reviews" element={<BusinessReviewsPage />} />
                  <Route path="analytics" element={<BusinessAnalyticsPage />} />
                  <Route path="messages" element={<BusinessMessagesPage />} />
                  <Route path="settings" element={<BusinessSettingsPage />} />
                </Route>

                {/* SuperAdmin Portal */}
                <Route
                  path="/admin"
                  element={
                    <RequireAdmin>
                      <AdminDashboardLayout />
                    </RequireAdmin>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="businesses" element={<AdminBusinessesPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
