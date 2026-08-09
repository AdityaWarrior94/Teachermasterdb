import {
  AttendanceRecord,
  ObjectiveRecord,
  SubjectiveRecord,
  DiscontinuationRecord,
  ReasonBucket,
  REASON_BUCKETS,
} from '../types';

function parseNumber(val: any, defaultVal: number = 0): number {
  if (val === null || val === undefined || val === '' || val === '-') return defaultVal;
  if (typeof val === 'number') return val;
  const str = String(val).replace(/%/g, '').replace(/,/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? defaultVal : num;
}

function parseNullableNumber(val: any): number | null {
  if (val === null || val === undefined || val === '' || val === '-' || val === 'NA') return null;
  if (typeof val === 'number') return val;
  const str = String(val).replace(/%/g, '').replace(/,/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function cleanStr(val: any, fallback: string = ''): string {
  if (val === null || val === undefined) return fallback;
  return String(val).trim();
}

export function mapRawAttendanceRows(rows: any[]): AttendanceRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row, index) => {
    const studentName = cleanStr(row.StudentName || row['Student Name'] || row.student_name, 'Unknown Student');
    const totalPresent = parseNumber(row.TotalPresent || row.total_present, 0);
    const totalClasses = parseNumber(row.TotalClasses || row.total_classes, 5);
    let pct = parseNumber(row.Attendance_age || row.Attendance_pct || row.Percentage || row.attendance_percentage, -1);

    if (pct < 0 && totalClasses > 0) {
      pct = Math.round((totalPresent / totalClasses) * 100);
    }

    return {
      id: `att-raw-${index}-${Date.now()}`,
      week: cleanStr(row.Week || row.week, 'Week1'),
      date: cleanStr(row.Date || row.date, 'N/A'),
      studentName,
      grade: cleanStr(row.Grade || row.grade, '8'),
      section: cleanStr(row.Section || row.section, 'A'),
      stream: cleanStr(row.Stream || row.stream, 'PCMB'),
      batch: cleanStr(row.Batch || row.batch, 'Impact'),
      totalPresent,
      totalClasses,
      attendancePercentage: Math.min(100, Math.max(0, pct)),
      mentorName: cleanStr(row.Mentor_Name || row.MentorName || row.mentor_name, 'Unassigned'),
    };
  });
}

export function mapRawObjectiveRows(rows: any[]): ObjectiveRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row, index) => {
    const studentName = cleanStr(row.StudentName || row['Student Name'], 'Unknown Student');
    const marksAchieved = parseNumber(row.MarksAchieved || row.marks_achieved, 0);
    const totalMarks = parseNumber(row.TotalMarks || row.total_marks, 160);
    let pct = parseNumber(row.TestPercentage || row.test_percentage || row.Percentage, -1);

    if (pct < 0 && totalMarks > 0) {
      pct = Math.round((marksAchieved / totalMarks) * 100);
    }

    return {
      id: `obj-raw-${index}-${Date.now()}`,
      studentName,
      grade: cleanStr(row.Grade || row.grade, '8'),
      section: cleanStr(row.Section || row.section, 'A'),
      stream: cleanStr(row.Stream || row.stream, 'PCMB'),
      batch: cleanStr(row.Batch || row.batch, 'Impact'),
      physics: parseNullableNumber(row.Physics || row.physics),
      chemistry: parseNullableNumber(row.Chemistry || row.chemistry),
      maths: parseNullableNumber(row.Maths || row.maths),
      zoology: parseNullableNumber(row.Zoology || row.zoology),
      botany: parseNullableNumber(row.Botany || row.botany),
      sst: parseNullableNumber(row.SST || row.sst),
      biology: parseNullableNumber(row.Biology || row.biology),
      english: parseNullableNumber(row.English || row.english),
      marksAchieved,
      subjectsCount: parseNumber(row.SUBJECTS || row.subjects_count, 4),
      totalMarks,
      testPercentage: Math.min(100, Math.max(0, pct)),
      mentorName: cleanStr(row.Mentor_Name || row.MentorName, 'Unassigned'),
    };
  });
}

