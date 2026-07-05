import express from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getMyOrders,
  getOrderAnalytics,
} from '../controllers/orderController.js';

import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getOrders)
  .post(createOrder);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/analytics')
  .get(protect, admin, getOrderAnalytics);

router.route('/:id')
  .get(protect, admin, getOrderById)
  .put(protect, admin, updateOrderStatus);

export default router;
