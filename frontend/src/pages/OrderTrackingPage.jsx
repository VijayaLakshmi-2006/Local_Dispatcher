import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails, updateOrderStatusLocal } from '../store/orderSlice.js';
import { useSocket } from '../hooks/useSocket.js';
import DeliveryTracker from '../components/DeliveryTracker.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { ChevronLeft, Clock, Phone, Star, ShieldCheck, Truck, Package } from 'lucide-react';
import toast from 'react-hot-toast';

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

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { activeOrder, loading, error } = useSelector((state) => state.orders);

  // Real-time tracking data overrides
  const [orderStatus, setOrderStatus] = useState('Order Confirmed');
  const [agent, setAgent] = useState(null);
  const [eta, setEta] = useState('15 mins');

  // Coordinates constants
  const storeCoords = activeOrder?.storeLocation?.lat
    ? { lat: activeOrder.storeLocation.lat, lng: activeOrder.storeLocation.lng }
    : activeOrder?.address
      ? { 
          lat: getCoordsFromAddress(activeOrder.address).lat - 0.012, 
          lng: getCoordsFromAddress(activeOrder.address).lng - 0.012 
        }
      : { lat: 12.9724, lng: 77.5951 };

  const customerCoords = activeOrder?.customerLocation?.lat
    ? { lat: activeOrder.customerLocation.lat, lng: activeOrder.customerLocation.lng }
    : activeOrder?.address
      ? getCoordsFromAddress(activeOrder.address)
      : { lat: 12.9780, lng: 77.6400 };

  // Fetch initial details
  useEffect(() => {
    dispatch(fetchOrderDetails(orderId))
      .unwrap()
      .then((res) => {
        setOrderStatus(res.orderStatus);
        if (res.deliveryAgent) {
          setAgent(res.deliveryAgent);
        }
      })
      .catch(() => {
        toast.error('Failed to load tracking data');
      });
  }, [orderId, dispatch]);

  // Hook up real-time socket tracking
  // In services/dispatchService, the socket emissions send events like 'order-update' 
  // with orderId, orderStatus, agent coordinates, etc.
  // We specify these event callbacks below
  const handleSocketStatusUpdate = (data) => {
    if (data.orderId === orderId) {
      setOrderStatus(data.orderStatus);
      if (data.agent) {
        setAgent(data.agent);
      }
      
      // Calculate eta based on status
      let predictedEta = '15 mins';
      if (data.orderStatus === 'Preparing') predictedEta = '12 mins';
      if (data.orderStatus === 'Assigned') predictedEta = '10 mins';
      if (data.orderStatus === 'Picked Up') predictedEta = '7 mins';
      if (data.orderStatus === 'On The Way') predictedEta = '4 mins';
      if (data.orderStatus === 'Near You') predictedEta = '1 min';
      if (data.orderStatus === 'Delivered') {
        predictedEta = 'Arrived';
        toast.success('Your order has been delivered!');
      }
      setEta(predictedEta);
      
      // Sync local Redux store
      dispatch(updateOrderStatusLocal(data));
    }
  };

  const handleSocketLocationUpdate = (data) => {
    if (data.orderId === orderId && data.agent) {
      setAgent(data.agent);
    }
  };

  // Connect to Socket.io via custom hook
  useSocket(orderId, handleSocketStatusUpdate, handleSocketLocationUpdate);

  if (loading && !activeOrder) return <LoadingSpinner message="Opening live delivery tracker..." />;

  if (error || !activeOrder) {
    return (
      <div class="max-w-md mx-auto text-center py-12 bg-white border rounded-2xl shadow-soft space-y-4">
        <h3 class="text-[#EF4444] font-extrabold text-lg">Error Tracking Order</h3>
        <p class="text-xs text-[#6B7280] font-semibold">{error || 'Order tracking not available'}</p>
        <button onClick={() => navigate('/dashboard')} class="bg-[#22C55E] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl uppercase tracking-wider shadow-sm shadow-[#22C55E]/20">
          Go Back Home
        </button>
      </div>
    );
  }

  // Delivery Progress statuses
  const statusSteps = ['Order Confirmed', 'Preparing', 'Assigned', 'Picked Up', 'On The Way', 'Near You', 'Delivered'];
  const activeIndex = statusSteps.indexOf(orderStatus);

  return (
    <div class="space-y-6 py-4">
      {/* Header controls */}
      <div class="flex items-center justify-between pl-1">
        <button 
          onClick={() => navigate('/dashboard')}
          class="flex items-center gap-1 text-xs font-bold text-[#6B7280] hover:text-[#111827] transition-colors animate-pulse"
        >
          <ChevronLeft class="w-4 h-4" /> Back to Dashboard
        </button>
        <span class="text-xs text-[#6B7280] font-mono">Order ID: #{activeOrder._id}</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Map & Timelines */}
        <div class="lg:col-span-8 space-y-6">
          {/* Leaflet Map panel */}
          <div class="h-[400px] w-full rounded-3xl overflow-hidden relative shadow-soft">
            <DeliveryTracker 
              storeCoords={storeCoords}
              customerCoords={customerCoords}
              agentCoords={agent?.currentLocation}
              agentName={agent?.name}
            />
          </div>

          {/* Stepper milestones list */}
          <div class="bg-white border border-[#E5E7EB] p-6 rounded-3xl shadow-soft space-y-6">
            <div class="flex items-center justify-between border-b border-[#E5E7EB]/50 pb-3">
              <h3 class="font-extrabold text-sm text-[#111827] uppercase tracking-wider">Delivery Milestones</h3>
              <span class="text-xs text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-lg font-black flex items-center gap-1">
                <Clock class="w-3.5 h-3.5" /> ETA: {eta}
              </span>
            </div>

            {/* Stepper progress path */}
            <div class="relative flex flex-col md:flex-row justify-between gap-4 md:gap-0 pl-4 md:pl-0 font-extrabold text-[10px]">
              {statusSteps.map((step, idx) => {
                const isPassed = idx < activeIndex;
                const isActive = idx === activeIndex;
                
                return (
                  <div key={idx} class="flex md:flex-col items-center flex-1 relative group">
                    {/* Stepper connector lines */}
                    {idx < statusSteps.length - 1 && (
                      <div class={`hidden md:block absolute top-4 left-1/2 w-full h-[3px] z-0 ${idx < activeIndex ? 'bg-[#22C55E]' : 'bg-slate-100'}`}></div>
                    )}

                    <div class={`w-8 h-8 rounded-full flex items-center justify-center border z-10 transition-all ${isPassed ? 'bg-[#22C55E] border-[#22C55E] text-white' : isActive ? 'bg-white border-[#22C55E] text-[#22C55E] scale-110 shadow-sm shadow-[#22C55E]/20' : 'bg-white border-[#E5E7EB] text-[#6B7280]'}`}>
                      {isPassed ? '✓' : idx + 1}
                      {isActive && <span class="absolute -inset-1 border border-[#22C55E]/20 rounded-full animate-ping"></span>}
                    </div>

                    <span class={`text-[9px] uppercase mt-2 md:mt-3 ${isActive ? 'text-[#22C55E] font-black' : isPassed ? 'text-[#111827]' : 'text-[#6B7280]'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Rider profile & Billing summaries */}
        <div class="lg:col-span-4 space-y-6">
          {/* Rider profile */}
          <div class="bg-white border border-[#E5E7EB] p-6 rounded-3xl shadow-soft space-y-6">
            <h3 class="font-extrabold text-sm text-[#111827] uppercase tracking-wider border-b pb-3">Rider Profile</h3>

            {agent ? (
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-slate-50 border rounded-2xl flex items-center justify-center font-black text-xs text-[#22C55E] uppercase tracking-wider">
                    {agent.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <span class="text-[9px] font-extrabold text-[#6B7280] uppercase tracking-wider block">Assigned Rider</span>
                    <h4 class="font-extrabold text-sm text-[#111827] leading-tight">{agent.name}</h4>
                    <span class="text-[9px] text-[#F59E0B] font-extrabold flex items-center gap-0.5 mt-0.5">
                      <Star class="w-3.5 h-3.5 fill-[#F59E0B] stroke-none" /> {agent.rating || '5.0'} ({agent.ratingsCount || 10} reviews)
                    </span>
                  </div>
                </div>

                <div class="space-y-2 pt-2.5 border-t border-[#E5E7EB]/50 text-xs font-semibold text-[#6B7280]">
                  <div class="flex items-center gap-2">
                    <Phone class="w-4 h-4 text-[#6B7280]" />
                    <span class="text-[#111827]">{agent.phone}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Truck class="w-4 h-4 text-[#6B7280]" />
                    <span>Rider Vehicle: Hero Electric Cycle</span>
                  </div>
                </div>

                <a 
                  href={`tel:${agent.phone}`}
                  class="w-full flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-sm shadow-[#22C55E]/15 text-xs uppercase tracking-wider"
                >
                  <Phone class="w-3.5 h-3.5" /> Call delivery rider
                </a>
              </div>
            ) : (
              <div class="py-4 text-center space-y-2">
                <div class="w-7 h-7 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p class="text-xs text-[#6B7280] font-semibold leading-relaxed max-w-xs mx-auto">
                  Rider selection is in progress... Auto-dispatch algorithm is locating nearby riders.
                </p>
              </div>
            )}
          </div>

          {/* Items summary */}
          <div class="bg-white border border-[#E5E7EB] p-6 rounded-3xl shadow-soft space-y-4">
            <h3 class="font-extrabold text-sm text-[#111827] uppercase tracking-wider border-b pb-3">Items Summary</h3>
            <div class="space-y-3 max-h-[180px] overflow-y-auto pr-1">
              {activeOrder.products.map((item, idx) => (
                <div key={idx} class="flex justify-between items-center text-xs font-semibold text-[#6B7280]">
                  <div class="min-w-0 pr-2">
                    <span class="text-[#111827] font-bold line-clamp-1">{item.name}</span>
                    <span class="text-[10px]">Qty: {item.quantity}</span>
                  </div>
                  <span class="font-bold text-[#111827] shrink-0">₹{Math.round(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div class="pt-3 border-t flex justify-between items-center text-xs font-bold text-[#6B7280]">
              <span>Paid Amount ({activeOrder.paymentMethod})</span>
              <span class="font-black text-[#111827] text-sm">₹{activeOrder.totalPrice}</span>
            </div>

            {activeOrder.paymentId && (
              <div class="text-[9px] font-mono text-[#6B7280] flex items-center justify-center gap-1 pt-2 border-t border-dashed">
                <ShieldCheck class="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Simulated Settlement ID: {activeOrder.paymentId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
