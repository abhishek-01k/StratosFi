// Auto-generated ABI for AdvancedStrategyRouter
// Generated on: 2025-07-30T17:14:26.675Z
// DO NOT EDIT MANUALLY - Use "npm run generate-abis" to regenerate

export const AdvancedStrategyRouterABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_optionsProtocol",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_liquidityHook",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_twapEngine",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_volatilityOracle",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_feeCollector",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "combinedConfigs",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "useOptions",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "useConcentratedLiquidity",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "useTWAP",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "useVolatilityAdjustment",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "optionsData",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "liquidityData",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "twapData",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "maxGasPrice",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "configureCombinedStrategy",
    "inputs": [
      {
        "name": "config",
        "type": "tuple",
        "internalType": "struct AdvancedStrategyRouter.CombinedStrategyConfig",
        "components": [
          {
            "name": "useOptions",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "useConcentratedLiquidity",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "useTWAP",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "useVolatilityAdjustment",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "optionsData",
            "type": "bytes",
            "internalType": "bytes"
          },
          {
            "name": "liquidityData",
            "type": "bytes",
            "internalType": "bytes"
          },
          {
            "name": "twapData",
            "type": "bytes",
            "internalType": "bytes"
          },
          {
            "name": "maxGasPrice",
            "type": "uint256",
            "internalType": "uint256"
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
    "name": "emergencyPause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
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
    "name": "feeCollector",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
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
    "name": "getStrategyExecutions",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      },
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
    "name": "getUserStats",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "totalExecutions",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "totalVolume",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "averageGasUsed",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "successRate",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "liquidityHook",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract ConcentratedLiquidityHook"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "optionsProtocol",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract OptionsProtocol"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "paused",
    "inputs": [],
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
    "name": "protocolFeeRate",
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
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "twapEngine",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract TWAPEngine"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "unpause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateFeeCollector",
    "inputs": [
      {
        "name": "newCollector",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateProtocolFee",
    "inputs": [
      {
        "name": "newFeeRate",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "userStats",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "totalExecutions",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "totalVolume",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "averageGasUsed",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "successRate",
        "type": "uint256",
        "internalType": "uint256"
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
    "type": "function",
    "name": "volatilityOracle",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract VolatilityOracle"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "CombinedStrategyExecuted",
    "inputs": [
      {
        "name": "configId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "totalAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "gasUsed",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "FeeCollectorUpdated",
    "inputs": [
      {
        "name": "newCollector",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Paused",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProtocolFeeUpdated",
    "inputs": [
      {
        "name": "newFeeRate",
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
    "type": "event",
    "name": "Unpaused",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "EnforcedPause",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ExpectedPause",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ]
  }
] as const;
