export interface NEARAccount {
  accountId: string;
  publicKey: string;
  privateKey: string;
}

export interface SolverRegistration {
  poolId: number;
  accountId: string;
  publicKey: string;
  checksum: string;
  codehash: string;
  isActive: boolean;
  createdAt: number;
}

export interface LiquidityPool {
  poolId: number;
  tokenIds: string[];
  owner: string;
  totalDeposits: Record<string, string>;
  availableBalances: Record<string, string>;
  lockedBalances: Record<string, string>;
  feeRate: number;
  isActive: boolean;
}

export interface TokenBalance {
  tokenId: string;
  balance: string;
  decimals: number;
  symbol: string;
}

export interface CrossChainOrder {
  orderId: string;
  sourceChain: number;
  targetChain: number;
  maker: string;
  receiver: string;
  sourceToken: string;
  targetToken: string;
  sourceAmount: string;
  targetAmount: string;
  secretHash: string;
  expiration: number;
  status: OrderStatus;
}

export enum OrderStatus {
  Created = 'created',
  Locked = 'locked',
  Revealed = 'revealed',
  Claimed = 'claimed',
  Refunded = 'refunded',
  Expired = 'expired'
}