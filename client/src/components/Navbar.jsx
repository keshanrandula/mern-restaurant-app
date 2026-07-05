import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, UtensilsCrossed, LogOut, User, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { totalItems, toggleCart } = useCart();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const isHomePage = location.pathname === '/';
  const isLight = !isHomePage || isScrolled;

  useEffect(() => {
    // Check if user is logged in
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      setUser(JSON.parse(loggedUser));
    }

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Reservations', path: '/reservation' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isLight 
        ? 'bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-sm' 
        : 'bg-black/20 backdrop-blur-sm border-b border-white/10'
    }`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <UtensilsCrossed className={`w-6 h-6 group-hover:rotate-12 transition-transform duration-300 ${
              isLight ? 'text-amber-700' : 'text-amber-500'
            }`} />
            <span className={`text-lg font-bold tracking-widest uppercase transition-colors duration-300 ${
              isLight ? 'text-neutral-900' : 'text-white'
            }`}>
              THE COVE MIRISSA
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs tracking-widest uppercase transition-colors duration-300 ${
                  isActive(link.path)
                    ? (isLight ? 'text-amber-700 font-semibold' : 'text-amber-500 font-semibold')
                    : (isLight ? 'text-neutral-600 hover:text-amber-700' : 'text-neutral-200 hover:text-white')
                }`}
              >
                {link.name}
              </Link>
            ))}

            {user && user.isAdmin && (
              <Link
                to="/admin"
                className={`text-xs tracking-widest uppercase transition-colors duration-300 ${
                  isActive('/admin')
                    ? (isLight ? 'text-amber-700 font-semibold' : 'text-amber-500 font-semibold')
                    : (isLight ? 'text-neutral-600 hover:text-amber-700' : 'text-neutral-200 hover:text-white')
                }`}
              >
                Dashboard
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className={`text-xs font-medium flex items-center gap-1.5 border px-3 py-1 rounded transition-all duration-300 cursor-pointer ${
                    isLight 
                      ? 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-amber-700/50 hover:bg-neutral-100' 
                      : 'border-white/10 bg-white/5 text-neutral-300 hover:border-amber-500/50 hover:bg-white/10'
                  }`}
                >
                  <User className={`w-3.5 h-3.5 ${isLight ? 'text-amber-700' : 'text-amber-500'}`} /> {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className={`p-2 transition-colors ${
                    isLight ? 'text-neutral-500 hover:text-red-600' : 'text-neutral-300 hover:text-red-400'
                  }`}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`text-xs tracking-widest uppercase transition-colors duration-300 ${
                  isLight ? 'text-neutral-600 hover:text-amber-700' : 'text-neutral-200 hover:text-amber-500'
                }`}
              >
                Login
              </Link>
            )}

            {/* Cart Button */}
            <button 
              onClick={toggleCart} 
              className={`relative p-2 transition-colors duration-300 ${
                isLight ? 'text-neutral-600 hover:text-amber-700' : 'text-neutral-200 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 bg-amber-700 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border ${
                  isLight ? 'border-white' : 'border-neutral-950'
                }`}>
                  {totalItems}
                </span>
              )}
            </button>

            <Link
              to="/reservation"
              className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-2 rounded text-xs tracking-widest uppercase transition-all duration-300"
            >
              Book a Room
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 transition-colors ${
                isLight ? 'text-neutral-600 hover:text-neutral-900' : 'text-neutral-200 hover:text-white'
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className={`md:hidden border-t px-6 py-6 space-y-4 transition-colors ${
          isLight 
            ? 'bg-white/95 backdrop-blur-md border-neutral-100 shadow-sm' 
            : 'bg-neutral-900/95 backdrop-blur-md border-white/5'
        }`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block text-xs tracking-widest uppercase transition-colors duration-300 ${
                isActive(link.path)
                  ? (isLight ? 'text-amber-700 font-semibold' : 'text-amber-500 font-semibold')
                  : (isLight ? 'text-neutral-600 hover:text-amber-700' : 'text-neutral-200 hover:text-white')
              }`}
            >
              {link.name}
            </Link>
          ))}

          {user && user.isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={`block text-xs tracking-widest uppercase transition-colors duration-300 ${
                isActive('/admin')
                  ? (isLight ? 'text-amber-700 font-semibold' : 'text-amber-500 font-semibold')
                  : (isLight ? 'text-neutral-600 hover:text-amber-700' : 'text-neutral-200 hover:text-white')
              }`}
            >
              Dashboard
            </Link>
          )}
          
          {user ? (
            <div className={`border-t pt-4 space-y-2 ${isLight ? 'border-neutral-100' : 'border-white/5'}`}>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={`block text-xs font-medium py-2 px-1 hover:text-amber-700 transition-colors ${
                  isLight ? 'text-neutral-600' : 'text-neutral-300'
                }`}
              >
                Logged in as: <span className="font-semibold text-amber-700">{user.name}</span> (View Profile)
              </Link>
              <button
                onClick={handleLogout}
                className={`w-full text-left text-xs tracking-widest uppercase transition-colors py-2 px-1 ${
                  isLight ? 'text-red-600 hover:text-red-700' : 'text-red-400 hover:text-red-500'
                }`}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className={`block text-xs tracking-widest uppercase transition-colors py-2 px-1 ${
                isLight ? 'text-neutral-600 hover:text-amber-700' : 'text-neutral-200 hover:text-amber-500'
              }`}
            >
              Login
            </Link>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              toggleCart();
            }}
            className={`block w-full text-left text-xs tracking-widest uppercase transition-colors py-2 px-1 ${
              isLight ? 'text-neutral-600 hover:text-amber-700' : 'text-neutral-200 hover:text-amber-500'
            }`}
          >
            Cart ({totalItems})
          </button>

          <Link
            to="/reservation"
            onClick={() => setIsOpen(false)}
            className="block text-center bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-3 rounded text-xs tracking-widest uppercase transition-all duration-300"
          >
            Book a Room
          </Link>
        </div>
      )}
    </nav>
  );
}
