import React from 'react';
import { MapPin, Phone, Home, Briefcase, Landmark, Edit2, Trash2 } from 'lucide-react';

export default function AddressCard({ address, isSelected, onSelect, onEdit, onDelete, onSetDefault }) {
  const { name, phone, houseNumber, street, city, state, pincode, landmark, isDefault } = address;

  // Icon depending on name/label
  const getIcon = () => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('home')) return <Home class="w-4 h-4" />;
    if (lowercaseName.includes('office') || lowercaseName.includes('work')) return <Briefcase class="w-4 h-4" />;
    return <Landmark class="w-4 h-4" />;
  };

  return (
    <div 
      onClick={() => onSelect && onSelect(address)}
      class={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${isSelected ? 'bg-[#22C55E]/5 border-[#22C55E] shadow-soft' : 'bg-white border-[#E5E7EB] hover:border-gray-300'}`}
    >
      <div class="flex gap-3">
        <div class={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-slate-100 text-[#6B7280]'}`}>
          {getIcon()}
        </div>

        <div class="flex-grow text-xs text-[#6B7280]">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="font-extrabold text-[#111827] text-sm uppercase">{name}</span>
            {isDefault && (
              <span class="bg-slate-100 text-[#6B7280] font-bold text-[9px] px-1.5 py-0.5 rounded uppercase shrink-0">Default</span>
            )}
          </div>
          
          <p class="font-medium text-[#111827] mb-1">{houseNumber}, {street}</p>
          <p class="font-semibold mb-2">{city}, {state} - {pincode}</p>
          
          {landmark && (
            <p class="mb-2 italic text-[#6B7280]/80">Landmark: {landmark}</p>
          )}

          <div class="flex items-center gap-1.5 text-[11px] font-semibold text-[#111827]">
            <Phone class="w-3.5 h-3.5 text-[#6B7280]" />
            <span>{phone}</span>
          </div>
        </div>
      </div>

      {/* Action Footer bar */}
      <div class="flex items-center justify-between border-t border-[#E5E7EB]/50 pt-2.5 mt-1 text-[11px] font-extrabold select-none">
        <div class="flex items-center gap-3">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit && onEdit(address); }}
            class="text-[#6B7280] hover:text-[#111827] flex items-center gap-1 hover:underline"
          >
            <Edit2 class="w-3 h-3" /> Edit
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete && onDelete(address); }}
            class="text-[#EF4444] hover:text-[#DC2626] flex items-center gap-1 hover:underline"
          >
            <Trash2 class="w-3 h-3" /> Delete
          </button>
        </div>

        {!isDefault && (
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onSetDefault && onSetDefault(address); }}
            class="text-[#22C55E] hover:underline"
          >
            Set Default
          </button>
        )}
      </div>
    </div>
  );
}
