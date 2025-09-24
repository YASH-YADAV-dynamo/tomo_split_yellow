'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Copy, Check, Wallet } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { useGroups } from '@/hooks/useData';
import { config } from '@/lib/config';
import { encrypt } from '@/lib/encryption';
import { useWallet } from '@/contexts/WalletContext';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateGroupModal = ({ isOpen, onClose }: CreateGroupModalProps) => {
  const { createGroup } = useGroups();
  const { address, isConnected } = useWallet();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    inviteEmails: ''
  });
  const [loading, setLoading] = useState(false);
  const [createdGroup, setCreatedGroup] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }
    
    setLoading(true);

    try {
      const groupData = {
        name: formData.name,
        description: formData.description,
        inviteEmails: formData.inviteEmails.split(',').map(email => email.trim()).filter(Boolean),
        creatorWalletAddress: address
      };
      
      // Encrypt the payload
      const encryptedPayload = encrypt(JSON.stringify(groupData));
      
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: encryptedPayload,
      });

      const success = response.ok;

      if (success) {
        const inviteSlug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setCreatedGroup({ 
          name: formData.name, 
          inviteLink: `${config.baseUrl}/join/${inviteSlug}` 
        });
        setFormData({ name: '', description: '', inviteEmails: '' });
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(createdGroup.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClose = () => {
    setCreatedGroup(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={createdGroup ? "Group Created!" : "Create New Group"} size="lg">
      {!createdGroup ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Group Name"
              placeholder="e.g., Friends Trip, Roommates, Work Team"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              icon={<Users className="w-4 h-4" />}
              required
            />

            {/* Creator Wallet Status */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Creator Wallet
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
                  Please connect your wallet to create groups
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                placeholder="What's this group for?"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                rows={3}
              />
            </div>

            <Input
              label="Invite Friends (Optional)"
              placeholder="Enter email addresses separated by commas"
              value={formData.inviteEmails}
              onChange={(e) => setFormData(prev => ({ ...prev, inviteEmails: e.target.value }))}
              icon={<Mail className="w-4 h-4" />}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You can also share the invite link after creating the group
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              "{createdGroup.name}" created successfully!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Share the invite link below with your friends
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Invite Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={createdGroup.inviteLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
              <Button
                onClick={copyInviteLink}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          <div className="bg-primary/10 dark:bg-primary/5 border border-primary/20 dark:border-primary/10 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Next Steps:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Share the invite link with your friends</li>
              <li>• They can join by clicking the link</li>
              <li>• Start adding expenses once everyone joins</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CreateGroupModal;
