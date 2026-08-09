import React from 'react';
import { StudentSummary, FollowupLog, AdminTicket } from '../types';
import {
  AlertTriangle,
  ClipboardList,
  Calendar,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
  Clock,
  CheckCircle2,
  CheckSquare,
} from 'lucide-react';
import { KpiCard } from './KpiCard';
import { DashboardWidget } from './DashboardWidget';

interface TabFlaggedStudentsProps {
  students: StudentSummary[];
  logs: FollowupLog[];
  tickets?: AdminTicket[];
  onOpenLogModal: (studentName: string, sourceTab: 'Flagged') => void;
  onOpenDetailModal: (student: StudentSummary) => void;
}

export const TabFlaggedStudents: React.FC<TabFlaggedStudentsProps> = ({
  students,
  logs,
  tickets = [],
  onOpenLogModal,
  onOpenDetailModal,
}) => {
  // Criteria strictly: Attendance Avg < 75 AND Objective Avg < 75 AND Subjective Avg < 75
  const flaggedStudents = students.filter((s) => s.isFlagged);

  const getLogForStudent = (name: string) => {
    return logs.find((l) => l.studentName.trim() === name.trim() && l.sourceTab === 'Flagged');
  };

  const pendingCount = flaggedStudents.filter((s) => {
    const l = getLogForStudent(s.studentName);
    return !l || l.currentStage === 'Pending';
  }).length;

  const inProgressCount = flaggedStudents.filter((s) => {
    const l = getLogForStudent(s.studentName);
    return l && (l.currentStage === 'In Progress' || l.currentStage === 'Doubt Scheduled');
  }).length;

  const resolvedCount = flaggedStudents.filter((s) => {
    const l = getLogForStudent(s.studentName);
    return l && (l.currentStage === 'Resolved' || l.currentStage === 'Closed');
  }).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <DashboardWidget
        id="flagged-kpis"
        title="Academic Intervention Metrics"
        subtitle="Critical flag monitoring for students scoring under 75% in Attendance, Objective, and Subjective"
        icon={ShieldAlert}
        headerBg="bg-rose-50/80"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <KpiCard
            id="kpi-flagged-total"
            title="Total Flagged Cases"
            value={flaggedStudents.length}
            subtext="Sub-75% in all 3 pillars"
            icon={ShieldAlert}
            color="rose"
            trend={{ direction: flaggedStudents.length > 0 ? 'down' : 'neutral', value: 'High Priority' }}
            comparisonBadge={{ label: 'Threshold <75%', type: 'rose' }}
            tooltip="Students who fail to meet the 75% benchmark in Attendance, Objective, AND Subjective tests simultaneously."
          />

          <KpiCard
            id="kpi-flagged-pending"
            title="Pending Outreach"
            value={pendingCount}
            subtext="Awaiting mentor contact"
            icon={AlertTriangle}
            color="rose"
            trend={{ direction: 'neutral', value: 'Needs Action' }}
            comparisonBadge={{ label: 'Pending', type: 'rose' }}
            tooltip="Flagged students with no recorded intervention log yet."
          />

          <KpiCard
            id="kpi-flagged-progress"
            title="Active Interventions"
            value={inProgressCount}
            subtext="Doubts scheduled / in log"
            icon={Clock}
            color="amber"
            trend={{ direction: 'neutral', value: 'In Progress' }}
            comparisonBadge={{ label: 'Active', type: 'amber' }}
            tooltip="Flagged students receiving active academic counseling and doubt resolution."
          />

          <KpiCard
            id="kpi-flagged-resolved"
            title="Resolved Interventions"
            value={resolvedCount}
            subtext="Closed cases"
            icon={CheckCircle2}
            color="emerald"
            trend={{ direction: 'up', value: 'Resolved' }}
            comparisonBadge={{ label: 'Resolved', type: 'emerald' }}
            tooltip="Interventions successfully closed after student score recovery."
          />
        </div>
      </DashboardWidget>

      {/* Flagged Cases List Widget */}
      <DashboardWidget
        id="flagged-cases-list"
        title="High Risk Academic Intervention List"
        subtitle={`Showing ${flaggedStudents.length} critical student cases requiring mentor followup`}
        icon={AlertTriangle}
      >
        <div className="divide-y divide-slate-100">
          {flaggedStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
              <p className="font-semibold text-slate-700">
                No students are currently flagged under &lt;75% in all 3 areas.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                All active students are performing above critical threshold in at least one metric.
              </p>
            </div>
          ) : (
            flaggedStudents.map((st) => {
              const log = getLogForStudent(st.studentName);

              // Check if student is tagged in an active admin ticket
              const assignedTicket = tickets.find(
                (t) =>
                  t.status !== 'Closed' &&
                  (t.studentName.includes(st.studentName) ||
                    t.taggedStudents?.some((item) => item.studentName.trim() === st.studentName.trim()))
              );

              return (
                <div key={st.studentName} className="p-4 hover:bg-rose-50/20 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Student Info */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onOpenDetailModal(st)}
                          className="font-bold text-slate-900 hover:text-indigo-600 text-sm transition-colors text-left cursor-pointer"
                        >
                          {st.studentName}
                        </button>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
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

                      {/* Performance Scores Bar */}
                      <div className="grid grid-cols-3 gap-3 max-w-md bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                        <div className="text-center border-r border-slate-200 pr-2">
                          <p className="text-[10px] text-slate-400 font-medium">Attendance Avg</p>
                          <p className="font-bold text-rose-600">{st.attendanceAvg}%</p>
                        </div>
                        <div className="text-center border-r border-slate-200 pr-2">
                          <p className="text-[10px] text-slate-400 font-medium">Objective Avg</p>
                          <p className="font-bold text-rose-600">{st.objectiveAvg}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400 font-medium">Subjective Avg</p>
                          <p className="font-bold text-rose-600">{st.subjectiveAvg}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Log status & actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {log ? (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 max-w-xs text-xs space-y-1">
                          <div className="flex items-center justify-between space-x-2">
                            <span className="text-[10px] text-slate-400">Stage:</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                              {log.currentStage}
                            </span>
                          </div>
                          {log.reasonBucket && (
                            <p className="text-[11px] text-slate-700 font-medium truncate">
                              Bucket: {log.reasonBucket}
                            </p>
                          )}
                          {log.scheduledDoubtDate && (
                            <p className="text-[11px] text-emerald-700 font-semibold flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Doubt: {log.scheduledDoubtDate}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 font-medium">
                          Pending Followup
                        </span>
                      )}

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onOpenLogModal(st.studentName, 'Flagged')}
                          className="inline-flex items-center px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
                        >
                          <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
                          {log ? 'Update Intervention' : 'Log Intervention'}
                        </button>

                        <button
                          onClick={() => onOpenDetailModal(st)}
                          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View Full Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DashboardWidget>
    </div>
  );
};
