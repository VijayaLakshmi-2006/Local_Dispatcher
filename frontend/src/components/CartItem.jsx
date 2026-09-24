import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { product, quantity } = item;
  if (!product) return null;

  const discountedPrice = Math.round(product.price * (1 - (product.discount || 0) / 100));

  const handleIncrement = () => {
    if (quantity >= product.stock) return;
    onUpdateQuantity(product._id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity <= 1) {
      onRemove(product._id);
    } else {
      onUpdateQuantity(product._id, quantity - 1);
    }
  };

  return (
    <div class="flex items-center gap-4 bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-soft">
      {/* Product Image */}
      <img 
        src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80'} 
        alt={product.name} 
        class="w-16 h-16 object-cover rounded-lg bg-slate-50 border border-[#E5E7EB]"
        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80'; }}
      />

      {/* Details */}
      <div class="flex-grow min-w-0">
        <span class="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block">{product.brand}</span>
        <h5 class="font-extrabold text-sm text-[#111827] line-clamp-1 mb-0.5">{product.name}</h5>
        <span class="text-[10px] text-[#6B7280] font-semibold block mb-1">{product.unit}</span>
        
        {/* Pricing */}
        <div class="flex items-center gap-1.5">
          <span class="text-[#22C55E] font-black text-sm">₹{discountedPrice}</span>
          {product.discount > 0 && (
            <span class="text-[#6B7280] line-through font-semibold text-xs">₹{product.price}</span>
          )}
        </div>
      </div>

      {/* Controls & Trash */}
      <div class="flex items-center gap-3">
        {/* Increment / Decrement */}
        <div class="flex items-center bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] rounded-lg px-2 py-0.5 text-xs font-black select-none gap-2">
          <button onClick={handleDecrement} class="hover:bg-[#22C55E]/15 rounded p-0.5">
            <Minus class="w-3.5 h-3.5 stroke-[3]" />
          </button>
          <span class="min-w-4 text-center">{quantity}</span>
          <button onClick={handleIncrement} disabled={quantity >= product.stock} class="hover:bg-[#22C55E]/15 rounded p-0.5 disabled:opacity-40">
            <Plus class="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* Delete */}
        <button 
          onClick={() => onRemove(product._id)}
          class="p-2 text-[#6B7280] hover:text-[#EF4444] rounded-lg hover:bg-[#EF4444]/5 transition-colors"
          title="Remove item"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
