// Auto-generated ABI for ConcentratedLiquidityHook
// Generated on: 2025-07-30T17:14:26.674Z
// DO NOT EDIT MANUALLY - Use "npm run generate-abis" to regenerate

export const ConcentratedLiquidityHookABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "addLiquidity",
    "inputs": [
      {
        "name": "orderHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "params",
        "type": "tuple",
        "internalType": "struct ConcentratedLiquidityHook.ConcentratedLiquidityParams",
        "components": [
          {
            "name": "tickLower",
            "type": "int24",
            "internalType": "int24"
          },
          {
            "name": "tickUpper",
            "type": "int24",
            "internalType": "int24"
          },
          {
            "name": "feeTier",
            "type": "uint24",
            "internalType": "uint24"
          },
          {
            "name": "amount0Desired",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "amount1Desired",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "amount0Min",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "amount1Min",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "recipient",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "deadline",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "outputs": [
      {
        "name": "positionId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "liquidity",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "amount0",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "amount1",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "collectFees",
    "inputs": [
      {
        "name": "positionId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "amount0",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "amount1",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "configureStrategy",
    "inputs": [
      {
        "name": "config",
        "type": "tuple",
        "internalType": "struct IAdvancedStrategy.StrategyConfig",
        "components": [
          {
            "name": "strategyType",
            "type": "uint8",
            "internalType": "enum IAdvancedStrategy.StrategyType"
          },
          {
            "name": "isActive",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "minExecutionAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "maxExecutionAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "oracle",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "additionalData",
            "type": "bytes",
            "internalType": "bytes"
          }
        ]
      }
    ],
    "outputs": [
      {
        "name": "configId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "currentTick",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "int24",
        "internalType": "int24"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "executeStrategy",
    "inputs": [
      {
        "name": "orderHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "strategyData",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [
      {
        "name": "executedAmount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getMakingAmount",
    "inputs": [
      {
        "name": "order",
        "type": "tuple",
        "internalType": "struct IOrderMixin.Order",
        "components": [
          {
            "name": "salt",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "maker",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "receiver",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "makerAsset",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "takerAsset",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "makingAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "takingAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "makerTraits",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "name": "extension",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "orderHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "taker",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "takingAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "remainingMakingAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "extraData",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getOptimalFeeTier",
    "inputs": [
      {
        "name": "volatility",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "feeTier",
        "type": "uint24",
        "internalType": "uint24"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "getPosition",
    "inputs": [
      {
        "name": "positionId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct ConcentratedLiquidityHook.LiquidityPosition",
        "components": [
          {
            "name": "orderHash",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "owner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "feeTier",
            "type": "uint24",
            "internalType": "uint24"
          },
          {
            "name": "range",
            "type": "tuple",
            "internalType": "struct ConcentratedLiquidityHook.LiquidityRange",
            "components": [
              {
                "name": "tickLower",
                "type": "int24",
                "internalType": "int24"
              },
              {
                "name": "tickUpper",
                "type": "int24",
                "internalType": "int24"
              },
              {
                "name": "liquidity",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "feeGrowthInside0",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "feeGrowthInside1",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "tokensOwed0",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "tokensOwed1",
                "type": "uint256",
                "internalType": "uint256"
              }
            ]
          },
          {
            "name": "createdAt",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "lastUpdate",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "isActive",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getStrategyGasEstimate",
    "inputs": [
      {
        "name": "strategyType",
        "type": "uint8",
        "internalType": "enum IAdvancedStrategy.StrategyType"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "getTakingAmount",
    "inputs": [
      {
        "name": "order",
        "type": "tuple",
        "internalType": "struct IOrderMixin.Order",
        "components": [
          {
            "name": "salt",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "maker",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "receiver",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "makerAsset",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "takerAsset",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "makingAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "takingAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "makerTraits",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "name": "extension",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "orderHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "taker",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "makingAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "remainingMakingAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "extraData",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserPositions",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32[]",
        "internalType": "bytes32[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "globalFeeGrowth0",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "globalFeeGrowth1",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "positions",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "orderHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "feeTier",
        "type": "uint24",
        "internalType": "uint24"
      },
      {
        "name": "range",
        "type": "tuple",
        "internalType": "struct ConcentratedLiquidityHook.LiquidityRange",
        "components": [
          {
            "name": "tickLower",
            "type": "int24",
            "internalType": "int24"
          },
          {
            "name": "tickUpper",
            "type": "int24",
            "internalType": "int24"
          },
          {
            "name": "liquidity",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "feeGrowthInside0",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "feeGrowthInside1",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "tokensOwed0",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "tokensOwed1",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "name": "createdAt",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "lastUpdate",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "isActive",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "removeLiquidity",
    "inputs": [
      {
        "name": "positionId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "liquidityToRemove",
        "type": "uint128",
        "internalType": "uint128"
      }
    ],
    "outputs": [
      {
        "name": "amount0",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "amount1",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "sqrtPriceX96",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint160",
        "internalType": "uint160"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tickToPrice",
    "inputs": [
      {
        "name": "tick",
        "type": "int24",
        "internalType": "int24"
      }
    ],
    "outputs": [
      {
        "name": "price",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "totalPositions",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "userPositions",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "validFeeTiers",
    "inputs": [
      {
        "name": "",
        "type": "uint24",
        "internalType": "uint24"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "validateStrategy",
    "inputs": [
      {
        "name": "orderHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "strategyData",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [
      {
        "name": "isValid",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "FeesCollected",
    "inputs": [
      {
        "name": "positionId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount0",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amount1",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "LiquidityAdded",
    "inputs": [
      {
        "name": "positionId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "tickLower",
        "type": "int24",
        "indexed": false,
        "internalType": "int24"
      },
      {
        "name": "tickUpper",
        "type": "int24",
        "indexed": false,
        "internalType": "int24"
      },
      {
        "name": "liquidity",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amount0",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amount1",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "LiquidityRemoved",
    "inputs": [
      {
        "name": "positionId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "liquidity",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amount0",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amount1",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RangeOrderExecuted",
    "inputs": [
      {
        "name": "orderHash",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "tickCurrent",
        "type": "int24",
        "indexed": false,
        "internalType": "int24"
      },
      {
        "name": "executedAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "StrategyConfigured",
    "inputs": [
      {
        "name": "configId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "strategyType",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum IAdvancedStrategy.StrategyType"
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "StrategyExecuted",
    "inputs": [
      {
        "name": "orderHash",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "strategyType",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum IAdvancedStrategy.StrategyType"
      },
      {
        "name": "executedAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "executor",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "DeadlineExceeded",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidFeeTier",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidLiquidity",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidTickRange",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotPositionOwner",
    "inputs": []
  },
  {
    "type": "error",
    "name": "PositionInactive",
    "inputs": []
  },
  {
    "type": "error",
    "name": "PositionNotFound",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SlippageExceeded",
    "inputs": []
  }
] as const;
