import React, { useState } from 'react';
import {
  StudentSummary,
  FollowupLog,
  AttendanceRecord,
  AdminTicket,
  ZERO_ATTENDANCE_REASON_BUCKETS,
  ReasonBucket,
} from '../types';
import {
  CalendarX,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  Calendar,
  ArrowRight,
  Filter,
  CheckSquare,
  Tag,
} from 'lucide-react';
import { KpiCard } from './KpiCard';
import { DashboardWidget } from './DashboardWidget';

interface TabZeroAttendanceProps {
  students: StudentSummary[];
  attendanceRecords: AttendanceRecord[];
  logs: FollowupLog[];
  tickets?: AdminTicket[];
  onOpenLogModal: (studentName: string, sourceTab: 'ZeroAttendance') => void;
}

export const TabZeroAttendance: React.FC<TabZeroAttendanceProps> = ({
  students,
  attendanceRecords,
  logs,
  tickets = [],
  onOpenLogModal,
}) => {
  const [selectedWeek, setSelectedWeek] = useState<string>('All');
  const [selectedMentor, setSelectedMentor] = useState<string>('All');
  const [selectedBucket, setSelectedBucket] = useState<string>('All');

  // Filter students who have 0 attendance in any week
  const zeroStudents = students.filter((s) => s.isZeroAttendance);

  // Extract unique weeks and mentors for filtering
  const zeroAttRecords = attendanceRecords.filter((a) => a.attendancePercentage === 0);
  const weeks = Array.from(new Set(zeroAttRecords.map((a) => (a.week ? a.week.trim() : '')))).filter(Boolean).sort();
  const mentors = Array.from(new Set(zeroStudents.map((s) => (s.mentorName ? s.mentorName.trim() : '')))).filter(Boolean).sort();

  const getLogForStudent = (name: string) => {
    return logs.find((l) => l.studentName.trim() === name.trim() && l.sourceTab === 'ZeroAttendance');
  };

  // Bucket distribution counts
  const bucketCounts: Record<string, number> = {};
  ZERO_ATTENDANCE_REASON_BUCKETS.forEach((b) => (bucketCounts[b] = 0));
  let unassignedCount = 0;

  zeroStudents.forEach((st) => {
    const l = getLogForStudent(st.studentName);
    if (l && l.reasonBucket && bucketCounts[l.reasonBucket] !== undefined) {
      bucketCounts[l.reasonBucket]++;
    } else {
      unassignedCount++;
    }
  });

  // Filtered zero attendance list
  const filteredZeroStudents = zeroStudents.filter((st) => {
    if (selectedMentor !== 'All' && st.mentorName !== selectedMentor) return false;
    if (selectedWeek !== 'All') {
      const matchWeek = attendanceRecords.some(
        (a) =>
          a.studentName.trim() === st.studentName.trim() &&
          a.week === selectedWeek &&
          a.attendancePercentage === 0
      );
      if (!matchWeek) return false;
    }
    if (selectedBucket !== 'All') {
      const log = getLogForStudent(st.studentName);
      if (selectedBucket === 'Unassigned') {
        if (log && log.reasonBucket) return false;
      } else {
        if (!log || log.reasonBucket !== selectedBucket) return false;
      }
    }
    return true;
  });

  // Stage summary counts
  const pendingCount = filteredZeroStudents.filter((s) => {
    const l = getLogForStudent(s.studentName);
    return !l || l.currentStage === 'Pending';
  }).length;

  const inProgressCount = filteredZeroStudents.filter((s) => {
    const l = getLogForStudent(s.studentName);
    return (
      l &&
      (l.currentStage === 'In Progress' ||
        l.currentStage === 'Doubt Scheduled' ||
        l.currentStage === 'Followed Up')
    );
  }).length;

  const resolvedCount = filteredZeroStudents.filter((s) => {
    const l = getLogForStudent(s.studentName);
    return l && (l.currentStage === 'Resolved' || l.currentStage === 'Closed');
  }).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards for Zero Attendance Portal */}
      <DashboardWidget
        id="zero-att-kpis"
        title="Zero Attendance Followup Overview"
        subtitle="Track multi-stage resolution logs, scheduled doubts, and pending case buckets"
        icon={CalendarX}
        headerBg="bg-amber-50/80"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            id="kpi-zero-pending"
            title="Pending Followups"
            value={pendingCount}
            subtext="Requires initial outreach"
            icon={AlertCircle}
            color="rose"
            trend={{ direction: pendingCount > 0 ? 'down' : 'neutral', value: 'High Priority' }}
            comparisonBadge={{ label: 'Immediate Action', type: 'rose' }}
            tooltip="Zero attendance cases awaiting initial mentor contact or bucket assignment."
          />

          <KpiCard
            id="kpi-zero-progress"
            title="In Progress / Doubt Scheduled"
            value={inProgressCount}
            subtext="Active communication & doubts"
            icon={Clock}
            color="amber"
            trend={{ direction: 'neutral', value: 'Active Tracking' }}
            comparisonBadge={{ label: 'Followup Active', type: 'amber' }}
            tooltip="Students whose followup logs are actively being managed or have doubt sessions booked."
          />

          <KpiCard
            id="kpi-zero-resolved"
            title="Resolved & Closed Cases"
            value={resolvedCount}
            subtext="Successfully re-engaged"
            icon={CheckCircle2}
            color="emerald"
            trend={{ direction: 'up', value: 'Closed' }}
            comparisonBadge={{ label: 'Resolved', type: 'emerald' }}
            tooltip="Cases where attendance issue was resolved and marked closed."
          />
        </div>
      </DashboardWidget>

      {/* Zero Attendance Reason Buckets Breakdown Widget */}
      <DashboardWidget
        id="zero-att-buckets"
        title="Zero Attendance Reason Buckets"
        subtitle="Categorization breakdown for zero attendance cases (click any bucket to filter)"
        icon={Tag}
        headerBg="bg-indigo-50/80"
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedBucket('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
              selectedBucket === 'All'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>All Cases</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
              {zeroStudents.length}
            </span>
          </button>

          {ZERO_ATTENDANCE_REASON_BUCKETS.map((b) => {
            const count = bucketCounts[b] || 0;
            const isSelected = selectedBucket === b;
            return (
              <button
                key={b}
                onClick={() => setSelectedBucket(isSelected ? 'All' : b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : count > 0
                    ? 'bg-indigo-50/80 text-indigo-900 border-indigo-200 hover:bg-indigo-100'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 opacity-75'
                }`}
              >
                <span>{b}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : count > 0
                      ? 'bg-indigo-200/80 text-indigo-900'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {unassignedCount > 0 && (
            <button
              onClick={() => setSelectedBucket(selectedBucket === 'Unassigned' ? 'All' : 'Unassigned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedBucket === 'Unassigned'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span>Unassigned</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
                {unassignedCount}
              </span>
            </button>
          )}
        </div>
      </DashboardWidget>

      {/* Main List Widget with Filters */}
      <DashboardWidget
        id="zero-att-cases"
        title="Zero Attendance Student Cases"
        subtitle={`Showing ${filteredZeroStudents.length} student cases based on active filters`}
        icon={Filter}
        customControls={
          <div className="flex flex-wrap items-center gap-2 text-xs mr-2">
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Weeks</option>
              {weeks.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>

            <select
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Mentors</option>
              {mentors.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Buckets</option>
              <option value="Unassigned">Unassigned Bucket</option>
              {ZERO_ATTENDANCE_REASON_BUCKETS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <div className="divide-y divide-slate-100">
          {filteredZeroStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CalendarX className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
              <p className="font-semibold text-slate-600">
                No Zero Attendance cases found for selected filters.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try resetting the week or mentor filter above.
              </p>
            </div>
          ) : (
            filteredZeroStudents.map((st) => {
              const log = getLogForStudent(st.studentName);
              const zeroWeeks = st.recentWeekZeroAttendance || [];

              // Find if student is tagged in an active admin ticket
              const assignedTicket = tickets.find(
                (t) =>
                  t.status !== 'Closed' &&
                  (t.studentName.includes(st.studentName) ||
                    t.taggedStudents?.some((item) => item.studentName.trim() === st.studentName.trim()))
              );

              return (
                <div key={st.studentName} className="p-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Student Info & Badges */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{st.studentName}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Gr {st.grade}-{st.section} | {st.batch}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                          Mentor: {st.mentorName}
                        </span>
                        {assignedTicket && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-600 text-white shadow-2xs flex items-center gap-1">
                            <CheckSquare className="w-3 h-3" />
                            Admin Task Tagged ({assignedTicket.status}) - Deadline: {assignedTicket.deadlineDate}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>Zero Attendance in:</span>
                        {zeroWeeks.length > 0 ? (
                          zeroWeeks.map((w) => (
                            <span
                              key={w}
                              className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold text-[10px] border border-rose-200"
                            >
                              {w}
                            </span>
                          ))
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold text-[10px]">
                            Overall 0%
                          </span>
                        )}
                        <span>• Stream: {st.stream}</span>
                        <span>
                          • Attendance Avg:{' '}
                          <strong className="text-rose-600">{st.attendanceAvg}%</strong>
                        </span>
                      </div>
                    </div>

                    {/* Middle: Reason Bucket & Scheduled Doubt */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {log ? (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 max-w-xs text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-medium">
                              Reason Bucket:
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                              {log.reasonBucket}
                            </span>
                          </div>
                          {log.scheduledDoubtDate && (
                            <p className="text-[11px] text-emerald-700 font-semibold flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Doubt: {log.scheduledDoubtDate} ({log.scheduledDoubtTopic || 'General'})
                            </p>
                          )}
                          <p className="text-[10px] text-slate-500 line-clamp-1 italic">
                            "{log.notes}"
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-medium">
                          Reason Bucket Unassigned
                        </span>
                      )}

                      {/* Right: Stage Badge & Action Button */}
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            !log || log.currentStage === 'Pending'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : log.currentStage === 'In Progress'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : log.currentStage === 'Doubt Scheduled'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-slate-200 text-slate-800 border-slate-300'
                          }`}
                        >
                          {log ? log.currentStage : 'Pending'}
                        </span>

                        <button
                          onClick={() => onOpenLogModal(st.studentName, 'ZeroAttendance')}
                          className="inline-flex items-center px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
                        >
                          <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
                          {log ? 'Update Log & Schedule' : 'Log Followup'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* History Timeline Logs Preview */}
                  {log && log.history && log.history.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center space-x-2 text-[11px] text-slate-500 overflow-x-auto">
                      <History className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700">Stage History:</span>
                      {log.history.map((hist, idx) => (
                        <div key={hist.id} className="flex items-center space-x-1 shrink-0">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 border border-slate-200">
                            <strong>{hist.stage}</strong> ({hist.timestamp.split(' ')[0]})
                          </span>
                          {idx < log.history.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-slate-300" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DashboardWidget>
    </div>
  );
};
