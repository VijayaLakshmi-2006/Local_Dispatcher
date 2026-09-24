import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useCart } from '../hooks/useCart.js';
import api from '../services/api.js';
import productService from '../services/productService.js';
import orderService from '../services/orderService.js';
import aiService from '../services/aiService.js';

// Sub-components
import StatusBadge from '../components/StatusBadge.jsx';
import ProductCard from '../components/ProductCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

// Icons
import { 
  Sparkles, ShoppingBag, ShoppingCart, ShieldAlert, Truck, 
  MapPin, Phone, CheckSquare, PlusCircle, BarChart3, 
  Users, Activity, CheckCircle, RefreshCw, Power, Star, ChevronRight,
  Package, UserCheck, XCircle, Compass, DollarSign, Ban, Trash2, BrainCircuit
} from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const getCoordsFromAddress = (address) => {
  if (!address || !address.pincode) return { lat: 12.9780, lng: 77.6400 };
  const pinNum = parseInt(address.pincode) || 560001;
  const hash = (pinNum % 100) + (address.street ? address.street.length : 0);
  const latOffset = ((hash * 17) % 100 - 50) / 2500;
  const lngOffset = ((hash * 31) % 100 - 50) / 2500;
  return {
    lat: 12.9724 + latOffset,
    lng: 77.5951 + lngOffset
  };
};

/* ============================================================================
   CUSTOMER SUB-DASHBOARD
   ============================================================================ */
