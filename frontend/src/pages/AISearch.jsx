import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../App.jsx';
import { Sparkles, Mic, ArrowRight, Check, Plus, Minus, Info, RefreshCw, ShoppingCart, UserCheck } from 'lucide-react';

export default function AISearch() {
  const { refreshCart } = useContext(AuthContext);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // AI Parse Results
  const [aiData, setAiData] = useState(null);
  // Selected brands and quantities mapping
  // key: ingredientName, value: product object (either matched, budget, or premium)
  const [selectedItems, setSelectedItems] = useState({});
  const [quantities, setQuantities] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  
  // Voice Simulation State
  const [isListening, setIsListening] = useState(false);

  // Pre-seed sample search chips
  const samplePrompts = [
    "I need to make chicken biryani for 5 people",
    "I want to make fresh cheese pizza for 4 friends",
    "Chai tea party snacks list for 6 people",
    "Healthy breakfast ingredients for 3 people"
  ];

  const handleAISearch = async (searchPromptText) => {
    const activePrompt = searchPromptText || prompt;
    if (!activePrompt.trim()) return;

    setError('');
    setLoading(true);
    setAiData(null);
    setSelectedItems({});
    setQuantities({});
    setCheckedItems({});

    try {
      const res = await axios.post('/api/ai/search', { prompt: activePrompt });
      if (res.data.success && res.data.data) {
        const data = res.data.data;
        setAiData(data);
        
        // Populate default choices
        const initialSelected = {};
        const initialQuantities = {};
        const initialChecked = {};

        data.ingredients.forEach((ing) => {
          // Default to matchedProduct if available, otherwise suggestions.budget
          const defaultProduct = ing.matchedProduct || ing.suggestions.budget;
          if (defaultProduct) {
            initialSelected[ing.ingredientName] = defaultProduct;
            initialQuantities[ing.ingredientName] = 1;
            initialChecked[ing.ingredientName] = true;
          }
        });

        setSelectedItems(initialSelected);
        setQuantities(initialQuantities);
        setCheckedItems(initialChecked);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to analyze your prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBrand = (ingredientName, productType, productObj) => {
    setSelectedItems(prev => ({
      ...prev,
      [ingredientName]: productObj
    }));
  };

  const adjustQty = (ingredientName, delta) => {
    setQuantities(prev => {
      const current = prev[ingredientName] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [ingredientName]: next };
    });
  };

  const toggleCheck = (ingredientName) => {
    setCheckedItems(prev => ({
      ...prev,
      [ingredientName]: !prev[ingredientName]
    }));
  };

  // Add all selected items to cart
  const [cartSuccess, setCartSuccess] = useState(false);
  const handleAddAllToCart = async () => {
    const itemsToAdd = [];
    
    Object.keys(checkedItems).forEach(ingName => {
      if (checkedItems[ingName] && selectedItems[ingName]) {
        itemsToAdd.push({
          productId: selectedItems[ingName].id || selectedItems[ingName]._id,
          quantity: quantities[ingName] || 1
        });
      }
    });

    if (itemsToAdd.length === 0) return;

    try {
      setLoading(true);
      const res = await axios.post('/api/cart/add', { items: itemsToAdd });
      if (res.data.success) {
        setCartSuccess(true);
        refreshCart();
        setTimeout(() => setCartSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      setError('Could not update cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Simulated Voice Input
  const handleVoiceSearch = () => {
    setIsListening(true);
    const spokenOptions = [
      "Need ingredients for chicken biryani for five people",
      "I want to make a fresh cheese pizza for four",
      "Get snacks for a tea party of six people"
    ];
    // Random select
    const randomSpeech = spokenOptions[Math.floor(Math.random() * spokenOptions.length)];
    
    // Simulate typing delay
    let currentText = "";
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < randomSpeech.length) {
        currentText += randomSpeech[index];
        setPrompt(currentText);
        index++;
      } else {
        clearInterval(interval);
        setIsListening(false);
        // Fire search
        handleAISearch(randomSpeech);
      }
    }, 40);
  };

  return (
    <div class="space-y-8 max-w-5xl mx-auto">
      {/* Search Bar Segment */}
      <div class="glass-panel p-8 rounded-3xl shadow-xl relative border border-white/5 overflow-hidden">
        <div class="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex items-center gap-2 mb-6">
          <Sparkles class="w-5 h-5 text-indigo-400 animate-pulse" />
          <h2 class="text-xl font-extrabold text-white">Ask the AI Shopping Assistant</h2>
        </div>

        <div class="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your recipe or delivery requirements. E.g. 'I want to cook chicken biryani for 5 guests' or 'Need ingredients for breakfast for 4 people'"
            class="w-full min-h-[100px] glass-input rounded-2xl p-5 pr-14 text-sm resize-none pr-16 leading-relaxed"
            disabled={loading || isListening}
          />
          
          {/* Micro Animation Voice Button */}
          <button
            onClick={handleVoiceSearch}
            disabled={loading || isListening}
            class={`absolute right-4 bottom-4 p-3 rounded-xl border transition-all duration-300 ${isListening ? 'bg-rose-500 border-rose-500 text-white animate-bounce' : 'bg-slate-900 border-white/10 text-indigo-400 hover:text-white hover:bg-slate-800'}`}
            title="Simulate Voice Input"
          >
            <Mic class={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {isListening && (
          <div class="text-xs text-indigo-400 font-bold flex items-center gap-1.5 mt-2 ml-1">
            <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            Listening (Simulated speech processing...)
          </div>
        )}

        <div class="flex flex-wrap items-center justify-between gap-4 mt-6">
          {/* Suggestions */}
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Try:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => { setPrompt(p); handleAISearch(p); }}
                class="text-xs font-semibold bg-white/5 hover:bg-indigo-500/15 border border-white/5 hover:border-indigo-500/25 px-3 py-1.5 rounded-full transition-all text-gray-300 hover:text-indigo-300"
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleAISearch()}
            disabled={loading || isListening || !prompt.trim()}
            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/10 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Analyze Recipe</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading animation state */}
      {loading && (
        <div class="glass-panel p-12 rounded-3xl text-center space-y-4">
          <div class="relative w-16 h-16 mx-auto">
            <div class="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <Sparkles class="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div class="space-y-1">
            <h3 class="font-extrabold text-white">AI Assistant is compiling list</h3>
            <p class="text-xs text-gray-400">Estimating quantities, scaling ingredients, and querying stock inventories...</p>
          </div>
        </div>
      )}

      {/* Error Panel */}
      {error && (
        <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* AI Success cart notice */}
      {cartSuccess && (
        <div class="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm font-black flex items-center gap-2 justify-center animate-bounce shadow-xl">
          <ShoppingCart class="w-5 h-5 animate-pulse" />
          Smart Cart Generated! Re-allocated inventory and saved details.
        </div>
      )}

      {/* AI Processed Output Result Panel */}
      {aiData && (
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left panel: Recipe details & Ingredient Checklist */}
          <div class="md:col-span-5 glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-black bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-500/10">
                  Dish Identified
                </span>
                <span class="text-xs text-gray-400 font-bold bg-white/5 px-2.5 py-1 rounded-full">
                  Serves {aiData.people}
                </span>
              </div>
              <h3 class="text-2xl font-extrabold text-white capitalize">{aiData.dish}</h3>
            </div>

            <div class="space-y-3">
              <span class="text-xs font-bold text-gray-400 uppercase tracking-widest block pl-1">Ingredient Checklist</span>
              <div class="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {aiData.ingredients.map((ing, idx) => {
                  const hasMatch = !!selectedItems[ing.ingredientName];
                  const isChecked = !!checkedItems[ing.ingredientName];
                  
                  return (
                    <div 
                      key={idx}
                      onClick={() => toggleCheck(ing.ingredientName)}
                      class={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${isChecked ? 'bg-indigo-500/5 border-indigo-500/20 text-white' : 'bg-slate-950/20 border-white/5 text-gray-400 hover:text-gray-300'}`}
                    >
                      <div class="flex items-center gap-3">
                        <div class={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isChecked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/20 bg-slate-950/30'}`}>
                          {isChecked && <Check class="w-3.5 h-3.5 stroke-[4]" />}
                        </div>
                        <span class={`text-sm font-semibold capitalize ${isChecked ? 'text-white' : 'line-through opacity-60'}`}>
                          {ing.ingredientName}
                        </span>
                      </div>
                      <span class="text-xs font-bold bg-white/5 px-2 py-0.5 rounded-md text-gray-300">
                        {ing.requiredQuantity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleAddAllToCart}
              class="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/15 transition-all active:translate-y-0.5 hover:-translate-y-0.5"
            >
              <ShoppingCart class="w-4 h-4" />
              <span>Add Smart List to Cart</span>
            </button>
          </div>

          {/* Right panel: Matched database products */}
          <div class="md:col-span-7 space-y-4">
            <div class="flex items-center justify-between pl-1">
              <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Store Product Matches</span>
              <span class="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">Inventory Match</span>
            </div>

            <div class="space-y-4 max-h-[580px] overflow-y-auto pr-1">
              {aiData.ingredients.map((ing, idx) => {
                const isChecked = !!checkedItems[ing.ingredientName];
                const product = selectedItems[ing.ingredientName];
                const budget = ing.suggestions?.budget;
                const premium = ing.suggestions?.premium;

                if (!product) {
                  return (
                    <div key={idx} class="glass-panel p-4 rounded-2xl flex items-center justify-between opacity-50">
                      <span class="text-sm font-bold text-gray-500">No match for "{ing.ingredientName}" in catalog</span>
                      <Info class="w-4 h-4 text-gray-600" />
                    </div>
                  );
                }

                const qty = quantities[ing.ingredientName] || 1;
                const currentPrice = product.price * (1 - (product.discount || 0)/100);
                const isSelectedBudget = budget && product.id === budget.id;
                const isSelectedPremium = premium && product.id === premium.id;

                return (
                  <div 
                    key={idx} 
                    class={`glass-card p-5 rounded-2xl border transition-all duration-200 ${isChecked ? 'opacity-100 border-indigo-500/30' : 'opacity-40 border-white/5 hover:opacity-60'}`}
                  >
                    <div class="flex gap-4">
                      {/* Product Image */}
                      <img 
                        src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'} 
                        alt={product.name}
                        class="w-16 h-16 rounded-xl object-cover border border-white/10 bg-slate-900"
                      />

                      {/* Details */}
                      <div class="flex-grow space-y-2">
                        <div class="flex items-start justify-between gap-2">
                          <div>
                            <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                              {product.brand} • {product.unit}
                            </span>
                            <h4 class="text-sm font-bold text-white leading-tight">
                              {product.name}
                            </h4>
                          </div>

                          <div class="text-right">
                            <span class="text-sm font-black text-indigo-400">
                              ₹{Math.round(currentPrice * qty)}
                            </span>
                            {product.discount > 0 && (
                              <span class="text-[10px] text-gray-500 line-through block -mt-0.5">
                                ₹{product.price * qty}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Brand Switchers */}
                        {(budget || premium) && (
                          <div class="flex flex-wrap gap-2 pt-1">
                            {budget && (
                              <button
                                onClick={() => toggleBrand(ing.ingredientName, 'budget', budget)}
                                class={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${isSelectedBudget ? 'bg-indigo-500/25 border-indigo-400 text-indigo-300' : 'bg-slate-950/40 border-white/5 text-gray-500 hover:text-gray-400'}`}
                              >
                                Budget: {budget.brand} (₹{budget.price})
                              </button>
                            )}
                            {premium && (
                              <button
                                onClick={() => toggleBrand(ing.ingredientName, 'premium', premium)}
                                class={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${isSelectedPremium ? 'bg-indigo-500/25 border-indigo-400 text-indigo-300' : 'bg-slate-950/40 border-white/5 text-gray-500 hover:text-gray-400'}`}
                              >
                                Premium: {premium.brand} (₹{premium.price})
                              </button>
                            )}
                          </div>
                        )}

                        {/* Quantity controls */}
                        <div class="flex items-center justify-between pt-2 border-t border-white/5">
                          <span class="text-[10px] font-bold text-gray-500">Scale Quantity</span>
                          <div class="flex items-center bg-slate-950/40 border border-white/10 rounded-lg p-0.5">
                            <button
                              onClick={() => adjustQty(ing.ingredientName, -1)}
                              class="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"
                            >
                              <Minus class="w-3 h-3" />
                            </button>
                            <span class="text-xs font-black px-2.5 text-white">
                              {qty}
                            </span>
                            <button
                              onClick={() => adjustQty(ing.ingredientName, 1)}
                              class="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"
                            >
                              <Plus class="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
