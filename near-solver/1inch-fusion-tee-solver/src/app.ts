import { CacheService } from './services/cache.service';
import { CronService } from './services/cron.service';
import { FusionOrderService } from './services/fusion-order.service';
import { NearService } from './services/near.service';
import { SolverService } from './services/solver.service';
import { HttpService } from './services/http.service';
import { LiquidityService } from './services/liquidity.service';
import { MonitoringService } from './services/monitoring.service';
import { TEEService } from './services/tee.service';
import { LoggerService } from './services/logger.service';

const logger = new LoggerService('app');

export async function app() {
  logger.info('Starting 1inch Fusion+ TEE Solver...');

  try {
    // Initialize cache service
    const cacheService = new CacheService();

    // Initialize TEE service and verify attestation
    const teeService = new TEEService();
    await teeService.init();
    
    // Initialize NEAR service
    const nearService = new NearService();
    await nearService.init();
    
    // Verify solver registration
    const isRegistered = await nearService.isSolverRegistered();
    if (!isRegistered) {
      logger.error('Solver is not registered in the registry contract');
      logger.info('Please run: npm run register');
      process.exit(1);
    }

    // Initialize Fusion order service
    const fusionOrderService = new FusionOrderService(cacheService);
    await fusionOrderService.init();

    // Initialize liquidity management service
    const liquidityService = new LiquidityService(nearService, cacheService);
    await liquidityService.updateBalances();

    // Initialize solver service
    const solverService = new SolverService(
      cacheService,
      nearService,
      fusionOrderService,
      liquidityService
    );

    // Initialize monitoring service
    const monitoringService = new MonitoringService(solverService, liquidityService);

    // Initialize cron service for periodic tasks
    const cronService = new CronService(solverService, liquidityService, monitoringService);
    cronService.start();

    // Start monitoring Fusion+ orders
    await fusionOrderService.startMonitoring(async (order) => {
      await solverService.processOrder(order);
    });

    // Initialize HTTP service for health checks and metrics
    const httpService = new HttpService(monitoringService, teeService);
    httpService.start();

    logger.info('1inch Fusion+ TEE Solver started successfully');
    logger.info(`Solver address: ${nearService.getAccountId()}`);
    logger.info(`Supported chains: ${process.env.INCH_FUSION_NETWORK_IDS}`);
    logger.info(`TEE mode: ${process.env.TEE_MODE}`);

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down solver...');
      fusionOrderService.stop();
      cronService.stop();
      httpService.stop();
      await nearService.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Shutting down solver...');
      fusionOrderService.stop();
      cronService.stop();
      httpService.stop();
      await nearService.cleanup();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start solver:', error);
    process.exit(1);
  }
}