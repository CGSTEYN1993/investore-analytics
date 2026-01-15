'use client';

import * as React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
}

export function Badge({ 
  className = '', 
  variant = 'default', 
  children, 
  ...props 
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-accent-gold/20 text-accent-gold border-accent-gold/30',
    secondary: 'bg-metallic-700/50 text-metallic-300 border-metallic-600',
    outline: 'bg-transparent text-metallic-300 border-metallic-600',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    destructive: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
