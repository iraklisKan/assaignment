import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as ratesService from '../services/ratesService.js';

const router = express.Router();

/**
 * GET /api/convert
 * Convert currency amount
 */
router.get('/', asyncHandler(async (req, res) => {
  const { from, to, amount } = req.query;
  
  const result = await ratesService.convertCurrency(from, to, amount);
  
  res.json({
    success: true,
    data: result
  });
}));

export default router;
