import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Web3ContextType {
  account: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  connecting: boolean;
  isAdmin: boolean; // Added isAdmin property
  isTeacher: boolean; // Added isTeacher property
  connect: () => Promise<void>;
  switchNetwork: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  isConnected: false,
  isCorrectNetwork: false,
  connecting: false,
  isAdmin: false, // Default value for isAdmin
  isTeacher: false, // Default value for isTeacher
  connect: async () => {},
  switchNetwork: async () => {},
});

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isAdmin] = useState<boolean>(false); // Added state for isAdmin
  const [isTeacher] = useState<boolean>(false); // Added state for isTeacher

  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application.');
      return;
    }

    try {
      setConnecting(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setIsConnected(true);

      // Check if on correct network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsCorrectNetwork(chainId === '0x13881'); // Mumbai Testnet
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Error connecting wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const switchNetwork = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13881' }], // Mumbai Testnet
      });
    } catch (error: any) {
      // If the chain hasn't been added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x13881',
                chainName: 'Polygon Mumbai Testnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
                blockExplorerUrls: ['https://mumbai.polygonscan.com'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding Mumbai network:', addError);
        }
      }
    }
  };

  useEffect(() => {
    // Check if MetaMask is already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);

            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setIsCorrectNetwork(chainId === '0x13881');
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount(null);
          setIsConnected(false);
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setIsCorrectNetwork(chainId === '0x13881');
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnected,
        isCorrectNetwork,
        connecting,
        isAdmin, // Expose isAdmin in context
        isTeacher, // Expose isTeacher in context
        connect,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
