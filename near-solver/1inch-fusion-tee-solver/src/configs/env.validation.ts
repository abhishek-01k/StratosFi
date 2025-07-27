import Joi from 'joi';

const envSchema = Joi.object({
  // 1inch Fusion+ Configuration
  INCH_FUSION_API_KEY: Joi.string().required(),
  INCH_FUSION_API_URL: Joi.string().uri().default('https://api.1inch.dev/fusion'),
  INCH_FUSION_NETWORK_IDS: Joi.string().required(),

  // NEAR Configuration
  NEAR_NETWORK_ID: Joi.string().valid('mainnet', 'testnet').required(),
  NEAR_NODE_URL: Joi.string().uri().default('https://rpc.mainnet.near.org'),
  NEAR_ACCOUNT_ID: Joi.string().required(),
  NEAR_PRIVATE_KEY: Joi.string().pattern(/^ed25519:/).required(),

  // Solver Registry Configuration
  SOLVER_REGISTRY_CONTRACT: Joi.string().required(),
  INTENTS_VAULT_CONTRACT: Joi.string().required(),
  SOLVER_POOL_ID: Joi.number().integer().min(0).required(),

  // Solver Configuration
  MIN_PROFIT_BPS: Joi.number().min(0).max(10000).default(30),
  MAX_GAS_PRICE_GWEI: Joi.number().min(1).default(100),
  REBALANCE_THRESHOLD_PERCENT: Joi.number().min(0).max(100).default(20),
  ORDER_EXPIRY_SECONDS: Joi.number().min(30).default(180),

  // Supported Tokens
  SUPPORTED_TOKENS: Joi.string().required(),

  // Liquidity Management
  LIQUIDITY_BUFFER_PERCENT: Joi.number().min(0).max(100).default(10),
  MAX_EXPOSURE_PER_TOKEN: Joi.number().min(0).default(1000000),
  REBALANCE_INTERVAL_MS: Joi.number().min(60000).default(300000),

  // Risk Management
  MAX_SLIPPAGE_BPS: Joi.number().min(0).max(10000).default(100),
  MIN_ORDER_SIZE_USD: Joi.number().min(0).default(10),
  MAX_ORDER_SIZE_USD: Joi.number().min(0).default(1000000),

  // TEE Configuration
  TEE_MODE: Joi.string().valid('development', 'production').default('development'),
  TEE_ATTESTATION_ENDPOINT: Joi.string().uri().optional(),
  PHALA_API_KEY: Joi.string().optional(),

  // Monitoring
  METRICS_PORT: Joi.number().port().default(9090),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  HEALTH_CHECK_INTERVAL_MS: Joi.number().min(10000).default(30000),

  // WebSocket Configuration
  WS_RECONNECT_INTERVAL_MS: Joi.number().min(1000).default(5000),
  WS_MAX_RECONNECT_ATTEMPTS: Joi.number().min(1).default(10),

  // Database
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql'] }).optional(),
  REDIS_URL: Joi.string().uri({ scheme: ['redis'] }).optional(),

  // Node environment
  NODE_ENV: Joi.string().valid('development', 'test', 'production', 'local').default('local'),
}).unknown(true);

export function validateEnv() {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    console.error('Environment validation failed:');
    error.details.forEach(detail => {
      console.error(`  - ${detail.message}`);
    });
    process.exit(1);
  }

  return value;
}

// Export validated environment variables
export const env = validateEnv();