import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer class="bg-white border-t border-[#E5E7EB] py-8 mt-12 text-[#6B7280]">
      <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold uppercase tracking-wider">
        <div>
          <span class="font-extrabold text-[#111827]">Hyperlocal Delivery Dispatcher</span>
          <span class="ml-2 pl-2 border-l border-[#E5E7EB]">© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div class="flex gap-6">
          <Link to="/" class="hover:text-[#22C55E] transition-colors">Home</Link>
          <Link to="/ai-search" class="hover:text-[#22C55E] transition-colors">AI Shopping</Link>
          <Link to="/cart" class="hover:text-[#22C55E] transition-colors">Cart</Link>
          <Link to="/orders" class="hover:text-[#22C55E] transition-colors">Orders</Link>
        </div>
      </div>
    </footer>
  );
}
