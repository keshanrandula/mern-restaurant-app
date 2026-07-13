import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['order', 'reservation'],
      default: 'reservation',
    },
    reservationDetails: {
      date: String,
      time: String,
      guests: Number,
      tableNumber: String,
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
        },
        quantity: Number,
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
    couponApplied: {
      type: String,
      default: '',
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      default: 'counter',
    },
    paymentDetails: {
      cardName: String,
      last4: String,
      cardBrand: String,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
