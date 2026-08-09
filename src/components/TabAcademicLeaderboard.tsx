import React, { useState, useMemo } from 'react';
import {
  StudentSummary,
  AttendanceRecord,
  ObjectiveRecord,
  SubjectiveRecord,
} from '../types';
import { isInvalidMentorName } from '../utils/dataProcessor';
import {
  GraduationCap,
  Calendar,
  Search,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Sparkles,
  Trophy,
  AlertTriangle,
  Filter,
} from 'lucide-react';

interface TabAcademicLeaderboardProps {
  students: StudentSummary[];
  attendanceRecords: AttendanceRecord[];
  objectiveRecords: ObjectiveRecord[];
  subjectiveRecords: SubjectiveRecord[];
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

type SubTab = 'attendance' | 'performance';

export const TabAcademicLeaderboard: React.FC<TabAcademicLeaderboardProps> = ({
  students,
  attendanceRecords,
  objectiveRecords,
  subjectiveRecords,
  searchQuery: externalSearchQuery,
  onSearchChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('performance');
  const [selectedWeek, setSelectedWeek] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [selectedMentor, setSelectedMentor] = useState<string>('All');
  const [internalSearchQuery, setInternalSearchQuery] = useState<string>('');

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = (val: string) => {
    setInternalSearchQuery(val);
    if (onSearchChange) onSearchChange(val);
  };

  // Extract all available weeks
  const availableWeeks = useMemo(() => {
    const set = new Set<string>();
    attendanceRecords.forEach((a) => {
      if (a.week) set.add(a.week);
    });
    subjectiveRecords.forEach((s) => {
      if (s.week) set.add(s.week);
    });
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
  }, [attendanceRecords, subjectiveRecords]);

  // Valid active students & filter options
  const validStudents = useMemo(() => {
    return students.filter((s) => !isInvalidMentorName(s.mentorName));
  }, [students]);

  const uniqueMentors = useMemo(() => {
    const set = new Set<string>();
    validStudents.forEach((s) => set.add(s.mentorName.trim()));
    return Array.from(set).sort();
  }, [validStudents]);

  const availableGrades = useMemo(() => {
    const set = new Set<string>();
    validStudents.forEach((s) => {
      if (s.grade) set.add(s.grade);
    });
    return Array.from(set).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }, [validStudents]);

  const availableSections = useMemo(() => {
    const set = new Set<string>();
    validStudents.forEach((s) => {
      if (s.section) set.add(s.section);
    });
    return Array.from(set).sort();
  }, [validStudents]);

  // Filtered Students population based on Grade, Section, Mentor
  const filteredStudentsForAnalysis = useMemo(() => {
    return validStudents.filter((s) => {
      if (selectedGrade !== 'All' && s.grade !== selectedGrade) return false;
      if (selectedSection !== 'All' && s.section !== selectedSection) return false;
      if (selectedMentor !== 'All' && s.mentorName.trim() !== selectedMentor) return false;
      return true;
    });
  }, [validStudents, selectedGrade, selectedSection, selectedMentor]);

  // ==========================================
  // SUB-TAB 1 DATA: Attendance & Section Mapping
  // ==========================================
  const attendanceMappingData = useMemo(() => {
    return uniqueMentors.map((mentorName) => {
      const mentorStudents = validStudents.filter((s) => s.mentorName.trim() === mentorName);
      const totalStudents = mentorStudents.length;

      const batches = Array.from(new Set(mentorStudents.map((s) => s.batch).filter(Boolean))).join(', ') || 'N/A';
      const sections = Array.from(new Set(mentorStudents.map((s) => `${s.grade}-${s.section}`).filter(Boolean))).join(', ') || 'N/A';
      const streams = Array.from(new Set(mentorStudents.map((s) => s.stream).filter(Boolean))).join(', ') || 'N/A';

      let mentorAttRecords = attendanceRecords.filter((a) => a.mentorName?.trim() === mentorName);
      if (selectedWeek !== 'All') {
        mentorAttRecords = mentorAttRecords.filter((a) => a.week === selectedWeek);
      }

      let attAvg = 0;
      let totalPresentClasses = 0;
      let totalConductedClasses = 0;

      if (selectedWeek !== 'All' && mentorAttRecords.length > 0) {
        const sum = mentorAttRecords.reduce((acc, r) => acc + (r.attendancePercentage || 0), 0);
        attAvg = Math.round((sum / mentorAttRecords.length) * 10) / 10;
        totalPresentClasses = mentorAttRecords.reduce((acc, r) => acc + (r.totalPresent || 0), 0);
        totalConductedClasses = mentorAttRecords.reduce((acc, r) => acc + (r.totalClasses || 0), 0);
      } else {
        const sum = mentorStudents.reduce((acc, s) => acc + s.attendanceAvg, 0);
        attAvg = totalStudents > 0 ? Math.round((sum / totalStudents) * 10) / 10 : 0;
        totalPresentClasses = mentorAttRecords.reduce((acc, r) => acc + (r.totalPresent || 0), 0);
        totalConductedClasses = mentorAttRecords.reduce((acc, r) => acc + (r.totalClasses || 0), 0);
      }

      return {
        mentorName,
        totalStudents,
        batches,
        sections,
        streams,
        attendanceAvg: attAvg,
        totalPresentClasses,
        totalConductedClasses,
      };
    }).sort((a, b) => b.attendanceAvg - a.attendanceAvg);
  }, [uniqueMentors, validStudents, attendanceRecords, selectedWeek]);

  // Overall Section/Batch Averages
  const overallSectionAverages = useMemo(() => {
    const overallObj = validStudents.reduce((acc, s) => acc + s.objectiveAvg, 0);
    const overallSub = validStudents.reduce((acc, s) => acc + s.subjectiveAvg, 0);
    const overallCount = validStudents.length || 1;

    return {
      overallObjAvg: Math.round((overallObj / overallCount) * 10) / 10,
      overallSubAvg: Math.round((overallSub / overallCount) * 10) / 10,
      overallCombinedAvg: Math.round(((overallObj + overallSub) / (2 * overallCount)) * 10) / 10,
    };
  }, [validStudents]);

  // ==========================================
  // SUB-TAB 2 DATA: Test Performance Analysis
  // ==========================================
  // Individual Student Analysis Data for 4 Dashboard Cards
  const studentPerformanceAnalysis = useMemo(() => {
    return filteredStudentsForAnalysis.map((student) => {
      const sName = student.studentName.trim();

      let objRecs = objectiveRecords.filter((o) => o.studentName.trim() === sName);
      if (selectedWeek !== 'All') {
        objRecs = objRecs.filter((o) => !o.week || o.week === selectedWeek);
      }

      let subRecs = subjectiveRecords.filter((s) => s.studentName.trim() === sName);
      if (selectedWeek !== 'All') {
        subRecs = subRecs.filter((s) => s.week === selectedWeek);
      }

      // Deduplicate student test records
      const seenObjKeys = new Set<string>();
      const uniqueObjRecs = objRecs.filter((o) => {
        const key = o.id || `${o.week}_${o.objectiveName}_${o.testPercentage}_${o.physics}_${o.chemistry}_${o.maths}_${o.biology}`;
        if (seenObjKeys.has(key)) return false;
        seenObjKeys.add(key);
        return true;
      });

      const seenSubKeys = new Set<string>();
      const uniqueSubRecs = subRecs.filter((s) => {
        const key = s.id || `${s.week}_${s.subject}_${s.percentage}`;
        if (seenSubKeys.has(key)) return false;
        seenSubKeys.add(key);
        return true;
      });

      let objAvg = 0;
      if (uniqueObjRecs.length > 0) {
        objAvg = uniqueObjRecs.reduce((sum, o) => sum + Math.min(100, Math.max(0, o.testPercentage || 0)), 0) / uniqueObjRecs.length;
      } else if (selectedWeek === 'All') {
        objAvg = Math.min(100, student.objectiveAvg || 0);
      }

      let subAvg = 0;
      if (uniqueSubRecs.length > 0) {
        subAvg = uniqueSubRecs.reduce((sum, s) => sum + Math.min(100, Math.max(0, s.percentage || 0)), 0) / uniqueSubRecs.length;
      } else if (selectedWeek === 'All') {
        subAvg = Math.min(100, student.subjectiveAvg || 0);
      }

      let overallAvg = 0;
      if (objAvg > 0 && subAvg > 0) {
        overallAvg = (objAvg + subAvg) / 2;
      } else if (objAvg > 0) {
        overallAvg = objAvg;
      } else if (subAvg > 0) {
        overallAvg = subAvg;
      }

      // Extract subject scores (capped at 100)
      const physicsScores: number[] = [];
      const chemistryScores: number[] = [];
      const mathsScores: number[] = [];
      const biologyScores: number[] = [];

      uniqueObjRecs.forEach((o) => {
        if (o.physics !== null && o.physics !== undefined) physicsScores.push(Math.min(100, Math.max(0, o.physics)));
        if (o.chemistry !== null && o.chemistry !== undefined) chemistryScores.push(Math.min(100, Math.max(0, o.chemistry)));
        if (o.maths !== null && o.maths !== undefined) mathsScores.push(Math.min(100, Math.max(0, o.maths)));
        if (o.biology !== null && o.biology !== undefined) biologyScores.push(Math.min(100, Math.max(0, o.biology)));
      });

      uniqueSubRecs.forEach((s) => {
        const subj = (s.subject || '').toLowerCase();
        const val = Math.min(100, Math.max(0, s.percentage));
        if (subj.includes('physic')) physicsScores.push(val);
        else if (subj.includes('chem')) chemistryScores.push(val);
        else if (subj.includes('math')) mathsScores.push(val);
        else if (subj.includes('bio') || subj.includes('zool') || subj.includes('botan')) biologyScores.push(val);
      });

      const getAvg = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

      return {
        studentName: student.studentName,
        grade: student.grade,
        section: student.section,
        mentorName: student.mentorName,
        overallAvg: Math.round(overallAvg * 100) / 100,
        physicsAvg: getAvg(physicsScores),
        chemistryAvg: getAvg(chemistryScores),
        mathsAvg: getAvg(mathsScores),
        biologyAvg: getAvg(biologyScores),
      };
    });
  }, [filteredStudentsForAnalysis, objectiveRecords, subjectiveRecords, selectedWeek]);

  // Filter student performance analysis by searchQuery for top/lowest performers cards
  const filteredStudentPerformanceAnalysis = useMemo(() => {
    if (!searchQuery.trim()) return studentPerformanceAnalysis;
    const q = searchQuery.toLowerCase().trim();
    return studentPerformanceAnalysis.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.mentorName.toLowerCase().includes(q) ||
        s.section.toLowerCase().includes(q) ||
        s.grade.toLowerCase().includes(q)
    );
  }, [studentPerformanceAnalysis, searchQuery]);

  // Card 1: Top Performers (Highest Overall Avg %)
  const topPerformers = useMemo(() => {
    return [...filteredStudentPerformanceAnalysis]
      .filter((s) => s.overallAvg > 0)
      .sort((a, b) => b.overallAvg - a.overallAvg)
      .slice(0, 5);
  }, [filteredStudentPerformanceAnalysis]);

  // Card 3: Needs Improvement (Lowest Overall Avg %, 0% Excluded)
  const lowestPerformers = useMemo(() => {
    return [...filteredStudentPerformanceAnalysis]
      .filter((s) => s.overallAvg > 0)
      .sort((a, b) => a.overallAvg - b.overallAvg)
      .slice(0, 5);
  }, [filteredStudentPerformanceAnalysis]);

  // Card 2: Subject Benchmark Metrics
  const subjectBenchmarks = useMemo(() => {
    const subjects = ['Physics', 'Chemistry', 'Maths', 'Biology'] as const;
    const result: Record<
      string,
      { classAvg: number; classHighest: number; classLowest: number; uniqueAssessed: number }
    > = {};

    const filteredStudentNamesSet = new Set(
      filteredStudentsForAnalysis.map((s) => s.studentName.trim().toLowerCase())
    );

    // De-duplicate global objective records
    const seenObjKeys = new Set<string>();
    const uniqueObjRecords = objectiveRecords.filter((o) => {
      const key = o.id || `${o.studentName?.trim().toLowerCase()}_${o.week}_${o.objectiveName}_${o.testPercentage}`;
      if (seenObjKeys.has(key)) return false;
      seenObjKeys.add(key);
      return true;
    });

    // De-duplicate global subjective records
    const seenSubKeys = new Set<string>();
    const uniqueSubRecords = subjectiveRecords.filter((s) => {
      const key = s.id || `${s.studentName?.trim().toLowerCase()}_${s.week}_${s.subject}_${s.percentage}`;
      if (seenSubKeys.has(key)) return false;
      seenSubKeys.add(key);
      return true;
    });

    subjects.forEach((subj) => {
      const key = (subj.toLowerCase() + 'Avg') as 'physicsAvg' | 'chemistryAvg' | 'mathsAvg' | 'biologyAvg';

      const studentAverages = studentPerformanceAnalysis
        .map((s) => s[key])
        .filter((val): val is number => val !== null && val !== undefined)
        .map((val) => Math.min(100, Math.max(0, val)));

      // Collect ALL individual test scores for this subject from unique records
      const allIndividualTestScores: number[] = [];

      uniqueObjRecords.forEach((o) => {
        if (!o.studentName || !filteredStudentNamesSet.has(o.studentName.trim().toLowerCase())) return;
        if (selectedWeek !== 'All' && o.week && o.week !== selectedWeek) return;

        let scoreVal: number | null = null;
        if (subj === 'Physics' && o.physics !== null && o.physics !== undefined) scoreVal = o.physics;
        else if (subj === 'Chemistry' && o.chemistry !== null && o.chemistry !== undefined) scoreVal = o.chemistry;
        else if (subj === 'Maths' && o.maths !== null && o.maths !== undefined) scoreVal = o.maths;
        else if (subj === 'Biology') {
          if (o.biology !== null && o.biology !== undefined) scoreVal = o.biology;
          else if (o.zoology !== null || o.botany !== null) {
            const bioArr = [o.zoology, o.botany].filter((v): v is number => v !== null && v !== undefined);
            if (bioArr.length > 0) scoreVal = bioArr.reduce((a, b) => a + b, 0) / bioArr.length;
          }
        }

        if (scoreVal !== null && !isNaN(scoreVal)) {
          allIndividualTestScores.push(Math.min(100, Math.max(0, scoreVal)));
        }
      });

      uniqueSubRecords.forEach((s) => {
        if (!s.studentName || !filteredStudentNamesSet.has(s.studentName.trim().toLowerCase())) return;
        if (selectedWeek !== 'All' && s.week !== selectedWeek) return;

        const subName = (s.subject || '').toLowerCase();
        let matchesSubject = false;
        if (subj === 'Physics' && subName.includes('physic')) matchesSubject = true;
        if (subj === 'Chemistry' && subName.includes('chem')) matchesSubject = true;
        if (subj === 'Maths' && subName.includes('math')) matchesSubject = true;
        if (subj === 'Biology' && (subName.includes('bio') || subName.includes('zool') || subName.includes('botan'))) matchesSubject = true;

        if (matchesSubject && s.percentage !== null && s.percentage !== undefined && !isNaN(s.percentage)) {
          allIndividualTestScores.push(Math.min(100, Math.max(0, s.percentage)));
        }
      });

      const positiveScores = studentAverages.filter((val) => val > 0);

      const classAvg = studentAverages.length > 0 ? Math.round((studentAverages.reduce((a, b) => a + b, 0) / studentAverages.length) * 10) / 10 : 0;

      // Class Highest is max mark in any test till date / selected week, capped at 100
      let classHighest = 0;
      if (allIndividualTestScores.length > 0) {
        classHighest = Math.round(Math.max(...allIndividualTestScores) * 10) / 10;
      } else if (studentAverages.length > 0) {
        classHighest = Math.round(Math.max(...studentAverages) * 10) / 10;
      }
      classHighest = Math.min(100, classHighest);

      const classLowest = positiveScores.length > 0 ? Math.round(Math.min(...positiveScores) * 10) / 10 : 0;

      result[subj] = {
        classAvg: Math.min(100, classAvg),
        classHighest,
        classLowest,
        uniqueAssessed: studentAverages.length,
      };
    });

    return result;
  }, [
    filteredStudentsForAnalysis,
    studentPerformanceAnalysis,
    objectiveRecords,
    subjectiveRecords,
    selectedWeek,
  ]);

  // Card 4: Score Range Student Distribution
  const scoreDistribution = useMemo(() => {
    const subjects = ['Physics', 'Chemistry', 'Maths', 'Biology'] as const;

    const ranges = [
      { label: '95%+', physics: 0, chemistry: 0, maths: 0, biology: 0 },
      { label: '90–95%', physics: 0, chemistry: 0, maths: 0, biology: 0 },
      { label: '80–90%', physics: 0, chemistry: 0, maths: 0, biology: 0 },
      { label: 'Below 80%', physics: 0, chemistry: 0, maths: 0, biology: 0 },
    ];

    studentPerformanceAnalysis.forEach((student) => {
      subjects.forEach((subj) => {
        const key = (subj.toLowerCase() + 'Avg') as 'physicsAvg' | 'chemistryAvg' | 'mathsAvg' | 'biologyAvg';
        const score = student[key];
        if (score === null || score === undefined) return;

        const subjKey = subj.toLowerCase() as 'physics' | 'chemistry' | 'maths' | 'biology';

        if (score >= 95) {
          ranges[0][subjKey]++;
        } else if (score >= 90) {
          ranges[1][subjKey]++;
        } else if (score >= 80) {
          ranges[2][subjKey]++;
        } else {
          ranges[3][subjKey]++;
        }
      });
    });

    return ranges;
  }, [studentPerformanceAnalysis]);

  // Mentor Test Performance Table Data
  const testPerformanceData = useMemo(() => {
    return uniqueMentors.map((mentorName) => {
      const mentorStudents = validStudents.filter((s) => s.mentorName.trim() === mentorName);
      const totalStudents = mentorStudents.length;

      const sections = Array.from(new Set(mentorStudents.map((s) => `${s.grade}-${s.section}`).filter(Boolean))).join(', ') || 'N/A';
      const batches = Array.from(new Set(mentorStudents.map((s) => s.batch).filter(Boolean))).join(', ') || 'N/A';

      let mentorObjRecs = objectiveRecords.filter((o) => o.mentorName?.trim() === mentorName);
      let mentorSubRecs = subjectiveRecords.filter((s) => s.mentorName?.trim() === mentorName);

      if (selectedWeek !== 'All') {
        mentorSubRecs = mentorSubRecs.filter((s) => s.week === selectedWeek);
      }

      let objectiveAvg = 0;
      if (mentorObjRecs.length > 0) {
        const sum = mentorObjRecs.reduce((acc, o) => acc + (o.testPercentage || 0), 0);
        objectiveAvg = Math.round((sum / mentorObjRecs.length) * 10) / 10;
      } else {
        const sum = mentorStudents.reduce((acc, s) => acc + s.objectiveAvg, 0);
        objectiveAvg = totalStudents > 0 ? Math.round((sum / totalStudents) * 10) / 10 : 0;
      }

      let subjectiveAvg = 0;
      if (mentorSubRecs.length > 0) {
        const sum = mentorSubRecs.reduce((acc, s) => acc + (s.percentage || 0), 0);
        subjectiveAvg = Math.round((sum / mentorSubRecs.length) * 10) / 10;
      } else {
        const sum = mentorStudents.reduce((acc, s) => acc + s.subjectiveAvg, 0);
        subjectiveAvg = totalStudents > 0 ? Math.round((sum / totalStudents) * 10) / 10 : 0;
      }

      const combinedAvg = Math.round(((objectiveAvg + subjectiveAvg) / 2) * 10) / 10;

      let gradeLabel = 'D';
      let gradeBadgeColor = 'bg-slate-100 text-slate-800 border-slate-300';
      if (combinedAvg >= 90) {
        gradeLabel = 'S (Outstanding)';
        gradeBadgeColor = 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold';
      } else if (combinedAvg >= 80) {
        gradeLabel = 'A (Excellent)';
        gradeBadgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      } else if (combinedAvg >= 70) {
        gradeLabel = 'B (Good)';
        gradeBadgeColor = 'bg-blue-100 text-blue-900 border-blue-300 font-semibold';
      } else if (combinedAvg >= 60) {
        gradeLabel = 'C (Average)';
        gradeBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300 font-medium';
      } else {
        gradeLabel = 'D (Needs Support)';
        gradeBadgeColor = 'bg-rose-100 text-rose-900 border-rose-300 font-medium';
      }

      const deltaVsOverall = Math.round((combinedAvg - overallSectionAverages.overallCombinedAvg) * 10) / 10;

      return {
        mentorName,
        totalStudents,
        batches,
        sections,
        objectiveAvg,
        subjectiveAvg,
        combinedAvg,
        gradeLabel,
        gradeBadgeColor,
        deltaVsOverall,
      };
    }).sort((a, b) => b.combinedAvg - a.combinedAvg);
  }, [uniqueMentors, validStudents, objectiveRecords, subjectiveRecords, selectedWeek, overallSectionAverages]);

  // Filtered dataset search
  const filteredAttendanceData = useMemo(() => {
    if (!searchQuery.trim()) return attendanceMappingData;
    const q = searchQuery.toLowerCase().trim();
    return attendanceMappingData.filter(
      (d) =>
        d.mentorName.toLowerCase().includes(q) ||
        d.batches.toLowerCase().includes(q) ||
        d.sections.toLowerCase().includes(q)
    );
  }, [attendanceMappingData, searchQuery]);

  const filteredPerformanceData = useMemo(() => {
    if (!searchQuery.trim()) return testPerformanceData;
    const q = searchQuery.toLowerCase().trim();
    return testPerformanceData.filter(
      (d) =>
        d.mentorName.toLowerCase().includes(q) ||
        d.batches.toLowerCase().includes(q) ||
        d.sections.toLowerCase().includes(q)
    );
  }, [testPerformanceData, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-indigo-400" />
              <h2 className="text-xl font-black tracking-tight text-white">
                Academic & Test Performance Analysis
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Grade, Section & Mentor Benchmarks
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Overall test performance, subject-wise benchmark metrics, top & lowest performers, and score range headcount distribution.
            </p>
          </div>
        </div>

        {/* Sub-View Navigation Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => setActiveSubTab('performance')}
            className={`flex items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'performance'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/30'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            1. Test Performance Analysis
          </button>

          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`flex items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'attendance'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/30'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            2. Attendance & Section Mapping
          </button>
        </div>
      </div>

      {/* SUB-TAB 2: TEST PERFORMANCE ANALYSIS (Dashboard Layout) */}
      {activeSubTab === 'performance' && (
        <div className="space-y-6">
          {/* Controls & Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-white space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Performance Filters
                </span>
                <span className="text-[11px] text-slate-400 ml-2 font-medium">
                  ({filteredStudentsForAnalysis.length} Students Selected)
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search mentor/student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Dropdown Filters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Grade Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Grade
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">All Grades</option>
                  {availableGrades.map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">All Sections</option>
                  {availableSections.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mentor Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Mentor
                </label>
                <select
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:ring-1 focus:ring-indigo-500 truncate"
                >
                  <option value="All">All Mentors</option>
                  {uniqueMentors.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Week Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Evaluation Week
                </label>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">Overall (All Weeks)</option>
                  {availableWeeks.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 4-QUADRANT DASHBOARD */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QUAD 1: TOP PERFORMERS */}
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl text-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-emerald-400">
                    Top Performers
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Highest Overall Avg %
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3 text-center">Rank</th>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3 text-center">Section</th>
                      <th className="py-2.5 px-3 text-right">Overall Avg %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-semibold">
                    {topPerformers.map((student, idx) => {
                      let medal = <span className="font-bold text-slate-400">{idx + 1}</span>;
                      if (idx === 0) medal = <span className="text-base">🥇 1</span>;
                      if (idx === 1) medal = <span className="text-base">🥈 2</span>;
                      if (idx === 2) medal = <span className="text-base">🥉 3</span>;

                      return (
                        <tr key={student.studentName} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 text-center font-bold">{medal}</td>
                          <td className="py-3 px-3 font-bold text-white">{student.studentName}</td>
                          <td className="py-3 px-3 text-center font-mono text-slate-300">
                            {student.section}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-emerald-400 text-sm">
                            {student.overallAvg.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}

                    {topPerformers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                          No top performer records match current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QUAD 2: SUBJECT BENCHMARK METRICS */}
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl text-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-cyan-400">
                    Subject Benchmark Metrics
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Average, Highest & Lowest (Unique Students)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3">Benchmark Metric</th>
                      <th className="py-2.5 px-3 text-center text-cyan-300">Physics</th>
                      <th className="py-2.5 px-3 text-center text-cyan-300">Chemistry</th>
                      <th className="py-2.5 px-3 text-center text-cyan-300">Maths</th>
                      <th className="py-2.5 px-3 text-center text-cyan-300">Biology</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-semibold text-slate-200">
                    {/* Class Average % */}
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">Class Average %</td>
                      <td className="py-3 px-3 text-center font-black text-cyan-400 text-sm">
                        {subjectBenchmarks.Physics.classAvg}%
                      </td>
                      <td className="py-3 px-3 text-center font-black text-cyan-400 text-sm">
                        {subjectBenchmarks.Chemistry.classAvg}%
                      </td>
                      <td className="py-3 px-3 text-center font-black text-cyan-400 text-sm">
                        {subjectBenchmarks.Maths.classAvg}%
                      </td>
                      <td className="py-3 px-3 text-center font-black text-cyan-400 text-sm">
                        {subjectBenchmarks.Biology.classAvg}%
                      </td>
                    </tr>

                    {/* Class Highest % */}
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">Class Highest %</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-400">
                        {subjectBenchmarks.Physics.classHighest}%
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-400">
                        {subjectBenchmarks.Chemistry.classHighest}%
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-400">
                        {subjectBenchmarks.Maths.classHighest}%
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-400">
                        {subjectBenchmarks.Biology.classHighest}%
                      </td>
                    </tr>

                    {/* Class Lowest % (Excl. 0) */}
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">Class Lowest % (Excl. 0)</td>
                      <td className="py-3 px-3 text-center font-bold text-rose-400">
                        {subjectBenchmarks.Physics.classLowest}%
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-rose-400">
                        {subjectBenchmarks.Chemistry.classLowest}%
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-rose-400">
                        {subjectBenchmarks.Maths.classLowest}%
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-rose-400">
                        {subjectBenchmarks.Biology.classLowest}%
                      </td>
                    </tr>

                    {/* Unique Students Assessed */}
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">Unique Students Assessed</td>
                      <td className="py-3 px-3 text-center font-bold text-white font-mono">
                        {subjectBenchmarks.Physics.uniqueAssessed}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-white font-mono">
                        {subjectBenchmarks.Chemistry.uniqueAssessed}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-white font-mono">
                        {subjectBenchmarks.Maths.uniqueAssessed}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-white font-mono">
                        {subjectBenchmarks.Biology.uniqueAssessed}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* QUAD 3: NEEDS IMPROVEMENT / LOWEST PERFORMERS */}
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl text-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-rose-400">
                    Needs Improvement / Lowest Performers
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Lowest Overall Avg % (0% Excluded)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3 text-center">Rank</th>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3 text-center">Section</th>
                      <th className="py-2.5 px-3 text-right">Overall Avg %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-semibold">
                    {lowestPerformers.map((student, idx) => (
                      <tr key={student.studentName} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-bold text-white">{student.studentName}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-300">
                          {student.section}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-rose-400 text-sm">
                          {student.overallAvg.toFixed(2)}%
                        </td>
                      </tr>
                    ))}

                    {lowestPerformers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                          No student records match current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QUAD 4: SCORE RANGE STUDENT DISTRIBUTION */}
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl text-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-cyan-400">
                    Score Range Student Distribution
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Student Headcount by Range
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3">Score Range</th>
                      <th className="py-2.5 px-3 text-center text-cyan-300">Physics</th>
                      <th className="py-2.5 px-3 text-center text-cyan-300">Chemistry</th>
                      <th className="py-2.5 px-3 text-center text-cyan-300">Maths</th>
                      <th className="py-2.5 px-3 text-center text-cyan-300">Biology</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-semibold text-slate-200">
                    {scoreDistribution.map((row) => (
                      <tr key={row.label} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-cyan-300">{row.label}</td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-400">
                          {row.physics}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-400">
                          {row.chemistry}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-400">
                          {row.maths}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-400">
                          {row.biology}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* MENTOR TEST PERFORMANCE BREAKDOWN TABLE */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden space-y-0 mt-8">
            <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Mentor Test Performance & Grade Benchmark Table
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed mentor objective & subjective score averages, mapped grade levels, and overall batch comparisons.
                </p>
              </div>

              <div className="hidden lg:flex items-center space-x-3 text-[11px] font-bold text-slate-600">
                <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded border border-purple-300">S: &ge;90%</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded border border-emerald-300">A: 80-89%</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded border border-blue-300">B: 70-79%</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded border border-amber-300">C: 60-69%</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3 text-center">Rank</th>
                    <th className="py-3 px-4">Mentor Name</th>
                    <th className="py-3 px-3 text-center">Students</th>
                    <th className="py-3 px-4">Batch & Sections</th>
                    <th className="py-3 px-3 text-center">Objective Avg</th>
                    <th className="py-3 px-3 text-center">Subjective Avg</th>
                    <th className="py-3 px-3 text-center bg-indigo-50 text-indigo-900">Combined Avg</th>
                    <th className="py-3 px-4 text-center">Grade Mapped</th>
                    <th className="py-3 px-4 text-center">Vs Overall Batch Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredPerformanceData.map((row, idx) => (
                    <tr key={row.mentorName} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{row.mentorName}</td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-800">{row.totalStudents}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{row.sections}</td>
                      <td className="py-3 px-3 text-center font-bold text-indigo-600">{row.objectiveAvg}%</td>
                      <td className="py-3 px-3 text-center font-bold text-indigo-600">{row.subjectiveAvg}%</td>
                      <td className="py-3 px-3 text-center font-black text-indigo-950 bg-indigo-50/60 text-sm">
                        {row.combinedAvg}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs border inline-block ${row.gradeBadgeColor}`}>
                          {row.gradeLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.deltaVsOverall >= 0 ? (
                          <span className="font-bold text-emerald-600 inline-flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> +{row.deltaVsOverall}%
                          </span>
                        ) : (
                          <span className="font-bold text-rose-600 inline-flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" /> {row.deltaVsOverall}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredPerformanceData.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500 font-medium">
                        No matching test performance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: ATTENDANCE & SECTION MAPPING */}
      {activeSubTab === 'attendance' && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden space-y-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Mentor Attendance Mapping & Batch Details
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Week-wise and overall mentor attendance percentages matched with assigned batches, sections, and streams.
              </p>
            </div>

            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search mentor or batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3 text-center">Rank</th>
                  <th className="py-3 px-4">Mentor Name</th>
                  <th className="py-3 px-3 text-center">Assigned Students</th>
                  <th className="py-3 px-4">Mapped Batches</th>
                  <th className="py-3 px-4">Grade & Sections</th>
                  <th className="py-3 px-3 text-center">Stream / Domain</th>
                  <th className="py-3 px-3 text-center">Attendance %</th>
                  <th className="py-3 px-3 text-center">Class Present Stats</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredAttendanceData.map((row, idx) => {
                  let statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> High (&gt;85%)
                    </span>
                  );
                  if (row.attendanceAvg < 75) {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Low (&lt;75%)
                      </span>
                    );
                  } else if (row.attendanceAvg < 85) {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> Moderate
                      </span>
                    );
                  }

                  return (
                    <tr key={row.mentorName} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{row.mentorName}</td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-800">{row.totalStudents}</td>
                      <td className="py-3 px-4 text-slate-700">{row.batches}</td>
                      <td className="py-3 px-4 text-slate-700 font-mono text-[11px]">{row.sections}</td>
                      <td className="py-3 px-3 text-center font-semibold text-indigo-700">{row.streams}</td>
                      <td className="py-3 px-3 text-center font-extrabold text-emerald-600 text-sm">
                        {row.attendanceAvg}%
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500 text-[11px]">
                        {row.totalConductedClasses > 0 ? (
                          <span>
                            <strong>{row.totalPresentClasses}</strong> / {row.totalConductedClasses} classes
                          </span>
                        ) : (
                          <span className="italic text-slate-400">Regular Session</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">{statusBadge}</td>
                    </tr>
                  );
                })}

                {filteredAttendanceData.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 font-medium">
                      No matching mentor attendance data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
