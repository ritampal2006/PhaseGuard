import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  phase?: 'R' | 'Y' | 'B';
  sparklineData?: number[];
  sparklineColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  iconColor = 'text-blue-400',
  iconBg = 'bg-blue-500/10',
  trend,
  trendDirection = 'neutral',
  subtitle,
  phase,
  sparklineData,
  sparklineColor = '#3B82F6',
}) => {
  const phaseBorder =
    phase === 'R'
      ? 'border-l-4 border-l-red-500'
      : phase === 'Y'
      ? 'border-l-4 border-l-amber-400'
      : phase === 'B'
      ? 'border-l-4 border-l-blue-500'
      : '';

  return (
    <div
      className={`bg-[#0F172A]/90 border border-slate-800 rounded-2xl p-4.5 hover:border-slate-700/80 transition-all shadow-md group ${phaseBorder}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-black text-white tracking-tight font-mono">
          {value}
        </span>
        {unit && <span className="text-xs font-bold text-slate-400">{unit}</span>}
      </div>

      {/* Footer with trend and sparkline matching Image 2 */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-1">
        {trend ? (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span
              className={
                trendDirection === 'up'
                  ? 'text-emerald-400'
                  : trendDirection === 'down'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }
            >
              {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '•'} {trend}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500">{subtitle || 'Nominal Range'}</span>
        )}

        {/* Mini SVG Sparkline */}
        {sparklineData && sparklineData.length > 2 && (
          <div className="w-16 h-5">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 60 20">
              <polyline
                fill="none"
                stroke={sparklineColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklineData
                  .map((val, idx) => {
                    const min = Math.min(...sparklineData);
                    const max = Math.max(...sparklineData) || 1;
                    const normY = 20 - ((val - min) / (max - min || 1)) * 16 - 2;
                    const normX = (idx / (sparklineData.length - 1)) * 60;
                    return `${normX},${normY}`;
                  })
                  .join(' ')}
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

