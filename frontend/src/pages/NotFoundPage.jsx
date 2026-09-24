import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div class="max-w-md mx-auto text-center py-20 px-4 bg-white border border-[#E5E7EB] rounded-2xl shadow-soft">
      <HelpCircle class="w-16 h-16 text-[#EF4444] mx-auto mb-4" />
      <h2 class="text-2xl font-black text-[#111827] mb-2">Page Not Found</h2>
      <p class="text-xs text-[#6B7280] font-semibold leading-relaxed mb-6">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <button 
        onClick={() => navigate('/')}
        class="bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-[#22C55E]/20 uppercase tracking-wider"
      >
        Go Back Home
      </button>
    </div>
  );
}
