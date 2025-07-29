# 1inch Advanced Strategies Frontend

A modern web application for interacting with the 1inch Advanced Strategies protocol, built with Next.js, TypeScript, shadcn/ui, and TailwindCSS.

## Features

### 🚀 Trading Strategies

1. **TWAP (Time-Weighted Average Price)**
   - MEV-resistant execution
   - Customizable intervals and duration
   - Price deviation protection
   - Randomized execution amounts

2. **Options Protocol**
   - Call and put options on limit orders
   - 30-minute exercise window
   - Real-time Greeks calculation
   - Premium-based pricing

3. **Concentrated Liquidity**
   - Uniswap V3-style liquidity provision
   - Custom price ranges
   - Multiple fee tiers (0.05%, 0.3%, 1%)
   - Tick management

### 📊 Dashboard
- Real-time volatility monitoring
- User statistics tracking
- Strategy recommendations
- Market condition alerts

### 🔧 Technical Features
- Web3 wallet integration (RainbowKit)
- Multi-chain support (Ethereum, Arbitrum, Polygon, Optimism, Base)
- Dark/Light theme support
- Responsive design
- Token selection with balance display

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Web3 wallet (MetaMask, WalletConnect, etc.)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies (using bun)
bun install

# Or using npm
npm install
```

### Configuration

1. Update the WalletConnect project ID in `/lib/wagmi.ts`:
```typescript
export const config = getDefaultConfig({
  appName: '1inch Advanced Strategies',
  projectId: 'YOUR_PROJECT_ID', // Get from https://cloud.walletconnect.com
  chains: [mainnet, arbitrum, polygon, optimism, base],
  ssr: true,
})
```

2. Update contract addresses in `/lib/contracts/addresses.ts` with your deployed contract addresses.

### Development

```bash
# Start the development server
bun dev

# Or using npm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
# Build the application
bun run build

# Start the production server
bun start

# Or using npm
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                      # Next.js 13+ app directory
│   ├── strategies/          # Strategy pages (TWAP, Options, Liquidity)
│   ├── dashboard/           # Dashboard page
│   └── page.tsx            # Home page
├── components/              # Reusable components
│   ├── ui/                 # shadcn/ui components
│   ├── providers/          # Web3 and theme providers
│   ├── token-selector.tsx  # Token selection component
│   └── token-input.tsx     # Token amount input
├── hooks/                   # Custom React hooks
│   └── useTokenList.ts     # Token list management
├── lib/                     # Utility functions and configurations
│   ├── contracts/          # Contract ABIs and addresses
│   └── wagmi.ts           # Wagmi configuration
└── styles/                  # Global styles

```

## Key Components

### TokenInput
A reusable component for token amount input with balance display and MAX button.

```tsx
<TokenInput
  label="Sell Amount"
  value={amount}
  onChange={setAmount}
  selectedToken={sellToken}
  onSelectToken={setSellToken}
/>
```

### TokenSelector
Dropdown component for selecting tokens with search functionality.

```tsx
<TokenSelector
  selectedToken={selectedToken}
  onSelectToken={onSelectToken}
  label="Select Token"
/>
```

### WalletConnectButton
Custom wallet connection button with network switching support.

## Adding New Features

### Adding a New Strategy

1. Create a new page in `app/strategies/[strategy-name]/page.tsx`
2. Add the strategy to the navigation in `config/site.ts`
3. Create contract interaction hooks using wagmi
4. Build the UI using shadcn/ui components

### Adding New shadcn/ui Components

```bash
# Using bun
bunx --bun shadcn@latest add [component-name]

# Using npm
npx shadcn-ui@latest add [component-name]
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Testing

The frontend can be tested with:
- Local blockchain (Hardhat/Anvil)
- Testnet deployments
- Mainnet fork

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.