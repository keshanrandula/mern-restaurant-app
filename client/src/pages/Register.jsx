import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Save user to localStorage
        localStorage.setItem('user', JSON.stringify(data));
        // Redirect and refresh navbar
        navigate('/');
        window.location.reload();
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-[#ffffff] px-6">
      <div className="w-full max-w-md bg-[#fcfcfa] p-8 md:p-10 rounded border border-neutral-100 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] text-[#7c562d] uppercase tracking-[0.2em] font-semibold">Join The Cove</span>
          <h2 className="text-3xl font-light font-serif text-neutral-900">Create Account</h2>
        </div>

        {error && (
          <div className="text-xs text-red-500 bg-red-50 border border-red-200 px-4 py-2.5 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-white border border-neutral-200 focus:border-amber-700/50 focus:ring-4 focus:ring-amber-700/10 rounded pl-10 pr-4 py-3 text-sm focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full bg-white border border-neutral-200 focus:border-amber-700/50 focus:ring-4 focus:ring-amber-700/10 rounded pl-10 pr-4 py-3 text-sm focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-white border border-neutral-200 focus:border-amber-700/50 focus:ring-4 focus:ring-amber-700/10 rounded pl-10 pr-4 py-3 text-sm focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7c562d] hover:bg-[#634423] text-white font-medium py-3 rounded text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating account...' : 'Sign Up'} <UserPlus className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#7c562d] hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
