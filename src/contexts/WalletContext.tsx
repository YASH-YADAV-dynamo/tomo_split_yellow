'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  user: any | null;
  setUser: (user: any) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Load saved address if exists
      const saved = localStorage.getItem('walletAddress');
      if (saved) {
        setAddress(saved);
        setIsConnected(true);
        // Load user data
        loadUserData(saved);
      }
    }
  }, []);

  const loadUserData = async (walletAddress: string) => {
    try {
      const response = await fetch(`/api/users/wallet/${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const connect = async () => {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      
      if (!(window as any).ethereum) {
        alert('MetaMask not found. Please install MetaMask to continue.');
        return;
      }

      const accounts: string[] = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      const addr = accounts[0];
      console.log('Connected wallet address:', addr);

      localStorage.setItem('walletAddress', addr);
      setAddress(addr);
      setIsConnected(true);
      
      // Load or create user data
      await loadUserData(addr);

      // Listen for account changes
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          const newAddr = accounts[0];
          localStorage.setItem('walletAddress', newAddr);
          setAddress(newAddr);
          loadUserData(newAddr);
        }
      });

    } catch (err) {
      console.error('Wallet connection error:', err);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const disconnect = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletAddress');
    }
    setAddress(null);
    setIsConnected(false);
    setUser(null);
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        connect,
        disconnect,
        user,
        setUser,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
