import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import { fusionConfig, chainConfig } from '../configs/fusion.config';
import { FusionOrder, FusionQuote, OrderStatus } from '../interfaces/fusion.interface';
import { LoggerService } from './logger.service';
import { CacheService } from './cache.service';

export class FusionOrderService extends EventEmitter {
  private api: AxiosInstance;
  private logger = new LoggerService('FusionOrderService');
  private isMonitoring = false;
  private monitoringIntervals: Map<number, NodeJS.Timeout> = new Map();
  
  constructor(private cacheService: CacheService) {
    super();
    
    this.api = axios.create({
      baseURL: fusionConfig.apiUrl,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${fusionConfig.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  async init(): Promise<void> {
    try {
      // Verify API access
      await this.verifyApiAccess();
      
      // Load supported networks info
      for (const chainId of fusionConfig.networkIds) {
        await this.loadChainInfo(chainId);
      }
      
      this.logger.info('Fusion order service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Fusion order service:', error);
      throw error;
    }
  }

  private async verifyApiAccess(): Promise<void> {
    try {
      // Test API access with a simple request
      const response = await this.api.get('/relayer/v1.0/info');
      this.logger.info('1inch Fusion+ API access verified');
    } catch (error) {
      this.logger.error('Failed to verify API access:', error);
      throw new Error('Cannot access 1inch Fusion+ API - check your API key');
    }
  }

  private async loadChainInfo(chainId: number): Promise<void> {
    try {
      const response = await this.api.get(`/relayer/v1.0/${chainId}/info`);
      this.logger.info(`Loaded chain info for ${chainConfig[chainId]?.name || chainId}`);
    } catch (error) {
      this.logger.warn(`Failed to load chain info for ${chainId}:`, error);
    }
  }

  async startMonitoring(orderHandler: (order: FusionOrder) => Promise<void>): Promise<void> {
    if (this.isMonitoring) {
      this.logger.warn('Order monitoring already started');
      return;
    }

    this.isMonitoring = true;

    // Start monitoring for each supported chain
    for (const chainId of fusionConfig.networkIds) {
      this.startChainMonitoring(chainId, orderHandler);
    }

    this.logger.info('Started monitoring Fusion+ orders on all chains');
  }

  private startChainMonitoring(chainId: number, orderHandler: (order: FusionOrder) => Promise<void>): void {
    const checkOrders = async () => {
      try {
        const orders = await this.getActiveOrders(chainId);
        
        for (const order of orders) {
          // Skip if already processing
          if (this.cacheService.isOrderProcessing(order.orderHash)) {
            continue;
          }

          // Check if order is profitable and valid
          if (await this.isOrderProfitable(order)) {
            this.cacheService.setOrderProcessing(order.orderHash, true);
            
            // Process order asynchronously
            orderHandler(order).catch(error => {
              this.logger.error(`Failed to process order ${order.orderHash}:`, error);
              this.cacheService.setOrderProcessing(order.orderHash, false, 60);
            });
          }
        }
      } catch (error) {
        this.logger.error(`Failed to check orders on chain ${chainId}:`, error);
      }
    };

    // Check orders immediately and then periodically
    checkOrders();
    const interval = setInterval(checkOrders, 5000); // Check every 5 seconds
    this.monitoringIntervals.set(chainId, interval);
  }

  stop(): void {
    this.isMonitoring = false;
    
    // Clear all monitoring intervals
    for (const [chainId, interval] of this.monitoringIntervals) {
      clearInterval(interval);
    }
    this.monitoringIntervals.clear();
    
    this.logger.info('Stopped monitoring Fusion+ orders');
  }

  private async getActiveOrders(chainId: number): Promise<FusionOrder[]> {
    try {
      const response = await this.api.get(`/relayer/v1.0/${chainId}/orders/active`);
      
      return response.data.orders.map((orderData: any) => this.mapOrderFromApi(orderData, chainId));
    } catch (error) {
      this.logger.error(`Failed to get active orders for chain ${chainId}:`, error);
      return [];
    }
  }

  private mapOrderFromApi(orderData: any, chainId: number): FusionOrder {
    return {
      orderHash: orderData.orderHash,
      maker: orderData.maker,
      receiver: orderData.receiver || orderData.maker,
      makerAsset: orderData.makerAsset,
      takerAsset: orderData.takerAsset,
      makingAmount: orderData.makingAmount,
      takingAmount: orderData.takingAmount,
      deadline: orderData.deadline,
      nonce: orderData.nonce,
      signature: orderData.signature,
      chainId,
      
      // Auction details
      auctionStartTime: orderData.auctionStartTime || Date.now(),
      auctionEndTime: orderData.auctionEndTime || Date.now() + 180000,
      auctionStartAmount: orderData.auctionStartAmount || orderData.takingAmount,
      auctionEndAmount: orderData.auctionEndAmount || orderData.takingAmount,
      
      // Additional metadata
      quoteId: orderData.quoteId,
      whitelist: orderData.whitelist,
      interactions: orderData.interactions,
      permit: orderData.permit,
    };
  }

  private async isOrderProfitable(order: FusionOrder): Promise<boolean> {
    try {
      // Calculate current auction price
      const currentPrice = this.calculateCurrentAuctionPrice(order);
      
      // Get token prices
      const makerPrice = await this.getTokenPrice(order.chainId, order.makerAsset);
      const takerPrice = await this.getTokenPrice(order.chainId, order.takerAsset);
      
      if (!makerPrice || !takerPrice) {
        this.logger.warn(`Missing price data for order ${order.orderHash}`);
        return false;
      }

      // Calculate profit margin
      const inputValue = parseFloat(order.makingAmount) * makerPrice;
      const outputValue = parseFloat(currentPrice) * takerPrice;
      const profitBps = ((outputValue - inputValue) / inputValue) * 10000;

      if (profitBps < fusionConfig.minProfitBps) {
        this.logger.debug(`Order ${order.orderHash} not profitable: ${profitBps.toFixed(2)} bps`);
        return false;
      }

      this.logger.info(`Order ${order.orderHash} is profitable: ${profitBps.toFixed(2)} bps`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to check profitability for order ${order.orderHash}:`, error);
      return false;
    }
  }

  private calculateCurrentAuctionPrice(order: FusionOrder): string {
    const now = Date.now();
    
    // If auction hasn't started, return start amount
    if (now < order.auctionStartTime) {
      return order.auctionStartAmount;
    }
    
    // If auction has ended, return end amount
    if (now >= order.auctionEndTime) {
      return order.auctionEndAmount;
    }
    
    // Calculate linear interpolation
    const elapsed = now - order.auctionStartTime;
    const duration = order.auctionEndTime - order.auctionStartTime;
    const progress = elapsed / duration;
    
    const startAmount = parseFloat(order.auctionStartAmount);
    const endAmount = parseFloat(order.auctionEndAmount);
    const currentAmount = startAmount + (endAmount - startAmount) * progress;
    
    return currentAmount.toString();
  }

  private async getTokenPrice(chainId: number, tokenAddress: string): Promise<number | null> {
    // Check cache first
    const cachedPrice = this.cacheService.getTokenPrice(chainId, tokenAddress);
    if (cachedPrice !== undefined) {
      return cachedPrice;
    }

    try {
      // Get price from 1inch API
      const response = await this.api.get(`/price/v1.1/${chainId}`, {
        params: {
          addresses: tokenAddress,
          currency: 'USD'
        }
      });

      const price = response.data[tokenAddress.toLowerCase()];
      if (price) {
        this.cacheService.setTokenPrice(chainId, tokenAddress, price);
        return price;
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to get token price for ${tokenAddress} on chain ${chainId}:`, error);
      return null;
    }
  }

  async executeOrder(order: FusionOrder, executorAddress: string): Promise<string> {
    try {
      const response = await this.api.post(`/relayer/v1.0/${order.chainId}/orders/execute`, {
        orderHash: order.orderHash,
        executor: executorAddress,
        signature: order.signature,
      });

      this.logger.info(`Order ${order.orderHash} submitted for execution`);
      return response.data.transactionHash;
    } catch (error) {
      this.logger.error(`Failed to execute order ${order.orderHash}:`, error);
      throw error;
    }
  }

  async getOrderStatus(chainId: number, orderHash: string): Promise<OrderStatus> {
    try {
      const response = await this.api.get(`/relayer/v1.0/${chainId}/orders/${orderHash}/status`);
      return this.mapOrderStatus(response.data.status);
    } catch (error) {
      this.logger.error(`Failed to get order status for ${orderHash}:`, error);
      throw error;
    }
  }

  private mapOrderStatus(apiStatus: string): OrderStatus {
    switch (apiStatus.toLowerCase()) {
      case 'open':
      case 'pending':
        return OrderStatus.Pending;
      case 'filled':
        return OrderStatus.Filled;
      case 'cancelled':
        return OrderStatus.Cancelled;
      case 'expired':
        return OrderStatus.Expired;
      case 'partially-filled':
        return OrderStatus.PartiallyFilled;
      default:
        return OrderStatus.Pending;
    }
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config) => {
        this.logger.debug('API request:', {
          method: config.method,
          url: config.url,
          params: config.params
        });
        return config;
      },
      (error) => {
        this.logger.error('API request error:', error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        this.logger.debug('API response:', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        this.logger.error('API response error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }
}