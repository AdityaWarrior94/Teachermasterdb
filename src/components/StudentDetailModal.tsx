import React, { useState } from 'react';
import { StudentSummary, AttendanceRecord, ObjectiveRecord, SubjectiveRecord, FollowupLog } from '../types';
import {
  X,
  Calendar,
  BookOpen,
  BarChart2,
  Trophy,
  UserCheck,
  FileText,
  XCircle,
  TrendingUp,
  TrendingDown,
  MinusCircle,
} from 'lucide-react';
import { StudentReportModal } from './StudentReportModal';

interface StudentDetailModalProps {
  student: StudentSummary;
  allStudents?: StudentSummary[];
  attendanceRecords: AttendanceRecord[];
  objectiveRecords: ObjectiveRecord[];
  subjectiveRecords: SubjectiveRecord[];
  log?: FollowupLog;
  onClose: () => void;
  onOpenLogModal: (studentName: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  allStudents = [],
  attendanceRecords,
  objectiveRecords,
  subjectiveRecords,
  log,
  onClose,
  onOpenLogModal,
}) => {
  const [showReportModal, setShowReportModal] = useState(false);

  const studentAtts = attendanceRecords.filter((a) => a.studentName.trim().toLowerCase() === student.studentName.trim().toLowerCase());
  const studentObjs = objectiveRecords.filter((o) => o.studentName.trim().toLowerCase() === student.studentName.trim().toLowerCase());
  const studentObj = studentObjs[0] || null;
  const studentSubs = subjectiveRecords.filter((s) => s.studentName.trim().toLowerCase() === student.studentName.trim().toLowerCase());

  const [selectedObjectiveName, setSelectedObjectiveName] = useState<string>('ALL');

  // Ranks
  const peersInClass = allStudents.filter(
    (s) =>
      s.grade === student.grade &&
      s.section.trim().toLowerCase() === student.section.trim().toLowerCase()
  );
  const effectiveClass = peersInClass.length > 0 ? peersInClass : allStudents;

  const sortedClassByAtt = [...effectiveClass].sort((a, b) => b.attendanceAvg - a.attendanceAvg);
  const attendanceRank =
    sortedClassByAtt.findIndex(
      (s) => s.studentName.trim().toLowerCase() === student.studentName.trim().toLowerCase()
    ) + 1 || 1;

  const sortedClassByOverall = [...effectiveClass].sort((a, b) => b.overallAvg - a.overallAvg);
  const academicRank =
    sortedClassByOverall.findIndex(
      (s) => s.studentName.trim().toLowerCase() === student.studentName.trim().toLowerCase()
    ) + 1 || 1;

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
    { name: 'Physics', val: studentObj?.physics, max: 40 },
    { name: 'Chemistry', val: studentObj?.chemistry, max: 40 },
    { name: 'Mathematics', val: studentObj?.maths, max: 40 },
    { name: 'Zoology', val: studentObj?.zoology, max: 40 },
    { name: 'Botany', val: studentObj?.botany, max: 40 },
    { name: 'Social Studies (SST)', val: studentObj?.sst, max: 40 },
    { name: 'Biology', val: studentObj?.biology, max: 40 },
    { name: 'English', val: studentObj?.english, max: 40 },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">{student.studentName}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Gr {student.grade}-{student.section}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Stream: {student.stream} | Batch: {student.batch} | Mentor: <strong className="text-white">{student.mentorName}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700">
            {/* Key Metric Averages & Ranks Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-center">
                <p className="text-[10px] text-amber-800 font-bold uppercase flex items-center justify-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-600" />
                  Academic Rank
                </p>
                <p className="text-lg font-black text-amber-950 mt-0.5">
                  #{academicRank} <span className="text-xs text-slate-400 font-normal">/ {effectiveClass.length}</span>
                </p>
              </div>

              <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-center">
                <p className="text-[10px] text-emerald-800 font-bold uppercase flex items-center justify-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  Attendance Rank
                </p>
                <p className="text-lg font-black text-emerald-950 mt-0.5">
                  #{attendanceRank} <span className="text-xs text-slate-400 font-normal">/ {effectiveClass.length}</span>
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Attendance Avg</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{student.attendanceAvg}%</p>
              </div>

              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 text-center">
                <p className="text-[10px] text-indigo-600 font-bold uppercase">Overall Average</p>
                <p className="text-lg font-extrabold text-indigo-900 mt-0.5">{student.overallAvg}%</p>
              </div>
            </div>

            {/* Weekly Attendance History & Visual Trendline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  Weekly Attendance Records & Trend
                </h4>

                {studentAtts.length >= 2 && (
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    Trend: {attendanceTrendLabel}
                  </span>
                )}
              </div>

              {studentAtts.length > 0 && (
                <div className="bg-slate-900 text-white p-3 rounded-xl">
                  <div className="h-20 w-full relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 80" preserveAspectRatio="none">
                      {(() => {
                        const points = studentAtts.map((att, idx) => {
                          const x = (idx / (studentAtts.length - 1 || 1)) * 460 + 20;
                          const y = 70 - (att.attendancePercentage / 100) * 55;
                          return { x, y, att };
                        });

                        const pathD = points
                          .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
                          .join(' ');

                        return (
                          <>
                            <path d={pathD} fill="none" stroke="#818cf8" strokeWidth="2.5" />
                            {points.map((p, i) => (
                              <g key={i}>
                                <circle cx={p.x} cy={p.y} r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                                <text x={p.x} y={p.y - 7} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                                  {p.att.attendancePercentage}%
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {studentAtts.map((att, idx) => {
                  const isNoClass = att.totalClasses === 0 || att.date === '-' || att.week === '-';
                  return (
                    <div
                      key={att.id ? `${att.id}-${idx}` : `att-${idx}`}
                      className={`p-2.5 rounded-lg border text-xs flex justify-between items-center ${
                        isNoClass
                          ? 'bg-slate-50 border-slate-200 text-slate-400'
                          : att.attendancePercentage === 0
                          ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <span>
                        {att.week} ({att.date}):
                      </span>
                      {isNoClass ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                          <MinusCircle className="w-3 h-3 text-slate-400" />
                          NO CLASS
                        </span>
                      ) : (
                        <span>
                          {att.totalPresent}/{att.totalClasses} classes ({att.attendancePercentage}%)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Objective Test Subject Marks with "NOT OPTED" Flags grouped by ObjectiveName */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center">
                  <BarChart2 className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  Objective Test Subject Marks & Attempt Flags
                </h4>

                {/* ObjectiveName selector tabs */}
                {studentObjs.length > 1 && (
                  <div className="flex items-center space-x-1 text-[11px] bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setSelectedObjectiveName('ALL')}
                      className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                        selectedObjectiveName === 'ALL'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All Tests ({studentObjs.length})
                    </button>
                    {studentObjs.map((obj) => {
                      const name = obj.objectiveName || 'Objective Test';
                      return (
                        <button
                          key={obj.id}
                          onClick={() => setSelectedObjectiveName(name)}
                          className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                            selectedObjectiveName === name
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

              {studentObjs.length === 0 ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 italic text-xs">
                  No objective test records available for this student.
                </div>
              ) : (
                <div className="space-y-4">
                  {studentObjs
                    .filter((obj) =>
                      selectedObjectiveName === 'ALL' ? true : (obj.objectiveName || 'Objective Test') === selectedObjectiveName
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
                        <div key={obj.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                          <div className="flex justify-between items-center border-b border-slate-200 pb-1.5 text-xs">
                            <span className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] uppercase font-black">
                                {obj.objectiveName || 'Objective Test'}
                              </span>
                            </span>
                            <span className="font-bold text-slate-700">
                              Score: <span className="text-indigo-700">{obj.marksAchieved} / {obj.totalMarks}</span> ({obj.testPercentage}%)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {subjects.map((subj) => {
                              const isNotOpted = subj.val === undefined || subj.val === null || subj.val === '-' || (typeof subj.val === 'number' && subj.val < 0);
                              const score = typeof subj.val === 'number' && subj.val >= 0 ? subj.val : 0;
                              const pct = !isNotOpted ? Math.round((score / subj.max) * 100) : 0;

                              return (
                                <div
                                  key={subj.name}
                                  className={`p-2 rounded-lg border flex justify-between items-center ${
                                    isNotOpted
                                      ? 'bg-slate-50/80 border-slate-200 text-slate-400'
                                      : score === 0
                                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                                      : 'bg-white border-slate-200'
                                  }`}
                                >
                                  <span className={`font-medium ${isNotOpted ? 'text-slate-400' : 'text-slate-800'}`}>
                                    {subj.name}
                                  </span>
                                  {isNotOpted ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                                      <MinusCircle className="w-3 h-3 text-slate-400" />
                                      NOT OPTED
                                    </span>
                                  ) : score === 0 ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                                      <XCircle className="w-3 h-3 text-rose-600" />
                                      NO ATTEMPT (0/{subj.max})
                                    </span>
                                  ) : (
                                    <strong className="text-indigo-900 font-black">
                                      {score}/{subj.max} ({pct}%)
                                    </strong>
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
            </div>

            {/* Subjective Test Records */}
            {studentSubs.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  Subjective Tests History
                </h4>
                <div className="space-y-1.5">
                  {studentSubs.map((sub) => (
                    <div key={sub.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">{sub.subject}</span>
                      <span className="font-bold text-indigo-700">
                        {sub.marksAchieved} / {sub.totalMarks} ({sub.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discontinuation details if any */}
            {student.discontinuationDetails && (
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-1.5 text-xs text-rose-900">
                <h4 className="font-bold uppercase tracking-wider text-rose-700 text-[11px]">
                  Discontinuation Status: Discontinued
                </h4>
                <p>Reason Comment: "{student.discontinuationDetails.comment}"</p>
                <p>Mentor Remarks: {student.discontinuationDetails.mentorComments}</p>
              </div>
            )}

            {/* Action Log Status */}
            {log && (
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 space-y-1.5 text-xs text-indigo-900">
                <div className="flex justify-between items-center font-bold">
                  <span>Followup Action Stage: {log.currentStage}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-200 text-indigo-900">{log.reasonBucket}</span>
                </div>
                {log.scheduledDoubtDate && (
                  <p className="text-emerald-700 font-semibold">
                    Scheduled Doubt Session: {log.scheduledDoubtDate} ({log.scheduledDoubtTopic || 'General'})
                  </p>
                )}
                <p className="italic text-slate-700">"{log.notes}"</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap justify-between items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer inline-flex items-center"
              >
                <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                Full Report & Image Download
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenLogModal(student.studentName);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Log Action / Schedule Doubt
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReportModal && (
        <StudentReportModal
          student={student}
          allStudents={allStudents}
          attendanceRecords={attendanceRecords}
          objectiveRecords={objectiveRecords}
          subjectiveRecords={subjectiveRecords}
          log={log}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
};
