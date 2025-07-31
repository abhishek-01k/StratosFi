// Auto-generated ABI index file
// Generated on: 2025-07-30T17:14:26.675Z
// DO NOT EDIT MANUALLY - Use "npm run generate-abis" to regenerate

import { TWAPEngineABI } from './TWAPEngine';
import { OptionsProtocolABI } from './OptionsProtocol';
import { ConcentratedLiquidityHookABI } from './ConcentratedLiquidityHook';
import { VolatilityOracleABI } from './VolatilityOracle';
import { AdvancedStrategyRouterABI } from './AdvancedStrategyRouter';

// Export individual ABIs
export { TWAPEngineABI, OptionsProtocolABI, ConcentratedLiquidityHookABI, VolatilityOracleABI, AdvancedStrategyRouterABI };

// Re-export all ABIs as a single object for convenience
export const ABIS = {
  TWAPEngine: TWAPEngineABI,
  OptionsProtocol: OptionsProtocolABI,
  ConcentratedLiquidityHook: ConcentratedLiquidityHookABI,
  VolatilityOracle: VolatilityOracleABI,
  AdvancedStrategyRouter: AdvancedStrategyRouterABI,
} as const;

// Type helper for getting ABI types
export type ContractName = keyof typeof ABIS;
