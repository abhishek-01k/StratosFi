export const TWAPEngineABI = [
  {
    inputs: [
      { name: "totalAmount", type: "uint256" },
      { name: "intervals", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "maxPriceDeviation", type: "uint256" },
      { name: "enableRandomization", type: "bool" }
    ],
    name: "configureTWAP",
    outputs: [{ name: "configId", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "configId", type: "bytes32" },
      { name: "currentPrice", type: "uint256" }
    ],
    name: "executeTWAPInterval",
    outputs: [{ name: "executedAmount", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "configId", type: "bytes32" }
    ],
    name: "getTWAPStatus",
    outputs: [
      { 
        name: "config", 
        type: "tuple",
        components: [
          { name: "totalAmount", type: "uint256" },
          { name: "intervals", type: "uint256" },
          { name: "startTime", type: "uint256" },
          { name: "endTime", type: "uint256" },
          { name: "maxPriceDeviation", type: "uint256" },
          { name: "enableRandomization", type: "bool" },
          { name: "randomizationFactor", type: "uint256" },
          { name: "priceOracle", type: "address" }
        ]
      },
      { 
        name: "execution", 
        type: "tuple",
        components: [
          { name: "configId", type: "bytes32" },
          { name: "executedAmount", type: "uint256" },
          { name: "executedIntervals", type: "uint256" },
          { name: "lastExecutionTime", type: "uint256" },
          { name: "lastExecutionPrice", type: "uint256" },
          { name: "intervalAmounts", type: "uint256[]" },
          { name: "isPaused", type: "bool" }
        ]
      },
      { name: "nextIntervalTime", type: "uint256" },
      { name: "remainingAmount", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "configId", type: "bytes32" }
    ],
    name: "pauseTWAP",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "configId", type: "bytes32" }
    ],
    name: "resumeTWAP",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const

export const OptionsProtocolABI = [
  {
    inputs: [
      { name: "orderHash", type: "bytes32" },
      { name: "strikePrice", type: "uint256" },
      { name: "expiration", type: "uint256" },
      { name: "premium", type: "uint256" }
    ],
    name: "createCallOption",
    outputs: [{ name: "optionId", type: "bytes32" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "orderHash", type: "bytes32" },
      { name: "strikePrice", type: "uint256" },
      { name: "expiration", type: "uint256" },
      { name: "premium", type: "uint256" }
    ],
    name: "createPutOption",
    outputs: [{ name: "optionId", type: "bytes32" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "optionId", type: "bytes32" }
    ],
    name: "exerciseOption",
    outputs: [{ name: "profit", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "optionId", type: "bytes32" }
    ],
    name: "getOptionGreeks",
    outputs: [
      {
        name: "greeks",
        type: "tuple",
        components: [
          { name: "delta", type: "int256" },
          { name: "gamma", type: "int256" },
          { name: "theta", type: "int256" },
          { name: "vega", type: "int256" },
          { name: "intrinsicValue", type: "uint256" },
          { name: "timeValue", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "depositCollateral",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "amount", type: "uint256" }
    ],
    name: "withdrawCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "user", type: "address" }
    ],
    name: "collateralBalances",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const

export const ConcentratedLiquidityHookABI = [
  {
    inputs: [
      { name: "tickLower", type: "int24" },
      { name: "tickUpper", type: "int24" },
      { name: "feeTier", type: "uint24" }
    ],
    name: "createLiquidityPosition",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "sqrtPriceX96", type: "uint160" }
    ],
    name: "getTickAtSqrtPrice",
    outputs: [{ name: "tick", type: "int24" }],
    stateMutability: "pure",
    type: "function"
  }
] as const

export const VolatilityOracleABI = [
  {
    inputs: [],
    name: "getCurrentVolatility",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getRiskMetrics",
    outputs: [
      {
        name: "metrics",
        type: "tuple",
        components: [
          { name: "riskScore", type: "uint256" },
          { name: "isHighRisk", type: "bool" },
          { name: "adjustmentFactor", type: "uint256" },
          { name: "recommendedInterval", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "newVolatility", type: "uint256" }
    ],
    name: "updateVolatility",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "getVolatilityCategory",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  }
] as const

export const AdvancedStrategyRouterABI = [
  {
    inputs: [
      { name: "strategies", type: "uint8[]" },
      { name: "configs", type: "bytes[]" }
    ],
    name: "createCombinedStrategy",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "user", type: "address" }
    ],
    name: "getUserStats",
    outputs: [
      { name: "totalExecutions", type: "uint256" },
      { name: "totalVolume", type: "uint256" },
      { name: "averageGasUsed", type: "uint256" },
      { name: "successRate", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "protocolFeeRate",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "newFeeRate", type: "uint256" }
    ],
    name: "updateProtocolFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const