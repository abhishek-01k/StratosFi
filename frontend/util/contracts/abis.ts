export const TWAPEngineABI = [
  {
    inputs: [
      { name: "order", type: "tuple", components: [
        { name: "salt", type: "uint256" },
        { name: "maker", type: "address" },
        { name: "receiver", type: "address" },
        { name: "makerAsset", type: "address" },
        { name: "takerAsset", type: "address" },
        { name: "makingAmount", type: "uint256" },
        { name: "takingAmount", type: "uint256" },
        { name: "makerTraits", type: "uint256" }
      ]},
      { name: "extension", type: "bytes" },
      { name: "orderHash", type: "bytes32" },
      { name: "taker", type: "address" },
      { name: "makingAmount", type: "uint256" },
      { name: "takingAmount", type: "uint256" },
      { name: "remainingMakingAmount", type: "uint256" },
      { name: "extraData", type: "bytes" }
    ],
    name: "getMakingAmount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "duration", type: "uint256" },
      { name: "intervals", type: "uint256" },
      { name: "priceDeviation", type: "uint256" }
    ],
    name: "createTWAPConfig",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const

export const OptionsProtocolABI = [
  {
    inputs: [
      { name: "order", type: "tuple", components: [
        { name: "salt", type: "uint256" },
        { name: "maker", type: "address" },
        { name: "receiver", type: "address" },
        { name: "makerAsset", type: "address" },
        { name: "takerAsset", type: "address" },
        { name: "makingAmount", type: "uint256" },
        { name: "takingAmount", type: "uint256" },
        { name: "makerTraits", type: "uint256" }
      ]},
      { name: "extension", type: "bytes" },
      { name: "orderHash", type: "bytes32" },
      { name: "taker", type: "address" },
      { name: "makingAmount", type: "uint256" },
      { name: "takingAmount", type: "uint256" },
      { name: "remainingMakingAmount", type: "uint256" },
      { name: "extraData", type: "bytes" }
    ],
    name: "getMakingAmount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "orderHash", type: "bytes32" },
      { name: "optionType", type: "uint8" },
      { name: "premium", type: "uint256" },
      { name: "expiration", type: "uint256" }
    ],
    name: "createOption",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "orderHash", type: "bytes32" }
    ],
    name: "exerciseOption",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "orderHash", type: "bytes32" }
    ],
    name: "calculateGreeks",
    outputs: [
      { name: "delta", type: "uint256" },
      { name: "gamma", type: "uint256" },
      { name: "theta", type: "uint256" },
      { name: "vega", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const

export const ConcentratedLiquidityHookABI = [
  {
    inputs: [
      { name: "order", type: "tuple", components: [
        { name: "salt", type: "uint256" },
        { name: "maker", type: "address" },
        { name: "receiver", type: "address" },
        { name: "makerAsset", type: "address" },
        { name: "takerAsset", type: "address" },
        { name: "makingAmount", type: "uint256" },
        { name: "takingAmount", type: "uint256" },
        { name: "makerTraits", type: "uint256" }
      ]},
      { name: "extension", type: "bytes" },
      { name: "orderHash", type: "bytes32" },
      { name: "taker", type: "address" },
      { name: "makingAmount", type: "uint256" },
      { name: "takingAmount", type: "uint256" },
      { name: "remainingMakingAmount", type: "uint256" },
      { name: "extraData", type: "bytes" }
    ],
    name: "getMakingAmount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
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
    inputs: [
      { name: "token", type: "address" }
    ],
    name: "getRiskScore",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "token", type: "address" }
    ],
    name: "getVolatilityCategory",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "token", type: "address" },
      { name: "basePosition", type: "uint256" }
    ],
    name: "getRecommendedPositionSize",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "token", type: "address" },
      { name: "price", type: "uint256" }
    ],
    name: "updatePrice",
    outputs: [],
    stateMutability: "nonpayable",
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
      { name: "totalOrders", type: "uint256" },
      { name: "successfulOrders", type: "uint256" },
      { name: "totalVolume", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "protocolFee",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "newFee", type: "uint256" }
    ],
    name: "setProtocolFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const