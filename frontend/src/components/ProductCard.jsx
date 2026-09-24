import React from 'react';
import { Plus, Minus } from 'lucide-react';

export default function ProductCard({ product, quantityInCart, onAdd, onUpdate, onRemove }) {
  const { name, brand, description, category, price, discount, stock, unit, image } = product;

  // Calculate price after discount
  const discountedPrice = Math.round(price * (1 - (discount || 0) / 100));

  const handleIncrement = () => {
    if (quantityInCart >= stock) return;
    onUpdate(product._id, quantityInCart + 1);
  };

  const handleDecrement = () => {
    if (quantityInCart <= 1) {
      onRemove(product._id);
    } else {
      onUpdate(product._id, quantityInCart - 1);
    }
  };

  return (
    <div class="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-col justify-between hover:shadow-card hover-card">
      <div>
        {/* Image & Discount Badge */}
        <div class="relative w-full aspect-square rounded-xl bg-slate-50 overflow-hidden mb-3 border border-[#E5E7EB]/50">
          <img 
            src={image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'} 
            alt={name} 
            class="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'; }}
          />
          {discount > 0 && (
            <span class="absolute top-2 left-2 bg-[#22C55E] text-white font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-md shadow-sm">
              {discount}% OFF
            </span>
          )}
          {stock === 0 && (
            <div class="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center font-extrabold text-xs text-[#EF4444] uppercase tracking-wider">
              Out of stock
            </div>
          )}
        </div>

        {/* Brand & Name */}
        <span class="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block mb-0.5">{brand}</span>
        <h4 class="font-extrabold text-sm text-[#111827] line-clamp-1 mb-0.5" title={name}>{name}</h4>
        <span class="text-[11px] text-[#6B7280] font-semibold block mb-2">{unit}</span>
      </div>

      <div class="flex items-center justify-between mt-2">
        {/* Pricing */}
        <div>
          <div class="flex items-center gap-1.5">
            <span class="text-[#111827] font-extrabold text-md">₹{discountedPrice}</span>
            {discount > 0 && (
              <span class="text-[#6B7280] line-through font-semibold text-xs">₹{price}</span>
            )}
          </div>
        </div>

        {/* Inline Quantity Controls */}
        {stock > 0 && (
          <div>
            {quantityInCart > 0 ? (
              <div class="flex items-center bg-[#22C55E] text-white rounded-lg px-2.5 py-1 text-xs font-black shadow-sm select-none gap-2.5">
                <button onClick={handleDecrement} class="hover:opacity-80 transition-opacity p-0.5">
                  <Minus class="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <span class="min-w-4 text-center">{quantityInCart}</span>
                <button onClick={handleIncrement} disabled={quantityInCart >= stock} class="hover:opacity-80 transition-opacity p-0.5 disabled:opacity-40">
                  <Plus class="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onAdd(product._id)}
                class="bg-white border border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E]/5 px-4 py-1 rounded-lg text-xs font-extrabold transition-all uppercase tracking-wider"
              >
                ADD
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
