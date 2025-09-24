'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, X } from 'lucide-react';

interface RealtimeEvent {
  type: string;
  groupId: string;
  data?: any;
  timestamp: Date;
}

interface RealtimeNotificationProps {
  event: RealtimeEvent | null;
}

const RealtimeNotification = ({ event }: RealtimeNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (event && event.type === 'expense_added' && event.data) {
      console.log('RealtimeNotification: Received expense event:', event);
      setIsVisible(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [event]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!event || event.type !== 'expense_added' || !event.data || !event.data.title) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  New Expense Added!
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {event.data.title} - ${(() => {
                    const amount = event.data.amount;
                    if (typeof amount === 'number') return amount.toFixed(2);
                    if (typeof amount === 'string') return parseFloat(amount).toFixed(2);
                    return '0.00';
                  })()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {(() => {
                    try {
                      return new Date(event.timestamp).toLocaleTimeString();
                    } catch (error) {
                      return new Date().toLocaleTimeString();
                    }
                  })()}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RealtimeNotification;
