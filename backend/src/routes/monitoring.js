import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as usageService from '../services/usageService.js';
import scheduler from '../services/scheduler.js';
import { isRedisConnected } from '../config/redis.js';

const router = express.Router();

/**
 * GET /api/monitoring/health
 * Health check endpoint
 */
router.get('/health', asyncHandler(async (req, res) => {
  const schedulerStatus = scheduler.getStatus();
  
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date(),
      scheduler: schedulerStatus,
      redis: isRedisConnected() ? 'connected' : 'fallback',
      uptime: process.uptime()
    }
  });
}));

/**
 * GET /api/monitoring/usage
 * Get aggregated usage metrics
 */
router.get('/usage', asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const usage = await usageService.getAggregatedUsage(days);
  
  res.json({
    success: true,
    data: usage
  });
}));

/**
 * GET /api/monitoring/scheduler
 * Get scheduler status
 */
router.get('/scheduler', asyncHandler(async (req, res) => {
  const status = scheduler.getStatus();
  
  res.json({
    success: true,
    data: status
  });
}));

export default router;
