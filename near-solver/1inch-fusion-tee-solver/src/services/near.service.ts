import { connect, keyStores, KeyPair, Account, Contract } from 'near-api-js';
import { nearConfig } from '../configs/near.config';
import { LoggerService } from './logger.service';
import { SolverRegistration, LiquidityPool, TokenBalance } from '../interfaces/near.interface';

export class NearService {
  private account!: Account;
  private logger = new LoggerService('NearService');
  private solverRegistry!: Contract;
  private intentsVault!: Contract;

  async init() {
    try {
      // Setup key store
      const keyStore = new keyStores.InMemoryKeyStore();
      const keyPair = KeyPair.fromString(nearConfig.privateKey);
      await keyStore.setKey(nearConfig.networkId, nearConfig.accountId, keyPair);

      // Connect to NEAR
      const nearConnection = await connect({
        networkId: nearConfig.networkId,
        keyStore,
        nodeUrl: nearConfig.nodeUrl,
        walletUrl: `https://wallet.${nearConfig.networkId}.near.org`,
        helperUrl: `https://helper.${nearConfig.networkId}.near.org`,
      });

      // Get account
      this.account = await nearConnection.account(nearConfig.accountId);
      
      // Initialize contracts
      this.solverRegistry = new Contract(this.account, nearConfig.solverRegistryContract, {
        viewMethods: ['get_pool', 'get_worker', 'get_pools_without_workers'],
        changeMethods: ['register_worker'],
        useLocalViewExecution: false,
      });

      this.intentsVault = new Contract(this.account, nearConfig.intentsVaultContract, {
        viewMethods: ['get_balance', 'get_balances'],
        changeMethods: ['deposit', 'withdraw', 'execute_order'],
        useLocalViewExecution: false,
      });

      this.logger.info('NEAR service initialized successfully');
      this.logger.info(`Account ID: ${this.account.accountId}`);
    } catch (error) {
      this.logger.error('Failed to initialize NEAR service:', error);
      throw error;
    }
  }

  getAccount(): Account {
    return this.account;
  }

  getAccountId(): string {
    return this.account.accountId;
  }

  async isSolverRegistered(): Promise<boolean> {
    try {
      const worker = await (this.solverRegistry as any).get_worker({
        account_id: this.account.accountId,
      });
      return worker !== null;
    } catch (error) {
      return false;
    }
  }

  async registerSolver(checksum: string, codehash: string): Promise<void> {
    try {
      await (this.solverRegistry as any).register_worker({
        args: {
          pool_id: nearConfig.solverPoolId,
          checksum,
          codehash,
        },
        gas: nearConfig.defaultGas,
        amount: nearConfig.defaultDeposit,
      });
      this.logger.info('Solver registered successfully');
    } catch (error) {
      this.logger.error('Failed to register solver:', error);
      throw error;
    }
  }

  async getPool(poolId: number): Promise<LiquidityPool | null> {
    try {
      const pool = await (this.solverRegistry as any).get_pool({ pool_id: poolId });
      return pool;
    } catch (error) {
      this.logger.error('Failed to get pool:', error);
      return null;
    }
  }

  async getBalances(tokenIds: string[]): Promise<Record<string, string>> {
    try {
      const balances = await (this.intentsVault as any).get_balances({
        account_id: this.account.accountId,
        token_ids: tokenIds,
      });
      
      const result: Record<string, string> = {};
      tokenIds.forEach((tokenId, index) => {
        result[tokenId] = balances[index] || '0';
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to get balances:', error);
      throw error;
    }
  }

  async executeOrder(orderData: {
    orderId: string;
    sourceToken: string;
    targetToken: string;
    sourceAmount: string;
    targetAmount: string;
    maker: string;
    receiver: string;
    deadline: number;
    signature: string;
  }): Promise<string> {
    try {
      const result = await (this.intentsVault as any).execute_order({
        args: orderData,
        gas: nearConfig.defaultGas,
      });
      
      this.logger.info(`Order executed successfully: ${orderData.orderId}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to execute order:', error);
      throw error;
    }
  }

  async withdraw(tokenId: string, amount: string): Promise<void> {
    try {
      await (this.intentsVault as any).withdraw({
        args: {
          token_id: tokenId,
          amount,
        },
        gas: nearConfig.defaultGas,
      });
      
      this.logger.info(`Withdrew ${amount} of ${tokenId}`);
    } catch (error) {
      this.logger.error('Failed to withdraw:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    // Cleanup any resources if needed
    this.logger.info('NEAR service cleaned up');
  }
}