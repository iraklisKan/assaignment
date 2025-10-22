/*
 * =============================================================================
 * RATE SCHEDULER - THE HEART OF THE SYSTEM
 * =============================================================================
 * This is the engine that automatically fetches exchange rates from all 
 * active integrations on a schedule. Think of it as a robot that wakes up
 * every X seconds and asks each API provider for the latest rates.
 * 
 * How it works:
 * 1. Loads all active integrations from database (with decrypted API keys)
 * 2. Creates a timer for each integration based on their poll interval
 * 3. When timer fires, fetch rates for USD, EUR, GBP, and JPY
 * 4. Store all rates in database and cache them in Redis
 * 5. Track API usage and errors
 * 6. Repeat forever (or until stopped)
 * 
 * Smart features:
 * - Automatically picks up new integrations without restart
 * - Handles API failures gracefully (retries, error logging)
 * - Monitors API usage to warn when approaching limits
 * - Can be triggered manually for immediate updates
 * =============================================================================
 */

import cron from 'node-cron';
import { getActiveIntegrationsWithKeys } from '../services/integrationService.js';
import { fetchAndStoreRates } from './schedulerTasks.js';

class RateScheduler {
  constructor() {
    // Map to store all scheduled jobs: integrationId → {task, interval, integration}
    this.jobs = new Map();
    this.isRunning = false;
  }

  // Fire up the scheduler - start monitoring all active integrations
  async start() {
    if (this.isRunning) {
      console.log('Scheduler already running');
      return;
    }

    console.log('Starting rate scheduler...');
    this.isRunning = true;

    // Load all active integrations and create jobs for them
    await this.loadIntegrations();

    // Every 5 minutes, check if integrations were added/removed/modified
    // This lets us pick up changes without restarting the server
    cron.schedule('*/5 * * * *', async () => {
      await this.loadIntegrations();
    });
  }

  // Shut down the scheduler - stop all ongoing jobs
  stop() {
    console.log('Stopping rate scheduler...');
    this.isRunning = false;
    
    // Cancel all timers
    for (const [integrationId, job] of this.jobs) {
      if (job.task) {
        clearInterval(job.task);
      }
    }
    
    this.jobs.clear();
  }

  // Reload integrations from database and sync scheduled jobs
  async loadIntegrations() {
    try {
      // Fetch all active integrations with their decrypted API keys
      const integrations = await getActiveIntegrationsWithKeys();
      
      // Clean up: Remove jobs for integrations that were deleted or deactivated
      for (const [integrationId, job] of this.jobs) {
        const stillActive = integrations.find(i => i.id === integrationId);
        if (!stillActive) {
          console.log(`Removing job for integration ${integrationId}`);
          if (job.task) {
            clearInterval(job.task);
          }
          this.jobs.delete(integrationId);
        }
      }

      // Add or update jobs for all active integrations
      for (const integration of integrations) {
        const existingJob = this.jobs.get(integration.id);
        
        // If the poll interval changed, restart the job with new timing
        if (existingJob && existingJob.interval !== integration.poll_interval_seconds) {
          console.log(`Updating job for integration ${integration.name}`);
          clearInterval(existingJob.task);
          this.jobs.delete(integration.id);
        }

        // Create a new job if one doesn't exist
        if (!this.jobs.has(integration.id)) {
          console.log(`Scheduling job for integration ${integration.name} (every ${integration.poll_interval_seconds}s)`);
          this.scheduleIntegration(integration);
        }
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
    }
  }

  // Create a recurring job for one integration
  scheduleIntegration(integrationConfig) {
    const intervalMs = integrationConfig.poll_interval_seconds * 1000;

    // Run immediately
    fetchAndStoreRates(integrationConfig);

    // Schedule recurring task
    const task = setInterval(() => {
      fetchAndStoreRates(integrationConfig);
    }, intervalMs);

    this.jobs.set(integrationConfig.id, {
      integration: integrationConfig,
      interval: integrationConfig.poll_interval_seconds,
      task
    });
  }

  /**
   * Manually trigger fetch for a specific integration
   */
  async triggerFetch(integrationId) {
    const job = this.jobs.get(integrationId);
    
    if (!job) {
      throw new Error('Integration not found or not scheduled');
    }

    await fetchAndStoreRates(job.integration);
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      running: this.isRunning,
      activeJobs: this.jobs.size,
      jobs: Array.from(this.jobs.values()).map(job => ({
        id: job.integration.id,
        name: job.integration.name,
        provider: job.integration.provider,
        interval: job.interval
      }))
    };
  }
}

// Singleton instance
const scheduler = new RateScheduler();

export default scheduler;
