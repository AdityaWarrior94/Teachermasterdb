import {
  AttendanceRecord,
  ObjectiveRecord,
  SubjectiveRecord,
  DiscontinuationRecord,
  StudentSummary,
  MentorLeaderboardItem,
  FollowupLog,
  ReasonBucket,
  REASON_BUCKETS,
  FilterState,
} from '../types';

export function calculateStudentSummaries(
  attendance: AttendanceRecord[],
  objective: ObjectiveRecord[],
  subjective: SubjectiveRecord[],
  discontinuation: DiscontinuationRecord[]
): StudentSummary[] {
  // Map by student name
  const studentMap = new Map<string, StudentSummary>();

  // Process Attendance
  attendance.forEach((att) => {
    const key = att.studentName.trim();
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        studentName: key,
        grade: att.grade,
        section: att.section,
        stream: att.stream,
        batch: att.batch,
        mentorName: att.mentorName,
        attendanceAvg: 0,
        objectiveAvg: 0,
        subjectiveAvg: 0,
        overallAvg: 0,
        isZeroAttendance: false,
        isFlagged: false,
        isDiscontinued: false,
        recentWeekZeroAttendance: [],
        subjectBreakdown: {},
      });
    }
  });

  // Also include students from objective/subjective/discontinuation who might not have attendance
  objective.forEach((obj) => {
    const key = obj.studentName.trim();
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        studentName: key,
        grade: obj.grade,
        section: obj.section,
        stream: obj.stream,
        batch: obj.batch,
        mentorName: obj.mentorName || 'Unassigned',
        attendanceAvg: 0,
        objectiveAvg: 0,
        subjectiveAvg: 0,
        overallAvg: 0,
        isZeroAttendance: false,
        isFlagged: false,
        isDiscontinued: false,
        recentWeekZeroAttendance: [],
        subjectBreakdown: {},
      });
    }
  });

  subjective.forEach((sub) => {
    const key = sub.studentName.trim();
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        studentName: key,
        grade: sub.grade,
        section: sub.section,
        stream: sub.stream,
        batch: sub.batch,
        mentorName: sub.mentorName || 'Unassigned',
        attendanceAvg: 0,
        objectiveAvg: 0,
        subjectiveAvg: 0,
        overallAvg: 0,
        isZeroAttendance: false,
        isFlagged: false,
        isDiscontinued: false,
        recentWeekZeroAttendance: [],
        subjectBreakdown: {},
      });
    }
  });

  discontinuation.forEach((disc) => {
    const key = disc.studentName.trim();
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        studentName: key,
        grade: disc.grade,
        section: disc.section,
        stream: disc.stream,
        batch: disc.batch || 'Impact',
        mentorName: disc.mentorName || 'Unassigned',
        attendanceAvg: 0,
        objectiveAvg: 0,
        subjectiveAvg: 0,
        overallAvg: 0,
        isZeroAttendance: false,
        isFlagged: false,
        isDiscontinued: true,
        recentWeekZeroAttendance: [],
        subjectBreakdown: {},
      });
    }
  });

  // Calculate stats for each student
  const summaries: StudentSummary[] = [];

  studentMap.forEach((student, key) => {
    // Attendance: Filter out weeks where no class occurred (totalClasses <= 0 or date/week == '-')
    const studentAtts = attendance.filter((a) => a.studentName.trim() === key);
    const validAtts = studentAtts.filter(
      (a) => a.totalClasses > 0 && a.date !== '-' && a.week !== '-' && a.attendancePercentage !== null && a.attendancePercentage !== undefined
    );

    if (validAtts.length > 0) {
      const attSum = validAtts.reduce((sum, a) => sum + (a.attendancePercentage || 0), 0);
      student.attendanceAvg = Math.round((attSum / validAtts.length) * 10) / 10;
      const zeroWeeks = Array.from(
        new Set(
          validAtts
            .filter((a) => a.totalClasses > 0 && a.attendancePercentage === 0)
            .map((a) => a.week)
        )
      );
      student.recentWeekZeroAttendance = zeroWeeks;
      if (zeroWeeks.length > 0 || (validAtts.length > 0 && student.attendanceAvg === 0)) {
        student.isZeroAttendance = true;
      } else {
        student.isZeroAttendance = false;
      }
    } else {
      student.attendanceAvg = 100; // Default or leave unpenalized if no classes occurred
      student.isZeroAttendance = false;
      student.recentWeekZeroAttendance = [];
    }

    // Objective
    const studentObjs = objective.filter((o) => o.studentName.trim() === key);
    if (studentObjs.length > 0) {
      const objSum = studentObjs.reduce((sum, o) => sum + (o.testPercentage || 0), 0);
      student.objectiveAvg = Math.round((objSum / studentObjs.length) * 10) / 10;

      // Aggregate subject breakdown
      const lastObj = studentObjs[studentObjs.length - 1];
      student.subjectBreakdown = {
        physics: lastObj.physics !== null ? lastObj.physics : undefined,
        chemistry: lastObj.chemistry !== null ? lastObj.chemistry : undefined,
        maths: lastObj.maths !== null ? lastObj.maths : undefined,
        zoology: lastObj.zoology !== null ? lastObj.zoology : undefined,
        botany: lastObj.botany !== null ? lastObj.botany : undefined,
        sst: lastObj.sst !== null ? lastObj.sst : undefined,
        biology: lastObj.biology !== null ? lastObj.biology : undefined,
        english: lastObj.english !== null ? lastObj.english : undefined,
      };
    }

    // Subjective
    const studentSubs = subjective.filter((s) => s.studentName.trim() === key);
    if (studentSubs.length > 0) {
      const subSum = studentSubs.reduce((sum, s) => sum + (s.percentage || 0), 0);
      student.subjectiveAvg = Math.round((subSum / studentSubs.length) * 10) / 10;
    }

    // Discontinuation
    const discRec = discontinuation.find((d) => d.studentName.trim() === key);
    if (discRec) {
      student.isDiscontinued = true;
      student.discontinuationDetails = discRec;
    }

    // Overall Avg
    student.overallAvg = Math.round(((student.attendanceAvg + student.objectiveAvg + student.subjectiveAvg) / 3) * 10) / 10;

    // Flagged Criteria: Less than 75 in all three (Attendance, Objective, Subjective)
    student.isFlagged =
      student.attendanceAvg < 75 && student.objectiveAvg < 75 && student.subjectiveAvg < 75;

    summaries.push(student);
  });

  return summaries;
}

