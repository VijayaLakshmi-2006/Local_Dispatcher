import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useCart } from '../hooks/useCart.js';
import AddressCard from '../components/AddressCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { ChevronLeft, MapPin, Plus, X, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, addAddress, updateAddress, deleteAddress } = useAuth();
  const { items, totalPrice } = useCart();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Modal form states
  const [addressName, setAddressName] = useState('Home');
  const [phone, setPhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Set default address on load
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0 && !selectedAddress) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [user, selectedAddress]);

  // Sync modal fields when editing changes
  useEffect(() => {
    if (editingAddress) {
      setAddressName(editingAddress.name);
      setPhone(editingAddress.phone);
      setHouseNumber(editingAddress.houseNumber);
      setStreet(editingAddress.street);
      setCity(editingAddress.city || 'Bangalore');
      setState(editingAddress.state || 'Karnataka');
      setPincode(editingAddress.pincode);
      setLandmark(editingAddress.landmark || '');
      setIsDefault(editingAddress.isDefault || false);
    } else {
      setAddressName('Home');
      setPhone('');
      setHouseNumber('');
      setStreet('');
      setCity('Bangalore');
      setState('Karnataka');
      setPincode('');
      setLandmark('');
      setIsDefault(false);
    }
  }, [editingAddress]);

  // Coordinates Distance Helpers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in Km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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

  // Dynamic Estimates
  const deliveryEstimate = React.useMemo(() => {
    if (!selectedAddress) return null;
    
    const storeCoords = { lat: 12.9724, lng: 77.5951 };
    const addrCoords = getCoordsFromAddress(selectedAddress);
    const distance = calculateDistance(storeCoords.lat, storeCoords.lng, addrCoords.lat, addrCoords.lng);
    
    // Closer dispatches (<= 2.5 Km) take 9–13 Minutes
    let minTime = 9;
    let maxTime = 13;
    
    if (distance > 2.5 && distance <= 5) {
      minTime = 14;
      maxTime = 18;
    } else if (distance > 5) {
      minTime = 19;
      maxTime = 25;
    }
    
    return {
      distance,
      textFull: `Fast Delivery • Expected in ${minTime}–${maxTime} Minutes`,
      description: `Delivered from your nearest hyperlocal dispatcher hub (${distance.toFixed(1)} km away).`
    };
  }, [selectedAddress]);

  const deliveryFee = React.useMemo(() => {
    if (totalPrice > 500) return 0;
    if (!selectedAddress) return 30;
    
    const storeCoords = { lat: 12.9724, lng: 77.5951 };
    const addrCoords = getCoordsFromAddress(selectedAddress);
    const distance = calculateDistance(storeCoords.lat, storeCoords.lng, addrCoords.lat, addrCoords.lng);
    
    if (distance <= 2.5) return 20; // discount for nearby dispatches
    if (distance > 5) return 50;    // long distance dispatches
    return 30;                      // standard
  }, [totalPrice, selectedAddress]);

  if (!items || items.length === 0) {
    return (
      <div class="py-12">
        <EmptyState 
          type="cart"
          title="No items to checkout"
          message="Your cart is empty. Try using our AI Assistant to build a shopping list first."
          actionText="Go to AI Shopping"
          onAction={() => navigate('/ai-search')}
        />
      </div>
    );
  }

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !houseNumber || !street || !pincode) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: addressName, phone, houseNumber, street, city, state, pincode, landmark, isDefault
      };
      
      if (editingAddress) {
        const res = await updateAddress(editingAddress._id, payload).unwrap();
        toast.success('Address updated successfully!');
        if (selectedAddress?._id === editingAddress._id) {
          const updated = res.find(a => a._id === editingAddress._id);
          setSelectedAddress(updated || res[res.length - 1]);
        }
      } else {
        const res = await addAddress(payload).unwrap();
        toast.success('Address added successfully!');
        if (res && res.length > 0) {
          setSelectedAddress(res[res.length - 1]);
        }
      }
      
      setShowAddressModal(false);
      setEditingAddress(null);
    } catch (err) {
      toast.error(editingAddress ? 'Failed to update address' : 'Failed to add address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefaultAddress = async (addr) => {
    try {
      await updateAddress(addr._id, { ...addr, isDefault: true }).unwrap();
      toast.success('Default address updated!');
    } catch (err) {
      toast.error('Failed to update default address');
    }
  };

  const handleDeleteAddress = async (addr) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(addr._id).unwrap();
      toast.success('Address deleted successfully!');
      if (selectedAddress?._id === addr._id) {
        setSelectedAddress(null);
      }
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address');
      return;
    }
    navigate('/payment', { state: { address: selectedAddress } });
  };

  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = Math.round(totalPrice + deliveryFee + taxes);

  return (
    <div class="space-y-6 py-4">
      {/* Top Navigation */}
      <div class="flex items-center justify-between pl-1">
        <button 
          onClick={() => navigate('/cart')}
          class="flex items-center gap-1 text-xs font-bold text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <ChevronLeft class="w-4 h-4" /> Back to Cart
        </button>
        <span class="text-xs text-[#6B7280] font-extrabold uppercase tracking-wider">Checkout</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Saved Addresses & Delivery Estimate */}
        <div class="lg:col-span-8 space-y-6">
          {/* Estimated Delivery Time */}
          {selectedAddress ? (
            <div class="bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-soft flex items-center gap-4 transition-all">
              <div class="w-10 h-10 rounded-xl bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center shrink-0 animate-pulse">
                <Truck class="w-5 h-5" />
              </div>
              <div class="text-xs font-semibold text-[#6B7280] space-y-0.5">
                <span class="text-[9px] uppercase tracking-wider block font-bold text-[#22C55E]">Estimated Delivery Time</span>
                <p class="text-[#111827] font-extrabold text-sm">{deliveryEstimate?.textFull}</p>
                <p>{deliveryEstimate?.description}</p>
              </div>
            </div>
          ) : (
            <div class="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-soft flex items-center gap-4 transition-all">
              <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <MapPin class="w-5 h-5" />
              </div>
              <div class="text-xs font-semibold text-amber-800 space-y-0.5">
                <span class="text-[9px] uppercase tracking-wider block font-bold">Estimated Delivery Time</span>
                <p class="font-extrabold text-sm">Please Select a Delivery Address</p>
                <p>Add or select an address below to calculate delivery time.</p>
              </div>
            </div>
          )}

          {/* Addresses list */}
          <div class="bg-white border border-[#E5E7EB] p-6 rounded-3xl shadow-soft space-y-4">
            <div class="flex justify-between items-center pl-0.5">
              <div class="flex items-center gap-1.5">
                <MapPin class="w-4.5 h-4.5 text-[#22C55E]" />
                <h3 class="font-extrabold text-sm text-[#111827] uppercase tracking-wider">Select Delivery Address</h3>
              </div>
              <button 
                onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
                class="flex items-center gap-1 text-xs font-extrabold text-[#22C55E] hover:underline"
              >
                <Plus class="w-4.5 h-4.5" /> Add New
              </button>
            </div>

            {user?.addresses && user.addresses.length > 0 ? (
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses.map((addr) => (
                  <AddressCard 
                    key={addr._id}
                    address={addr}
                    isSelected={selectedAddress?._id === addr._id}
                    onSelect={setSelectedAddress}
                    onEdit={(a) => { setEditingAddress(a); setShowAddressModal(true); }}
                    onDelete={handleDeleteAddress}
                    onSetDefault={handleSetDefaultAddress}
                  />
                ))}
              </div>
            ) : (
              <div class="py-6 text-center text-xs text-[#6B7280] font-semibold border-2 border-dashed border-[#E5E7EB] rounded-2xl space-y-3">
                <p>No delivery addresses configured yet.</p>
                <button 
                  onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
                  class="bg-[#22C55E]/10 text-[#22C55E] text-xs font-extrabold px-4 py-2 rounded-xl border border-[#22C55E]/20"
                >
                  Create Delivery Address
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div class="lg:col-span-4 bg-white border border-[#E5E7EB] p-6 rounded-3xl shadow-soft space-y-6">
          <h3 class="font-extrabold text-sm text-[#111827] uppercase tracking-wider border-b pb-3">Checkout Summary</h3>

          {/* Items Summary checklist */}
          <div class="space-y-3.5 max-h-[160px] overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.product?._id} class="flex justify-between items-center text-xs font-semibold">
                <div class="min-w-0 pr-2">
                  <p class="font-extrabold text-[#111827] line-clamp-1">{item.product?.name}</p>
                  <span class="text-[10px] text-[#6B7280]">Qty: {item.quantity} • {item.product?.unit}</span>
                </div>
                <span class="text-[#111827] font-extrabold shrink-0">
                  ₹{Math.round(item.product?.price * (1 - (item.product?.discount || 0)/100) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div class="pt-4 border-t border-[#E5E7EB]/50 space-y-3 text-xs text-[#6B7280] font-semibold">
            <div class="flex justify-between items-center">
              <span>Items Subtotal</span>
              <span class="text-[#111827]">₹{totalPrice}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Handling & Delivery partner fee</span>
              <span class="text-[#111827]">₹{deliveryFee}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Taxes (GST 5%)</span>
              <span class="text-[#111827]">₹{taxes}</span>
            </div>
            <div class="pt-4 border-t border-[#E5E7EB]/50 flex justify-between items-center text-sm">
              <span class="font-extrabold text-[#111827]">To Pay</span>
              <span class="font-black text-[#111827] text-md">₹{grandTotal}</span>
            </div>
          </div>

          <button 
            onClick={handleProceedToPayment}
            class="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-extrabold py-4 rounded-xl transition-all shadow-sm shadow-[#22C55E]/20 text-xs uppercase tracking-wider"
          >
            Confirm & Proceed to Pay
          </button>
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-card border border-[#E5E7EB]">
            {/* Header */}
            <div class="bg-slate-50 border-b border-[#E5E7EB] p-5 flex justify-between items-center">
              <h3 class="font-extrabold text-sm text-[#111827] uppercase tracking-wider">
                {editingAddress ? 'Edit Delivery Address' : 'Create Delivery Address'}
              </h3>
              <button onClick={() => { setShowAddressModal(false); setEditingAddress(null); }} class="text-[#6B7280] hover:text-[#111827]">
                <X class="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddAddressSubmit} class="p-5 space-y-4 text-xs font-semibold text-[#6B7280]">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-[10px] font-extrabold uppercase block mb-1">Address Label</label>
                  <select 
                    value={addressName}
                    onChange={(e) => setAddressName(e.target.value)}
                    class="w-full border border-[#E5E7EB] text-xs font-semibold rounded-lg p-2.5 bg-white"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label class="text-[10px] font-extrabold uppercase block mb-1">Contact Phone</label>
                  <input 
                    type="tel" required placeholder="9876543210"
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                    class="w-full border border-[#E5E7EB] text-xs font-semibold rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label class="text-[10px] font-extrabold uppercase block mb-1">House/Flat No, Block</label>
                <input 
                  type="text" required placeholder="Flat 402, 4th Floor"
                  value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)}
                  class="w-full border border-[#E5E7EB] text-xs font-semibold rounded-lg p-2.5"
                />
              </div>

              <div>
                <label class="text-[10px] font-extrabold uppercase block mb-1">Street name / Area</label>
                <input 
                  type="text" required placeholder="100 Feet Road, Indiranagar"
                  value={street} onChange={(e) => setStreet(e.target.value)}
                  class="w-full border border-[#E5E7EB] text-xs font-semibold rounded-lg p-2.5"
                />
              </div>

              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="text-[10px] font-extrabold uppercase block mb-1">City</label>
                  <input 
                    type="text" required placeholder="Bangalore"
                    value={city} onChange={(e) => setCity(e.target.value)}
                    class="w-full border border-[#E5E7EB] text-xs font-semibold rounded-lg p-2.5" 
                  />
                </div>
                <div>
                  <label class="text-[10px] font-extrabold uppercase block mb-1">State</label>
                  <input 
                    type="text" required placeholder="Karnataka"
                    value={state} onChange={(e) => setState(e.target.value)}
                    class="w-full border border-[#E5E7EB] text-xs font-semibold rounded-lg p-2.5" 
                  />
                </div>
                <div>
                  <label class="text-[10px] font-extrabold uppercase block mb-1">Pincode</label>
                  <input 
                    type="text" required placeholder="560038"
                    value={pincode} onChange={(e) => setPincode(e.target.value)}
                    class="w-full border border-[#E5E7EB] text-xs font-semibold rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label class="text-[10px] font-extrabold uppercase block mb-1">Landmark (Optional)</label>
                <input 
                  type="text" placeholder="Opposite Metro Station"
                  value={landmark} onChange={(e) => setLandmark(e.target.value)}
                  class="w-full border border-[#E5E7EB] text-xs font-semibold rounded-lg p-2.5"
                />
              </div>

              <label class="flex items-center gap-2 pt-1 select-none cursor-pointer">
                <input 
                  type="checkbox" checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  class="accent-[#22C55E]"
                />
                <span>Set as default delivery address</span>
              </label>

              <button 
                type="submit"
                disabled={submitting}
                class="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-sm shadow-[#22C55E]/20 text-xs uppercase tracking-wider"
              >
                {submitting ? 'Saving Address...' : 'Save & Select Address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
