import Coupon from '../models/Coupon.js';

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, isActive } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await coupon.deleteOne();
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of $${coupon.minOrderAmount.toFixed(2)} required for this coupon`
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = orderAmount * (coupon.discountValue / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed order amount
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