export function applyFilters(
  students: StudentSummary[],
  filters: FilterState
): StudentSummary[] {
  return students.filter((student) => {
    // Mentor
    if (filters.mentors.length > 0 && !filters.mentors.includes(student.mentorName)) {
      return false;
    }
    // Batch
    if (filters.batches.length > 0 && !filters.batches.includes(student.batch)) {
      return false;
    }
    // Section
    if (filters.sections.length > 0 && !filters.sections.includes(student.section)) {
      return false;
    }
    // Stream
    if (filters.streams.length > 0 && !filters.streams.includes(student.stream)) {
      return false;
    }
    // Grade
    if (filters.grades.length > 0 && !filters.grades.includes(student.grade)) {
      return false;
    }
    // Search Query
    if (filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase().trim();
      const matchName = student.studentName.toLowerCase().includes(query);
      const matchMentor = student.mentorName.toLowerCase().includes(query);
      const matchBatch = student.batch.toLowerCase().includes(query);
      if (!matchName && !matchMentor && !matchBatch) {
        return false;
      }
    }
    return true;
  });
}

export function isInvalidMentorName(mentorName: string | undefined | null): boolean {
  if (!mentorName) return true;
  const name = mentorName.trim().toLowerCase();
  if (
    name === '' ||
    name === 'unassigned' ||
    name === '#na' ||
    name === '#n/a' ||
    name === 'n/a' ||
    name === 'na' ||
    name === 'discontinue' ||
    name === 'discontinued'
  ) {
    return true;
  }
  return false;
}

