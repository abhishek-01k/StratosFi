import Big from 'big.js';
import { ethers } from 'ethers';
import { FusionOrder, OrderExecutionParams } from '../interfaces/fusion.interface';
import { LoggerService } from './logger.service';
import { CacheService } from './cache.service';
import { NearService } from './near.service';
import { FusionOrderService } from './fusion-order.service';
import { LiquidityService } from './liquidity.service';
import { fusionConfig, chainConfig } from '../configs/fusion.config';

export class SolverService {
  private logger = new LoggerService('SolverService');
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();
  private executionCount = 0;
  private successCount = 0;
  private failureCount = 0;

  constructor(
    private cacheService: CacheService,
    private nearService: NearService,
    private fusionOrderService: FusionOrderService,
    private liquidityService: LiquidityService
  ) {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    for (const chainId of fusionConfig.networkIds) {
      const config = chainConfig[chainId];
      if (config) {
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        this.providers.set(chainId, provider);
      }
    }
  }

  async processOrder(order: FusionOrder): Promise<void> {
    const startTime = Date.now();
    const logger = this.logger.toScopeLogger(order.orderHash);
    
    try {
      logger.info('Processing order', {
        maker: order.maker,
        makerAsset: order.makerAsset,
        takerAsset: order.takerAsset,
        makingAmount: order.makingAmount,
        takingAmount: order.takingAmount,
      });

      // Validate order
      if (!await this.validateOrder(order)) {
        logger.warn('Order validation failed');
        return;
      }

      // Check liquidity
      if (!await this.checkLiquidity(order)) {
        logger.warn('Insufficient liquidity for order');
        return;
      }

      // Calculate execution params
      const executionParams = await this.calculateExecutionParams(order);
      if (!executionParams) {
        logger.warn('Cannot calculate profitable execution params');
        return;
      }

      // Lock liquidity
      const locked = this.liquidityService.lockBalance(
        order.chainId,
        order.takerAsset,
        executionParams.executionPrice
      );

      if (!locked) {
        logger.error('Failed to lock liquidity');
        return;
      }

      try {
        // Execute the order
        await this.executeOrder(order, executionParams);
        this.successCount++;
        
        logger.info('Order executed successfully', {
          profit: executionParams.estimatedProfit,
          duration: Date.now() - startTime,
        });
      } catch (error) {
        // Unlock liquidity on failure
        this.liquidityService.unlockBalance(
          order.chainId,
          order.takerAsset,
          executionParams.executionPrice
        );
        throw error;
      }

    } catch (error) {
      this.failureCount++;
      logger.error('Failed to process order:', error);
    } finally {
      this.executionCount++;
      this.cacheService.setOrderProcessing(order.orderHash, false);
    }
  }

  private async validateOrder(order: FusionOrder): Promise<boolean> {
    // Check deadline
    if (order.deadline < Date.now() / 1000) {
      this.logger.debug(`Order ${order.orderHash} has expired`);
      return false;
    }

    // Check order size limits
    const makerPrice = this.cacheService.getTokenPrice(order.chainId, order.makerAsset) || 0;
    const orderSizeUsd = parseFloat(order.makingAmount) * makerPrice;

    if (orderSizeUsd < fusionConfig.minOrderSizeUsd) {
      this.logger.debug(`Order ${order.orderHash} too small: $${orderSizeUsd.toFixed(2)}`);
      return false;
    }

    if (orderSizeUsd > fusionConfig.maxOrderSizeUsd) {
      this.logger.debug(`Order ${order.orderHash} too large: $${orderSizeUsd.toFixed(2)}`);
      return false;
    }

    // Verify signature
    if (!await this.verifyOrderSignature(order)) {
      this.logger.warn(`Order ${order.orderHash} has invalid signature`);
      return false;
    }

    return true;
  }

  private async verifyOrderSignature(order: FusionOrder): Promise<boolean> {
    try {
      // Reconstruct order hash and verify signature
      // This would involve EIP-712 typed data signing verification
      // For now, we'll assume orders from 1inch API are valid
      return true;
    } catch (error) {
      this.logger.error('Failed to verify order signature:', error);
      return false;
    }
  }

  private async checkLiquidity(order: FusionOrder): Promise<boolean> {
    const availableBalance = this.liquidityService.getAvailableBalance(
      order.chainId,
      order.takerAsset
    );

    const requiredAmount = new Big(order.takingAmount);
    
    return availableBalance.gte(requiredAmount);
  }

  private async calculateExecutionParams(order: FusionOrder): Promise<OrderExecutionParams | null> {
    try {
      // Get current gas price
      const gasPrice = await this.getGasPrice(order.chainId);
      if (!gasPrice) {
        this.logger.error('Cannot get gas price');
        return null;
      }

      // Estimate gas cost
      const estimatedGas = this.estimateGasForExecution(order);
      const gasCostWei = BigInt(gasPrice.toString()) * estimatedGas;
      const gasCostNative = ethers.formatEther(gasCostWei);

      // Get native token price
      const nativePrice = await this.getNativeTokenPrice(order.chainId);
      const gasCostUsd = parseFloat(gasCostNative) * nativePrice;

      // Calculate current auction price
      const currentPrice = this.calculateCurrentAuctionPrice(order);
      
      // Get token prices
      const makerPrice = this.cacheService.getTokenPrice(order.chainId, order.makerAsset) || 0;
      const takerPrice = this.cacheService.getTokenPrice(order.chainId, order.takerAsset) || 0;

      // Calculate profit
      const inputValue = parseFloat(order.makingAmount) * makerPrice;
      const outputValue = parseFloat(currentPrice) * takerPrice;
      const grossProfit = outputValue - inputValue;
      const netProfit = grossProfit - gasCostUsd;

      // Check minimum profit
      const profitBps = (netProfit / inputValue) * 10000;
      if (profitBps < fusionConfig.minProfitBps) {
        this.logger.debug(`Order not profitable enough: ${profitBps.toFixed(2)} bps`);
        return null;
      }

      return {
        order,
        executionPrice: currentPrice,
        estimatedProfit: netProfit.toFixed(2),
        gasCost: gasCostUsd.toFixed(2),
        deadline: order.deadline,
      };
    } catch (error) {
      this.logger.error('Failed to calculate execution params:', error);
      return null;
    }
  }

