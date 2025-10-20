import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as integrationService from '../services/integrationService.js';
import * as usageService from '../services/usageService.js';
import { getSupportedProviders } from '../integrations/index.js';
import scheduler from '../services/scheduler.js';

const router = express.Router();

/**
 * GET /api/integrations/providers
 * Get list of supported providers
 */
router.get('/providers', asyncHandler(async (req, res) => {
  const providers = getSupportedProviders();
  
  res.json({
    success: true,
    data: providers
  });
}));

/**
 * POST /api/integrations
 * Create a new integration
 */
router.post('/', asyncHandler(async (req, res) => {
  const integration = await integrationService.createIntegration(req.body);
  
  // Reload scheduler to pick up new integration immediately
  await scheduler.loadIntegrations();
  
  res.status(201).json({
    success: true,
    data: integration,
    message: 'Integration created successfully'
  });
}));

/**
 * GET /api/integrations
 * List all integrations
 */
router.get('/', asyncHandler(async (req, res) => {
  const filters = {};
  
  if (req.query.active !== undefined) {
    filters.active = req.query.active === 'true';
  }
  
  if (req.query.provider) {
    filters.provider = req.query.provider;
  }

  const integrations = await integrationService.getIntegrations(filters);
  
  res.json({
    success: true,
    data: integrations,
    count: integrations.length
  });
}));

/**
 * GET /api/integrations/:id
 * Get a single integration
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const integration = await integrationService.getIntegrationById(req.params.id);
  
  // Don't expose encrypted or decrypted API key in response
  delete integration.api_key_enc;
  delete integration.api_key;
  
  res.json({
    success: true,
    data: integration
  });
}));

/**
 * PUT /api/integrations/:id
 * Update an integration
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const integration = await integrationService.updateIntegration(req.params.id, req.body);
  
  // Reload scheduler to pick up changes immediately
  await scheduler.loadIntegrations();
  
  res.json({
    success: true,
    data: integration,
    message: 'Integration updated successfully'
  });
}));

/**
 * DELETE /api/integrations/:id
 * Delete (deactivate) an integration
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  await integrationService.deleteIntegration(req.params.id);
  
  // Reload scheduler to remove deactivated integration immediately
  await scheduler.loadIntegrations();
  
  res.json({
    success: true,
    message: 'Integration deactivated successfully'
  });
}));

/**
 * DELETE /api/integrations/:id/permanent
 * Permanently delete an integration
 */
router.delete('/:id/permanent', asyncHandler(async (req, res) => {
  await integrationService.hardDeleteIntegration(req.params.id);
  
  // Reload scheduler to remove deleted integration immediately
  await scheduler.loadIntegrations();
  
  res.json({
    success: true,
    message: 'Integration permanently deleted'
  });
}));

/**
 * GET /api/integrations/:id/usage
 * Get usage metrics for an integration
 */
router.get('/:id/usage', asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const usage = await usageService.getUsageStats(req.params.id, days);
  const todayUsage = await usageService.getTodayUsage(req.params.id);
  
  res.json({
    success: true,
    data: {
      today: todayUsage,
      history: usage
    }
  });
}));

export default router;
