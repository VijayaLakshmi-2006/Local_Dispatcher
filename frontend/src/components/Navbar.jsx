import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useCart } from '../hooks/useCart.js';
import { ShoppingCart, Sparkles, LogOut, MapPin, User, ShieldAlert, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logoutUser } = useAuth();
  const { totalItemsCount, getCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch cart to sync count when user logs in and loads nav
  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer') {
      getCart();
    }
  }, [isAuthenticated, user?.role]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav class="bg-white border-b border-[#E5E7EB] sticky top-0 z-50 px-6 py-3.5 shadow-soft">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Side: Logo */}
        <Link to="/" class="flex items-center gap-2 group">
          <div class="w-9 h-9 rounded-xl bg-[#22C55E] flex items-center justify-center shadow-sm shadow-[#22C55E]/20 group-hover:scale-105 transition-transform duration-200">
            <span class="text-white text-md font-bold">⚡</span>
          </div>
          <div class="flex flex-col">
            <span class="font-black text-[15px] tracking-tight text-[#111827] leading-none mb-0.5">
              InstaDispatch
            </span>
            <span class="text-[9px] text-[#22C55E] font-extrabold tracking-wider uppercase leading-none">
              AI Smart Assistant
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <div class="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            class={`text-xs font-extrabold uppercase tracking-wider transition-colors ${isActive('/') ? 'text-[#22C55E]' : 'text-[#6B7280] hover:text-[#111827]'}`}
          >
            Home
          </Link>
          
          {isAuthenticated && user?.role === 'customer' && (
            <>
              <Link 
                to="/ai-search" 
                class={`flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider transition-colors ${isActive('/ai-search') ? 'text-[#22C55E]' : 'text-[#6B7280] hover:text-[#111827]'}`}
              >
                <Sparkles class="w-3.5 h-3.5 text-[#22C55E]" />
                AI Shopping
              </Link>
              <Link 
                to="/orders" 
                class={`flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider transition-colors ${isActive('/orders') ? 'text-[#22C55E]' : 'text-[#6B7280] hover:text-[#111827]'}`}
              >
                <ShoppingBag class="w-3.5 h-3.5" />
                Orders
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Link 
              to="/admin" 
              class={`flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-[#EF4444] transition-colors`}
            >
              <ShieldAlert class="w-3.5 h-3.5" />
              Admin Panel
            </Link>
          )}

          {isAuthenticated && user?.role === 'delivery_agent' && (
            <Link 
              to="/agent" 
              class={`flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-[#F59E0B] transition-colors`}
            >
              <MapPin class="w-3.5 h-3.5 animate-bounce" />
              Agent Hub
            </Link>
          )}
        </div>

        {/* Right Side: Cart, Profile & Actions */}
        <div class="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Cart for Customer */}
              {user?.role === 'customer' && (
                <Link 
                  to="/cart" 
                  class="relative flex items-center justify-center p-2 rounded-xl bg-slate-50 border border-[#E5E7EB] hover:bg-[#22C55E]/5 text-[#6B7280] hover:text-[#22C55E] transition-all"
                  title="Shopping Cart"
                >
                  <ShoppingCart class="w-4 h-4" />
                  {totalItemsCount > 0 && (
                    <span class="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-[#22C55E] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {totalItemsCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Profile Link */}
              <Link 
                to="/profile"
                class="flex items-center justify-center p-2 rounded-xl bg-slate-50 border border-[#E5E7EB] hover:bg-[#22C55E]/5 text-[#6B7280] hover:text-[#22C55E] transition-all"
                title="Your Profile"
              >
                <User class="w-4 h-4" />
              </Link>

              {/* Identity tag */}
              <div class="hidden sm:flex flex-col text-right">
                <span class="text-xs font-extrabold text-[#111827] leading-none mb-0.5">{user.name}</span>
                <span class="text-[9px] text-[#6B7280] uppercase font-bold leading-none">{user.role}</span>
              </div>

              {/* Logout */}
              <button 
                onClick={handleLogout}
                class="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-[#E5E7EB] text-[#6B7280] hover:text-[#EF4444] transition-all"
                title="Logout"
              >
                <LogOut class="w-4 h-4" />
              </button>
            </>
          ) : (
            <div class="flex items-center gap-2">
              <Link 
                to="/login"
                class="text-xs font-extrabold uppercase tracking-wider text-[#6B7280] hover:text-[#111827] px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/signup"
                class="text-xs font-extrabold uppercase tracking-wider text-white bg-[#22C55E] hover:bg-[#16A34A] px-4 py-2 rounded-xl transition-all shadow-sm shadow-[#22C55E]/20"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
