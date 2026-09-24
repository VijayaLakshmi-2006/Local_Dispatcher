import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { placeOrder } from '../store/orderSlice.js';
import { clearCartLocal } from '../store/cartSlice.js';
import PaymentModal from '../components/PaymentModal.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { CreditCard, ShieldCheck, ShoppingBag, Truck, CheckCircle, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, totalPrice } = useSelector((state) => state.cart);
  const address = location.state?.address;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null); // { orderId, txnId, paymentMethod }

  // Redirect back if address is missing
  useEffect(() => {
    if (!address) {
      toast.error('Session expired. Please select delivery address again.');
      navigate('/checkout');
    } else {
      // Auto-open checkout modal on load for smooth checkout experience
      setIsModalOpen(true);
    }
  }, [address, navigate]);

  if (!address) return null;

  const deliveryFee = totalPrice > 500 ? 0 : 30;
  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = Math.round(totalPrice + deliveryFee + taxes);

  const handlePaymentSuccess = async (paymentDetails) => {
    setIsModalOpen(false);
    setPlacing(true);
    
    try {
      // Place order in backend database collection
      const res = await dispatch(placeOrder({
        address,
        paymentMethod: paymentDetails.paymentMethod
      })).unwrap();
      
      // Update with payment simulator details in backend if needed
      // Since placeOrder handles simulated payments already, we just extract details
      setSuccessDetails({
        orderId: res._id,
        txnId: paymentDetails.paymentId || 'COD_PENDING',
        paymentMethod: paymentDetails.paymentMethod
      });
      
      // Clear shopping cart state locally since order placed
      dispatch(clearCartLocal());
      toast.success('Order placed and dispatch engine triggered!');

    } catch (err) {
      toast.error('Server error placing your order.');
      navigate('/checkout');
    } finally {
      setPlacing(false);
    }
  };

  if (placing) return <LoadingSpinner fullPage message="Processing transaction and dispatching agent..." />;

  return (
    <div class="max-w-md mx-auto py-8">
      {/* If payment is not yet completed, show checkout placeholder screen */}
      {!successDetails ? (
        <div class="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-soft space-y-6">
          <div class="flex items-center gap-2 border-b pb-3.5">
            <button onClick={() => navigate('/checkout')} class="text-[#6B7280] hover:text-[#111827]"><ChevronLeft class="w-5 h-5" /></button>
            <h3 class="font-extrabold text-sm text-[#111827] uppercase tracking-wider">Checkout Payment</h3>
          </div>

          <div class="space-y-4 text-xs font-semibold text-[#6B7280]">
            {/* Amount display */}
            <div class="bg-slate-50 border rounded-2xl p-5 text-center space-y-1">
              <span class="text-[10px] text-[#6B7280] font-extrabold uppercase tracking-wider block">Total Payable</span>
              <p class="text-3xl font-black text-[#111827]">₹{grandTotal}</p>
              <span class="text-[9px] text-[#22C55E] font-black uppercase flex items-center justify-center gap-0.5"><ShieldCheck class="w-3.5 h-3.5" /> 256-bit SSL secure</span>
            </div>

            {/* Address snippet */}
            <div class="space-y-1">
              <span class="text-[10px] font-extrabold uppercase tracking-wider block pl-0.5">Delivering to</span>
              <p class="text-[#111827] font-bold">{address.houseNumber}, {address.street}</p>
              <p class="text-[11px]">{address.city}, {address.pincode}</p>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            class="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-extrabold py-4 rounded-xl transition-all shadow-sm shadow-[#22C55E]/20 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <CreditCard class="w-4 h-4" /> Open Payment Simulator
          </button>
        </div>
      ) : (
        /* Payment Success Panel screen */
        <div class="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-card text-center space-y-6">
          <div class="w-16 h-16 bg-[#22C55E]/10 text-[#22C55E] border-2 border-[#22C55E]/15 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle class="w-10 h-10 stroke-[2.5]" />
          </div>

          <div class="space-y-1.5">
            <h2 class="text-xl font-black text-[#111827] uppercase tracking-wide">Payment Successful</h2>
            <p class="text-xs text-[#6B7280] font-semibold leading-relaxed max-w-xs mx-auto">
              Your transaction has been settled. The hyperlocal nearest-agent dispatcher is preparing your parcel.
            </p>
          </div>

          {/* Transaction metadata */}
          <div class="p-4 bg-slate-50 border rounded-2xl text-xs font-semibold text-[#6B7280] text-left space-y-2 font-mono">
            <div class="flex justify-between">
              <span>Order ID:</span>
              <span class="text-[#111827] font-bold">#{successDetails.orderId}</span>
            </div>
            <div class="flex justify-between">
              <span>Transaction ID:</span>
              <span class="text-[#111827] font-bold">{successDetails.txnId}</span>
            </div>
            <div class="flex justify-between">
              <span>Method:</span>
              <span class="text-[#22C55E] font-black">{successDetails.paymentMethod}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div class="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate(`/tracking/${successDetails.orderId}`)}
              class="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-sm shadow-[#22C55E]/20 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Truck class="w-4 h-4" /> Track Order
            </button>
            <button 
              onClick={() => navigate('/orders')}
              class="w-full bg-white border border-[#E5E7EB] hover:bg-slate-50 text-[#111827] font-extrabold py-3.5 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <ShoppingBag class="w-4 h-4" /> View Orders
            </button>
          </div>
        </div>
      )}

      {/* Demo Razorpay modal */}
      <PaymentModal 
        isOpen={isModalOpen}
        orderAmount={grandTotal}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
