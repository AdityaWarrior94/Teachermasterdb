import React, { useState, useMemo } from 'react';
import {
  StudentSummary,
  AttendanceRecord,
  FollowupLog,
  AdminTicket,
} from '../types';
import {
  CheckCircle2,
  Clock,
  Target,
  Users,
  Search,
  TrendingUp,
  Award,
  CheckSquare,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { KpiCard } from './KpiCard';

export interface TabWeeklyGoalVsActualProps {
  students: StudentSummary[];
  attendanceRecords: AttendanceRecord[];
  logs?: FollowupLog[];
  tickets?: AdminTicket[];
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const TabWeeklyGoalVsActual: React.FC<TabWeeklyGoalVsActualProps> = ({
  students,
  attendanceRecords,
  logs = [],
  tickets = [],
  searchQuery = '',
  onSearchChange,
}) => {
  const [selectedWeek, setSelectedWeek] = useState<string>('Week 5');
  const [internalSearch, setInternalSearch] = useState<string>('');
  const [expandedMentor, setExpandedMentor] = useState<string | null>(null);

  const effectiveSearch = searchQuery || internalSearch;

  const handleSearchChange = (val: string) => {
    setInternalSearch(val);
    if (onSearchChange) onSearchChange(val);
  };

  // Available Weeks extracted from attendance records
  const availableWeeks = useMemo(() => {
    const weeksSet = new Set<string>();
    attendanceRecords.forEach((r) => {
      if (r.week && r.week.trim()) weeksSet.add(r.week.trim());
    });
    tickets.forEach((t) => {
      if (t.week && t.week.trim()) weeksSet.add(t.week.trim());
    });

    const arr = Array.from(weeksSet);
    if (arr.length === 0) return ['Week 5', 'Week 4', 'Week 3', 'Week 2', 'Week 1'];

    // Sort descending by week number
    return arr.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numB - numA;
    });
  }, [attendanceRecords, tickets]);

  // Extract deduplicated mentors list
  const mentorList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (
        s.mentorName &&
        s.mentorName.trim() &&
        !s.mentorName.includes('#N/A') &&
        s.mentorName !== 'Discontinue'
      ) {
        set.add(s.mentorName.trim());
      }
    });
    tickets.forEach((t) => {
      if (t.mentorName && t.mentorName.trim()) set.add(t.mentorName.trim());
    });
    logs.forEach((l) => {
      if (l.mentorName && l.mentorName.trim()) set.add(l.mentorName.trim());
    });
    return Array.from(set).sort();
  }, [students, tickets, logs]);

  // Per mentor weekly task goal vs actual calculation
  const mentorTaskMetrics = useMemo(() => {
    return mentorList.map((mName) => {
      // 1. Filter tickets assigned to mentor
      const mentorTickets = tickets.filter((t) => {
        const matchesMentor = t.mentorName.trim().toLowerCase() === mName.toLowerCase();
        if (!matchesMentor) return false;
        if (selectedWeek === 'All') return true;
        if (t.week) return t.week.trim().toLowerCase() === selectedWeek.toLowerCase();
        return true; // default include
      });

      const closedTickets = mentorTickets.filter((t) => t.status === 'Closed');
      const inProgressTickets = mentorTickets.filter((t) => t.status === 'In Progress');
      const openTickets = mentorTickets.filter((t) => t.status === 'Open');

      // Tagged students inside tickets
      let totalTaggedStudents = 0;
      let closedTaggedStudents = 0;
      mentorTickets.forEach((t) => {
        if (t.taggedStudents && t.taggedStudents.length > 0) {
          totalTaggedStudents += t.taggedStudents.length;
          if (t.status === 'Closed') {
            closedTaggedStudents += t.taggedStudents.length;
          }
        }
      });

      // 2. Filter followup logs assigned to mentor
      const mentorLogs = logs.filter(
        (l) => l.mentorName.trim().toLowerCase() === mName.toLowerCase()
      );
      const closedLogs = mentorLogs.filter(
        (l) => l.currentStage === 'Closed' || l.currentStage === 'Resolved'
      );
      const pendingLogs = mentorLogs.filter(
        (l) => l.currentStage !== 'Closed' && l.currentStage !== 'Resolved'
      );

      // 3. Students assigned to mentor
      const assignedStudents = students.filter(
        (s) => s.mentorName.trim().toLowerCase() === mName.toLowerCase()
      );

      // Combined Task Totals
      const totalTasksAssigned = mentorTickets.length + mentorLogs.length;
      const totalTasksClosed = closedTickets.length + closedLogs.length;
      const totalTasksPending = openTickets.length + inProgressTickets.length + pendingLogs.length;

      // Completion Percentage calculation
      let completionPct = 100;
      if (totalTasksAssigned > 0) {
        completionPct = Math.min(100, Math.round((totalTasksClosed / totalTasksAssigned) * 100));
      }

      return {
        mentorName: mName,
        assignedStudentsCount: assignedStudents.length,
        ticketsCount: mentorTickets.length,
        closedTicketsCount: closedTickets.length,
        openTicketsCount: openTickets.length + inProgressTickets.length,
        logsCount: mentorLogs.length,
        closedLogsCount: closedLogs.length,
        pendingLogsCount: pendingLogs.length,
        totalTaggedStudents,
        closedTaggedStudents,
        totalTasksAssigned,
        totalTasksClosed,
        totalTasksPending,
        completionPct,
        mentorTickets,
        mentorLogs,
      };
    });
  }, [mentorList, tickets, logs, students, selectedWeek]);

  // Filter metrics based on search query
  const filteredMetrics = useMemo(() => {
    if (!effectiveSearch.trim()) return mentorTaskMetrics;
    const q = effectiveSearch.toLowerCase().trim();
    return mentorTaskMetrics.filter((m) => m.mentorName.toLowerCase().includes(q));
  }, [mentorTaskMetrics, effectiveSearch]);

  // Global KPI aggregates
  const globalSummary = useMemo(() => {
    let totalAssigned = 0;
    let totalClosed = 0;
    let totalPending = 0;
    let goalMetCount = 0;

    mentorTaskMetrics.forEach((m) => {
      totalAssigned += m.totalTasksAssigned;
      totalClosed += m.totalTasksClosed;
      totalPending += m.totalTasksPending;
      if (m.completionPct === 100) goalMetCount++;
    });

    const overallPct =
      totalAssigned > 0 ? Math.min(100, Math.round((totalClosed / totalAssigned) * 100)) : 100;

    return {
      totalAssigned,
      totalClosed,
      totalPending,
      overallPct,
      goalMetCount,
      totalMentors: mentorTaskMetrics.length,
    };
  }, [mentorTaskMetrics]);

  return (
    <div className="space-y-6">
      {/* KPI Overview Widget */}
      <DashboardWidget
        id="weekly-goal-kpis"
        title="Weekly Task Goal vs Actual - Mentor Closure Hub"
        subtitle="Monitors assigned admin tickets, followup logs, and student intervention completion for the selected week."
        icon={Target}
        headerBg="bg-indigo-50/80"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <KpiCard
            id="kpi-total-assigned"
            title="Total Weekly Tasks Assigned"
            value={globalSummary.totalAssigned}
            subtext={`${selectedWeek === 'All' ? 'All Weeks Combined' : selectedWeek} Scope`}
            icon={CheckSquare}
            color="indigo"
            comparisonBadge={{ label: 'Assigned Workload', type: 'indigo' }}
            tooltip="Total admin tickets and student followup logs assigned across all mentors."
          />

          <KpiCard
            id="kpi-total-closed"
            title="Total Tasks Closed"
            value={globalSummary.totalClosed}
            subtext={`${globalSummary.totalPending} Pending Execution`}
            icon={CheckCircle2}
            color="emerald"
            trend={{ direction: 'up', value: `${globalSummary.overallPct}% Closed` }}
            comparisonBadge={{ label: 'Resolved Tickets', type: 'emerald' }}
            tooltip="Number of assigned tickets marked as Closed or Resolved."
          />

          <KpiCard
            id="kpi-overall-completion"
            title="Avg Mentor Closure Rate"
            value={`${globalSummary.overallPct}%`}
            subtext="Target: 100% Weekly Resolution"
            icon={TrendingUp}
            color={globalSummary.overallPct >= 80 ? 'emerald' : 'amber'}
            trend={{
              direction: globalSummary.overallPct >= 80 ? 'up' : 'down',
              value: globalSummary.overallPct >= 80 ? 'On Track' : 'In Progress',
            }}
            comparisonBadge={{ label: 'Goal vs Actual', type: 'indigo' }}
            tooltip="Aggregate percentage of assigned tasks closed across all active mentors."
          />

          <KpiCard
            id="kpi-mentors-goal-met"
            title="Mentors Meeting 100% Goal"
            value={`${globalSummary.goalMetCount} / ${globalSummary.totalMentors}`}
            subtext="100% Task Resolution Achieved"
            icon={Award}
            color="purple"
            comparisonBadge={{ label: 'Top Performers', type: 'purple' }}
            tooltip="Number of mentors who have successfully closed 100% of their assigned weekly tasks."
          />
        </div>

        {/* Controls & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Select Target Week:
            </span>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-2xs cursor-pointer"
            >
              <option value="All">All Weeks (Combined)</option>
              {availableWeeks.map((w) => (
                <option key={w} value={w}>
                  {w} {w === availableWeeks[0] ? '(Current Week)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by mentor name..."
              value={effectiveSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
            {effectiveSearch && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                title="Clear filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </DashboardWidget>

      {/* Mentor Goal vs Actual Progress Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              Mentor Weekly Task Completion Progress ({selectedWeek})
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Goal: 100% resolution of assigned tickets and student follow-up items.
            </p>
          </div>

          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200 shrink-0">
            {filteredMetrics.length} Active Mentor(s)
          </span>
        </div>

        {/* Mentor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMetrics.map((m) => {
            const isGoalMet = m.completionPct === 100;
            const isExpanded = expandedMentor === m.mentorName;

            // Bar Color Styling
            let barColor = 'from-emerald-500 to-teal-500';
            let badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
            let badgeText = '🎯 Goal Met (100%)';

            if (m.completionPct < 40) {
              barColor = 'from-rose-500 to-red-500';
              badgeBg = 'bg-rose-100 text-rose-800 border-rose-300';
              badgeText = `🚨 Action Required (${m.completionPct}%)`;
            } else if (m.completionPct < 75) {
              barColor = 'from-amber-500 to-orange-500';
              badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
              badgeText = `⏳ In Progress (${m.completionPct}%)`;
            } else if (m.completionPct < 100) {
              barColor = 'from-indigo-500 to-purple-500';
              badgeBg = 'bg-indigo-100 text-indigo-800 border-indigo-300';
              badgeText = `⚡ On Track (${m.completionPct}%)`;
            }

            return (
              <div
                key={m.mentorName}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isGoalMet
                    ? 'bg-gradient-to-br from-emerald-50/30 via-white to-white border-emerald-200/80 shadow-2xs hover:border-emerald-300'
                    : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-2xs shrink-0 ${
                        isGoalMet
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      {m.mentorName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                        {m.mentorName}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {m.assignedStudentsCount} Student(s) Assigned
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 uppercase tracking-tight ${badgeBg}`}
                  >
                    {badgeText}
                  </span>
                </div>

                {/* Progress Bar & Numeric Comparison */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 text-[11px] flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-indigo-600" />
                      Weekly Goal vs Actual:
                    </span>
                    <span className="text-slate-900 font-black">
                      {m.totalTasksClosed} / {m.totalTasksAssigned} Tasks Closed ({m.completionPct}%)
                    </span>
                  </div>

                  {/* Visual Progress Bar with 100% Goal Marker */}
                  <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200/90 shadow-inner">
                    <div
                      className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${m.completionPct}%` }}
                    />
                    {/* Goal Line Marker at 100% */}
                    <div
                      className="absolute right-0 top-0 bottom-0 border-r-2 border-dashed border-slate-400 pointer-events-none"
                      title="100% Target Goal"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-0.5">
                    <span>Actual: {m.totalTasksClosed} Closed</span>
                    <span>Goal: {m.totalTasksAssigned} (100%)</span>
                  </div>
                </div>

                {/* Task Breakdown Stats */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Admin Tickets
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {m.closedTicketsCount} / {m.ticketsCount}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Followup Logs
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {m.closedLogsCount} / {m.logsCount}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Pending Items
                    </span>
                    <span
                      className={`font-extrabold ${
                        m.totalTasksPending > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {m.totalTasksPending}
                    </span>
                  </div>
                </div>

                {/* Expand / Collapse Details Button */}
                {(m.mentorTickets.length > 0 || m.mentorLogs.length > 0) && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setExpandedMentor(isExpanded ? null : m.mentorName)}
                      className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-[11px] font-bold text-indigo-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>
                        {isExpanded
                          ? 'Hide Assigned Task Details'
                          : `View ${m.mentorTickets.length} Ticket(s) & ${m.mentorLogs.length} Log(s)`}
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Expanded Task List */}
                    {isExpanded && (
                      <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 animate-in fade-in duration-150">
                        <p className="font-extrabold text-slate-800 text-[11px] flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          Assigned Ticket & Task Details ({selectedWeek}):
                        </p>

                        {m.mentorTickets.length > 0 ? (
                          <div className="space-y-1.5">
                            {m.mentorTickets.map((t) => (
                              <div
                                key={t.id}
                                className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-bold text-slate-900 truncate">
                                      [{t.category}]
                                    </span>
                                    <span className="text-slate-500 truncate">
                                      - {t.studentName}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 italic truncate mt-0.5">
                                    "{t.message}"
                                  </p>
                                </div>

                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] font-black shrink-0 ${
                                    t.status === 'Closed'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {t.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-500 italic">
                            No explicit admin tickets created for this mentor in {selectedWeek}.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredMetrics.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 font-medium">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              No mentors found matching "{effectiveSearch}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
