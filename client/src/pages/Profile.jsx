import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  Clock, 
  Users, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Settings, 
  ClipboardList,
  FileText,
  CheckSquare,
  ChefHat
} from 'lucide-react';

function PreparationTimer({ startTime }) {
  const duration = 15 * 60 * 1000; // 15 minutes in ms
  const targetTime = new Date(startTime).getTime() + duration;
  const [timeLeft, setTimeLeft] = useState(targetTime - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = targetTime - Date.now();
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(timer);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  if (timeLeft <= 0) {
    return (
      <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-100">
        Ready any minute!
      </span>
    );
  }

  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  return (
    <div className="flex items-center gap-1 text-[9px] bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded font-bold">
      <span className="inline-block w-1 h-1 rounded-full bg-amber-600 animate-ping"></span>
      <span>Est. Prep: {minutes}:{seconds < 10 ? '0' : ''}{seconds}</span>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'settings'
  const [historyTab, setHistoryTab] = useState('reservations'); // 'reservations' | 'orders'
  
  // Profile settings state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  
  // Expanded states for order items
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    // Check auth
    const loggedUser = localStorage.getItem('user');
    if (!loggedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(loggedUser);
    setCurrentUser(parsedUser);
    
    // Set initial form details
    setProfileForm({
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      password: '',
      confirmPassword: ''
    });

    // Fetch user profile and orders
    fetchProfileAndOrders(parsedUser);
  }, [navigate]);

  const fetchProfileAndOrders = async (user) => {
    try {
      // 1. Fetch latest profile info
      const profileRes = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfileForm(prev => ({
          ...prev,
          name: profileData.name,
          email: profileData.email
        }));
        // Update localStorage user (keep token)
        const updatedLocalUser = { ...user, name: profileData.name, email: profileData.email };
        localStorage.setItem('user', JSON.stringify(updatedLocalUser));
      }

      // 2. Fetch history
      const historyRes = await fetch('/api/orders/myorders', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      } else {
        const errData = await historyRes.json();
        setHistoryError(errData.message || 'Failed to fetch history');
      }
    } catch (err) {
      console.error('Error fetching profile/history details:', err);
      setHistoryError('Could not establish connection to server.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchHistoryOnly = async (user) => {
    try {
      const historyRes = await fetch('/api/orders/myorders', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
    } catch (err) {
      console.log('Background polling failed to fetch orders.', err);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const hasActiveOrders = history.some(
      order => order.type === 'order' && order.status !== 'completed' && order.status !== 'cancelled'
    );

    if (!hasActiveOrders) return;

    const interval = setInterval(() => {
      fetchHistoryOnly(currentUser);
    }, 10000);

    return () => clearInterval(interval);
  }, [history, currentUser]);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    if (profileForm.password !== profileForm.confirmPassword) {
      setProfileError('Passwords do not match');
      setProfileLoading(false);
      return;
    }

    try {
      const payload = {
        name: profileForm.name,
        email: profileForm.email
      };
      if (profileForm.password) {
        payload.password = profileForm.password;
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setProfileSuccess('Profile updated successfully!');
        // Update user state and storage (keep new token returned if any, or merge)
        const updatedUser = {
          ...currentUser,
          name: data.name,
          email: data.email,
          token: data.token || currentUser.token
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        
        // Reset password fields
        setProfileForm(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));

        // Trigger header update event if needed
        window.dispatchEvent(new Event('storage'));
      } else {
        setProfileError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setProfileError('Failed to connect to server. Try again later.');
    } finally {
      setProfileLoading(false);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'preparing':
        return 'text-amber-800 bg-amber-500/10 border-amber-200';
      case 'ready':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-neutral-700 bg-neutral-100 border-neutral-200';
      case 'cancelled':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'pending':
      default:
        return 'text-amber-700 bg-amber-50 border-amber-200';
    }
  };

  const getStatusLevel = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'preparing': return 3;
      case 'ready': return 4;
      case 'completed': return 5;
      default: return 0;
    }
  };

  const renderStepItem = (stepNum, label, stepStatus, currentStatus, icon) => {
    const currentLevel = getStatusLevel(currentStatus);
    const stepLevel = getStatusLevel(stepStatus);
    const isCompleted = currentLevel >= stepLevel;
    const isActive = currentStatus === stepStatus;

    return (
      <div className="flex flex-col items-center text-center space-y-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
          isActive 
            ? 'bg-[#7c562d] text-white border-transparent ring-4 ring-amber-700/10 shadow-sm font-semibold' 
            : isCompleted
              ? 'bg-[#7c562d]/80 text-white border-transparent shadow-sm'
              : 'bg-white text-neutral-300 border-neutral-200'
        }`}>
          {icon}
        </div>
        <span className={`text-[9px] uppercase tracking-wider font-bold ${
          isActive ? 'text-[#7c562d]' : isCompleted ? 'text-neutral-700' : 'text-neutral-400'
        }`}>
          {label}
        </span>
      </div>
    );
  };

  const getOrderStatusDescription = (status) => {
    switch (status) {
      case 'pending': return "Order received and waiting for kitchen approval.";
      case 'confirmed': return "Accepted! Our kitchen team is starting preparation.";
      case 'preparing': return "Chef is handcrafting your gourmet dishes right now.";
      case 'ready': return "Hot and fresh! Ready for pickup at the counter.";
      case 'completed': return "Completed. We hope you enjoyed your meal!";
      default: return "";
    }
  };

  const getReservationStatusLevel = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const renderReservationStepItem = (stepNum, label, stepStatus, currentStatus, icon) => {
    const currentLevel = getReservationStatusLevel(currentStatus);
    const stepLevel = getReservationStatusLevel(stepStatus);
    const isCompleted = currentLevel >= stepLevel;
    const isActive = currentStatus === stepStatus;

    return (
      <div className="flex flex-col items-center text-center space-y-1">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
          isActive 
            ? 'bg-[#7c562d] text-white border-transparent ring-4 ring-amber-700/10 shadow-sm font-semibold' 
            : isCompleted
              ? 'bg-[#7c562d]/80 text-white border-transparent shadow-sm'
              : 'bg-white text-neutral-300 border-neutral-200'
        }`}>
          {icon}
        </div>
        <span className={`text-[8px] uppercase tracking-wider font-bold ${
          isActive ? 'text-[#7c562d]' : isCompleted ? 'text-neutral-700' : 'text-neutral-400'
        }`}>
          {label}
        </span>
      </div>
    );
  };

  // Filter items in history by type
  const reservations = history.filter(item => item.type === 'reservation');
  const foodOrders = history.filter(item => item.type === 'order');

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ffffff]">
        <Loader2 className="w-8 h-8 text-[#7c562d] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#ffffff]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 animate-fade-in">
        
        {/* Page Title */}
        <div className="mb-12 border-b border-neutral-100 pb-6">
          <h1 className="text-4xl font-light font-serif text-neutral-900">Welcome, {currentUser.name}</h1>
          <p className="text-neutral-500 text-sm font-light mt-2">
            Manage your room and table bookings, view order histories, or update your personal account information.
          </p>
        </div>

        {/* Tab Selection Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 border-b lg:border-b-0 lg:border-r border-neutral-100 scrollbar-none">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-3 px-4 py-3 rounded text-xs uppercase tracking-wider font-semibold transition-all duration-300 whitespace-nowrap w-full text-left ${
                activeTab === 'history' 
                  ? 'bg-neutral-50 text-[#7c562d] border-l-2 border-[#7c562d]' 
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50/50 border-l-2 border-transparent'
              }`}
            >
              <ClipboardList className="w-4 h-4" /> My History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-4 py-3 rounded text-xs uppercase tracking-wider font-semibold transition-all duration-300 whitespace-nowrap w-full text-left ${
                activeTab === 'settings' 
                  ? 'bg-neutral-50 text-[#7c562d] border-l-2 border-[#7c562d]' 
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50/50 border-l-2 border-transparent'
              }`}
            >
              <Settings className="w-4 h-4" /> Account Settings
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="lg:col-span-3">
            
            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                {/* Sub-tabs for Reservations vs Orders */}
                <div className="flex gap-4 border-b border-neutral-100 pb-3">
                  <button
                    onClick={() => setHistoryTab('reservations')}
                    className={`text-xs uppercase tracking-wider font-semibold pb-1 border-b-2 transition-all duration-300 ${
                      historyTab === 'reservations'
                        ? 'border-[#7c562d] text-[#7c562d]'
                        : 'border-transparent text-neutral-400 hover:text-neutral-950'
                    }`}
                  >
                    Room & Table Bookings ({reservations.length})
                  </button>
                  <button
                    onClick={() => setHistoryTab('orders')}
                    className={`text-xs uppercase tracking-wider font-semibold pb-1 border-b-2 transition-all duration-300 ${
                      historyTab === 'orders'
                        ? 'border-[#7c562d] text-[#7c562d]'
                        : 'border-transparent text-neutral-400 hover:text-neutral-950'
                    }`}
                  >
                    Food Orders ({foodOrders.length})
                  </button>
                </div>

                {historyLoading ? (
                  <div className="py-12 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#7c562d] animate-spin" />
                  </div>
                ) : historyError ? (
                  <div className="flex items-center gap-2 p-4 text-xs text-red-500 bg-red-50 border border-red-100 rounded">
                    <AlertCircle className="w-4 h-4" />
                    <span>{historyError}</span>
                  </div>
                ) : (
                  <div>
                    {/* Reservations List */}
                    {historyTab === 'reservations' && (
                      <div className="space-y-4 animate-fade-in">
                        {reservations.length === 0 ? (
                          <div className="text-center py-12 bg-[#fcfcfa] rounded border border-neutral-100 space-y-4">
                            <Calendar className="w-10 h-10 text-neutral-300 mx-auto" />
                            <h3 className="text-sm font-medium text-neutral-700">No Reservations Found</h3>
                            <p className="text-neutral-500 text-xs max-w-xs mx-auto leading-relaxed">
                              You haven't reserved any rooms or dining tables yet.
                            </p>
                            <Link 
                              to="/reservation" 
                              className="inline-block bg-[#7c562d] hover:bg-[#634423] text-white text-[10px] uppercase tracking-widest px-6 py-2.5 rounded font-semibold transition-all duration-300"
                            >
                              Book a Table
                            </Link>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reservations.map((resItem) => (
                              <div key={resItem._id} className="bg-[#fcfcfa] p-5 rounded border border-neutral-100 shadow-sm space-y-4 relative overflow-hidden">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-[#7c562d] uppercase tracking-widest font-semibold">
                                      {resItem.reservationDetails?.guests > 4 ? 'Suites / Private Room' : 'Standard Dining'}
                                    </span>
                                    <h4 className="text-md font-serif font-light text-neutral-900">
                                      Table/Room Reservation
                                    </h4>
                                  </div>
                                  <span className={`text-[10px] uppercase font-semibold px-2.5 py-1 rounded border tracking-wider ${getStatusStyle(resItem.status)}`}>
                                    {resItem.status}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 py-3 border-y border-neutral-100 text-xs text-neutral-600">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>{resItem.reservationDetails?.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>{resItem.reservationDetails?.time}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>{resItem.reservationDetails?.guests} Guests</span>
                                  </div>
                                </div>

        <div className="text-[11px] text-neutral-500 space-y-0.5">
                                  <p>Registered name: <strong className="text-neutral-800">{resItem.customerName}</strong></p>
                                  <p>Contact Phone: <span className="text-neutral-800 font-medium">{resItem.customerPhone}</span></p>
                                  {resItem.reservationDetails?.tableNumber && (
                                    <p>Assigned Table: <strong className="text-[#7c562d]">{resItem.reservationDetails.tableNumber}</strong></p>
                                  )}
                                  <p className="text-[9px] text-neutral-400 mt-2">Ref ID: {resItem._id}</p>
                                </div>

                                {/* Reservation Visual Timeline */}
                                {resItem.status !== 'cancelled' ? (
                                  <div className="bg-neutral-50/50 p-3 rounded border border-neutral-100/70 mt-3 space-y-3 font-sans">
                                    <div className="flex items-center justify-between text-[9px]">
                                      <span className="text-neutral-400 uppercase tracking-wider font-bold">Booking Status</span>
                                      <span className="text-[#7c562d] font-bold">
                                        {resItem.status === 'pending' ? 'Pending Approval' : 
                                         resItem.status === 'confirmed' ? 'Secured & Active' : 
                                         resItem.status === 'completed' ? 'Visit Finished' : ''}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-3 relative items-center gap-1 z-0">
                                      {/* Progress line */}
                                      <div className="absolute left-[15%] right-[15%] top-[14px] h-0.5 bg-neutral-200 -z-10"></div>
                                      <div 
                                        className="absolute left-[15%] top-[14px] h-0.5 bg-[#7c562d] transition-all duration-500 -z-10"
                                        style={{ 
                                          width: `${
                                            resItem.status === 'pending' ? '0%' :
                                            resItem.status === 'confirmed' ? '50%' : '100%'
                                          }`
                                        }}
                                      ></div>
                                      {renderReservationStepItem(1, 'Requested', 'pending', resItem.status, <Calendar className="w-3 h-3" />)}
                                      {renderReservationStepItem(2, 'Confirmed', 'confirmed', resItem.status, <CheckSquare className="w-3 h-3" />)}
                                      {renderReservationStepItem(3, 'Completed', 'completed', resItem.status, <CheckCircle2 className="w-3 h-3" />)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-red-50 border border-red-100 p-2.5 rounded text-center text-[10px] text-red-700 font-medium flex items-center justify-center gap-1.5 mt-3">
                                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                                    <span>This booking was cancelled.</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Food Orders List */}
                    {historyTab === 'orders' && (
                      <div className="space-y-4 animate-fade-in">
                        {foodOrders.length === 0 ? (
                          <div className="text-center py-12 bg-[#fcfcfa] rounded border border-neutral-100 space-y-4">
                            <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto" />
                            <h3 className="text-sm font-medium text-neutral-700">No Food Orders Yet</h3>
                            <p className="text-neutral-500 text-xs max-w-xs mx-auto leading-relaxed">
                              Treat yourself to our selection of culinary masterpieces from our main menu.
                            </p>
                            <Link 
                              to="/menu" 
                              className="inline-block bg-[#7c562d] hover:bg-[#634423] text-white text-[10px] uppercase tracking-widest px-6 py-2.5 rounded font-semibold transition-all duration-300"
                            >
                              Explore Menu
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {foodOrders.map((order) => {
                              const isExpanded = !!expandedOrders[order._id];
                              const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                              return (
                                <div key={order._id} className="bg-[#fcfcfa] rounded border border-neutral-100 shadow-sm overflow-hidden">
                                  {/* Header Summary */}
                                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs font-semibold text-neutral-900 font-mono">
                                          Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                                        </span>
                                        <span className="text-neutral-300">|</span>
                                        <span className="text-[11px] text-neutral-500">{orderDate}</span>
                                      </div>
                                      <p className="text-[11px] text-neutral-400">
                                        Prepared for: {order.customerName} ({order.customerPhone})
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6">
                                      <div className="text-right">
                                        <span className="text-xs text-neutral-400">Total Price</span>
                                        <h5 className="text-md font-semibold text-[#7c562d]">${order.totalAmount?.toFixed(2)}</h5>
                                      </div>
                                      
                                      <span className={`text-[10px] uppercase font-semibold px-2.5 py-1 rounded border tracking-wider ${getStatusStyle(order.status)}`}>
                                        {order.status}
                                      </span>

                                      <button 
                                        onClick={() => toggleOrderExpand(order._id)}
                                        className="p-1.5 border border-neutral-200 rounded hover:bg-neutral-50 transition-colors"
                                        title={isExpanded ? "Hide Details" : "Show Details"}
                                      >
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-600" /> : <ChevronDown className="w-4 h-4 text-neutral-600" />}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Collapsible Details */}
                                  {isExpanded && (
                                    <div className="p-5 bg-white border-t border-neutral-100 space-y-6">
                                      
                                      {/* Live Stepper Block */}
                                      {order.status !== 'cancelled' ? (
                                        <div className="bg-neutral-50/50 p-4 rounded border border-neutral-100/70 space-y-4">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Live Order Progress</span>
                                            <div className="flex items-center gap-2">
                                              {order.status === 'preparing' && (
                                                <PreparationTimer startTime={order.updatedAt || order.createdAt} />
                                              )}
                                              {getStatusLevel(order.status) < 5 && (
                                                <span className="text-[9px] text-[#7c562d] font-bold bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded animate-pulse">
                                                  Live Tracking
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <p className="text-[11px] text-neutral-500 italic font-light pt-0.5">
                                            {getOrderStatusDescription(order.status)}
                                          </p>
                                          
                                          {/* Stepper Steps grid */}
                                          <div className="grid grid-cols-5 relative items-center gap-1 z-0">
                                            {/* Progress bars behind */}
                                            <div className="absolute left-[10%] right-[10%] top-[15px] h-0.5 bg-neutral-200 -z-10"></div>
                                            <div 
                                              className="absolute left-[10%] top-[15px] h-0.5 bg-[#7c562d] transition-all duration-500 -z-10 animate-pulse"
                                              style={{ 
                                                width: `${
                                                  order.status === 'pending' ? '0%' :
                                                  order.status === 'confirmed' ? '25%' :
                                                  order.status === 'preparing' ? '50%' :
                                                  order.status === 'ready' ? '75%' : '80%'
                                                }`
                                              }}
                                            ></div>
                                            
                                            {/* Step 1: Placed */}
                                            {renderStepItem(1, 'Placed', 'pending', order.status, <FileText className="w-3.5 h-3.5" />)}
                                            {/* Step 2: Confirmed */}
                                            {renderStepItem(2, 'Confirmed', 'confirmed', order.status, <CheckSquare className="w-3.5 h-3.5" />)}
                                            {/* Step 3: Kitchen */}
                                            {renderStepItem(3, 'Preparing', 'preparing', order.status, <ChefHat className="w-3.5 h-3.5" />)}
                                            {/* Step 4: Ready */}
                                            {renderStepItem(4, 'Ready', 'ready', order.status, <ShoppingBag className="w-3.5 h-3.5" />)}
                                            {/* Step 5: Completed */}
                                            {renderStepItem(5, 'Completed', 'completed', order.status, <CheckCircle2 className="w-3.5 h-3.5" />)}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="bg-red-50 border border-red-100 p-4 rounded text-center text-xs text-red-700 font-medium flex items-center justify-center gap-1.5">
                                          <AlertCircle className="w-4 h-4 text-red-600" />
                                          <span>This order was cancelled. Please contact us for support.</span>
                                        </div>
                                      )}

                                      <h6 className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Ordered Items</h6>
                                      
                                      <div className="divide-y divide-neutral-100 border border-neutral-100 rounded overflow-hidden bg-white">
                                        {order.items?.map((item, idx) => (
                                          <div key={idx} className="p-3 flex items-center justify-between text-xs text-neutral-700 bg-neutral-50/10">
                                            <div className="flex items-start gap-3">
                                              <span className="font-semibold text-neutral-800">x{item.quantity}</span>
                                              <div>
                                                <p className="font-medium text-neutral-900">{item.menuItem?.name || 'Unknown Item'}</p>
                                                <p className="text-[10px] text-neutral-400 font-light mt-0.5">{item.menuItem?.category}</p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                              <span className="font-semibold text-neutral-800">
                                                ${((item.menuItem?.price || 0) * item.quantity).toFixed(2)}
                                              </span>
                                              {item.menuItem && (order.status === 'completed' || order.status === 'ready' || order.status === 'preparing' || order.status === 'confirmed') && (
                                                <Link
                                                  to={`/menu?select=${item.menuItem._id}`}
                                                  className="text-[9px] text-[#7c562d] hover:text-[#634423] font-bold border border-[#7c562d]/25 hover:border-[#7c562d]/50 px-2 py-0.5 rounded transition-all duration-300 whitespace-nowrap"
                                                >
                                                  Write Review
                                                </Link>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-neutral-50 rounded border border-neutral-100 text-[11px] text-neutral-500">
                                        <p>Contact Details: <strong className="text-neutral-800">{order.customerEmail}</strong></p>
                                        <p>Order ID: <span className="font-mono text-neutral-700">{order._id}</span></p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-[#fcfcfa] p-8 rounded border border-neutral-100 shadow-sm space-y-6 max-w-xl animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-light text-neutral-900">Personal Information</h3>
                  <p className="text-neutral-400 text-xs font-light">Update your profile display name, email, and password settings.</p>
                </div>

                {profileSuccess && (
                  <div className="flex items-center gap-2.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-3 rounded">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div className="flex items-center gap-2.5 text-xs text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  {/* Name field */}
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
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        placeholder="John Doe"
                        className="w-full bg-white border border-neutral-200 focus:border-[#7c562d]/50 focus:ring-4 focus:ring-[#7c562d]/10 rounded pl-10 pr-4 py-3 text-sm focus:outline-none transition-all duration-300 text-neutral-900 font-medium"
                      />
                    </div>
                  </div>

                  {/* Email field */}
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
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        placeholder="john.doe@example.com"
                        className="w-full bg-white border border-neutral-200 focus:border-[#7c562d]/50 focus:ring-4 focus:ring-[#7c562d]/10 rounded pl-10 pr-4 py-3 text-sm focus:outline-none transition-all duration-300 text-neutral-900 font-medium"
                      />
                    </div>
                  </div>

                  {/* Separator for password update */}
                  <div className="pt-2 border-t border-neutral-100 space-y-1">
                    <h4 className="text-xs font-semibold text-neutral-800">Change Password</h4>
                    <p className="text-[10px] text-neutral-400 font-light">Leave blank if you don't want to change your current password.</p>
                  </div>

                  {/* Password field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">New Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        name="password"
                        value={profileForm.password}
                        onChange={handleProfileChange}
                        placeholder="••••••••"
                        className="w-full bg-white border border-neutral-200 focus:border-[#7c562d]/50 focus:ring-4 focus:ring-[#7c562d]/10 rounded pl-10 pr-4 py-3 text-sm focus:outline-none transition-all duration-300 text-neutral-900 font-medium"
                      />
                    </div>
                  </div>

                  {/* Confirm Password field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">Confirm New Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={profileForm.confirmPassword}
                        onChange={handleProfileChange}
                        placeholder="••••••••"
                        className="w-full bg-white border border-neutral-200 focus:border-[#7c562d]/50 focus:ring-4 focus:ring-[#7c562d]/10 rounded pl-10 pr-4 py-3 text-sm focus:outline-none transition-all duration-300 text-neutral-900 font-medium"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="w-full bg-[#7c562d] hover:bg-[#634423] text-white font-medium py-3 rounded text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      'Save Profile Details'
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