function CustomerDashboard() {
  const { user } = useAuth();
  const { addToCart, updateQuantity, removeFromCart, items } = useCart();
  const [stats, setStats] = useState({ total: 0, active: 0, delivered: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [ordersRes, prodRes] = await Promise.all([
          orderService.getOrders(),
          productService.getProducts()
        ]);

        if (ordersRes.success) {
          const list = ordersRes.orders || [];
          setRecentOrders(list.slice(0, 3));
          
          const total = list.length;
          const active = list.filter(o => !['Delivered', 'Cancelled'].includes(o.orderStatus)).length;
          const delivered = list.filter(o => o.orderStatus === 'Delivered').length;
          
          setStats({ total, active, delivered });
        }

        if (prodRes.success) {
          // Select 4 random recommended products
          const prods = prodRes.products || [];
          setRecommendations(prods.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

  return (
    <div class="space-y-10">
      {/* Welcome Message */}
      <div class="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-soft">
        <div class="space-y-1">
          <h2 class="text-2xl font-black text-[#111827]">Welcome back, {user?.name}! 👋</h2>
          <p class="text-xs text-[#6B7280] font-semibold">Ready to cook something delicious? Try our AI Smart Assistant.</p>
        </div>
        <button 
          onClick={() => navigate('/ai-search')}
          class="bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-extrabold px-5 py-3 rounded-xl transition-all shadow-sm shadow-[#22C55E]/10 uppercase tracking-wider flex items-center gap-2"
        >
          AI Smart Assistant <Sparkles class="w-4 h-4" />
        </button>
      </div>

      {/* Stats Cards */}
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white border border-[#E5E7EB] p-4.5 rounded-2xl shadow-soft">
          <span class="text-[9px] font-extrabold text-[#6B7280] uppercase tracking-wider block mb-1">Total Orders</span>
          <p class="text-2xl font-black text-[#111827]">{stats.total}</p>
        </div>
        <div class="bg-white border border-[#E5E7EB] p-4.5 rounded-2xl shadow-soft">
          <span class="text-[9px] font-extrabold text-[#6B7280] uppercase tracking-wider block mb-1">Active Deliveries</span>
          <p class="text-2xl font-black text-[#22C55E]">{stats.active}</p>
        </div>
        <div class="bg-white border border-[#E5E7EB] p-4.5 rounded-2xl shadow-soft">
          <span class="text-[9px] font-extrabold text-[#6B7280] uppercase tracking-wider block mb-1">Completed Rides</span>
          <p class="text-2xl font-black text-[#111827]">{stats.delivered}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Recent Orders */}
        <div class="md:col-span-6 space-y-4">
          <div class="flex justify-between items-center pl-1">
            <h3 class="font-extrabold text-[#111827] text-md">Recent Orders</h3>
            <Link to="/orders" class="text-xs font-bold text-[#22C55E] hover:underline flex items-center gap-0.5">
              View all <ChevronRight class="w-3.5 h-3.5" />
            </Link>
          </div>

          <div class="space-y-3">
            {recentOrders.length === 0 ? (
              <div class="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center text-xs text-[#6B7280] font-semibold shadow-soft">
                No orders placed yet.
              </div>
            ) : (
              recentOrders.map((order, idx) => (
                <div key={idx} class="bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-soft flex justify-between items-center text-xs">
                  <div class="space-y-1">
                    <p class="font-bold text-[#111827]">Order #{order._id.slice(-8)}</p>
                    <p class="text-[10px] text-[#6B7280] font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <span class="text-[10px] font-extrabold text-[#22C55E] block">₹{order.totalPrice}</span>
                  </div>
                  <div class="flex flex-col items-end gap-2">
                    <StatusBadge status={order.orderStatus} />
                    <Link to={`/tracking/${order._id}`} class="text-[10px] font-black text-[#22C55E] hover:underline uppercase tracking-wider">
                      Track Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick actions & Recommended Products */}
        <div class="md:col-span-6 space-y-4">
          <h3 class="font-extrabold text-[#111827] text-md pl-1">Popular Picks</h3>
          
          <div class="grid grid-cols-2 gap-4">
            {recommendations.map((prod) => {
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
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ADMIN SUB-DASHBOARD
   ============================================================================ */
function AdminDashboardView() {
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, users, agents, orders, products, ai-logs
  const [stats, setStats] = useState({ revenue: 0, activeOrders: 0, totalProducts: 0, totalAgents: 0 });
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    revenue: 0,
    deliveryCharges: 0,
    agentEarnings: 0
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [users, setUsers] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);
  
  // Product Creation
  const [showProductForm, setShowProductForm] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategory, setProdCategory] = useState('Groceries');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscount, setProdDiscount] = useState('0');
  const [prodStock, setProdStock] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodUnit, setProdUnit] = useState('1 Kg');
  const [prodImage, setProdImage] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [dispatchLogModal, setDispatchLogModal] = useState(null);
  const [dispatchLogData, setDispatchLogData] = useState(null);

  const handleViewDispatchLog = async (orderId) => {
    try {
      setDispatchLogModal(orderId);
      setDispatchLogData(null);
      const res = await orderService.getDispatchLog(orderId);
      if (res.success) {
        setDispatchLogData(res.log);
      }
    } catch (err) {
      toast.error('Failed to fetch dispatch log');
      setDispatchLogModal(null);
    }
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [prodRes, orderRes, agentRes, aiRes, usersRes, analyticsRes] = await Promise.all([
          productService.getProducts(),
          orderService.getOrders(),
          orderService.getAgents(),
          aiService.getHistory(),
          api.get('/api/admin/users'),
          api.get('/api/admin/analytics')
        ]);

        if (prodRes.success) setProducts(prodRes.products || []);
        if (orderRes.success) setOrders(orderRes.orders || []);
        if (agentRes.success) setAgents(agentRes.agents || []);
        if (aiRes.success) setAiLogs(aiRes.history || []);
        if (usersRes.data.success) setUsers(usersRes.data.users || []);
        if (analyticsRes.data.success) setAnalytics(analyticsRes.data.analytics);

        const list = orderRes.orders || [];
        const completed = list.filter(o => o.orderStatus === 'Delivered');
        const active = list.filter(o => !['Delivered', 'Cancelled'].includes(o.orderStatus));
        const totalRevenue = completed.reduce((sum, o) => sum + o.totalPrice, 0);

        setStats({
          revenue: Math.round(totalRevenue),
          activeOrders: active.length,
          totalProducts: prodRes.products?.length || 0,
          totalAgents: agentRes.agents?.length || 0
        });
      } catch (err) {
        console.error('Error loading admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [refreshTrigger]);

  const handleUpdateUserStatus = async (userId, status, isActive) => {
    try {
      const res = await api.put(`/api/admin/users/${userId}/status`, { status, isActive });
      if (res.data.success) {
        toast.success(`User status updated to ${status}`);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleUpdateAgentStatus = async (agentId, approvalStatus, isActive) => {
    try {
      const res = await api.put(`/api/admin/agents/${agentId}/status`, { approvalStatus, isActive });
      if (res.data.success) {
        toast.success(`Agent status updated to ${approvalStatus}`);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      toast.error('Failed to update agent status');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await productService.createProduct({
        name: prodName, description: prodDesc, category: prodCategory,
        price: Number(prodPrice), discount: Number(prodDiscount || 0),
        stock: Number(prodStock), brand: prodBrand, unit: prodUnit, image: prodImage
      });
      if (res.success) {
        toast.success('Product created successfully');
        setRefreshTrigger(prev => prev + 1);
        setShowProductForm(false);
        setProdName(''); setProdDesc(''); setProdPrice(''); setProdBrand(''); setProdImage('');
      }
    } catch (err) {
      toast.error('Failed to create product');
    }
  };

  const handleForceAssign = async (orderId) => {
    try {
      const res = await orderService.assignAgent({ orderId });
      if (res.success) {
        toast.success('Auto-allocation algorithm executed');
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Agent allocation failed');
    }
  };

  if (loading && refreshTrigger === 0) return <LoadingSpinner message="Loading Admin Panel..." />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between pl-1">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-[#EF4444]" />
          <h2 className="text-2xl font-black text-[#111827]">System Admin Control</h2>
        </div>
        <button 
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="flex items-center gap-1 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase hover:bg-[#22C55E]/20 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Refresh Console
        </button>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-soft">
          <span className="text-[9px] font-extrabold text-[#6B7280] uppercase tracking-wider block mb-1">Total Orders</span>
          <p className="text-2xl font-black text-[#111827]">{analytics.totalOrders}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-soft">
          <span className="text-[9px] font-extrabold text-[#6B7280] uppercase tracking-wider block mb-1">Active / Completed</span>
          <p className="text-2xl font-black text-[#22C55E]">{analytics.activeOrders} / {analytics.completedOrders}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-soft">
          <span className="text-[9px] font-extrabold text-[#6B7280] uppercase tracking-wider block mb-1">Total Revenue</span>
          <p className="text-2xl font-black text-[#111827]">₹{Math.round(analytics.revenue)}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-soft">
          <span className="text-[9px] font-extrabold text-[#6B7280] uppercase tracking-wider block mb-1">Rider Earnings / Deliv Charges</span>
          <p className="text-sm font-black text-[#111827]">₹{analytics.agentEarnings} / ₹{analytics.deliveryCharges}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB] gap-2 overflow-x-auto pb-0.5 font-extrabold text-xs">
        {[
          { id: 'analytics', label: 'Dispatcher Hub', icon: Activity },
          { id: 'users', label: 'Users Management', icon: Users },
          { id: 'agents', label: 'Riders Management', icon: Truck },
          { id: 'products', label: 'Inventory Catalog', icon: Package },
          { id: 'orders', label: 'Orders Register', icon: CheckCircle },
          { id: 'ai-logs', label: 'AI Search Logs', icon: Sparkles }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 pb-3 px-4 border-b-2 uppercase tracking-wider ${activeTab === t.id ? 'text-[#22C55E] border-[#22C55E]' : 'text-[#6B7280] border-transparent hover:text-[#111827]'}`}
          >
            <t.icon className="w-4 h-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Panels */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-6 bg-white border border-[#E5E7EB] p-6 rounded-3xl shadow-soft space-y-4">
            <h3 className="font-extrabold text-[#111827] text-md">Delivery Agents Status</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {agents.map((agent, idx) => (
                <div key={idx} className="p-3 border border-[#E5E7EB] rounded-xl bg-slate-50 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-[#111827]">{agent.name}</h4>
                    <span className="text-[10px] text-[#6B7280] font-semibold block">{agent.phone} • Status: {agent.approvalStatus.toUpperCase()}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${agent.isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {agent.isOnline ? 'Online' : 'Offline'}
                    </span>
                    {agent.currentLocation && (
                      <span className="block text-[9px] text-[#6B7280] font-mono mt-0.5">[{agent.currentLocation.lat.toFixed(4)}, {agent.currentLocation.lng.toFixed(4)}]</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-6 bg-white border border-[#E5E7EB] p-6 rounded-3xl shadow-soft space-y-4">
            <h3 className="font-extrabold text-[#111827] text-md">Live Orders Monitor</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {orders.filter(o => !['Delivered', 'Cancelled'].includes(o.orderStatus)).map((order, idx) => (
                <div key={idx} className="p-3 border border-[#E5E7EB] rounded-xl bg-slate-50 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-[#6B7280] block font-mono">#{order._id.slice(-8)}</span>
                      <span className="font-black text-[#111827]">₹{order.totalPrice} • {order.products.length} Items</span>
                      <span className="block text-[10px] text-[#6B7280]">Dist: {order.distance || 0} km • {order.store?.name || 'Local Store'}</span>
                      {order.priority && order.priority !== 'NORMAL' && (
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded mt-1 inline-block ${order.priority === 'EMERGENCY' ? 'bg-[#EF4444] text-white' : 'bg-amber-500 text-white'}`}>
                          {order.priority}
                        </span>
                      )}
                    </div>
                    <StatusBadge status={order.orderStatus} />
                  </div>
                  <div className="flex justify-between items-center border-t border-[#E5E7EB] pt-2">
                    <span className="text-[10px] text-[#6B7280]">Agent: {order.deliveryAgent ? order.deliveryAgent.name : <span className="text-[#EF4444] font-bold">Unassigned</span>}</span>
                    {!order.deliveryAgent && (
                      <button 
                        onClick={() => handleForceAssign(order._id)}
                        className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-[10px] font-extrabold px-3 py-1 rounded-md"
                      >
                        Auto-Assign
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white border border-[#E5E7EB] p-6 rounded-3xl shadow-soft space-y-4">
          <h3 className="font-extrabold text-[#111827] text-md">Users Management</h3>
          <div className="overflow-x-auto text-xs text-left border-collapse">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-extrabold uppercase text-[10px]">
                  <th className="pb-3 pr-2">Name</th>
                  <th className="pb-3 px-2">Email</th>
                  <th className="pb-3 px-2">Role</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 pl-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {users.map((u, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 pr-2 font-bold">{u.name}</td>
                    <td className="py-3 px-2 font-mono">{u.email}</td>
                    <td className="py-3 px-2 font-semibold text-[#6B7280]">{u.role.toUpperCase()}</td>
                    <td className="py-3 px-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : u.status === 'suspended' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 pl-2 text-right space-x-1">
                      {u.status !== 'active' && (
                        <button 
                          onClick={() => handleUpdateUserStatus(u._id, 'active', true)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-1 rounded"
                        >
                          Activate
                        </button>
                      )}
                      {u.status === 'active' && (
                        <>
                          <button 
                            onClick={() => handleUpdateUserStatus(u._id, 'suspended', true)}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-extrabold px-2 py-1 rounded"
                          >
                            Suspend
                          </button>
                          <button 
                            onClick={() => handleUpdateUserStatus(u._id, 'inactive', false)}
                            className="bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-extrabold px-2 py-1 rounded"
                          >
                            Deactivate
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="bg-white border border-[#E5E7EB] p-6 rounded-3xl shadow-soft space-y-6">
          <h3 className="font-extrabold text-[#111827] text-md">Delivery Agents Management</h3>
          
          {/* Pending Approval Section */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#EF4444] border-l-4 border-[#EF4444] pl-2">Pending Approval</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.filter(a => a.approvalStatus === 'pending').length === 0 ? (
                <p className="text-xs text-[#6B7280] italic">No agents pending approval.</p>
              ) : (
                agents.filter(a => a.approvalStatus === 'pending').map((a, idx) => (
                  <div key={idx} className="p-4 border border-[#E5E7EB] bg-slate-50 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-[#111827]">{a.name}</p>
                      <p className="text-mono text-[#6B7280]">{a.email}</p>
                      <p className="text-[10px] text-[#6B7280] font-semibold">Phone: {a.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateAgentStatus(a._id, 'approved', true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button 
                        onClick={() => handleUpdateAgentStatus(a._id, 'rejected', false)}
                        className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Approved Agents Section */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-bold text-sm text-[#22C55E] border-l-4 border-[#22C55E] pl-2">Approved Riders</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.filter(a => a.approvalStatus === 'approved').length === 0 ? (
                <p className="text-xs text-[#6B7280] italic">No approved agents.</p>
              ) : (
                agents.filter(a => a.approvalStatus === 'approved').map((a, idx) => (
                  <div key={idx} className="p-4 border border-[#E5E7EB] bg-slate-50 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-[#111827]">{a.name}</p>
                      <p className="text-mono text-[#6B7280]">{a.email}</p>
                      <p className="text-[10px] text-[#6B7280] font-semibold">Phone: {a.phone} • Rating: ★ {a.rating}</p>
                      <p className="text-[10px] text-[#22C55E] font-extrabold mt-1">Earnings: ₹{a.earnings || 0} • Completed: {a.completedDeliveries || 0}</p>
                    </div>
                    <div>
                      <button 
                        onClick={() => handleUpdateAgentStatus(a._id, 'rejected', false)}
                        className="bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-rose-200"
                      >
                        <Ban className="w-3.5 h-3.5" /> Reject / Ban
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rejected Agents Section */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-bold text-sm text-[#EF4444] border-l-4 border-[#EF4444] pl-2">Rejected Riders</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.filter(a => a.approvalStatus === 'rejected').length === 0 ? (
                <p className="text-xs text-[#6B7280] italic">No rejected agents.</p>
              ) : (
                agents.filter(a => a.approvalStatus === 'rejected').map((a, idx) => (
                  <div key={idx} className="p-4 border border-[#E5E7EB] bg-slate-50 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-[#111827]">{a.name}</p>
                      <p className="text-mono text-[#6B7280]">{a.email}</p>
                    </div>
                    <div>
                      <button 
                        onClick={() => handleUpdateAgentStatus(a._id, 'approved', true)}
                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-emerald-200"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Approve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pl-1">
            <h3 className="font-extrabold text-[#111827] text-md">Stock Inventory ({products.length})</h3>
            <button 
              onClick={() => setShowProductForm(!showProductForm)}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1"
            >
              <PlusCircle className="w-4 h-4" /> Add Item
            </button>
          </div>

          {showProductForm && (
            <form onSubmit={handleCreateProduct} className="bg-white border border-[#E5E7EB] p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">Product Name</label>
                <input 
                  type="text" required placeholder="Fortune Soya Oil" 
                  value={prodName} onChange={e => setProdName(e.target.value)}
                  className="w-full border border-[#E5E7EB] text-xs font-semibold rounded-lg p-2.5"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">Description</label>
                <input 
                  type="text" required placeholder="Healthy refined soyabean oil" 
                  value={prodDesc} onChange={e => setProdDesc(e.target.value)}
                  className="w-full border border-[#E5E7EB] text-xs font-semibold rounded-lg p-2.5"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">Category</label>
                <select 
                  value={prodCategory} onChange={e => setProdCategory(e.target.value)}
                  className="w-full border border-[#E5E7EB] text-xs font-semibold rounded-lg p-2.5 bg-white"
                >
                  {['Groceries', 'Vegetables', 'Fruits', 'Dairy', 'Beverages', 'Snacks', 'Household'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">Price (₹)</label>
                <input 
                  type="number" required placeholder="150"
                  value={prodPrice} onChange={e => setProdPrice(e.target.value)}
                  className="w-full border border-[#E5E7EB] text-xs font-semibold rounded-lg p-2.5"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">Stock</label>
                <input 
                  type="number" required placeholder="50"
                  value={prodStock} onChange={e => setProdStock(e.target.value)}
                  className="w-full border border-[#E5E7EB] text-xs font-semibold rounded-lg p-2.5"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">Brand</label>
                <input 
                  type="text" required placeholder="Fortune"
                  value={prodBrand} onChange={e => setProdBrand(e.target.value)}
                  className="w-full border border-[#E5E7EB] text-xs font-semibold rounded-lg p-2.5"
                />
              </div>
              <div className="col-span-1 md:col-span-3 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowProductForm(false)} className="text-xs font-bold text-[#6B7280] hover:text-[#111827]">Cancel</button>
                <button type="submit" className="bg-[#22C55E] text-white text-xs font-extrabold px-5 py-2 rounded-lg">Register</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {products.map((prod, idx) => (
              <div key={idx} className="bg-white border border-[#E5E7EB] p-4 rounded-xl flex gap-3 items-center">
                <img src={prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80'} alt={prod.name} className="w-10 h-10 object-cover rounded-lg border" />
                <div className="min-w-0 flex-grow text-xs font-semibold">
                  <span className="text-[9px] text-[#22C55E] block font-bold">{prod.brand} • {prod.category}</span>
                  <h4 className="text-[#111827] line-clamp-1">{prod.name}</h4>
                  <div className="flex justify-between items-center text-[#6B7280] font-bold mt-1 text-[10px]">
                    <span>Stock: {prod.stock}</span>
                    <span className="text-[#111827] font-black">₹{prod.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white border border-[#E5E7EB] p-6 rounded-3xl shadow-soft">
          <h3 className="font-extrabold text-[#111827] text-md mb-4">Orders Register</h3>
          <div className="overflow-x-auto text-xs text-left border-collapse">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-extrabold uppercase text-[10px]">
                  <th className="pb-3 pr-2">ID</th>
                  <th className="pb-3 px-2">Customer</th>
                  <th className="pb-3 px-2">Store</th>
                  <th className="pb-3 px-2 text-right">Paid</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Rider</th>
                  <th className="pb-3 pl-2 text-right">AI Dispatch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {orders.map((ord, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 pr-2 font-mono text-[9px]">#{ord._id.slice(-8)}<br/>
                      {ord.priority !== 'NORMAL' && <span className="text-[8px] bg-red-100 text-red-700 px-1 rounded">{ord.priority}</span>}
                    </td>
                    <td className="py-3 px-2 font-bold">{ord.user?.name || 'Customer'}</td>
                    <td className="py-3 px-2 text-[#6B7280] truncate max-w-[80px]">{ord.store?.name || '-'}</td>
                    <td className="py-3 px-2 text-right font-black text-[#22C55E]">₹{ord.totalPrice}</td>
                    <td className="py-3 px-2"><StatusBadge status={ord.orderStatus} /></td>
                    <td className="py-3 px-2 text-[#6B7280] font-semibold">{ord.deliveryAgent?.name || 'Unassigned'}</td>
                    <td className="py-3 pl-2 text-right">
                      <button onClick={() => handleViewDispatchLog(ord._id)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 ml-auto">
                        <BrainCircuit className="w-3 h-3" /> Log
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ai-logs' && (
        <div className="bg-white border border-[#E5E7EB] p-6 rounded-3xl shadow-soft space-y-4">
          <h3 className="font-extrabold text-[#111827] text-md">AI Shopping Prompt Audit Logs</h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {aiLogs.length === 0 ? (
              <p className="text-xs text-[#6B7280] py-6 text-center">No logs logged yet.</p>
            ) : (
              aiLogs.map((log, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[#E5E7EB] bg-slate-50 space-y-2.5 text-xs text-[#6B7280]">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold">Query Log</span>
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="font-bold text-[#111827] italic pl-2 border-l-2 border-[#22C55E]">"{log.prompt}"</p>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider block mb-1 font-bold">Matched list items</span>
                    <div className="flex flex-wrap gap-1.5">
                      {log.aiResponse?.ingredients?.map((ing, iIdx) => (
                        <span key={iIdx} className="text-[10px] bg-white border border-[#E5E7EB] text-[#111827] px-2 py-0.5 rounded-lg">
                          {ing.ingredientName || ing.product} ({ing.requiredQuantity || ing.quantity})
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

      {/* Dispatch Log Modal */}
      {dispatchLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setDispatchLogModal(null)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-[#6B7280]">
              <XCircle className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-[#111827] flex items-center gap-2 mb-4">
              <BrainCircuit className="w-6 h-6 text-indigo-500" /> Explainable AI Dispatch Log
            </h3>
            
            {!dispatchLogData ? (
              <div className="flex justify-center p-8"><RefreshCw className="w-8 h-8 animate-spin text-indigo-500" /></div>
            ) : (
              <div className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-500 uppercase">Selected Agent</span>
                    <p className="text-lg font-black text-[#111827]">{dispatchLogData.selectedAgent?.name || 'Unassigned'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold text-indigo-500 uppercase">Started At</span>
                    <p className="text-sm font-bold text-[#111827]">{new Date(dispatchLogData.timestamps?.startedAt).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-[#111827] mb-3 text-sm">Agent Ranking Algorithm</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[#6B7280] font-bold uppercase text-[9px]">
                        <tr>
                          <th className="p-3 rounded-tl-lg">Agent</th>
                          <th className="p-3">Proximity</th>
                          <th className="p-3">Workload</th>
                          <th className="p-3">Rating</th>
                          <th className="p-3">Acceptance</th>
                          <th className="p-3 text-indigo-600">Final Score</th>
                          <th className="p-3 rounded-tr-lg">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {dispatchLogData.candidateAgents?.map((c, idx) => (
                          <tr key={idx} className={c.status === 'Selected' ? 'bg-indigo-50/30' : ''}>
                            <td className="p-3 font-bold">{c.agent?.name}</td>
                            <td className="p-3">
                              {c.distance?.toFixed(2)} km <br/>
                              <span className="text-[9px] text-[#6B7280]">Wt: {(c.scoreComponents?.proximityScore * 0.45).toFixed(2)}</span>
                            </td>
                            <td className="p-3">
                              {c.workload} orders<br/>
                              <span className="text-[9px] text-[#6B7280]">Wt: {(c.scoreComponents?.workloadScore * 0.20).toFixed(2)}</span>
                            </td>
                            <td className="p-3">
                              {c.rating}★<br/>
                              <span className="text-[9px] text-[#6B7280]">Wt: {(c.scoreComponents?.ratingScore * 0.15).toFixed(2)}</span>
                            </td>
                            <td className="p-3">
                              {c.acceptanceRate}%<br/>
                              <span className="text-[9px] text-[#6B7280]">Wt: {(c.scoreComponents?.acceptanceScore * 0.10).toFixed(2)}</span>
                            </td>
                            <td className="p-3 font-black text-indigo-600">{c.finalScore?.toFixed(3)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${c.status === 'Selected' ? 'bg-emerald-100 text-emerald-700' : c.status === 'Rejected' || c.status === 'Timeout' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                                {c.status}
                              </span>
                              {c.rejectionReason && <span className="block text-[8px] mt-0.5 text-rose-500">{c.rejectionReason}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   DELIVERY AGENT SUB-DASHBOARD
   ============================================================================ */
function AgentDashboardView() {
  const { user } = useAuth();
  const [agentProfile, setAgentProfile] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeRequest, setActiveRequest] = useState(null);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        const [profileRes, ordersRes] = await Promise.all([
          api.get('/api/dispatch/agent-profile'),
          orderService.getOrders()
        ]);

        if (profileRes.data.success) {
          const profile = profileRes.data.agent;
          setAgentProfile(profile);

          if (ordersRes.success) {
            const active = (ordersRes.orders || []).filter(o => 
              !['Delivered', 'Cancelled'].includes(o.orderStatus) && 
              o.deliveryAgent && 
              (o.deliveryAgent._id === profile._id || o.deliveryAgent === profile._id)
            );
            setAssignedOrders(active);
          }
        }
      } catch (err) {
        console.error('Error fetching agent data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgentData();
  }, [refreshTrigger]);

  useEffect(() => {
    if (!agentProfile || !agentProfile.isOnline) {
      setActiveRequest(null);
      return;
    }

    const checkActiveRequest = async () => {
      try {
        const res = await api.get('/api/dispatch/active-request');
        if (res.data.success && res.data.activeRequest) {
          setActiveRequest(res.data.activeRequest);
        } else {
          setActiveRequest(null);
        }
      } catch (err) {
        console.error('Error checking active request:', err);
      }
    };

    checkActiveRequest();
    const interval = setInterval(checkActiveRequest, 4000);
    return () => clearInterval(interval);
  }, [agentProfile?.isOnline, refreshTrigger]);

  useEffect(() => {
    if (!user) return;
    const socketUrl = import.meta.env.VITE_API_URL;
    const socket = io(socketUrl);
    
    socket.on('connect', () => {
      socket.emit('join-user-room', user._id || user.id);
    });

    socket.on('order-assignment-request', (data) => {
      console.log('Received order-assignment-request via socket:', data);
      setActiveRequest(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const toggleOnline = async () => {
    if (!agentProfile) return;
    try {
      const res = await api.put('/api/dispatch/toggle-online');
      if (res.data.success) {
        setAgentProfile(res.data.agent);
        toast.success(`Rider status set: ${res.data.agent.isOnline ? 'ONLINE' : 'OFFLINE'}`);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      toast.error('Failed to toggle online status');
    }
  };

  const handleAcceptRequest = async () => {
    if (!activeRequest) return;
    try {
      const res = await api.post('/api/dispatch/accept', { orderId: activeRequest.orderId });
      if (res.data.success) {
        toast.success('Order accepted successfully!');
        setActiveRequest(null);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept order');
    }
  };

  const handleRejectRequest = async () => {
    if (!activeRequest) return;
    try {
      const res = await api.post('/api/dispatch/reject', { orderId: activeRequest.orderId });
      if (res.data.success) {
        toast.success('Order request rejected');
        setActiveRequest(null);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      toast.error('Failed to reject order');
    }
  };

  const handleSimulateStatus = async (orderId, currentStatus) => {
    const orderObj = assignedOrders.find(o => o._id === orderId);
    if (!orderObj) return;

    let nextStatus = '';
    const storeLat = orderObj.storeLocation?.lat || 12.9724;
    const storeLng = orderObj.storeLocation?.lng || 77.5951;
    const customerCoords = getCoordsFromAddress(orderObj.address);
    const customerLat = orderObj.customerLocation?.lat || customerCoords.lat;
    const customerLng = orderObj.customerLocation?.lng || customerCoords.lng;
    let lat = agentProfile?.currentLocation?.lat, lng = agentProfile?.currentLocation?.lng;

    if (currentStatus === 'Assigned') {
      nextStatus = 'Preparing'; lat = storeLat; lng = storeLng;
    } else if (currentStatus === 'Preparing') {
      nextStatus = 'Picked Up'; lat = storeLat; lng = storeLng;
    } else if (currentStatus === 'Picked Up') {
      nextStatus = 'On The Way'; lat = (storeLat + customerLat) / 2; lng = (storeLng + customerLng) / 2;
    } else if (currentStatus === 'On The Way') {
      nextStatus = 'Near You'; lat = customerLat - 0.0005; lng = customerLng - 0.0005;
    } else if (currentStatus === 'Near You') {
      nextStatus = 'Delivered'; lat = customerLat; lng = customerLng;
    }

    if (!nextStatus) return;

    try {
      await orderService.updateAgentLocation({
        lat, lng, isAvailable: nextStatus === 'Delivered' ? true : false,
        status: nextStatus, orderId
      });
      toast.success(`Order advanced to: ${nextStatus}`);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      toast.error('Simulation step failed');
    }
  };

  if (loading && refreshTrigger === 0) return <LoadingSpinner message="Loading Rider Console..." />;

  return (
    <div className="space-y-8 max-w-4xl mx-auto relative">
      {/* Accept/Reject Popup Notification Modal */}
      {activeRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-2xl max-w-md w-full animate-bounce-in space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 text-rose-500">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <h3 className="text-lg font-black uppercase tracking-wider">New Dispatch Offer</h3>
            </div>
            <div className="text-xs text-[#6B7280] space-y-2">
              <p><strong>Order ID:</strong> #{activeRequest.orderId?.slice(-8)}</p>
              <p><strong>Pickup Distance:</strong> {activeRequest.pickupDistance?.toFixed(2)} KM</p>
              <p><strong>Delivery Distance:</strong> {activeRequest.deliveryDistance?.toFixed(2)} KM</p>
              <p><strong>Total Distance:</strong> {activeRequest.totalDistance?.toFixed(2)} KM</p>
              <p className="text-indigo-600 font-bold"><strong>Expected ETA:</strong> {activeRequest.etaMins} Mins</p>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center text-emerald-800">
                <span className="font-extrabold uppercase text-[10px]">Estimated Earnings:</span>
                <span className="text-lg font-black">₹{activeRequest.estimatedEarnings?.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleRejectRequest}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold uppercase transition-all"
              >
                Reject Offer
              </button>
              <button 
                onClick={handleAcceptRequest}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold uppercase transition-all"
              >
                Accept Offer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pl-1">
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6 text-[#22C55E]" />
          <h2 className="text-2xl font-black text-[#111827]">Rider Dispatch Console</h2>
        </div>
        <div className="flex gap-2">
          {agentProfile && (
            <button 
              onClick={toggleOnline}
              className={`flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl border transition-all ${agentProfile.isOnline ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-rose-100 border-rose-200 text-rose-700'}`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{agentProfile.isOnline ? 'Go Offline' : 'Go Online'}</span>
            </button>
          )}
          <button onClick={() => setRefreshTrigger(prev => prev + 1)} className="p-2.5 bg-white border rounded-xl"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {agentProfile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl text-xs text-[#6B7280]">
            <h4 className="font-extrabold text-[#111827] text-sm mb-1">{agentProfile.name}</h4>
            <p>Rider ID: #{agentProfile._id.slice(-8)}</p>
            {agentProfile.currentLocation && (
              <p className="font-mono mt-1 text-[10px]">[{agentProfile.currentLocation.lat.toFixed(4)}, {agentProfile.currentLocation.lng.toFixed(4)}]</p>
            )}
          </div>
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl text-xs text-[#6B7280] flex justify-between items-center">
            <div>
              <span className="block text-[9px] uppercase font-bold text-[#6B7280]">Rating</span>
              <span className="font-extrabold text-[#F59E0B] text-lg">★ {agentProfile.rating || '5.0'}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase font-bold text-[#6B7280]">Status</span>
              <span className={`font-extrabold uppercase ${agentProfile.isAvailable ? 'text-emerald-600' : 'text-amber-500'}`}>{agentProfile.isAvailable ? 'Duty Ready' : 'Active Delivery'}</span>
            </div>
          </div>
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl text-xs text-[#6B7280] flex justify-between items-center">
            <div>
              <span className="block text-[9px] uppercase font-bold text-[#6B7280]">Completed Deliveries</span>
              <span className="font-extrabold text-[#111827] text-lg">{agentProfile.completedDeliveries || 0}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase font-bold text-[#6B7280]">Accumulated Earnings</span>
              <span className="font-extrabold text-emerald-600 text-lg">₹{agentProfile.earnings?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-extrabold text-[#111827] text-md">Your Assigned Delivery Tasks</h3>
        {assignedOrders.length === 0 ? (
          <div className="bg-white border rounded-2xl p-10 text-center space-y-2 text-xs text-[#6B7280] font-semibold">
            <p>No active delivery items assigned.</p>
            <p className="text-[#22C55E]">Toggle status to ONLINE to receive nearby dispatches!</p>
          </div>
        ) : (
          assignedOrders.map((order, idx) => (
            <div key={idx} className="bg-white border border-[#E5E7EB] p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b pb-3 text-xs">
                <div>
                  <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">Delivery ID</span>
                  <span className="font-extrabold text-[#111827]">Order #{order._id.slice(-8)}</span>
                </div>
                <StatusBadge status={order.orderStatus} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-[#6B7280]">
                <div>
                  <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block mb-1">Customer Address</span>
                  <div className="p-3 border bg-slate-50 rounded-xl space-y-0.5 text-[#111827]">
                    <p className="font-bold">{order.address?.name}</p>
                    <p className="text-[10px] text-[#6B7280]">Phone: {order.address?.phone}</p>
                    <p className="text-[11px] font-medium leading-relaxed">{order.address?.houseNumber}, {order.address?.street}, {order.address?.city}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block mb-1">Items Summary</span>
                  <div className="p-3 border bg-slate-50 rounded-xl space-y-1.5 max-h-[110px] overflow-y-auto">
                    {order.products.map((p, pIdx) => (
                      <div key={pIdx} className="flex justify-between items-center">
                        <span className="text-[#111827] font-bold">{p.name}</span>
                        <span>x{p.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-center">
                <button
                  onClick={() => handleSimulateStatus(order._id, order.orderStatus)}
                  className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-extrabold px-6 py-2.5 rounded-xl uppercase tracking-wider"
                >
                  {order.orderStatus === 'Assigned' && 'Accept & Prepare Order'}
                  {order.orderStatus === 'Preparing' && 'Pick Up Grocery Pack'}
                  {order.orderStatus === 'Picked Up' && 'Start Transit'}
                  {order.orderStatus === 'On The Way' && 'Arrived Near Home'}
                  {order.orderStatus === 'Near You' && 'Mark Delivered'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   MAIN WRAPPER / ROUTER SWITCHER
   ============================================================================ */
export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboardView />;
  }
  if (user?.role === 'delivery_agent') {
    return <AgentDashboardView />;
  }
  return <CustomerDashboard />;
}
