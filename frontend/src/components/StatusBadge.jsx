import React from 'react';

export default function StatusBadge({ status }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Order Confirmed':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Preparing':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Assigned':
        return 'bg-[#22C55E]/5 text-[#22C55E] border-[#22C55E]/10';
      case 'Picked Up':
      case 'On The Way':
      case 'Near You':
      case 'Out For Delivery':
        return 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20 animate-pulse';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <span class={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${getBadgeStyle()}`}>
      {status}
    </span>
  );
}
