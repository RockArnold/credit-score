
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const EncryptedCreditScoreABI = {
  "abi": [
    {
      "inputs": [
        {
          "internalType": "externalEuint32",
          "name": "threshold",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "thresholdProof",
          "type": "bytes"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "ZamaProtocolUnsupported",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "confidentialProtocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getCreditScore",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getQualificationStatus",
      "outputs": [
        {
          "internalType": "ebool",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getThreshold",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "hasCreditData",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint32",
          "name": "threshold",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "thresholdProof",
          "type": "bytes"
        }
      ],
      "name": "setThreshold",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint32",
          "name": "income",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "incomeProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint32",
          "name": "debtRatio",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "debtRatioProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint32",
          "name": "repaymentScore",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "repaymentScoreProof",
          "type": "bytes"
        }
      ],
      "name": "submitCreditData",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

