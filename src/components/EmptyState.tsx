'use client';

import { motion } from 'framer-motion';
import { Users, Plus, ArrowRight } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';

interface EmptyStateProps {
  onCreateGroup: () => void;
}

const EmptyState = ({ onCreateGroup }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      <Card className="max-w-md w-full text-center p-8">
        <div className="w-20 h-20 bg-primary/10 dark:bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          No Groups Yet
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create your first group to start splitting expenses with friends, family, or roommates.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={onCreateGroup}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Group
          </Button>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">What you can do with groups:</p>
            <ul className="space-y-1 text-left">
              <li className="flex items-center">
                <ArrowRight className="w-3 h-3 mr-2" />
                Split bills equally or custom amounts
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-3 h-3 mr-2" />
                Track who owes what
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-3 h-3 mr-2" />
                Settle up easily
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default EmptyState;
