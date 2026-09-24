import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, rateOrder, updateOrderStatusLocal } from '../store/orderSlice.js';
import { useSocket } from '../hooks/useSocket.js';
import OrderCard from '../components/OrderCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { X, Star, Sparkles, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  const [activeTab, setActiveTab] = useState('active'); // active, delivered, cancelled

  // Listen for global order updates for this user
  useSocket(null, (data) => {
    dispatch(updateOrderStatusLocal(data));
  }, null);
  
  // Rating Modal States
  const [ratingOrderId, setRatingOrderId] = useState(null);
  const [agentRating, setAgentRating] = useState(5);
  const [agentReview, setAgentReview] = useState('');
  const [experienceRating, setExperienceRating] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleOpenRatingModal = (orderId) => {
    setRatingOrderId(orderId);
    setAgentRating(5);
    setAgentReview('');
    setExperienceRating(5);
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (!ratingOrderId) return;

    setSubmittingRating(true);
    dispatch(rateOrder({
      orderId: ratingOrderId,
      ratingData: { agentRating, agentReview, experienceRating }
    }))
      .unwrap()
      .then(() => {
        toast.success('Ratings submitted! Thank you.');
        setRatingOrderId(null);
      })
      .catch(() => {
        toast.error('Failed to save reviews');
      })
      .finally(() => {
        setSubmittingRating(false);
      });
  };

  // Filter orders based on active tab
  const getFilteredOrders = () => {
    if (activeTab === 'active') {
      return orders.filter(o => !['Delivered', 'Cancelled'].includes(o.orderStatus));
    }
    if (activeTab === 'delivered') {
      return orders.filter(o => o.orderStatus === 'Delivered');
    }
    return orders.filter(o => o.orderStatus === 'Cancelled'); // cancelled
  };

  const filteredOrders = getFilteredOrders();

  if (loading && orders.length === 0) return <LoadingSpinner message="Loading orders..." />;

  return (
    <div class="space-y-6 py-4 max-w-4xl mx-auto">
      {/* Page Title */}
      <div class="pl-1">
        <h2 class="text-2xl font-black text-[#111827]">Order History</h2>
        <p class="text-xs text-[#6B7280] font-semibold mt-0.5">Track your deliveries and past culinary supplies checklist.</p>
      </div>

      {/* Tabs */}
      <div class="flex border-b border-[#E5E7EB] gap-2 font-extrabold text-xs">
        {[
          { id: 'active', label: 'Active Deliveries' },
          { id: 'delivered', label: 'Completed Rides' },
          { id: 'cancelled', label: 'Cancelled' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            class={`pb-3 px-4 border-b-2 uppercase tracking-wider transition-colors ${activeTab === t.id ? 'text-[#22C55E] border-[#22C55E]' : 'text-[#6B7280] border-transparent hover:text-[#111827]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders List Grid */}
      {filteredOrders.length === 0 ? (
        <div class="py-6">
          <EmptyState 
            type="orders"
            title={`No ${activeTab} orders`}
            message={`We couldn't find any orders in your ${activeTab} registration history.`}
          />
        </div>
      ) : (
        <div class="space-y-5">
          {filteredOrders.map((order) => (
            <OrderCard 
              key={order._id}
              order={order}
              onRateClick={handleOpenRatingModal}
            />
          ))}
        </div>
      )}

      {/* Review & Ratings Modal */}
      {ratingOrderId && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-card border border-[#E5E7EB]">
            {/* Header */}
            <div class="bg-slate-50 border-b border-[#E5E7EB] p-5 flex justify-between items-center">
              <h3 class="font-extrabold text-sm text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles class="w-4.5 h-4.5 text-[#22C55E]" /> Rate Your Experience
              </h3>
              <button onClick={() => setRatingOrderId(null)} class="text-[#6B7280] hover:text-[#111827]">
                <X class="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRatingSubmit} class="p-6 space-y-5 text-xs font-semibold text-[#6B7280]">
              {/* Agent star rating */}
              <div class="space-y-2 text-center">
                <label class="text-[10px] font-extrabold uppercase tracking-wider block">Rate Delivery Agent</label>
                <div class="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setAgentRating(star)}
                      class="text-2xl transition-transform hover:scale-110"
                    >
                      <Star class={`w-7 h-7 stroke-none ${star <= agentRating ? 'fill-[#F59E0B]' : 'fill-slate-100 border'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Comments */}
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold uppercase tracking-wider block pl-0.5">Write a Review for Rider</label>
                <div class="relative">
                  <MessageSquare class="absolute left-3.5 top-3.5 w-4 h-4 text-[#6B7280]" />
                  <textarea
                    placeholder="He was polite and delivered the parcel safely..."
                    value={agentReview}
                    onChange={(e) => setAgentReview(e.target.value)}
                    class="w-full text-xs font-semibold border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#22C55E] resize-none h-20 leading-relaxed"
                  />
                </div>
              </div>

              {/* App experience rating */}
              <div class="space-y-2 text-center border-t border-[#E5E7EB] pt-4">
                <label class="text-[10px] font-extrabold uppercase tracking-wider block">Rate App Experience</label>
                <div class="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setExperienceRating(star)}
                      class="text-2xl transition-transform hover:scale-110"
                    >
                      <Star class={`w-7 h-7 stroke-none ${star <= experienceRating ? 'fill-[#F59E0B]' : 'fill-slate-100 border'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submittingRating}
                class="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-sm shadow-[#22C55E]/20 text-xs uppercase tracking-wider disabled:opacity-60"
              >
                {submittingRating ? 'Saving Reviews...' : 'Submit Ratings'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
