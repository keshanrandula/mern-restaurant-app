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
  AlertCircle
} from 'lucide-react';

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

      </div>
    </div>
  );
}
