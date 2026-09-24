import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Mail, Lock, User, Phone, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { registerUser, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer'); // customer, delivery_agent
  
  const [strength, setStrength] = useState(0); // 0 to 4
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCredentialResponse = async (response) => {
    setSubmitting(true);
    try {
      const data = await loginWithGoogle({ token: response.credential });
      if (data.success) {
        toast.success(`Account created with Google as ${data.user.name}`);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google Oauth Signup error:', err);
      toast.error(err.response?.data?.message || 'Google signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) return;

    let checkInterval;
    const initGoogle = () => {
      if (window.google) {
        clearInterval(checkInterval);
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse,
            cancel_on_tap_outside: false
          });

          const btnDiv = document.getElementById('google-signup-div');
          if (btnDiv) {
            window.google.accounts.id.renderButton(btnDiv, {
              theme: 'outline',
              size: 'large',
              width: btnDiv.offsetWidth || 384,
              text: 'continue_with',
              shape: 'rectangular'
            });
          }

          window.google.accounts.id.prompt();
        } catch (err) {
          console.error('Error rendering Google Sign-In button:', err);
        }
      }
    };

    checkInterval = setInterval(initGoogle, 100);
    initGoogle();

    return () => clearInterval(checkInterval);
  }, []);

  // Password Strength Calculator
  useEffect(() => {
    let score = 0;
    if (!password) {
      setStrength(0);
      return;
    }
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(score);
  }, [password]);

  const getStrengthLabel = () => {
    switch (strength) {
      case 0: return { text: 'Empty', color: 'bg-slate-200 text-slate-500' };
      case 1: return { text: 'Weak', color: 'bg-rose-500 text-white' };
      case 2: return { text: 'Fair', color: 'bg-amber-500 text-white' };
      case 3: return { text: 'Good', color: 'bg-blue-500 text-white' };
      case 4: return { text: 'Strong', color: 'bg-[#22C55E] text-white' };
      default: return { text: 'Empty', color: 'bg-slate-200 text-slate-500' };
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setSubmitting(true);
    try {
      const data = await registerUser({ name, email, phone, password, role });
      if (data.success) {
        toast.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setSubmitting(true);
    try {
      const simulatedGoogleData = {
        name: "Google Signup",
        email: `google_${Math.floor(Math.random() * 10000)}@gmail.com`,
        googleId: `google_oauth_${Math.floor(100000 + Math.random() * 900000)}`,
        imageUrl: "https://lh3.googleusercontent.com/a/default-user"
      };
      const data = await loginWithGoogle(simulatedGoogleData);
      if (data.success) {
        toast.success(`Account created with Google as ${data.user.name}`);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error('Google registration simulation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div class="min-h-[75vh] flex flex-col items-center justify-center py-6 px-4">
      {/* Platform Title */}
      <div class="text-center mb-6 flex flex-col items-center">
        <div class="flex items-center gap-2 mb-1.5">
          <Sparkles class="w-6 h-6 text-[#22C55E]" />
          <h1 class="text-3xl font-black text-[#111827] tracking-tight">
            InstaDispatch
          </h1>
        </div>
        <p class="text-xs text-[#6B7280] font-bold uppercase tracking-wider">AI-Powered Smart Shopping & Hyperlocal Delivery</p>
      </div>

      {/* Signup Card */}
      <div class="w-full max-w-md bg-white border border-[#E5E7EB] p-8 rounded-2xl shadow-card space-y-6">
        <div class="text-center">
          <h2 class="text-lg font-extrabold text-[#111827] mb-1">Create an account</h2>
          <p class="text-xs text-[#6B7280] font-semibold">
            Already have an account?{' '}
            <Link to="/login" class="text-[#22C55E] hover:underline font-extrabold">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleRegister} class="space-y-4">
          {/* Name */}
          <div class="space-y-1">
            <label class="text-[10px] text-[#6B7280] font-extrabold uppercase tracking-wider pl-0.5">Full Name</label>
            <div class="relative">
              <User class="absolute left-3 top-3 w-4.5 h-4.5 text-[#6B7280]" />
              <input 
                type="text"
                required
                placeholder="Arjun Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                class="w-full border border-[#E5E7EB] focus:border-[#22C55E] text-xs font-semibold rounded-xl py-3 pl-10 pr-4 focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* Email */}
          <div class="space-y-1">
            <label class="text-[10px] text-[#6B7280] font-extrabold uppercase tracking-wider pl-0.5">Email address</label>
            <div class="relative">
              <Mail class="absolute left-3 top-3 w-4.5 h-4.5 text-[#6B7280]" />
              <input 
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                class="w-full border border-[#E5E7EB] focus:border-[#22C55E] text-xs font-semibold rounded-xl py-3 pl-10 pr-4 focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* Phone */}
          <div class="space-y-1">
            <label class="text-[10px] text-[#6B7280] font-extrabold uppercase tracking-wider pl-0.5">Phone Number</label>
            <div class="relative">
              <Phone class="absolute left-3 top-3 w-4.5 h-4.5 text-[#6B7280]" />
              <input 
                type="tel"
                required
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={submitting}
                class="w-full border border-[#E5E7EB] focus:border-[#22C55E] text-xs font-semibold rounded-xl py-3 pl-10 pr-4 focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* Role selection */}
          <div class="space-y-1">
            <label class="text-[10px] text-[#6B7280] font-extrabold uppercase tracking-wider pl-0.5">Register as</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={submitting}
              class="w-full border border-[#E5E7EB] focus:border-[#22C55E] text-xs font-semibold rounded-xl py-3 px-4 focus:outline-none disabled:opacity-60 bg-white"
            >
              <option value="customer">Customer (Buy groceries)</option>
              <option value="delivery_agent">Delivery Agent (Rider dispatcher)</option>
            </select>
          </div>

          {/* Password */}
          <div class="space-y-1">
            <label class="text-[10px] text-[#6B7280] font-extrabold uppercase tracking-wider pl-0.5">Password</label>
            <div class="relative">
              <Lock class="absolute left-3 top-3 w-4.5 h-4.5 text-[#6B7280]" />
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                class="w-full border border-[#E5E7EB] focus:border-[#22C55E] text-xs font-semibold rounded-xl py-3 pl-10 pr-4 focus:outline-none disabled:opacity-60"
              />
            </div>
            
            {/* Strength meter bar */}
            {password && (
              <div class="space-y-1 pt-1.5 px-0.5">
                <div class="flex justify-between items-center text-[9px] font-bold uppercase text-[#6B7280]">
                  <span>Password Strength</span>
                  <span class={`px-1.5 py-0.25 rounded font-black ${getStrengthLabel().color}`}>
                    {getStrengthLabel().text}
                  </span>
                </div>
                <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    class={`h-full transition-all duration-300 ${strength === 1 ? 'w-1/4 bg-rose-500' : strength === 2 ? 'w-2/4 bg-amber-500' : strength === 3 ? 'w-3/4 bg-blue-500' : strength === 4 ? 'w-full bg-[#22C55E]' : 'w-0 bg-slate-200'}`}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div class="space-y-1">
            <label class="text-[10px] text-[#6B7280] font-extrabold uppercase tracking-wider pl-0.5">Confirm Password</label>
            <div class="relative">
              <Lock class="absolute left-3 top-3 w-4.5 h-4.5 text-[#6B7280]" />
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                class="w-full border border-[#E5E7EB] focus:border-[#22C55E] text-xs font-semibold rounded-xl py-3 pl-10 pr-4 focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            disabled={submitting}
            class="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-sm shadow-[#22C55E]/20 text-xs uppercase tracking-wider disabled:opacity-60"
          >
            {submitting ? 'Registering...' : 'Register'}
          </button>

          {/* Google Login */}
          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <div class="space-y-2">
              <div id="google-signup-div" class="w-full flex justify-center min-h-[44px]"></div>
              <p class="text-[10px] text-[#6B7280] font-semibold text-center">
                Using official Google Sign-In. Check One Tap in the top right.
              </p>
            </div>
          ) : (
            <div class="space-y-1">
              <button 
                type="button"
                onClick={handleGoogleSignup}
                disabled={submitting}
                class="w-full bg-white border border-[#E5E7EB] hover:bg-slate-50 text-[#111827] font-extrabold py-3 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.81-6.277-6.277 0-3.466 2.81-6.277 6.277-6.277 1.503 0 2.873.53 3.96 1.402l2.967-2.967C18.847 2.44 15.772 1.5 12.24 1.5c-5.799 0-10.5 4.7-10.5 10.5s4.701 10.5 10.5 10.5c5.789 0 10.25-4.067 10.25-10.285 0-.616-.067-1.16-.183-1.63H12.24z"/>
                </svg>
                <span>Continue with Google (Sandbox)</span>
              </button>
              <p class="text-[10px] text-[#6B7280] font-semibold text-center">
                Tip: Set VITE_GOOGLE_CLIENT_ID in your env file to enable real Google Sign-In.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
