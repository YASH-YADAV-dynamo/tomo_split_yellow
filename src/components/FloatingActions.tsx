'use client';

import { motion } from 'framer-motion';
import { Plus, Users, Receipt, CreditCard } from 'lucide-react';
import Button from './ui/Button';

interface FloatingActionsProps {
  onAddExpense: () => void;
  onCreateGroup: () => void;
}

const FloatingActions = ({ onAddExpense, onCreateGroup }: FloatingActionsProps) => {
  const actions = [
    { icon: Receipt, label: 'Add Expense', onClick: onAddExpense, primary: true },
    { icon: Users, label: 'Create Group', onClick: onCreateGroup },
    { icon: CreditCard, label: 'Settlements', onClick: () => console.log('Settlements') },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 lg:hidden">
      <div className="flex flex-col-reverse space-y-reverse space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                onClick={action.onClick}
                className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl ${
                  action.primary 
                    ? 'bg-primary hover:bg-primary/90 text-black' 
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon className="w-6 h-6" />
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FloatingActions;
