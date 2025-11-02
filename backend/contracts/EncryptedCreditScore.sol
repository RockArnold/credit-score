// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted Credit Score Contract
/// @notice A privacy-preserving credit scoring system using FHEVM
/// @dev All credit data is encrypted and computed on-chain without revealing plaintext values
contract EncryptedCreditScore is ZamaEthereumConfig {
    // Credit score threshold for loan qualification (encrypted)
    euint32 private _creditScoreThreshold;
    address private _owner;
    
    // User credit data mapping: user address => encrypted credit score
    mapping(address => euint32) private _userCreditScores;
    
    // User qualification status mapping: user address => qualified (encrypted boolean)
    mapping(address => ebool) private _userQualified;
    
    // Track if user has submitted data
    mapping(address => bool) private _hasSubmitted;
    
    /// @notice Initialize the contract with a credit score threshold
    /// @param threshold The minimum credit score required for loan qualification (encrypted)
    /// @param thresholdProof The input proof for the threshold
    constructor(externalEuint32 threshold, bytes memory thresholdProof) {
        _owner = msg.sender;
        if (thresholdProof.length == 0) {
            // Default threshold for deployments where external input is not available yet
            _creditScoreThreshold = FHE.asEuint32(50);
        } else {
            euint32 encryptedThreshold = FHE.fromExternal(threshold, thresholdProof);
            _creditScoreThreshold = encryptedThreshold;
        }
        FHE.allowThis(_creditScoreThreshold);
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Not owner");
        _;
    }

    /// @notice Owner can update threshold later using an external encrypted input
    function setThreshold(externalEuint32 threshold, bytes calldata thresholdProof) external onlyOwner {
        euint32 encryptedThreshold = FHE.fromExternal(threshold, thresholdProof);
        _creditScoreThreshold = encryptedThreshold;
        FHE.allowThis(_creditScoreThreshold);
    }
    
    /// @notice Submit encrypted credit data and calculate credit score
    /// @param income Encrypted annual income
    /// @param incomeProof Income input proof
    /// @param debtRatio Encrypted debt ratio percentage (0-100)
    /// @param debtRatioProof Debt ratio input proof
    /// @param repaymentScore Encrypted repayment score (unused in new formula; kept for compatibility)
    /// @param repaymentScoreProof Repayment score input proof (unused in new formula; kept for compatibility)
    /// @dev New formula (unscaled):
    ///      new_score = 0.5*last_score + 0.3*income_factor + 0.2*(100 - debt_ratio*100)
    ///      where income_factor = min(100, income/500).
    ///      If first time (no last_score), compute:
    ///      last_score = 50 + 0.3*(income_factor - 50) + 0.2*(50 - debt_ratio*50)
    function submitCreditData(
        externalEuint32 income,
        bytes calldata incomeProof,
        externalEuint32 debtRatio,
        bytes calldata debtRatioProof,
        externalEuint32 repaymentScore,
        bytes calldata repaymentScoreProof
    ) external {
        // Convert external encrypted inputs to internal euint32
        euint32 encryptedIncome = FHE.fromExternal(income, incomeProof);
        euint32 encryptedDebtRatio = FHE.fromExternal(debtRatio, debtRatioProof);
        // Keep compatibility with previous interface (variable intentionally unused)
        FHE.fromExternal(repaymentScore, repaymentScoreProof);

        // income_factor = min(100, income / 500)
        euint32 hundred = FHE.asEuint32(100);
        euint32 incomeDiv = FHE.div(encryptedIncome, 500);
        euint32 incomeFactor = FHE.min(hundred, incomeDiv);

        // debt_component_base = (100 - debt_ratio)
        euint32 debtComponentBase = FHE.sub(hundred, encryptedDebtRatio);

        // Determine last_score (if first time, compute bootstrap last_score)
        euint32 lastScore;
        if (_hasSubmitted[msg.sender] == false) {
            // last_score = 50 + 0.3*(income_factor - 50) + 0.2*(50 - debt_ratio*50)
            // Rewrite to avoid negatives inside FHE (debt_ratio is percentage): 45 + 0.3*income_factor - 0.1*debt_ratio
            euint32 termA = FHE.div(FHE.mul(incomeFactor, FHE.asEuint32(3)), 10); // 0.3*income_factor
            euint32 termB = FHE.div(encryptedDebtRatio, 10); // 0.1*debt_ratio
            euint32 tmp = FHE.add(FHE.asEuint32(45), termA);
            lastScore = FHE.sub(tmp, termB);
        } else {
            lastScore = _userCreditScores[msg.sender];
        }

        // new_score = 0.5*last_score + 0.3*income_factor + 0.2*(100 - debt_ratio*100)
        euint32 halfLast = FHE.div(FHE.mul(lastScore, FHE.asEuint32(5)), 10);
        euint32 incomeTerm = FHE.div(FHE.mul(incomeFactor, FHE.asEuint32(3)), 10);
        euint32 debtTerm = FHE.div(FHE.mul(debtComponentBase, FHE.asEuint32(2)), 10);
        euint32 creditScore = FHE.add(FHE.add(halfLast, incomeTerm), debtTerm);
        
        // Store the encrypted credit score
        _userCreditScores[msg.sender] = creditScore;
        
        // Determine qualification: creditScore >= threshold
        ebool isQualified = FHE.ge(creditScore, _creditScoreThreshold);
        _userQualified[msg.sender] = isQualified;
        _hasSubmitted[msg.sender] = true;
        
        // Allow the user to decrypt their own credit score
        FHE.allowThis(creditScore);
        FHE.allow(creditScore, msg.sender);
        FHE.allowThis(isQualified);
        FHE.allow(isQualified, msg.sender);
    }
    
    /// @notice Get the encrypted credit score for a user
    /// @param user The user address
    /// @return The encrypted credit score
    function getCreditScore(address user) external view returns (euint32) {
        return _userCreditScores[user];
    }
    
    /// @notice Get the qualification status for a user
    /// @param user The user address
    /// @return The encrypted qualification status (encrypted boolean)
    function getQualificationStatus(address user) external view returns (ebool) {
        return _userQualified[user];
    }
    
    /// @notice Check if user has submitted credit data
    /// @param user The user address
    /// @return True if user has a credit score stored
    function hasCreditData(address user) external view returns (bool) {
        return _hasSubmitted[user];
    }
    
    /// @notice Get the credit score threshold
    /// @return The encrypted threshold value
    function getThreshold() external view returns (euint32) {
        return _creditScoreThreshold;
    }
}

