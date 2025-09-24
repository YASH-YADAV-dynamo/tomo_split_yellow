'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import Button from './ui/Button';
import { useWallet } from '@/contexts/WalletContext';

interface WalletConnectProps {
  onAddressChange?: (address: string | null) => void;
}

export default function WalletConnect({ onAddressChange }: WalletConnectProps) {
  const { address, isConnected, connect, disconnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connect();
      onAddressChange?.(address);
    } catch (err) {
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onAddressChange?.(null);
  };

  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (address) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-3"
      >
        <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            Connected
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={copyAddress}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Wallet className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {formatAddress(address)}
            </span>
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          <Button
            onClick={handleDisconnect}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center space-x-2"
    >
      <Wallet className="w-4 h-4" />
      <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
    </Button>
  );
}
