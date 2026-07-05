import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Instagram, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#ffffff] border-t border-neutral-100 py-16 text-neutral-500">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col items-center justify-center space-y-8 text-center">
        {/* Brand name */}
        <h3 className="text-xl font-bold tracking-widest text-[#7c562d] uppercase">
          THE COVE MIRISSA
        </h3>

        {/* Footer Links */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-xs tracking-wider font-medium text-neutral-600 uppercase">
          <Link to="/privacy" className="hover:text-[#7c562d] transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-[#7c562d] transition-colors">Terms of Service</Link>
          <Link to="/careers" className="hover:text-[#7c562d] transition-colors">Careers</Link>
          <Link to="/contact" className="hover:text-[#7c562d] transition-colors">Contact Us</Link>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <a href="#" className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-[#7c562d] hover:border-[#7c562d] transition-all">
            <Globe className="w-4 h-4" />
          </a>
          <a href="#" className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-[#7c562d] hover:border-[#7c562d] transition-all">
            <Instagram className="w-4 h-4" />
          </a>
          <a href="#" className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-[#7c562d] hover:border-[#7c562d] transition-all">
            <Shield className="w-4 h-4" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-[10px] tracking-widest text-neutral-400 uppercase pt-4">
          <p>&copy; {new Date().getFullYear()} The Cove Mirissa. Coastal Opulence Redefined.</p>
        </div>
      </div>
    </footer>
  );
}
