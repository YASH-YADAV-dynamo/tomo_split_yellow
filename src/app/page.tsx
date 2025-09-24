'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Receipt, CreditCard, TrendingUp, Plus, ArrowUpRight, ArrowDownRight, Wifi, WifiOff } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AddExpenseModal from '@/components/AddExpenseModal';
import { useExpenses, useGroups } from '@/hooks/useData';
import CreateGroupModal from '@/components/CreateGroupModal';
import EmptyState from '@/components/EmptyState';
import RealtimeNotification from '@/components/RealtimeNotification';
import { useRealtime } from '@/hooks/useRealtime';
import { useWallet } from '@/contexts/WalletContext';

export default function Home() {
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const { expenses, loading: expensesLoading, refetch: refetchExpenses } = useExpenses();
  const { groups, loading: groupsLoading, refetch: refetchGroups } = useGroups();
  const { isConnected } = useWallet();
  
  // Real-time connection for the first group (if any)
  const primaryGroupId = groups.length > 0 ? groups[0].id : null;
  const { isConnected: realtimeConnected, lastEvent } = useRealtime({
    groupId: primaryGroupId || '',
    onEvent: (event) => {
      console.log('Real-time event received:', event);
      if (event.type === 'expense_added') {
        // Refresh expenses when a new one is added
        refetchExpenses();
      }
    },
    enabled: !!primaryGroupId,
  });

  // Calculate stats from real data
  const totalGroups = groups.length;
  const activeExpenses = expenses.length;
  const pendingSettlements = expenses.reduce((acc, expense) => 
    acc + expense.splits.filter(split => !split.isPaid).length, 0
  );
  
  // Calculate total balance (simplified)
  const totalBalance = expenses.reduce((acc, expense) => {
    const amount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount || 0);
    return acc + amount;
  }, 0);

  const stats = [
    { label: 'Total Groups', value: totalGroups.toString(), icon: Users, change: '+0', changeType: 'positive' },
    { label: 'Active Expenses', value: activeExpenses.toString(), icon: Receipt, change: '+0', changeType: 'positive' },
    { label: 'Pending Settlements', value: pendingSettlements.toString(), icon: CreditCard, change: '+0', changeType: 'positive' },
    { label: 'Total Balance', value: `$${totalBalance.toFixed(2)}`, icon: TrendingUp, change: '+$0.00', changeType: totalBalance >= 0 ? 'positive' : 'negative' },
  ];

  // Get recent expenses (first 4)
  const recentExpenses = expenses.slice(0, 4).map(expense => {
    const amount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount || 0);
    return {
      id: expense.id,
      title: expense.title,
      amount: `$${amount.toFixed(2)}`,
      group: expense.group.name,
      date: new Date(expense.createdAt).toLocaleDateString(),
      paidBy: expense.paidBy.name,
    };
  });

  // Format groups data
  const formattedGroups = groups.slice(0, 4).map((group, index) => ({
    id: group.id,
    name: group.name,
    members: group.members.length,
    balance: '$0.00', // Simplified for now
    color: ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'][index % 4],
  }));

  // Show empty state if no groups exist
  if (!groupsLoading && groups.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <EmptyState onCreateGroup={() => setIsCreateGroupModalOpen(true)} />
        <CreateGroupModal 
          isOpen={isCreateGroupModalOpen}
          onClose={() => setIsCreateGroupModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-full">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to Tomo Split!
            </h1>
            {primaryGroupId && (
              <div className="flex items-center space-x-2">
                {realtimeConnected ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  realtimeConnected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {realtimeConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {realtimeConnected ? 'Real-time updates enabled' : 'Here\'s what\'s happening with your expenses'}
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button 
            className="hidden lg:flex"
            onClick={() => setIsCreateGroupModalOpen(true)}
            variant="outline"
          >
            <Users className="w-4 h-4 mr-2" />
            Create Group
          </Button>
          <Button 
            className="hidden lg:flex"
            onClick={() => setIsAddExpenseModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">from last week</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Expenses</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {recentExpenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{expense.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{expense.group} • {expense.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{expense.amount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Paid by {expense.paidBy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Groups */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Groups</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {formattedGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${group.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-semibold text-sm">{group.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{group.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{group.members} members</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    group.balance.startsWith('-') ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {group.balance}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">balance</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal 
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
      />
      
      {/* Create Group Modal */}
      <CreateGroupModal 
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />
      
      {/* Real-time Notification */}
      <RealtimeNotification event={lastEvent} />
    </div>
  );
}