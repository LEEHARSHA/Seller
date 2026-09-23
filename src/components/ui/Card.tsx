import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantStyles = {
    default: 'bg-slate-900/90 border border-slate-800/80 shadow-xl rounded-2xl text-slate-100',
    glass: 'bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 shadow-2xl rounded-2xl text-slate-100',
    interactive:
      'bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/90 hover:bg-slate-900/95 transition-all duration-200 shadow-xl hover:shadow-2xl rounded-2xl text-slate-100 cursor-pointer',
    bordered: 'bg-transparent border border-slate-800 rounded-2xl text-slate-100',
  };

  return (
    <div className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
};
