# 1inch Fusion+ TEE Solver

A decentralized solver for 1inch Fusion+ built using NEAR's Shade Agent Framework and deployed in a Trusted Execution Environment (TEE).

## 🏗️ Architecture Overview

This solver bridges the gap between 1inch Fusion+ orders and NEAR's decentralized infrastructure, enabling:
- **Gasless Swaps**: Users don't pay gas fees, solvers handle execution
- **MEV Protection**: Dutch auction mechanism prevents front-running
- **Cross-Chain Support**: Seamless integration with multiple blockchains
- **TEE Security**: Secure execution in Trusted Execution Environment
- **Decentralized Liquidity**: Pool-based liquidity management via NEAR contracts

## 🔧 How It Works

### 1. Order Flow
```
User → 1inch Fusion+ API → Solver (TEE) → Blockchain Execution
                              ↓
                         NEAR Registry
                              ↓
                        Liquidity Pools
```

### 2. Key Components

#### Solver Service (TypeScript)
- Monitors 1inch Fusion+ orders via API
- Calculates optimal execution strategies
- Manages liquidity across multiple chains
- Executes swaps atomically

#### NEAR Smart Contracts (Rust)
- **Solver Registry**: Manages solver registration and TEE attestation
- **Liquidity Pools**: Hold funds for cross-chain swaps
- **Intents Vault**: Manages order execution and settlements

#### TEE Deployment (Phala Network)
- Runs solver in secure enclaves
- Provides attestation for trust-minimized execution
- Protects private keys and trading strategies

## 🚀 Quick Start

### Prerequisites
- Node.js v20.18+
- Rust and Cargo (latest stable)
- Docker
- NEAR CLI
- 1inch Fusion+ API key

### Installation

1. **Clone and Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
```bash
cp env/.env.example env/.env.local
# Edit env/.env.local with your configuration
```

Required environment variables:
```env
# 1inch Fusion+ Configuration
INCH_FUSION_API_KEY=your_api_key_here
INCH_FUSION_API_URL=https://api.1inch.dev/fusion

# NEAR Configuration
NEAR_NETWORK_ID=mainnet
NEAR_ACCOUNT_ID=your-solver.near
NEAR_PRIVATE_KEY=ed25519:...

# Solver Configuration
SOLVER_REGISTRY_CONTRACT=solver-registry.near
SUPPORTED_CHAINS=1,137,42161  # Ethereum, Polygon, Arbitrum
MIN_PROFIT_BPS=30  # Minimum profit in basis points

# TEE Configuration
TEE_MODE=production
PHALA_API_KEY=your_phala_key
```

3. **Deploy NEAR Contracts**
```bash
# Build contracts
cd ../tee-solver
make all

# Deploy
near deploy solver-registry.near --wasmFile contracts/solver-registry/res/solver_registry.wasm
```

4. **Register Solver**
```bash
npm run register
```

5. **Run Solver**
```bash
# Development
npm run dev

# Production (in TEE)
docker build -t 1inch-fusion-tee-solver .
# Deploy to Phala Network
```

## 📋 Features

### 1. Order Processing
- Real-time monitoring of 1inch Fusion+ orders
- Intelligent order filtering based on profitability
- Multi-chain order aggregation

### 2. Liquidity Management
- Dynamic liquidity allocation across chains
- Automatic rebalancing based on demand
- Capital efficiency optimization

### 3. Risk Management
- Maximum exposure limits per chain
- Slippage protection mechanisms
- Emergency withdrawal capabilities

### 4. TEE Security
- Secure key management in enclaves
- Attestation-based trust model
- Protection against malicious operators

## 🔒 Security Model

### TEE Attestation
The solver runs in a Trusted Execution Environment providing:
- **Confidentiality**: Private keys and strategies are encrypted
- **Integrity**: Code execution cannot be tampered with
- **Attestation**: Cryptographic proof of correct execution

### Smart Contract Security
- Multi-signature governance for upgrades
- Time-locked withdrawals
- Emergency pause functionality

## 💰 Economics

### Revenue Sources
1. **Spread Capture**: Difference between user price and execution price
2. **Arbitrage**: Cross-chain price differences
3. **Liquidity Provision**: Fees from providing liquidity

### Cost Structure
1. **Gas Fees**: Execution costs on various chains
2. **Infrastructure**: TEE hosting and maintenance
3. **Capital Lock**: Opportunity cost of locked liquidity

## 🛠️ Development

### Testing
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests with testnet
npm run test:e2e
```

### Monitoring
The solver exposes metrics at `/metrics`:
- Order processing rate
- Success/failure ratios
- Profit margins
- Liquidity utilization

## 🤝 Contributing

This project is part of the 1inch Fusion+ hackathon submission. Key areas for contribution:
1. Additional chain integrations
2. Advanced trading strategies
3. Improved capital efficiency algorithms
4. Enhanced monitoring and analytics

## 📚 Resources

- [1inch Fusion+ Documentation](https://docs.1inch.io/fusion)
- [NEAR Shade Agent Framework](https://github.com/NearDeFi/shade-agent-template)
- [Phala Network TEE Docs](https://docs.phala.network)

## 📄 License

MIT License - see LICENSE file for details