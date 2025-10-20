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

/**
 * GET /api/monitoring/requests
 * Get recent API requests log
 */
router.get('/requests', asyncHandler(async (req, res) => {
  const integrationId = req.query.integrationId;
  const limit = parseInt(req.query.limit) || 100;
  
  const requests = await usageService.getRecentRequests(integrationId, limit);
  
  res.json({
    success: true,
    data: requests,
    count: requests.length
  });
}));

/**
 * GET /api/monitoring/requests/stats/:integrationId
 * Get request statistics for an integration
 */
router.get('/requests/stats/:integrationId', asyncHandler(async (req, res) => {
  const { integrationId } = req.params;
  const hours = parseInt(req.query.hours) || 24;
  
  const stats = await usageService.getRequestStats(integrationId, hours);
  
  res.json({
    success: true,
    data: stats
  });
}));

/**
 * GET /api/monitoring/conversions
 * Get recent user conversions
 */
router.get('/conversions', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  
  const conversions = await usageService.getRecentConversions(limit);
  
  res.json({
    success: true,
    data: conversions,
    count: conversions.length
  });
}));

/**
 * GET /api/monitoring/conversions/popular
 * Get popular currency pairs
 */
router.get('/conversions/popular', asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const limit = parseInt(req.query.limit) || 10;
  
  const pairs = await usageService.getPopularPairs(days, limit);
  
  res.json({
    success: true,
    data: pairs
  });
}));

export default router;
