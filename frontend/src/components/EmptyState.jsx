import React from 'react';
import { ShoppingBag, FileQuestion, HelpCircle, MapPinned } from 'lucide-react';

export default function EmptyState({ type, title, message, actionText, onAction }) {
  const getIcon = () => {
    switch (type) {
      case 'cart':
        return <ShoppingBag class="w-12 h-12 text-[#6B7280] mb-2 stroke-[1.5]" />;
      case 'address':
        return <MapPinned class="w-12 h-12 text-[#6B7280] mb-2 stroke-[1.5]" />;
      case 'orders':
        return <FileQuestion class="w-12 h-12 text-[#6B7280] mb-2 stroke-[1.5]" />;
      default:
        return <HelpCircle class="w-12 h-12 text-[#6B7280] mb-2 stroke-[1.5]" />;
    }
  };

  return (
    <div class="flex flex-col items-center justify-center text-center py-16 px-4 bg-white border border-[#E5E7EB] rounded-2xl shadow-soft max-w-md mx-auto">
      <div class="p-4 bg-slate-50 rounded-2xl mb-4 border border-[#E5E7EB]/50">
        {getIcon()}
      </div>
      <h3 class="font-extrabold text-lg text-[#111827] mb-1">{title || 'No data found'}</h3>
      <p class="text-xs text-[#6B7280] font-medium leading-relaxed max-w-xs mb-6">{message}</p>
      {actionText && onAction && (
        <button 
          onClick={onAction}
          class="bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-[#22C55E]/20 uppercase tracking-wider"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
