import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App.jsx';
import { User, Mail, Lock, Phone, UserCheck, KeyRound, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  
  // Fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (isLogin) {
        // Log In Flow
        const res = await axios.post('/api/auth/login', { email, password });
        if (res.data.success) {
          login(res.data.user, res.data.accessToken);
          navigate('/');
        }
      } else {
        // Sign Up Flow
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setSubmitting(false);
          return;
        }

        const res = await axios.post('/api/auth/register', {
          name,
          email,
          phone,
          password,
          role
        });

        if (res.data.success) {
          setSuccess('Account created successfully! Logging in...');
          setTimeout(() => {
            login(res.data.user, res.data.accessToken);
            navigate('/');
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for quick logging in for testing
  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setError('');
    setSubmitting(true);
    try {
      const res = await axios.post('/api/auth/login', {
        email: quickEmail,
        password: quickPassword
      });
      if (res.data.success) {
        login(res.data.user, res.data.accessToken);
        navigate('/');
      }
    } catch (err) {
      setError('Quick login failed. Ensure database is seeded.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div class="min-h-[80vh] flex flex-col items-center justify-center py-6 px-4">
      {/* Title */}
      <div class="text-center mb-8 flex flex-col items-center">
        <div class="flex items-center gap-2 mb-2">
          <Sparkles class="w-6 h-6 text-indigo-400 animate-pulse" />
          <h1 class="text-4xl font-extrabold tracking-tight text-white">
            Hyperlocal <span class="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Dispatcher</span>
          </h1>
        </div>
        <p class="text-gray-400 max-w-sm">AI-Powered Smart Shopping & Lightning-Fast Delivery</p>
      </div>

      {/* Main Glass Form Card */}
      <div class="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Decorative background lights */}
        <div class="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Tab Selector */}
        <div class="flex border-b border-white/10 mb-6 pb-2">
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            class={`flex-1 pb-3 text-center font-bold text-sm transition-colors duration-200 ${isLogin ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            class={`flex-1 pb-3 text-center font-bold text-sm transition-colors duration-200 ${!isLogin ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Register
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div class="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}
        {success && (
          <div class="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            {success}
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleAuth} class="space-y-4">
          {!isLogin && (
            <div class="space-y-1">
              <label class="text-xs text-gray-400 font-bold uppercase tracking-wider pl-1">Name</label>
              <div class="relative">
                <User class="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  required
                  placeholder="Enter full name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  class="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm"
                />
              </div>
            </div>
          )}

          <div class="space-y-1">
            <label class="text-xs text-gray-400 font-bold uppercase tracking-wider pl-1">Email</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              <input 
                type="email" 
                required
                placeholder="Enter email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                class="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm"
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div class="space-y-1">
                <label class="text-xs text-gray-400 font-bold uppercase tracking-wider pl-1">Phone Number</label>
                <div class="relative">
                  <Phone class="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input 
                    type="tel" 
                    required
                    placeholder="Enter phone number" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    class="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-xs text-gray-400 font-bold uppercase tracking-wider pl-1">Register As</label>
                <div class="relative">
                  <UserCheck class="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    class="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm appearance-none bg-slate-950/90"
                  >
                    <option value="customer" class="bg-[#0b0f19]">Customer (Shopping Assistant)</option>
                    <option value="delivery_agent" class="bg-[#0b0f19]">Delivery Agent (Dispatcher)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div class="space-y-1">
            <label class="text-xs text-gray-400 font-bold uppercase tracking-wider pl-1">Password</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              <input 
                type="password" 
                required
                placeholder="Minimum 8 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                class="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm"
              />
            </div>
          </div>

          {!isLogin && (
            <div class="space-y-1">
              <label class="text-xs text-gray-400 font-bold uppercase tracking-wider pl-1">Confirm Password</label>
              <div class="relative">
                <Lock class="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required
                  placeholder="Repeat your password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  class="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm"
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={submitting}
            class="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 active:translate-y-0.5 hover:-translate-y-0.5 transition-all duration-200 text-sm"
          >
            {submitting ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Demo Quick Logins Section */}
        <div class="mt-8 pt-6 border-t border-white/5 space-y-3">
          <div class="flex items-center gap-1.5 justify-center text-[10px] uppercase tracking-wider font-extrabold text-gray-500">
            <KeyRound class="w-3.5 h-3.5 text-gray-500" />
            <span>Developer Sandbox Quick Logins</span>
          </div>
          
          <div class="grid grid-cols-3 gap-2">
            <button 
              onClick={() => handleQuickLogin('user@delivery.com', 'user12345')}
              class="text-[10px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 py-2 rounded-lg transition-all"
            >
              Customer
            </button>
            <button 
              onClick={() => handleQuickLogin('rahul@delivery.com', 'agent12345')}
              class="text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 py-2 rounded-lg transition-all"
            >
              Delivery Agent
            </button>
            <button 
              onClick={() => handleQuickLogin('admin@delivery.com', 'admin12345')}
              class="text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-2 rounded-lg transition-all"
            >
              System Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
