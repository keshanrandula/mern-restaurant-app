import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Sparkles, MapPin, Calendar, HelpCircle, Star, Utensils, Compass, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const FALLBACK_ITEMS = [
  {
    _id: '1',
    name: 'Signature Seafood Platter',
    price: 34.50,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=600&q=80',
    description: 'Freshly caught rock lobster, grilled jumbo prawns, and tropical fruit medley served with our house-secret chili butter.',
    rating: 4.8
  },
  {
    _id: '2',
    name: 'Traditional Crab Curry',
    price: 28.00,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
    description: 'Authentic Sri Lankan lagoon crabs slow-cooked in a rich blend of roasted spices, coconut milk, and curry leaves.',
    rating: 5.0
  },
  {
    _id: '3',
    name: 'Passion Fruit Orchid Martini',
    price: 14.00,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    description: 'A vibrant fusion of local passion fruit nectar, premium vodka, and a touch of orchid essence.',
    rating: 4.5
  }
];

export default function Home() {
  const { addToCart } = useCart();
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          // Sort items by rating high to low, filter out unavailable ones
          const sorted = [...data]
            .filter(item => item.isAvailable !== false)
            .sort((a, b) => {
              const rA = a.rating !== undefined ? a.rating : 0;
              const rB = b.rating !== undefined ? b.rating : 0;
              return rB - rA;
            });
          setTopItems(sorted.slice(0, 3));
        } else {
          setTopItems(FALLBACK_ITEMS);
        }
        setLoading(false);
      })
      .catch(err => {
        console.log('Backend offline or error fetching top menu items, loading fallbacks.', err);
        setTopItems(FALLBACK_ITEMS);
        setLoading(false);
      });
  }, []);

  const displayItems = topItems.length > 0 ? topItems : FALLBACK_ITEMS;

  return (
    <div className="relative min-h-screen bg-[#ffffff]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80')" 
          }}
        >
          <div className="absolute inset-0 bg-black/45"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-6 animate-fade-in">
          <p className="text-[10px] tracking-[0.3em] text-neutral-300 uppercase font-medium">
            Coastal Opulence Redefined
          </p>
          
          <h1 className="text-4xl md:text-6xl font-light text-white leading-tight max-w-3xl mx-auto font-serif">
            Experience Luxury at <br />The Cove Mirissa
          </h1>

          <div className="flex flex-row items-center justify-center gap-4 pt-6">
            <Link
              to="/menu"
              className="bg-[#7c562d] hover:bg-[#634423] text-white font-medium px-8 py-3 rounded text-xs tracking-widest uppercase transition-all duration-300"
            >
              Order Food
            </Link>
            <Link
              to="/reservation"
              className="border border-white/40 hover:bg-white/10 text-white font-medium px-8 py-3 rounded text-xs tracking-widest uppercase transition-all duration-300"
            >
              Book a Room
            </Link>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/70" />
        </div>
      </section>

      {/* Exquisite Culinary Art Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-semibold">
              Exquisite Culinary Art
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-neutral-900 font-serif">
              Curated Flavors of Mirissa
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed font-light">
              Indulge in a sensory journey where local heritage meets modern gastronomy. Every dish is a tribute to the Indian Ocean's bounty.
            </p>
          </div>
          <div>
            <Link 
              to="/menu"
              className="text-xs tracking-widest uppercase font-semibold text-neutral-800 hover:text-[#7c562d] border-b border-neutral-800 pb-1 transition-colors"
            >
              View Full Menu
            </Link>
          </div>
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#7c562d] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayItems.map((item) => (
              <div key={item._id} className="bg-[#fcfcfa] border border-neutral-100 rounded overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg">
                <div className="h-72 overflow-hidden relative">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-neutral-900 text-xs font-bold px-3 py-1.5 rounded border border-neutral-100 shadow-sm">
                    ${item.price.toFixed(2)}
                  </span>
                  {item.rating > 0 && (
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#7c562d] text-xs font-bold px-2.5 py-1.5 rounded border border-neutral-100 flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-current" /> {item.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="p-8 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] tracking-wider text-[#7c562d] uppercase font-semibold">{item.category}</span>
                    <h3 className="text-xl font-medium text-neutral-900 font-serif leading-tight">{item.name}</h3>
                    <p className="text-neutral-500 text-xs leading-relaxed font-light line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-[10px] tracking-wider font-semibold uppercase">
                    <div className="flex items-center gap-1 text-[#7c562d]">
                      <Sparkles className="w-3.5 h-3.5 text-[#7c562d]" /> Top Rated
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-[#7c562d] text-white hover:bg-[#634423] px-3.5 py-1.5 rounded transition-all font-semibold text-[9px] tracking-widest cursor-pointer"
                    >
                      Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Coastal Sanctuary Section */}
      <section 
        className="relative py-32 bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')" 
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Glassmorphic Card Overlay */}
        <div className="relative z-10 max-w-3xl w-full mx-6 bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-16 rounded-2xl text-center space-y-8 shadow-2xl">
          <h2 className="text-3xl md:text-5xl font-light text-white font-serif">
            A Coastal Sanctuary Awaits
          </h2>
          <p className="text-white/80 max-w-xl mx-auto text-sm md:text-base font-light leading-relaxed">
            Discover the ultimate retreat where the rhythms of the ocean meets unparalleled luxury. Secure your stay at Mirissa's most prestigious destination.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4 text-xs font-semibold tracking-wider text-white uppercase">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/70"></span> 12 Exclusive Suites
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/70"></span> Infinity Pool View
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/70"></span> Fine Dining
            </div>
          </div>

          <div>
            <Link
              to="/reservation"
              className="inline-block bg-[#7c562d] hover:bg-[#634423] text-white font-medium px-10 py-3 rounded text-xs tracking-widest uppercase transition-all duration-300"
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
