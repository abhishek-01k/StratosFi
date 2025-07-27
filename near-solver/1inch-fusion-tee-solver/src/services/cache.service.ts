import NodeCache from 'node-cache';
import { LoggerService } from './logger.service';

export class CacheService {
  private cache: NodeCache;
  private logger = new LoggerService('CacheService');

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 600, // 10 minutes default TTL
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false, // Don't clone objects for better performance
    });

    this.cache.on('expired', (key, value) => {
      this.logger.debug(`Cache key expired: ${key}`);
    });

    this.cache.on('flush', () => {
      this.logger.debug('Cache flushed');
    });
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || 600);
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  flush(): void {
    this.cache.flushAll();
  }

  getStats() {
    return this.cache.getStats();
  }

  // Order-specific cache methods
  setOrderProcessing(orderHash: string, processing: boolean, ttl: number = 300): void {
    this.set(`order:processing:${orderHash}`, processing, ttl);
  }

  isOrderProcessing(orderHash: string): boolean {
    return this.get<boolean>(`order:processing:${orderHash}`) || false;
  }

  // Price cache methods
  setTokenPrice(chainId: number, tokenAddress: string, price: number, ttl: number = 60): void {
    const key = `price:${chainId}:${tokenAddress.toLowerCase()}`;
    this.set(key, price, ttl);
  }

  getTokenPrice(chainId: number, tokenAddress: string): number | undefined {
    const key = `price:${chainId}:${tokenAddress.toLowerCase()}`;
    return this.get<number>(key);
  }

  // Balance cache methods
  setBalance(chainId: number, tokenAddress: string, balance: string, ttl: number = 30): void {
    const key = `balance:${chainId}:${tokenAddress.toLowerCase()}`;
    this.set(key, balance, ttl);
  }

  getBalance(chainId: number, tokenAddress: string): string | undefined {
    const key = `balance:${chainId}:${tokenAddress.toLowerCase()}`;
    return this.get<string>(key);
  }

  // Gas price cache
  setGasPrice(chainId: number, gasPrice: string, ttl: number = 10): void {
    const key = `gas:${chainId}`;
    this.set(key, gasPrice, ttl);
  }

  getGasPrice(chainId: number): string | undefined {
    const key = `gas:${chainId}`;
    return this.get<string>(key);
  }
}