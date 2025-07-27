import { loadEnv } from '../utils/load-env';
import { NearService } from '../services/near.service';
import { TEEService } from '../services/tee.service';
import { LoggerService } from '../services/logger.service';

const logger = new LoggerService('RegisterSolver');

async function registerSolver() {
  try {
    loadEnv();
    
    logger.info('Starting solver registration...');

    // Initialize TEE service
    const teeService = new TEEService();
    await teeService.init();

    if (!teeService.isAttested()) {
      logger.error('TEE attestation failed - cannot register solver');
      process.exit(1);
    }

    // Initialize NEAR service
    const nearService = new NearService();
    await nearService.init();

    // Check if already registered
    const isRegistered = await nearService.isSolverRegistered();
    if (isRegistered) {
      logger.info('Solver is already registered');
      return;
    }

    // Get attestation data
    const checksum = teeService.getChecksum();
    const codehash = teeService.getCodehash();

    logger.info('Registering solver with:');
    logger.info(`  Account: ${nearService.getAccountId()}`);
    logger.info(`  Checksum: ${checksum}`);
    logger.info(`  Codehash: ${codehash}`);

    // Register solver
    await nearService.registerSolver(checksum, codehash);

    logger.info('Solver registered successfully!');
  } catch (error) {
    logger.error('Failed to register solver:', error);
    process.exit(1);
  }
}

registerSolver();