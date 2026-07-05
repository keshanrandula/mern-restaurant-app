import express from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  seedMenuItems,
  createMenuItemReview,
} from '../controllers/menuController.js';

import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getMenuItems)
  .post(protect, admin, createMenuItem);

router.route('/seed')
  .post(seedMenuItems);

router.route('/:id/reviews')
  .post(protect, createMenuItemReview);

router.route('/:id')
  .get(getMenuItemById)
  .put(protect, admin, updateMenuItem)
  .delete(protect, admin, deleteMenuItem);

export default router;