  private async getGasPrice(chainId: number): Promise<ethers.BigNumberish | null> {
    // Check cache first
    const cached = this.cacheService.getGasPrice(chainId);
    if (cached) {
      return ethers.parseUnits(cached, 'gwei');
    }

    try {
      const provider = this.providers.get(chainId);
      if (!provider) {
        throw new Error(`No provider for chain ${chainId}`);
      }

      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
      
      // Cache the gas price
      this.cacheService.setGasPrice(chainId, ethers.formatUnits(gasPrice, 'gwei'));
      
      return gasPrice;
    } catch (error) {
      this.logger.error(`Failed to get gas price for chain ${chainId}:`, error);
      return null;
    }
  }

  private estimateGasForExecution(order: FusionOrder): bigint {
    // Base gas for different operations
    const BASE_EXECUTION_GAS = 150000n;
    const INTERACTION_GAS = 50000n;
    
    let totalGas = BASE_EXECUTION_GAS;
    
    // Add gas for interactions
    if (order.interactions && order.interactions.length > 0) {
      totalGas += INTERACTION_GAS * BigInt(order.interactions.length);
    }
    
    // Add gas for whitelist check
    if (order.whitelist && order.whitelist.length > 0) {
      totalGas += 10000n * BigInt(order.whitelist.length);
    }
    
    return totalGas;
  }

  private async getNativeTokenPrice(chainId: number): Promise<number> {
    const nativeTokens: Record<number, string> = {
      1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      137: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
      42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
      10: '0x4200000000000000000000000000000000000006', // WETH
      56: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
      43114: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // WAVAX
      8453: '0x4200000000000000000000000000000000000006', // WETH
    };

    const nativeAddress = nativeTokens[chainId];
    if (!nativeAddress) {
      return 0;
    }

    return this.cacheService.getTokenPrice(chainId, nativeAddress) || 0;
  }

  private calculateCurrentAuctionPrice(order: FusionOrder): string {
    const now = Date.now();
    
    if (now < order.auctionStartTime) {
      return order.auctionStartAmount;
    }
    
    if (now >= order.auctionEndTime) {
      return order.auctionEndAmount;
    }
    
    const elapsed = now - order.auctionStartTime;
    const duration = order.auctionEndTime - order.auctionStartTime;
    const progress = elapsed / duration;
    
    const startAmount = parseFloat(order.auctionStartAmount);
    const endAmount = parseFloat(order.auctionEndAmount);
    const currentAmount = startAmount + (endAmount - startAmount) * progress;
    
    return currentAmount.toString();
  }

  private async executeOrder(order: FusionOrder, params: OrderExecutionParams): Promise<void> {
    this.logger.info(`Executing order ${order.orderHash}`);
    
    // For cross-chain orders, we need to coordinate with NEAR
    if (this.isCrossChainOrder(order)) {
      await this.executeCrossChainOrder(order, params);
    } else {
      await this.executeSingleChainOrder(order, params);
    }
  }

  private isCrossChainOrder(order: FusionOrder): boolean {
    // Check if order involves cross-chain execution
    // This would be determined by order metadata or interactions
    return false; // For now, assume single-chain
  }

  private async executeSingleChainOrder(order: FusionOrder, params: OrderExecutionParams): Promise<void> {
    // Execute order through 1inch Fusion+ API
    const txHash = await this.fusionOrderService.executeOrder(
      order,
      this.nearService.getAccountId()
    );
    
    this.logger.info(`Order execution submitted: ${txHash}`);
    
    // Monitor execution status
    await this.monitorExecution(order.chainId, order.orderHash, txHash);
  }

  private async executeCrossChainOrder(order: FusionOrder, params: OrderExecutionParams): Promise<void> {
    // For cross-chain orders, coordinate with NEAR contracts
    const result = await this.nearService.executeOrder({
      orderId: order.orderHash,
      sourceToken: order.makerAsset,
      targetToken: order.takerAsset,
      sourceAmount: order.makingAmount,
      targetAmount: params.executionPrice,
      maker: order.maker,
      receiver: order.receiver,
      deadline: order.deadline,
      signature: order.signature,
    });
    
    this.logger.info(`Cross-chain order executed: ${result}`);
  }

  private async monitorExecution(chainId: number, orderHash: string, txHash: string): Promise<void> {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`No provider for chain ${chainId}`);
    }

    try {
      const receipt = await provider.waitForTransaction(txHash, chainConfig[chainId].confirmations);
      
      if (receipt && receipt.status === 1) {
        this.logger.info(`Order ${orderHash} confirmed in tx ${txHash}`);
      } else {
        throw new Error(`Transaction ${txHash} failed`);
      }
    } catch (error) {
      this.logger.error(`Failed to monitor execution:`, error);
      throw error;
    }
  }

  getStats() {
    return {
      totalExecutions: this.executionCount,
      successfulExecutions: this.successCount,
      failedExecutions: this.failureCount,
      successRate: this.executionCount > 0 
        ? (this.successCount / this.executionCount * 100).toFixed(2) + '%'
        : '0%',
    };
  }
}