export function mapRawSubjectiveRows(rows: any[]): SubjectiveRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row, index) => {
    const studentName = cleanStr(row.StudentName || row['Student Name'], 'Unknown Student');
    const marksAchieved = parseNumber(row.MarksAchieved || row.marks_achieved, 0);
    const totalMarks = parseNumber(row.TotalMarks || row.total_marks, 40);
    let pct = parseNumber(row.Percentage || row.percentage, -1);

    if (pct < 0 && totalMarks > 0) {
      pct = Math.round((marksAchieved / totalMarks) * 100);
    }

    return {
      id: `sub-raw-${index}-${Date.now()}`,
      week: cleanStr(row.Week || row.week, 'Week1'),
      dateRange: cleanStr(row.DateRange || row.Date || row.date, 'N/A'),
      studentName,
      grade: cleanStr(row.Grade || row.grade, '8'),
      section: cleanStr(row.Section || row.section, 'A'),
      stream: cleanStr(row.Stream || row.stream, 'PCMB'),
      batch: cleanStr(row.Batch || row.batch, 'Impact'),
      subject: cleanStr(row.Subject || row.subject, 'Subjective Test'),
      totalMarks,
      marksAchieved,
      percentage: Math.min(100, Math.max(0, pct)),
      mentorName: cleanStr(row.Mentor_Name || row.MentorName, 'Unassigned'),
    };
  });
}

export function mapRawDiscontinuationRows(rows: any[]): DiscontinuationRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row, index) => {
    const studentName = cleanStr(row.StudentName || row['Student Name'], 'Unknown Student');
    const comment = cleanStr(row.Comment || row.comment, 'No comment provided');

    // Auto classify bucket from comment text
    let matchedBucket: ReasonBucket = 'Personal / No Reason Shared';
    const cLower = comment.toLowerCase();
    if (cLower.includes('homecountry') || cLower.includes('home country')) {
      matchedBucket = 'Moving back to homecountry';
    } else if (cLower.includes('offline') && cLower.includes('online')) {
      matchedBucket = 'Need Offline Classes / Joined other institution';
    } else if (cLower.includes('pw offline') || cLower.includes('pw india')) {
      matchedBucket = 'Moved to PW Offline / India';
    } else if (cLower.includes('fee') || cLower.includes('cheaper') || cLower.includes('job') || cLower.includes('financial')) {
      matchedBucket = 'Parent lost job / Financial Issues';
    } else if (cLower.includes('commitment') || cLower.includes('counselor') || cLower.includes('admission')) {
      matchedBucket = 'False commitment / wrong Admission';
    } else if (cLower.includes('no response') || cLower.includes('revoked') || cLower.includes('access')) {
      matchedBucket = 'Access Revoked / No Contact';
    }

    return {
      id: `disc-raw-${index}-${Date.now()}`,
      studentName,
      grade: cleanStr(row.Grade || row.grade, '8'),
      section: cleanStr(row.Section || row.section, 'A'),
      stream: cleanStr(row.Stream || row.stream, 'PCMB'),
      batch: cleanStr(row.Batch || row.batch, 'Impact'),
      admissionDate: cleanStr(row.Admission_Date || row.AdmissionDate, 'N/A'),
      month: cleanStr(row.Month || row.month, 'N/A'),
      status: cleanStr(row.Status || row.status, 'Discontinued'),
      comment,
      mentorComments: cleanStr(row.Mentor_Comments || row.MentorComments, 'N/A'),
      contact1: cleanStr(row.Contact_1 || row.Contact1, 'N/A'),
      contact2: cleanStr(row.Contact_2 || row.Contact2, ''),
      date: cleanStr(row.Date || row.date, 'N/A'),
      mentorName: cleanStr(row.Mentor_Name || row.MentorName || row.mentor, 'Unassigned'),
      reasonBucket: matchedBucket,
    };
  });
}
