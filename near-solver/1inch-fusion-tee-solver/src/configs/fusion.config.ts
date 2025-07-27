import { env } from './env.validation';

export const fusionConfig = {
  apiKey: env.INCH_FUSION_API_KEY,
  apiUrl: env.INCH_FUSION_API_URL,
  networkIds: env.INCH_FUSION_NETWORK_IDS.split(',').map((id: string) => parseInt(id.trim())),
  
  // Order processing configuration
  minProfitBps: env.MIN_PROFIT_BPS,
  maxGasPriceGwei: env.MAX_GAS_PRICE_GWEI,
  orderExpirySeconds: env.ORDER_EXPIRY_SECONDS,
  
  // Risk management
  maxSlippageBps: env.MAX_SLIPPAGE_BPS,
  minOrderSizeUsd: env.MIN_ORDER_SIZE_USD,
  maxOrderSizeUsd: env.MAX_ORDER_SIZE_USD,
};

// Chain configuration
export const chainConfig: Record<number, ChainConfig> = {
  1: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth.llamarpc.com',
    nativeCurrency: 'ETH',
    blockTime: 12,
    confirmations: 3,
  },
  137: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    nativeCurrency: 'MATIC',
    blockTime: 2,
    confirmations: 10,
  },
  42161: {
    chainId: 42161,
    name: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    nativeCurrency: 'ETH',
    blockTime: 0.25,
    confirmations: 1,
  },
  10: {
    chainId: 10,
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    nativeCurrency: 'ETH',
    blockTime: 2,
    confirmations: 1,
  },
  56: {
    chainId: 56,
    name: 'BSC',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    nativeCurrency: 'BNB',
    blockTime: 3,
    confirmations: 5,
  },
  43114: {
    chainId: 43114,
    name: 'Avalanche',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    nativeCurrency: 'AVAX',
    blockTime: 2,
    confirmations: 10,
  },
  8453: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    nativeCurrency: 'ETH',
    blockTime: 2,
    confirmations: 1,
  },
};

interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  nativeCurrency: string;
  blockTime: number;
  confirmations: number;
}

// Parse supported tokens from environment
export const supportedTokens = parseSupportedTokens();

function parseSupportedTokens(): Map<string, TokenConfig> {
  const tokens = new Map<string, TokenConfig>();
  const tokenList = env.SUPPORTED_TOKENS.split(',');
  
  tokenList.forEach((tokenStr: string) => {
    const [chainId, address, symbol] = tokenStr.split(':');
    const key = `${chainId}:${address.toLowerCase()}`;
    
    tokens.set(key, {
      chainId: parseInt(chainId),
      address: address.toLowerCase(),
      symbol,
      decimals: 18, // Default, should be fetched from chain
    });
  });
  
  return tokens;
}

interface TokenConfig {
  chainId: number;
  address: string;
  symbol: string;
  decimals: number;
}