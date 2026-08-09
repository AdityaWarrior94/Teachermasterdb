import React, { useState, useEffect } from 'react';
import {
  StudentSummary,
  FollowupLog,
  ObjectiveRecord,
  SubjectiveRecord,
  AttendanceRecord,
  PremiumActionPlan,
} from '../types';
import {
  BookOpen,
  MessageSquare,
  Calendar,
  Send,
  BarChart3,
  PlusCircle,
  FileText,
  CheckCircle,
  AlertTriangle,
  Award,
  MinusCircle,
  Download,
  Trophy,
  UserCheck,
  TrendingUp,
  TrendingDown,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { StudentReportModal } from './StudentReportModal';
import { SubjectSkillGraph } from './SubjectSkillGraph';
import { PremiumActionPlanModal } from './PremiumActionPlanModal';

interface TabReviewLogProps {
  students: StudentSummary[];
  attendanceRecords?: AttendanceRecord[];
  objectiveRecords: ObjectiveRecord[];
  subjectiveRecords: SubjectiveRecord[];
  logs: FollowupLog[];
  onOpenLogModal: (studentName: string, sourceTab: 'ReviewLog') => void;
  onAddReviewComment: (studentName: string, comment: string) => void;
  reviewCommentsMap: Record<string, { id: string; author: string; text: string; timestamp: string }[]>;
}

export const TabReviewLog: React.FC<TabReviewLogProps> = ({
  students,
  attendanceRecords = [],
  objectiveRecords,
  subjectiveRecords,
  logs,
  onOpenLogModal,
  onAddReviewComment,
  reviewCommentsMap,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedStream, setSelectedStream] = useState<string>('All');
  const [selectedStudent, setSelectedStudent] = useState<string>(students[0]?.studentName || '');
  const [newComment, setNewComment] = useState<string>('');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showActionPlanModal, setShowActionPlanModal] = useState<boolean>(false);
  const [hideRoster, setHideRoster] = useState<boolean>(false);
  const [selectedObjName, setSelectedObjName] = useState<string>('ALL');

  const [actionPlan, setActionPlan] = useState<PremiumActionPlan | null>(null);

  // Extract Grades and Streams
  const grades = Array.from(new Set(students.map((s) => s.grade))).sort();
  const streams = Array.from(new Set(students.map((s) => s.stream))).sort();

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    if (selectedGrade !== 'All' && s.grade !== selectedGrade) return false;
    if (selectedStream !== 'All' && s.stream !== selectedStream) return false;
    return true;
  });

  const activeStudent = filteredStudents.find((s) => s.studentName === selectedStudent) || filteredStudents[0];

  useEffect(() => {
    if (!activeStudent) {
      setActionPlan(null);
      return;
    }
    try {
      const saved = localStorage.getItem(`action_plan_${activeStudent.studentName.trim()}`);
      setActionPlan(saved ? JSON.parse(saved) : null);
    } catch (e) {
      setActionPlan(null);
    }
  }, [activeStudent?.studentName]);

  const handleSavePlan = (plan: PremiumActionPlan) => {
    setActionPlan(plan);
    try {
      localStorage.setItem(`action_plan_${plan.studentName.trim()}`, JSON.stringify(plan));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeStudent) return;
    onAddReviewComment(activeStudent.studentName, newComment.trim());
    setNewComment('');
  };

  const studentAtts = activeStudent
    ? attendanceRecords.filter((a) => a.studentName.trim().toLowerCase() === activeStudent.studentName.trim().toLowerCase())
    : [];

  const studentObjRecords = activeStudent
    ? objectiveRecords.filter((o) => o.studentName.trim().toLowerCase() === activeStudent.studentName.trim().toLowerCase())
    : [];
  const studentObjRecord = studentObjRecords[0] || null;

  const studentSubRecords = activeStudent
    ? subjectiveRecords.filter((s) => s.studentName.trim().toLowerCase() === activeStudent.studentName.trim().toLowerCase())
    : [];

  const commentsList = activeStudent ? reviewCommentsMap[activeStudent.studentName] || [] : [];
  const log = activeStudent ? logs.find((l) => l.studentName.trim() === activeStudent.studentName.trim()) : null;

  // Class Ranks for Active Student
  const peersInClass = activeStudent
    ? students.filter(
        (s) =>
          s.grade === activeStudent.grade &&
          s.section.trim().toLowerCase() === activeStudent.section.trim().toLowerCase()
      )
    : [];
  const effectiveClass = peersInClass.length > 0 ? peersInClass : students;

  const sortedClassByAtt = [...effectiveClass].sort((a, b) => b.attendanceAvg - a.attendanceAvg);
  const attendanceRank = activeStudent
    ? sortedClassByAtt.findIndex(
        (s) => s.studentName.trim().toLowerCase() === activeStudent.studentName.trim().toLowerCase()
      ) + 1 || 1
    : 1;

  const sortedClassByOverall = [...effectiveClass].sort((a, b) => b.overallAvg - a.overallAvg);
  const academicRank = activeStudent
    ? sortedClassByOverall.findIndex(
        (s) => s.studentName.trim().toLowerCase() === activeStudent.studentName.trim().toLowerCase()
      ) + 1 || 1
    : 1;

  // Attendance Trend
  let attendanceTrendLabel = 'Stable';
  let trendDirection: 'up' | 'down' | 'stable' = 'stable';

  if (studentAtts.length >= 2) {
    const firstPct = studentAtts[0].attendancePercentage;
    const lastPct = studentAtts[studentAtts.length - 1].attendancePercentage;
    const diff = lastPct - firstPct;
    if (diff > 0) {
      trendDirection = 'up';
      attendanceTrendLabel = `+${diff}% Improvement (${studentAtts[0].week} → ${studentAtts[studentAtts.length - 1].week})`;
    } else if (diff < 0) {
      trendDirection = 'down';
      attendanceTrendLabel = `${diff}% Drop (${studentAtts[0].week} → ${studentAtts[studentAtts.length - 1].week})`;
    } else {
      trendDirection = 'stable';
      attendanceTrendLabel = `Consistent at ${lastPct}%`;
    }
  }

  // Master list of 8 objective subjects
  const allObjectiveSubjects = [
    { name: 'Physics', val: studentObjRecord?.physics, max: 40 },
    { name: 'Chemistry', val: studentObjRecord?.chemistry, max: 40 },
    { name: 'Mathematics', val: studentObjRecord?.maths, max: 40 },
    { name: 'Zoology', val: studentObjRecord?.zoology, max: 40 },
    { name: 'Botany', val: studentObjRecord?.botany, max: 40 },
    { name: 'Social Studies (SST)', val: studentObjRecord?.sst, max: 40 },
    { name: 'Biology', val: studentObjRecord?.biology, max: 40 },
    { name: 'English', val: studentObjRecord?.english, max: 40 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-slate-900 text-base">Student Academic & Skill Review Log</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Grade Selector */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="font-semibold text-slate-500">Grade:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-700 cursor-pointer"
            >
              <option value="All">All Grades</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>

          {/* Stream Selector */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="font-semibold text-slate-500">Stream:</span>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-700 cursor-pointer"
            >
              <option value="All">All Streams</option>
              {streams.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Hide / Show Roster Toggle Button */}
          <button
            onClick={() => setHideRoster(!hideRoster)}
            className={`px-3 py-1.5 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
              hideRoster
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
            }`}
            title={hideRoster ? 'Show Student List Sidebar' : 'Hide Student List for Full-Width Workspace View'}
          >
            {hideRoster ? <Eye className="w-3.5 h-3.5 text-indigo-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            {hideRoster ? 'Show Student Roster' : 'Hide Roster (Full View)'}
          </button>
        </div>
      </div>

      {/* Main Grid Layout: Student List + Review Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Student Selection Sidebar */}
        {!hideRoster && (
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col max-h-[800px]">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Student Roster ({filteredStudents.length})</span>
              <span className="text-[10px] text-slate-400">Click to Select</span>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
              {filteredStudents.length === 0 ? (
                <p className="p-4 text-xs text-slate-400 italic text-center">No students match filter criteria.</p>
              ) : (
                filteredStudents.map((st) => {
                  const isSelected = activeStudent && activeStudent.studentName === st.studentName;
                  return (
                    <button
                      key={st.studentName}
                      onClick={() => setSelectedStudent(st.studentName)}
                      className={`w-full text-left p-3.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                          : 'hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`font-bold text-xs ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                          {st.studentName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          Gr {st.grade}-{st.section}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                        <span>Batch: {st.batch}</span>
                        <span className="font-semibold text-indigo-600">Avg: {st.overallAvg}%</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Right Column: Student Review Workspace */}
        <div className={`${hideRoster ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6`}>
          {activeStudent ? (
            <>
              {/* Active Student Header Summary & Class Rank Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{activeStudent.studentName}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Grade {activeStudent.grade} - {activeStudent.section}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {activeStudent.stream} ({activeStudent.batch})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Mentor: <strong className="text-slate-800">{activeStudent.mentorName}</strong> | Overall Score Avg:{' '}
                      <strong className="text-indigo-600">{activeStudent.overallAvg}%</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                      Open Full Report (PNG Download)
                    </button>

                    <button
                      onClick={() => onOpenLogModal(activeStudent.studentName, 'ReviewLog')}
                      className="inline-flex items-center px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                      Schedule Doubt / Log Action
                    </button>
                  </div>
                </div>

                {/* Class Rank Badges Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                  <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 flex items-center space-x-2.5">
                    <div className="p-2 bg-amber-500 text-white rounded-lg shadow-2xs">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Academic Rank</span>
                      <span className="text-sm font-black text-indigo-900">
                        #{academicRank} <span className="text-[10px] text-slate-400 font-normal">/ {effectiveClass.length}</span>
                      </span>
                    </div>
                  </div>

                  <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 flex items-center space-x-2.5">
                    <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-2xs">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Attendance Rank</span>
                      <span className="text-sm font-black text-emerald-900">
                        #{attendanceRank} <span className="text-[10px] text-slate-400 font-normal">/ {effectiveClass.length}</span>
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Objective Avg</span>
                    <span className="text-sm font-black text-indigo-700">{activeStudent.objectiveAvg}%</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Subjective Avg</span>
                    <span className="text-sm font-black text-purple-700">{activeStudent.subjectiveAvg}%</span>
                  </div>
                </div>
              </div>

              {/* SECTION 1: Week-Wise Attendance & Trendline */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-slate-900 text-sm">Week-Wise Attendance & Trendline</h4>
                  </div>
                  
                  {studentAtts.length >= 2 && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
                        trendDirection === 'up'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : trendDirection === 'down'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {trendDirection === 'up' ? (
                        <TrendingUp className="w-3 h-3 mr-1 text-emerald-600" />
                      ) : trendDirection === 'down' ? (
                        <TrendingDown className="w-3 h-3 mr-1 text-rose-600" />
                      ) : (
                        <MinusCircle className="w-3 h-3 mr-1 text-slate-500" />
                      )}
                      {attendanceTrendLabel}
                    </span>
                  )}
                </div>

                {/* VISUAL TRENDLINE CHART */}
                {studentAtts.length > 0 && (
                  <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs text-indigo-200 font-semibold mb-1">
                      <span>Attendance Visual Curve</span>
                      <span>Overall Attended: {activeStudent.attendanceAvg}%</span>
                    </div>

                    <div className="relative h-24 w-full">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="attGradientTab" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        <line x1="0" y1="20" x2="500" y2="20" stroke="#334155" strokeDasharray="3 3" />
                        <line x1="0" y1="60" x2="500" y2="60" stroke="#334155" strokeDasharray="3 3" />

                        {(() => {
                          const points = studentAtts.map((att, idx) => {
                            const x = (idx / (studentAtts.length - 1 || 1)) * 460 + 20;
                            const y = 90 - (att.attendancePercentage / 100) * 75;
                            return { x, y, att };
                          });

                          const pathD = points
                            .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
                            .join(' ');

                          const areaD = `${pathD} L ${points[points.length - 1].x} 95 L ${points[0].x} 95 Z`;

                          return (
                            <>
                              <path d={areaD} fill="url(#attGradientTab)" />
                              <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />

                              {points.map((p, i) => (
                                <g key={i}>
                                  <circle cx={p.x} cy={p.y} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                                  <text
                                    x={p.x}
                                    y={p.y - 8}
                                    textAnchor="middle"
                                    fill="#ffffff"
                                    fontSize="10"
                                    fontWeight="bold"
                                  >
                                    {p.att.attendancePercentage}%
                                  </text>
                                  <text
                                    x={p.x}
                                    y="98"
                                    textAnchor="middle"
                                    fill="#94a3b8"
                                    fontSize="9"
                                    fontWeight="500"
                                  >
                                    {p.att.week}
                                  </text>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>
                )}

                {/* Week Cards */}
                {studentAtts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No week-wise attendance data recorded for this student.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {studentAtts.map((att) => {
                      const isNoClass = att.totalClasses === 0 || att.date === '-' || att.week === '-';
                      return (
                        <div
                          key={att.id || att.week}
                          className={`p-2.5 rounded-xl border text-xs flex justify-between items-center ${
                            isNoClass
                              ? 'bg-slate-50 border-slate-200 text-slate-400'
                              : att.attendancePercentage === 0
                              ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                              : att.attendancePercentage >= 75
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                              : 'bg-amber-50/60 border-amber-200 text-amber-900'
                          }`}
                        >
                          <div>
                            <span className="font-bold block">{att.week}</span>
                            <span className="text-[10px] text-slate-500">{att.date}</span>
                          </div>
                          <div className="text-right">
                            {isNoClass ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                No Class
                              </span>
                            ) : (
                              <>
                                <span className="font-black text-xs block">{att.attendancePercentage}%</span>
                                <span className="text-[10px] opacity-80">
                                  {att.totalPresent}/{att.totalClasses} Present
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 2: Objective Test Subject Marks & Attempt Flags grouped by ObjectiveName */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-slate-900 text-sm">Objective Test Subject Marks & Attempt Flags</h4>
                  </div>

                  {studentObjRecords.length > 1 && (
                    <div className="flex items-center space-x-1 text-[11px] bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setSelectedObjName('ALL')}
                        className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                          selectedObjName === 'ALL'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All Tests ({studentObjRecords.length})
                      </button>
                      {studentObjRecords.map((obj) => {
                        const name = obj.objectiveName || 'Objective Test';
                        return (
                          <button
                            key={obj.id}
                            onClick={() => setSelectedObjName(name)}
                            className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                              selectedObjName === name
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {studentObjRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No objective test records found for this student.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {studentObjRecords
                      .filter((obj) =>
                        selectedObjName === 'ALL' ? true : (obj.objectiveName || 'Objective Test') === selectedObjName
                      )
                      .map((obj) => {
                        const subjects = [
                          { name: 'Physics', val: obj.physics, max: 40 },
                          { name: 'Chemistry', val: obj.chemistry, max: 40 },
                          { name: 'Mathematics', val: obj.maths, max: 40 },
                          { name: 'Zoology', val: obj.zoology, max: 40 },
                          { name: 'Botany', val: obj.botany, max: 40 },
                          { name: 'Social Studies (SST)', val: obj.sst, max: 40 },
                          { name: 'Biology', val: obj.biology, max: 40 },
                          { name: 'English', val: obj.english, max: 40 },
                        ];

                        return (
                          <div key={obj.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2 text-xs">
                              <span className="font-black text-slate-900 flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded bg-indigo-600 text-white font-extrabold text-[11px] uppercase tracking-wider">
                                  {obj.objectiveName || 'Objective Test'}
                                </span>
                              </span>
                              <span className="font-bold text-slate-700">
                                Total Score: <span className="text-indigo-700 font-extrabold">{obj.marksAchieved} / {obj.totalMarks}</span> ({obj.testPercentage}%)
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {subjects.map((subj) => {
                                const isNotOpted = subj.val === undefined || subj.val === null || subj.val === '-' || (typeof subj.val === 'number' && subj.val < 0);
                                const score = typeof subj.val === 'number' && subj.val >= 0 ? subj.val : 0;
                                const pct = !isNotOpted ? Math.round((score / subj.max) * 100) : 0;

                                return (
                                  <div
                                    key={subj.name}
                                    className={`p-3 rounded-xl border space-y-1.5 transition-all ${
                                      isNotOpted
                                        ? 'bg-slate-50/80 border-slate-200'
                                        : score === 0
                                        ? 'bg-rose-50/80 border-rose-200/90'
                                        : 'bg-white border-slate-200'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center text-xs">
                                      <span className={`font-bold ${isNotOpted ? 'text-slate-400' : 'text-slate-800'}`}>{subj.name}</span>
                                      {isNotOpted ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                                          <MinusCircle className="w-3 h-3 text-slate-400" />
                                          NOT OPTED
                                        </span>
                                      ) : score === 0 ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                                          <XCircle className="w-3 h-3 text-rose-600" />
                                          NO ATTEMPT
                                        </span>
                                      ) : (
                                        <span className="font-black text-indigo-700">
                                          {score}/{subj.max} ({pct}%)
                                        </span>
                                      )}
                                    </div>

                                    {isNotOpted ? (
                                      <p className="text-[10px] text-slate-400 font-medium italic">
                                        Subject not opted by student.
                                      </p>
                                    ) : score === 0 ? (
                                      <p className="text-[10px] text-rose-600/80 font-medium italic">
                                        Student did not appear or scored 0.
                                      </p>
                                    ) : (
                                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                        <div
                                          className={`h-2 rounded-full transition-all duration-500 ${
                                            pct >= 80
                                              ? 'bg-emerald-500'
                                              : pct >= 60
                                              ? 'bg-indigo-500'
                                              : 'bg-rose-500'
                                          }`}
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Subjective Tests Log */}
                {studentSubRecords.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <h5 className="font-bold text-slate-800 text-xs mb-2">Week-Wise Subjective Test Scores</h5>
                    <div className="flex flex-wrap gap-2">
                      {studentSubRecords.map((sub) => (
                        <div key={sub.id} className="bg-purple-50 text-purple-900 px-3 py-1.5 rounded-lg border border-purple-200 text-xs">
                          <span className="font-bold">{sub.subject}: </span>
                          <span>
                            {sub.marksAchieved} / {sub.totalMarks} ({sub.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: Mentor Followup & Comments Workspace */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1.5 text-indigo-600" />
                    Mentor Review Notes & Log Feed
                  </h4>
                  {log && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Stage: {log.currentStage}
                    </span>
                  )}
                </div>

                {/* Action Log Card if active */}
                {log ? (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center font-bold text-slate-800">
                      <span>Reason: {log.reasonBucket}</span>
                      <span className="text-indigo-600">Mentor: {log.mentorName}</span>
                    </div>
                    {log.scheduledDoubtDate && (
                      <p className="text-emerald-700 font-semibold">
                        Scheduled Doubt Date: {log.scheduledDoubtDate} ({log.scheduledDoubtTopic || 'General'})
                      </p>
                    )}
                    <p className="text-slate-600 italic">"{log.notes}"</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific doubt or action log scheduled yet.</p>
                )}

                {/* Review Comments Feed */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Review Comments Thread ({commentsList.length})
                  </span>

                  {commentsList.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No comments added yet. Add a note below.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {commentsList.map((c) => (
                        <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                            <span className="font-bold text-slate-700">{c.author}</span>
                            <span>{c.timestamp}</span>
                          </div>
                          <p className="text-slate-800 font-medium">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Type mentor review note / comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center transition-all cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Add Note
                    </button>
                  </form>
                </div>
              </div>

              {/* SECTION 4: IQ-Style Subject Skill Radar & Bar Graph */}
              <SubjectSkillGraph
                student={activeStudent}
                objectiveRecords={objectiveRecords}
                subjectiveRecords={subjectiveRecords}
              />

              {/* SECTION 5: Individual Premium Action Plan & Subject Improvements */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        Individual Subject Action Plan & Improvement Strategy
                      </h4>
                      <p className="text-xs text-slate-500">
                        Teacher comments, revised topics, lectures, and target hours per subject
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowActionPlanModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    {actionPlan ? <Edit3 className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                    {actionPlan ? 'Edit Premium Action Plan' : 'Add Subject Action Plan & Comments'}
                  </button>
                </div>

                {actionPlan ? (
                  <div className="bg-gradient-to-br from-indigo-50/70 via-slate-50 to-purple-50/40 p-4 rounded-xl border border-indigo-100 space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-indigo-950 border-b border-indigo-100/80 pb-2">
                      <span className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        Lead Mentor: <strong className="text-slate-900">{actionPlan.teacherName}</strong>
                      </span>
                      <span className="text-[10px] text-slate-500">Last Updated: {actionPlan.updatedAt}</span>
                    </div>

                    {actionPlan.overallRemark && (
                      <div className="bg-white p-3 rounded-xl border border-indigo-100/80 text-xs text-slate-700">
                        <strong className="text-indigo-900 block mb-1 font-bold">Mentor Strategic Review:</strong>
                        <p className="italic">"{actionPlan.overallRemark}"</p>
                      </div>
                    )}

                    {actionPlan.subjects && actionPlan.subjects.length > 0 && (
                      <div className="overflow-x-auto rounded-xl border border-indigo-100 bg-white">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-indigo-50/80 text-indigo-900 font-extrabold text-[10px] uppercase border-b border-indigo-100">
                              <th className="py-2.5 px-3">Subject</th>
                              <th className="py-2.5 px-3">Topic Revised</th>
                              <th className="py-2.5 px-3">Lecture Series</th>
                              <th className="py-2.5 px-3">Subject Improvement Comment</th>
                              <th className="py-2.5 px-3 text-right">Time Spent</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {actionPlan.subjects.map((s, idx) => (
                              <tr key={idx} className="hover:bg-indigo-50/30">
                                <td className="py-2.5 px-3 font-bold text-slate-900">{s.subject}</td>
                                <td className="py-2.5 px-3 text-indigo-900 font-semibold">{s.topicRevised || '-'}</td>
                                <td className="py-2.5 px-3 text-slate-600">{s.lectureRevised || '-'}</td>
                                <td className="py-2.5 px-3 text-slate-800">{s.improvementComment || '-'}</td>
                                <td className="py-2.5 px-3 text-right font-extrabold text-indigo-700">
                                  {s.timeSpentHours ? `${s.timeSpentHours}` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                    <p className="text-xs text-slate-500 font-medium">
                      No individual subject improvement plan created for this student yet.
                    </p>
                    <button
                      onClick={() => setShowActionPlanModal(true)}
                      className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
                      Add Subject Action Plan & Improvement Comments
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
              Select a student from the left panel to review skills and logs.
            </div>
          )}
        </div>
      </div>

      {/* Render Student Report Modal when requested */}
      {showReportModal && activeStudent && (
        <StudentReportModal
          student={activeStudent}
          allStudents={students}
          attendanceRecords={attendanceRecords}
          objectiveRecords={objectiveRecords}
          subjectiveRecords={subjectiveRecords}
          log={log || undefined}
          reviewComments={commentsList}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Render Premium Action Plan Modal */}
      {showActionPlanModal && activeStudent && (
        <PremiumActionPlanModal
          student={activeStudent}
          existingPlan={actionPlan}
          onSavePlan={handleSavePlan}
          onClose={() => setShowActionPlanModal(false)}
        />
      )}
    </div>
  );
};
