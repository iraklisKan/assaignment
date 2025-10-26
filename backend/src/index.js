import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { initRedis, closeRedis } from './config/redis.js';
import { closePool } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import scheduler from './services/scheduler.js';

// Import routes
import integrationsRoutes from './routes/integrations.js';
import ratesRoutes from './routes/rates.js';
import convertRoutes from './routes/convert.js';
import monitoringRoutes from './routes/monitoring.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Currency Exchange API Docs'
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/integrations', integrationsRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/convert', convertRoutes);
app.use('/api/monitoring', monitoringRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

/**
 * Initialize and start the server
 * Initializes Redis, starts the scheduler, and starts the Express server
 * @async
 * @returns {Promise<void>}
 */
const startServer = async () => {
  try {
    console.log('Initializing Currency Exchange Rate Hub...');
    
    // Initialize Redis (with fallback)
    await initRedis();
    
    // Start scheduler
    await scheduler.start();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Gracefully shutdown the server
 * Stops the scheduler, closes Redis and database connections
 * @async
 * @returns {Promise<void>}
 */
const shutdown = async () => {
  console.log('\nShutting down gracefully...');
  
  scheduler.stop();
  await closeRedis();
  await closePool();
  
  console.log('Shutdown complete');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
startServer();

export default app;
