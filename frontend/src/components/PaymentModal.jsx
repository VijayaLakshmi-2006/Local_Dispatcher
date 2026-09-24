import React, { useState } from 'react';
import { X, Smartphone, CreditCard, Wallet, Landmark, HandCoins, AlertCircle } from 'lucide-react';

export default function PaymentModal({ isOpen, orderAmount, onClose, onSuccess }) {
  const [activeMethod, setActiveMethod] = useState('upi'); // upi, card, cod
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePay = () => {
    setError('');
    
    // Simple mock validations
    if (activeMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g. user@okaxis)');
        return;
      }
    } else if (activeMethod === 'card') {
      const { number, expiry, cvv, name } = cardDetails;
      if (number.replace(/\s/g, '').length < 16) {
        setError('Card number must be 16 digits');
        return;
      }
      if (!expiry.includes('/') || expiry.length < 5) {
        setError('Expiry must be in MM/YY format');
        return;
      }
      if (cvv.length < 3) {
        setError('CVV must be 3 or 4 digits');
        return;
      }
      if (!name.trim()) {
        setError('Please enter cardholder name');
        return;
      }
    }

    setLoading(true);

    // Simulate payment process delay (1.5 seconds)
    setTimeout(() => {
      setLoading(false);
      const fakeTxnId = `TXN${Math.floor(10000000 + Math.random() * 90000000)}`;
      onSuccess({
        paymentMethod: activeMethod.toUpperCase(),
        paymentStatus: activeMethod === 'cod' ? 'Pending' : 'Completed',
        paymentId: activeMethod === 'cod' ? null : fakeTxnId
      });
    }, 1500);
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-card border border-[#E5E7EB] flex flex-col">
        {/* Header */}
        <div class="bg-slate-900 text-white p-5 flex justify-between items-center">
          <div>
            <span class="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Merchant: Hyperlocal Delivery</span>
            <span class="text-md font-extrabold flex items-center gap-1">
              Razorpay Checkout <span class="text-xs text-[#22C55E]">• Demo Mode</span>
            </span>
          </div>
          <button onClick={onClose} class="text-slate-400 hover:text-white transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        {/* Amount bar */}
        <div class="bg-slate-50 border-b border-[#E5E7EB] px-6 py-3 flex justify-between items-center text-xs font-semibold text-[#6B7280]">
          <span>PAYMENT AMOUNT</span>
          <span class="text-[#111827] font-black text-sm">₹{orderAmount}</span>
        </div>

        {/* Content */}
        <div class="flex flex-grow min-h-[300px]">
          {/* Method selector sidebar */}
          <div class="w-1/3 border-r border-[#E5E7EB] bg-slate-50 text-[10px] sm:text-xs font-bold text-[#6B7280]">
            <button 
              onClick={() => setActiveMethod('upi')}
              class={`w-full p-4 text-left border-b border-[#E5E7EB] flex flex-col items-center sm:items-start gap-1 ${activeMethod === 'upi' ? 'bg-white text-[#22C55E] border-r-2 border-r-[#22C55E]' : ''}`}
            >
              <Smartphone class="w-4 h-4" />
              <span>UPI / App</span>
            </button>
            <button 
              onClick={() => setActiveMethod('card')}
              class={`w-full p-4 text-left border-b border-[#E5E7EB] flex flex-col items-center sm:items-start gap-1 ${activeMethod === 'card' ? 'bg-white text-[#22C55E] border-r-2 border-r-[#22C55E]' : ''}`}
            >
              <CreditCard class="w-4 h-4" />
              <span>Cards</span>
            </button>
            <button 
              onClick={() => setActiveMethod('cod')}
              class={`w-full p-4 text-left border-b border-[#E5E7EB] flex flex-col items-center sm:items-start gap-1 ${activeMethod === 'cod' ? 'bg-white text-[#22C55E] border-r-2 border-r-[#22C55E]' : ''}`}
            >
              <HandCoins class="w-4 h-4" />
              <span>Pay on Delivery</span>
            </button>
          </div>

          {/* Form details side */}
          <div class="w-2/3 p-5 flex flex-col justify-between">
            <div class="space-y-4">
              {error && (
                <div class="flex gap-1.5 p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-[11px] font-bold">
                  <AlertCircle class="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* UPI Form */}
              {activeMethod === 'upi' && (
                <div class="space-y-2">
                  <label class="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">Enter UPI ID</label>
                  <input 
                    type="text" 
                    placeholder="name@upi" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    class="w-full text-xs font-semibold p-2.5 border border-[#E5E7EB] focus:border-[#22C55E] rounded-lg focus:outline-none"
                  />
                  <span class="text-[10px] text-[#6B7280] font-semibold block">Sends a simulation payment request to your smartphone.</span>
                </div>
              )}

              {/* Card Form */}
              {activeMethod === 'card' && (
                <div class="space-y-3">
                  <div>
                    <label class="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block mb-0.5">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="4111 2222 3333 4444" 
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      class="w-full text-xs font-semibold p-2.5 border border-[#E5E7EB] focus:border-[#22C55E] rounded-lg focus:outline-none"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block mb-0.5">Expiry</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        class="w-full text-xs font-semibold p-2.5 border border-[#E5E7EB] focus:border-[#22C55E] rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label class="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block mb-0.5">CVV</label>
                      <input 
                        type="password" 
                        placeholder="•••" 
                        maxLength="4"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        class="w-full text-xs font-semibold p-2.5 border border-[#E5E7EB] focus:border-[#22C55E] rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block mb-0.5">Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="Arjun Sharma" 
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      class="w-full text-xs font-semibold p-2.5 border border-[#E5E7EB] focus:border-[#22C55E] rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* COD Info */}
              {activeMethod === 'cod' && (
                <div class="space-y-2 text-xs text-[#6B7280] leading-relaxed">
                  <p class="font-bold text-[#111827]">Cash / Pay on Delivery</p>
                  <p class="font-semibold">Confirm your order and pay our delivery rider in cash, UPI scan, or card when your shipment arrives at your door.</p>
                </div>
              )}
            </div>

            {/* Pay Button */}
            <button 
              onClick={handlePay}
              disabled={loading}
              class="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-extrabold py-3 rounded-xl transition-all shadow-sm shadow-[#22C55E]/20 text-xs uppercase tracking-wider disabled:opacity-50 mt-4"
            >
              {loading ? 'Processing Transaction...' : `PROCEED PAY (₹${orderAmount})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
