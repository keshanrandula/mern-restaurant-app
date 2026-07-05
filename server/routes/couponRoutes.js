import express from 'express';
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/couponController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

router.route('/validate')
  .post(validateCoupon);

router.route('/:id')
  .delete(protect, admin, deleteCoupon);

export default router;
