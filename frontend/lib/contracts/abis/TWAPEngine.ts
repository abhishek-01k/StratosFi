// Auto-generated ABI for TWAPEngine
// Generated on: 2025-07-30T17:14:26.672Z
// DO NOT EDIT MANUALLY - Use "npm run generate-abis" to regenerate

export const TWAPEngineABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_volatilityOracle",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "calculateNextIntervalAmount",
    "inputs": [
      {
        "name": "configId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "randomizedAmount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
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
    "name": "configureTWAP",
    "inputs": [
      {
        "name": "totalAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "intervals",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "duration",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "maxPriceDeviation",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "enableRandomization",
        "type": "bool",
        "internalType": "bool"
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
    "name": "emergencyPauseThreshold",
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
    "name": "executeTWAPInterval",
    "inputs": [
      {
        "name": "configId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "currentPrice",
        "type": "uint256",
        "internalType": "uint256"
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
    "name": "getIntervalHistory",
    "inputs": [
      {
        "name": "configId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "intervalIndex",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct TWAPEngine.IntervalData",
        "components": [
          {
            "name": "targetTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "actualTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "targetAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "actualAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "executionPrice",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "randomSeed",
            "type": "bytes32",
            "internalType": "bytes32"
          }
        ]
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
    "name": "getTWAPStatus",
    "inputs": [
      {
        "name": "configId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "config",
        "type": "tuple",
        "internalType": "struct TWAPEngine.TWAPConfig",
        "components": [
          {
            "name": "totalAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "intervals",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "startTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "endTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "maxPriceDeviation",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "enableRandomization",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "randomizationFactor",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "priceOracle",
            "type": "address",
            "internalType": "address"
          }
        ]
      },
      {
        "name": "execution",
        "type": "tuple",
        "internalType": "struct TWAPEngine.TWAPExecution",
        "components": [
          {
            "name": "configId",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "executedAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "executedIntervals",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "lastExecutionTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "lastExecutionPrice",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "intervalAmounts",
            "type": "uint256[]",
            "internalType": "uint256[]"
          },
          {
            "name": "isPaused",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      },
      {
        "name": "nextIntervalTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "remainingAmount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
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
    "name": "intervalData",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "targetTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "actualTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "targetAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "actualAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "executionPrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "randomSeed",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pauseTWAP",
    "inputs": [
      {
        "name": "configId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "resumeTWAP",
    "inputs": [
      {
        "name": "configId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "twapConfigs",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "totalAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "intervals",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "startTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "endTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "maxPriceDeviation",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "enableRandomization",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "randomizationFactor",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "priceOracle",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "twapExecutions",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "configId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "executedAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "executedIntervals",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "lastExecutionTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "lastExecutionPrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "isPaused",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "updateEmergencyThreshold",
    "inputs": [
      {
        "name": "newThreshold",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
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
        "name": "",
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
    "name": "TWAPCompleted",
    "inputs": [
      {
        "name": "configId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "totalExecuted",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "averagePrice",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TWAPConfigured",
    "inputs": [
      {
        "name": "configId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "totalAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "intervals",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "startTime",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "endTime",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TWAPIntervalExecuted",
    "inputs": [
      {
        "name": "configId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "intervalIndex",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "executedAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "executionPrice",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "randomSeed",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TWAPPaused",
    "inputs": [
      {
        "name": "configId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "volatility",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TWAPResumed",
    "inputs": [
      {
        "name": "configId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "IntervalNotReady",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidInterval",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidTWAPConfig",
    "inputs": []
  },
  {
    "type": "error",
    "name": "PriceDeviationExceeded",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TWAPExpired",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TWAPIsCompleted",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TWAPIsPaused",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TWAPNotStarted",
    "inputs": []
  }
] as const;
