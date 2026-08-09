import React from 'react';
import {
  RefreshCw,
  Sheet,
  Users,
  AlertTriangle,
  UserX,
  SlidersHorizontal,
  Award,
  BookOpen,
  PieChart,
  CalendarX,
  GraduationCap,
  ShieldCheck,
  PanelLeft,
  PanelLeftClose,
  Maximize2,
  Minimize2,
  Eye,
  Menu,
  Sparkles,
  UserCheck,
  Shield,
  User,
  LogOut,
  Bot
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  lastSyncTime: string | null;
  onOpenSyncModal: () => void;
  onOpenCoachChat?: () => void;
  totalStudents: number;
  zeroAttendanceCount: number;
  flaggedCount: number;
  discontinuedCount: number;
  openTicketsCount?: number;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  loggedInUserEmail: string;
  selectedMentor: string;
  isAuthorizedAdmin: boolean;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSync,
  isSyncing,
  lastSyncTime,
  onOpenSyncModal,
  onOpenCoachChat,
  totalStudents,
  zeroAttendanceCount,
  flaggedCount,
  discontinuedCount,
  openTicketsCount = 0,
  isSidebarOpen,
  setIsSidebarOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  loggedInUserEmail,
  selectedMentor,
  isAuthorizedAdmin,
  onOpenAuthModal,
}) => {
  const tabsMap: Record<string, { label: string; icon: React.ElementType; badge?: number; color?: string }> = {
    overview: { label: 'Overall Performance', icon: Users },
    'admin-tasks': { label: 'Admin Tasks & Mail', icon: ShieldCheck, badge: openTicketsCount, color: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30' },
    'zero-attendance': { label: 'Zero Attendance', icon: CalendarX, badge: zeroAttendanceCount, color: 'bg-amber-500/20 text-amber-300 border-amber-400/30' },
    flagged: { label: 'Flagged Students (<75%)', icon: AlertTriangle, badge: flaggedCount, color: 'bg-rose-500/20 text-rose-300 border-rose-400/30' },
    'review-log': { label: 'Review Log & Skills', icon: BookOpen },
    analytics: { label: 'Analytics & Buckets', icon: PieChart },
    leaderboard: { label: 'Mentor Leaderboard', icon: Award },
    'academic-leaderboard': { label: 'Academic Leaderboard', icon: GraduationCap },
    discontinuation: { label: 'Discontinuation Sheet', icon: UserX, badge: discontinuedCount, color: 'bg-slate-700 text-slate-300 border-slate-600' },
    'master-insights': { label: 'Master Insights', icon: Sparkles },
  };

  const currentTabInfo = tabsMap[activeTab] || { label: 'Dashboard', icon: Users };
  const CurrentIcon = currentTabInfo.icon;

  const formatSyncTime = (iso: string | null) => {
    if (!iso) return 'Not synced';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Synced';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-full">
        {/* Left Side: Sidebar Toggle & Active Tab Breadcrumb */}
        <div className="flex items-center space-x-3">
          {/* Sidebar Hide/Unhide Toggle Button */}
          <button
            onClick={() => {
              if (!isSidebarOpen) {
                setIsSidebarOpen(true);
              } else {
                setIsSidebarOpen(false);
              }
            }}
            className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              !isSidebarOpen
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white ring-2 ring-indigo-500/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title={isSidebarOpen ? 'Hide Sidebar (Full Screen View)' : 'Show Sidebar Menu'}
          >
            {!isSidebarOpen ? (
              <>
                <Menu className="w-4 h-4 mr-1.5 text-white" />
                <span>Show Sidebar</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 mr-1.5 text-indigo-400" />
                <span className="hidden sm:inline">Hide Sidebar</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          {/* Active Tab Info Badge & Breadcrumb */}
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400 shrink-0 border border-indigo-500/30">
              <CurrentIcon className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-extrabold text-white tracking-tight truncate">
                  {currentTabInfo.label}
                </h1>
                {currentTabInfo.badge !== undefined && currentTabInfo.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      currentTabInfo.color || 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {currentTabInfo.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: User Badge, Sync Info & Quick Actions */}
        <div className="flex items-center justify-between sm:justify-end space-x-2.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-0 border-slate-800">
          {/* Logged in User Account Badge & Logout */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onOpenAuthModal}
              className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                isAuthorizedAdmin
                  ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-700/60 text-emerald-300'
                  : 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-700/60 text-amber-300'
              }`}
              title="Click to switch account or mentor profile"
            >
              {isAuthorizedAdmin ? (
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <div className="text-left hidden xl:block max-w-[140px] truncate">
                <span className="text-[10px] font-bold block truncate leading-tight">
                  {loggedInUserEmail || 'Click to Login'}
                </span>
                <span className="text-[9px] opacity-80 uppercase tracking-wider font-extrabold block">
                  {isAuthorizedAdmin
                    ? 'Admin Access'
                    : selectedMentor
                    ? `Mentor: ${selectedMentor}`
                    : 'Select Mentor'}
                </span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 uppercase tracking-wider">
                {isAuthorizedAdmin ? 'ADMIN' : 'MENTOR'}
              </span>
            </button>

            <button
              onClick={onOpenAuthModal}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 transition-all cursor-pointer"
              title="Logout / Switch Account"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Header Metric Pills (visible when sidebar is hidden) */}
          {!isSidebarOpen && (
            <div className="hidden lg:flex items-center space-x-1.5 mr-1">
              <span className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[10px] font-medium text-slate-300">
                Students: <strong className="text-white">{totalStudents}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-amber-950/40 border border-amber-900/50 text-[10px] font-medium text-amber-300">
                0% Att.: <strong className="text-amber-200">{zeroAttendanceCount}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-[10px] font-medium text-rose-300">
                Flagged: <strong className="text-rose-200">{flaggedCount}</strong>
              </span>
            </div>
          )}

          {/* Live Sync Status */}
          <div className="text-right hidden md:block mr-1">
            <div className="flex items-center space-x-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Live Sync</span>
            </div>
            <p className="text-[11px] font-mono font-medium text-slate-300">
              {formatSyncTime(lastSyncTime)}
            </p>
          </div>

          {/* AI Success Coach Button */}
          {onOpenCoachChat && (
            <button
              onClick={onOpenCoachChat}
              className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-md shadow-teal-600/20 transition-all cursor-pointer border border-teal-400/30"
              title="Open AI Academic Success Coach Assistant"
            >
              <Bot className="w-3.5 h-3.5 mr-1.5 text-teal-200 animate-pulse" />
              <span>AI Coach</span>
            </button>
          )}

          {/* Sync Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="inline-flex items-center px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            title="Sync latest data from live Google Sheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Re-Sync Sheet'}</span>
          </button>

          {/* Config Link Button */}
          <button
            onClick={onOpenSyncModal}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            title="Configure Google Sheet Link"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
