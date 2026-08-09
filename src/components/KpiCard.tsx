import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Maximize2,
  RotateCw,
  EyeOff,
  MoreVertical,
} from 'lucide-react';

export interface KpiCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ElementType;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    label?: string;
  };
  comparisonBadge?: {
    label: string;
    type?: 'positive' | 'negative' | 'neutral' | 'indigo' | 'amber' | 'emerald' | 'rose';
  };
  tooltip?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan' | 'slate';
  size?: 'normal' | 'compact' | 'expanded';
  className?: string;
  onRefresh?: () => void;
  onHide?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  id,
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  comparisonBadge,
  tooltip,
  color = 'indigo',
  size = 'normal',
  className = '',
  onRefresh,
  onHide,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Theme styling map
  const colorStyles = {
    indigo: {
      border: 'border-indigo-200/80 hover:border-indigo-300',
      bg: 'bg-white',
      accentBg: 'bg-indigo-50/80 text-indigo-600 border border-indigo-100',
      textVal: 'text-indigo-950',
      badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      bar: 'bg-indigo-600',
    },
    emerald: {
      border: 'border-emerald-200/80 hover:border-emerald-300',
      bg: 'bg-white',
      accentBg: 'bg-emerald-50/80 text-emerald-600 border border-emerald-100',
      textVal: 'text-emerald-950',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      bar: 'bg-emerald-600',
    },
    amber: {
      border: 'border-amber-200/80 hover:border-amber-300',
      bg: 'bg-white',
      accentBg: 'bg-amber-50/80 text-amber-600 border border-amber-100',
      textVal: 'text-amber-950',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      bar: 'bg-amber-600',
    },
    rose: {
      border: 'border-rose-200/80 hover:border-rose-300',
      bg: 'bg-white',
      accentBg: 'bg-rose-50/80 text-rose-600 border border-rose-100',
      textVal: 'text-rose-950',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
      bar: 'bg-rose-600',
    },
    purple: {
      border: 'border-purple-200/80 hover:border-purple-300',
      bg: 'bg-white',
      accentBg: 'bg-purple-50/80 text-purple-600 border border-purple-100',
      textVal: 'text-purple-950',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
      bar: 'bg-purple-600',
    },
    cyan: {
      border: 'border-cyan-200/80 hover:border-cyan-300',
      bg: 'bg-white',
      accentBg: 'bg-cyan-50/80 text-cyan-600 border border-cyan-100',
      textVal: 'text-cyan-950',
      badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      bar: 'bg-cyan-600',
    },
    slate: {
      border: 'border-slate-200/80 hover:border-slate-300',
      bg: 'bg-white',
      accentBg: 'bg-slate-100 text-slate-700 border border-slate-200',
      textVal: 'text-slate-900',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
      bar: 'bg-slate-600',
    },
  }[color];

  const handleRefreshClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const paddingClass = size === 'compact' ? 'p-2 sm:p-2.5' : size === 'expanded' ? 'p-4 sm:p-5' : 'p-2.5 sm:p-3';
  const valSizeClass = size === 'compact' ? 'text-base sm:text-lg' : size === 'expanded' ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl';

  return (
    <div
      className={`relative group bg-white rounded-xl border shadow-2xs transition-all duration-200 hover:shadow-xs ${colorStyles.border} ${paddingClass} ${className}`}
    >
      {/* Top Bar Indicator Accent Line */}
      <div className={`absolute top-0 left-4 right-4 h-0.5 rounded-b-xs ${colorStyles.bar}`} />

      {/* Top Row: Icon, Title, Controls, Tooltip */}
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <div className="flex items-center space-x-2 min-w-0">
          {Icon && (
            <div className={`p-1.5 rounded-lg shrink-0 ${colorStyles.accentBg}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center space-x-1">
              <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                {title}
              </h3>
              {tooltip && (
                <div className="relative inline-block shrink-0">
                  <button
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={() => setShowTooltip(!showTooltip)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full transition-colors cursor-pointer"
                    title="Metric Description"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                  {showTooltip && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 p-2 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl z-50 pointer-events-none leading-relaxed border border-slate-700">
                      {tooltip}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                    </div>
                  )}
                </div>
              )}
            </div>
            {subtext && <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{subtext}</p>}
          </div>
        </div>

        {/* Action Controls for KPI Card */}
        <div className="flex items-center space-x-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
          {onRefresh && (
            <button
              onClick={handleRefreshClick}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Refresh metric"
            >
              <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          )}
          {onHide && (
            <button
              onClick={onHide}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              title="Hide card"
            >
              <EyeOff className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main KPI Value */}
      <div className="flex items-baseline justify-between gap-1.5 mt-0.5">
        <div className={`font-black tracking-tight ${colorStyles.textVal} ${valSizeClass}`}>
          {value}
        </div>

        {/* Trend Indicator */}
        {trend && (
          <div
            className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
              trend.direction === 'up'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : trend.direction === 'down'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title={trend.label || 'Trend'}
          >
            {trend.direction === 'up' && <TrendingUp className="w-3 h-3 mr-0.5 text-emerald-600" />}
            {trend.direction === 'down' && <TrendingDown className="w-3 h-3 mr-0.5 text-rose-600" />}
            {trend.direction === 'neutral' && <Minus className="w-3 h-3 mr-0.5 text-slate-500" />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {/* Bottom Comparison Badge or Subtitle */}
      {comparisonBadge && (
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="text-slate-400 font-medium">Benchmark</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${colorStyles.badgeBg}`}>
            {comparisonBadge.label}
          </span>
        </div>
      )}
    </div>
  );
};
