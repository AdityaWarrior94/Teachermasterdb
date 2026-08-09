import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import {
  StudentSummary,
  FollowupLog,
  DiscontinuationRecord,
  ZERO_ATTENDANCE_REASON_BUCKETS,
  DISCONTINUATION_REASON_BUCKETS,
  ZeroAttendanceReasonBucket,
  DiscontinuationReasonBucket,
} from '../types';
import {
  PieChart,
  Users,
  CalendarX,
  UserX,
  Tag,
  Layers,
  Search,
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { KpiCard } from './KpiCard';
import { DashboardWidget } from './DashboardWidget';

interface TabAnalyticsProps {
  students: StudentSummary[];
  logs: FollowupLog[];
  discontinuation: DiscontinuationRecord[];
}

export const TabAnalytics: React.FC<TabAnalyticsProps> = ({
  students,
  logs,
  discontinuation,
}) => {
  const [selectedMentor, setSelectedMentor] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const zeroTableRef = useRef<HTMLDivElement>(null);
  const discTableRef = useRef<HTMLDivElement>(null);

  const mentors = Array.from(new Set(students.map((s) => s.mentorName))).sort();
  const grades = Array.from(new Set(students.map((s) => s.grade))).sort();

  // Filter zero attendance students
  const zeroStudents = students.filter((s) => {
    if (!s.isZeroAttendance) return false;
    if (selectedMentor !== 'All' && s.mentorName !== selectedMentor) return false;
    if (selectedGrade !== 'All' && s.grade !== selectedGrade) return false;
    if (
      searchQuery &&
      !s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.mentorName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Zero attendance logs lookup
  const getZeroLog = (studentName: string) => {
    return logs.find(
      (l) => l.studentName.trim() === studentName.trim() && l.sourceTab === 'ZeroAttendance'
    );
  };

  // Zero attendance bucket mapping dynamically constructed
  type ZeroMapType = Record<
    ZeroAttendanceReasonBucket | 'Unassigned',
    { count: number; students: { name: string; stage: string; mentor: string }[] }
  >;

  const zeroBucketMap: ZeroMapType = ZERO_ATTENDANCE_REASON_BUCKETS.reduce((acc, b) => {
    acc[b] = { count: 0, students: [] };
    return acc;
  }, { Unassigned: { count: 0, students: [] } } as ZeroMapType);

  zeroStudents.forEach((st) => {
    const l = getZeroLog(st.studentName);
    const bucket = (l?.reasonBucket as ZeroAttendanceReasonBucket) || 'Unassigned';
    if (zeroBucketMap[bucket]) {
      zeroBucketMap[bucket].count++;
      zeroBucketMap[bucket].students.push({
        name: st.studentName,
        stage: l?.currentStage || 'Pending',
        mentor: st.mentorName,
      });
    } else {
      zeroBucketMap['Unassigned'].count++;
      zeroBucketMap['Unassigned'].students.push({
        name: st.studentName,
        stage: l?.currentStage || 'Pending',
        mentor: st.mentorName,
      });
    }
  });

  const totalZeroCases = zeroStudents.length;

  // Filter discontinuation records
  const filteredDiscontinuation = discontinuation.filter((d) => {
    if (selectedMentor !== 'All' && d.mentorName !== selectedMentor) return false;
    if (selectedGrade !== 'All' && d.grade !== selectedGrade) return false;
    if (
      searchQuery &&
      !d.studentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !d.mentorName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Discontinuation bucket mapping dynamically constructed
  type DiscMapType = Record<
    DiscontinuationReasonBucket | 'Unassigned',
    { count: number; records: { name: string; status: string; mentor: string }[] }
  >;

  const discBucketMap: DiscMapType = DISCONTINUATION_REASON_BUCKETS.reduce((acc, b) => {
    acc[b] = { count: 0, records: [] };
    return acc;
  }, { Unassigned: { count: 0, records: [] } } as DiscMapType);

  filteredDiscontinuation.forEach((d) => {
    const bucket = (d.reasonBucket as DiscontinuationReasonBucket) || 'Unassigned';
    if (discBucketMap[bucket]) {
      discBucketMap[bucket].count++;
      discBucketMap[bucket].records.push({
        name: d.studentName,
        status: d.status || 'Discontinued',
        mentor: d.mentorName,
      });
    } else {
      discBucketMap['Unassigned'].count++;
      discBucketMap['Unassigned'].records.push({
        name: d.studentName,
        status: d.status || 'Discontinued',
        mentor: d.mentorName,
      });
    }
  });

  const totalDiscCases = filteredDiscontinuation.length;

  // Helper function: Export CSV
  const exportToCSV = (filename: string, rows: { category: string; count: number }[], totalCount: number) => {
    const dataToExport = rows.map((r) => ({
      'Category Name': r.category,
      'Total Cases': r.count,
    }));
    dataToExport.push({
      'Category Name': 'Overall Total',
      'Total Cases': totalCount,
    });

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper function: Download Image (PNG)
  const exportToImage = async (elementRef: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!elementRef.current) return;
    try {
      const canvas = await html2canvas(elementRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        onclone: (clonedDoc) => {
          // Replace oklch color functions in all <style> elements to prevent html2canvas parsing errors
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach((style) => {
            if (style.innerHTML && style.innerHTML.includes('oklch')) {
              style.innerHTML = style.innerHTML.replace(/oklch\([^)]+\)/gi, '#808080');
            }
          });

          // Also sanitize inline style attributes if present
          const elementsWithStyle = clonedDoc.querySelectorAll('[style]');
          elementsWithStyle.forEach((el) => {
            const styleAttr = el.getAttribute('style');
            if (styleAttr && styleAttr.includes('oklch')) {
              el.setAttribute('style', styleAttr.replace(/oklch\([^)]+\)/gi, '#808080'));
            }
          });
        },
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export table as image:', err);
    }
  };

  // Construct table dataset for Zero Attendance
  const zeroTableData: { category: string; count: number }[] = ZERO_ATTENDANCE_REASON_BUCKETS.map((b) => ({
    category: b,
    count: zeroBucketMap[b]?.count || 0,
  }));
  if (zeroBucketMap['Unassigned'].count > 0) {
    zeroTableData.push({
      category: 'Unassigned Bucket (Pending Log)',
      count: zeroBucketMap['Unassigned'].count,
    });
  }

  // Construct table dataset for Discontinuation
  const discTableData: { category: string; count: number }[] = DISCONTINUATION_REASON_BUCKETS.map((b) => ({
    category: b,
    count: discBucketMap[b]?.count || 0,
  }));
  if (discBucketMap['Unassigned'].count > 0) {
    discTableData.push({
      category: 'Unassigned Bucket',
      count: discBucketMap['Unassigned'].count,
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Global Filter Bar */}
      <DashboardWidget
        id="analytics-filters-widget"
        title="Bucket Analytics Dashboard"
        subtitle="Comprehensive categorization breakdown for Zero Attendance and Discontinuation cases"
        icon={PieChart}
        headerBg="bg-slate-900 text-white"
        customControls={
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student or mentor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Mentor Filter */}
            <div className="flex items-center space-x-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs text-slate-200">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900 text-white">All Mentors</option>
                {mentors.map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Filter */}
            <div className="flex items-center space-x-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs text-slate-200">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900 text-white">All Grades</option>
                {grades.map((g) => (
                  <option key={g} value={g} className="bg-slate-900 text-white">
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            id="kpi-zero-att-analytics"
            title="Zero Attendance Cases"
            value={totalZeroCases}
            subtext="Tracked zero attendance records"
            icon={CalendarX}
            color="rose"
            trend={{ direction: 'neutral', value: `${totalZeroCases} active cases` }}
            comparisonBadge={{ label: 'Zero Attendance Table', type: 'rose' }}
            tooltip="Total zero attendance student cases matching current mentor/grade filter."
          />

          <KpiCard
            id="kpi-disc-analytics"
            title="Discontinuation Cases"
            value={totalDiscCases}
            subtext="Tracked discontinuation records"
            icon={UserX}
            color="amber"
            trend={{ direction: 'neutral', value: `${totalDiscCases} total requests` }}
            comparisonBadge={{ label: 'Discontinuation Table', type: 'amber' }}
            tooltip="Total discontinuation records matching current mentor/grade filter."
          />

          <KpiCard
            id="kpi-total-buckets-analytics"
            title="Total Combined Categorized"
            value={totalZeroCases + totalDiscCases}
            subtext="Across both bucket systems"
            icon={Tag}
            color="indigo"
            trend={{ direction: 'up', value: '100% Categorized' }}
            comparisonBadge={{ label: 'Unified Breakdown', type: 'indigo' }}
            tooltip="Sum of all zero attendance and discontinuation cases in active filter view."
          />
        </div>
      </DashboardWidget>

      {/* 1. ZERO ATTENDANCE BUCKET TABULAR FORM */}
      <DashboardWidget
        id="analytics-zero-att-table"
        title="Zero Attendance Reason Buckets"
        subtitle="Categorization breakdown and total cases count"
        icon={CalendarX}
        headerBg="bg-rose-50/80"
        customControls={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportToCSV('Zero_Attendance_Reason_Buckets', zeroTableData, totalZeroCases)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Export as CSV file"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => exportToImage(zeroTableRef, 'Zero_Attendance_Reason_Buckets')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Download table as PNG image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Download Image</span>
            </button>
          </div>
        }
      >
        <div ref={zeroTableRef} className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-rose-50/70 border-b border-rose-200 text-rose-950 font-bold uppercase text-[11px] tracking-wide">
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4 text-center w-36">Total Cases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {zeroTableData.map((row) => (
                  <tr
                    key={row.category}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      row.count > 0 ? 'bg-white' : 'bg-slate-50/30'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="font-bold text-slate-800 text-xs">{row.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black min-w-[2.5rem] ${
                          row.count > 0
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {row.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-rose-900 text-white font-bold text-xs border-t-2 border-rose-950">
                  <td className="py-3.5 px-4 uppercase tracking-wider text-[11px]">Overall Total</td>
                  <td className="py-3.5 px-4 text-center text-sm font-black text-rose-200">
                    {totalZeroCases}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </DashboardWidget>

      {/* 2. DISCONTINUATION BUCKET TABULAR FORM */}
      <DashboardWidget
        id="analytics-discontinuation-table"
        title="Discontinuation Reason Buckets"
        subtitle="Categorization breakdown and total cases count"
        icon={UserX}
        headerBg="bg-amber-50/80"
        customControls={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportToCSV('Discontinuation_Reason_Buckets', discTableData, totalDiscCases)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-amber-200 text-amber-800 hover:bg-amber-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Export as CSV file"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => exportToImage(discTableRef, 'Discontinuation_Reason_Buckets')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Download table as PNG image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Download Image</span>
            </button>
          </div>
        }
      >
        <div ref={discTableRef} className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-amber-50/70 border-b border-amber-200 text-amber-950 font-bold uppercase text-[11px] tracking-wide">
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4 text-center w-36">Total Cases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {discTableData.map((row) => (
                  <tr
                    key={row.category}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      row.count > 0 ? 'bg-white' : 'bg-slate-50/30'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-bold text-slate-800 text-xs">{row.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black min-w-[2.5rem] ${
                          row.count > 0
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {row.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-amber-900 text-white font-bold text-xs border-t-2 border-amber-950">
                  <td className="py-3.5 px-4 uppercase tracking-wider text-[11px]">Overall Total</td>
                  <td className="py-3.5 px-4 text-center text-sm font-black text-amber-200">
                    {totalDiscCases}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </DashboardWidget>
    </div>
  );
};


