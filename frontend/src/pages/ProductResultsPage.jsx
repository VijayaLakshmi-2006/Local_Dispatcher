import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProducts, 
  setCategoryFilter, 
  setSearchFilter, 
  setSortingFilter,
  clearProductFilters
} from '../store/productSlice.js';
import { useCart } from '../hooks/useCart.js';
import ProductCard from '../components/ProductCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductResultsPage() {
  const dispatch = useDispatch();
  const { products, loading, filters } = useSelector((state) => state.products);
  const { addToCart, updateQuantity, removeFromCart, items } = useCart();

  const categories = ['All', 'Groceries', 'Vegetables', 'Fruits', 'Dairy', 'Beverages', 'Snacks', 'Household', 'Pharmacy', 'Electronics', 'Fast Food'];

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters.category, filters.search]);

  // Apply sorting filters locally
  const getSortedProducts = () => {
    let list = [...products];
    if (filters.sortBy === 'price-asc') {
      return list.sort((a, b) => {
        const pA = a.price * (1 - (a.discount || 0)/100);
        const pB = b.price * (1 - (b.discount || 0)/100);
        return pA - pB;
      });
    }
    if (filters.sortBy === 'price-desc') {
      return list.sort((a, b) => {
        const pA = a.price * (1 - (a.discount || 0)/100);
        const pB = b.price * (1 - (b.discount || 0)/100);
        return pB - pA;
      });
    }
    return list; // default
  };

  const handleSearchChange = (e) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleCategorySelect = (cat) => {
    dispatch(setCategoryFilter(cat));
  };

  const handleSortChange = (e) => {
    dispatch(setSortingFilter(e.target.value));
  };

  const sortedProducts = getSortedProducts();

  return (
    <div class="grid grid-cols-1 md:grid-cols-12 gap-8 py-4">
      {/* Sidebar: Filters & Categories */}
      <div class="md:col-span-3 space-y-6">
        {/* Category List */}
        <div class="bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-soft space-y-4">
          <div class="flex items-center gap-1.5 pl-0.5 border-b pb-2">
            <SlidersHorizontal class="w-4 h-4 text-[#22C55E]" />
            <h3 class="font-extrabold text-sm text-[#111827] uppercase tracking-wider">Categories</h3>
          </div>
          
          <div class="flex flex-col gap-1 text-xs font-extrabold text-[#6B7280]">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                class={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${filters.category === cat ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'hover:bg-slate-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Catalog Grid */}
      <div class="md:col-span-9 space-y-6">
        {/* Search and Sort bar */}
        <div class="bg-white border border-[#E5E7EB] p-4.5 rounded-2xl shadow-soft flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search bar input */}
          <div class="relative w-full sm:max-w-md bg-slate-50 border rounded-xl flex items-center focus-within:border-[#22C55E]/40 focus-within:bg-white transition-all">
            <Search class="absolute left-3 w-4.5 h-4.5 text-[#6B7280]" />
            <input 
              type="text"
              placeholder="Search products in store..."
              value={filters.search}
              onChange={handleSearchChange}
              class="w-full pl-9 pr-4 py-2.5 bg-transparent text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* Sorting controls */}
          <div class="flex items-center gap-2 text-xs font-extrabold text-[#6B7280] w-full sm:w-auto shrink-0 justify-end">
            <ArrowUpDown class="w-4 h-4 text-[#6B7280]" />
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              class="bg-white border rounded-xl p-2.5 focus:border-[#22C55E] focus:outline-none"
            >
              <option value="default">Default Sort</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Catalog Grid content */}
        {loading ? (
          <LoadingSpinner message="Searching catalog..." />
        ) : sortedProducts.length === 0 ? (
          <EmptyState 
            type="search"
            title="No products found"
            message="We couldn't find any products matching your active search filters. Try switching categories or checking your spelling."
            actionText="Clear Filters"
            onAction={() => dispatch(clearProductFilters())}
          />
        ) : (
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedProducts.map((prod) => {
              const inCartItem = items.find(i => i.product?._id === prod._id);
              const count = inCartItem ? inCartItem.quantity : 0;

              return (
                <ProductCard 
                  key={prod._id}
                  product={prod}
                  quantityInCart={count}
                  onAdd={addToCart}
                  onUpdate={updateQuantity}
                  onRemove={removeFromCart}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
