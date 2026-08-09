import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  EyeOff,
  RotateCw,
  Download,
  Settings,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { useDashboardLayout, WidgetSize } from '../context/DashboardLayoutContext';

export interface DashboardWidgetProps {
  id: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  icon?: React.ElementType;
  children: React.ReactNode;
  onExport?: () => void;
  onRefresh?: () => void;
  tabId?: string;
  className?: string;
  headerBg?: string;
  customControls?: React.ReactNode;
  settingsContent?: React.ReactNode;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  id,
  title,
  subtitle,
  badge,
  icon: Icon,
  children,
  onExport,
  onRefresh,
  tabId,
  className = '',
  headerBg = 'bg-slate-50/80',
  customControls,
  settingsContent,
}) => {
  const {
    hiddenWidgets,
    minimizedWidgets,
    widgetSizes,
    fullScreenWidgetId,
    refreshingWidgets,
    hideWidget,
    toggleMinimizeWidget,
    setWidgetSize,
    enterFullScreen,
    exitFullScreen,
    triggerRefreshWidget,
  } = useDashboardLayout();

  const [showSettingsPopover, setShowSettingsPopover] = useState(false);

  const isHidden = !!hiddenWidgets[id];
  const isMinimized = minimizedWidgets.has(id);
  const isFullScreen = fullScreenWidgetId === id;
  const isRefreshing = refreshingWidgets.has(id);
  const currentSize: WidgetSize = widgetSizes[id] || 'normal';

  // If hidden, do not render widget body on screen
  if (isHidden && !isFullScreen) {
    return null;
  }

  const handleRefresh = () => {
    triggerRefreshWidget(id, onRefresh);
  };

  const handleToggleFullScreen = () => {
    if (isFullScreen) {
      exitFullScreen();
    } else {
      enterFullScreen(id);
    }
  };

  const sizeClasses = {
    compact: 'p-2.5 text-xs',
    normal: 'p-3.5 sm:p-4',
    expanded: 'p-5 sm:p-6',
  }[currentSize];

  // Full Screen Modal View
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 sm:p-6 md:p-8 animate-fadeIn overflow-hidden">
        {/* Full Screen Top Control Bar */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 mb-4 text-white shadow-2xl shrink-0">
          <div className="flex items-center space-x-3">
            {Icon && <Icon className="w-5 h-5 text-indigo-400" />}
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
                  Full Screen View (ESC to exit)
                </span>
              </div>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          {/* Action Icons in Fullscreen */}
          <div className="flex items-center space-x-2">
            {customControls}
            {onRefresh && (
              <button
                onClick={handleRefresh}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Refresh Widget"
              >
                <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="inline-flex items-center px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Export Widget Data"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export
              </button>
            )}
            <button
              onClick={exitFullScreen}
              className="inline-flex items-center px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer"
              title="Exit Full Screen (ESC)"
            >
              <Minimize2 className="w-4 h-4 mr-1.5" />
              Exit Fullscreen
            </button>
          </div>
        </div>

        {/* Fullscreen Body Content Container */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-auto p-6">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-200 ${className}`}
    >
      {/* Professional Widget Header */}
      <div className={`px-4 py-2.5 border-b border-slate-100 ${headerBg} rounded-t-2xl flex flex-wrap items-center justify-between gap-2.5`}>
        {/* Title & Badge */}
        <div className="flex items-center space-x-3 min-w-0">
          {Icon && (
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">{title}</h3>
              {badge}
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Professional Controls Toolbar */}
        <div className="flex items-center space-x-1 shrink-0">
          {customControls}

          {/* ⛶ Full Screen Button */}
          <button
            onClick={handleToggleFullScreen}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            title="Full Screen Mode (Distraction-Free)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* ─ Minimize / Collapse */}
          <button
            onClick={() => toggleMinimizeWidget(id)}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            title={isMinimized ? 'Expand Widget' : 'Minimize / Collapse Widget'}
          >
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          </button>

          {/* ↻ Refresh */}
          <button
            onClick={handleRefresh}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="Refresh Widget Data"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* ⬇ Export */}
          {onExport && (
            <button
              onClick={onExport}
              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Export Widget Data (CSV/File)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          {/* ⚙ Settings Popover */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsPopover(!showSettingsPopover)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showSettingsPopover ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Widget Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {showSettingsPopover && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-3 space-y-3 text-xs animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800">Widget Options</span>
                  <button
                    onClick={() => setShowSettingsPopover(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Size Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Widget Density / Size
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-center">
                    {(['compact', 'normal', 'expanded'] as WidgetSize[]).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setWidgetSize(id, sz)}
                        className={`py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                          currentSize === sz
                            ? 'bg-white text-indigo-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom settings slot */}
                {settingsContent}

                <button
                  onClick={() => {
                    hideWidget(id, title, tabId);
                    setShowSettingsPopover(false);
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide This Panel</span>
                </button>
              </div>
            )}
          </div>

          {/* 👁 Hide Button directly on header */}
          <button
            onClick={() => hideWidget(id, title, tabId)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Hide Panel"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Widget Content */}
      {!isMinimized && <div className={sizeClasses}>{children}</div>}
    </div>
  );
};
