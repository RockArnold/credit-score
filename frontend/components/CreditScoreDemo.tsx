"use client";

import { useState } from "react";
import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../hooks/metamask/useMetaMaskEthersSigner";
import { useCreditScore } from "@/hooks/useCreditScore";

/**
 * Credit Score Demo Component
 * Main UI component for interacting with encrypted credit score system
 */
export const CreditScoreDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const creditScore = useCreditScore({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const [income, setIncome] = useState<string>("");
  const [debtRatio, setDebtRatio] = useState<string>("");
  

  if (!isConnected) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card rounded-3xl shadow-2xl p-12 max-w-md w-full border border-purple-500/20">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center neon-glow">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Welcome Back</h2>
              <p className="text-slate-600 leading-relaxed">
                Connect your MetaMask wallet to access the secure encrypted credit scoring system
              </p>
            </div>
            <button
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 neon-glow"
              onClick={connect}
            >
              <span className="flex items-center justify-center space-x-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.5 7.1l-8.4-6.9c-.4-.3-.9-.3-1.3 0L4.5 7.1c-.3.3-.5.7-.5 1.1v7.6c0 .4.2.8.5 1.1l8.3 6.9c.2.2.5.2.7.2.3 0 .5-.1.7-.2l8.3-6.9c.3-.3.5-.7.5-1.1V8.2c0-.4-.2-.8-.5-1.1zM12 3.5l7 5.8v5.4l-7 5.8-7-5.8V9.3l7-5.8z"/>
                </svg>
                <span>Connect MetaMask Wallet</span>
              </span>
            </button>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                🔒 Secure • End-to-End Encrypted • Privacy First
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (creditScore.isDeployed === false) {
    return (
      <div className="glass-card rounded-2xl shadow-xl p-8 border-l-4 border-red-500">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Contract Deployment Required</h3>
            <p className="text-slate-600 mb-3">
              The smart contract is not deployed on chain ID <span className="font-mono font-semibold text-red-600">{chainId}</span>. 
              Please deploy the contract before proceeding.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-2">Deployment Command:</p>
              <code className="block bg-slate-800 text-green-400 px-4 py-3 rounded-lg text-sm font-mono">
                cd backend && npm run deploy:localhost
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    const incomeNum = parseInt(income);
    const debtRatioNum = parseInt(debtRatio);

    if (isNaN(incomeNum) || isNaN(debtRatioNum)) {
      showNotification("Please enter valid numbers for all fields", "error");
      return;
    }

    if (incomeNum <= 0) {
      showNotification("Income must be greater than 0", "error");
      return;
    }

    if (debtRatioNum < 0 || debtRatioNum > 100) {
      showNotification("Debt ratio must be between 0 and 100", "error");
      return;
    }

    creditScore.submitCreditData(incomeNum, debtRatioNum);
  };

  const showNotification = (message: string, type: "error" | "success") => {
    // Simple alert for now - could be enhanced with a toast system
    alert(message);
  };

  const getQualificationStatus = () => {
    if (creditScore.qualification === undefined) {
      return { 
        text: "Pending Assessment", 
        color: "text-slate-400",
        bgColor: "bg-slate-100",
        icon: "clock"
      };
    }
    // Treat any non-zero as true to be robust across FHEVM backends
    if (creditScore.qualification !== BigInt(0)) {
      return { 
        text: "Approved for Loan", 
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
        icon: "check"
      };
    }
    return { 
      text: "Not Qualified", 
      color: "text-red-600",
      bgColor: "bg-red-100",
      icon: "x"
    };
  };

  const qualificationStatus = getQualificationStatus();

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="glass-card rounded-2xl shadow-lg p-6 border border-purple-500/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Wallet Connected</h3>
              <p className="text-sm text-slate-600 font-mono">{ethersSigner?.address.slice(0, 6)}...{ethersSigner?.address.slice(-4)}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-300">
              <span className="font-semibold text-slate-700">Chain:</span>
              <span className="font-mono text-slate-900">{chainId || "N/A"}</span>
            </div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
              fhevmStatus === "ready" 
                ? "bg-emerald-100 border-emerald-300" 
                : "bg-amber-100 border-amber-300"
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                fhevmStatus === "ready" ? "bg-emerald-500" : "bg-amber-500"
              } animate-pulse`}></div>
              <span className="font-semibold text-slate-700">FHEVM:</span>
              <span className={fhevmStatus === "ready" ? "text-emerald-700" : "text-amber-700"}>
                {fhevmStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Input Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl shadow-xl p-8 border border-purple-500/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Submit Credit Information</h2>
            </div>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              Enter your financial details below. All data will be encrypted before transmission using homomorphic encryption technology.
            </p>

            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Annual Income (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg font-semibold">$</span>
                  <input
                    type="number"
                    className="w-full pl-10 pr-4 py-4 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-slate-800 text-lg font-semibold"
                    placeholder="50000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Your total annual income before taxes</span>
                </p>
              </div>

              <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Debt-to-Income Ratio (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-4 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-slate-800 text-lg font-semibold"
                    placeholder="30"
                    min="0"
                    max="100"
                    value={debtRatio}
                    onChange={(e) => setDebtRatio(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg font-semibold">%</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Percentage of monthly income used for debt payments (0-100)</span>
                </p>
              </div>
            </div>

            <button
              className="w-full mt-8 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold py-5 px-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
              disabled={!creditScore.canSubmit}
              onClick={handleSubmit}
            >
              {creditScore.isSubmitting ? (
                <span className="flex items-center justify-center space-x-3">
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Encrypting & Submitting Data...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Submit Encrypted Credit Data</span>
                </span>
              )}
            </button>
          </div>

          {/* Privacy Features */}
          <div className="glass-card rounded-2xl shadow-lg p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-50/80 to-teal-50/80">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Privacy Guarantees</span>
            </h3>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>End-to-End Encryption:</strong> All data is encrypted on your device before transmission</span>
              </li>
              <li className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Homomorphic Computation:</strong> Credit scores are calculated on encrypted data without decryption</span>
              </li>
              <li className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Private Decryption:</strong> Only you can decrypt and view your personal credit score</span>
              </li>
              <li className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Zero Knowledge:</strong> No third party can access your raw financial information</span>
              </li>
            </ul>
          </div>

          {/* Calculation Method (English) */}
          <div className="glass-card rounded-2xl shadow-lg p-6 border border-purple-500/20 bg-gradient-to-br from-purple-50/80 to-indigo-50/80">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 1.306.835 2.418 2 2.83V18h2v-4.17c1.165-.412 2-1.524 2-2.83 0-1.657-1.343-3-3-3z" />
              </svg>
              <span>How Your Credit Score Is Calculated</span>
            </h3>
            <div className="text-sm text-slate-700 space-y-3">
              <p><strong>Inputs:</strong> Annual Income (USD), Debt Ratio (%)</p>
              <p><strong>Income factor:</strong> income_factor = min(100, income / 500)</p>
              <p><strong>First-time score (if no previous score):</strong><br/>
                last_score = 45 + 0.3 × income_factor − 0.1 × debt_ratio
              </p>
              <p><strong>Current score:</strong><br/>
                new_score = 0.5 × last_score + 0.3 × income_factor + 0.2 × (100 − debt_ratio)
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Debt ratio is a percentage in [0, 100].</li>
                <li>Your score updates cumulatively on each submission (last_score becomes your previous result).</li>
                <li>All computations run over encrypted values on-chain.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-1 space-y-6">
          {/* Credit Score Card */}
          <div className="glass-card rounded-2xl shadow-xl p-6 border-2 border-purple-500/30 bg-gradient-to-br from-purple-50/80 to-indigo-50/80">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center neon-glow">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Your Credit Score</h3>
            </div>
            
            <div className="bg-white rounded-xl p-6 mb-6 border-2 border-purple-200">
              {creditScore.isDecrypted && creditScore.creditScore !== undefined ? (
                <div className="text-center">
                  <div className="text-5xl font-black gradient-text mb-2">
                    {String(creditScore.creditScore)}
                  </div>
                  <p className="text-xs text-slate-500">Decrypted Score</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-2xl text-slate-400 mb-2 flex items-center justify-center space-x-2">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="font-bold">Encrypted</span>
                  </div>
                  <p className="text-xs text-slate-500">Score not yet decrypted</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                className="w-full bg-white text-purple-700 border-2 border-purple-600 font-semibold py-3 px-4 rounded-xl hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                disabled={!creditScore.canGetCreditScore}
                onClick={creditScore.refreshCreditScore}
              >
                {creditScore.isRefreshing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh Score</span>
                  </>
                )}
              </button>
              
              <button
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                disabled={!creditScore.canDecrypt}
                onClick={creditScore.decryptCreditScore}
              >
                {creditScore.isDecrypting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Decrypting...</span>
                  </>
                ) : creditScore.isDecrypted ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Already Decrypted</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <span>Decrypt Score</span>
                  </>
                )}
              </button>
            </div>

            {creditScore.message && (
              <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <p className="text-sm text-blue-800 flex items-start space-x-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{creditScore.message}</span>
                </p>
              </div>
            )}
          </div>

          {/* Qualification Status Card */}
          <div className={`glass-card rounded-2xl shadow-xl p-6 border-2 ${
            qualificationStatus.icon === "check" 
              ? "border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 to-teal-50/80" 
              : qualificationStatus.icon === "x"
              ? "border-red-500/30 bg-gradient-to-br from-red-50/80 to-pink-50/80"
              : "border-slate-300/30 bg-gradient-to-br from-slate-50/80 to-gray-50/80"
          }`}>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  qualificationStatus.icon === "check" 
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600" 
                    : qualificationStatus.icon === "x"
                    ? "bg-gradient-to-br from-red-400 to-red-600"
                    : "bg-gradient-to-br from-slate-400 to-slate-600"
                }`}>
                  {qualificationStatus.icon === "check" && (
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {qualificationStatus.icon === "x" && (
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {qualificationStatus.icon === "clock" && (
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Loan Qualification Status</h3>
              <p className={`text-2xl font-bold ${qualificationStatus.color}`}>
                {qualificationStatus.text}
              </p>
              <p className="text-xs text-slate-500 mt-3">
                {qualificationStatus.icon === "check" && "Congratulations! You meet the lending criteria."}
                {qualificationStatus.icon === "x" && "Unfortunately, you don't meet the current criteria."}
                {qualificationStatus.icon === "clock" && "Submit your data to receive a qualification assessment."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
