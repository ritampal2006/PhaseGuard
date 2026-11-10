import React from 'react';
import { AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const configs = {
    LOW: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-400',
      icon: CheckCircle2,
      label: 'LOW RISK',
    },
    MEDIUM: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dot: 'bg-amber-400',
      icon: AlertTriangle,
      label: 'MEDIUM RISK',
    },
    HIGH: {
      bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse',
      dot: 'bg-rose-500',
      icon: AlertOctagon,
      label: 'HIGH RISK',
    },
  };

  const current = configs[level] || configs.LOW;
  const Icon = current.icon;

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-lg font-bold tracking-wider border shadow-sm ${current.bg} ${sizeStyles}`}
    >
      <span className={`w-2 h-2 rounded-full ${current.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{current.label}</span>
    </div>
  );
};

