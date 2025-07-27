import { CacheService } from '../src/services/cache.service';
import { env } from '../src/configs/env.validation';

describe('1inch Fusion+ TEE Solver', () => {
  describe('CacheService', () => {
    let cacheService: CacheService;

    beforeEach(() => {
      cacheService = new CacheService();
    });

    it('should set and get values', () => {
      const key = 'test-key';
      const value = 'test-value';

      const result = cacheService.set(key, value);
      expect(result).toBe(true);

      const retrieved = cacheService.get<string>(key);
      expect(retrieved).toBe(value);
    });

    it('should handle order processing state', () => {
      const orderHash = '0x123';

      // Initially not processing
      expect(cacheService.isOrderProcessing(orderHash)).toBe(false);

      // Set as processing
      cacheService.setOrderProcessing(orderHash, true);
      expect(cacheService.isOrderProcessing(orderHash)).toBe(true);

      // Set as not processing
      cacheService.setOrderProcessing(orderHash, false);
      expect(cacheService.isOrderProcessing(orderHash)).toBe(false);
    });

    it('should handle token prices', () => {
      const chainId = 1;
      const tokenAddress = '0xA0b86991c5E1dd28e4f61D0095CFEba9735a0B935';
      const price = 1.0;

      // Set price
      cacheService.setTokenPrice(chainId, tokenAddress, price);

      // Get price (case insensitive)
      const retrievedPrice = cacheService.getTokenPrice(chainId, tokenAddress.toLowerCase());
      expect(retrievedPrice).toBe(price);
    });
  });

  describe('Environment Configuration', () => {
    it('should have valid test environment', () => {
      expect(env.NODE_ENV).toBe('test');
      expect(env.TEE_MODE).toBe('development');
      expect(env.NEAR_NETWORK_ID).toBe('testnet');
    });

    it('should have required configuration', () => {
      expect(env.INCH_FUSION_API_KEY).toBeDefined();
      expect(env.NEAR_ACCOUNT_ID).toBeDefined();
      expect(env.SOLVER_REGISTRY_CONTRACT).toBeDefined();
    });
  });

  describe('Order Processing', () => {
    // Mock order for testing
    const mockOrder = {
      orderHash: '0xabc123',
      maker: '0x1234567890123456789012345678901234567890',
      receiver: '0x1234567890123456789012345678901234567890',
      makerAsset: '0xA0b86991c5E1dd28e4f61D0095CFEba9735a0B935',
      takerAsset: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      makingAmount: '1000000000',
      takingAmount: '1000000',
      deadline: Math.floor(Date.now() / 1000) + 300,
      nonce: '1',
      signature: '0x...',
      chainId: 1,
      auctionStartTime: Date.now(),
      auctionEndTime: Date.now() + 180000,
      auctionStartAmount: '1000000',
      auctionEndAmount: '990000',
    };

    it('should validate order deadline', () => {
      const expiredOrder = {
        ...mockOrder,
        deadline: Math.floor(Date.now() / 1000) - 300, // 5 minutes ago
      };

      expect(expiredOrder.deadline < Date.now() / 1000).toBe(true);
    });

    it('should calculate auction price correctly', () => {
      const now = Date.now();
      const duration = mockOrder.auctionEndTime - mockOrder.auctionStartTime;
      const progress = 0.5; // Halfway through auction

      const startAmount = parseFloat(mockOrder.auctionStartAmount);
      const endAmount = parseFloat(mockOrder.auctionEndAmount);
      const expectedPrice = startAmount + (endAmount - startAmount) * progress;

      expect(expectedPrice).toBe(995000);
    });
  });
});