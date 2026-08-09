import React, { useRef, useState } from 'react';
import { StudentSummary, AttendanceRecord, ObjectiveRecord, SubjectiveRecord, FollowupLog, PremiumActionPlan } from '../types';
import {
  X,
  Download,
  Calendar,
  BarChart2,
  BookOpen,
  Award,
  CheckCircle,
  AlertTriangle,
  MinusCircle,
  Check,
  FileText,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  UserCheck,
  XCircle,
  Printer,
  PlusCircle,
  Edit3,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { SubjectSkillGraph } from './SubjectSkillGraph';
import { PremiumActionPlanModal } from './PremiumActionPlanModal';

interface StudentReportModalProps {
  student: StudentSummary;
  allStudents?: StudentSummary[];
  attendanceRecords: AttendanceRecord[];
  objectiveRecords: ObjectiveRecord[];
  subjectiveRecords: SubjectiveRecord[];
  log?: FollowupLog;
  reviewComments?: { id: string; author: string; text: string; timestamp: string }[];
  onClose: () => void;
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({
  student,
  allStudents = [],
  attendanceRecords,
  objectiveRecords,
  subjectiveRecords,
  log,
  reviewComments = [],
  onClose,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [selectedObjName, setSelectedObjName] = useState<string>('ALL');
  const [showActionPlanModal, setShowActionPlanModal] = useState<boolean>(false);
  const [actionPlan, setActionPlan] = useState<PremiumActionPlan | null>(() => {
    try {
      const saved = localStorage.getItem(`action_plan_${student.studentName.trim()}`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleSavePlan = (plan: PremiumActionPlan) => {
    setActionPlan(plan);
    try {
      localStorage.setItem(`action_plan_${student.studentName.trim()}`, JSON.stringify(plan));
    } catch (e) {
      console.error(e);
    }
  };

  // Filter student specific records
  const studentAtts = attendanceRecords.filter(
    (a) => a.studentName.trim().toLowerCase() === student.studentName.trim().toLowerCase()
  );

  const studentObjRecords = objectiveRecords.filter(
    (o) => o.studentName.trim().toLowerCase() === student.studentName.trim().toLowerCase()
  );

  const studentObjRecord = studentObjRecords[0] || null;

  const studentSubRecords = subjectiveRecords.filter(
    (s) => s.studentName.trim().toLowerCase() === student.studentName.trim().toLowerCase()
  );

  // Class & Batch Ranks calculation
  const peersInClass = allStudents.filter(
    (s) =>
      s.grade === student.grade &&
      s.section.trim().toLowerCase() === student.section.trim().toLowerCase()
  );
  const effectiveClass = peersInClass.length > 0 ? peersInClass : allStudents;

  // Sorted by Attendance
  const sortedClassByAtt = [...effectiveClass].sort((a, b) => b.attendanceAvg - a.attendanceAvg);
  const attendanceRank =
    sortedClassByAtt.findIndex(
      (s) => s.studentName.trim().toLowerCase() === student.studentName.trim().toLowerCase()
    ) + 1 || 1;

  // Sorted by Academic Overall
  const sortedClassByOverall = [...effectiveClass].sort((a, b) => b.overallAvg - a.overallAvg);
  const academicRank =
    sortedClassByOverall.findIndex(
      (s) => s.studentName.trim().toLowerCase() === student.studentName.trim().toLowerCase()
    ) + 1 || 1;

  // Master list of potential subjects
  const allPossibleSubjects = [
    { key: 'physics', label: 'Physics', val: studentObjRecord?.physics, max: 40 },
    { key: 'chemistry', label: 'Chemistry', val: studentObjRecord?.chemistry, max: 40 },
    { key: 'maths', label: 'Mathematics', val: studentObjRecord?.maths, max: 40 },
    { key: 'zoology', label: 'Zoology', val: studentObjRecord?.zoology, max: 40 },
    { key: 'botany', label: 'Botany', val: studentObjRecord?.botany, max: 40 },
    { key: 'sst', label: 'Social Studies (SST)', val: studentObjRecord?.sst, max: 40 },
    { key: 'biology', label: 'Biology', val: studentObjRecord?.biology, max: 40 },
    { key: 'english', label: 'English', val: studentObjRecord?.english, max: 40 },
  ];

  // Categorize subjects: Strong (>=80%), Intermediate (60-79%), Weak (<60%), Untouched/No Attempt (0 marks for opted subjects)
  const strongSubjects: { label: string; score: number; max: number; pct: number }[] = [];
  const intermediateSubjects: { label: string; score: number; max: number; pct: number }[] = [];
  const weakSubjects: { label: string; score: number; max: number; pct: number }[] = [];
  const untouchedSubjects: { label: string }[] = [];
  const notOptedSubjects: { label: string }[] = [];

  allPossibleSubjects.forEach((subj) => {
    const isNotOpted =
      subj.val === null ||
      subj.val === undefined ||
      subj.val === '-' ||
      (typeof subj.val === 'number' && subj.val < 0);

    if (isNotOpted) {
      notOptedSubjects.push({ label: subj.label });
    } else {
      const score = typeof subj.val === 'number' && !isNaN(subj.val) ? subj.val : 0;
      const maxVal = typeof subj.max === 'number' && subj.max > 0 ? subj.max : 40;
      const rawPct = Math.round((score / maxVal) * 100);
      const pct = isNaN(rawPct) ? 0 : rawPct;
      const item = { label: subj.label, score, max: maxVal, pct };

      if (score === 0) {
        untouchedSubjects.push({ label: subj.label });
      } else if (pct >= 80) {
        strongSubjects.push(item);
      } else if (pct >= 60) {
        intermediateSubjects.push(item);
      } else {
        weakSubjects.push(item);
      }
    }
  });

  // Calculate Overall Attendance Avg
  const totalClassesAttended = studentAtts.reduce((acc, curr) => acc + (typeof curr.totalPresent === 'number' && !isNaN(curr.totalPresent) ? curr.totalPresent : 0), 0);
  const totalClassesHeld = studentAtts.reduce((acc, curr) => acc + (typeof curr.totalClasses === 'number' && !isNaN(curr.totalClasses) ? curr.totalClasses : 0), 0);
  const fallbackAttAvg = typeof student.attendanceAvg === 'number' && !isNaN(student.attendanceAvg) ? student.attendanceAvg : 0;
  const rawCalculatedAttPct = totalClassesHeld > 0 ? Math.round((totalClassesAttended / totalClassesHeld) * 100) : fallbackAttAvg;
  const calculatedAttPct = isNaN(rawCalculatedAttPct) ? 0 : rawCalculatedAttPct;

  // Attendance Trend Calculation
  let attendanceTrendLabel = 'Stable';
  let trendDirection: 'up' | 'down' | 'stable' = 'stable';
  let trendDelta = 0;

  if (studentAtts.length >= 2) {
    const firstPct = typeof studentAtts[0].attendancePercentage === 'number' && !isNaN(studentAtts[0].attendancePercentage) ? studentAtts[0].attendancePercentage : 0;
    const lastPct = typeof studentAtts[studentAtts.length - 1].attendancePercentage === 'number' && !isNaN(studentAtts[studentAtts.length - 1].attendancePercentage) ? studentAtts[studentAtts.length - 1].attendancePercentage : 0;
    const rawDelta = Math.round(lastPct - firstPct);
    trendDelta = isNaN(rawDelta) ? 0 : rawDelta;
    if (trendDelta > 0) {
      trendDirection = 'up';
      attendanceTrendLabel = `+${trendDelta}% Improvement (${studentAtts[0].week} → ${studentAtts[studentAtts.length - 1].week})`;
    } else if (trendDelta < 0) {
      trendDirection = 'down';
      attendanceTrendLabel = `${trendDelta}% Drop (${studentAtts[0].week} → ${studentAtts[studentAtts.length - 1].week})`;
    } else {
      trendDirection = 'stable';
      attendanceTrendLabel = `Consistent at ${lastPct}%`;
    }
  }

  // Helper to convert oklch/oklab/color() CSS expressions to standard rgb/rgba using canvas 2D pixel extraction
  const convertCssColorToRgba = (colorFuncStr: string): string => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return 'rgb(99, 102, 241)';
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = 'rgb(99, 102, 241)';
      ctx.fillStyle = colorFuncStr;
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      const alpha = parseFloat((data[3] / 255).toFixed(3));
      if (alpha === 1) {
        return `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
      }
      return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${alpha})`;
    } catch (e) {
      return 'rgb(99, 102, 241)';
    }
  };

  const sanitizeAllOklchInString = (str: string): string => {
    if (!str || (!str.includes('oklch') && !str.includes('oklab') && !str.includes('color('))) {
      return str;
    }
    return str.replace(/(?:oklch|oklab|color)\([^)]+\)/gi, (match) => convertCssColorToRgba(match));
  };

  // Common canvas generator for PNG and PDF rendering with OKLCH sanitization
  const generateReportCanvas = async () => {
    if (!reportRef.current) return null;
    return await html2canvas(reportRef.current, {
      scale: 2, // High DPI resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // 1. Sanitize style tags
        clonedDoc.querySelectorAll('style').forEach((styleEl) => {
          if (styleEl.textContent) {
            styleEl.textContent = sanitizeAllOklchInString(styleEl.textContent);
          }
        });

        // 2. Sanitize stylesheets
        try {
          Array.from(clonedDoc.styleSheets).forEach((sheet) => {
            try {
              const rules = sheet.cssRules || sheet.rules;
              if (rules) {
                Array.from(rules).forEach((rule) => {
                  if (
                    rule.cssText &&
                    (rule.cssText.includes('oklch') || rule.cssText.includes('oklab') || rule.cssText.includes('color('))
                  ) {
                    const styleRule = rule as CSSStyleRule;
                    if (styleRule.style && styleRule.style.cssText) {
                      styleRule.style.cssText = sanitizeAllOklchInString(styleRule.style.cssText);
                    }
                  }
                });
              }
            } catch (e) {
              // Ignore cross-origin sheet errors
            }
          });
        } catch (e) {
          // ignore
        }

        // 3. Process element and children
        const clonedEl = clonedDoc.getElementById('student-report-printable-card');
        if (clonedEl) {
          clonedEl.style.maxHeight = 'none';
          clonedEl.style.height = 'auto';
          clonedEl.style.overflow = 'visible';
          clonedEl.style.transform = 'none';

          const allEls = [clonedEl, ...Array.from(clonedEl.querySelectorAll<HTMLElement>('*'))];
          const colorProps = [
            'color',
            'background-color',
            'border-color',
            'border-top-color',
            'border-right-color',
            'border-bottom-color',
            'border-left-color',
            'fill',
            'stroke',
            'box-shadow',
            'outline-color',
            'background-image',
          ];

          allEls.forEach((el) => {
            const inlineStyle = el.getAttribute('style');
            if (inlineStyle) {
              el.setAttribute('style', sanitizeAllOklchInString(inlineStyle));
            }

            try {
              const comp = window.getComputedStyle(el);
              colorProps.forEach((prop) => {
                const val = comp.getPropertyValue(prop);
                if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('color('))) {
                  el.style.setProperty(prop, sanitizeAllOklchInString(val), 'important');
                }
              });
            } catch (e) {
              // ignore
            }
          });
        }
      },
    });
  };

  // Direct PDF Download Handler
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const canvas = await generateReportCanvas();
      if (!canvas) return;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Add extra pages if report spans beyond single page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const cleanName = student.studentName.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`${cleanName}_Academic_Performance_Report.pdf`);

      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating report PDF:', err);
      alert('Could not generate PDF automatically. You can click "Print / Save PDF" as browser fallback.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Handle Image Download using html2canvas
  const handleDownloadImage = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await generateReportCanvas();
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const cleanName = student.studentName.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `${cleanName}_Academic_Performance_Report.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating report image:', err);
      alert('Could not generate PNG automatically. Click "Print" to save as PDF or PNG.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-sm sm:text-base tracking-wide">
              Student Comprehensive Evaluation Report
            </h3>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf || isDownloading}
              className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                pdfSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
              }`}
            >
              {isDownloadingPdf ? (
                <>
                  <Clock className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Generating PDF...
                </>
              ) : pdfSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Downloaded PDF!
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Download PDF
                </>
              )}
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isDownloading || isDownloadingPdf}
              className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95'
              }`}
            >
              {isDownloading ? (
                <>
                  <Clock className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  PNG...
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  PNG Ready!
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download PNG
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Print
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div
            ref={reportRef}
            id="student-report-printable-card"
            className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md space-y-6 max-w-3xl mx-auto text-slate-800"
          >
            {/* Header Banner inside Report */}
            <div className="border-b-2 border-indigo-600 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-extrabold text-[10px] uppercase tracking-wider">
                    Official Student Evaluation Form
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Date: {new Date().toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 mt-1">{student.studentName}</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Grade <strong>{student.grade}</strong> | Section <strong>{student.section}</strong>{' '}
                  | Stream <strong>{student.stream}</strong> | Batch <strong>{student.batch}</strong>
                </p>
                <p className="text-xs text-slate-500">
                  Assigned Mentor: <strong className="text-indigo-900">{student.mentorName}</strong>
                </p>
              </div>

              {/* Overall Grade Card */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 rounded-xl text-center shadow-sm shrink-0 min-w-[150px]">
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                  Overall Academic Avg
                </p>
                <p className="text-3xl font-black text-white mt-0.5">{typeof student.overallAvg === 'number' && !isNaN(student.overallAvg) ? student.overallAvg : 0}%</p>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full inline-block mt-1 font-semibold">
                  Composite Score Index
                </span>
              </div>
            </div>

            {/* CLASS RANK & STANDING STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-900/5 p-3.5 rounded-2xl border border-indigo-100 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  Academic Class Rank
                </span>
                <p className="text-xl font-black text-indigo-900 mt-0.5">
                  #{academicRank} <span className="text-xs font-semibold text-slate-400">/ {effectiveClass.length}</span>
                </p>
                <span className="text-[9px] text-slate-500 block mt-0.5">Grade {student.grade}-{student.section}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  Attendance Class Rank
                </span>
                <p className="text-xl font-black text-emerald-700 mt-0.5">
                  #{attendanceRank} <span className="text-xs font-semibold text-slate-400">/ {effectiveClass.length}</span>
                </p>
                <span className="text-[9px] text-slate-500 block mt-0.5">Grade {student.grade}-{student.section}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Objective Test Avg
                </span>
                <p className="text-xl font-black text-indigo-600 mt-0.5">{typeof student.objectiveAvg === 'number' && !isNaN(student.objectiveAvg) ? student.objectiveAvg : 0}%</p>
                <span className="text-[9px] text-slate-500 block mt-0.5">Multiple Choice</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Subjective Test Avg
                </span>
                <p className="text-xl font-black text-purple-600 mt-0.5">{typeof student.subjectiveAvg === 'number' && !isNaN(student.subjectiveAvg) ? student.subjectiveAvg : 0}%</p>
                <span className="text-[9px] text-slate-500 block mt-0.5">Descriptive Theory</span>
              </div>
            </div>

            {/* SECTION 1: Week-Wise Attendance & Attendance Trendline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
                    1. Week-Wise Attendance Breakdown & Trendline
                  </h3>
                </div>

                {studentAtts.length >= 2 && (
                  <div
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      trendDirection === 'up'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : trendDirection === 'down'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {trendDirection === 'up' ? (
                      <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    ) : trendDirection === 'down' ? (
                      <TrendingDown className="w-3.5 h-3.5 mr-1 text-rose-600" />
                    ) : (
                      <MinusCircle className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    )}
                    <span>Trend: {attendanceTrendLabel}</span>
                  </div>
                )}
              </div>

              {/* VISUAL TRENDLINE CHART */}
              {studentAtts.length > 0 && (
                <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs text-indigo-200 font-semibold mb-1">
                    <span>Attendance Performance Visual Curve</span>
                    <span>Average Attendance: {calculatedAttPct}%</span>
                  </div>

                  <div className="relative h-28 w-full">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="attGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      <line x1="0" y1="20" x2="500" y2="20" stroke="#334155" strokeDasharray="3 3" />
                      <line x1="0" y1="60" x2="500" y2="60" stroke="#334155" strokeDasharray="3 3" />

                      {/* Plot line */}
                      {(() => {
                        const points = studentAtts.map((att, idx) => {
                          const pct = typeof att.attendancePercentage === 'number' && !isNaN(att.attendancePercentage) ? att.attendancePercentage : 0;
                          const rawX = (idx / (studentAtts.length - 1 || 1)) * 460 + 20;
                          const x = isNaN(rawX) ? 20 : rawX;
                          const rawY = 90 - (pct / 100) * 75;
                          const y = isNaN(rawY) ? 90 : rawY;
                          return { x, y, att, pct };
                        });

                        const pathD = points
                          .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
                          .join(' ');

                        const areaD = `${pathD} L ${points[points.length - 1].x} 95 L ${points[0].x} 95 Z`;

                        return (
                          <>
                            <path d={areaD} fill="url(#attGradient)" />
                            <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />

                            {points.map((p, i) => (
                              <g key={i}>
                                <circle cx={p.x} cy={p.y} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                                <text
                                  x={p.x}
                                  y={p.y - 9}
                                  textAnchor="middle"
                                  fill="#ffffff"
                                  fontSize="10"
                                  fontWeight="bold"
                                >
                                  {p.pct}%
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

              {/* Attendance Table */}
              {studentAtts.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No attendance records logged for this student.
                </p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-600 font-bold text-[10px] uppercase border-b border-slate-200">
                        <th className="py-2 px-3">Week</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3 text-center">Classes Attended</th>
                        <th className="py-2 px-3 text-center">Attendance %</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {studentAtts.map((att) => {
                        const isNoClass = att.totalClasses === 0 || att.date === '-' || att.week === '-';
                        return (
                          <tr key={att.id || att.week} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">{att.week}</td>
                            <td className="py-2 px-3 text-slate-500">{att.date}</td>
                            <td className="py-2 px-3 text-center">
                              {isNoClass ? '-' : `${att.totalPresent} / ${att.totalClasses}`}
                            </td>
                            <td className="py-2 px-3 text-center font-bold">
                              {isNoClass ? (
                                <span className="text-slate-400">N/A</span>
                              ) : (
                                <span
                                  className={
                                    att.attendancePercentage >= 75
                                      ? 'text-emerald-600'
                                      : att.attendancePercentage > 0
                                      ? 'text-amber-600'
                                      : 'text-rose-600'
                                  }
                                >
                                  {att.attendancePercentage}%
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {isNoClass ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                  No Class
                                </span>
                              ) : (
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    att.attendancePercentage >= 75
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : att.attendancePercentage > 0
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {att.attendancePercentage >= 75
                                    ? 'Optimal'
                                    : att.attendancePercentage > 0
                                    ? 'Attention Needed'
                                    : 'Zero Attendance'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SECTION 2: Objective Test Subject Marks & Attempt Status grouped by ObjectiveName */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                <div className="flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
                    2. Objective Test Subject Marks & Attempt Status
                  </h3>
                </div>

                {/* Filter tabs by ObjectiveName */}
                {studentObjRecords.length > 1 && (
                  <div className="flex items-center space-x-1 text-[11px] bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setSelectedObjName('ALL')}
                      className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
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
                          className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
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
                  No objective test marks recorded for this student.
                </p>
              ) : (
                <div className="space-y-4">
                  {studentObjRecords
                    .filter((obj) =>
                      selectedObjName === 'ALL' ? true : (obj.objectiveName || 'Objective Test') === selectedObjName
                    )
                    .map((obj) => {
                      const subjects = [
                        { key: 'physics', label: 'Physics', val: obj.physics, max: 40 },
                        { key: 'chemistry', label: 'Chemistry', val: obj.chemistry, max: 40 },
                        { key: 'maths', label: 'Mathematics', val: obj.maths, max: 40 },
                        { key: 'zoology', label: 'Zoology', val: obj.zoology, max: 40 },
                        { key: 'botany', label: 'Botany', val: obj.botany, max: 40 },
                        { key: 'sst', label: 'Social Studies (SST)', val: obj.sst, max: 40 },
                        { key: 'biology', label: 'Biology', val: obj.biology, max: 40 },
                        { key: 'english', label: 'English', val: obj.english, max: 40 },
                      ];

                      return (
                        <div key={obj.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-3">
                          <div className="flex justify-between items-center border-b border-slate-200 pb-2 text-xs">
                            <span className="font-black text-slate-900 flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded bg-indigo-600 text-white font-extrabold text-[11px] uppercase tracking-wider">
                                {obj.objectiveName || 'Objective Test'}
                              </span>
                            </span>
                            <span className="font-extrabold text-slate-800 text-xs">
                              Score: <span className="text-indigo-700">{obj.marksAchieved} / {obj.totalMarks}</span> ({obj.testPercentage}%)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {subjects.map((subj) => {
                              const isNotOpted = subj.val === null || subj.val === undefined || subj.val === '-' || (typeof subj.val === 'number' && subj.val < 0);
                              const score = typeof subj.val === 'number' && subj.val >= 0 ? subj.val : 0;
                              const pct = !isNotOpted ? Math.round((score / subj.max) * 100) : 0;

                              return (
                                <div
                                  key={subj.key}
                                  className={`p-2.5 rounded-xl border space-y-1.5 transition-all ${
                                    isNotOpted
                                      ? 'bg-slate-50/80 border-slate-200'
                                      : score === 0
                                      ? 'bg-rose-50/80 border-rose-200/90'
                                      : 'bg-white border-slate-200'
                                  }`}
                                >
                                  <div className="flex justify-between items-center text-xs">
                                    <span className={`font-bold ${isNotOpted ? 'text-slate-400' : 'text-slate-800'}`}>{subj.label}</span>

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
                                        {score} / {subj.max} ({pct}%)
                                      </span>
                                    )}
                                  </div>

                                  {isNotOpted ? (
                                    <p className="text-[10px] text-slate-400 font-medium italic">
                                      Subject not opted by student.
                                    </p>
                                  ) : score === 0 ? (
                                    <p className="text-[10px] text-rose-600/80 font-medium italic">
                                      Student did not appear or scored 0 in test.
                                    </p>
                                  ) : (
                                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                      <div
                                        className={`h-2 rounded-full transition-all ${
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
            </div>

            {/* SECTION 3: Week-Wise Subjective Test Marks */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
                  3. Week-Wise Subjective Test Evaluation
                </h3>
              </div>

              {studentSubRecords.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No subjective test scores recorded for this student.
                </p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-600 font-bold text-[10px] uppercase border-b border-slate-200">
                        <th className="py-2 px-3">Subject</th>
                        <th className="py-2 px-3">Test Date / Week</th>
                        <th className="py-2 px-3 text-center">Marks Achieved</th>
                        <th className="py-2 px-3 text-center">Percentage</th>
                        <th className="py-2 px-3 text-right">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {studentSubRecords.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-900">{sub.subject}</td>
                          <td className="py-2 px-3 text-slate-500">{sub.date || 'Week 1'}</td>
                          <td className="py-2 px-3 text-center">
                            {sub.marksAchieved} / {sub.totalMarks}
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-purple-700">
                            {sub.percentage}%
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                sub.percentage >= 80
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : sub.percentage >= 60
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {sub.percentage >= 80
                                ? 'Excellent'
                                : sub.percentage >= 60
                                ? 'Satisfactory'
                                : 'Needs Improvement'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SECTION 4: Subject Skill Categorization Pointers */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
                  4. Subject Mastery Categorization (Skill Analysis)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Strong Subjects */}
                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Strong Subjects (≥ 80%)</span>
                    <span className="ml-auto bg-emerald-200 text-emerald-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {strongSubjects.length}
                    </span>
                  </div>
                  {strongSubjects.length === 0 ? (
                    <p className="text-[11px] text-emerald-700/70 italic">None logged above 80%</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {strongSubjects.map((s) => (
                        <span
                          key={s.label}
                          className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-900 border border-emerald-300 shadow-2xs"
                        >
                          {s.label}: <strong>{s.pct}%</strong> ({s.score}/{s.max})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Intermediate Subjects */}
                <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-200 space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-800 font-extrabold text-xs">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>Intermediate Subjects (60% - 79%)</span>
                    <span className="ml-auto bg-indigo-200 text-indigo-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {intermediateSubjects.length}
                    </span>
                  </div>
                  {intermediateSubjects.length === 0 ? (
                    <p className="text-[11px] text-indigo-700/70 italic">None logged in this range</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {intermediateSubjects.map((s) => (
                        <span
                          key={s.label}
                          className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-900 border border-indigo-300 shadow-2xs"
                        >
                          {s.label}: <strong>{s.pct}%</strong> ({s.score}/{s.max})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Weak Subjects */}
                <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 space-y-2">
                  <div className="flex items-center space-x-2 text-rose-800 font-extrabold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Weak Subjects (&lt; 60%)</span>
                    <span className="ml-auto bg-rose-200 text-rose-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {weakSubjects.length}
                    </span>
                  </div>
                  {weakSubjects.length === 0 ? (
                    <p className="text-[11px] text-rose-700/70 italic">No weak subjects identified!</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {weakSubjects.map((s) => (
                        <span
                          key={s.label}
                          className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-rose-900 border border-rose-300 shadow-2xs"
                        >
                          {s.label}: <strong>{s.pct}%</strong> ({s.score}/{s.max})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Untouched / Zero Score Opted Subjects */}
                <div className="bg-slate-100/80 p-3.5 rounded-xl border border-slate-300 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-xs">
                    <MinusCircle className="w-4 h-4 text-slate-500" />
                    <span>Unattempted / Zero Score</span>
                    <span className="ml-auto bg-slate-300 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {untouchedSubjects.length}
                    </span>
                  </div>
                  {untouchedSubjects.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No zero-score opted subjects!</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {untouchedSubjects.map((s) => (
                        <span
                          key={s.label}
                          className="bg-rose-50 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-900 border border-rose-200 shadow-2xs flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3 text-rose-600" />
                          {s.label}: No Attempt (0 Marks)
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Not Opted Subjects */}
                {notOptedSubjects.length > 0 && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center space-x-2 text-slate-600 font-extrabold text-xs">
                      <MinusCircle className="w-4 h-4 text-slate-400" />
                      <span>Not Opted Subjects</span>
                      <span className="ml-auto bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {notOptedSubjects.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {notOptedSubjects.map((s) => (
                        <span
                          key={s.label}
                          className="bg-white px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 border border-slate-200 shadow-2xs flex items-center gap-1"
                        >
                          <MinusCircle className="w-3 h-3 text-slate-400" />
                          {s.label}: Not Opted
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 5: Mentor Review Logs & Doubt Sessions */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
                  5. Mentor Followup & Action Plan
                </h3>
              </div>

              {log ? (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span>Followup Stage: {log.currentStage}</span>
                    <span className="text-indigo-600">Mentor: {log.mentorName}</span>
                  </div>
                  {log.scheduledDoubtDate && (
                    <p className="text-emerald-700 font-semibold">
                      Scheduled Doubt Session: {log.scheduledDoubtDate} ({log.scheduledDoubtTopic || 'All Topics'})
                    </p>
                  )}
                  <p className="text-slate-600 italic">"{log.notes || 'Regular review active.'}"</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-1">
                  No active mentor followup log created yet.
                </p>
              )}

              {/* Review Comments */}
              {reviewComments.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-600 uppercase">
                    Recent Review Comments:
                  </span>
                  <div className="space-y-1.5">
                    {reviewComments.slice(-3).map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700"
                      >
                        <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                          <strong>{c.author}</strong>
                          <span>{c.timestamp}</span>
                        </div>
                        <p>{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 6: Subject Skill Radar & IQ-Style Aptitude Graph */}
            <div className="space-y-3 pt-2">
              <SubjectSkillGraph
                student={student}
                objectiveRecords={objectiveRecords}
                subjectiveRecords={subjectiveRecords}
              />
            </div>

            {/* SECTION 7: Teacher Premium Individual Action Plan & Subject Improvements */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
                    7. Individual Premium Action Plan & Subject Revision
                  </h3>
                </div>

                <button
                  onClick={() => setShowActionPlanModal(true)}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  {actionPlan ? <Edit3 className="w-3.5 h-3.5 mr-1.5" /> : <PlusCircle className="w-3.5 h-3.5 mr-1.5" />}
                  {actionPlan ? 'Edit Premium Action Plan' : 'Add Subject Action Plan'}
                </button>
              </div>

              {actionPlan ? (
                <div className="bg-gradient-to-br from-indigo-50/60 via-slate-50 to-purple-50/40 p-4 sm:p-5 rounded-2xl border border-indigo-100 shadow-2xs space-y-3">
                  <div className="flex justify-between items-center text-xs text-indigo-900 font-bold border-b border-indigo-100/80 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      Prepared by: <strong className="text-slate-900">{actionPlan.teacherName}</strong>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Updated: {actionPlan.updatedAt}</span>
                  </div>

                  {actionPlan.overallRemark && (
                    <div className="bg-white p-3 rounded-xl border border-indigo-100/80 text-xs text-slate-700">
                      <strong className="text-indigo-900 block mb-1 font-bold">Teacher Strategic Guidance:</strong>
                      <p className="italic font-medium">"{actionPlan.overallRemark}"</p>
                    </div>
                  )}

                  {actionPlan.subjects && actionPlan.subjects.length > 0 && (
                    <div className="overflow-x-auto rounded-xl border border-indigo-100 bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-indigo-50/80 text-indigo-900 font-extrabold text-[10px] uppercase border-b border-indigo-100">
                            <th className="py-2.5 px-3">Subject</th>
                            <th className="py-2.5 px-3">Topics Revised</th>
                            <th className="py-2.5 px-3">Lectures / Series</th>
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
                    No individual subject action plan recorded yet for this student.
                  </p>
                  <button
                    onClick={() => setShowActionPlanModal(true)}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                    Create Premium Action Plan Now
                  </button>
                </div>
              )}
            </div>

            {/* ACTION BUTTON AT END OF REPORT */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl">
              <div className="text-xs text-slate-600 font-medium">
                <span className="font-bold text-slate-800 block">Report Action Checklist</span>
                <span>Include teacher subject improvements, topics, and hours spent before saving or sending.</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowActionPlanModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  {actionPlan ? 'Update Premium Action Plan' : 'Add Subject Action Plan & Comments'}
                </button>
              </div>
            </div>

            {/* Footer Sign-off */}
            <div className="pt-6 border-t-2 border-slate-200 flex justify-between items-end text-[10px] text-slate-400">
              <div>
                <p className="font-bold text-slate-700">Impact Attendance & Academic Tracker</p>
                <p>System Generated Official Performance Report</p>
              </div>
              <div className="text-right">
                <p className="border-b border-slate-400 w-32 mb-1" />
                <p className="font-bold text-slate-700">Mentor Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showActionPlanModal && (
        <PremiumActionPlanModal
          student={student}
          existingPlan={actionPlan}
          onSavePlan={handleSavePlan}
          onClose={() => setShowActionPlanModal(false)}
        />
      )}
    </div>
  );
};
