'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Plus, Bell, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import AddExpenseModal from './AddExpenseModal';
import CreateGroupModal from './CreateGroupModal';
import FloatingActions from './FloatingActions';
import WalletConnect from './WalletConnect';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <div className="min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-4 lg:px-6 w-full">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search groups, expenses..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Wallet Connect */}
              <WalletConnect />
              
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Add Button - Hidden on mobile */}
              <motion.button
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="hidden lg:flex items-center space-x-2 bg-primary hover:bg-primary/90 text-black font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Floating Actions for Mobile */}
      <FloatingActions 
        onAddExpense={() => setIsAddExpenseModalOpen(true)}
        onCreateGroup={() => setIsCreateGroupModalOpen(true)}
      />

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
    </div>
  );
};

export default Layout;
