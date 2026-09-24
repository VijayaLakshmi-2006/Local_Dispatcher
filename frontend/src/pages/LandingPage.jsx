import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Sparkles, Compass, ShieldCheck, MapPin, ListPlus } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStartShopping = () => {
    if (isAuthenticated) {
      navigate('/ai-search');
    } else {
      navigate('/login');
    }
  };

  const handleExplore = () => {
    navigate('/products');
  };

  return (
    <div class="space-y-20 py-6">
      {/* Hero Section */}
      <div class="text-center max-w-3xl mx-auto space-y-6 pt-8">
        <div class="inline-flex items-center gap-2 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] px-4.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
          <Sparkles class="w-3.5 h-3.5" /> AI-Powered Grocery Assistant
        </div>
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-black text-[#111827] tracking-tight leading-tight sm:leading-none">
          Describe what you need.<br/>
          <span class="text-[#22C55E]">Let AI build your shopping list.</span>
        </h1>
        <p class="text-sm sm:text-md text-[#6B7280] font-semibold leading-relaxed max-w-2xl mx-auto">
          From recipes to party supplies, type what you are cooking or preparing. Our AI smart search automatically detects ingredient proportions and populates your cart in seconds.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={handleStartShopping}
            class="w-full sm:w-auto bg-[#22C55E] hover:bg-[#16A34A] text-white font-extrabold text-sm px-8 py-3.5 rounded-xl transition-all shadow-md shadow-[#22C55E]/20 uppercase tracking-wider flex items-center justify-center gap-2"
          >
            Start AI Shopping <Sparkles class="w-4 h-4" />
          </button>
          <button 
            onClick={handleExplore}
            class="w-full sm:w-auto bg-white border border-[#E5E7EB] hover:bg-slate-50 text-[#111827] font-extrabold text-sm px-8 py-3.5 rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2"
          >
            Explore Products <Compass class="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div class="space-y-8">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-black text-[#111827]">Supercharge your shopping experience</h2>
          <p class="text-xs text-[#6B7280] font-bold uppercase tracking-wider">Engineered for speed, built for convenience</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-soft space-y-3">
            <div class="w-10 h-10 rounded-xl bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center">
              <Sparkles class="w-5 h-5" />
            </div>
            <h3 class="font-extrabold text-[#111827] text-md">AI Prompt Shopping</h3>
            <p class="text-xs text-[#6B7280] font-semibold leading-relaxed">
              Describe your needs naturally, like "biryani ingredients for 5 friends," and let our AI compile the items.
            </p>
          </div>

          <div class="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-soft space-y-3">
            <div class="w-10 h-10 rounded-xl bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center">
              <ListPlus class="w-5 h-5" />
            </div>
            <h3 class="font-extrabold text-[#111827] text-md">Smart Scaling</h3>
            <p class="text-xs text-[#6B7280] font-semibold leading-relaxed">
              AI automatically estimates proportions and brand tiers, matching your recipes to catalog inventory items.
            </p>
          </div>

          <div class="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-soft space-y-3">
            <div class="w-10 h-10 rounded-xl bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center">
              <MapPin class="w-5 h-5" />
            </div>
            <h3 class="font-extrabold text-[#111827] text-md">Live GPS Tracking</h3>
            <p class="text-xs text-[#6B7280] font-semibold leading-relaxed">
              Watch your delivery agent travel in real-time on our interactive Leaflet maps with live status updates.
            </p>
          </div>

          <div class="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-soft space-y-3">
            <div class="w-10 h-10 rounded-xl bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <h3 class="font-extrabold text-[#111827] text-md">Secure Deliveries</h3>
            <p class="text-xs text-[#6B7280] font-semibold leading-relaxed">
              MERN architecture secures your details, including simulated UPI and card checkout transactions.
            </p>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div class="bg-white border border-[#E5E7EB] rounded-3xl p-8 md:p-12 shadow-soft space-y-8">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-black text-[#111827]">How InstaDispatch Works</h2>
          <p class="text-xs text-[#6B7280] font-bold uppercase tracking-wider">Five simple steps to lightning fast checkout</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-6 text-center relative">
          <div class="space-y-2 relative">
            <span class="w-8 h-8 rounded-full bg-[#22C55E] text-white font-extrabold flex items-center justify-center mx-auto shadow-sm">1</span>
            <h4 class="font-extrabold text-[#111827] text-sm">Describe Details</h4>
            <p class="text-[11px] text-[#6B7280] font-semibold leading-relaxed">Type your recipe prompt or meal requirements.</p>
          </div>
          
          <div class="space-y-2">
            <span class="w-8 h-8 rounded-full bg-[#22C55E] text-white font-extrabold flex items-center justify-center mx-auto shadow-sm">2</span>
            <h4 class="font-extrabold text-[#111827] text-sm">AI Generates List</h4>
            <p class="text-[11px] text-[#6B7280] font-semibold leading-relaxed">AI compiles required quantities and stock items.</p>
          </div>

          <div class="space-y-2">
            <span class="w-8 h-8 rounded-full bg-[#22C55E] text-white font-extrabold flex items-center justify-center mx-auto shadow-sm">3</span>
            <h4 class="font-extrabold text-[#111827] text-sm">Review Cart</h4>
            <p class="text-[11px] text-[#6B7280] font-semibold leading-relaxed">Adjust quantities, brand suggestions, and defaults.</p>
          </div>

          <div class="space-y-2">
            <span class="w-8 h-8 rounded-full bg-[#22C55E] text-white font-extrabold flex items-center justify-center mx-auto shadow-sm">4</span>
            <h4 class="font-extrabold text-[#111827] text-sm">Checkout Order</h4>
            <p class="text-[11px] text-[#6B7280] font-semibold leading-relaxed">Make simulated Razorpay payments instantly.</p>
          </div>

          <div class="space-y-2">
            <span class="w-8 h-8 rounded-full bg-[#22C55E] text-white font-extrabold flex items-center justify-center mx-auto shadow-sm">5</span>
            <h4 class="font-extrabold text-[#111827] text-sm">Track Courier</h4>
            <p class="text-[11px] text-[#6B7280] font-semibold leading-relaxed">Watch the nearest rider move on Leaflet maps.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
