import { useAuth } from "./context/AuthContext.jsx";
import PageLoader from "./components/PageLoader.jsx";
import Layout from "./components/Layout.jsx";
import { Routes, Route, Navigate } from "react-router";
import HomePage from "./pages/HomePage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import CheckoutReturnPage from "./pages/CheckoutReturnPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import { SentryDemoPage } from "./pages/SentryDemoPage.jsx";
import OrderDetailPage from "./pages/OrderDetailPage.jsx";
import OrderSummaryPage from "./pages/OrderSummaryPage.jsx";
import OrderChatPage from "./pages/OrderChatPage.jsx";
import OrderVideoPage from "./pages/OrderVideoPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";

import { useSystemTheme } from "./hooks/useSystemTheme.js";

// Admin
import { AdminLayout } from "./components/AdminLayout.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminProductsPage from "./pages/admin/AdminProductsPage.jsx";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage.jsx";
import AdminOrderDetailPage from "./pages/admin/AdminOrderDetailPage.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";

function App() {
  const { isLoaded, isSignedIn } = useAuth();
  
  // Auto-detect system theme
  useSystemTheme();

  if (!isLoaded) return <PageLoader />;

  return (
    <Routes>
      {/* Storefront routes wrapped in Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route
          path="/orders"
          element={isSignedIn ? <OrdersPage /> : <Navigate to="/" replace />}
        />
        <Route path="/checkout/return" element={<CheckoutReturnPage />} />

        <Route path="/login" element={!isSignedIn ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!isSignedIn ? <RegisterPage /> : <Navigate to="/" replace />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/profile" element={isSignedIn ? <ProfilePage /> : <Navigate to="/login" replace />} />

        <Route path="/demo-sentry" element={<SentryDemoPage />} />

        <Route
          path="/orders/:id/call"
          element={isSignedIn ? <OrderVideoPage /> : <Navigate to="/" replace />}
        />

        {/* NESTED ORDER ROUTES */}
        <Route path="/orders/:id" element={<OrderDetailPage />}>
          <Route index element={<OrderSummaryPage />} />
          <Route path="chat" element={<OrderChatPage />} />
        </Route>
      </Route>

      {/* Admin routes with separate layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
    </Routes>
  );
}

export default App;
