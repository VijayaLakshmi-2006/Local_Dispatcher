import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Plus, BarChart3, Package, Users, Activity, CheckCircle, RefreshCw, Sparkles, PlusCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, products, orders, ai-logs
  const [stats, setStats] = useState({
    revenue: 0,
    activeOrders: 0,
    totalProducts: 0,
    totalAgents: 0
  });

  // Data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);
  
  // Products form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategory, setProdCategory] = useState('Groceries');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscount, setProdDiscount] = useState('0');
  const [prodStock, setProdStock] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodUnit, setProdUnit] = useState('1 Kg');
  const [prodImage, setProdImage] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [prodRes, orderRes, agentRes, aiRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/orders'),
          axios.get('/api/dispatch/agents'),
          axios.get('/api/ai/history') // History fetches current user history, in a real admin dashboard we would query all search logs
        ]);

        if (prodRes.data.success) {
          setProducts(prodRes.data.products);
        }
        if (orderRes.data.success) {
          setOrders(orderRes.data.orders);
        }
        if (agentRes.data.success) {
          setAgents(agentRes.data.agents);
        }
        if (aiRes.data.success) {
          setAiLogs(aiRes.data.history);
        }

        // Calculate stats
        const allOrders = orderRes.data.orders || [];
        const completedOrders = allOrders.filter(o => o.orderStatus === 'Delivered');
        const active = allOrders.filter(o => !['Delivered', 'Cancelled'].includes(o.orderStatus));
        const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);

        setStats({
          revenue: Math.round(totalRevenue),
          activeOrders: active.length,
          totalProducts: prodRes.data.products?.length || 0,
          totalAgents: agentRes.data.agents?.length || 0
        });

      } catch (err) {
        console.error(err);
        setError('Failed to load system dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [refreshTrigger]);

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const payload = {
        name: prodName,
        description: prodDesc,
        category: prodCategory,
        price: Number(prodPrice),
        discount: Number(prodDiscount),
        stock: Number(prodStock),
        brand: prodBrand,
        unit: prodUnit,
        image: prodImage
      };

      let res;
      if (editingProductId) {
        res = await axios.put(`/api/products/${editingProductId}`, payload);
      } else {
        res = await axios.post('/api/products', payload);
      }

      if (res.data.success) {
        setMessage(editingProductId ? 'Product updated successfully!' : 'Product added to catalog successfully!');
        setRefreshTrigger(prev => prev + 1);
        setShowProductForm(false);
        setEditingProductId(null);
        // Clear Form
        setProdName('');
        setProdDesc('');
        setProdPrice('');
        setProdDiscount('0');
        setProdStock('');
        setProdBrand('');
        setProdUnit('1 Kg');
        setProdImage('');
      }
    } catch (err) {
      console.error(err);
      setError(editingProductId ? 'Failed to update product' : 'Failed to create new product');
    }
  };

  const handleEditClick = (prod) => {
    setEditingProductId(prod._id);
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdCategory(prod.category);
    setProdPrice(prod.price);
    setProdDiscount(prod.discount);
    setProdStock(prod.stock);
    setProdBrand(prod.brand);
    setProdUnit(prod.unit);
    setProdImage(prod.image);
    setShowProductForm(true);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setError('');
    setMessage('');
    try {
      const res = await axios.delete(`/api/products/${id}`);
      if (res.data.success) {
        setMessage('Product deleted successfully');
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete product');
    }
  };

  const handleForceAssign = async (orderId) => {
    setError('');
    setMessage('');
    try {
      const res = await axios.post('/api/dispatch/assign', { orderId });
      if (res.data.success) {
        setMessage('Triggered auto-dispatcher allocation algorithm successfully.');
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Agent allocation algorithm failed.');
    }
  };

  if (loading && refreshTrigger === 0) {
    return (
      <div class="flex justify-center items-center py-20 bg-[#0b0f19]">
        <div class="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div class="space-y-8 max-w-6xl mx-auto">
      {/* Top title */}
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <ShieldAlert class="w-6 h-6 text-rose-500" />
          <h2 class="text-3xl font-extrabold text-white">System Admin Control</h2>
        </div>
        <button 
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          class="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-2 rounded-xl hover:bg-indigo-500/25 transition-all"
        >
          <RefreshCw class="w-3.5 h-3.5" /> Refresh Dashboard
        </button>
      </div>

      {/* Messages */}
      {error && <div class="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">{error}</div>}
      {message && <div class="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold">{message}</div>}

      {/* Statistics Cards */}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-panel p-5 rounded-2xl border border-white/5 space-y-1.5">
          <div class="flex items-center justify-between text-gray-500">
            <span class="text-xs font-extrabold uppercase">Total Revenue</span>
            <BarChart3 class="w-4 h-4 text-indigo-400" />
          </div>
          <p class="text-2xl font-black text-white">₹{stats.revenue}</p>
          <span class="text-[10px] text-emerald-400 font-bold block">Simulated settlements</span>
        </div>

        <div class="glass-panel p-5 rounded-2xl border border-white/5 space-y-1.5">
          <div class="flex items-center justify-between text-gray-500">
            <span class="text-xs font-extrabold uppercase">Active Orders</span>
            <Activity class="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <p class="text-2xl font-black text-white">{stats.activeOrders}</p>
          <span class="text-[10px] text-gray-500 block">Pending dispatch transit</span>
        </div>

        <div class="glass-panel p-5 rounded-2xl border border-white/5 space-y-1.5">
          <div class="flex items-center justify-between text-gray-500">
            <span class="text-xs font-extrabold uppercase">Catalog Products</span>
            <Package class="w-4 h-4 text-emerald-400" />
          </div>
          <p class="text-2xl font-black text-white">{stats.totalProducts}</p>
          <span class="text-[10px] text-gray-500 block">Across 7 categories</span>
        </div>

        <div class="glass-panel p-5 rounded-2xl border border-white/5 space-y-1.5">
          <div class="flex items-center justify-between text-gray-500">
            <span class="text-xs font-extrabold uppercase">Total Riders</span>
            <Users class="w-4 h-4 text-indigo-400" />
          </div>
          <p class="text-2xl font-black text-white">{stats.totalAgents}</p>
          <span class="text-[10px] text-indigo-400 font-semibold block">
            {agents.filter(a=>a.isAvailable).length} active available
          </span>
        </div>
      </div>

      {/* Tabs list */}
      <div class="flex border-b border-white/10 gap-2 overflow-x-auto pb-0.5">
        {[
          { id: 'analytics', label: 'Dispatcher Hub', icon: Activity },
          { id: 'products', label: 'Catalog Stock', icon: Package },
          { id: 'orders', label: 'Order Register', icon: CheckCircle },
          { id: 'ai-logs', label: 'AI Search Logs', icon: Sparkles }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            class={`flex items-center gap-1.5 pb-3 px-4 font-bold text-xs whitespace-nowrap transition-all border-b-2 ${activeTab === t.id ? 'text-indigo-400 border-indigo-500 font-black' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            <t.icon class="w-4 h-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {/* 1. DISPATCHER HUB */}
      {activeTab === 'analytics' && (
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Active Agents list */}
          <div class="md:col-span-6 glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 class="font-extrabold text-white text-md">Live Delivery Agents status</h3>
            <div class="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {agents.map((agent, idx) => (
                <div key={idx} class="p-3.5 rounded-xl bg-slate-950/20 border border-white/5 flex justify-between items-center text-xs">
                  <div>
                    <h4 class="font-bold text-white">{agent.name}</h4>
                    <span class="text-[10px] text-gray-500 font-bold block">{agent.phone}</span>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    <div class="text-right">
                      <span class={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${agent.isAvailable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {agent.isAvailable ? 'Available' : 'Busy'}
                      </span>
                      <span class="block text-[9px] text-gray-500 mt-1 font-mono">
                        [{agent.currentLocation.lat.toFixed(4)}, {agent.currentLocation.lng.toFixed(4)}]
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending allocation list */}
          <div class="md:col-span-6 glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 class="font-extrabold text-white text-md">Orders Dispatch Log</h3>
            <div class="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {orders.filter(o => !['Delivered', 'Cancelled'].includes(o.orderStatus)).map((order, idx) => (
                <div key={idx} class="p-3.5 rounded-xl bg-slate-950/20 border border-white/5 space-y-2 text-xs">
                  <div class="flex justify-between items-start">
                    <div>
                      <span class="font-mono text-[10px] text-gray-500 font-bold block">Order ID: #{order._id.slice(-8)}</span>
                      <span class="font-black text-white text-xs">₹{order.totalPrice} • {order.products.length} items</span>
                    </div>
                    <span class="text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 px-2 py-0.5 rounded">
                      {order.orderStatus}
                    </span>
                  </div>

                  <div class="flex items-center justify-between border-t border-white/5 pt-2">
                    <span class="text-[10px] text-gray-400">
                      Rider: {order.deliveryAgent ? order.deliveryAgent.name : <span class="text-rose-400 font-extrabold animate-pulse">Unassigned</span>}
                    </span>
                    
                    {!order.deliveryAgent && (
                      <button
                        onClick={() => handleForceAssign(order._id)}
                        class="text-[10px] font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded"
                      >
                        Auto-Allocate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. CATALOG STOCK */}
      {activeTab === 'products' && (
        <div class="space-y-6">
          <div class="flex justify-between items-center pl-1">
            <h3 class="font-extrabold text-white text-md">Product Inventory ({products.length})</h3>
            <button
              onClick={() => {
                setShowProductForm(!showProductForm);
                if (!showProductForm) {
                  setEditingProductId(null);
                  setProdName('');
                  setProdDesc('');
                  setProdPrice('');
                  setProdDiscount('0');
                  setProdStock('');
                  setProdBrand('');
                  setProdUnit('1 Kg');
                  setProdImage('');
                }
              }}
              class="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-1 shadow-lg shadow-indigo-600/10"
            >
              <PlusCircle class="w-4 h-4" /> {showProductForm && !editingProductId ? 'Close Form' : 'Add Product'}
            </button>
          </div>

          {/* New Product Form */}
          {showProductForm && (
            <form onSubmit={handleSubmitProduct} class="glass-panel p-6 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase">Product Name</label>
                <input 
                  type="text" required placeholder="Basmati Rice Premium" 
                  value={prodName} onChange={e => setProdName(e.target.value)}
                  class="w-full glass-input text-xs rounded-lg p-2.5"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                <input 
                  type="text" required placeholder="Aged long grains for biryani" 
                  value={prodDesc} onChange={e => setProdDesc(e.target.value)}
                  class="w-full glass-input text-xs rounded-lg p-2.5"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                <select 
                  value={prodCategory} onChange={e => setProdCategory(e.target.value)}
                  class="w-full glass-input text-xs rounded-lg p-2.5 appearance-none bg-slate-900"
                >
                  {['Groceries', 'Vegetables', 'Fruits', 'Dairy', 'Beverages', 'Snacks', 'Household'].map(cat => (
                    <option key={cat} value={cat} class="bg-slate-900">{cat}</option>
                  ))}
                </select>
              </div>

              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase">Price (₹)</label>
                <input 
                  type="number" required placeholder="120" min="0"
                  value={prodPrice} onChange={e => setProdPrice(e.target.value)}
                  class="w-full glass-input text-xs rounded-lg p-2.5"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase">Discount (%)</label>
                <input 
                  type="number" required placeholder="10" min="0" max="100"
                  value={prodDiscount} onChange={e => setProdDiscount(e.target.value)}
                  class="w-full glass-input text-xs rounded-lg p-2.5"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase">Stock Count</label>
                <input 
                  type="number" required placeholder="50" min="0"
                  value={prodStock} onChange={e => setProdStock(e.target.value)}
                  class="w-full glass-input text-xs rounded-lg p-2.5"
                />
              </div>

              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase">Brand</label>
                <input 
                  type="text" required placeholder="Fortune" 
                  value={prodBrand} onChange={e => setProdBrand(e.target.value)}
                  class="w-full glass-input text-xs rounded-lg p-2.5"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase">Unit Label</label>
                <input 
                  type="text" required placeholder="1 Kg or 500 g" 
                  value={prodUnit} onChange={e => setProdUnit(e.target.value)}
                  class="w-full glass-input text-xs rounded-lg p-2.5"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase">Image URL (Optional)</label>
                <input 
                  type="text" placeholder="https://unsplash.com/..." 
                  value={prodImage} onChange={e => setProdImage(e.target.value)}
                  class="w-full glass-input text-xs rounded-lg p-2.5"
                />
              </div>

              <div class="col-span-1 md:col-span-3 flex justify-end gap-2 pt-2">
                <button
                  type="button" onClick={() => setShowProductForm(false)}
                  class="text-xs font-bold text-gray-400 hover:text-white px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg"
                >
                  {editingProductId ? 'Update Item' : 'Register Item'}
                </button>
              </div>
            </form>
          )}

          {/* Catalog grid */}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((prod, idx) => (
              <div key={idx} class="glass-panel p-4 rounded-2xl flex gap-3 items-center border border-white/5">
                <img 
                  src={prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80'} 
                  alt={prod.name} 
                  class="w-12 h-12 rounded-lg object-cover bg-slate-900"
                />
                <div class="flex-grow text-xs min-w-0">
                  <span class="text-[9px] text-indigo-400 font-bold block">{prod.brand} • {prod.category}</span>
                  <h4 class="font-bold text-white line-clamp-1">{prod.name}</h4>
                  <div class="flex justify-between items-center mt-1 text-gray-400 font-medium">
                    <span>Stock: <span class={`font-black ${prod.stock < 10 ? 'text-rose-400' : 'text-emerald-400'}`}>{prod.stock}</span></span>
                    <span class="font-extrabold text-indigo-300">₹{prod.price}</span>
                  </div>
                  <div class="flex justify-end gap-2 mt-2">
                    <button onClick={() => handleEditClick(prod)} class="text-[10px] bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-md hover:bg-indigo-600/40 transition-colors font-bold">Edit</button>
                    <button onClick={() => handleDeleteProduct(prod._id)} class="text-[10px] bg-rose-600/20 text-rose-400 px-3 py-1 rounded-md hover:bg-rose-600/40 transition-colors font-bold">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ORDER REGISTER */}
      {activeTab === 'orders' && (
        <div class="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <h3 class="font-extrabold text-white text-md">System Orders Register</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left border-collapse">
              <thead>
                <tr class="border-b border-white/10 text-gray-400 font-extrabold">
                  <th class="pb-3 pr-2">Order ID</th>
                  <th class="pb-3 px-2">Customer</th>
                  <th class="pb-3 px-2 text-right">Amount</th>
                  <th class="pb-3 px-2">Status</th>
                  <th class="pb-3 px-2">Rider</th>
                  <th class="pb-3 px-2">Payment</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                {orders.map((ord, idx) => (
                  <tr key={idx} class="text-gray-300 hover:text-white transition-colors">
                    <td class="py-3.5 pr-2 font-mono">#{ord._id.slice(-8)}</td>
                    <td class="py-3.5 px-2 font-bold">{ord.user?.name || 'Customer'}</td>
                    <td class="py-3.5 px-2 text-right font-black text-indigo-300">₹{ord.totalPrice}</td>
                    <td class="py-3.5 px-2">
                      <span class={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${ord.orderStatus === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' : ord.orderStatus === 'Cancelled' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td class="py-3.5 px-2 text-gray-400">{ord.deliveryAgent?.name || 'Unassigned'}</td>
                    <td class="py-3.5 px-2">
                      <span class={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${ord.paymentStatus === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-gray-500'}`}>
                        {ord.paymentStatus} ({ord.paymentMethod})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. AI SEARCH AUDIT LOGS */}
      {activeTab === 'ai-logs' && (
        <div class="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div class="flex items-center gap-1">
            <Sparkles class="w-4 h-4 text-indigo-400 animate-pulse" />
            <h3 class="font-extrabold text-white text-md">AI Shopping Prompt Audit Logs</h3>
          </div>

          <div class="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {aiLogs.length === 0 ? (
              <p class="text-xs text-gray-500 py-6 text-center">No AI prompt logs stored in database yet.</p>
            ) : (
              aiLogs.map((log, idx) => (
                <div key={idx} class="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-3 text-xs leading-relaxed">
                  <div class="flex justify-between items-center text-gray-500 text-[10px]">
                    <span class="font-extrabold">Logged query</span>
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>

                  <p class="font-semibold text-indigo-300 italic pl-3 border-l-2 border-indigo-500">
                    "{log.prompt}"
                  </p>

                  <div class="pt-2 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div>
                      <span class="text-[9px] font-bold text-gray-500 uppercase">Intent / Dish Identified</span>
                      <p class="font-bold text-white text-xs">{log.aiResponse?.intent || log.aiResponse?.dish || 'Generic'}</p>
                    </div>
                    <div>
                      <span class="text-[9px] font-bold text-gray-500 uppercase">Entity Data</span>
                      <p class="font-bold text-white text-xs">
                        {log.aiResponse?.entities?.servingCount ? `Serves ${log.aiResponse.entities.servingCount}` : ''}
                        {log.aiResponse?.entities?.familySize ? `Family size ${log.aiResponse.entities.familySize}` : ''}
                        {log.aiResponse?.people ? `${log.aiResponse.people} people` : ''}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span class="text-[9px] font-bold text-gray-500 uppercase block mb-1">Extracted Ingredients / Products</span>
                    <div class="flex flex-wrap gap-1.5">
                      {log.aiResponse?.ingredients?.map((ing, iIdx) => (
                        <span key={iIdx} class="text-[10px] bg-white/5 border border-white/5 text-gray-300 px-2 py-0.5 rounded">
                          {ing.ingredientName || ing.productName || ing.product} ({ing.requiredQuantity || ing.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
