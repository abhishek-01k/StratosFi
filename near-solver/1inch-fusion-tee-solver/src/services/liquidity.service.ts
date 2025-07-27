import Big from 'big.js';
import { LoggerService } from './logger.service';
import { NearService } from './near.service';
import { CacheService } from './cache.service';
import { fusionConfig, supportedTokens } from '../configs/fusion.config';
import { env } from '../configs/env.validation';

export class LiquidityService {
  private logger = new LoggerService('LiquidityService');
  private balances: Map<string, Big> = new Map();
  private lockedBalances: Map<string, Big> = new Map();

  constructor(
    private nearService: NearService,
    private cacheService: CacheService
  ) {}

  async updateBalances(): Promise<void> {
    try {
      // Get token IDs from supported tokens
      const tokenIds = Array.from(supportedTokens.values()).map(token => 
        `${token.chainId}:${token.address}`
      );

      // Get balances from NEAR vault
      const nearBalances = await this.nearService.getBalances(tokenIds);

      // Update local balance tracking
      for (const [tokenId, balance] of Object.entries(nearBalances)) {
        this.balances.set(tokenId, new Big(balance));
        
        // Initialize locked balance if not exists
        if (!this.lockedBalances.has(tokenId)) {
          this.lockedBalances.set(tokenId, new Big(0));
        }
      }

      this.logger.info('Updated liquidity balances');
    } catch (error) {
      this.logger.error('Failed to update balances:', error);
      throw error;
    }
  }

  getAvailableBalance(chainId: number, tokenAddress: string): Big {
    const tokenId = `${chainId}:${tokenAddress.toLowerCase()}`;
    const totalBalance = this.balances.get(tokenId) || new Big(0);
    const lockedBalance = this.lockedBalances.get(tokenId) || new Big(0);
    
    return totalBalance.minus(lockedBalance);
  }

  lockBalance(chainId: number, tokenAddress: string, amount: string): boolean {
    const tokenId = `${chainId}:${tokenAddress.toLowerCase()}`;
    const availableBalance = this.getAvailableBalance(chainId, tokenAddress);
    const amountBig = new Big(amount);

    if (availableBalance.lt(amountBig)) {
      this.logger.warn(`Insufficient balance to lock ${amount} of ${tokenId}`);
      return false;
    }

    const currentLocked = this.lockedBalances.get(tokenId) || new Big(0);
    this.lockedBalances.set(tokenId, currentLocked.plus(amountBig));
    
    this.logger.debug(`Locked ${amount} of ${tokenId}`);
    return true;
  }

  unlockBalance(chainId: number, tokenAddress: string, amount: string): void {
    const tokenId = `${chainId}:${tokenAddress.toLowerCase()}`;
    const currentLocked = this.lockedBalances.get(tokenId) || new Big(0);
    const amountBig = new Big(amount);
    
    const newLocked = currentLocked.minus(amountBig);
    this.lockedBalances.set(tokenId, newLocked.gt(0) ? newLocked : new Big(0));
    
    this.logger.debug(`Unlocked ${amount} of ${tokenId}`);
  }

  async checkRebalancing(): Promise<RebalanceAction[]> {
    const actions: RebalanceAction[] = [];
    const tokenBalances: Map<string, TokenBalance> = new Map();

    // Group balances by token symbol across chains
    for (const [tokenId, balance] of this.balances) {
      const [chainId, address] = tokenId.split(':');
      const token = supportedTokens.get(tokenId);
      
      if (!token) continue;

      const key = token.symbol;
      if (!tokenBalances.has(key)) {
        tokenBalances.set(key, {
          symbol: token.symbol,
          totalBalance: new Big(0),
          chainBalances: new Map(),
        });
      }

      const tokenBalance = tokenBalances.get(key)!;
      tokenBalance.totalBalance = tokenBalance.totalBalance.plus(balance);
      tokenBalance.chainBalances.set(parseInt(chainId), balance);
    }

    // Check for imbalances
    for (const [symbol, tokenBalance] of tokenBalances) {
      const avgBalance = tokenBalance.totalBalance.div(tokenBalance.chainBalances.size);
      const threshold = avgBalance.mul(env.REBALANCE_THRESHOLD_PERCENT).div(100);

      for (const [chainId, balance] of tokenBalance.chainBalances) {
        const deviation = balance.minus(avgBalance).abs();
        
        if (deviation.gt(threshold)) {
          const isExcess = balance.gt(avgBalance);
          
          actions.push({
            symbol,
            fromChain: isExcess ? chainId : this.findChainWithExcess(tokenBalance, avgBalance),
            toChain: isExcess ? this.findChainWithDeficit(tokenBalance, avgBalance) : chainId,
            amount: deviation.toFixed(0),
            reason: `Imbalance detected: ${deviation.toFixed(2)} deviation from average`,
          });
        }
      }
    }

    return actions;
  }

  private findChainWithExcess(tokenBalance: TokenBalance, avgBalance: Big): number {
    let maxChain = 0;
    let maxExcess = new Big(0);

    for (const [chainId, balance] of tokenBalance.chainBalances) {
      const excess = balance.minus(avgBalance);
      if (excess.gt(maxExcess)) {
        maxExcess = excess;
        maxChain = chainId;
      }
    }

    return maxChain;
  }

  private findChainWithDeficit(tokenBalance: TokenBalance, avgBalance: Big): number {
    let minChain = 0;
    let maxDeficit = new Big(0);

    for (const [chainId, balance] of tokenBalance.chainBalances) {
      const deficit = avgBalance.minus(balance);
      if (deficit.gt(maxDeficit)) {
        maxDeficit = deficit;
        minChain = chainId;
      }
    }

    return minChain;
  }

  getBalanceSummary(): BalanceSummary {
    const summary: BalanceSummary = {
      totalValueUsd: 0,
      balancesByChain: {},
      balancesByToken: {},
    };

    for (const [tokenId, balance] of this.balances) {
      const [chainId, address] = tokenId.split(':');
      const token = supportedTokens.get(tokenId);
      
      if (!token) continue;

      // Get token price from cache
      const price = this.cacheService.getTokenPrice(parseInt(chainId), address) || 0;
      const valueUsd = balance.mul(price).toNumber();
      
      summary.totalValueUsd += valueUsd;

      // Update chain summary
      if (!summary.balancesByChain[chainId]) {
        summary.balancesByChain[chainId] = 0;
      }
      summary.balancesByChain[chainId] += valueUsd;

      // Update token summary
      if (!summary.balancesByToken[token.symbol]) {
        summary.balancesByToken[token.symbol] = 0;
      }
      summary.balancesByToken[token.symbol] += valueUsd;
    }

    return summary;
  }

  async executeRebalance(action: RebalanceAction): Promise<void> {
    this.logger.info(`Executing rebalance: ${JSON.stringify(action)}`);
    
    // Implementation would involve:
    // 1. Creating cross-chain transfer orders
    // 2. Executing atomic swaps
    // 3. Updating balances
    
    throw new Error('Rebalancing not implemented yet');
  }
}

interface TokenBalance {
  symbol: string;
  totalBalance: Big;
  chainBalances: Map<number, Big>;
}

interface RebalanceAction {
  symbol: string;
  fromChain: number;
  toChain: number;
  amount: string;
  reason: string;
}

interface BalanceSummary {
  totalValueUsd: number;
  balancesByChain: Record<string, number>;
  balancesByToken: Record<string, number>;
}