export function calculateMentorLeaderboard(
  summaries: StudentSummary[],
  logs: FollowupLog[],
  discontinuation: DiscontinuationRecord[],
  attendanceRecords?: AttendanceRecord[],
  objectiveRecords?: ObjectiveRecord[],
  subjectiveRecords?: SubjectiveRecord[],
  selectedWeek: string = 'All'
): MentorLeaderboardItem[] {
  // Filter out students assigned to invalid mentors (e.g. Discontinue, #NA, Unassigned)
  const validSummaries = summaries.filter((s) => !isInvalidMentorName(s.mentorName));

  // Collect all unique valid mentor names
  const mentorSet = new Set<string>();
  validSummaries.forEach((s) => mentorSet.add(s.mentorName.trim()));

  if (attendanceRecords) {
    attendanceRecords.forEach((a) => {
      if (!isInvalidMentorName(a.mentorName)) mentorSet.add(a.mentorName.trim());
    });
  }

  const leaderboard: MentorLeaderboardItem[] = [];

  mentorSet.forEach((mentorName) => {
    // Mentor's active students
    const mentorStudents = validSummaries.filter((s) => s.mentorName.trim() === mentorName);
    const totalStudents = mentorStudents.length;

    // Filter week-specific attendance records
    let mentorWeekAtt = attendanceRecords
      ? attendanceRecords.filter((a) => a.mentorName.trim() === mentorName)
      : [];
    if (selectedWeek !== 'All') {
      mentorWeekAtt = mentorWeekAtt.filter((a) => a.week === selectedWeek);
    }

    // Attendance Avg
    let batchAttendanceAvg = 0;
    if (selectedWeek !== 'All' && mentorWeekAtt.length > 0) {
      const attSum = mentorWeekAtt.reduce((s, a) => s + (a.attendancePercentage || 0), 0);
      batchAttendanceAvg = Math.round((attSum / mentorWeekAtt.length) * 10) / 10;
    } else {
      const attSum = mentorStudents.reduce((s, st) => s + st.attendanceAvg, 0);
      batchAttendanceAvg = totalStudents > 0 ? Math.round((attSum / totalStudents) * 10) / 10 : 0;
    }

    // Objective & Subjective Avg for selected scope/week
    let mentorObj = objectiveRecords
      ? objectiveRecords.filter((o) => o.mentorName.trim() === mentorName)
      : [];
    let mentorSub = subjectiveRecords
      ? subjectiveRecords.filter((s) => s.mentorName.trim() === mentorName)
      : [];

    if (selectedWeek !== 'All') {
      mentorSub = mentorSub.filter((s) => s.week === selectedWeek);
      // Objective records filter if week matches or for students active in that week
    }

    let objectiveAvg = 0;
    if (mentorObj.length > 0) {
      const objSum = mentorObj.reduce((s, o) => s + (o.testPercentage || 0), 0);
      objectiveAvg = Math.round((objSum / mentorObj.length) * 10) / 10;
    } else {
      const objSum = mentorStudents.reduce((s, st) => s + st.objectiveAvg, 0);
      objectiveAvg = totalStudents > 0 ? Math.round((objSum / totalStudents) * 10) / 10 : 0;
    }

    let subjectiveAvg = 0;
    if (mentorSub.length > 0) {
      const subSum = mentorSub.reduce((s, sub) => s + (sub.percentage || 0), 0);
      subjectiveAvg = Math.round((subSum / mentorSub.length) * 10) / 10;
    } else {
      const subSum = mentorStudents.reduce((s, st) => s + st.subjectiveAvg, 0);
      subjectiveAvg = totalStudents > 0 ? Math.round((subSum / totalStudents) * 10) / 10 : 0;
    }

    const testCombinedAvg = Math.round(((objectiveAvg + subjectiveAvg) / 2) * 10) / 10;

    // Check if tests exist/were conducted in this week/scope
    const hasTests = objectiveAvg > 0 || subjectiveAvg > 0 || (selectedWeek === 'All' && testCombinedAvg > 0);

    // Zero Attendance
    let zeroAttendanceCount = 0;
    if (selectedWeek !== 'All' && mentorWeekAtt.length > 0) {
      zeroAttendanceCount = mentorWeekAtt.filter((a) => a.attendancePercentage === 0).length;
    } else {
      zeroAttendanceCount = mentorStudents.filter((st) => st.isZeroAttendance).length;
    }

    // Zero Attendance Log Completion %
    const mentorLogs = logs.filter(
      (l) => l.mentorName.trim() === mentorName && l.sourceTab === 'ZeroAttendance'
    );

    let zeroAttendanceLoggedCount = 0;
    if (selectedWeek !== 'All' && mentorWeekAtt.length > 0) {
      const zeroStudentsThisWeek = mentorWeekAtt.filter((a) => a.attendancePercentage === 0);
      zeroStudentsThisWeek.forEach((a) => {
        const hasLog = mentorLogs.some(
          (l) => l.studentName.trim() === a.studentName.trim() && l.currentStage !== 'Pending'
        );
        if (hasLog) zeroAttendanceLoggedCount++;
      });
    } else {
      const zeroStudents = mentorStudents.filter((st) => st.isZeroAttendance);
      zeroAttendanceLoggedCount = zeroLogsLogged(zeroStudents, mentorLogs);
    }

    const zeroAttendanceCompletionPct =
      zeroAttendanceCount > 0
        ? Math.min(100, Math.round((zeroAttendanceLoggedCount / zeroAttendanceCount) * 100))
        : 100;

    // Discontinuation
    const mentorDiscontinued = discontinuation.filter((d) => d.mentorName.trim() === mentorName);
    const discontinuationCount = mentorDiscontinued.length;
    const discontinuationRatePct =
      totalStudents > 0 ? Math.round((discontinuationCount / totalStudents) * 1000) / 10 : 0;

    // Discontinuation Score (out of 100, higher disc = lower score)
    const discontinuationScore = Math.max(0, Math.round(100 - discontinuationRatePct * 2));

    // Weightage calculation:
    // Case A: Test Available
    // Attendance 20%, Zero Completion 30%, Objective 15%, Subjective 15%, Discontinuation 20%
    // Case B: No Test Available
    // Attendance 40%, Zero Completion 35%, Discontinuation 25%

    let attendanceScoreContribution = 0;
    let zeroCompletionContribution = 0;
    let objectiveContribution = 0;
    let subjectiveContribution = 0;
    let discontinuationContribution = 0;
    let criteriaType: 'With Test (20/30/15/15/20)' | 'No Test (40/35/25)';

    if (hasTests) {
      criteriaType = 'With Test (20/30/15/15/20)';
      attendanceScoreContribution = Math.round((batchAttendanceAvg * 0.20) * 10) / 10;
      zeroCompletionContribution = Math.round((zeroAttendanceCompletionPct * 0.30) * 10) / 10;
      objectiveContribution = Math.round((objectiveAvg * 0.15) * 10) / 10;
      subjectiveContribution = Math.round((subjectiveAvg * 0.15) * 10) / 10;
      discontinuationContribution = Math.round((discontinuationScore * 0.20) * 10) / 10;
    } else {
      criteriaType = 'No Test (40/35/25)';
      attendanceScoreContribution = Math.round((batchAttendanceAvg * 0.40) * 10) / 10;
      zeroCompletionContribution = Math.round((zeroAttendanceCompletionPct * 0.35) * 10) / 10;
      objectiveContribution = 0;
      subjectiveContribution = 0;
      discontinuationContribution = Math.round((discontinuationScore * 0.25) * 10) / 10;
    }

    const compositeScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          attendanceScoreContribution +
            zeroCompletionContribution +
            objectiveContribution +
            subjectiveContribution +
            discontinuationContribution
        )
      )
    );

    const badges: string[] = [];
    if (batchAttendanceAvg >= 90) badges.push('Attendance Champion');
    if (zeroAttendanceCompletionPct === 100 && zeroAttendanceCount > 0)
      badges.push('Zero Followup Leader');
    if (discontinuationCount === 0) badges.push('Retention Master');
    if (hasTests && testCombinedAvg >= 85) badges.push('Academic Excellence');

    leaderboard.push({
      mentorName,
      totalStudents,
      batchAttendanceAvg,
      objectiveAvg,
      subjectiveAvg,
      testCombinedAvg,
      hasTests,
      criteriaType,
      zeroAttendanceCount,
      zeroAttendanceLoggedCount,
      zeroAttendanceCompletionPct,
      discontinuationCount,
      discontinuationRatePct,
      discontinuationScore,
      attendanceScoreContribution,
      zeroCompletionContribution,
      objectiveContribution,
      subjectiveContribution,
      discontinuationContribution,
      compositeScore,
      rank: 0,
      badges,
    });
  });

  // Sort by composite score desc
  leaderboard.sort((a, b) => b.compositeScore - a.compositeScore);

  // Assign ranks
  leaderboard.forEach((item, index) => {
    item.rank = index + 1;
  });

  return leaderboard;
}

function zeroLogsLogged(zeroStudents: StudentSummary[], mentorLogs: FollowupLog[]): number {
  let count = 0;
  zeroStudents.forEach((st) => {
    const hasLog = mentorLogs.some(
      (l) => l.studentName.trim() === st.studentName.trim() && l.currentStage !== 'Pending'
    );
    if (hasLog) count++;
  });
  return count;
}

export function getReasonBucketCounts(
  logs: FollowupLog[],
  discontinuation: DiscontinuationRecord[]
): Record<ReasonBucket, number> {
  const counts: Record<ReasonBucket, number> = REASON_BUCKETS.reduce((acc, curr) => {
    acc[curr] = 0;
    return acc;
  }, {} as Record<ReasonBucket, number>);

  logs.forEach((log) => {
    if (log.reasonBucket && counts[log.reasonBucket] !== undefined) {
      counts[log.reasonBucket]++;
    }
  });

  discontinuation.forEach((disc) => {
    if (disc.reasonBucket && counts[disc.reasonBucket] !== undefined) {
      counts[disc.reasonBucket]++;
    }
  });

  return counts;
}
