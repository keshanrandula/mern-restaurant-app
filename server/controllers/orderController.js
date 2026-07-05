import Order from '../models/Order.js';

// @desc    Get all orders/reservations
// @route   GET /api/orders
// @access  Public
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('items.menuItem');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order/reservation details
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order/Reservation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new order or table reservation
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      type,
      reservationDetails,
      items,
      totalAmount,
      couponApplied,
      discountAmount,
      paymentMethod,
      paymentDetails,
    } = req.body;

    const order = new Order({
      customerName,
      customerEmail,
      customerPhone,
      type,
      reservationDetails,
      items,
      totalAmount,
      couponApplied,
      discountAmount,
      paymentMethod,
      paymentDetails,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update order/reservation status
// @route   PUT /api/orders/:id
// @access  Public
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status || order.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order/Reservation not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get logged in user orders/reservations
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerEmail: req.user.email })
      .populate('items.menuItem')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order and reservation analytics for admin
// @route   GET /api/orders/analytics
// @access  Private/Admin
export const getOrderAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('items.menuItem');

    // Basic counts and stats
    let totalRevenue = 0;
    let orderCount = 0;
    let reservationCount = 0;
    let activeReservations = 0;
    const itemSalesMap = {};

    // Daily & Monthly revenue buckets
    const dailyRevMap = {};
    const monthlyRevMap = {};

    // Get last 7 days list for structure
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      last7Days.push(dateStr);
      dailyRevMap[dateStr] = 0;
    }

    // Get last 6 months list for structure
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
      last6Months.push(monthStr);
      monthlyRevMap[monthStr] = 0;
    }

    orders.forEach((ord) => {
      const date = new Date(ord.createdAt);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const monthStr = date.toLocaleDateString('en-US', { month: 'short' });

      if (ord.type === 'order') {
        orderCount++;
        if (ord.status !== 'cancelled') {
          const amt = ord.totalAmount || 0;
          totalRevenue += amt;

          // Bucket Daily revenue
          if (dailyRevMap[dateStr] !== undefined) {
            dailyRevMap[dateStr] += amt;
          }
          // Bucket Monthly revenue
          if (monthlyRevMap[monthStr] !== undefined) {
            monthlyRevMap[monthStr] += amt;
          }

          // Item sales details
          if (ord.items && ord.items.length > 0) {
            ord.items.forEach((item) => {
              if (item.menuItem) {
                const name = item.menuItem.name;
                const qty = item.quantity || 0;
                const price = item.menuItem.price || 0;
                if (!itemSalesMap[name]) {
                  itemSalesMap[name] = {
                    name,
                    quantity: 0,
                    revenue: 0,
                    image: item.menuItem.image
                  };
                }
                itemSalesMap[name].quantity += qty;
                itemSalesMap[name].revenue += qty * price;
              }
            });
          }
        }
      } else if (ord.type === 'reservation') {
        reservationCount++;
        if (ord.status !== 'cancelled' && ord.status !== 'completed') {
          activeReservations++;
        }
      }
    });

    // Format maps into arrays
    const revenueDaily = last7Days.map(date => ({
      label: date,
      value: Number(dailyRevMap[date].toFixed(2))
    }));

    const revenueMonthly = last6Months.map(month => ({
      label: month,
      value: Number(monthlyRevMap[month].toFixed(2))
    }));

    const bestSellers = Object.values(itemSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Active reservations count by date
    const reservationDates = {};
    orders.forEach((ord) => {
      if (ord.type === 'reservation' && ord.status !== 'cancelled' && ord.status !== 'completed') {
        if (ord.reservationDetails && ord.reservationDetails.date) {
          const rDate = ord.reservationDetails.date;
          const parsedD = new Date(rDate);
          const formattedRDate = isNaN(parsedD.getTime()) 
            ? rDate 
            : parsedD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          reservationDates[formattedRDate] = (reservationDates[formattedRDate] || 0) + 1;
        }
      }
    });

    const upcomingReservations = Object.entries(reservationDates)
      .map(([date, count]) => ({ label: date, value: count }))
      .slice(0, 7);

    res.json({
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        orderCount,
        reservationCount,
        activeReservations,
        averageOrderValue: orderCount > 0 ? Number((totalRevenue / orderCount).toFixed(2)) : 0
      },
      revenueDaily,
      revenueMonthly,
      bestSellers,
      upcomingReservations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

