'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, Calendar, FileText, Wallet } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { useGroups } from '@/hooks/useData';
import { encrypt } from '@/lib/encryption';
import { useWallet } from '@/contexts/WalletContext';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddExpenseModal = ({ isOpen, onClose }: AddExpenseModalProps) => {
  const { groups } = useGroups();
  const { address, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
    groupId: '',
    splitType: 'equal'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create splits for all group members
      const selectedGroup = groups.find(g => g.id === formData.groupId);
      if (!selectedGroup) return;
      
      const splits = selectedGroup.members.map(member => ({
        userId: member.user.id,
        amount: parseFloat(formData.amount) / selectedGroup.members.length
      }));
      
      const expenseData = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        groupId: formData.groupId,
        splits,
        paidByWalletAddress: address
      };
      
      // Encrypt the payload
      const encryptedPayload = encrypt(JSON.stringify(expenseData));
      
      // Call the API to create the expense
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: encryptedPayload,
      });

      if (response.ok) {
        // Reset form
        setFormData({
          title: '',
          amount: '',
          description: '',
          groupId: '',
          splitType: 'equal'
        });
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create expense');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Failed to create expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Expense" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <Input
              label="Expense Title"
              placeholder="e.g., Dinner at Restaurant"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              icon={<FileText className="w-4 h-4" />}
              required
            />
          </div>

          {/* Amount */}
          <Input
            label="Amount"
            type="number"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            icon={<DollarSign className="w-4 h-4" />}
            required
          />

          {/* Group */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Group <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.groupId}
              onChange={(e) => handleInputChange('groupId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              required
            >
              <option value="">Select a group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Paid By - Wallet Status */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Paid By
            </label>
            <div className={`px-3 py-2 border rounded-lg flex items-center space-x-2 ${
              isConnected 
                ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
                : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
            }`}>
              <Wallet className={`w-4 h-4 ${
                isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`} />
              <span className={`text-sm font-medium ${
                isConnected ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Wallet not connected'}
              </span>
            </div>
            {!isConnected && (
              <p className="text-xs text-red-600 dark:text-red-400">
                Please connect your wallet to add expenses
              </p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              placeholder="Add a note about this expense..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Split Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            How to split?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'equal', label: 'Split Equally', description: 'Everyone pays the same amount' },
              { id: 'custom', label: 'Custom Split', description: 'Set individual amounts' }
            ].map((option) => (
              <motion.button
                key={option.id}
                type="button"
                onClick={() => handleInputChange('splitType', option.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  formData.splitType === option.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {option.description}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddExpenseModal;
