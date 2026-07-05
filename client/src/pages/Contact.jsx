import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#ffffff]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs text-[#7c562d] uppercase tracking-widest font-semibold">Get in Touch</span>
          <h2 className="text-4xl md:text-5xl font-light text-neutral-900 font-serif">Contact Us</h2>
          <p className="text-neutral-500 max-w-lg mx-auto text-sm font-light leading-relaxed">
            We would love to hear from you. Reach out for corporate events, private dining, or general inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Info & Map */}
          <div className="space-y-8">
            <div className="bg-[#fcfcfa] p-8 rounded border border-neutral-100 space-y-6 shadow-sm">
              <h3 className="text-2xl font-light font-serif text-neutral-900">Contact Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded bg-[#fcfcfa] border border-neutral-200 flex items-center justify-center text-[#7c562d] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-neutral-800 text-sm font-semibold">Address</h4>
                    <p className="text-neutral-500 text-sm mt-1">Cove Beach Road, Mirissa, Sri Lanka</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded bg-[#fcfcfa] border border-neutral-200 flex items-center justify-center text-[#7c562d] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-neutral-800 text-sm font-semibold">Phone</h4>
                    <p className="text-neutral-500 text-sm mt-1">+94 41 222 3456</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded bg-[#fcfcfa] border border-neutral-200 flex items-center justify-center text-[#7c562d] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-neutral-800 text-sm font-semibold">Email</h4>
                    <p className="text-neutral-500 text-sm mt-1">info@thecovemirissa.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Map placeholder */}
            <div className="rounded overflow-hidden border border-neutral-100 h-64 relative bg-neutral-950 flex items-center justify-center shadow-sm">
              <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')` }}></div>
              <div className="relative text-center p-6 space-y-2">
                <MapPin className="w-8 h-8 text-[#7c562d] mx-auto" />
                <span className="block text-sm font-bold text-white uppercase tracking-wider">Map Coordinates</span>
                <span className="block text-xs text-neutral-400">5.9483° N, 80.4539° E</span>
              </div>
            </div>
          </div>

          {/* Message Form */}
          <div className="bg-[#fcfcfa] p-8 md:p-10 rounded border border-neutral-100 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#7c562d] mx-auto" />
                <h3 className="text-2xl font-light font-serif text-neutral-900">Message Sent</h3>
                <p className="text-neutral-500 text-sm">
                  Thank you for contacting us, we will respond within 24 hours.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="bg-[#7c562d] hover:bg-[#634423] text-white font-medium px-6 py-2 rounded text-xs uppercase tracking-widest transition-all duration-300"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-2xl font-light font-serif text-neutral-900">Send a Message</h3>
                
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 tracking-wider uppercase">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Name"
                    className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded px-4 py-3 text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 tracking-wider uppercase">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded px-4 py-3 text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 tracking-wider uppercase">Message</label>
                  <textarea
                    rows="4"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we assist you?"
                    className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded px-4 py-3 text-sm focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#7c562d] hover:bg-[#634423] text-white font-medium py-3.5 rounded text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Send Message <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
