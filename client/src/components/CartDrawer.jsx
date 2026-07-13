import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, CreditCard, Wallet, Smartphone, ShieldCheck, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const getCardBrand = (number) => {
  if (!number) return 'Card';
  const cleanNumber = number.replace(/\s/g, '');
  if (cleanNumber.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'American Express';
  return 'Card';
};

export default function CartDrawer() {
  const { 
    cartItems, 
    isCartOpen, 
    toggleCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    totalPrice 
  } = useCart();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'checkout', 'success'
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'wallet', 'counter'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    addressOrTable: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const [orderResult, setOrderResult] = useState(null);
  const [cardErrors, setCardErrors] = useState({});
  const [show3DSecureModal, setShow3DSecureModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [stripeVerifying, setStripeVerifying] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountType, discountValue, minOrderAmount }
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Calculate active discount
  let activeDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      activeDiscountAmount = totalPrice * (appliedCoupon.discountValue / 100);
    } else {
      activeDiscountAmount = appliedCoupon.discountValue;
    }
    if (activeDiscountAmount > totalPrice) {
      activeDiscountAmount = totalPrice;
    }
  }

  // Remove coupon if cart total falls below the minimum order amount requirement
  useEffect(() => {
    if (appliedCoupon && totalPrice < appliedCoupon.minOrderAmount) {
      setAppliedCoupon(null);
      setCouponSuccess('');
      setCouponError(`Coupon removed: minimum order of $${appliedCoupon.minOrderAmount} required.`);
    }
  }, [totalPrice, appliedCoupon]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    setValidatingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderAmount: totalPrice })
      });
      const data = await response.json();

      if (response.ok) {
        setAppliedCoupon({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          minOrderAmount: data.minOrderAmount || 0
        });
        setCouponSuccess(`Promo '${data.code}' applied!`);
        setCouponCode('');
      } else {
        setCouponError(data.message || 'Invalid promo code');
      }
    } catch (err) {
      setCouponError('Error validating promo code.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  if (!isCartOpen) return null;

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'cardNumber') {
      const digitsOnly = value.replace(/\D/g, '');
      const formatted = digitsOnly.match(/.{1,4}/g)?.join(' ') || digitsOnly;
      value = formatted.substring(0, 19);
    } else if (name === 'expiry') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length > 2) {
        value = `${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2, 4)}`;
      } else {
        value = digitsOnly;
      }
      value = value.substring(0, 5);
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 4);
    }
    
    setFormData({ ...formData, [name]: value });
    if (cardErrors[name]) {
      setCardErrors({ ...cardErrors, [name]: '' });
    }
  };

  const submitOrderToBackend = async () => {
    const orderItems = cartItems.map(item => ({
      menuItem: item._id,
      quantity: item.quantity
    }));

    const payload = {
      customerName: formData.name,
      customerEmail: formData.email || 'customer@example.com',
      customerPhone: formData.phone,
      type: 'order',
      reservationDetails: {
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        guests: 1
      },
      items: orderItems,
      totalAmount: totalPrice - activeDiscountAmount,
      couponApplied: appliedCoupon ? appliedCoupon.code : '',
      discountAmount: activeDiscountAmount,
      paymentMethod: paymentMethod,
      paymentDetails: paymentMethod === 'card' ? {
        cardName: formData.cardName,
        last4: formData.cardNumber.replace(/\s/g, '').slice(-4) || '4444',
        cardBrand: getCardBrand(formData.cardNumber)
      } : null
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        setOrderResult(data);
        setCheckoutStep('success');
        clearCart();
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponSuccess('');
      } else {
        alert(data.message || 'Failed to submit order');
      }
    } catch (err) {
      console.log('Backend offline, simulating checkout success.');
      setOrderResult({
        ...payload,
        _id: Math.random().toString(36).substring(7).toUpperCase()
      });
      setCheckoutStep('success');
      clearCart();
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponSuccess('');
    } finally {
      setLoading(false);
      setShow3DSecureModal(false);
      setOtpCode('');
      setOtpError('');
    }
  };

  const handleVerifyOTP = () => {
    if (otpCode !== '1234') {
      setOtpError('Invalid authorization passcode. Please enter 1234.');
      return;
    }
    
    setStripeVerifying(true);
    setOtpError('');
    setTimeout(() => {
      setStripeVerifying(false);
      submitOrderToBackend();
    }, 1200);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (paymentMethod === 'card') {
      const errors = {};
      
      // Cardholder Name validation
      if (!formData.cardName.trim()) {
        errors.cardName = 'Cardholder name is required';
      } else if (formData.cardName.trim().length < 3) {
        errors.cardName = 'Name must be at least 3 characters';
      }

      // Card Number validation
      const cleanCardNum = formData.cardNumber.replace(/\s/g, '');
      if (!cleanCardNum) {
        errors.cardNumber = 'Card number is required';
      } else if (!/^\d{15,16}$/.test(cleanCardNum)) {
        errors.cardNumber = 'Card number must be 15 or 16 digits';
      }

      // Expiry Date validation
      const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
      if (!formData.expiry) {
        errors.expiry = 'Expiry date is required';
      } else if (!expiryPattern.test(formData.expiry)) {
        errors.expiry = 'Must be in MM/YY format';
      } else {
        const [expMonthStr, expYearStr] = formData.expiry.split('/');
        const expMonth = parseInt(expMonthStr, 10);
        const expYear = parseInt('20' + expYearStr, 10);

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
          errors.expiry = 'Card has expired';
        }
      }

      // CVV validation
      if (!formData.cvv) {
        errors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        errors.cvv = 'Must be 3 or 4 digits';
      }

      if (Object.keys(errors).length > 0) {
        setCardErrors(errors);
        return;
      }
      
      setCardErrors({});
      setLoading(true);
      setStripeVerifying(true);

      // Contact Stripe API for 1.2s
      setTimeout(() => {
        setStripeVerifying(false);
        setShow3DSecureModal(true);
      }, 1200);

    } else {
      setLoading(true);
      submitOrderToBackend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={toggleCart}></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md h-full bg-[#ffffff] shadow-2xl flex flex-col justify-between border-l border-neutral-100 animate-slide-in">
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-wider text-neutral-800 uppercase flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#7c562d]" /> 
              {checkoutStep === 'cart' && 'Your Cart'}
              {checkoutStep === 'checkout' && 'Checkout'}
              {checkoutStep === 'success' && 'Order Placed'}
            </h2>
            <button onClick={toggleCart} className="text-neutral-400 hover:text-neutral-700 transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
            {checkoutStep === 'cart' && (
              <>
                {cartItems.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto" />
                    <p className="text-neutral-500 text-sm font-light">Your cart is empty.</p>
                    <button 
                      onClick={toggleCart}
                      className="bg-[#7c562d] hover:bg-[#634423] text-white text-xs uppercase tracking-widest font-semibold px-6 py-2.5 rounded"
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 divide-y divide-neutral-100">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex gap-4 pt-4 first:pt-0">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border border-neutral-100" />
                        <div className="flex-grow space-y-1">
                          <h4 className="font-semibold text-neutral-800 text-sm leading-tight">{item.name}</h4>
                          <p className="text-xs text-neutral-400 font-semibold">${item.price.toFixed(2)}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <button 
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-6 h-6 border border-neutral-200 rounded flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-semibold text-neutral-800 w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-6 h-6 border border-neutral-200 rounded flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item._id)} className="text-neutral-400 hover:text-red-500 text-xs self-start transition-colors">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {checkoutStep === 'checkout' && (
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-1.5">Delivery & Contact</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      value={formData.name} 
                      onChange={handleInputChange}
                      placeholder="Jane Doe" 
                      className="w-full bg-white border border-neutral-200 focus:border-[#7c562d]/50 rounded px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider">Phone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      required 
                      value={formData.phone} 
                      onChange={handleInputChange}
                      placeholder="+94 77 123 4567" 
                      className="w-full bg-white border border-neutral-200 focus:border-[#7c562d]/50 rounded px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider">Table / Address</label>
                    <input 
                      type="text" 
                      name="addressOrTable" 
                      required 
                      value={formData.addressOrTable} 
                      onChange={handleInputChange}
                      placeholder="Table #4 or Address" 
                      className="w-full bg-white border border-neutral-200 focus:border-[#7c562d]/50 rounded px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider">Email (Optional)</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange}
                      placeholder="jane@example.com" 
                      className="w-full bg-white border border-neutral-200 focus:border-[#7c562d]/50 rounded px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Mock Payment Options */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-1.5">Simulated Payment</h3>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex flex-col items-center justify-center py-2 px-1 border rounded transition-all ${
                        paymentMethod === 'card' 
                          ? 'border-[#7c562d] bg-amber-50/20 text-[#7c562d]' 
                          : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mb-1" />
                      <span className="text-[9px] uppercase tracking-wider font-semibold">Mock Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`flex flex-col items-center justify-center py-2 px-1 border rounded transition-all ${
                        paymentMethod === 'wallet' 
                          ? 'border-[#7c562d] bg-amber-50/20 text-[#7c562d]' 
                          : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 mb-1" />
                      <span className="text-[9px] uppercase tracking-wider font-semibold">Mock Wallet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('counter')}
                      className={`flex flex-col items-center justify-center py-2 px-1 border rounded transition-all ${
                        paymentMethod === 'counter' 
                          ? 'border-[#7c562d] bg-amber-50/20 text-[#7c562d]' 
                          : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                      }`}
                    >
                      <Wallet className="w-4 h-4 mb-1" />
                      <span className="text-[9px] uppercase tracking-wider font-semibold">Pay Counter</span>
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="bg-[#fcfcfa] border border-neutral-250 rounded-lg p-4 space-y-3 font-sans shadow-sm">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Card Details</span>
                        <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded border transition-colors ${
                          getCardBrand(formData.cardNumber) === 'Visa' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                          getCardBrand(formData.cardNumber) === 'Mastercard' ? 'text-orange-700 bg-orange-50 border-orange-200' :
                          getCardBrand(formData.cardNumber) === 'American Express' ? 'text-cyan-700 bg-cyan-50 border-cyan-200' :
                          'text-neutral-500 bg-neutral-50 border-neutral-200'
                        }`}>
                          {getCardBrand(formData.cardNumber)}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Cardholder Name</label>
                        <input 
                          type="text" 
                          name="cardName" 
                          value={formData.cardName} 
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className={`w-full bg-white border rounded px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#7c562d]/20 transition-all ${
                            cardErrors.cardName ? 'border-red-500' : 'border-neutral-200 focus:border-[#7c562d]/50'
                          }`} 
                        />
                        {cardErrors.cardName && <p className="text-[9px] text-red-500 font-semibold">{cardErrors.cardName}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Card Number</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            name="cardNumber" 
                            value={formData.cardNumber} 
                            onChange={handleInputChange}
                            placeholder="4111 2222 3333 4444"
                            className={`w-full bg-white border rounded pl-3 pr-10 py-2 text-xs text-neutral-850 focus:outline-none focus:ring-2 focus:ring-[#7c562d]/20 transition-all ${
                              cardErrors.cardNumber ? 'border-red-500' : 'border-neutral-200 focus:border-[#7c562d]/50'
                            }`} 
                          />
                          <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400">
                            <CreditCard className="w-4 h-4 text-neutral-300" />
                          </span>
                        </div>
                        {cardErrors.cardNumber && <p className="text-[9px] text-red-500 font-semibold">{cardErrors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">Expiry</label>
                          <input 
                            type="text" 
                            name="expiry" 
                            value={formData.expiry} 
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            className={`w-full bg-white border rounded px-3 py-2 text-xs text-neutral-800 text-center focus:outline-none focus:ring-2 focus:ring-[#7c562d]/20 transition-all ${
                              cardErrors.expiry ? 'border-red-500' : 'border-neutral-200 focus:border-[#7c562d]/50'
                            }`} 
                          />
                          {cardErrors.expiry && <p className="text-[9px] text-red-500 font-semibold text-center">{cardErrors.expiry}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">CVV</label>
                          <input 
                            type="password" 
                            name="cvv" 
                            value={formData.cvv} 
                            onChange={handleInputChange}
                            placeholder="•••"
                            maxLength={4}
                            className={`w-full bg-white border rounded px-3 py-2 text-xs text-neutral-800 text-center focus:outline-none focus:ring-2 focus:ring-[#7c562d]/20 transition-all ${
                              cardErrors.cvv ? 'border-red-500' : 'border-neutral-200 focus:border-[#7c562d]/50'
                            }`} 
                          />
                          {cardErrors.cvv && <p className="text-[9px] text-red-500 font-semibold text-center">{cardErrors.cvv}</p>}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2 border-t border-neutral-100/50 text-[10px] text-neutral-500">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Simulated checkout protected by Stripe SSL.</span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'wallet' && (
                    <div className="bg-[#fcfcfa] border border-neutral-200 rounded p-4 text-center space-y-2">
                      <Smartphone className="w-8 h-8 text-neutral-400 mx-auto" />
                      <p className="text-xs text-neutral-500 font-light">
                        Simulating Apple Pay & Google Pay checkout session. No signature required.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'counter' && (
                    <div className="bg-[#fcfcfa] border border-neutral-200 rounded p-4 text-center space-y-2">
                      <Wallet className="w-8 h-8 text-neutral-400 mx-auto" />
                      <p className="text-xs text-neutral-500 font-light">
                        Submit the order and pay directly at the hotel counter (Cash or POS card swipe).
                      </p>
                    </div>
                  )}
                </div>

              </form>
            )}

            {checkoutStep === 'success' && (
              <div className="text-center py-12 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-light font-serif text-neutral-900">Order Successful</h3>
                  <p className="text-neutral-500 text-xs leading-relaxed font-light">
                    Thank you, <span className="text-neutral-800 font-semibold">{formData.name}</span>. Your mock checkout completed successfully.
                  </p>
                </div>
                <div className="bg-[#fcfcfa] border border-neutral-100 rounded p-4 text-left space-y-1.5 text-xs text-neutral-600">
                  <p><span className="font-semibold text-neutral-800">Order ID:</span> {orderResult?._id}</p>
                  <p>
                    <span className="font-semibold text-neutral-800">Amount Paid:</span> ${orderResult?.totalAmount?.toFixed(2)}
                    {orderResult?.discountAmount > 0 && (
                      <span className="text-emerald-600 font-medium ml-1.5">
                        (Saved ${orderResult.discountAmount.toFixed(2)} via {orderResult.couponApplied})
                      </span>
                    )}
                  </p>
                  <p>
                    <span className="font-semibold text-neutral-800">Payment:</span> Simulated via {orderResult?.paymentMethod?.toUpperCase()}
                    {orderResult?.paymentMethod === 'card' && orderResult?.paymentDetails && (
                      <span className="text-neutral-500 font-light ml-1">
                        ({orderResult.paymentDetails.cardBrand} ending in {orderResult.paymentDetails.last4})
                      </span>
                    )}
                  </p>
                  <p><span className="font-semibold text-neutral-800">Dest:</span> {formData.addressOrTable}</p>
                </div>
                <button
                  onClick={() => {
                    setCheckoutStep('cart');
                    toggleCart();
                  }}
                  className="w-full bg-[#7c562d] hover:bg-[#634423] text-white font-semibold py-3.5 rounded text-xs uppercase tracking-widest transition-all"
                >
                  Continue Browsing
                </button>
              </div>
            )}
          </div>

          {/* Footer calculation */}
          {checkoutStep !== 'success' && cartItems.length > 0 && (
            <div className="px-6 py-5 border-t border-neutral-100 bg-[#fcfcfa] space-y-4">
              
              {/* Promo Code input form */}
              {checkoutStep === 'cart' && (
                <div className="border-b border-neutral-100 pb-4 space-y-1.5">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Have a Promo Code?</span>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{appliedCoupon.code} ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% Off` : `$${appliedCoupon.discountValue} Off`})</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleRemoveCoupon} 
                        className="text-red-500 hover:text-red-700 font-semibold uppercase text-[10px] tracking-wider cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="ENTER CODE (e.g. WELCOME10)"
                          className="flex-grow bg-white border border-neutral-200 focus:border-[#7c562d]/50 rounded px-3 py-2 text-xs focus:outline-none uppercase text-neutral-800 font-medium"
                        />
                        <button
                          type="submit"
                          disabled={validatingCoupon || !couponCode}
                          className="bg-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 rounded text-[10px] uppercase font-semibold tracking-wider transition-colors disabled:bg-neutral-200 cursor-pointer"
                        >
                          {validatingCoupon ? '...' : 'Apply'}
                        </button>
                      </form>
                      {couponError && <p className="text-[10px] text-red-500 font-medium">{couponError}</p>}
                      {couponSuccess && <p className="text-[10px] text-emerald-600 font-medium">{couponSuccess}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* Price Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-800">${totalPrice.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-emerald-600 font-semibold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-${activeDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm font-bold text-neutral-800 border-t border-neutral-100 pt-2">
                  <span>Total Amount</span>
                  <span className="text-[#7c562d]">${(totalPrice - activeDiscountAmount).toFixed(2)}</span>
                </div>
              </div>

              {checkoutStep === 'cart' ? (
                <>
                  <p className="text-[10px] text-neutral-400 leading-normal">
                    Taxes and kitchen service charges are calculated. Tap checkout to proceed to simulated checkout gateway.
                  </p>
                  <button
                    onClick={() => setCheckoutStep('checkout')}
                    className="w-full bg-[#7c562d] hover:bg-[#634423] text-white font-semibold py-3.5 rounded text-xs uppercase tracking-widest transition-all text-center cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={loading}
                    className="flex-grow bg-[#7c562d] hover:bg-[#634423] disabled:bg-neutral-300 text-white font-semibold py-3.5 rounded text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm Payment & Order'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="border border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-semibold px-5 py-3 rounded text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stripe Authorizing Spinner Overlay */}
      {stripeVerifying && !show3DSecureModal && (
        <div className="fixed inset-0 z-[99] flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
          <div className="text-center space-y-4">
            <div className="inline-block w-12 h-12 border-4 border-[#7c562d] border-t-transparent rounded-full animate-spin"></div>
            <div className="space-y-1">
              <h4 className="text-md font-bold text-white tracking-wide flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500 animate-pulse" /> Secure Connection
              </h4>
              <p className="text-xs text-neutral-400 font-light">Contacting Stripe payment gateways & banks...</p>
            </div>
          </div>
        </div>
      )}

      {/* 3D Secure / OTP Verification Gate Modal */}
      {show3DSecureModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-100 max-w-sm w-full overflow-hidden animate-slide-in">
            {/* Header branding */}
            <div className="bg-neutral-900 text-white px-5 py-4 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-amber-500" />
                <span>Simulated Secure Authentication</span>
              </div>
              <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-bold">3D SECURE</span>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Transaction Amount</p>
                <h4 className="text-2xl font-bold text-[#7c562d]">${(totalPrice - activeDiscountAmount).toFixed(2)}</h4>
              </div>
              
              <div className="border-t border-b border-neutral-100 py-3 text-[11px] text-neutral-500 space-y-1 text-center">
                <p>Merchant: <strong>Gourmet Restaurant Systems</strong></p>
                <p>Card: <strong>{getCardBrand(formData.cardNumber)} ending in {formData.cardNumber.replace(/\s/g, '').slice(-4)}</strong></p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block text-center">Enter Mock One-Time Passcode (OTP)</label>
                <input 
                  type="text" 
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    if (otpError) setOtpError('');
                  }}
                  placeholder="Enter 1234"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded px-4 py-2.5 text-center font-bold tracking-widest text-lg focus:outline-none focus:border-[#7c562d]/50 text-neutral-850"
                />
                {otpError && <p className="text-[10px] text-red-500 font-semibold text-center">{otpError}</p>}
                <p className="text-[9px] text-neutral-400 text-center italic">
                  For this demo, please enter passcode <strong className="text-neutral-600">1234</strong> to verify purchase.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={stripeVerifying}
                  className="flex-grow bg-[#7c562d] hover:bg-[#634423] disabled:bg-neutral-300 text-white font-semibold py-2.5 rounded text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {stripeVerifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                    </>
                  ) : 'Submit Code'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShow3DSecureModal(false);
                    setOtpCode('');
                    setOtpError('');
                    setLoading(false);
                  }}
                  className="border border-neutral-200 hover:bg-neutral-50 text-neutral-500 font-semibold px-4 py-2.5 rounded text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
