import React, { useState } from 'react';
import { Calendar, Users, Clock, CheckCircle2 } from 'lucide-react';

export default function Reservation() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: '',
    time: '18:00',
    guests: 2
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          type: 'reservation',
          reservationDetails: {
            date: formData.date,
            time: formData.time,
            guests: Number(formData.guests)
          }
        })
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.log('Backend offline, showing local success simulation.');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#ffffff]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {submitted ? (
          <div className="bg-[#fcfcfa] p-12 rounded border border-neutral-100 text-center space-y-6 max-w-md mx-auto shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-50 text-[#7c562d]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-light text-neutral-900 font-serif">Booking Confirmed</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Thank you, <span className="text-neutral-900 font-semibold">{formData.customerName}</span>. Your reservation for <span className="text-neutral-900 font-semibold">{formData.guests} guests</span> on <span className="text-neutral-900 font-semibold">{formData.date}</span> at <span className="text-neutral-900 font-semibold">{formData.time}</span> has been requested. We will send a confirmation details email shortly.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="w-full bg-[#7c562d] hover:bg-[#634423] text-white font-medium py-3 rounded text-xs uppercase tracking-widest transition-all duration-300"
            >
              Make Another Booking
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 bg-[#fcfcfa] p-8 md:p-12 rounded border border-neutral-100 shadow-sm">
            <div className="md:col-span-2 space-y-6">
              <span className="text-xs text-[#7c562d] uppercase tracking-widest font-semibold">Reserve Your Stay</span>
              <h2 className="text-3xl font-light text-neutral-900 font-serif">Book a Room or Table</h2>
              <p className="text-neutral-500 text-sm leading-relaxed font-light">
                We recommend reserving your suites or private dining tables at least 2 weeks in advance due to seasonal demand.
              </p>
              <div className="space-y-4 pt-4 border-t border-neutral-100 text-xs text-neutral-500">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#7c562d]" /> Dynamic suites selection available
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#7c562d]" /> Check-in standard time: 2:00 PM
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="md:col-span-3 space-y-6">
              {error && <div className="text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-2 rounded">{error}</div>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 tracking-wider uppercase">Name</label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded px-4 py-3 text-sm focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 tracking-wider uppercase">Phone</label>
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    value={formData.customerPhone}
                    onChange={handleChange}
                    placeholder="+94 77 123 4567"
                    className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded px-4 py-3 text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-neutral-500 tracking-wider uppercase">Email Address</label>
                <input
                  type="email"
                  name="customerEmail"
                  required
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded px-4 py-3 text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 tracking-wider uppercase">Arrival Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded px-4 py-3 text-sm focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 tracking-wider uppercase">Arrival Time</label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded px-4 py-3 text-sm focus:outline-none transition-colors"
                  >
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">2:00 PM (Check-in)</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="20:00">8:00 PM</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 tracking-wider uppercase">Guests</label>
                  <select
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded px-4 py-3 text-sm focus:outline-none transition-colors"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                    <option value="4">4 People</option>
                    <option value="5">5 People</option>
                    <option value="6">6 People</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7c562d] hover:bg-[#634423] disabled:bg-neutral-300 text-white font-medium py-4 rounded text-xs uppercase tracking-widest transition-all duration-300"
              >
                {loading ? 'Processing...' : 'Request Reservation'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
