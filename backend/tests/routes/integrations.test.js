/**
 * Integrations Routes Tests
 * API endpoint tests for integration management
 */

import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Mock the integration service
const mockGetAll = jest.fn();
const mockGetById = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockGetProviders = jest.fn();
const mockGetActiveIntegrationsWithKeys = jest.fn();

jest.unstable_mockModule('../../src/services/integrationService.js', () => ({
  getAllIntegrations: mockGetAll,
  getIntegrationById: mockGetById,
  createIntegration: mockCreate,
  updateIntegration: mockUpdate,
  deleteIntegration: mockDelete,
  getSupportedProviders: mockGetProviders,
  getActiveIntegrationsWithKeys: mockGetActiveIntegrationsWithKeys,
}));

// Mock the usage service
jest.unstable_mockModule('../../src/services/usageService.js', () => ({
  getIntegrationUsageStats: jest.fn(),
  logRateRequest: jest.fn(),
  logConversion: jest.fn(),
}));

// Mock the integrations index
jest.unstable_mockModule('../../src/integrations/index.js', () => ({
  getSupportedProviders: jest.fn().mockReturnValue([]),
}));

// Mock the scheduler
jest.unstable_mockModule('../../src/services/scheduler.js', () => ({
  default: {
    loadIntegrations: jest.fn(),
  },
}));

const { default: integrationsRouter } = await import('../../src/routes/integrations.js');

const integrationService = {
  getAllIntegrations: mockGetAll,
  getIntegrationById: mockGetById,
  createIntegration: mockCreate,
  updateIntegration: mockUpdate,
  deleteIntegration: mockDelete,
  getSupportedProviders: mockGetProviders,
};

const app = express();
app.use(express.json());
app.use('/api/integrations', integrationsRouter);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    error: err.message,
  });
});

describe('Integrations API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/integrations', () => {
    it('should return list of integrations', async () => {
      const mockIntegrations = [
        {
          id: '1',
          name: 'Test Integration',
          provider: 'exchangerate-api',
          active: true,
        },
      ];

      integrationService.getAllIntegrations.mockResolvedValue(mockIntegrations);

      const response = await request(app)
        .get('/api/integrations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockIntegrations);
      expect(response.body.count).toBe(1);
    });

    it('should filter by active status', async () => {
      integrationService.getAllIntegrations.mockResolvedValue([]);

      await request(app)
        .get('/api/integrations?active=true')
        .expect(200);

      expect(integrationService.getAllIntegrations).toHaveBeenCalledWith({ active: true });
    });

    it('should handle service errors', async () => {
      integrationService.getAllIntegrations.mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .get('/api/integrations')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/integrations', () => {
    it('should create new integration', async () => {
      const newIntegration = {
        name: 'New Integration',
        provider: 'exchangerate-api',
        baseUrl: 'https://api.example.com',
        apiKey: 'test-key',
        priority: 100,
        pollIntervalSeconds: 300,
      };

      const createdIntegration = {
        id: 'new-id',
        ...newIntegration,
      };

      integrationService.createIntegration.mockResolvedValue(createdIntegration);

      const response = await request(app)
        .post('/api/integrations')
        .send(newIntegration)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(createdIntegration);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'Test',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/integrations')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/integrations/:id', () => {
    it('should return single integration', async () => {
      const mockIntegration = {
        id: 'test-id',
        name: 'Test Integration',
        provider: 'exchangerate-api',
      };

      integrationService.getIntegrationById.mockResolvedValue(mockIntegration);

      const response = await request(app)
        .get('/api/integrations/test-id')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockIntegration);
    });

    it('should return 404 for non-existent integration', async () => {
      integrationService.getIntegrationById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/integrations/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/integrations/:id', () => {
    it('should update integration', async () => {
      const updateData = {
        name: 'Updated Name',
        priority: 50,
      };

      const updatedIntegration = {
        id: 'test-id',
        ...updateData,
      };

      integrationService.updateIntegration.mockResolvedValue(updatedIntegration);

      const response = await request(app)
        .put('/api/integrations/test-id')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedIntegration);
    });
  });

  describe('DELETE /api/integrations/:id', () => {
    it('should deactivate integration', async () => {
      integrationService.deleteIntegration.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/integrations/test-id')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deactivated');
    });

    it('should return 404 if integration not found', async () => {
      integrationService.deleteIntegration.mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/integrations/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/integrations/providers', () => {
    it('should return list of supported providers', async () => {
      const mockProviders = [
        { id: 'exchangerate-api', name: 'ExchangeRate-API' },
        { id: 'fixer', name: 'Fixer.io' },
      ];

      integrationService.getSupportedProviders.mockReturnValue(mockProviders);

      const response = await request(app)
        .get('/api/integrations/providers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProviders);
    });
  });
});
