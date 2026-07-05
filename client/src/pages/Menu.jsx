import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Search, SlidersHorizontal, Star, Flame, XCircle, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const FALLBACK_MENU = [
  {
    _id: "1",
    name: "Signature Seafood Platter",
    description: "Freshly caught rock lobster, grilled jumbo prawns, and tropical fruit medley served with our house-secret chili butter.",
    price: 34.5,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=600&q=80",
    dietary: ["Gluten-Free"],
    spicyLevel: 1,
    rating: 4.8,
    numReviews: 2,
    reviews: [
      {
        _id: "r1",
        name: "Saman Kumara",
        rating: 5,
        comment: "Absolutely amazing! The lobster was incredibly fresh.",
        createdAt: "2026-07-01T10:00:00Z"
      },
      {
        _id: "r2",
        name: "Emily Watson",
        rating: 4,
        comment: "Very delicious seafood platter. Highly recommended.",
        createdAt: "2026-07-02T12:00:00Z"
      }
    ]
  },
  {
    _id: "2",
    name: "Traditional Crab Curry",
    description: "Authentic Sri Lankan lagoon crabs slow-cooked in a rich blend of roasted spices, coconut milk, and curry leaves.",
    price: 28.0,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    dietary: ["Gluten-Free"],
    spicyLevel: 3,
    rating: 5.0,
    numReviews: 2,
    reviews: [
      {
        _id: "r3",
        name: "Kasun Kalhara",
        rating: 5,
        comment: "Best crab curry I have ever had! Spicy and rich.",
        createdAt: "2026-07-01T08:00:00Z"
      },
      {
        _id: "r4",
        name: "Nimal Perera",
        rating: 5,
        comment: "Incredibly authentic flavor. A must try!",
        createdAt: "2026-07-02T14:00:00Z"
      }
    ]
  },
  {
    _id: "3",
    name: "Passion Fruit Orchid Martini",
    description: "A vibrant fusion of local passion fruit nectar, premium vodka, and a touch of orchid essence.",
    price: 14.0,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    dietary: ["Vegetarian", "Vegan", "Gluten-Free"],
    spicyLevel: 0,
    rating: 4.5,
    numReviews: 2,
    reviews: [
      {
        _id: "r5",
        name: "Sarah Jenkins",
        rating: 4,
        comment: "Lovely cocktails! Very refreshing with natural passion fruit.",
        createdAt: "2026-06-30T16:00:00Z"
      },
      {
        _id: "r6",
        name: "David Silva",
        rating: 5,
        comment: "Perfect drink by the beach. Love the orchid touch.",
        createdAt: "2026-07-02T18:00:00Z"
      }
    ]
  },
  {
    _id: "4",
    name: "Truffle Tagliatelle",
    description: "Handcrafted pasta with creamy black truffle sauce, wild mushrooms, and shaved parmesan.",
    price: 24.5,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80",
    dietary: ["Vegetarian"],
    spicyLevel: 0,
    rating: 4.5,
    numReviews: 2,
    reviews: [
      {
        _id: "r7",
        name: "Sophia Lorenz",
        rating: 4,
        comment: "Excellent truffle aroma. Pasta was perfectly al dente.",
        createdAt: "2026-07-01T09:00:00Z"
      },
      {
        _id: "r8",
        name: "Marcello V.",
        rating: 5,
        comment: "Exceeded my expectations. Premium quality.",
        createdAt: "2026-07-02T11:00:00Z"
      }
    ]
  },
  {
    _id: "5",
    name: "Crispy Skin Salmon",
    description: "Pan-seared Atlantic salmon with asparagus, saffron butter sauce, and herb-roasted baby potatoes.",
    price: 28.0,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1485962398705-ef6a13c41e8f?auto=format&fit=crop&w=600&q=80",
    dietary: ["Gluten-Free"],
    spicyLevel: 0,
    rating: 4.0,
    numReviews: 1,
    reviews: [
      {
        _id: "r9",
        name: "Chris Evans",
        rating: 4,
        comment: "Salmon skin was perfectly crispy. Saffron sauce is nice.",
        createdAt: "2026-07-02T09:00:00Z"
      }
    ]
  },
  {
    _id: "6",
    name: "Warm Chocolate Lava Cake",
    description: "Decadent chocolate cake with a molten center, served with house-made vanilla bean gelato.",
    price: 11.5,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    dietary: ["Vegetarian"],
    spicyLevel: 0,
    rating: 5.0,
    numReviews: 2,
    reviews: [
      {
        _id: "r10",
        name: "Anya Taylor",
        rating: 5,
        comment: "Warm chocolate lava with rich gelato - match made in heaven.",
        createdAt: "2026-07-01T15:00:00Z"
      },
      {
        _id: "r11",
        name: "Leo Decap",
        rating: 5,
        comment: "Best dessert in town. Simply outstanding.",
        createdAt: "2026-07-02T19:00:00Z"
      }
    ]
  }
];

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Search, Sorting, and Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [selectedSpicy, setSelectedSpicy] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Detail Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [user, setUser] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    // Check logged in user
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      setUser(JSON.parse(loggedUser));
    }

    fetch('/api/menu')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          setMenuItems(data);
        } else {
          setMenuItems(FALLBACK_MENU);
        }
        setLoading(false);
      })
      .catch(() => {
        setMenuItems(FALLBACK_MENU);
        setLoading(false);
      });
  }, []);

  const categories = ['All', 'Starters', 'Main Course', 'Desserts', 'Drinks'];

  // Handle resetting all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDietary('All');
    setSelectedSpicy('All');
    setSortBy('default');
    setActiveCategory('All');
  };

  // Perform advanced search, sort, and filter on menu items
  const filteredItems = menuItems
    .filter(item => {
      // 1. Category Filter
      if (activeCategory !== 'All' && item.category !== activeCategory) {
        return false;
      }
      // 2. Search Query Filter (Checks Name & Description)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) {
          return false;
        }
      }
      // 3. Dietary Preference Filter
      if (selectedDietary !== 'All') {
        const itemDietary = item.dietary || [];
        if (!itemDietary.includes(selectedDietary)) {
          return false;
        }
      }
      // 4. Spice Level Filter
      if (selectedSpicy !== 'All') {
        const itemSpice = item.spicyLevel !== undefined ? item.spicyLevel : 0;
        if (Number(selectedSpicy) !== itemSpice) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      // 5. Sorting logic
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      if (sortBy === 'rating-desc') {
        const ratingA = a.rating !== undefined ? a.rating : 0;
        const ratingB = b.rating !== undefined ? b.rating : 0;
        return ratingB - ratingA;
      }
      return 0; // default order
    });

  // Handle submitting review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const response = await fetch(`/api/menu/${selectedItem._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      });
      const data = await response.json();

      if (response.ok) {
        setReviewSuccess('Thank you! Review added successfully.');
        setReviewComment('');
        setReviewRating(5);

        // Fetch updated menu items to reload rating
        const freshRes = await fetch('/api/menu');
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          setMenuItems(freshData);
          
          // Sync detail modal state
          const updatedItem = freshData.find(i => i._id === selectedItem._id);
          if (updatedItem) {
            setSelectedItem(updatedItem);
          }
        }
      } else {
        setReviewError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewError('Error submitting review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Helper to render spicy flame icons
  const renderSpicyFlames = (spicyLevel) => {
    if (!spicyLevel) return null;
    return (
      <div className="flex items-center gap-0.5 text-orange-600" title={`Spicy Level: ${spicyLevel}`}>
        {[...Array(spicyLevel)].map((_, i) => (
          <Flame key={i} className="w-3.5 h-3.5 fill-current" />
        ))}
      </div>
    );
  };

  // Check if any filter is active
  const isFilterActive = searchQuery || selectedDietary !== 'All' || selectedSpicy !== 'All' || sortBy !== 'default' || activeCategory !== 'All';

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#ffffff]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Title */}
        <div className="text-center space-y-4 mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 text-neutral-400 text-xs tracking-widest uppercase">
            <Sparkles className="w-4 h-4 text-[#7c562d]" /> Culinary Masterpieces
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-neutral-900 font-serif">Our Menu</h2>
          <p className="text-neutral-500 max-w-lg mx-auto text-sm font-light leading-relaxed">
            Browse our selection of classic dishes, cocktails, and seasonal creations prepared by culinary masters. Click any card to read user reviews!
          </p>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded text-xs tracking-widest uppercase font-semibold transition-all duration-300 cursor-pointer ${
                activeCategory === category 
                  ? 'bg-[#7c562d] text-white shadow-sm'
                  : 'border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 bg-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search, Sort and Filter Toolbar */}
        <div className="bg-[#fcfcfa] rounded border border-neutral-100 p-5 mb-10 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-grow max-w-xl">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food by name or keywords..."
                className="w-full bg-white border border-neutral-200 focus:border-[#7c562d]/50 focus:ring-4 focus:ring-[#7c562d]/10 rounded pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-all duration-300 text-neutral-800"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 uppercase tracking-wider font-semibold whitespace-nowrap">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-neutral-200 text-xs font-semibold py-2.5 px-3 rounded focus:border-[#7c562d]/50 focus:outline-none text-neutral-700 cursor-pointer"
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
              </div>

              {/* Advanced Filters Button */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                  showAdvancedFilters || selectedDietary !== 'All' || selectedSpicy !== 'All'
                    ? 'bg-[#7c562d]/5 border-[#7c562d]/30 text-[#7c562d]'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>

              {/* Clear Filters Button */}
              {isFilterActive && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 border border-red-100 hover:border-red-200 px-3 py-2.5 rounded transition-all cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Advanced Filters Section */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-down">
              {/* Dietary Preferences */}
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-400 tracking-wider uppercase font-semibold">Dietary Options</label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Vegetarian', 'Vegan', 'Gluten-Free'].map(diet => (
                    <button
                      key={diet}
                      onClick={() => setSelectedDietary(diet)}
                      className={`px-4 py-1.5 rounded text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                        selectedDietary === diet
                          ? 'bg-[#7c562d] text-white border-transparent'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spicy level */}
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-400 tracking-wider uppercase font-semibold">Spice Intensity</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'All', value: 'All' },
                    { label: '🌶️ None', value: '0' },
                    { label: '🌶️ Mild', value: '1' },
                    { label: '🌶️🌶️ Medium', value: '2' },
                    { label: '🌶️🌶️🌶️ Hot', value: '3' },
                  ].map(spice => (
                    <button
                      key={spice.value}
                      onClick={() => setSelectedSpicy(spice.value)}
                      className={`px-4 py-1.5 rounded text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                        selectedSpicy === spice.value
                          ? 'bg-[#7c562d] text-white border-transparent'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'
                      }`}
                    >
                      {spice.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Menu Items Render Grid */}
        {loading ? (
          <div className="text-center py-24 space-y-4">
            <div className="inline-block w-8 h-8 border-4 border-[#7c562d] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-neutral-500 text-xs uppercase tracking-widest">Crafting menu...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-24 bg-[#fcfcfa] rounded border border-neutral-100 space-y-4 max-w-xl mx-auto shadow-sm">
            <Search className="w-12 h-12 text-neutral-300 mx-auto" />
            <h3 className="text-lg font-serif font-light text-neutral-800">No matches found</h3>
            <p className="text-neutral-500 text-xs max-w-xs mx-auto leading-relaxed">
              We couldn't find any dishes matching your selected search criteria. Try modifying your filters or search keywords.
            </p>
            <button
              onClick={resetFilters}
              className="bg-[#7c562d] hover:bg-[#634423] text-white font-medium px-6 py-2.5 rounded text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => {
              const rating = item.rating !== undefined ? item.rating : 0;
              const hasDietary = item.dietary && item.dietary.length > 0;
              return (
                <div 
                  key={item._id} 
                  onClick={() => setSelectedItem(item)}
                  className="bg-[#fcfcfa] rounded border border-neutral-100 overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.01]"
                >
                  {/* Item Image with absolute price/rating badges */}
                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    
                    {/* Price Tag */}
                    <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-neutral-900 text-sm font-bold px-3.5 py-1.5 rounded border border-neutral-100 shadow-sm">
                      ${item.price.toFixed(2)}
                    </span>

                    {/* Star Rating Badge */}
                    {rating > 0 && (
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-amber-700 text-xs font-bold px-3 py-1.5 rounded border border-neutral-100 flex items-center gap-1 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-current" /> {rating.toFixed(1)}
                      </span>
                    )}

                    {/* Dietary Tags overlay */}
                    {hasDietary && (
                      <div className="absolute bottom-4 left-4 flex flex-wrap gap-1">
                        {item.dietary.map((diet, idx) => (
                          <span 
                            key={idx} 
                            className="bg-emerald-800/90 backdrop-blur-sm text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded shadow-sm"
                          >
                            {diet === 'Gluten-Free' ? 'GF' : diet}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card description details */}
                  <div className="p-8 flex flex-col flex-grow justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#7c562d] uppercase tracking-widest font-semibold">{item.category}</span>
                        {renderSpicyFlames(item.spicyLevel)}
                      </div>
                      <h3 className="text-xl font-medium text-neutral-900 font-serif leading-tight">{item.name}</h3>
                      <p className="text-neutral-500 text-xs leading-relaxed font-light line-clamp-3">{item.description}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent modal opening
                        addToCart(item);
                      }}
                      className="w-full bg-[#7c562d] hover:bg-[#634423] text-white font-medium py-2.5 rounded text-xs uppercase tracking-widest transition-all mt-4 cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Modal & Reviews */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 overflow-y-auto font-sans flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
              onClick={() => {
                setSelectedItem(null);
                setReviewError('');
                setReviewSuccess('');
              }}
            ></div>

            {/* Modal Box */}
            <div className="relative bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 max-h-[90vh] animate-slide-in">
              
              {/* Close Button */}
              <button 
                onClick={() => {
                  setSelectedItem(null);
                  setReviewError('');
                  setReviewSuccess('');
                }}
                className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-neutral-700 rounded-full p-2 border border-neutral-200 shadow transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Column: Image (md:col-span-5) */}
              <div className="md:col-span-5 relative bg-neutral-900 h-64 md:h-auto min-h-[300px]">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.name} 
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 bg-white/95 text-neutral-900 text-sm font-bold px-3.5 py-1.5 rounded border border-neutral-100 shadow-md">
                  ${selectedItem.price.toFixed(2)}
                </span>
              </div>

              {/* Right Column: Scrollable Content (md:col-span-7) */}
              <div className="md:col-span-7 flex flex-col max-h-[90vh] md:max-h-[80vh] overflow-y-auto p-6 md:p-8 space-y-6">
                
                {/* Details Header */}
                <div className="space-y-2 border-b border-neutral-100 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#7c562d] uppercase tracking-widest font-semibold">{selectedItem.category}</span>
                    {renderSpicyFlames(selectedItem.spicyLevel)}
                  </div>
                  <h3 className="text-2xl font-serif text-neutral-900 font-light">{selectedItem.name}</h3>
                  <p className="text-neutral-500 text-sm font-light leading-relaxed">{selectedItem.description}</p>
                  
                  {/* Dietary Info */}
                  {selectedItem.dietary && selectedItem.dietary.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {selectedItem.dietary.map((diet, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-800 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded border border-emerald-100">
                          {diet}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reviews Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1.5">
                      Customer Reviews ({selectedItem.reviews?.length || 0})
                    </h4>
                    {selectedItem.rating > 0 && (
                      <div className="flex items-center gap-1 text-xs font-bold text-[#7c562d] bg-amber-50 px-2 py-1 rounded border border-amber-100">
                        <Star className="w-3.5 h-3.5 fill-current" /> {selectedItem.rating.toFixed(1)} / 5.0
                      </div>
                    )}
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {!selectedItem.reviews || selectedItem.reviews.length === 0 ? (
                      <p className="text-xs text-neutral-400 font-light italic py-4">No reviews yet for this culinary creation. Be the first to share your thoughts!</p>
                    ) : (
                      selectedItem.reviews.map((rev) => {
                        const dateStr = rev.createdAt 
                          ? new Date(rev.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                          : 'Recent';
                        return (
                          <div key={rev._id || Math.random()} className="bg-neutral-50 p-4 rounded border border-neutral-100 space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-neutral-800">{rev.name}</span>
                              <span className="text-neutral-400">{dateStr}</span>
                            </div>
                            
                            {/* Stars */}
                            <div className="flex text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-neutral-200'}`} 
                                />
                              ))}
                            </div>

                            <p className="text-xs text-neutral-600 font-light leading-relaxed">{rev.comment}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Write a Review Section */}
                <div className="border-t border-neutral-100 pt-6 space-y-4">
                  <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                    Write a Review
                  </h4>

                  {user ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {reviewSuccess && (
                        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-3 rounded">
                          {reviewSuccess}
                        </div>
                      )}
                      {reviewError && (
                        <div className="text-xs text-red-700 bg-red-50 border border-red-100 p-3 rounded">
                          {reviewError}
                        </div>
                      )}

                      {/* Interactive Star Selector */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Your Rating</label>
                        <div className="flex gap-1.5 text-amber-500">
                          {[1, 2, 3, 4, 5].map((starValue) => (
                            <button
                              type="button"
                              key={starValue}
                              onClick={() => setReviewRating(starValue)}
                              className="focus:outline-none transform hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star className={`w-6 h-6 ${starValue <= reviewRating ? 'fill-current' : 'text-neutral-200'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Comment Text */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Review Comment</label>
                        <textarea
                          rows="3"
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Tell us what you liked or how we can improve this dish..."
                          className="w-full bg-neutral-50 border border-neutral-200 focus:border-[#7c562d]/50 rounded px-3 py-2 text-xs focus:outline-none resize-none text-neutral-800"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="bg-[#7c562d] hover:bg-[#634423] text-white text-[10px] uppercase tracking-widest px-6 py-2.5 rounded font-semibold transition-all cursor-pointer"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  ) : (
                    <div className="bg-neutral-50 p-4 rounded border border-neutral-100 text-center py-6 text-xs text-neutral-500 font-light">
                      Please <Link to="/login" className="text-[#7c562d] font-semibold hover:underline">sign in</Link> to share your review on this recipe.
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
