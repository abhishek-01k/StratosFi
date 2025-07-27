import { env } from './env.validation';

export const nearConfig = {
  networkId: env.NEAR_NETWORK_ID,
  nodeUrl: env.NEAR_NODE_URL,
  accountId: env.NEAR_ACCOUNT_ID,
  privateKey: env.NEAR_PRIVATE_KEY,
  
  // Contract addresses
  solverRegistryContract: env.SOLVER_REGISTRY_CONTRACT,
  intentsVaultContract: env.INTENTS_VAULT_CONTRACT,
  
  // Solver configuration
  solverPoolId: env.SOLVER_POOL_ID,
  
  // Gas configuration
  defaultGas: '300000000000000', // 300 TGas
  defaultDeposit: '1', // 1 yoctoNEAR
};