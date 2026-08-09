import React, { useMemo } from 'react';
import { StudentSummary, FollowupLog } from '../types';
import {
  AlertTriangle,
  CalendarX,
  UserX,
  ExternalLink,
  ClipboardList,
  Download,
  Users,
  Award,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';
import { KpiCard } from './KpiCard';
import { DashboardWidget } from './DashboardWidget';
import { EnhancedTable, ColumnDef } from './EnhancedTable';

interface TabOverviewProps {
  students: StudentSummary[];
  logs: FollowupLog[];
  onOpenLogModal: (studentName: string, sourceTab: 'ZeroAttendance' | 'Flagged' | 'ReviewLog' | 'Discontinuation') => void;
  onOpenDetailModal: (student: StudentSummary) => void;
}

export const TabOverview: React.FC<TabOverviewProps> = ({
  students,
  logs,
  onOpenLogModal,
  onOpenDetailModal,
}) => {
  const totalCount = students.length;
  const zeroAttCount = students.filter((s) => s.isZeroAttendance).length;
  const flaggedCount = students.filter((s) => s.isFlagged).length;
  const discontinuedCount = students.filter((s) => s.isDiscontinued).length;

  const classAvgAttendance = useMemo(() => {
    if (totalCount === 0) return 0;
    const sum = students.reduce((acc, s) => acc + s.attendanceAvg, 0);
    return Math.round((sum / totalCount) * 10) / 10;
  }, [students, totalCount]);

  const classAvgOverall = useMemo(() => {
    if (totalCount === 0) return 0;
    const sum = students.reduce((acc, s) => acc + s.overallAvg, 0);
    return Math.round((sum / totalCount) * 10) / 10;
  }, [students, totalCount]);

  const getLogForStudent = (name: string) => {
    return logs.find((l) => l.studentName.trim() === name.trim());
  };

  const exportCSV = () => {
    const headers = [
      'Student Name',
      'Grade',
      'Section',
      'Stream',
      'Batch',
      'Mentor',
      'Attendance Avg (%)',
      'Objective Avg (%)',
      'Subjective Avg (%)',
      'Overall Avg (%)',
      'Zero Attendance',
      'Flagged (<75%)',
      'Discontinued',
    ];

    const rows = students.map((s) => [
      `"${s.studentName}"`,
      s.grade,
      s.section,
      s.stream,
      s.batch,
      `"${s.mentorName}"`,
      s.attendanceAvg,
      s.objectiveAvg,
      s.subjectiveAvg,
      s.overallAvg,
      s.isZeroAttendance ? 'Yes' : 'No',
      s.isFlagged ? 'Yes' : 'No',
      s.isDiscontinued ? 'Yes' : 'No',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Mentor_Master_Performance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderBadge = (score: number) => {
    if (score >= 85) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {score}%
        </span>
      );
    } else if (score >= 75) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          {score}%
        </span>
      );
    } else if (score >= 50) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          {score}%
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          {score}%
        </span>
      );
    }
  };

  // Enhanced Table Columns Definition
  const tableColumns: ColumnDef<StudentSummary>[] = [
    {
      key: 'studentName',
      header: 'Student Name',
      stickyLeft: true,
      sortValue: (s) => s.studentName,
      accessor: (st) => (
        <button
          onClick={() => onOpenDetailModal(st)}
          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-left flex items-center group cursor-pointer"
        >
          {st.studentName}
          <ExternalLink className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity" />
        </button>
      ),
    },
    {
      key: 'gradeSection',
      header: 'Grade / Sec',
      sortValue: (s) => `${s.grade}-${s.section}`,
      accessor: (st) => (
        <span className="font-semibold text-slate-800">
          Gr {st.grade} - {st.section}
        </span>
      ),
    },
    {
      key: 'batchStream',
      header: 'Batch / Stream',
      sortValue: (s) => `${s.batch} ${s.stream}`,
      accessor: (st) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{st.batch}</span>
          <span className="text-[10px] text-slate-400">{st.stream}</span>
        </div>
      ),
    },
    {
      key: 'mentorName',
      header: 'Mentor',
      sortValue: (s) => s.mentorName,
      accessor: (st) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
          {st.mentorName}
        </span>
      ),
    },
    {
      key: 'attendanceAvg',
      header: 'Attendance Avg',
      align: 'center',
      sortValue: (s) => s.attendanceAvg,
      accessor: (st) => (
        <div className="flex flex-col items-center">
          {renderBadge(st.attendanceAvg)}
          <div className="w-16 bg-slate-200 rounded-full h-1 mt-1.5 overflow-hidden">
            <div
              className={`h-1 rounded-full ${
                st.attendanceAvg >= 75
                  ? 'bg-emerald-500'
                  : st.attendanceAvg >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, st.attendanceAvg)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'objectiveAvg',
      header: 'Objective Avg',
      align: 'center',
      sortValue: (s) => s.objectiveAvg,
      accessor: (st) => renderBadge(st.objectiveAvg),
    },
    {
      key: 'subjectiveAvg',
      header: 'Subjective Avg',
      align: 'center',
      sortValue: (s) => s.subjectiveAvg,
      accessor: (st) => renderBadge(st.subjectiveAvg),
    },
    {
      key: 'overallAvg',
      header: 'Overall Avg',
      align: 'center',
      sortValue: (s) => s.overallAvg,
      accessor: (st) => renderBadge(st.overallAvg),
    },
    {
      key: 'status',
      header: 'Status Indicators',
      align: 'center',
      accessor: (st) => (
        <div className="flex items-center justify-center space-x-1">
          {st.isZeroAttendance && (
            <span
              className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300"
              title="Zero attendance detected"
            >
              Zero Att
            </span>
          )}
          {st.isFlagged && (
            <span
              className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300"
              title="Flagged: Less than 75%"
            >
              Flagged
            </span>
          )}
          {st.isDiscontinued && (
            <span
              className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300"
              title="Student Discontinued"
            >
              Discontinued
            </span>
          )}
          {!st.isZeroAttendance && !st.isFlagged && !st.isDiscontinued && (
            <span className="text-[10px] font-medium text-emerald-600">On Track</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      sortable: false,
      accessor: (st) => {
        const log = getLogForStudent(st.studentName);
        return (
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() =>
                onOpenLogModal(
                  st.studentName,
                  st.isZeroAttendance
                    ? 'ZeroAttendance'
                    : st.isFlagged
                    ? 'Flagged'
                    : 'ReviewLog'
                )
              }
              className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                log
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 mr-1" />
              {log ? log.currentStage : 'Log Followup'}
            </button>

            <button
              onClick={() => onOpenDetailModal(st)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              title="View Profile"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced KPI Metrics Row */}
      <DashboardWidget
        id="overview-kpis"
        title="Key Performance Metrics"
        subtitle="Live benchmark overview across all active students, attendance rates, and score averages"
        icon={BarChart2}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            id="kpi-total-students"
            title="Total Active Students"
            value={totalCount}
            subtext="Enrolled across all sections"
            icon={Users}
            color="indigo"
            trend={{ direction: 'up', value: '+3.2%', label: 'Active enrollment growth' }}
            comparisonBadge={{ label: 'Target: 100%', type: 'indigo' }}
            tooltip="Total number of active student profiles currently being monitored across all mentors and batches."
          />

          <KpiCard
            id="kpi-zero-att"
            title="Zero Attendance Risk"
            value={zeroAttCount}
            subtext="Students with 0% in any week"
            icon={CalendarX}
            color="amber"
            trend={{
              direction: zeroAttCount > 0 ? 'down' : 'neutral',
              value: `${zeroAttCount > 0 ? '-' : '0'}${zeroAttCount}`,
              label: 'Weekly cases',
            }}
            comparisonBadge={{ label: 'Needs Followup', type: 'amber' }}
            tooltip="Number of students who recorded zero attendance in one or more evaluation weeks."
          />

          <KpiCard
            id="kpi-flagged"
            title="Flagged Students (<75%)"
            value={flaggedCount}
            subtext="Sub-75% in all 3 pillars"
            icon={AlertTriangle}
            color="rose"
            trend={{
              direction: flaggedCount > 0 ? 'down' : 'neutral',
              value: `Critical`,
              label: 'Low performance flag',
            }}
            comparisonBadge={{ label: 'Action Required', type: 'rose' }}
            tooltip="Students who score below 75% across Attendance, Objective Test, AND Subjective Test scores simultaneously."
          />

          <KpiCard
            id="kpi-overall-avg"
            title="Overall Class Avg Score"
            value={`${classAvgOverall}%`}
            subtext={`Attendance Avg: ${classAvgAttendance}%`}
            icon={Award}
            color="emerald"
            trend={{ direction: classAvgOverall >= 75 ? 'up' : 'down', value: 'vs Benchmark 75%' }}
            comparisonBadge={{ label: 'Batch Benchmark', type: 'emerald' }}
            tooltip="Combined average test percentage across objective and subjective examinations."
          />
        </div>
      </DashboardWidget>

      {/* Main Bento Table Widget */}
      <DashboardWidget
        id="overview-master-table"
        title="Student Performance Master Table"
        subtitle="Interactive dataset with sticky headers, column visibility toggle, search, pagination, and export"
        icon={Users}
        onExport={exportCSV}
      >
        <EnhancedTable
          data={students}
          columns={tableColumns}
          keyExtractor={(s) => s.studentName}
          searchPlaceholder="Search student, mentor, grade or batch..."
          onExportCSV={exportCSV}
          defaultPageSize={25}
        />
      </DashboardWidget>
    </div>
  );
};
