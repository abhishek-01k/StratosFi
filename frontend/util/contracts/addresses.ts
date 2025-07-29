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
    twapEngine: '0x0000000000000000000000000000000000000000',
    optionsProtocol: '0x0000000000000000000000000000000000000000',
    concentratedLiquidityHook: '0x0000000000000000000000000000000000000000',
    volatilityOracle: '0x0000000000000000000000000000000000000000',
    advancedStrategyRouter: '0x0000000000000000000000000000000000000000',
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