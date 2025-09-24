'use client';

import { useState, useEffect } from 'react';
import { decrypt } from '@/lib/encryption';

interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  createdAt: string;
  paidBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  group: {
    id: string;
    name: string;
  };
  splits: Array<{
    id: string;
    userId: string;
    amount: number;
    isPaid: boolean;
  }>;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  createdAt: string;
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  }>;
  expenses: Expense[];
}

export function useExpenses(groupId?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const url = groupId ? `/api/expenses?groupId=${groupId}` : '/api/expenses';
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses);
        setError(null);
      } else {
        setError('Failed to fetch expenses');
      }
    } catch (err) {
      setError('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData: any) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: expenseData, // This should already be encrypted
      });

      if (response.ok) {
        const data = await response.json();
        const decryptedExpense = JSON.parse(decrypt(data.data));
        setExpenses(prev => [decryptedExpense, ...prev]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Add expense error:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [groupId]);

  return { expenses, loading, error, addExpense, refetch: fetchExpenses };
}

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/groups');

      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
        setError(null);
      } else {
        setError('Failed to fetch groups');
      }
    } catch (err) {
      setError('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData: any) => {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: groupData, // This should already be encrypted
      });

      if (response.ok) {
        const data = await response.json();
        const decryptedGroup = JSON.parse(decrypt(data.data));
        setGroups(prev => [...prev, decryptedGroup]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Create group error:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return { groups, loading, error, createGroup, refetch: fetchGroups };
}
