import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import { Calendar, Package, IndianRupee, ChevronDown, ChevronUp } from 'lucide-react';

export default function OrderCard({ order, onRateClick }) {
  const [showItems, setShowItems] = useState(false);
  const { _id, products, totalPrice, orderStatus, createdAt, ratings } = order;

  const orderDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isActive = !['Delivered', 'Cancelled'].includes(orderStatus);
  const isDelivered = orderStatus === 'Delivered';
  const isRated = !!ratings?.experienceRating;

  return (
    <div class="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-soft">
      {/* Top Header */}
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#E5E7EB] mb-4">
        <div>
          <span class="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">Order ID</span>
          <span class="font-mono text-xs font-bold text-[#111827]">#{_id}</span>
        </div>
        <div class="flex items-center gap-3">
          <StatusBadge status={orderStatus} />
        </div>
      </div>

      {/* Info grid */}
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-[#6B7280] mb-4">
        <div class="flex items-center gap-2">
          <Calendar class="w-4 h-4 text-[#6B7280]" />
          <div>
            <span class="text-[9px] uppercase tracking-wider block text-[#6B7280]">Placed On</span>
            <span class="text-[#111827]">{orderDate}</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <IndianRupee class="w-4 h-4 text-[#6B7280]" />
          <div>
            <span class="text-[9px] uppercase tracking-wider block text-[#6B7280]">Total Amount</span>
            <span class="text-[#111827] font-black">₹{totalPrice}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 col-span-2 sm:col-span-1">
          <Package class="w-4 h-4 text-[#6B7280]" />
          <div>
            <span class="text-[9px] uppercase tracking-wider block text-[#6B7280]">Items Count</span>
            <span class="text-[#111827]">{products.length} Items</span>
          </div>
        </div>
      </div>

      {/* Toggle items */}
      <div class="mb-4">
        <button 
          onClick={() => setShowItems(!showItems)}
          class="flex items-center gap-1 text-[11px] font-extrabold text-[#22C55E] uppercase tracking-wider hover:opacity-80 transition-opacity"
        >
          {showItems ? (
            <>
              Hide Items <ChevronUp class="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              View Items <ChevronDown class="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {showItems && (
          <div class="mt-3 bg-[#F8FAFC] rounded-xl p-3 border border-[#E5E7EB] space-y-2">
            {products.map((item, idx) => (
              <div key={idx} class="flex justify-between items-center text-xs">
                <span class="font-bold text-[#111827]">
                  {item.name} <span class="text-[#6B7280] font-semibold text-[10px]">x {item.quantity}</span>
                </span>
                <span class="font-extrabold text-[#111827]">₹{Math.round(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action panel */}
      <div class="flex justify-end gap-3 pt-2 border-t border-[#E5E7EB]/50">
        {isActive && (
          <Link 
            to={`/tracking/${_id}`}
            class="bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-sm shadow-[#22C55E]/10 uppercase tracking-wider"
          >
            Track Live Delivery
          </Link>
        )}
        
        {isDelivered && !isRated && onRateClick && (
          <button 
            onClick={() => onRateClick(_id)}
            class="border border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E]/5 text-xs font-extrabold px-4 py-2 rounded-xl transition-all uppercase tracking-wider"
          >
            Rate Order
          </button>
        )}

        {isDelivered && isRated && (
          <div class="text-right text-[11px] text-[#6B7280] font-bold">
            Rated: <span class="text-[#F59E0B] font-black">★ {ratings.experienceRating}.0</span>
          </div>
        )}
      </div>
    </div>
  );
}
