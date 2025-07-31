// Polygon Mainnet Deployed Contracts
export const POLYGON_CONTRACTS = {
  chainId: 137,
  contracts: {
    volatilityOracle: '0x0Aa50c2FC813d7d316d044464DF0D5cA8e8c4A79' as const,
    twapEngine: '0xE2d88d34D34A1fba6f34F79785De1E36dc4f8c12' as const,
    concentratedLiquidityHook: '0x2c58f9388470Cef9C163d40470BDcE62C0d9888e' as const,
    optionsProtocol: '0xB16c17578917fac80fEA345ee76021204cd07C34' as const,
    advancedStrategyRouter: '0x49f3cF9680ed21857FCDe27B5C163FAae9e22F66' as const,
    limitOrderProtocol: '0x111111125421cA6dc452d289314280a0f8842A65' as const,
  },
  tokens: {
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' as const,
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as const,
  }
} as const

export type PolygonContracts = typeof POLYGON_CONTRACTS