// Auto-generated ABI for OptionsProtocol
// Generated on: 2025-07-30T17:14:26.673Z
// DO NOT EDIT MANUALLY - Use "npm run generate-abis" to regenerate

export const OptionsProtocolABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_feeCollector",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_priceOracle",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "calculateOptionPremium",
    "inputs": [
      {
        "name": "orderHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "strikePrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "expiration",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "isCall",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "currentVolatility",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "premium",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "collateralBalances",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
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
    "name": "createCallOption",
    "inputs": [
      {
        "name": "orderHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "strikePrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "expiration",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "premium",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "optionId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "createPutOption",
    "inputs": [
      {
        "name": "orderHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "strikePrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "expiration",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "premium",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "optionId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "depositCollateral",
    "inputs": [],
    "outputs": [],
    "stateMutability": "payable"
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
    "name": "exerciseOption",
    "inputs": [
      {
        "name": "optionId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "profit",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "exercisedOptions",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
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
    "name": "getOptionGreeks",
    "inputs": [
      {
        "name": "optionId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "greeks",
        "type": "tuple",
        "internalType": "struct OptionsProtocol.OptionGreeks",
        "components": [
          {
            "name": "delta",
            "type": "int256",
            "internalType": "int256"
          },
          {
            "name": "gamma",
            "type": "int256",
            "internalType": "int256"
          },
          {
            "name": "theta",
            "type": "int256",
            "internalType": "int256"
          },
          {
            "name": "vega",
            "type": "int256",
            "internalType": "int256"
          },
          {
            "name": "intrinsicValue",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "timeValue",
            "type": "uint256",
            "internalType": "uint256"
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
    "name": "options",
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
        "name": "strikePrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "expiration",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "premium",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "isCall",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "holder",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "seller",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "isExercised",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "creationTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "collateral",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "priceOracle",
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
    "name": "totalOptionsCreated",
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
    "name": "withdrawCollateral",
    "inputs": [
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "CollateralDeposited",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "CollateralWithdrawn",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OptionCreated",
    "inputs": [
      {
        "name": "optionId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "orderHash",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "holder",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "strikePrice",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "expiration",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "isCall",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OptionExercised",
    "inputs": [
      {
        "name": "optionId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "exerciser",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "profit",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "executionPrice",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OptionExpired",
    "inputs": [
      {
        "name": "optionId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
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
    "name": "ExerciseNotProfitable",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InsufficientCollateral",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InsufficientPremium",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidExpiration",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidStrikePrice",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotInExerciseWindow",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotOptionHolder",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OptionAlreadyExercised",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OptionHasExpired",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OptionNotFound",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  }
] as const;
