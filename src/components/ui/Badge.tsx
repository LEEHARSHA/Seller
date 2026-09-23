import React from 'react';
import { ProductStatus, SellerStatus } from '../../types';

export interface BadgeProps {
  status?: ProductStatus | SellerStatus | 'neutral' | 'info' | 'warning' | string;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  status = 'neutral',
  children,
  size = 'md',
  pulse = true,
}) => {
  const normStatus = String(status).toLowerCase();

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-3 py-1 text-xs gap-2',
  };

  let colorStyles = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  let dotColor = 'bg-slate-400';

  if (normStatus === 'approved') {
    colorStyles = 'bg-emerald-950/70 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-950/50';
    dotColor = 'bg-emerald-400';
  } else if (normStatus === 'pending') {
    colorStyles = 'bg-amber-950/70 text-amber-400 border-amber-500/30 shadow-sm shadow-amber-950/50';
    dotColor = 'bg-amber-400';
  } else if (normStatus === 'rejected') {
    colorStyles = 'bg-rose-950/70 text-rose-400 border-rose-500/30 shadow-sm shadow-rose-950/50';
    dotColor = 'bg-rose-400';
  } else if (normStatus === 'info') {
    colorStyles = 'bg-cyan-950/70 text-cyan-400 border-cyan-500/30';
    dotColor = 'bg-cyan-400';
  }

  const label = children || normStatus.charAt(0).toUpperCase() + normStatus.slice(1);

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border capitalize tracking-wide ${sizeStyles[size]} ${colorStyles}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </span>
      <span>{label}</span>
    </span>
  );
};
