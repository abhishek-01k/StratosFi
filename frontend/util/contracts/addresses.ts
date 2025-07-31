import { Address } from 'viem'

type ContractAddresses = {
  twapEngine: Address
  optionsProtocol: Address
  concentratedLiquidityHook: Address
  volatilityOracle: Address
  advancedStrategyRouter: Address
}

export const contractAddresses: Record<number, ContractAddresses> = {
  // Ethereum Mainnet
  1: {
    twapEngine: '0x0000000000000000000000000000000000000000',
    optionsProtocol: '0x0000000000000000000000000000000000000000',
    concentratedLiquidityHook: '0x0000000000000000000000000000000000000000',
    volatilityOracle: '0x0000000000000000000000000000000000000000',
    advancedStrategyRouter: '0x0000000000000000000000000000000000000000',
  },
  // Arbitrum
  42161: {
    twapEngine: '0x0000000000000000000000000000000000000000',
    optionsProtocol: '0x0000000000000000000000000000000000000000',
    concentratedLiquidityHook: '0x0000000000000000000000000000000000000000',
    volatilityOracle: '0x0000000000000000000000000000000000000000',
    advancedStrategyRouter: '0x0000000000000000000000000000000000000000',
  },
  // Polygon
  137: {
    volatilityOracle: "0x0Aa50c2FC813d7d316d044464DF0D5cA8e8c4A79",
    twapEngine: "0xE2d88d34D34A1fba6f34F79785De1E36dc4f8c12",
    concentratedLiquidityHook: "0x2c58f9388470Cef9C163d40470BDcE62C0d9888e",
    optionsProtocol: "0xB16c17578917fac80fEA345ee76021204cd07C34",
    advancedStrategyRouter: "0x49f3cF9680ed21857FCDe27B5C163FAae9e22F66"
  },
  // Sepolia Testnet
  11155111: {
    twapEngine: '0x0000000000000000000000000000000000000000',
    optionsProtocol: '0x0000000000000000000000000000000000000000',
    concentratedLiquidityHook: '0x0000000000000000000000000000000000000000',
    volatilityOracle: '0x0000000000000000000000000000000000000000',
    advancedStrategyRouter: '0x0000000000000000000000000000000000000000',
  },
}

export const getContractAddress = (chainId: number, contract: keyof ContractAddresses): Address => {
  const addresses = contractAddresses[chainId]
  if (!addresses) {
    throw new Error(`No contract addresses found for chain ${chainId}`)
  }
  return addresses[contract]
}