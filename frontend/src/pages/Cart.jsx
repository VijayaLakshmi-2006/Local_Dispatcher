import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App.jsx';
import { ShoppingCart, Trash2, Plus, Minus, MapPin, CreditCard, ChevronRight, CheckCircle, Sparkles } from 'lucide-react';

export default function Cart() {
  const { refreshCart, cartRefresh } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, Card, COD

  // Form for new address
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrHouse, setAddrHouse] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');

  // Payment mock inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  // UI status
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Load cart and addresses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cartRes, profileRes] = await Promise.all([
          axios.get('/api/cart'),
          axios.get('/api/auth/profile')
        ]);

        if (cartRes.data.success) {
          setCart(cartRes.data.cart);
        }
        if (profileRes.data.success && profileRes.data.user) {
          setAddresses(profileRes.data.user.addresses || []);
        }
      } catch (err) {
        console.error('Error fetching cart data:', err);
        setError('Failed to load cart contents');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cartRefresh]);

  const handleUpdateQty = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    try {
      const res = await axios.put('/api/cart/update', { productId, quantity: newQty });
      if (res.data.success) {
        setCart(res.data.cart);
        refreshCart();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const res = await axios.delete('/api/cart/remove', { data: { productId } });
      if (res.data.success) {
        setCart(res.data.cart);
        refreshCart();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to remove item');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/address', {
        name: addrName,
        phone: addrPhone,
        houseNumber: addrHouse,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        pincode: addrPincode,
        landmark: addrLandmark
      });

      if (res.data.success) {
        setAddresses(res.data.addresses);
        setSelectedAddressIndex(res.data.addresses.length - 1);
        setShowAddressForm(false);
        // Clear form
        setAddrName('');
        setAddrPhone('');
        setAddrHouse('');
        setAddrStreet('');
        setAddrCity('');
        setAddrState('');
        setAddrPincode('');
        setAddrLandmark('');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to add address');
    }
  };

  const handleCheckout = async () => {
    setError('');
    
    if (addresses.length === 0) {
      setError('Please add a delivery address to checkout');
      return;
    }

    if (paymentMethod === 'Card' && (!cardNumber || !cardExpiry || !cardCVV)) {
      setError('Please fill in card details for simulated transaction');
      return;
    }

    try {
      setSubmitting(true);
      const address = addresses[selectedAddressIndex];
      const res = await axios.post('/api/orders/create', {
        address,
        paymentMethod
      });

      if (res.data.success && res.data.order) {
        refreshCart();
        // Route to the tracking map with order ID!
        navigate(`/tracking/${res.data.order._id}`);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div class="flex justify-center items-center py-20 bg-[#0b0f19]">
        <div class="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const deliveryFee = cart?.totalPrice > 0 ? (cart.totalPrice > 500 ? 0 : 40) : 0;
  const subtotal = cart?.totalPrice || 0;
  const total = subtotal + deliveryFee;

  return (
    <div class="max-w-5xl mx-auto space-y-8">
      <div class="flex items-center gap-2">
        <ShoppingCart class="w-6 h-6 text-indigo-400" />
        <h2 class="text-3xl font-extrabold text-white">Your Smart Cart</h2>
      </div>

      {error && (
        <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {!cart || cart.items.length === 0 ? (
        <div class="glass-panel p-12 rounded-3xl text-center space-y-6">
          <div class="w-16 h-16 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center mx-auto text-gray-500">
            <ShoppingCart class="w-8 h-8" />
          </div>
          <div class="space-y-1">
            <h3 class="font-extrabold text-white text-xl">Your cart is empty</h3>
            <p class="text-sm text-gray-400 max-w-sm mx-auto">Use the AI Smart Search to describe what you want to cook or buy, and we will populate your cart!</p>
          </div>
          <button
            onClick={() => navigate('/ai-search')}
            class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Ask AI Assistant
          </button>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Side: Cart Items & Addresses */}
          <div class="md:col-span-7 space-y-6">
            {/* Cart Items List */}
            <div class="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
              <h3 class="text-lg font-black text-white">Cart Products ({cart.items.length})</h3>
              
              <div class="divide-y divide-white/5 space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {cart.items.map((item, idx) => {
                  const product = item.product;
                  if (!product) return null;
                  
                  const discountedPrice = product.price * (1 - (product.discount || 0)/100);

                  return (
                    <div key={idx} class="flex items-center gap-4 pt-4 first:pt-0">
                      <img 
                        src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'} 
                        alt={product.name}
                        class="w-14 h-14 rounded-lg object-cover bg-slate-900 border border-white/10"
                      />
                      
                      <div class="flex-grow">
                        <span class="text-[10px] text-indigo-400 font-bold block">{product.brand}</span>
                        <h4 class="text-xs font-bold text-white line-clamp-1">{product.name}</h4>
                        <span class="text-[10px] text-gray-400">{product.unit}</span>
                      </div>

                      {/* Quantity Modifier */}
                      <div class="flex items-center bg-slate-900 border border-white/10 rounded-lg p-0.5">
                        <button
                          onClick={() => handleUpdateQty(product._id, item.quantity, -1)}
                          class="p-1 hover:bg-white/5 rounded text-gray-400"
                        >
                          <Minus class="w-3 h-3" />
                        </button>
                        <span class="text-xs font-black px-2 text-white">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(product._id, item.quantity, 1)}
                          class="p-1 hover:bg-white/5 rounded text-gray-400"
                        >
                          <Plus class="w-3 h-3" />
                        </button>
                      </div>

                      {/* Pricing & Delete */}
                      <div class="text-right flex flex-col items-end gap-1 pl-2">
                        <span class="text-xs font-black text-indigo-400">
                          ₹{Math.round(discountedPrice * item.quantity)}
                        </span>
                        <button 
                          onClick={() => handleRemoveItem(product._id)}
                          class="text-gray-500 hover:text-rose-400 transition-colors p-1"
                        >
                          <Trash2 class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Address Selection */}
            <div class="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-black text-white">Delivery Address</h3>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  class="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Plus class="w-3.5 h-3.5" /> Add Address
                </button>
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} class="p-4 rounded-2xl bg-slate-950/40 border border-white/10 grid grid-cols-2 gap-3">
                  <div class="col-span-2">
                    <input 
                      type="text" required placeholder="Recipient Name" 
                      value={addrName} onChange={e => setAddrName(e.target.value)}
                      class="w-full glass-input text-xs rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <input 
                      type="tel" required placeholder="Phone Number" 
                      value={addrPhone} onChange={e => setAddrPhone(e.target.value)}
                      class="w-full glass-input text-xs rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <input 
                      type="text" required placeholder="Flat/House No." 
                      value={addrHouse} onChange={e => setAddrHouse(e.target.value)}
                      class="w-full glass-input text-xs rounded-lg p-2.5"
                    />
                  </div>
                  <div class="col-span-2">
                    <input 
                      type="text" required placeholder="Street / Area Name" 
                      value={addrStreet} onChange={e => setAddrStreet(e.target.value)}
                      class="w-full glass-input text-xs rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <input 
                      type="text" required placeholder="City" 
                      value={addrCity} onChange={e => setAddrCity(e.target.value)}
                      class="w-full glass-input text-xs rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <input 
                      type="text" required placeholder="State" 
                      value={addrState} onChange={e => setAddrState(e.target.value)}
                      class="w-full glass-input text-xs rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <input 
                      type="text" required placeholder="Pincode" 
                      value={addrPincode} onChange={e => setAddrPincode(e.target.value)}
                      class="w-full glass-input text-xs rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <input 
                      type="text" placeholder="Landmark (Optional)" 
                      value={addrLandmark} onChange={e => setAddrLandmark(e.target.value)}
                      class="w-full glass-input text-xs rounded-lg p-2.5"
                    />
                  </div>
                  <div class="col-span-2 flex justify-end gap-2 pt-2">
                    <button 
                      type="button" onClick={() => setShowAddressForm(false)}
                      class="text-xs font-bold text-gray-400 hover:text-gray-200 px-3 py-1.5"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      class="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Addresses List */}
              {addresses.length === 0 ? (
                <div class="p-4 text-center text-xs text-gray-500 font-medium">
                  No addresses saved yet. Click "Add Address" above.
                </div>
              ) : (
                <div class="space-y-3">
                  {addresses.map((addr, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedAddressIndex(idx)}
                      class={`p-4 rounded-2xl border cursor-pointer flex gap-3 items-start transition-all ${selectedAddressIndex === idx ? 'bg-indigo-500/5 border-indigo-500/35 text-white' : 'bg-slate-950/20 border-white/5 text-gray-400 hover:text-gray-300'}`}
                    >
                      <MapPin class={`w-5 h-5 mt-0.5 ${selectedAddressIndex === idx ? 'text-indigo-400' : 'text-gray-600'}`} />
                      <div class="text-xs space-y-1">
                        <div class="flex items-center gap-2">
                          <span class="font-extrabold text-white">{addr.name}</span>
                          <span class="text-gray-500">|</span>
                          <span class="font-bold text-gray-300">{addr.phone}</span>
                        </div>
                        <p class="leading-relaxed">
                          {addr.houseNumber}, {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        {addr.landmark && (
                          <span class="text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/10 px-1.5 py-0.5 rounded block w-fit mt-1">
                            Landmark: {addr.landmark}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Order Summary & Payment */}
          <div class="md:col-span-5 space-y-6">
            {/* Summary */}
            <div class="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
              <h3 class="text-lg font-black text-white">Order Summary</h3>
              
              <div class="text-xs space-y-3 text-gray-400 border-b border-white/5 pb-4">
                <div class="flex justify-between">
                  <span>Items Subtotal</span>
                  <span class="font-bold text-white">₹{subtotal}</span>
                </div>
                <div class="flex justify-between">
                  <span>Hyperlocal Delivery Fee</span>
                  <span class="font-bold text-white">
                    {deliveryFee === 0 ? <span class="text-emerald-400">FREE</span> : `₹${deliveryFee}`}
                  </span>
                </div>
                {subtotal <= 500 && (
                  <p class="text-[10px] text-indigo-400 bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10">
                    Add ₹{500 - subtotal} more to get free delivery!
                  </p>
                )}
              </div>

              <div class="flex justify-between items-center text-sm font-extrabold text-white">
                <span>Total Amount</span>
                <span class="text-xl text-indigo-400 font-black">₹{total}</span>
              </div>
            </div>

            {/* Payment Options */}
            <div class="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
              <h3 class="text-lg font-black text-white">Simulated Payment</h3>

              {/* Payment Methods */}
              <div class="grid grid-cols-3 gap-2">
                {['UPI', 'Card', 'COD'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    class={`text-xs font-extrabold py-2.5 rounded-xl border transition-all ${paymentMethod === method ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/15' : 'bg-slate-950/20 border-white/5 text-gray-400 hover:text-gray-300'}`}
                  >
                    {method === 'Card' ? 'Debit/Credit' : method}
                  </button>
                ))}
              </div>

              {/* Simulated UPI Scan */}
              {paymentMethod === 'UPI' && (
                <div class="p-4 bg-slate-950/40 border border-white/10 rounded-2xl text-center space-y-3">
                  <div class="w-32 h-32 bg-white p-2 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                    {/* Simulated QR Code using SVG */}
                    <svg viewBox="0 0 100 100" class="w-full h-full text-slate-950">
                      <rect x="0" y="0" width="25" height="25" fill="currentColor"/>
                      <rect x="5" y="5" width="15" height="15" fill="white"/>
                      <rect x="75" y="0" width="25" height="25" fill="currentColor"/>
                      <rect x="80" y="5" width="15" height="15" fill="white"/>
                      <rect x="0" y="75" width="25" height="25" fill="currentColor"/>
                      <rect x="5" y="80" width="15" height="15" fill="white"/>
                      {/* Random blocks */}
                      <rect x="35" y="10" width="10" height="30" fill="currentColor"/>
                      <rect x="60" y="30" width="15" height="40" fill="currentColor"/>
                      <rect x="30" y="60" width="25" height="15" fill="currentColor"/>
                      <rect x="80" y="80" width="10" height="10" fill="currentColor"/>
                    </svg>
                  </div>
                  <div class="space-y-1">
                    <span class="text-[10px] font-bold text-gray-500 uppercase">Scan to Pay</span>
                    <p class="text-[11px] text-indigo-400 font-bold">UPI ID: hyperlocal@dispatcher</p>
                  </div>
                </div>
              )}

              {/* Simulated Card Forms */}
              {paymentMethod === 'Card' && (
                <div class="p-4 bg-slate-950/40 border border-white/10 rounded-2xl space-y-3">
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-500 uppercase">Card Number</label>
                    <input 
                      type="text" required placeholder="XXXX XXXX XXXX XXXX" 
                      value={cardNumber} onChange={e => setCardNumber(e.target.value)}
                      class="w-full glass-input text-xs rounded-lg p-2.5 font-mono"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500 uppercase">Expiry Date</label>
                      <input 
                        type="text" required placeholder="MM/YY" 
                        value={cardExpiry} onChange={e => setCardExpiry(e.target.value)}
                        class="w-full glass-input text-xs rounded-lg p-2.5 font-mono"
                      />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500 uppercase">CVV</label>
                      <input 
                        type="password" required placeholder="***" maxLength="3"
                        value={cardCVV} onChange={e => setCardCVV(e.target.value)}
                        class="w-full glass-input text-xs rounded-lg p-2.5 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* COD */}
              {paymentMethod === 'COD' && (
                <div class="p-4 bg-slate-950/40 border border-white/10 rounded-2xl text-center">
                  <CheckCircle class="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p class="text-xs text-gray-300 font-semibold leading-relaxed">Pay cash or scan UPI code to delivery agent at your doorstep.</p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={submitting}
                class="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm"
              >
                <span>{submitting ? 'Simulating Payment...' : 'Authorize & Place Order'}</span>
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
