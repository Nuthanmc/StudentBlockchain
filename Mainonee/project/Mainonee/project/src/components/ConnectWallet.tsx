import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Wallet, AlertTriangle } from 'lucide-react';

const ConnectWallet: React.FC = () => {
  const { isConnected, isCorrectNetwork, connecting, connect, switchNetwork } = useWeb3();

  if (isConnected && isCorrectNetwork) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-start">
        {!isConnected ? (
          <>
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Wallet className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Connect My Wallet</h3>
              <p className="text-gray-600 mb-4">
                Please connect your MetaMask wallet to access the Ethereum Sepolia Testnet features of this application.
              </p>
              <button
                onClick={connect}
                disabled={connecting}
                className="bg-indigo-600 text-white px-4 py-2 rounded font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          </>
        ) : !isCorrectNetwork ? (
          <>
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Wrong Network</h3>
              <p className="text-gray-600 mb-4">
                Please switch to the Ethereum Sepolia Testnet to use this application.
              </p>
              <button
                onClick={switchNetwork}
                className="bg-yellow-500 text-white px-4 py-2 rounded font-medium hover:bg-yellow-600 transition"
              >
                Switch to Ethereum Sepolia
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ConnectWallet;
