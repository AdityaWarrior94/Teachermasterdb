import React, { useState } from 'react';
import { DiscontinuationRecord, REASON_BUCKETS, ReasonBucket, FollowupLog } from '../types';
import {
  UserX,
  Phone,
  MessageSquare,
  ClipboardList,
  Calendar,
  ChevronDown,
  Tag,
  AlertCircle,
  BarChart2,
} from 'lucide-react';
import { KpiCard } from './KpiCard';
import { DashboardWidget } from './DashboardWidget';

interface TabDiscontinuationProps {
  discontinuationRecords: DiscontinuationRecord[];
  logs: FollowupLog[];
  onOpenLogModal: (studentName: string, sourceTab: 'Discontinuation') => void;
  onUpdateRecordBucket: (recordId: string, bucket: ReasonBucket) => void;
}

export const TabDiscontinuation: React.FC<TabDiscontinuationProps> = ({
  discontinuationRecords,
  logs,
  onOpenLogModal,
  onUpdateRecordBucket,
}) => {
  const [mentorFilter, setMentorFilter] = useState<string>('All');
  const [batchFilter, setBatchFilter] = useState<string>('All');
  const [sectionFilter, setSectionFilter] = useState<string>('All');

  const mentors = Array.from(
    new Set(discontinuationRecords.map((d) => (d.mentorName ? d.mentorName.trim() : '')))
  )
    .filter(Boolean)
    .sort();
  const batches = Array.from(
    new Set(discontinuationRecords.map((d) => (d.batch ? d.batch.trim() : 'Impact')))
  )
    .filter(Boolean)
    .sort();
  const sections = Array.from(
    new Set(discontinuationRecords.map((d) => (d.section ? d.section.trim() : '')))
  )
    .filter(Boolean)
    .sort();

  const filteredRecords = discontinuationRecords.filter((d) => {
    if (mentorFilter !== 'All' && d.mentorName !== mentorFilter) return false;
    if (batchFilter !== 'All' && (d.batch || 'Impact') !== batchFilter) return false;
    if (sectionFilter !== 'All' && d.section !== sectionFilter) return false;
    return true;
  });

  // Calculate bucket counts for filtered view
  const bucketCounts: Record<string, number> = {};
  REASON_BUCKETS.forEach((b) => (bucketCounts[b] = 0));

  filteredRecords.forEach((d) => {
    if (d.reasonBucket && bucketCounts[d.reasonBucket] !== undefined) {
      bucketCounts[d.reasonBucket]++;
    }
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <DashboardWidget
        id="disc-kpis"
        title="Discontinuation Analytics Overview"
        subtitle="Live metrics on discontinued students, mentor feedback, and bucket reasons"
        icon={UserX}
        headerBg="bg-slate-100/90"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            id="kpi-disc-total"
            title="Total Discontinued"
            value={discontinuationRecords.length}
            subtext="From Discontinuation Master Sheet"
            icon={UserX}
            color="rose"
            trend={{ direction: 'down', value: 'Dropouts' }}
            comparisonBadge={{ label: 'Impact Tracker', type: 'rose' }}
            tooltip="Total number of students marked as discontinued across all batches."
          />

          <KpiCard
            id="kpi-disc-filtered"
            title="Filtered Case Count"
            value={filteredRecords.length}
            subtext={`Mentors: ${mentorFilter} | Batch: ${batchFilter}`}
            icon={BarChart2}
            color="indigo"
            trend={{ direction: 'neutral', value: 'Active Scope' }}
            comparisonBadge={{ label: 'Filtered View', type: 'indigo' }}
            tooltip="Number of discontinuation cases currently displayed based on filters."
          />

          <KpiCard
            id="kpi-disc-buckets"
            title="Categorized Buckets"
            value={Object.values(bucketCounts).reduce((a, b) => a + (b > 0 ? 1 : 0), 0)}
            subtext="Reason categories identified"
            icon={Tag}
            color="amber"
            trend={{ direction: 'neutral', value: 'Categorization' }}
            comparisonBadge={{ label: 'Bucket Analysis', type: 'amber' }}
            tooltip="Distinct reason buckets assigned across the discontinuation cases."
          />
        </div>
      </DashboardWidget>

      {/* Filtered Bucket Summary Widget */}
      <DashboardWidget
        id="disc-bucket-summary"
        title="Reason Bucket Distribution"
        subtitle="Standardized categorization breakdown for discontinuation feedback"
        icon={Tag}
      >
        <div className="flex flex-wrap gap-2">
          {REASON_BUCKETS.map((b) => {
            const count = bucketCounts[b] || 0;
            if (count === 0) return null;
            return (
              <span
                key={b}
                className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs"
              >
                <Tag className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                {b}: <strong className="ml-1 text-indigo-950 font-bold">{count}</strong>
              </span>
            );
          })}
        </div>
      </DashboardWidget>

      {/* Main Records List Widget */}
      <DashboardWidget
        id="disc-records-list"
        title="Discontinuation Records & Log Management"
        subtitle={`Showing ${filteredRecords.length} discontinuation records`}
        icon={UserX}
        customControls={
          <div className="flex items-center space-x-2 text-xs mr-2">
            <select
              value={mentorFilter}
              onChange={(e) => setMentorFilter(e.target.value)}
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
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Batches</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Sections</option>
              {sections.map((s) => (
                <option key={s} value={s}>
                  Sec {s}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <div className="divide-y divide-slate-100">
          {filteredRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic">
              No discontinuation records match the selected filters.
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const log = logs.find((l) => l.studentName.trim() === rec.studentName.trim());

              return (
                <div key={rec.id} className="p-4 hover:bg-slate-50/80 transition-colors space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Student Info */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{rec.studentName}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          Gr {rec.grade}-{rec.section} | {rec.batch || 'Impact'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          {rec.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        Admission: <strong>{rec.admissionDate}</strong> | Month:{' '}
                        <strong>{rec.month}</strong> | Mentor:{' '}
                        <strong className="text-slate-800">{rec.mentorName}</strong>
                      </p>
                    </div>

                    {/* Assign Reason Bucket & Action */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                          Bucket:
                        </span>
                        <select
                          value={rec.reasonBucket || 'Unassigned'}
                          onChange={(e) =>
                            onUpdateRecordBucket(rec.id, e.target.value as ReasonBucket)
                          }
                          className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="Unassigned">-- Select Bucket --</option>
                          {REASON_BUCKETS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => onOpenLogModal(rec.studentName, 'Discontinuation')}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all cursor-pointer shrink-0"
                      >
                        <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
                        {log ? 'Update Log' : 'Log Followup'}
                      </button>
                    </div>
                  </div>

                  {/* Comments from Sheet */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-700 flex items-center text-[11px]">
                        <MessageSquare className="w-3 h-3 mr-1 text-slate-400" />
                        Discontinuation Reason (Sheet):
                      </p>
                      <p className="text-slate-600 bg-white p-2 rounded-lg border border-slate-200/60 italic">
                        "{rec.reasonComment || 'No reason specified in sheet'}"
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-slate-700 flex items-center text-[11px]">
                        <Phone className="w-3 h-3 mr-1 text-slate-400" />
                        Mentor Call Feedback:
                      </p>
                      <p className="text-slate-600 bg-white p-2 rounded-lg border border-slate-200/60 italic">
                        "{rec.mentorCallFeedback || 'No call feedback logged yet'}"
                      </p>
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
