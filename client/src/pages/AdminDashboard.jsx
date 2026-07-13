import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  RefreshCw, 
  Calendar, 
  Utensils, 
  ListFilter, 
  DollarSign, 
  Loader2,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  AlertCircle,
  Volume2,
  Bell,
  Inbox,
  X
} from 'lucide-react';

const TABLES = [
  { id: 'T1', name: 'Table 1', capacity: 2, zone: 'Window Side' },
  { id: 'T2', name: 'Table 2', capacity: 2, zone: 'Window Side' },
  { id: 'T3', name: 'Table 3', capacity: 4, zone: 'Window Side' },
  { id: 'T4', name: 'Table 4', capacity: 4, zone: 'Main Hall' },
  { id: 'T5', name: 'Table 5', capacity: 6, zone: 'Main Hall' },
  { id: 'T6', name: 'Table 6', capacity: 2, zone: 'Main Hall' },
  { id: 'T7', name: 'Table 7', capacity: 4, zone: 'Outdoor Patio' },
  { id: 'T8', name: 'Table 8', capacity: 4, zone: 'Outdoor Patio' },
  { id: 'T9', name: 'Table 9', capacity: 6, zone: 'Outdoor Patio' },
  { id: 'T10', name: 'Table 10', capacity: 4, zone: 'VIP Lounge' },
  { id: 'T11', name: 'Table 11', capacity: 6, zone: 'VIP Lounge' },
  { id: 'T12', name: 'Table 12', capacity: 2, zone: 'VIP Lounge' }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'reservations', 'coupons', or 'analytics'
  const [menuItems, setMenuItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  // Analytics states
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [revenueView, setRevenueView] = useState('daily'); // 'daily' or 'monthly'
  const [blockedTables, setBlockedTables] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [prevReservationsCount, setPrevReservationsCount] = useState(0);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.4);
      }, 150);
    } catch (e) {
      console.log('Chime blocked by autoplay policy:', e);
    }
  };

  useEffect(() => {
    if (reservations.length > 0) {
      if (prevReservationsCount > 0 && reservations.length > prevReservationsCount) {
        const newest = reservations.filter(r => r.status === 'pending')[0];
        if (newest) {
          triggerNotification({
            id: newest._id,
            title: newest.type === 'reservation' ? 'New Reservation Request' : 'New Food Order Received',
            message: `${newest.customerName} has placed a pending ${newest.type} request.`,
            type: newest.type,
            amount: newest.totalAmount,
            time: new Date().toLocaleTimeString(),
            status: 'pending',
            raw: newest
          });
        }
      }
      setPrevReservationsCount(reservations.length);
    }
  }, [reservations]);

  const triggerNotification = (notif) => {
    setNotifications(prev => [notif, ...prev]);
    setLatestNotification(notif);
    setShowNotificationPopup(true);
    playChime();
    
    setTimeout(() => {
      setShowNotificationPopup(false);
    }, 6000);
  };

  const simulateIncomingOrder = () => {
    const mockNames = ["Amara Silva", "Ruwan Perera", "Sanduni Fernando", "John Carter", "Sophia Watson"];
    const mockItems = [
      { name: "Signature Seafood Platter", price: 34.50 },
      { name: "Traditional Crab Curry", price: 28.00 },
      { name: "Truffle Tagliatelle", price: 24.50 },
      { name: "Crispy Skin Salmon & Orchid Martini", price: 42.00 }
    ];
    
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const randomItem = mockItems[Math.floor(Math.random() * mockItems.length)];
    const isReservation = Math.random() > 0.5;
    
    const mockId = 'MOCK_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    
    const newNotif = {
      id: mockId,
      title: isReservation ? 'New Reservation Request (Simulation)' : 'New Food Order (Simulation)',
      message: isReservation 
        ? `${randomName} requests a table for ${Math.floor(Math.random() * 4) + 2} guests tonight.`
        : `${randomName} ordered ${randomItem.name} for room delivery.`,
      type: isReservation ? 'reservation' : 'order',
      amount: isReservation ? null : randomItem.price,
      time: new Date().toLocaleTimeString(),
      status: 'pending'
    };

    triggerNotification(newNotif);
  };

  const handleAcceptNotification = async (notif) => {
    if (notif.id.startsWith('MOCK_')) {
      setNotifications(prev => 
        prev.map(n => n.id === notif.id ? { ...n, status: 'confirmed' } : n)
      );
      setShowNotificationPopup(false);
      return;
    }
    
    try {
      await handleStatusChange(notif.id, 'confirmed');
      setNotifications(prev => 
        prev.map(n => n.id === notif.id ? { ...n, status: 'confirmed' } : n)
      );
      setShowNotificationPopup(false);
    } catch (e) {
      console.log('Failed to update status:', e);
    }
  };

  useEffect(() => {
    const savedBlocks = JSON.parse(localStorage.getItem('blocked_tables_admin') || '[]');
    setBlockedTables(savedBlocks);
  }, []);

  const handleToggleTableBlock = (tableId) => {
    let updated;
    if (blockedTables.includes(tableId)) {
      updated = blockedTables.filter(id => id !== tableId);
    } else {
      updated = [...blockedTables, tableId];
    }
    setBlockedTables(updated);
    localStorage.setItem('blocked_tables_admin', JSON.stringify(updated));
  };

  // Coupon form state
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    isActive: true
  });
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const navigate = useNavigate();

  // Form State for creating/editing menu items
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    image: '',
    isAvailable: true
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    // Verify user is admin
    const loggedUser = localStorage.getItem('user');
    if (!loggedUser) {
      navigate('/login');
      return;
    }

    const userObj = JSON.parse(loggedUser);
    if (!userObj.isAdmin) {
      navigate('/');
      return;
    }

    setToken(userObj.token);
    fetchData(userObj.token);
  }, [navigate]);

  const fetchData = async (authToken) => {
    setLoading(true);
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      // Fetch Menu Items
      const menuRes = await fetch('/api/menu');
      const menuData = await menuRes.json();
      setMenuItems(menuData);

      // Fetch Orders/Reservations
      const resRes = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (resRes.ok) {
        const resData = await resRes.json();
        setReservations(resData);
      }

      // Fetch Coupons
      const couponRes = await fetch('/api/coupons', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (couponRes.ok) {
        const couponData = await couponRes.json();
        setCoupons(couponData);
      }

      // Fetch Analytics
      const analyticsRes = await fetch('/api/orders/analytics', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalyticsData(analyticsData);
      } else {
        setAnalyticsError('Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setAnalyticsError('Network error connecting to analytics');
    } finally {
      setLoading(false);
      setAnalyticsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result });
      setFormError('');
    };
    reader.onerror = () => {
      setFormError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = (item) => {
    setFormMode('edit');
    setEditingId(item._id);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      isAvailable: item.isAvailable
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormMode('add');
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Main Course',
      image: '',
      isAvailable: true
    });
    setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.image) {
      setFormError('Please upload an image file or provide an image URL.');
      return;
    }

    const url = formMode === 'add' ? '/api/menu' : `/api/menu/${editingId}`;
    const method = formMode === 'add' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setFormSuccess(formMode === 'add' ? 'Menu item created successfully!' : 'Menu item updated successfully!');
        resetForm();
        fetchData(token);
      } else {
        setFormError(data.message || 'Failed to submit form');
      }
    } catch (err) {
      setFormError('Connection issue. Please try again.');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchData(token);
      } else {
        alert('Failed to delete item');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchData(token);
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCouponInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setCouponFormData({ ...couponFormData, [e.target.name]: value });
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...couponFormData,
          discountValue: Number(couponFormData.discountValue),
          minOrderAmount: Number(couponFormData.minOrderAmount || 0)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCouponSuccess('Coupon created successfully!');
        setCouponFormData({
          code: '',
          discountType: 'percentage',
          discountValue: '',
          minOrderAmount: '',
          isActive: true
        });
        fetchData(token);
      } else {
        setCouponError(data.message || 'Failed to create coupon');
      }
    } catch (err) {
      setCouponError('Connection issue. Please try again.');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchData(token);
      } else {
        alert('Failed to delete coupon');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && menuItems.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-[#ffffff]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#7c562d] mx-auto" />
          <p className="text-neutral-500 text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#ffffff]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
      <div className="border-b border-neutral-100 pb-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-[#7c562d] uppercase tracking-[0.2em] font-semibold">Management Console</span>
          <h2 className="text-3xl font-light text-neutral-900 font-serif">Admin Dashboard</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-5 py-2 rounded text-xs tracking-wider uppercase font-semibold transition-all ${
              activeTab === 'menu'
                ? 'bg-[#7c562d] text-white shadow-sm'
                : 'border border-neutral-200 text-neutral-500 hover:text-neutral-900 bg-white'
            }`}
          >
            Manage Menu
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-5 py-2 rounded text-xs tracking-wider uppercase font-semibold transition-all ${
              activeTab === 'reservations'
                ? 'bg-[#7c562d] text-white shadow-sm'
                : 'border border-neutral-200 text-neutral-500 hover:text-neutral-900 bg-white'
            }`}
          >
            Reservations ({reservations.length})
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-5 py-2 rounded text-xs tracking-wider uppercase font-semibold transition-all ${
              activeTab === 'coupons'
                ? 'bg-[#7c562d] text-white shadow-sm'
                : 'border border-neutral-200 text-neutral-500 hover:text-neutral-900 bg-white'
            }`}
          >
            Coupons ({coupons.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2 rounded text-xs tracking-wider uppercase font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-[#7c562d] text-white shadow-sm'
                : 'border border-neutral-200 text-neutral-500 hover:text-neutral-900 bg-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-5 py-2 rounded text-xs tracking-wider uppercase font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'tables'
                ? 'bg-[#7c562d] text-white shadow-sm'
                : 'border border-neutral-200 text-neutral-500 hover:text-neutral-900 bg-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Table Board
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-5 py-2 rounded text-xs tracking-wider uppercase font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-[#7c562d] text-white shadow-sm'
                : 'border border-neutral-200 text-neutral-500 hover:text-neutral-900 bg-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" /> Live Feed
            {notifications.filter(n => n.status === 'pending').length > 0 && (
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse ml-1"></span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Menu form */}
          <div className="lg:col-span-2 bg-[#fcfcfa] border border-neutral-100 p-6 rounded space-y-6 shadow-sm">
            <h3 className="text-xl font-light font-serif text-neutral-900 border-b border-neutral-100 pb-3">
              {formMode === 'add' ? 'Add New Menu Item' : 'Edit Menu Item'}
            </h3>

            {formError && <div className="text-xs text-red-500 bg-red-50 border border-red-200 p-3 rounded">{formError}</div>}
            {formSuccess && <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 p-3 rounded">{formSuccess}</div>}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">Item Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Traditional Crab Curry"
                  className="w-full bg-white border border-neutral-200 focus:border-amber-700/50 rounded px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="28.00"
                    className="w-full bg-white border border-neutral-200 focus:border-amber-700/50 rounded px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-neutral-200 focus:border-amber-700/50 rounded px-4 py-2.5 text-sm focus:outline-none"
                  >
                    <option value="Starters">Starters</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">Food Image</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Option */}
                  <div className="border border-dashed border-neutral-300 rounded p-4 flex flex-col items-center justify-center bg-neutral-50 hover:bg-neutral-100 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="text-center space-y-1">
                      <span className="text-xs text-neutral-600 font-medium">Click to upload file</span>
                      <span className="block text-[10px] text-neutral-400">PNG, JPG, WEBP up to 2MB</span>
                    </div>
                  </div>

                  {/* URL input option */}
                  <div className="flex flex-col justify-center space-y-1.5">
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase">Or Paste Image URL</span>
                    <input
                      type="url"
                      name="image"
                      value={formData.image && formData.image.startsWith('data:') ? '' : formData.image}
                      onChange={handleInputChange}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white border border-neutral-200 focus:border-amber-700/50 rounded px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {formData.image && (
                  <div className="flex items-center gap-4 mt-2 p-2 bg-neutral-50 rounded border border-neutral-100">
                    <div className="w-16 h-16 rounded overflow-hidden border border-neutral-200 bg-white shrink-0">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <span className="block text-xs font-semibold text-neutral-700 truncate">
                        {formData.image.startsWith('data:') ? 'Uploaded Image File' : 'Image URL Link'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="text-[10px] text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">Description</label>
                <textarea
                  name="description"
                  required
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the main ingredients and presentation details..."
                  className="w-full bg-white border border-neutral-200 focus:border-amber-700/50 rounded px-4 py-2.5 text-sm focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-amber-700 focus:ring-amber-700 border-neutral-300 rounded"
                />
                <label htmlFor="isAvailable" className="text-xs text-neutral-600 font-medium select-none cursor-pointer">
                  Available in Catalog
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-grow bg-[#7c562d] hover:bg-[#634423] text-white font-semibold py-3 rounded text-xs uppercase tracking-widest transition-all"
                >
                  {formMode === 'add' ? 'Create Item' : 'Update Item'}
                </button>
                {formMode === 'edit' && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="border border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-semibold px-4 py-3 rounded text-xs uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Menu list */}
          <div className="lg:col-span-3 bg-white border border-neutral-100 rounded overflow-hidden shadow-sm">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-[#fcfcfa]">
              <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Menu Catalog ({menuItems.length})</span>
            </div>
            <div className="divide-y divide-neutral-100 max-h-[600px] overflow-y-auto">
              {menuItems.map((item) => (
                <div key={item._id} className="p-4 flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded border border-neutral-100"
                    />
                    <div>
                      <h4 className="font-semibold text-neutral-800 text-sm">{item.name}</h4>
                      <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">{item.category} &bull; ${item.price.toFixed(2)}</p>
                      <p className="text-neutral-500 text-xs line-clamp-1 mt-1 font-light">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-1.5 hover:bg-neutral-50 rounded text-neutral-600 hover:text-[#7c562d] transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="p-1.5 hover:bg-neutral-50 rounded text-neutral-600 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reservations' && (
        /* Reservations Log */
        /* Reservations Log */
        <div className="bg-white border border-neutral-100 rounded overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-100 bg-[#fcfcfa] flex justify-between items-center">
            <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Reservations & Bookings</span>
            <button 
              onClick={() => fetchData(token)}
              className="text-neutral-400 hover:text-neutral-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 uppercase tracking-wider border-b border-neutral-100 text-[10px]">
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Details</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-neutral-400 font-light">No reservations logged.</td>
                  </tr>
                ) : (
                  reservations.map((res) => (
                    <tr key={res._id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="p-4 space-y-1">
                        <p className="font-bold text-neutral-800">{res.customerName}</p>
                        <p className="text-neutral-500 text-[10px]">{res.customerEmail}</p>
                        <p className="text-neutral-500 text-[10px]">{res.customerPhone}</p>
                      </td>
                      <td className="p-4 space-y-1 text-neutral-700">
                        {res.type === 'order' ? (
                          <div className="space-y-1">
                            <p className="font-bold text-neutral-800">Total: ${res.totalAmount?.toFixed(2)}</p>
                            <div className="text-[10px] text-neutral-500 max-w-xs truncate">
                              {res.items && res.items.length > 0 ? (
                                res.items.map((it, idx) => (
                                  <span key={idx}>
                                    {it.menuItem?.name || 'Item'} (x{it.quantity})
                                    {idx < res.items.length - 1 ? ', ' : ''}
                                  </span>
                                ))
                              ) : (
                                <span>No items recorded</span>
                              )}
                            </div>
                          </div>
                        ) : res.reservationDetails ? (
                          <>
                            <p className="font-medium">{res.reservationDetails.date}</p>
                            <p className="text-[10px] text-neutral-500">{res.reservationDetails.time} &bull; {res.reservationDetails.guests} Guests</p>
                          </>
                        ) : (
                          <span className="text-neutral-400">N/A</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          res.type === 'reservation' 
                            ? 'bg-amber-50 text-amber-800 border border-amber-100'
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                        }`}>
                          {res.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          res.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                          res.status === 'preparing' ? 'bg-amber-500/10 text-amber-800 border-amber-200' :
                          res.status === 'ready' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                          res.status === 'completed' ? 'bg-neutral-100 text-neutral-800 border-neutral-200' :
                          res.status === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={res.status}
                          onChange={(e) => handleStatusChange(res._id, e.target.value)}
                          className="bg-white border border-neutral-200 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-amber-700"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        /* Coupon Management */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start animate-fade-in">
          {/* Coupon Form */}
          <div className="lg:col-span-2 bg-[#fcfcfa] border border-neutral-100 p-6 rounded space-y-6 shadow-sm">
            <h3 className="text-xl font-light font-serif text-neutral-900 border-b border-neutral-100 pb-3">
              Add New Promo Code
            </h3>

            {couponError && <div className="text-xs text-red-500 bg-red-50 border border-red-200 p-3 rounded">{couponError}</div>}
            {couponSuccess && <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 p-3 rounded">{couponSuccess}</div>}

            <form onSubmit={handleCouponSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">Promo Code</label>
                <input
                  type="text"
                  name="code"
                  required
                  value={couponFormData.code}
                  onChange={handleCouponInputChange}
                  placeholder="e.g. WELCOME10"
                  className="w-full bg-white border border-neutral-200 focus:border-[#7c562d]/50 rounded px-4 py-2.5 text-sm focus:outline-none uppercase text-neutral-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">Discount Type</label>
                  <select
                    name="discountType"
                    value={couponFormData.discountType}
                    onChange={handleCouponInputChange}
                    className="w-full bg-white border border-neutral-200 focus:border-[#7c562d]/50 rounded px-4 py-2.5 text-sm focus:outline-none text-neutral-700 font-medium"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    name="discountValue"
                    required
                    value={couponFormData.discountValue}
                    onChange={handleCouponInputChange}
                    placeholder="e.g. 10"
                    className="w-full bg-white border border-neutral-200 focus:border-[#7c562d]/50 rounded px-4 py-2.5 text-sm focus:outline-none text-neutral-800 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">Minimum Order Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="minOrderAmount"
                  value={couponFormData.minOrderAmount}
                  onChange={handleCouponInputChange}
                  placeholder="e.g. 20.00"
                  className="w-full bg-white border border-neutral-200 focus:border-[#7c562d]/50 rounded px-4 py-2.5 text-sm focus:outline-none text-neutral-800 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={couponFormData.isActive}
                  onChange={handleCouponInputChange}
                  className="w-4 h-4 text-amber-700 border-neutral-300 rounded focus:ring-[#7c562d]"
                />
                <label htmlFor="isActive" className="text-xs text-neutral-600 font-semibold uppercase tracking-wider cursor-pointer">
                  Activate Coupon
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-[#7c562d] hover:bg-[#634423] text-white font-medium py-3 rounded text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer"
              >
                Create Coupon
              </button>
            </form>
          </div>

          {/* Coupon List */}
          <div className="lg:col-span-3 bg-white border border-neutral-100 rounded overflow-hidden shadow-sm">
            <div className="p-4 border-b border-neutral-100 bg-[#fcfcfa] flex justify-between items-center">
              <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Active Promo Codes</span>
              <button 
                onClick={() => fetchData(token)}
                className="text-neutral-400 hover:text-neutral-700 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 uppercase tracking-wider border-b border-neutral-100 text-[10px]">
                    <th className="p-4 font-semibold">Promo Code</th>
                    <th className="p-4 font-semibold">Discount</th>
                    <th className="p-4 font-semibold">Min Order</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-neutral-400 font-light">No coupons created.</td>
                    </tr>
                  ) : (
                    coupons.map((coupon) => (
                      <tr key={coupon._id} className="hover:bg-neutral-50/50 transition-colors font-medium">
                        <td className="p-4">
                          <span className="font-bold text-neutral-800 font-mono text-xs bg-neutral-100 px-2 py-1 rounded border border-neutral-200">
                            {coupon.code}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-700">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue.toFixed(2)}`}
                        </td>
                        <td className="p-4 text-neutral-600">
                          ${coupon.minOrderAmount?.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                            coupon.isActive 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                              : 'bg-red-50 text-red-800 border-red-100'
                          }`}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            className="p-1.5 hover:bg-neutral-50 rounded text-neutral-500 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          {analyticsLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#7c562d]" />
              <p className="text-neutral-500 text-xs tracking-wider uppercase font-semibold">Analyzing database statistics...</p>
            </div>
          ) : analyticsError || !analyticsData ? (
            <div className="text-center py-24 bg-[#fcfcfa] rounded border border-neutral-100 max-w-md mx-auto p-8 shadow-sm">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-serif font-light text-neutral-800">Analytics Error</h3>
              <p className="text-neutral-500 text-xs mt-2">{analyticsError || 'Failed to load report data.'}</p>
              <button 
                onClick={() => fetchData(token)}
                className="mt-6 bg-[#7c562d] text-white text-xs uppercase tracking-widest px-6 py-2.5 rounded font-semibold hover:bg-[#634423] transition-all cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Card 1: Total Revenue */}
                <div className="bg-[#fcfcfa] border border-neutral-100 p-5 rounded shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center border border-emerald-100">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Total Revenue</span>
                    <h4 className="text-lg font-bold text-neutral-900">${analyticsData.summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                  </div>
                </div>

                {/* Card 2: Food Orders */}
                <div className="bg-[#fcfcfa] border border-neutral-100 p-5 rounded shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-50 text-[#7c562d] rounded-full flex items-center justify-center border border-amber-100/50">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Food Orders</span>
                    <h4 className="text-lg font-bold text-neutral-900">{analyticsData.summary.orderCount}</h4>
                  </div>
                </div>

                {/* Card 3: Reservations */}
                <div className="bg-[#fcfcfa] border border-neutral-100 p-5 rounded shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-800 rounded-full flex items-center justify-center border border-blue-100">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Total Bookings</span>
                    <h4 className="text-lg font-bold text-neutral-900">{analyticsData.summary.reservationCount}</h4>
                  </div>
                </div>

                {/* Card 4: Active Reservations */}
                <div className="bg-[#fcfcfa] border border-neutral-100 p-5 rounded shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-800 rounded-full flex items-center justify-center border border-indigo-100">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Active Bookings</span>
                    <h4 className="text-lg font-bold text-neutral-900">{analyticsData.summary.activeReservations}</h4>
                  </div>
                </div>

                {/* Card 5: AOV */}
                <div className="bg-[#fcfcfa] border border-neutral-100 p-5 rounded shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-50 text-purple-800 rounded-full flex items-center justify-center border border-purple-100">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Avg Order Value</span>
                    <h4 className="text-lg font-bold text-neutral-900">${analyticsData.summary.averageOrderValue.toFixed(2)}</h4>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Revenue Trend Chart (SVG) */}
                <div className="lg:col-span-8 bg-white border border-neutral-100 p-6 rounded shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-serif text-neutral-900">Revenue Performance</h3>
                      <p className="text-[10px] text-neutral-400 font-light">Gross sales values track from completed food order transactions.</p>
                    </div>

                    <div className="flex bg-neutral-100 p-1 rounded gap-1 border border-neutral-200">
                      <button 
                        onClick={() => setRevenueView('daily')}
                        className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all cursor-pointer ${
                          revenueView === 'daily' ? 'bg-[#7c562d] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        Daily
                      </button>
                      <button 
                        onClick={() => setRevenueView('monthly')}
                        className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all cursor-pointer ${
                          revenueView === 'monthly' ? 'bg-[#7c562d] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>

                  {/* SVG Bar Chart Drawing */}
                  <div className="relative pt-4 flex items-center justify-center">
                    {(() => {
                      const chartData = revenueView === 'daily' ? analyticsData.revenueDaily : analyticsData.revenueMonthly;
                      const maxVal = Math.max(...chartData.map(d => d.value), 100);
                      const width = 600;
                      const height = 300;
                      const paddingLeft = 60;
                      const paddingRight = 20;
                      const paddingTop = 30;
                      const paddingBottom = 40;
                      const chartWidth = width - paddingLeft - paddingRight;
                      const chartHeight = height - paddingTop - paddingBottom;
                      const stepX = chartWidth / chartData.length;
                      
                      return (
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[600px] h-auto overflow-visible select-none">
                          <defs>
                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#7c562d" />
                              <stop offset="100%" stopColor="#7c562d" stopOpacity="0.15" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                            const gridY = paddingTop + chartHeight * (1 - r);
                            const gridVal = maxVal * r;
                            return (
                              <g key={idx}>
                                <line 
                                  x1={paddingLeft} 
                                  y1={gridY} 
                                  x2={width - paddingRight} 
                                  y2={gridY} 
                                  stroke="#f0f0f0" 
                                  strokeWidth="1" 
                                />
                                <text 
                                  x={paddingLeft - 10} 
                                  y={gridY + 4} 
                                  textAnchor="end" 
                                  className="text-[10px] text-neutral-400 font-mono font-medium"
                                >
                                  ${gridVal.toFixed(0)}
                                </text>
                              </g>
                            );
                          })}

                          {/* Bars */}
                          {chartData.map((d, idx) => {
                            const barHeight = (d.value / maxVal) * chartHeight;
                            const barWidth = stepX * 0.55;
                            const barX = paddingLeft + idx * stepX + (stepX - barWidth) / 2;
                            const barY = paddingTop + chartHeight - barHeight;

                            return (
                              <g key={idx} className="group cursor-pointer">
                                {/* Hover Tooltip */}
                                <rect 
                                  x={barX + barWidth / 2 - 45} 
                                  y={barY - 30} 
                                  width="90" 
                                  height="22" 
                                  rx="4" 
                                  fill="#171717" 
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                                />
                                <text 
                                  x={barX + barWidth / 2} 
                                  y={barY - 15} 
                                  textAnchor="middle" 
                                  fill="#ffffff" 
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] font-bold font-mono pointer-events-none"
                                >
                                  ${d.value.toFixed(2)}
                                </text>

                                {/* Bar shape */}
                                <rect
                                  x={barX}
                                  y={barY}
                                  width={barWidth}
                                  height={barHeight}
                                  rx="2"
                                  fill="url(#barGrad)"
                                  className="hover:fill-[#7c562d] transition-all duration-300"
                                />

                                {/* X-Axis Labels */}
                                <text
                                  x={barX + barWidth / 2}
                                  y={height - 15}
                                  textAnchor="middle"
                                  className="text-[10px] text-neutral-500 font-semibold"
                                >
                                  {d.label}
                                </text>
                              </g>
                            );
                          })}

                          {/* Bottom baseline */}
                          <line 
                            x1={paddingLeft} 
                            y1={paddingTop + chartHeight} 
                            x2={width - paddingRight} 
                            y2={paddingTop + chartHeight} 
                            stroke="#e5e5e5" 
                            strokeWidth="1.5" 
                          />
                        </svg>
                      );
                    })()}
                  </div>
                </div>

                {/* Best Selling Items List */}
                <div className="lg:col-span-4 bg-white border border-neutral-100 p-6 rounded shadow-sm space-y-5">
                  <div>
                    <h3 className="text-md font-serif text-neutral-900">Best Sellers</h3>
                    <p className="text-[10px] text-neutral-400 font-light">Popular items ranked by quantity sold.</p>
                  </div>

                  <div className="space-y-4">
                    {analyticsData.bestSellers.length === 0 ? (
                      <p className="text-xs text-neutral-400 font-light italic">No order statistics recorded yet.</p>
                    ) : (
                      analyticsData.bestSellers.map((item, idx) => {
                        const maxQty = analyticsData.bestSellers[0].quantity || 1;
                        const pct = ((item.quantity || 0) / maxQty) * 100;
                        return (
                          <div key={item.name} className="space-y-1.5">
                            <div className="flex items-center gap-3">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-10 h-10 rounded object-cover border border-neutral-100 shrink-0"
                              />
                              <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start">
                                  <h4 className="text-xs font-semibold text-neutral-800 truncate pr-2">{item.name}</h4>
                                  <span className="text-[10px] text-neutral-500 font-bold shrink-0">x{item.quantity} sold</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-neutral-400 font-light">
                                  <span>#{idx + 1} Rated Dish</span>
                                  <span className="text-[#7c562d] font-semibold font-mono">${item.revenue.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                            {/* Horizontal progress bar */}
                            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#7c562d] rounded-full transition-all duration-1000"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Reservations Graph & Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Active Reservations (Line-Chart SVG) */}
                <div className="bg-white border border-neutral-100 p-6 rounded shadow-sm space-y-4">
                  <div>
                    <h3 className="text-md font-serif text-neutral-900">Active Bookings Trend</h3>
                    <p className="text-[10px] text-neutral-400 font-light">Upcoming reservation count grouped by booking dates.</p>
                  </div>

                  <div className="flex items-center justify-center pt-2">
                    {analyticsData.upcomingReservations.length === 0 ? (
                      <p className="text-xs text-neutral-400 font-light italic py-12">No active upcoming reservations booked.</p>
                    ) : (
                      (() => {
                        const chartData = analyticsData.upcomingReservations;
                        const maxVal = Math.max(...chartData.map(d => d.value), 4);
                        const width = 500;
                        const height = 200;
                        const paddingLeft = 40;
                        const paddingRight = 20;
                        const paddingTop = 25;
                        const paddingBottom = 35;
                        const chartWidth = width - paddingLeft - paddingRight;
                        const chartHeight = height - paddingTop - paddingBottom;
                        const stepX = chartWidth / (chartData.length - 1 || 1);

                        // Build line coordinates path
                        const points = chartData.map((d, idx) => {
                          const x = paddingLeft + idx * stepX;
                          const y = paddingTop + chartHeight - (d.value / maxVal) * chartHeight;
                          return { x, y, label: d.label, value: d.value };
                        });

                        const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                        const areaPath = points.length > 0 
                          ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
                          : '';

                        return (
                          <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[500px] h-auto overflow-visible select-none">
                            <defs>
                              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#7c562d" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#7c562d" stopOpacity="0" />
                              </linearGradient>
                            </defs>

                            {/* Horizontal grid lines */}
                            {[0, 0.5, 1].map((r, idx) => {
                              const gridY = paddingTop + chartHeight * (1 - r);
                              return (
                                <g key={idx}>
                                  <line 
                                    x1={paddingLeft} 
                                    y1={gridY} 
                                    x2={width - paddingRight} 
                                    y2={gridY} 
                                    stroke="#f7f7f7" 
                                    strokeWidth="1" 
                                  />
                                  <text 
                                    x={paddingLeft - 8} 
                                    y={gridY + 3} 
                                    textAnchor="end" 
                                    className="text-[9px] text-neutral-400 font-mono"
                                  >
                                    {(maxVal * r).toFixed(0)}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Area shape */}
                            {areaPath && (
                              <path d={areaPath} fill="url(#areaGrad)" />
                            )}

                            {/* Line path */}
                            {linePath && (
                              <path d={linePath} fill="none" stroke="#7c562d" strokeWidth="2" />
                            )}

                            {/* Dots and labels */}
                            {points.map((p, idx) => (
                              <g key={idx} className="group cursor-pointer">
                                {/* Dot indicator */}
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r="4"
                                  fill="#7c562d"
                                  stroke="#ffffff"
                                  strokeWidth="1.5"
                                  className="group-hover:r-5 group-hover:stroke-[2px] transition-all"
                                />

                                {/* Tooltip rectangle */}
                                <rect 
                                  x={p.x - 35} 
                                  y={p.y - 28} 
                                  width="70" 
                                  height="18" 
                                  rx="3" 
                                  fill="#171717" 
                                  className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                />
                                <text 
                                  x={p.x} 
                                  y={p.y - 16} 
                                  textAnchor="middle" 
                                  fill="#ffffff" 
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-bold font-mono pointer-events-none"
                                >
                                  {p.value} Bookings
                                </text>

                                {/* X-axis Date label */}
                                <text
                                  x={p.x}
                                  y={height - 10}
                                  textAnchor="middle"
                                  className="text-[9px] text-neutral-500 font-semibold"
                                >
                                  {p.label}
                                </text>
                              </g>
                            ))}
                          </svg>
                        );
                      })()
                    )}
                  </div>
                </div>

                {/* Additional Statistics Cards */}
                <div className="bg-[#fcfcfa] border border-neutral-100 p-6 rounded shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-md font-serif text-neutral-900">Analytics Insights</h3>
                    <p className="text-[10px] text-neutral-400 font-light">Quick evaluation checklist on restaurant service streams.</p>
                  </div>

                  <div className="space-y-3.5 flex-grow">
                    <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-100">
                      <span className="text-neutral-500 font-light">Table Booking Conversion</span>
                      <span className="font-bold text-neutral-800">
                        {analyticsData.summary.reservationCount > 0 
                          ? `${((analyticsData.summary.activeReservations / analyticsData.summary.reservationCount) * 100).toFixed(0)}% active`
                          : '0%'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-100">
                      <span className="text-neutral-500 font-light">Food Order Ticket Volume</span>
                      <span className="font-bold text-neutral-800">{analyticsData.summary.orderCount} total tickets</span>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-100">
                      <span className="text-neutral-500 font-light">AOV Threshold Index</span>
                      <span className="font-bold text-[#7c562d]">
                        {analyticsData.summary.averageOrderValue > 30 ? 'High ($30+)' : 'Standard (<$30)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-100">
                      <span className="text-neutral-500 font-light">Active Sales Pipeline</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider text-[9px]">
                        Healthy
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => fetchData(token)}
                    className="w-full border border-neutral-200 hover:border-neutral-400 bg-white text-neutral-600 font-semibold py-2.5 rounded text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Reports
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'tables' && (
        <div className="bg-[#fcfcfa] rounded-lg border border-neutral-100 p-8 shadow-sm animate-fade-in font-sans space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-100 pb-4 gap-4">
            <div>
              <h3 className="text-xl font-serif text-neutral-900 flex items-center gap-2">
                Dining Table Board <span className="text-xs uppercase tracking-widest text-[#7c562d] font-bold bg-[#7c562d]/5 px-2.5 py-0.5 rounded border border-[#7c562d]/25">LIVE STATUS</span>
              </h3>
              <p className="text-xs text-neutral-500 font-light mt-0.5">Manage live dining table bookings, block tables for cleaning/walk-ins, or release active overrides.</p>
            </div>
            
            <div className="flex flex-wrap gap-4 text-[10px] text-neutral-400 font-bold uppercase tracking-wider bg-white px-4 py-2 rounded border border-neutral-200/50">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-sm"></span> Manually Blocked</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span> Reserved Today</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {TABLES.map(table => {
              const isBlocked = blockedTables.includes(table.id);
              
              // Find if any confirmed reservation today has this table name (e.g. "Table 4")
              const activeBooking = reservations.find(res => 
                res.type === 'reservation' && 
                res.status === 'confirmed' &&
                res.reservationDetails?.tableNumber &&
                res.reservationDetails.tableNumber.startsWith(table.name)
              );
              
              let statusLabel = "Available";
              let statusColor = "text-emerald-700 bg-emerald-50 border-emerald-250";
              let cardBorder = "border-neutral-200 hover:border-emerald-500/50";
              
              if (isBlocked) {
                statusLabel = "Blocked";
                statusColor = "text-red-700 bg-red-50 border-red-200 animate-pulse";
                cardBorder = "border-red-200/60 bg-red-50/10";
              } else if (activeBooking) {
                statusLabel = "Reserved";
                statusColor = "text-amber-800 bg-amber-50 border-amber-250";
                cardBorder = "border-amber-200/60 bg-amber-50/5";
              }
              
              return (
                <div key={table.id} className={`p-4 rounded-lg border flex flex-col justify-between h-40 shadow-sm transition-all duration-300 hover:shadow-md ${cardBorder}`}>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">{table.zone}</span>
                      <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded border ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <h4 className="text-md font-bold text-neutral-800">{table.name}</h4>
                    <p className="text-[11px] text-neutral-500 font-medium">Capacity: {table.capacity} Guests</p>
                  </div>
                  
                  <div className="border-t border-neutral-100 pt-2 flex-grow flex flex-col justify-end">
                    {activeBooking ? (
                      <div className="text-[10px] text-neutral-500 leading-normal">
                        <p className="font-bold text-neutral-800 truncate">Res: {activeBooking.customerName}</p>
                        <p className="text-neutral-400">{activeBooking.reservationDetails.time} &bull; {activeBooking.reservationDetails.guests} Pax</p>
                      </div>
                    ) : isBlocked ? (
                      <p className="text-[10px] text-red-500 italic font-semibold">Blocked by Admin Override</p>
                    ) : (
                      <p className="text-[10px] text-emerald-600 italic font-semibold">Ready for bookings</p>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    {activeBooking ? (
                      <button
                        type="button"
                        disabled
                        className="w-full text-center text-[9px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 py-1.5 rounded cursor-not-allowed border border-neutral-200/40"
                      >
                        Reserved (In-use)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleTableBlock(table.id)}
                        className={`w-full text-center text-[9px] font-black uppercase tracking-widest py-1.5 rounded transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                          isBlocked 
                            ? 'bg-neutral-850 hover:bg-neutral-900 text-white shadow-sm'
                            : 'border border-red-200 hover:border-red-400 bg-white text-red-600 hover:bg-red-50/20'
                        }`}
                      >
                        {isBlocked ? 'Release Table' : 'Block Table'}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-[#fcfcfa] rounded-lg border border-neutral-100 p-8 shadow-sm animate-fade-in font-sans space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-100 pb-4 gap-4">
            <div>
              <h3 className="text-xl font-serif text-neutral-900 flex items-center gap-2">
                Live Kitchen Monitor & Feed <span className="text-xs uppercase tracking-widest text-[#7c562d] font-bold bg-[#7c562d]/5 px-2.5 py-0.5 rounded border border-[#7c562d]/25">LIVE MONITOR</span>
              </h3>
              <p className="text-xs text-neutral-500 font-light mt-0.5">Kitchen display system for active food orders and room reservations with synth chime warnings.</p>
            </div>
            
            <button
              type="button"
              onClick={simulateIncomingOrder}
              className="bg-[#7c562d] hover:bg-[#634423] text-white text-[10px] uppercase font-bold tracking-widest px-4 py-2.5 rounded shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
            >
              Simulate Customer Order
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Activity Log</span>
              
              {notifications.length === 0 ? (
                <div className="text-center py-16 bg-white border border-neutral-100 rounded space-y-3">
                  <Bell className="w-8 h-8 text-neutral-300 mx-auto" />
                  <p className="text-xs text-neutral-500 font-light italic">No notifications logged. Try simulating a customer order!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className={`bg-white border rounded-lg p-4 shadow-sm flex items-start justify-between gap-4 transition-all duration-300 ${
                        notif.status === 'pending' ? 'border-[#7c562d]/30 bg-amber-50/5' : 'border-neutral-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full mt-0.5 ${
                          notif.type === 'reservation' ? 'bg-amber-100 text-amber-750' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {notif.type === 'reservation' ? <Calendar className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-neutral-850 flex items-center gap-1.5">
                            {notif.title}
                            {notif.status === 'pending' && (
                              <span className="text-[8px] bg-amber-600 text-white font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide animate-pulse">Pending</span>
                            )}
                          </h4>
                          <p className="text-xs text-neutral-600 font-light leading-normal">{notif.message}</p>
                          <div className="flex gap-3 text-[10px] text-neutral-400 font-medium pt-1">
                            <span>Time: {notif.time}</span>
                            {notif.amount && <span>Amount: ${notif.amount.toFixed(2)}</span>}
                          </div>
                        </div>
                      </div>

                      {notif.status === 'pending' && (
                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                          <button
                            onClick={() => handleAcceptNotification(notif)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] uppercase font-bold tracking-wider px-3 py-1.5 rounded transition-colors cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              setNotifications(prev => 
                                prev.map(n => n.id === notif.id ? { ...n, status: 'declined' } : n)
                              );
                              setShowNotificationPopup(false);
                            }}
                            className="border border-neutral-250 hover:bg-neutral-50 text-neutral-500 text-[9px] uppercase font-bold tracking-wider px-3 py-1.5 rounded transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {notif.status === 'confirmed' && (
                        <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                          Accepted
                        </span>
                      )}

                      {notif.status === 'declined' && (
                        <span className="text-[9px] text-neutral-500 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                          Declined
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Kitchen Stats</span>
              
              <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm space-y-4 font-sans">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded bg-amber-50 text-[#7c562d]">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-800 uppercase">Alert Bell Synth</h4>
                    <p className="text-[10px] text-neutral-400">AudioContext synthesis active.</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-neutral-100 pt-3 text-neutral-600 leading-normal">
                  <div className="flex justify-between">
                    <span>Total Notifications</span>
                    <span className="font-bold text-neutral-800">{notifications.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Requests</span>
                    <span className="font-bold text-amber-700 animate-pulse">
                      {notifications.filter(n => n.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accepted Tickets</span>
                    <span className="font-bold text-emerald-600">
                      {notifications.filter(n => n.status === 'confirmed').length}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={playChime}
                  className="w-full text-center text-[10px] uppercase font-bold py-2 bg-neutral-150 hover:bg-neutral-200 text-neutral-600 rounded transition-colors cursor-pointer"
                >
                  Test Audio Chime
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating incoming alert banner popup in bottom right */}
      {showNotificationPopup && latestNotification && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl shadow-2xl p-4.5 animate-slide-in font-sans flex items-start gap-3.5">
          <div className="p-2 bg-amber-600 text-white rounded-full mt-0.5 animate-bounce">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-grow space-y-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">New Alert</h4>
              <button 
                onClick={() => setShowNotificationPopup(false)}
                className="text-neutral-500 hover:text-neutral-350 p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-100 font-bold leading-tight">{latestNotification.title}</p>
            <p className="text-[11px] text-neutral-400 font-light leading-normal">{latestNotification.message}</p>
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleAcceptNotification(latestNotification)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] uppercase font-bold tracking-widest px-3 py-1.5 rounded transition-colors cursor-pointer"
              >
                Accept Order
              </button>
              <button
                onClick={() => setShowNotificationPopup(false)}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[9px] uppercase font-bold tracking-widest px-3 py-1.5 rounded transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
