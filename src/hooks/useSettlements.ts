'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { nitroliteSignSettleMessage, NITROLITE_MESSAGE } from '@/lib/nitrolite';
import { useWallet } from '@/contexts/WalletContext';

export interface DueItem {
  splitId: string;
  amount: number;
  expenseTitle: string;
  groupName: string;
  owedToUserId: string;
  owedToUserName: string;
}

export function useSettlements() {
  const { address, isConnected } = useWallet();
  const [dues, setDues] = useState<DueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDues = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/settlements?walletAddress=${address}`);
      if (!res.ok) throw new Error('Failed to fetch dues');
      const data = await res.json();
      setDues(data.dues || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch dues');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      fetchDues();
    } else {
      setDues([]);
    }
  }, [isConnected, address, fetchDues]);

  const total = useMemo(() => {
    return dues.reduce((acc, d) => acc + (typeof d.amount === 'number' ? d.amount : parseFloat(String(d.amount) || '0')), 0);
  }, [dues]);

  const settleSelected = useCallback(async (selectedSplitIds: string[]) => {
    if (!address) throw new Error('Wallet not connected');
    if (selectedSplitIds.length === 0) return { ok: true, settled: 0 };

    const signature = await nitroliteSignSettleMessage(address);

    const res = await fetch('/api/settlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: address, splitIds: selectedSplitIds, signature }),
    });
    if (!res.ok) throw new Error('Failed to settle');
    const data = await res.json();
    await fetchDues();
    return data as { ok: boolean; settled: number; message: string; signature: string };
  }, [address, fetchDues]);

  return { dues, total, loading, error, fetchDues, settleSelected, message: NITROLITE_MESSAGE };
}


