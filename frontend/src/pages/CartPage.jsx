import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import CartItem from '../components/CartItem.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { ChevronLeft, ShoppingCart, Info } from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, totalPrice, loading, getCart, updateQuantity, removeFromCart } = useCart();

  useEffect(() => {
    getCart();
  }, []);

  if (loading && items.length === 0) return <LoadingSpinner message="Opening your cart..." />;

  if (items.length === 0) {
    return (
      <div class="py-12">
        <EmptyState 
          type="cart"
          title="Your cart is empty"
          message="Looks like you haven't added any products to your cart yet. Visit our smart assistant to build your list."
          actionText="Go to AI Shopping"
          onAction={() => navigate('/ai-search')}
        />
      </div>
    );
  }

  // Fees details
  const deliveryFee = totalPrice > 500 ? 0 : 30; // Free delivery above 500
  const taxes = Math.round(totalPrice * 0.05); // 5% GST
  const grandTotal = Math.round(totalPrice + deliveryFee + taxes);

  return (
    <div class="space-y-6 py-4">
      {/* Top Navigation */}
      <div class="flex items-center justify-between pl-1">
        <button 
          onClick={() => navigate('/ai-search')}
          class="flex items-center gap-1 text-xs font-bold text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <ChevronLeft class="w-4 h-4" /> Continue AI Shopping
        </button>
        <span class="text-xs text-[#6B7280] font-extrabold uppercase tracking-wider flex items-center gap-1">
          <ShoppingCart class="w-3.5 h-3.5 text-[#22C55E]" /> Shopping Cart ({items.length} Products)
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Cart Items list */}
        <div class="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <CartItem 
              key={item.product?._id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        {/* Right Side: Order Summary Panel */}
        <div class="lg:col-span-4 bg-white border border-[#E5E7EB] p-6 rounded-3xl shadow-soft space-y-6">
          <h3 class="font-extrabold text-sm text-[#111827] uppercase tracking-wider border-b pb-3">Bill Details</h3>
          
          <div class="space-y-3.5 text-xs text-[#6B7280] font-semibold">
            <div class="flex justify-between items-center">
              <span>Subtotal (Item Total)</span>
              <span class="text-[#111827]">₹{totalPrice}</span>
            </div>

            <div class="flex justify-between items-center">
              <span class="flex items-center gap-1">
                Delivery Partner Fee
                {deliveryFee === 0 && (
                  <span class="bg-[#22C55E]/10 text-[#22C55E] text-[8px] font-black uppercase px-1.5 py-0.5 rounded">FREE</span>
                )}
              </span>
              <span class="text-[#111827]">{deliveryFee > 0 ? `₹${deliveryFee}` : '₹0'}</span>
            </div>

            <div class="flex justify-between items-center">
              <span>Govt. Taxes (GST 5%)</span>
              <span class="text-[#111827]">₹{taxes}</span>
            </div>

            {deliveryFee > 0 && (
              <div class="flex gap-2 p-2.5 rounded-xl bg-slate-50 border border-[#E5E7EB]/50 text-[10px] text-[#6B7280] leading-normal font-semibold">
                <Info class="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Shop for ₹{500 - totalPrice} more to avail **Free Delivery** benefits on this order.</span>
              </div>
            )}

            <div class="pt-4 border-t border-[#E5E7EB]/50 flex justify-between items-center text-sm">
              <span class="font-extrabold text-[#111827]">Grand Total</span>
              <span class="font-black text-[#111827] text-md">₹{grandTotal}</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/checkout')}
            class="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-extrabold py-4 rounded-xl transition-all shadow-sm shadow-[#22C55E]/20 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
