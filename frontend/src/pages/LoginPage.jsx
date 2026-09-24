import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Mail, Lock, KeyRound, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { loginUser, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const handleCredentialResponse = async (response) => {
    setSubmitting(true);
    try {
      const data = await loginWithGoogle({ token: response.credential });
      if (data.success) {
        toast.success(`Logged in with Google as ${data.user.name}`);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google Oauth Login error:', err);
      toast.error(err.response?.data?.message || 'Google sign-in failed');
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

          const btnDiv = document.getElementById('google-signin-div');
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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setSubmitting(true);
    try {
      const data = await loginUser({ email, password });
      if (data.success) {
        toast.success(`Welcome back, ${data.user.name}!`);
        // Redirect to dashboard (DashboardPage handles role routing)
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Invalid credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    try {
      const simulatedGoogleData = {
        name: "Google Guest",
        email: "googleguest@gmail.com",
        googleId: `google_${Math.floor(100000 + Math.random() * 900000)}`,
        imageUrl: "https://lh3.googleusercontent.com/a/default-user"
      };
      const data = await loginWithGoogle(simulatedGoogleData);
      if (data.success) {
        toast.success(`Logged in with Google as ${data.user.name}`);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error('Google sign-in simulation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword, roleName) => {
    setSubmitting(true);
    try {
      const data = await loginUser({ email: quickEmail, password: quickPassword });
      if (data.success) {
        toast.success(`Logged in as Demo ${roleName}`);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(`Demo login failed. Make sure DB is seeded and running.`);
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

      {/* Login Card */}
      <div class="w-full max-w-md bg-white border border-[#E5E7EB] p-8 rounded-2xl shadow-card space-y-6">
        <div class="text-center">
          <h2 class="text-lg font-extrabold text-[#111827] mb-1">Sign in to your account</h2>
          <p class="text-xs text-[#6B7280] font-semibold">
            Or{' '}
            <Link to="/signup" class="text-[#22C55E] hover:underline font-extrabold">
              create a new account
            </Link>
          </p>
        </div>

        <form onSubmit={handleLogin} class="space-y-4">
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
          </div>

          {/* Extra options */}
          <div class="flex items-center justify-between text-[11px] font-bold text-[#6B7280] select-none">
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                class="accent-[#22C55E]"
              />
              <span>Remember me</span>
            </label>
            <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Password reset link simulated'); }} class="hover:text-[#22C55E] transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            disabled={submitting}
            class="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-sm shadow-[#22C55E]/20 text-xs uppercase tracking-wider disabled:opacity-60"
          >
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Google Login */}
          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <div class="space-y-2">
              <div id="google-signin-div" class="w-full flex justify-center min-h-[44px]"></div>
              <p class="text-[10px] text-[#6B7280] font-semibold text-center">
                Using official Google Sign-In. Check One Tap in the top right.
              </p>
            </div>
          ) : (
            <div class="space-y-1">
              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={submitting}
                class="w-full bg-white border border-[#E5E7EB] hover:bg-slate-50 text-[#111827] font-extrabold py-3 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.81-6.277-6.277 0-3.466 2.81-6.277 6.277-6.277 1.503 0 2.873.53 3.96 1.402l2.967-2.967C18.847 2.44 15.772 1.5 12.24 1.5c-5.799 0-10.5 4.7-10.5 10.5s4.701 10.5 10.5 10.5c5.789 0 10.25-4.067 10.25-10.285 0-.616-.067-1.16-.183-1.63H12.24z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
              <p class="text-[10px] text-[#6B7280] font-semibold text-center">
                Tip: Set VITE_GOOGLE_CLIENT_ID in your env file to enable real Google Sign-In.
              </p>
            </div>
          )}
        </form>

        {/* Sandbox accounts */}
        <div class="pt-6 border-t border-[#E5E7EB] space-y-3">
          <div class="flex items-center gap-1.5 justify-center text-[10px] uppercase tracking-wider font-extrabold text-[#6B7280]">
            <KeyRound class="w-3.5 h-3.5" />
            <span>Sandbox Quick Accounts</span>
          </div>
          
          <div class="grid grid-cols-3 gap-2">
            <button 
              type="button"
              onClick={() => handleQuickLogin('customer@demo.com', 'Demo@123', 'Customer')}
              class="text-[10px] font-bold bg-[#F8FAFC] hover:bg-[#22C55E]/5 text-[#6B7280] hover:text-[#22C55E] border border-[#E5E7EB] hover:border-[#22C55E]/20 py-2.5 rounded-lg transition-all"
            >
              Customer
            </button>
            <button 
              type="button"
              onClick={() => handleQuickLogin('agent@demo.com', 'Demo@123', 'Agent')}
              class="text-[10px] font-bold bg-[#F8FAFC] hover:bg-[#22C55E]/5 text-[#6B7280] hover:text-[#22C55E] border border-[#E5E7EB] hover:border-[#22C55E]/20 py-2.5 rounded-lg transition-all"
            >
              Agent
            </button>
            <button 
              type="button"
              onClick={() => handleQuickLogin('admin@demo.com', 'Demo@123', 'Admin')}
              class="text-[10px] font-bold bg-[#F8FAFC] hover:bg-[#22C55E]/5 text-[#6B7280] hover:text-[#22C55E] border border-[#E5E7EB] hover:border-[#22C55E]/20 py-2.5 rounded-lg transition-all"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
