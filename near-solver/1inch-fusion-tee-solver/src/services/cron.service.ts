import { LoggerService } from './logger.service';
import { SolverService } from './solver.service';
import { LiquidityService } from './liquidity.service';
import { MonitoringService } from './monitoring.service';
import { env } from '../configs/env.validation';

export class CronService {
  private logger = new LoggerService('CronService');
  private intervals: NodeJS.Timeout[] = [];

  constructor(
    private solverService: SolverService,
    private liquidityService: LiquidityService,
    private monitoringService: MonitoringService
  ) {}

  start(): void {
    this.logger.info('Starting cron jobs');

    // Update balances every minute
    this.addInterval(
      'Balance Update',
      60000,
      async () => {
        await this.liquidityService.updateBalances();
      }
    );

    // Check rebalancing every 5 minutes
    this.addInterval(
      'Rebalance Check',
      env.REBALANCE_INTERVAL_MS,
      async () => {
        const actions = await this.liquidityService.checkRebalancing();
        if (actions.length > 0) {
          this.logger.info(`Found ${actions.length} rebalancing opportunities`);
          // Execute rebalancing if needed
        }
      }
    );

    // Update metrics every 30 seconds
    this.addInterval(
      'Metrics Update',
      30000,
      async () => {
        await this.monitoringService.updateMetrics();
      }
    );

    // Health check
    this.addInterval(
      'Health Check',
      env.HEALTH_CHECK_INTERVAL_MS,
      async () => {
        const health = await this.monitoringService.getHealthStatus();
        if (!health.isHealthy) {
          this.logger.warn('Health check failed:', health);
        }
      }
    );

    // Cleanup completed orders from cache
    this.addInterval(
      'Cache Cleanup',
      300000, // 5 minutes
      async () => {
        const stats = this.solverService.getStats();
        this.logger.info('Solver stats:', stats);
      }
    );
  }

  stop(): void {
    this.logger.info('Stopping cron jobs');
    
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
    this.intervals = [];
  }

  private addInterval(name: string, intervalMs: number, handler: () => Promise<void>): void {
    // Run immediately
    handler().catch(error => {
      this.logger.error(`${name} failed:`, error);
    });

    // Then run periodically
    const interval = setInterval(async () => {
      try {
        await handler();
      } catch (error) {
        this.logger.error(`${name} failed:`, error);
      }
    }, intervalMs);

    this.intervals.push(interval);
    this.logger.info(`Started cron job: ${name} (every ${intervalMs}ms)`);
  }
}