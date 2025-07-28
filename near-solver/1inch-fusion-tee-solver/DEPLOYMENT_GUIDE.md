# 1inch Fusion+ TEE Solver Deployment Guide

## Prerequisites

1. **1inch Fusion+ API Access**
   - Obtain API key from [1inch Developer Portal](https://portal.1inch.dev)
   - Verify access to Fusion+ endpoints

2. **NEAR Account Setup**
   - Create a NEAR account for the solver
   - Fund account with NEAR tokens
   - Generate and secure private keys

3. **Phala Network Access** (for TEE deployment)
   - Create account on [Phala Console](https://console.phala.network)
   - Obtain API credentials
   - Verify TEE compatibility

## Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd 1inch-fusion-tee-solver

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy example environment
cp env/.env.example env/.env.local

# Edit configuration
nano env/.env.local
```

Required configuration:
```env
# 1inch Fusion+ API
INCH_FUSION_API_KEY=your_api_key_here
INCH_FUSION_NETWORK_IDS=1,137,42161  # Ethereum, Polygon, Arbitrum

# NEAR Configuration
NEAR_NETWORK_ID=testnet  # or mainnet
NEAR_ACCOUNT_ID=your-solver.testnet
NEAR_PRIVATE_KEY=ed25519:your_private_key_here

# Contracts (testnet example)
SOLVER_REGISTRY_CONTRACT=solver-registry.testnet
INTENTS_VAULT_CONTRACT=intents-vault.testnet
SOLVER_POOL_ID=1

# Development mode
TEE_MODE=development
```

### 3. Deploy NEAR Contracts

First, build and deploy the registry contracts:

```bash
# Navigate to tee-solver directory
cd ../tee-solver

# Build contracts
make all

# Deploy solver registry
near deploy solver-registry.testnet \
  --wasmFile contracts/solver-registry/res/solver_registry.wasm \
  --initFunction new \
  --initArgs '{"owner_id": "admin.testnet", "intents_contract_id": "intents.testnet"}'

# Deploy intents vault
near deploy intents-vault.testnet \
  --wasmFile contracts/intents-vault/res/intents_vault.wasm \
  --initFunction new \
  --initArgs '{"owner_id": "admin.testnet"}'
```

### 4. Fund Liquidity Pools

Deposit tokens to the intents vault:

```bash
# Example: Deposit USDC to the vault
near call usdc.testnet ft_transfer_call \
  '{"receiver_id": "intents-vault.testnet", "amount": "1000000000", "msg": ""}' \
  --accountId your-solver.testnet \
  --depositYocto 1 \
  --gas 300000000000000
```

### 5. Run Solver Locally

```bash
# Return to solver directory
cd ../1inch-fusion-tee-solver

# Start in development mode
npm run dev
```

## Production TEE Deployment

### 1. Build Docker Image

```bash
# Build production image
docker build -t 1inch-fusion-tee-solver:latest .

# Tag for registry
docker tag 1inch-fusion-tee-solver:latest your-registry/1inch-fusion-tee-solver:latest

# Push to registry
docker push your-registry/1inch-fusion-tee-solver:latest
```

### 2. Generate TEE Configuration

Create `.env.phala` for TEE deployment:

```env
# Production configuration
NEAR_NETWORK_ID=mainnet
NEAR_ACCOUNT_ID=your-solver.near
NEAR_PRIVATE_KEY=ed25519:your_production_key

SOLVER_REGISTRY_CONTRACT=solver-registry.near
INTENTS_VAULT_CONTRACT=intents-vault.near
SOLVER_POOL_ID=1

# Mainnet chains
INCH_FUSION_NETWORK_IDS=1,137,42161,10,56,43114,8453

# Production settings
TEE_MODE=production
LOG_LEVEL=info
MIN_PROFIT_BPS=50  # Higher threshold for mainnet
```

### 3. Deploy to Phala Network

Using Phala CLI:

```bash
# Install Phala CLI
npm install -g @phala/cli

# Login to Phala
phala login

# Create CVM instance
phala cvms create \
  -n fusion-solver-mainnet \
  -c docker-compose.yaml \
  -e .env.phala

# Get deployment info
phala cvms info fusion-solver-mainnet
```

### 4. Register Solver

After TEE deployment, register the solver:

```bash
# The solver will auto-register on startup if not registered
# Or manually trigger registration:
docker exec -it fusion-solver npm run register
```

### 5. Verify Deployment

Check solver status:

```bash
# Health check
curl https://your-solver-url.phala.network:9090/health

# View metrics
curl https://your-solver-url.phala.network:9090/metrics

# Check attestation
curl https://your-solver-url.phala.network:9090/attestation
```

## Monitoring Setup

### 1. Prometheus Configuration

Create `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'fusion-solver'
    static_configs:
      - targets: ['fusion_solver:9090']
```

### 2. Deploy Monitoring Stack

```bash
# Start monitoring services
docker-compose up -d prometheus

# Access Prometheus UI
open http://localhost:9091
```

### 3. Key Metrics to Monitor

- `fusion_solver_orders_total` - Total orders processed
- `fusion_solver_success_rate` - Success rate percentage
- `fusion_solver_liquidity_usd` - Available liquidity
- `fusion_solver_memory_usage_mb` - Memory consumption

## Maintenance

### Update Solver

1. Build new image
2. Push to registry
3. Update CVM:
   ```bash
   phala cvms update fusion-solver-mainnet --image your-registry/solver:new-tag
   ```

### Manage Liquidity

```bash
# Check balances
near view intents-vault.near get_balances '{"account_id": "your-solver.near"}'

# Withdraw funds
near call intents-vault.near withdraw \
  '{"token_id": "usdc.near", "amount": "1000000"}' \
  --accountId your-solver.near
```

### Emergency Procedures

1. **Pause Solver**:
   ```bash
   docker exec -it fusion-solver kill -SIGTERM 1
   ```

2. **Emergency Withdrawal**:
   ```bash
   near call solver-registry.near emergency_withdraw \
    '{"pool_id": 1}' \
    --accountId your-solver.near
   ```

## Security Checklist

- [ ] Private keys stored securely
- [ ] API keys not exposed in logs
- [ ] TEE attestation verified
- [ ] Monitoring alerts configured
- [ ] Emergency contacts documented
- [ ] Backup procedures tested

## Troubleshooting

### Common Issues

1. **TEE Attestation Fails**
   - Verify Phala node compatibility
   - Check Docker image attestation
   - Review TEE logs

2. **Order Execution Failures**
   - Check gas price settings
   - Verify liquidity availability
   - Review chain RPC connectivity

3. **Registration Errors**
   - Ensure NEAR account has funds
   - Verify contract addresses
   - Check solver pool exists

### Support Resources

- [1inch Fusion+ Docs](https://docs.1inch.io/fusion)
- [NEAR Developer Discord](https://near.chat)
- [Phala Network Support](https://discord.gg/phala)