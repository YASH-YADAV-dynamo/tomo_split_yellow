'use client';

import { ReactNode } from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: ReactNode;
  label?: string;
  error?: string;
}

const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  disabled = false,
  required = false,
  icon,
  label,
  error
}: InputProps) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';
  const stateClasses = error 
    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800';
  const textClasses = 'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const classes = `${baseClasses} ${stateClasses} ${textClasses} ${disabledClasses} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${classes} ${icon ? 'pl-10' : ''}`}
          disabled={disabled}
          required={required}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;
