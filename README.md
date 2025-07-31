# 1inch Advanced Strategies Protocol

An advanced DeFi protocol extending 1inch Limit Order Protocol with cutting-edge strategies including options on execution rights, concentrated liquidity hooks, TWAP with MEV protection, and volatility-aware position sizing.

## 🚀 Key Features

### 1. **Options on Limit Order Execution Rights** (Industry First)
- Trade options on the **right to execute** limit orders
- Call/Put options with customizable strike prices and expiration
- 30-minute exercise window before expiration
- Premium-based risk transfer mechanism

### 2. **Concentrated Liquidity Integration**
- Hooks for Uniswap V3-style concentrated liquidity positions
- Dynamic fee tiers based on volatility
- Automatic range adjustments
- Capital efficiency optimization

### 3. **Advanced TWAP with MEV Protection**
- Time-weighted execution with anti-MEV randomization
- ±15% execution size randomization
- Adaptive intervals based on volatility
- Price deviation protection

### 4. **Volatility-Aware Position Sizing**
- Real-time volatility analysis (0-1000 risk score)
- Dynamic position sizing (50-150% of base amount)
- Emergency pause mechanisms
- Conservative mode for risk-averse users

### 5. **Cross-Strategy Composability**
- Combine multiple strategies in single orders
- Unified interface for all strategies
- Gas-optimized batch operations
- Modular architecture for easy extensions

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    1inch Limit Order Protocol                │
├─────────────────────────────────────────────────────────────┤
│                      Advanced Strategies                      │
├──────────────┬────────────────┬──────────────┬──────────────┤
│   Options    │ Concentrated   │    TWAP      │ Volatility   │
│  Calculator  │   Liquidity    │   Engine     │  Manager     │
├──────────────┴────────────────┴──────────────┴──────────────┤
│                    Unified Strategy Router                    │
└─────────────────────────────────────────────────────────────┘
```

## 🛠 Installation

```bash
# Clone the repository
git clone https://github.com/abhishek-01k
cd oneinch-advanced-strategies

# Install dependencies
forge install

# Run tests
forge test

# Deploy contracts
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast
```

## 📝 Smart Contracts

### Core Contracts

| Contract | Description | Gas Estimate |
|----------|-------------|--------------|
| `AdvancedStrategyRouter` | Main entry point for all strategies | Variable |
| `OptionsProtocol` | Options on execution rights | ~150k |
| `ConcentratedLiquidityHook` | Uniswap V3 style liquidity | ~200k |
| `TWAPEngine` | MEV-resistant TWAP execution | ~100k |
| `VolatilityOracle` | Real-time volatility tracking | ~75k |

### Integration Interface

All strategies implement the 1inch `IAmountGetter` interface:

```solidity
interface IAmountGetter {
    function getMakingAmount(
        Order calldata order,
        bytes calldata extension,
        bytes32 orderHash,
        address taker,
        uint256 takingAmount,
        uint256 remainingMakingAmount,
        bytes calldata extraData
    ) external view returns (uint256);
}
```

## 💡 Usage Examples

### Options Trading
```solidity
// Create a call option on a limit order
bytes32 optionId = optionsProtocol.createCallOption({
    orderHash: limitOrderHash,
    strikePrice: 2200 * 1e18,  // $2200 strike
    expiration: block.timestamp + 7 days,
    premium: 50 * 1e18  // $50 premium
});

// Exercise if profitable
if (currentPrice > strikePrice) {
    optionsProtocol.exerciseOption(optionId);
}
```

### Concentrated Liquidity
```solidity
// Create limit order with concentrated liquidity hook
LimitOrderData memory orderData = LimitOrderData({
    makerAsset: USDC,
    takerAsset: WETH,
    makingAmount: 10000 * 1e6,
    takingAmount: 3 * 1e18,
    hook: address(concentratedLiquidityHook),
    hookData: abi.encode(
        3000,      // 0.3% fee tier
        -887220,   // Lower tick
        887220     // Upper tick
    )
});
```

### TWAP Execution
```solidity
// Configure TWAP strategy
TWAPConfig memory config = TWAPConfig({
    intervals: 24,           // 24 executions
    duration: 24 hours,      // Over 24 hours
    randomization: true,     // Enable MEV protection
    maxDeviation: 500        // 5% max price deviation
});
```

## 🔒 Security Features

- **Audited contracts** (pending)
- **Emergency pause mechanisms**
- **Price deviation protection**
- **Replay attack prevention**
- **Access control for admin functions**

## 🧪 Testing

```bash
# Run all tests
forge test

# Run specific test file
forge test --match-path test/OptionsProtocol.t.sol

# Run with gas reporting
forge test --gas-report

# Run fork tests
forge test --fork-url $MAINNET_RPC
```

## 📈 Performance Metrics

| Strategy | Gas Cost | Execution Time | Risk Reduction |
|----------|----------|----------------|----------------|
| Options Trading | ~150k | Instant | Premium-based hedging |
| Concentrated Liquidity | ~200k | Instant | Improved capital efficiency |
| TWAP Execution | ~100k | Configurable | MEV protection |
| Volatility Sizing | ~75k | Real-time | Up to 50% risk reduction |

## 🛠 Development

### Building and ABI Generation

This project uses Foundry for smart contract development and includes automated ABI generation for the frontend:

```bash
# Compile contracts and generate ABIs for frontend
npm run generate-abis

# Or run individually
forge build                # Compile contracts
node generate-abis.js      # Extract ABIs to frontend/lib/contracts/abis/
```

The `generate-abis` script automatically:
- Compiles all Solidity contracts using Foundry
- Extracts ABIs from compiled artifacts in `out/` directory  
- Generates TypeScript ABI files in `frontend/lib/contracts/abis/`
- Creates properly typed exports for use with wagmi/viem

### Frontend Development

```bash
# Start the frontend development server
npm run frontend:dev

# Build the frontend for production  
npm run frontend:build
```

The frontend uses the latest wagmi v2 hooks with proper TypeScript typing:
- `useReadContract` for contract reads
- `useWriteContract` for contract writes  
- `useWaitForTransactionReceipt` for transaction confirmations

### Testing

```bash
# Run all tests
npm run test

# Deploy to Polygon testnet
npm run deploy:polygon
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## ⚠️ Disclaimer

This protocol is experimental and has not been audited. Use at your own risk. Do not use with real funds on mainnet without proper testing and auditing.

## 🔗 Resources

- [1inch Limit Order Protocol](https://docs.1inch.io/docs/limit-order-protocol/introduction)
- [1inch Developer Portal](https://portal.1inch.dev/)
- [Documentation](./docs)
- [Examples](./examples)