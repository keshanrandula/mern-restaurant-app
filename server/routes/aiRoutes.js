import express from 'express';
import { getAIChatCompletion } from '../controllers/aiController.js';

const router = express.Router();

router.post('/', getAIChatCompletion);

export default router;
