import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { submitAIPrompt, fetchAIHistory, clearAIResults } from '../store/aiSlice.js';
import { addBulkItems } from '../store/cartSlice.js';
import SearchPromptBox from '../components/SearchPromptBox.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { Sparkles, Check, Plus, Minus, Info, ShoppingCart, Calendar, ShoppingBag, Mic, Zap, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIShoppingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeResult, history, loading, error } = useSelector((state) => state.ai);

  // Selected brands and quantities mapping
  // key: ingredientName, value: product object (either matched, budget, or premium)
  const [selectedItems, setSelectedItems] = useState({});
  const [quantities, setQuantities] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  
  // Voice Simulation State
  const [isListening, setIsListening] = useState(false);
  const [promptBoxPlaceholder, setPromptBoxPlaceholder] = useState("I want to cook Paneer Butter Masala for 4 friends...");

  // Load search history on mount
  useEffect(() => {
    dispatch(fetchAIHistory());
  }, [dispatch]);

  // When AI returns results, pre-populate selected products and defaults
  useEffect(() => {
    if (activeResult && activeResult.ingredients) {
      const initialSelected = {};
      const initialQuantities = {};
      const initialChecked = {};

      activeResult.ingredients.forEach((ing) => {
        const defaultProduct = ing.matchedProduct || ing.suggestions?.budget;
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
  }, [activeResult]);

  const handleSearchSubmit = (promptText) => {
    if (!promptText || !promptText.trim()) return;
    dispatch(submitAIPrompt(promptText))
      .unwrap()
      .then(() => {
        toast.success("List parsed successfully!");
        dispatch(fetchAIHistory());
      })
      .catch((err) => {
        toast.error(err || "Failed to analyze prompt");
      });
  };

  const toggleBrand = (ingredientName, productObj) => {
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

  const handleSelectAll = () => {
    if (!activeResult || !activeResult.ingredients) return;
    
    // Check if all available matched items are currently selected
    const allMatchedIngredients = activeResult.ingredients.filter(ing => selectedItems[ing.ingredientName]);
    const allSelected = allMatchedIngredients.every(ing => checkedItems[ing.ingredientName]);
    
    const newChecked = { ...checkedItems };
    allMatchedIngredients.forEach(ing => {
      newChecked[ing.ingredientName] = !allSelected; // toggle all based on current state
    });
    setCheckedItems(newChecked);
  };

  // Prepare bulk item payload helper
  const getItemsToCartPayload = () => {
    const itemsToAdd = [];
    Object.keys(checkedItems).forEach(ingName => {
      if (checkedItems[ingName] && selectedItems[ingName]) {
        itemsToAdd.push({
          productId: selectedItems[ingName].id || selectedItems[ingName]._id,
          quantity: quantities[ingName] || 1
        });
      }
    });
    return itemsToAdd;
  };

  const handleAddAllToCart = () => {
    const itemsToAdd = getItemsToCartPayload();
    if (itemsToAdd.length === 0) {
      toast.error('No items selected to add');
      return;
    }

    dispatch(addBulkItems(itemsToAdd))
      .unwrap()
      .then(() => {
        toast.success('Smart Cart updated with AI list!');
      })
      .catch(() => {
        toast.error('Failed to update cart');
      });
  };

  const handleInstantCheckout = () => {
    const itemsToAdd = getItemsToCartPayload();
    if (itemsToAdd.length === 0) {
      toast.error('No items selected to checkout');
      return;
    }

    toast.loading('Preparing your checkout...', { id: 'prepCheckout' });
    dispatch(addBulkItems(itemsToAdd))
      .unwrap()
      .then(() => {
        toast.dismiss('prepCheckout');
        toast.success('Cart updated! Redirecting to checkout...');
        navigate('/checkout');
      })
      .catch(() => {
        toast.dismiss('prepCheckout');
        toast.error('Failed to initiate checkout');
      });
  };

  // Simulated Voice Input across domains
  const handleVoiceSimulation = () => {
    setIsListening(true);
    const spokenOptions = [
      "I forgot my iPhone charger and battery is at 5%",
      "Need medicine for cold and fever relief for 3 days",
      "Craving burger and french fries for 4 friends tonight",
      "I want to prepare chicken biryani for 6 people",
      "My floor is dirty and I need cleaning supplies"
    ];
    const randomSpeech = spokenOptions[Math.floor(Math.random() * spokenOptions.length)];
    
    let currentText = "";
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < randomSpeech.length) {
        currentText += randomSpeech[index];
        setPromptBoxPlaceholder(currentText);
        index++;
      } else {
        clearInterval(interval);
        setIsListening(false);
        setPromptBoxPlaceholder("I want to cook Paneer Butter Masala for 4 friends...");
        handleSearchSubmit(randomSpeech);
      }
    }, 25);
  };

  // Calculate estimated total cost
  const calculateTotalCost = () => {
    let cost = 0;
    Object.keys(checkedItems).forEach(ingName => {
      if (checkedItems[ingName] && selectedItems[ingName]) {
        const item = selectedItems[ingName];
        const qty = quantities[ingName] || 1;
        const discountedPrice = Math.round(item.price * (1 - (item.discount || 0) / 100));
        cost += discountedPrice * qty;
      }
    });
    return cost;
  };

  // Intent Domain Badges Styling Map
  const categoryStyles = {
    'Pharmacy': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    'Health & Medical Needs': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    'Electronics': 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    'Fast Food': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'Recipe Based Shopping': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'Groceries': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    'Grocery Purchase': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    'Bulk Shopping': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    'Household': 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    'Household Shopping': 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    'Emergency Shopping': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    'Party/Event Planning': 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20',
    'Vegetables': 'bg-teal-500/10 text-teal-600 border-teal-500/20',
    'Fruits': 'bg-orange-500/10 text-orange-600 border-orange-500/20'
  };

  const getCategoryStyle = (cat) => {
    return categoryStyles[cat] || 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  };

  return (
    <div class="space-y-8 py-6 max-w-6xl mx-auto">
      {/* Search Input Box Card */}
      <div class="bg-white border border-[#E5E7EB] p-8 rounded-3xl shadow-soft relative overflow-hidden">
        {/* Decorative corner glows */}
        <div class="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex items-center justify-between mb-4.5 pl-0.5">
          <div class="flex items-center gap-1.5">
            <Sparkles class="w-5 h-5 text-[#22C55E]" />
            <h2 class="text-md font-black text-[#111827] uppercase tracking-wider">AI Assistant</h2>
          </div>
          
          <button 
            type="button" 
            onClick={handleVoiceSimulation}
            disabled={loading || isListening}
            class={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black px-4 py-2 rounded-xl border transition-all ${isListening ? 'bg-rose-500 border-rose-500 text-white animate-bounce' : 'bg-slate-50 border-[#E5E7EB] hover:bg-slate-100 text-[#6B7280] shadow-sm'}`}
          >
            <Mic class="w-3.5 h-3.5" />
            <span>{isListening ? 'Listening...' : 'Simulate Voice'}</span>
          </button>
        </div>

        <SearchPromptBox 
          placeholder={isListening ? promptBoxPlaceholder : "I want to cook Paneer Butter Masala for 4 friends..."}
          onSearch={handleSearchSubmit}
          loading={loading || isListening}
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div class="bg-white border border-[#E5E7EB] p-12 rounded-3xl shadow-soft text-center space-y-4">
          <div class="relative w-14 h-14 mx-auto">
            <div class="absolute inset-0 border-4 border-[#22C55E]/10 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
            <Sparkles class="w-5 h-5 text-[#22C55E] absolute inset-0 m-auto animate-pulse" />
          </div>
          <div>
            <h3 class="font-extrabold text-[#111827] text-sm">AI Assistant is compiling list...</h3>
            <p class="text-xs text-[#6B7280] font-semibold mt-1">Analyzing proportions, matching catalog items, and checking stocks.</p>
          </div>
        </div>
      )}

      {/* AI Processed Output Results */}
      {activeResult && !loading && (
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Intent-Specific Checklist */}
          <div class="lg:col-span-5 bg-white border border-[#E5E7EB] p-6 rounded-3xl shadow-soft flex flex-col justify-between min-h-[500px]">
            <div class="space-y-6">
              
              {/* Intent Header */}
              <div class="flex justify-between items-start border-b border-[#E5E7EB] pb-4">
                <div class="space-y-1">
                  <span class={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border block max-w-fit bg-slate-500/10 text-slate-600 border-slate-500/20`}>
                    {activeResult.intent || 'Intent Detected'}
                  </span>
                  
                  {activeResult.intent === 'Health & Medical Needs' ? (
                    <h3 class="text-lg font-black text-rose-600 capitalize leading-snug">
                      Health Symptoms: {activeResult.entities?.healthSymptoms?.join(', ') || 'General Needs'}
                    </h3>
                  ) : activeResult.intent === 'Recipe Based Shopping' ? (
                    <h3 class="text-lg font-black text-[#111827] capitalize leading-snug">
                      {activeResult.entities?.recipeName || 'Recipe Items'}
                    </h3>
                  ) : (
                    <h3 class="text-lg font-black text-[#111827] capitalize leading-snug">
                      Shopping List
                    </h3>
                  )}
                </div>
                
                <div class="flex flex-col gap-1 items-end shrink-0">
                  {activeResult.entities?.servingCount && (
                    <span class="text-[9px] text-[#6B7280] bg-slate-50 border px-2 py-0.5 rounded-md font-bold">
                      Serves {activeResult.entities.servingCount}
                    </span>
                  )}
                  {activeResult.entities?.familySize && (
                    <span class="text-[9px] text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md font-bold">
                      Family size: {activeResult.entities.familySize}
                    </span>
                  )}
                  {activeResult.entities?.duration && (
                    <span class="text-[9px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-bold">
                      Duration: {activeResult.entities.duration}
                    </span>
                  )}
                </div>
              </div>

              {/* Clarification or Messages */}
              {activeResult.clarificationNeeded && (
                <div class="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-3.5 rounded-xl font-semibold flex gap-2">
                  <Info class="w-4.5 h-4.5 text-amber-600 shrink-0" />
                  <div>
                    <span class="block text-xs font-extrabold uppercase text-amber-950 mb-0.5">Clarification Needed</span>
                    <span>{activeResult.clarificationQuestion}</span>
                  </div>
                </div>
              )}

              {activeResult.message && !activeResult.clarificationNeeded && (
                <div class="bg-slate-50 border border-[#E5E7EB] text-[#6B7280] text-[11px] p-3.5 rounded-xl font-semibold flex gap-2">
                  <Sparkles class="w-4.5 h-4.5 text-[#22C55E] shrink-0" />
                  <span>{activeResult.message}</span>
                </div>
              )}

              {activeResult.medicalDisclaimer && (
                <div class="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] p-3.5 rounded-xl font-semibold flex gap-2">
                  <Info class="w-4.5 h-4.5 text-rose-600 shrink-0" />
                  <div>
                    <span class="block text-xs font-extrabold uppercase text-rose-950 mb-0.5">Medical Disclaimer</span>
                    <span>{activeResult.medicalDisclaimer}</span>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div class="space-y-3">
                <div class="flex justify-between items-center pl-0.5 pr-1 border-b border-[#E5E7EB] pb-2">
                  <span class="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">
                    {activeResult.intent === 'Recipe Based Shopping' ? 'Ingredients List' : 'Suggested Products'}
                  </span>
                  <span class="text-[9px] font-bold text-[#6B7280]">
                    {Object.values(checkedItems).filter(Boolean).length} of {activeResult.ingredients?.length || 0} items selected
                  </span>
                </div>
                <div class="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {(activeResult.ingredients || []).map((ing, idx) => {
                    const isChecked = !!checkedItems[ing.ingredientName];
                    return (
                      <div 
                        key={idx}
                        onClick={() => toggleCheck(ing.ingredientName)}
                        class={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${isChecked ? 'bg-[#22C55E]/5 border-[#22C55E]' : 'bg-slate-50 border-[#E5E7EB] text-[#6B7280]'}`}
                      >
                        <div class="flex items-center gap-3">
                          <div class={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isChecked ? 'bg-[#22C55E] border-[#22C55E] text-white' : 'border-[#E5E7EB] bg-white'}`}>
                            {isChecked && <Check class="w-3.5 h-3.5 stroke-[4]" />}
                          </div>
                          <span class={`text-xs font-bold capitalize ${isChecked ? 'text-[#111827]' : 'line-through opacity-60'}`}>
                            {ing.ingredientName}
                          </span>
                        </div>
                        <span class="text-[10px] font-extrabold bg-white border border-[#E5E7EB] px-2 py-0.5 rounded text-[#111827]">
                          {ing.requiredQuantity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div class="pt-4 border-t border-[#E5E7EB] space-y-4">
              <div class="flex justify-between items-center text-xs font-bold text-[#6B7280] pl-0.5">
                <button onClick={handleSelectAll} class="hover:text-[#111827] transition-colors underline decoration-[#E5E7EB] underline-offset-4">
                  Select All
                </button>
                <div class="flex gap-2 items-center">
                  <span>Selected Items Cost:</span>
                  <span class="text-sm font-black text-[#111827]">₹{calculateTotalCost()}</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleAddAllToCart}
                  class="bg-white border border-[#E5E7EB] hover:bg-slate-50 text-[#111827] font-extrabold py-3.5 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus class="w-4 h-4 text-[#6B7280]" /> 
                  {activeResult.intent === 'Recipe Based Shopping' ? 'Add All To Cart' : 'Add to Cart'}
                </button>
                <button 
                  onClick={() => navigate('/cart')}
                  class="bg-[#111827] hover:bg-black text-white font-extrabold py-3.5 rounded-xl transition-all shadow-sm shadow-black/20 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart class="w-4 h-4" /> View Cart
                </button>
              </div>
              
              {activeResult.intent === 'Health & Medical Needs' && (
                <button 
                  class="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold py-3.5 rounded-xl transition-all border border-rose-100 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Plus class="w-4 h-4" /> Connect Nearby Pharmacy
                </button>
              )}
            </div>
          </div>

          {/* Right: Matched Store Catalog Cards */}
          <div class="lg:col-span-7 space-y-4">
            <div class="flex justify-between items-center pl-1 border-b border-[#E5E7EB] pb-2">
              <span class="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider">Store Catalog Matches</span>
              <span class="text-[9px] text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded font-black uppercase">Instant Dispatch ready</span>
            </div>

            <div class="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {(activeResult.ingredients || []).map((ing, idx) => {
                const isChecked = !!checkedItems[ing.ingredientName];
                const product = selectedItems[ing.ingredientName];
                
                if (!product) {
                  return (
                    <div key={idx} class="bg-white border p-4.5 rounded-xl flex items-center justify-between opacity-50 text-xs font-bold text-[#6B7280]">
                      <span>No matching products in catalog for "{ing.ingredientName}"</span>
                      <Info class="w-4 h-4 text-[#6B7280]" />
                    </div>
                  );
                }

                const qty = quantities[ing.ingredientName] || 1;
                const discountedPrice = Math.round(product.price * (1 - (product.discount || 0) / 100));

                return (
                  <div 
                    key={idx}
                    class={`bg-white border p-4.5 rounded-2xl shadow-soft transition-all duration-200 ${isChecked ? 'border-[#22C55E] opacity-100' : 'opacity-40 hover:opacity-60 border-[#E5E7EB]'}`}
                  >
                    <div class="flex gap-4">
                      <img 
                        src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'} 
                        alt={product.name}
                        class="w-14 h-14 object-cover rounded-xl border bg-slate-50 shrink-0"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'; }}
                      />
                      
                      <div class="flex-grow space-y-2">
                        <div class="flex justify-between items-start gap-2">
                          <div class="text-xs">
                            <span class="text-[9px] font-extrabold text-[#6B7280] uppercase tracking-wider block">{product.brand} • {product.unit}</span>
                            <h4 class="font-extrabold text-[#111827] leading-tight">{product.name}</h4>
                          </div>
                          <div class="text-right text-xs">
                            <span class="font-black text-[#22C55E]">₹{discountedPrice * qty}</span>
                            {product.discount > 0 && (
                              <span class="text-[9px] text-[#6B7280] line-through block">₹{product.price * qty}</span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Scale Controls */}
                        <div class="flex items-center justify-between border-t pt-2 mt-1 text-[10px] font-extrabold text-[#6B7280]">
                          <span>Quantity</span>
                          <div class="flex items-center bg-slate-50 border rounded-lg p-0.5 gap-2">
                            <button type="button" onClick={() => adjustQty(ing.ingredientName, -1)} class="p-0.5 text-[#6B7280] hover:text-[#111827]"><Minus class="w-3 h-3" /></button>
                            <span class="text-[#111827] px-1 font-black">{qty}</span>
                            <button type="button" onClick={() => adjustQty(ing.ingredientName, 1)} class="p-0.5 text-[#6B7280] hover:text-[#111827]"><Plus class="w-3 h-3" /></button>
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

      {/* Audit History Logs */}
      {!activeResult && !loading && history.length > 0 && (
        <div class="space-y-4">
          <div class="flex items-center gap-1.5 pl-0.5">
            <ShoppingBag class="w-4.5 h-4.5 text-[#6B7280]" />
            <h3 class="font-extrabold text-[#111827] text-md">Your AI prompt history</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((log, idx) => (
              <div key={idx} class="bg-white border p-4.5 rounded-2xl shadow-soft text-xs text-[#6B7280] space-y-2">
                <div class="flex justify-between items-center text-[10px] font-semibold">
                  <span class="flex items-center gap-1"><Calendar class="w-3.5 h-3.5" /> {new Date(log.createdAt).toLocaleDateString()}</span>
                  <span class={`font-bold uppercase text-[9px] px-2 py-0.5 rounded border ${getCategoryStyle(log.aiResponse?.intent || log.aiResponse?.category)}`}>
                    {log.aiResponse?.intent || log.aiResponse?.category || 'Groceries'}
                  </span>
                </div>
                <p 
                  onClick={() => handleSearchSubmit(log.prompt)}
                  class="font-extrabold text-[#111827] hover:text-[#22C55E] cursor-pointer transition-colors leading-relaxed line-clamp-2 italic"
                >
                  "{log.prompt}"
                </p>
                <div class="flex flex-wrap gap-1 pt-1.5">
                  {log.aiResponse?.ingredients?.slice(0, 3).map((i, iIdx) => (
                    <span key={iIdx} class="bg-slate-50 border text-[9px] font-bold px-2 py-0.5 rounded text-[#6B7280] capitalize">
                      {i.ingredientName || i.product}
                    </span>
                  ))}
                  {log.aiResponse?.ingredients?.length > 3 && (
                    <span class="text-[9px] font-bold text-[#6B7280] self-center pl-1">+{log.aiResponse.ingredients.length - 3} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
