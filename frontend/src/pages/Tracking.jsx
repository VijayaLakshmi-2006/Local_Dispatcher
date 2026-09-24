import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AuthContext } from '../App.jsx';
import { Sparkles, MapPin, Truck, Phone, Star, CheckCircle2, ChevronLeft, Clock, ShieldCheck } from 'lucide-react';

// Custom Map Bound Setter to center map between Store, Customer, and Agent
function MapController({ storeCoords, customerCoords, agentCoords }) {
  const map = useMap();
  useEffect(() => {
    if (storeCoords && customerCoords) {
      const bounds = L.latLngBounds([
        [storeCoords.lat, storeCoords.lng],
        [customerCoords.lat, customerCoords.lng]
      ]);
      if (agentCoords) {
        bounds.extend([agentCoords.lat, agentCoords.lng]);
      }
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [storeCoords, customerCoords, agentCoords, map]);
  return null;
}

export default function Tracking() {
  const { orderId } = useParams();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Real-time tracking data
  const [orderStatus, setOrderStatus] = useState('Order Confirmed');
  const [agent, setAgent] = useState(null);
  const [eta, setEta] = useState('15 mins');

  const navigate = useNavigate();

  // Central Store Coordinates (Bangalore Hub)
  const storeCoords = { lat: 12.9724, lng: 77.5951 };
  // Customer Coordinates (Indiranagar)
  const customerCoords = { lat: 12.9780, lng: 77.6400 };

  // Setup custom SVG icons to prevent broken image references in Vite
  const storeIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="%236366f1"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
    iconSize: [36, 36],
    iconAnchor: [18, 36]
  });

  const customerIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="%2310b981"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
    iconSize: [36, 36],
    iconAnchor: [18, 36]
  });

  const agentIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="%23f59e0b"><path d="M19 13v6c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-6H3V9l4-6h10l4 6v4h-2zM7.5 5L5.5 9h13l-2-4h-9zM19 11H5v8h12v-8z"/><circle cx="8" cy="15" r="2" fill="currentColor"/><circle cx="16" cy="15" r="2" fill="currentColor"/></svg>',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });

  // Fetch initial order state
  useEffect(() => {
    axios.get(`/api/orders/${orderId}`)
      .then(res => {
        if (res.data.success) {
          setOrder(res.data.order);
          setOrderStatus(res.data.order.orderStatus);
          
          if (res.data.order.deliveryAgent) {
            setAgent(res.data.order.deliveryAgent);
          }
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch order details');
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  // Connect Socket.io for tracking updates
  useEffect(() => {
    if (!user) return;
    
    // Connect to Socket server (falls back to local hostname)
    const socketUrl = import.meta.env.VITE_API_URL;
    const socket = io(socketUrl);

    socket.on('connect', () => {
      console.log('Connected to socket server for tracking');
      // Join room for this specific user to receive updates
      socket.emit('join-user-room', user.id || user._id);
    });

    // Listen to real-time status and agent coordinates updates
    socket.on('order-update', (data) => {
      if (data.orderId === orderId) {
        console.log('Order update received:', data);
        setOrderStatus(data.orderStatus);
        
        if (data.agent) {
          setAgent(data.agent);
        }

        // Calculate simulated ETA details
        let predictedEta = '15 mins';
        if (data.orderStatus === 'Preparing') predictedEta = '12 mins';
        if (data.orderStatus === 'Assigned') predictedEta = '10 mins';
        if (data.orderStatus === 'Picked Up') predictedEta = '7 mins';
        if (data.orderStatus === 'On The Way') predictedEta = '4 mins';
        if (data.orderStatus === 'Near You') predictedEta = '1 min';
        if (data.orderStatus === 'Delivered') predictedEta = 'Arrived';
        setEta(predictedEta);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, user]);

  if (loading) {
    return (
      <div class="flex justify-center items-center py-20 bg-[#0b0f19]">
        <div class="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div class="max-w-md mx-auto text-center py-12 glass-panel rounded-2xl border border-white/5 space-y-4">
        <h3 class="text-rose-400 font-extrabold text-lg">Error Tracking Order</h3>
        <p class="text-xs text-gray-400">{error || 'Order tracking not available'}</p>
        <button onClick={() => navigate('/')} class="bg-indigo-600 px-4 py-2 rounded-xl text-xs font-bold">
          Go Home
        </button>
      </div>
    );
  }

  // Delivery Progress Status Index
  const statusSteps = [
    'Order Confirmed',
    'Preparing',
    'Assigned',
    'Picked Up',
    'On The Way',
    'Near You',
    'Delivered'
  ];
  const activeIndex = statusSteps.indexOf(orderStatus);

  return (
    <div class="space-y-6 max-w-5xl mx-auto">
      {/* Top Header Controls */}
      <div class="flex items-center justify-between">
        <button 
          onClick={() => navigate('/ai-search')}
          class="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft class="w-4 h-4" /> Back to Shopping
        </button>
        <span class="text-xs text-gray-500 font-mono">Order ID: #{order._id.slice(-8)}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Side: Map and Progress */}
        <div class="md:col-span-8 space-y-6">
          
          {/* Leaflet Map Frame */}
          <div class="h-[400px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-slate-950">
            {/* Map Placeholder before coordinates load or for absolute safe leaflet mount */}
            <MapContainer 
              center={[storeCoords.lat, storeCoords.lng]} 
              zoom={14} 
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="map-tiles-dark" /* Styled globally if needed, default OSM is fine */
              />
              
              {/* Central Hub Marker */}
              <Marker position={[storeCoords.lat, storeCoords.lng]} icon={storeIcon}>
                <Popup>
                  <div class="text-xs font-bold text-indigo-400">Hyperlocal Dispatch Store</div>
                </Popup>
              </Marker>

              {/* Customer Delivery Location */}
              <Marker position={[customerCoords.lat, customerCoords.lng]} icon={customerIcon}>
                <Popup>
                  <div class="text-xs font-bold text-emerald-400">Your Home</div>
                </Popup>
              </Marker>

              {/* Moving Agent Location */}
              {agent && agent.currentLocation && (
                <Marker position={[agent.currentLocation.lat, agent.currentLocation.lng]} icon={agentIcon}>
                  <Popup>
                    <div class="text-xs space-y-1">
                      <p class="font-extrabold text-amber-500">{agent.name}</p>
                      <p class="text-[10px] text-gray-400">Rider location</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Auto bounds centering */}
              <MapController 
                storeCoords={storeCoords}
                customerCoords={customerCoords}
                agentCoords={agent?.currentLocation}
              />
            </MapContainer>
          </div>

          {/* Interactive Live Progress Bar */}
          <div class="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
            <div class="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 class="text-sm font-black text-white uppercase tracking-wider">Delivery Milestones</h3>
              <span class="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                <Clock class="w-3.5 h-3.5" /> ETA: {eta}
              </span>
            </div>

            {/* Stepper list */}
            <div class="relative flex flex-col md:flex-row justify-between gap-4 md:gap-0 pl-4 md:pl-0">
              {statusSteps.map((step, idx) => {
                const isPassed = idx < activeIndex;
                const isActive = idx === activeIndex;
                const isFuture = idx > activeIndex;

                return (
                  <div key={idx} class="flex md:flex-col items-center flex-1 relative group">
                    {/* Stepper Connective Line */}
                    {idx < statusSteps.length - 1 && (
                      <div class={`hidden md:block absolute top-4 left-1/2 w-full h-[3px] z-0 ${idx < activeIndex ? 'bg-indigo-500' : 'bg-white/10'}`}></div>
                    )}

                    {/* Checkmark circle */}
                    <div class={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold z-10 transition-all duration-300 relative ${isPassed ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : isActive ? 'bg-slate-900 border-indigo-400 text-indigo-400 scale-110 shadow-lg shadow-indigo-500/10' : 'bg-slate-950/80 border-white/10 text-gray-600'}`}>
                      {isPassed ? <CheckCircle2 class="w-4 h-4" /> : idx + 1}
                      {isActive && <span class="absolute -inset-1.5 border border-indigo-500/20 rounded-full animate-ping"></span>}
                    </div>

                    <span class={`text-[10px] font-black uppercase mt-1 md:mt-3 leading-none transition-colors ${isActive ? 'text-indigo-400 font-black' : isPassed ? 'text-gray-300' : 'text-gray-600'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary Card & Agent details */}
        <div class="md:col-span-4 space-y-6">
          
          {/* Delivery Agent info */}
          <div class="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
            <h3 class="text-md font-black text-white border-b border-white/5 pb-2">Rider Profile</h3>
            
            {agent ? (
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  {/* Driver avatar simulation */}
                  <div class="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center font-black text-indigo-400 text-lg uppercase shadow-inner">
                    {agent.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div class="flex-grow">
                    <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Assigned Agent</span>
                    <h4 class="text-sm font-bold text-white leading-tight">{agent.name}</h4>
                    <span class="text-[10px] text-amber-500 font-bold flex items-center gap-0.5 mt-0.5">
                      <Star class="w-3 h-3 fill-amber-500 stroke-[3]" /> {agent.rating || '4.8'} ({agent.ratingsCount || 10} ratings)
                    </span>
                  </div>
                </div>

                <div class="space-y-2 pt-2 border-t border-white/5 text-xs text-gray-400">
                  <div class="flex items-center gap-2">
                    <Phone class="w-3.5 h-3.5 text-gray-500" />
                    <span class="font-bold text-gray-300">{agent.phone}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Truck class="w-3.5 h-3.5 text-gray-500" />
                    <span>Riding Hero Electric NYX</span>
                  </div>
                </div>

                <a 
                  href={`tel:${agent.phone}`}
                  class="w-full mt-2 flex items-center justify-center gap-2 bg-slate-900 border border-white/10 hover:border-indigo-500/30 text-white font-bold py-3 rounded-xl transition-all text-xs"
                >
                  <Phone class="w-3.5 h-3.5" /> Call Delivery Agent
                </a>
              </div>
            ) : (
              <div class="py-4 text-center space-y-2">
                <div class="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p class="text-xs text-gray-500 font-medium leading-relaxed">
                  Searching for nearest available delivery agents nearby...
                </p>
              </div>
            )}
          </div>

          {/* Delivery Checklist Summary */}
          <div class="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 class="text-md font-black text-white border-b border-white/5 pb-2">Items Summary</h3>
            <div class="space-y-3 max-h-[220px] overflow-y-auto pr-2">
              {order.products.map((item, idx) => (
                <div key={idx} class="flex justify-between items-center text-xs">
                  <div class="flex flex-col">
                    <span class="font-bold text-gray-200 line-clamp-1">{item.name}</span>
                    <span class="text-[10px] text-gray-500">Qty: {item.quantity}</span>
                  </div>
                  <span class="font-bold text-indigo-300">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div class="pt-3 border-t border-white/5 flex justify-between items-center text-xs">
              <span class="font-bold text-gray-400">Total Paid ({order.paymentMethod})</span>
              <span class="font-black text-white text-sm">₹{order.totalPrice}</span>
            </div>

            {order.paymentId && (
              <div class="text-[9px] font-mono text-gray-500 flex items-center gap-1 justify-center pt-2">
                <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
                <span>Simulated Transaction ID: {order.paymentId}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
