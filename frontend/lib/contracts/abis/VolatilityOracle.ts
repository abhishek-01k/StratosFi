// Auto-generated ABI for VolatilityOracle
// Generated on: 2025-07-30T17:14:26.674Z
// DO NOT EDIT MANUALLY - Use "npm run generate-abis" to regenerate

export const VolatilityOracleABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "authorizeUpdater",
    "inputs": [
      {
        "name": "updater",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "authorizedUpdaters",
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
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "deauthorizeUpdater",
    "inputs": [
      {
        "name": "updater",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getCurrentVolatility",
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
    "name": "getHistoricalVolatility",
    "inputs": [
      {
        "name": "hoursBack",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRiskMetrics",
    "inputs": [],
    "outputs": [
      {
        "name": "metrics",
        "type": "tuple",
        "internalType": "struct VolatilityOracle.RiskMetrics",
        "components": [
          {
            "name": "riskScore",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "isHighRisk",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "adjustmentFactor",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "recommendedInterval",
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
    "name": "getVolatilityCategory",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getVolatilityTrend",
    "inputs": [],
    "outputs": [
      {
        "name": "isIncreasing",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "trendStrength",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "averageVolatility",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isStale",
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
    "name": "mockUpdateVolatility",
    "inputs": [
      {
        "name": "newVolatility",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
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
    "name": "shouldPauseExecution",
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
    "name": "updateBaselineVolatility",
    "inputs": [
      {
        "name": "newBaseline",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateVolatility",
    "inputs": [
      {
        "name": "newVolatility",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "volatilityData",
    "inputs": [],
    "outputs": [
      {
        "name": "currentVolatility",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "baselineVolatility",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "lastUpdateTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "updateCount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "UpdaterAuthorized",
    "inputs": [
      {
        "name": "updater",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "UpdaterDeauthorized",
    "inputs": [
      {
        "name": "updater",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "VolatilityUpdated",
    "inputs": [
      {
        "name": "newVolatility",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
] as const;
