# 1inch Fusion+ TEE Solver Architecture

## Overview

This document describes the architecture of the 1inch Fusion+ solver built using NEAR's Shade Agent Framework and deployed in a Trusted Execution Environment (TEE).

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        1inch Fusion+ API                         │
│                   (Order Flow & Price Discovery)                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TEE Solver Instance                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Fusion Order Service                    │    │
│  │         (Monitors orders, calculates profitability)      │    │
│  └─────────────────────┬───────────────────────────────────┘    │
│                        │                                         │
│  ┌─────────────────────▼───────────────────────────────────┐    │
│  │                   Solver Service                         │    │
│  │        (Executes profitable orders atomically)           │    │
│  └─────────────────────┬───────────────────────────────────┘    │
│                        │                                         │
│  ┌─────────────────────▼───────────────────────────────────┐    │
│  │                 Liquidity Service                        │    │
│  │         (Manages cross-chain token balances)             │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEAR Blockchain                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Solver Registry Contract                    │    │
│  │         (TEE attestation & solver management)            │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               Intents Vault Contract                     │    │
│  │           (Liquidity pools & order execution)            │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Fusion Order Service
- **Purpose**: Interface with 1inch Fusion+ API
- **Responsibilities**:
  - Monitor active orders across supported chains
  - Filter orders based on profitability
  - Track order status and execution
  - Calculate auction prices in real-time

### 2. Solver Service
- **Purpose**: Core order execution logic
- **Responsibilities**:
  - Validate orders (signature, deadline, size)
  - Calculate execution parameters (gas, profit)
  - Execute profitable orders
  - Manage cross-chain coordination

### 3. Liquidity Service
- **Purpose**: Manage solver's liquidity
- **Responsibilities**:
  - Track token balances across chains
  - Lock/unlock liquidity during execution
  - Monitor for rebalancing opportunities
  - Calculate utilization metrics

### 4. TEE Service
- **Purpose**: Secure execution environment
- **Responsibilities**:
  - Generate attestation proofs
  - Secure key management
  - Protect trading strategies
  - Verify TEE environment

### 5. NEAR Service
- **Purpose**: Blockchain interaction
- **Responsibilities**:
  - Manage solver registration
  - Interact with smart contracts
  - Handle cross-chain settlements
  - Maintain on-chain state

## Order Flow

1. **Order Discovery**
   ```
   1inch API → Fusion Order Service → Order Queue
   ```

2. **Profitability Analysis**
   ```
   Order → Price Calculation → Gas Estimation → Profit Check
   ```

3. **Execution Decision**
   ```
   If (profit > minProfit && liquidity available):
       Execute Order
   Else:
       Skip Order
   ```

4. **Order Execution**
   ```
   Lock Liquidity → Submit Transaction → Monitor → Unlock/Update
   ```

## Security Model

### TEE Protection
- **Code Integrity**: Solver code runs in secure enclaves
- **Data Confidentiality**: Private keys and strategies are encrypted
- **Remote Attestation**: Cryptographic proof of correct execution

### Smart Contract Security
- **Registry Control**: Only attested solvers can register
- **Pool Isolation**: Each solver manages its own liquidity pool
- **Emergency Controls**: Pause and withdrawal mechanisms

## Economic Model

### Revenue Sources
1. **Spread Capture**: Difference between auction price and execution
2. **MEV Protection**: Users pay for guaranteed execution
3. **Cross-Chain Arbitrage**: Price differences across chains

### Cost Structure
1. **Gas Fees**: On-chain execution costs
2. **Infrastructure**: TEE hosting and maintenance
3. **Capital**: Opportunity cost of locked liquidity

## Performance Optimizations

### Caching Strategy
- Token prices (60s TTL)
- Gas prices (10s TTL)
- Order processing status (5m TTL)
- Balance snapshots (30s TTL)

### Parallel Processing
- Monitor multiple chains concurrently
- Process independent orders in parallel
- Batch balance updates

### Resource Management
- Connection pooling for RPC providers
- Automatic reconnection with backoff
- Memory-efficient order tracking

## Monitoring & Observability

### Health Checks
- `/health` - Overall system health
- `/metrics` - Prometheus metrics
- `/stats` - Detailed statistics

### Key Metrics
- Order processing rate
- Success/failure ratio
- Liquidity utilization
- Profit margins
- System resource usage

## Deployment

### Development Mode
```bash
npm run dev
```
- TEE attestation bypassed
- Mock data for testing
- Enhanced logging

### Production Mode (TEE)
```bash
docker build -t fusion-solver .
# Deploy to Phala Network
```
- Full TEE attestation
- Secure key management
- Production monitoring

## Future Enhancements

1. **Advanced Strategies**
   - Multi-hop routing
   - Flash loan integration
   - Options-based hedging

2. **Additional Chains**
   - Non-EVM chain support
   - Custom bridge integrations
   - Native cross-chain swaps

3. **Risk Management**
   - Dynamic position sizing
   - Volatility-based limits
   - Automated hedging

4. **Decentralization**
   - Multi-solver coordination
   - Shared liquidity pools
   - DAO governance