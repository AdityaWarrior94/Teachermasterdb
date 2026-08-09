import React from 'react';
import {
  Users,
  AlertTriangle,
  UserX,
  CalendarX,
  BookOpen,
  PieChart,
  Award,
  GraduationCap,
  ShieldCheck,
  Sheet,
  ChevronLeft,
  ChevronRight,
  X,
  EyeOff,
  RefreshCw,
  SlidersHorizontal,
  LayoutDashboard,
  Sparkles,
  Shield,
  User,
  UserCheck,
  LogOut,
  Bot
} from 'lucide-react';

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCoachChat?: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  totalStudents: number;
  zeroAttendanceCount: number;
  flaggedCount: number;
  discontinuedCount: number;
  openTicketsCount: number;
  onSync: () => void;
  isSyncing: boolean;
  lastSyncTime: string | null;
  onOpenSyncModal: () => void;
  loggedInUserEmail: string;
  selectedMentor: string;
  isAuthorizedAdmin: boolean;
  onOpenAuthModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCoachChat,
  isOpen,
  setIsOpen,
  isCollapsed,
  setIsCollapsed,
  totalStudents,
  zeroAttendanceCount,
  flaggedCount,
  discontinuedCount,
  openTicketsCount,
  onSync,
  isSyncing,
  lastSyncTime,
  onOpenSyncModal,
  loggedInUserEmail,
  selectedMentor,
  isAuthorizedAdmin,
  onOpenAuthModal,
}) => {
  const allTabs = [
    {
      id: 'overview',
      label: 'Overall Performance',
      shortLabel: 'Overview',
      icon: Users,
    },
    {
      id: 'admin-tasks',
      label: 'Admin Tasks & Mail',
      shortLabel: 'Tasks',
      icon: ShieldCheck,
      badge: openTicketsCount,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
      adminOnly: true,
    },
    {
      id: 'zero-attendance',
      label: 'Zero Attendance',
      shortLabel: 'Zero Att.',
      icon: CalendarX,
      badge: zeroAttendanceCount,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    },
    {
      id: 'flagged',
      label: 'Flagged (<75%)',
      shortLabel: 'Flagged',
      icon: AlertTriangle,
      badge: flaggedCount,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
    },
    {
      id: 'review-log',
      label: 'Review Log & Skills',
      shortLabel: 'Review Log',
      icon: BookOpen,
    },
    {
      id: 'discontinuation',
      label: 'Discontinuation Sheet',
      shortLabel: 'Discontinued',
      icon: UserX,
      badge: discontinuedCount,
      badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
    },
    {
      id: 'master-insights',
      label: 'Master Insights',
      shortLabel: 'Master Insights',
      icon: Sparkles,
    },
    {
      id: 'ai-coach',
      label: 'AI Academic Coach',
      shortLabel: 'AI Coach',
      icon: Bot,
      badge: 1,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    },
  ];

  // Filter tabs: hide adminOnly tabs for non-admin users
  const tabs = allTabs.filter((tab) => !tab.adminOnly || isAuthorizedAdmin);

  const formatSyncTime = (iso: string | null) => {
    if (!iso) return 'Not synced';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Synced';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col transition-all duration-300 ease-in-out shadow-2xl ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="p-1.5 bg-white rounded-xl border border-slate-700/60 shrink-0 flex items-center justify-center">
              <img
                src="https://www.pwgulf.com/_next/static/media/pw-gulf-logo.00277f9d.svg"
                alt="PW Gulf Logo"
                className="h-6 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="text-xs font-black text-white tracking-tight truncate">
                  PWGulf Teacher Dashboard
                </h1>
                <p className="text-[9px] text-indigo-400 font-extrabold tracking-wider uppercase truncate">
                  PW Gulf Portal
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {/* Collapse / Expand Desktop Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Close Mobile Sidebar */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Status Badge (When Expanded) */}
        {!isCollapsed && (
          <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-semibold text-emerald-400">Live Sheet Sync</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {formatSyncTime(lastSyncTime)}
            </span>
          </div>
        )}

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
          {!isCollapsed && (
            <p className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Navigation Menu
            </p>
          )}

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'ai-coach' && onOpenCoachChat) {
                    onOpenCoachChat();
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                    return;
                  }
                  setActiveTab(tab.id);
                  // Close mobile drawer on item click
                  if (window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'
                } rounded-xl text-xs font-semibold transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
                title={isCollapsed ? tab.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isCollapsed ? '' : 'mr-3'
                  } ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}
                />

                {!isCollapsed && (
                  <span className="truncate text-left flex-1 font-medium">{tab.label}</span>
                )}

                {/* Badge Count */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`shrink-0 rounded-full font-bold border ${tab.badgeColor} ${
                      isCollapsed
                        ? 'absolute top-1 right-1 text-[9px] px-1 py-0.2 min-w-[16px] text-center'
                        : 'ml-2 text-[10px] px-2 py-0.5'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Quick Summary & User Info Section */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-800 bg-slate-950/30 space-y-3 shrink-0">
            {/* User Account Card */}
            <div
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                isAuthorizedAdmin
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                  : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
              }`}
            >
              <div
                onClick={onOpenAuthModal}
                className="flex items-center space-x-2 min-w-0 cursor-pointer flex-1"
                title="Click to switch user or mentor"
              >
                {isAuthorizedAdmin ? (
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <User className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">{loggedInUserEmail || 'Click to Login'}</p>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider truncate">
                    {isAuthorizedAdmin
                      ? 'Admin Portal'
                      : selectedMentor
                      ? `Mentor: ${selectedMentor}`
                      : 'Mentor Mode'}
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenAuthModal}
                className="text-[9px] font-extrabold px-2 py-1 rounded bg-white/10 hover:bg-rose-900/60 hover:text-rose-200 uppercase tracking-wider shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                title="Switch Account or Logout"
              >
                <LogOut className="w-3 h-3" />
                <span>Switch</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-1.5 text-center">
              <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                <p className="text-[9px] font-semibold text-slate-400 uppercase">Students</p>
                <p className="text-xs font-bold text-white">{totalStudents}</p>
              </div>
              <div className="bg-amber-950/30 p-2 rounded-lg border border-amber-900/40">
                <p className="text-[9px] font-semibold text-amber-300/80 uppercase">0% Att.</p>
                <p className="text-xs font-bold text-amber-300">{zeroAttendanceCount}</p>
              </div>
              <div className="bg-rose-950/30 p-2 rounded-lg border border-rose-900/40">
                <p className="text-[9px] font-semibold text-rose-300/80 uppercase">Flagged</p>
                <p className="text-xs font-bold text-rose-300">{flaggedCount}</p>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                <p className="text-[9px] font-semibold text-slate-400 uppercase">Tickets</p>
                <p className="text-xs font-bold text-indigo-300">{openTicketsCount}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-1.5 pt-1">
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="flex-1 inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                title="Re-Sync Sheet"
              >
                <RefreshCw className={`w-3 h-3 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Re-Sync'}
              </button>

              <button
                onClick={onOpenSyncModal}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                title="Google Sheet Settings"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hide Sidebar (Full Screen Mode) */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer border border-slate-700/60"
            >
              <EyeOff className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Hide Sidebar (Full Screen)
            </button>
          </div>
        )}

        {/* Collapsed Footer Actions */}
        {isCollapsed && (
          <div className="p-2 border-t border-slate-800 space-y-2 shrink-0 flex flex-col items-center">
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 cursor-pointer"
              title="Re-Sync Sheet Data"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Hide Sidebar for Full Screen"
            >
              <EyeOff className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
