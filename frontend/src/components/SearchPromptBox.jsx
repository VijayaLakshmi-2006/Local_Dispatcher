import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function SearchPromptBox({ placeholder, onSearch, loading }) {
  const [prompt, setPrompt] = useState('');

  const suggestions = [
    { label: "Chicken Biryani for 4 people", text: "I want to make Chicken Biryani for 4 people tonight" },
    { label: "Pizza party for 6 guests", text: "Need ingredients for a fresh pizza party for 6 guests" },
    { label: "Standard Indian Breakfast for 2", text: "Standard Indian breakfast list for 2 people" },
    { label: "Tea party snacks list", text: "Snacks and soft drinks for a standard tea party" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    onSearch(prompt.trim());
  };

  const handleSuggestionClick = (text) => {
    setPrompt(text);
    onSearch(text);
  };

  return (
    <div class="space-y-4 w-full">
      <form onSubmit={handleSubmit} class="relative bg-white rounded-2xl border-2 border-[#E5E7EB] shadow-soft p-2 flex items-center focus-within:border-[#22C55E] transition-all">
        <div class="pl-3 text-[#6B7280]">
          <Sparkles class="w-5 h-5 text-[#22C55E]" />
        </div>
        <input 
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder || "Describe what you need in plain English..."}
          disabled={loading}
          class="w-full pl-3 pr-16 py-3 bg-transparent text-sm font-semibold text-[#111827] placeholder-slate-400 focus:outline-none disabled:opacity-60"
        />
        <button 
          type="submit"
          disabled={!prompt.trim() || loading}
          class="absolute right-2 bg-[#22C55E] hover:bg-[#16A34A] text-white p-2.5 rounded-xl transition-all shadow-sm shadow-[#22C55E]/20 flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none"
        >
          <ArrowRight class="w-5 h-5" />
        </button>
      </form>

      {/* Clickable Suggestions */}
      {!loading && (
        <div class="flex flex-wrap gap-2 pt-1.5 pl-1.5 justify-center sm:justify-start">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(item.text)}
              class="text-[10px] sm:text-xs font-bold bg-[#F1F5F9] text-[#6B7280] hover:bg-[#22C55E]/5 hover:text-[#22C55E] border border-[#E5E7EB] hover:border-[#22C55E]/25 px-3 py-1.5 rounded-full transition-all"
            >
              ✨ {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
