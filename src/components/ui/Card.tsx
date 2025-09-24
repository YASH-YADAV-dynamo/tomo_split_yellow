'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'yellow' | 'glass';
  hover?: boolean;
}

const Card = ({ children, className = '', variant = 'default', hover = true }: CardProps) => {
  const baseClasses = 'rounded-xl border transition-all duration-300';
  
  const variants = {
    default: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg',
    yellow: 'bg-primary/10 dark:bg-primary/5 border-primary/20 dark:border-primary/10 shadow-lg',
    glass: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-lg'
  };

  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';

  const classes = `${baseClasses} ${variants[variant]} ${hoverClasses} ${className}`;

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4 } : {}}
    >
      {children}
    </motion.div>
  );
};

export default Card;
