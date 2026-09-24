import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/index.js';
import { loadUserProfile } from './store/authSlice.js';

// Component Imports
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Page Imports
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AIShoppingPage from './pages/AIShoppingPage.jsx';
import ProductResultsPage from './pages/ProductResultsPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import OrderTrackingPage from './pages/OrderTrackingPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import useGeoLocation from './hooks/useGeoLocation.js';

function AppContent() {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const loading = useSelector(state => state.auth.loading);

  // Activate Geolocation tracking
  useGeoLocation();

  // Load profile on start if token exists
  useEffect(() => {
    if (token) {
      dispatch(loadUserProfile(token));
    }
  }, [token, dispatch]);

  if (loading && token) {
    return (
      <div class="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
          <p class="mt-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider animate-pulse">Initializing InstaDispatch...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div class="flex flex-col min-h-screen bg-[#F8FAFC] text-[#111827]">
        <Navbar />
        <main class="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/products" element={<ProductResultsPage />} />

            {/* Protected Multi-Role Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />

            {/* Protected Customer Routes */}
            <Route 
              path="/ai-search" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <AIShoppingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CartPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CheckoutPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <PaymentPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <OrdersPage />
                </ProtectedRoute>
              } 
            />

            {/* Protected General User Routes */}
            <Route 
              path="/tracking/:orderId" 
              element={
                <ProtectedRoute>
                  <OrderTrackingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />

            {/* Legacy Fallback Redirects for Old Slugs */}
            <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
            <Route path="/agent" element={<Navigate to="/dashboard" replace />} />

            {/* 404 Catch All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: '600',
            fontSize: '13px',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            color: '#111827',
            background: '#FFFFFF',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)'
          }
        }}
      />
    </Router>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
