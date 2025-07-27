export interface FusionOrder {
  orderHash: string;
  maker: string;
  receiver: string;
  makerAsset: string;
  takerAsset: string;
  makingAmount: string;
  takingAmount: string;
  deadline: number;
  nonce: string;
  signature: string;
  chainId: number;
  
  // Auction details
  auctionStartTime: number;
  auctionEndTime: number;
  auctionStartAmount: string;
  auctionEndAmount: string;
  
  // Additional metadata
  quoteId?: string;
  whitelist?: string[];
  interactions?: string[];
  permit?: string;
}

export interface FusionQuote {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  fromAmount: string;
  toAmount: string;
  estimatedGas: string;
  
  // Auction presets
  presets: AuctionPreset[];
  recommendedPreset: number;
  
  // Price information
  prices: {
    [tokenAddress: string]: string;
  };
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
}

export interface AuctionPreset {
  auctionDuration: number;
  startAuctionIn: number;
  initialRateBump: number;
  auctionStartAmount: string;
  auctionEndAmount: string;
  points?: AuctionPoint[];
}

export interface AuctionPoint {
  delay: number;
  coefficient: number;
}

export interface OrderExecutionParams {
  order: FusionOrder;
  executionPrice: string;
  estimatedProfit: string;
  gasCost: string;
  deadline: number;
}

export enum OrderStatus {
  Created = 'created',
  Pending = 'pending',
  Executing = 'executing',
  Filled = 'filled',
  PartiallyFilled = 'partially_filled',
  Cancelled = 'cancelled',
  Expired = 'expired',
  Failed = 'failed'
}