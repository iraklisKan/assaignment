import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as ratesService from '../services/ratesService.js';

const router = express.Router();

/**
 * GET /api/rates/currencies
 * Get list of available currencies
 */
router.get('/currencies', asyncHandler(async (req, res) => {
  const currencies = await ratesService.getAvailableCurrencies();
  
  res.json({
    success: true,
    currencies
  });
}));

/**
 * GET /api/rates
 * Get latest exchange rates
 */
router.get('/', asyncHandler(async (req, res) => {
  const filters = {
    base: req.query.base,
    target: req.query.target,
    q: req.query.q // Search query
  };

  const rates = await ratesService.getLatestRates(filters);
  
  res.json({
    success: true,
    data: rates,
    count: rates.length
  });
}));

/**
 * GET /api/rates/latest
 * Get latest exchange rates (alias for /)
 */
router.get('/latest', asyncHandler(async (req, res) => {
  const filters = {
    base: req.query.base,
    target: req.query.target,
    q: req.query.q // Search query
  };

  const rates = await ratesService.getLatestRates(filters);
  
  res.json({
    success: true,
    data: rates,
    count: rates.length
  });
}));

/**
 * GET /api/rates/history
 * Get historical exchange rates
 */
router.get('/history', asyncHandler(async (req, res) => {
  const filters = {
    base: req.query.base,
    target: req.query.target,
    start: req.query.start,
    end: req.query.end,
    limit: req.query.limit ? parseInt(req.query.limit) : 1000
  };

  const rates = await ratesService.getHistoricalRates(filters);
  
  res.json({
    success: true,
    data: rates,
    count: rates.length
  });
}));

export default router;
