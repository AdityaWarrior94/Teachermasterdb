export type Stream = 'PCMB' | 'PCM' | 'PCB' | 'Commerce' | 'Arts';
export type Grade = '8' | '9' | '10' | '11' | '12';

export interface AttendanceRecord {
  id: string;
  week: string;
  date: string;
  studentName: string;
  grade: string;
  section: string;
  stream: string;
  batch: string;
  totalPresent: number;
  totalClasses: number;
  attendancePercentage: number;
  mentorName: string;
}

export interface ObjectiveRecord {
  id: string;
  objectiveName?: string;
  studentName: string;
  grade: string;
  section: string;
  stream: string;
  batch: string;
  physics: number | null;
  chemistry: number | null;
  maths: number | null;
  zoology: number | null;
  botany: number | null;
  sst: number | null;
  biology: number | null;
  english: number | null;
  marksAchieved: number;
  subjectsCount: number;
  totalMarks: number;
  testPercentage: number;
  mentorName?: string;
  week?: string;
}

export interface SubjectiveRecord {
  id: string;
  week: string;
  dateRange: string;
  studentName: string;
  grade: string;
  section: string;
  stream: string;
  batch: string;
  subject: string;
  totalMarks: number;
  marksAchieved: number;
  percentage: number;
  mentorName?: string;
}

export interface DiscontinuationRecord {
  id: string;
  studentName: string;
  grade: string;
  section: string;
  stream: string;
  batch?: string;
  admissionDate: string;
  month: string;
  status: string;
  comment: string;
  mentorComments: string;
  contact1: string;
  contact2: string;
  date: string;
  mentorName: string;
  reasonBucket?: ReasonBucket;
}

export type ZeroAttendanceReasonBucket =
  | 'On vacation'
  | 'Recorded'
  | 'No Response'
  | 'Present'
  | 'Discontinued'
  | 'Others'
  | 'Due To Exams'
  | 'Medical Emergency'
  | 'Access Revoked'
  | 'Lack of Interest';

export const ZERO_ATTENDANCE_REASON_BUCKETS: ZeroAttendanceReasonBucket[] = [
  'On vacation',
  'Recorded',
  'No Response',
  'Present',
  'Discontinued',
  'Others',
  'Due To Exams',
  'Medical Emergency',
  'Access Revoked',
  'Lack of Interest',
];

export type DiscontinuationReasonBucket =
  | 'Personal / No Reason Shared'
  | 'Moving back to homecountry'
  | 'Need Offline Classes / Joined other institution'
  | 'Academic Concern'
  | 'Stream change'
  | 'Moved to PW Offline / India'
  | 'Parent lost job / Financial Issues'
  | 'Access Revoked / No Contact'
  | 'Medical Issue'
  | 'Timing Issue'
  | 'False commitment / wrong Admission'
  | 'Others';

export const DISCONTINUATION_REASON_BUCKETS: DiscontinuationReasonBucket[] = [
  'Personal / No Reason Shared',
  'Moving back to homecountry',
  'Need Offline Classes / Joined other institution',
  'Academic Concern',
  'Stream change',
  'Moved to PW Offline / India',
  'Parent lost job / Financial Issues',
  'Access Revoked / No Contact',
  'Medical Issue',
  'Timing Issue',
  'False commitment / wrong Admission',
  'Others',
];

export const REASON_BUCKETS = DISCONTINUATION_REASON_BUCKETS;

export type ReasonBucket = ZeroAttendanceReasonBucket | DiscontinuationReasonBucket | string;

export type FollowupStage = 'Pending' | 'In Progress' | 'Doubt Scheduled' | 'Followed Up' | 'Resolved' | 'Closed';

export interface StageHistoryItem {
  id: string;
  timestamp: string;
  stage: FollowupStage;
  actionBy: string;
  note: string;
  scheduledDoubtDate?: string;
  scheduledDoubtTopic?: string;
  reasonBucket?: ReasonBucket;
}

export interface TaggedStudentItem {
  studentName: string;
  grade?: string;
  section?: string;
  batch?: string;
  weekAttendancePct?: number;
  lastWeekAttendancePct?: number;
  status?: 'Open' | 'In Progress' | 'Closed';
}

export interface AdminTicket {
  id: string;
  mentorName: string;
  mentorEmail: string;
  studentName: string;
  taggedStudents?: TaggedStudentItem[];
  week?: string;
  category: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  message: string;
  deadlineDate: string;
  createdDate: string;
  status: 'Open' | 'In Progress' | 'Closed';
  adminClosingNote?: string;
  mentorProgressNote?: string;
  closedDate?: string;
  emailSent?: boolean;
}

export interface MentorContact {
  id: string;
  mentorName: string;
  officialEmail: string;
  alternateEmail?: string;
  phone?: string;
  department?: string;
  activeStatus: 'Active' | 'On Leave' | 'Inactive';
  notes?: string;
  updatedAt: string;
}

export interface MentorResponseLog {
  id: string;
  mentorName: string;
  mentorEmail: string;
  ticketRefId?: string;
  responseDate: string;
  responseSummary: string;
  actionTaken?: string;
  status: 'Received' | 'Reviewed' | 'Action Required' | 'Resolved';
  loggedBy: string;
  updatedAt: string;
}

export interface FollowupLog {
  id: string;
  studentName: string;
  grade: string;
  section: string;
  mentorName: string;
  sourceTab: 'ZeroAttendance' | 'Flagged' | 'ReviewLog' | 'Discontinuation';
  currentStage: FollowupStage;
  reasonBucket: ReasonBucket;
  scheduledDoubtDate?: string;
  scheduledDoubtTopic?: string;
  notes: string;
  history: StageHistoryItem[];
  updatedAt: string;
  assignedTicketId?: string;
  deadlineDate?: string;
  adminRemarks?: string;
}

export interface SubjectActionPlan {
  subject: string;
  improvementComment: string;
  topicRevised: string;
  lectureRevised: string;
  timeSpentHours: number | string;
}

export interface PremiumActionPlan {
  id: string;
  studentName: string;
  teacherName: string;
  updatedAt: string;
  overallRemark: string;
  subjects: SubjectActionPlan[];
}

export interface StudentSummary {
  studentName: string;
  grade: string;
  section: string;
  stream: string;
  batch: string;
  mentorName: string;
  attendanceAvg: number;
  objectiveAvg: number;
  subjectiveAvg: number;
  overallAvg: number;
  isZeroAttendance: boolean;
  isFlagged: boolean; // <75% in all three
  isDiscontinued: boolean;
  recentWeekZeroAttendance?: string[];
  discontinuationDetails?: DiscontinuationRecord;
  subjectBreakdown: {
    physics?: number;
    chemistry?: number;
    maths?: number;
    zoology?: number;
    botany?: number;
    sst?: number;
    biology?: number;
    english?: number;
  };
}

export interface FilterState {
  mentors: string[];
  batches: string[];
  sections: string[];
  streams: string[];
  grades: string[];
  searchQuery: string;
}

export type AppTheme = 'corporate' | 'dark' | 'contrast';

export interface MentorLeaderboardItem {
  mentorName: string;
  totalStudents: number;
  batchAttendanceAvg: number;
  objectiveAvg: number;
  subjectiveAvg: number;
  testCombinedAvg: number;
  hasTests: boolean;
  criteriaType: 'With Test (20/30/15/15/20)' | 'No Test (40/35/25)';
  zeroAttendanceCount: number;
  zeroAttendanceLoggedCount: number;
  zeroAttendanceCompletionPct: number;
  discontinuationCount: number;
  discontinuationRatePct: number;
  discontinuationScore: number;
  attendanceScoreContribution: number;
  zeroCompletionContribution: number;
  objectiveContribution: number;
  subjectiveContribution: number;
  discontinuationContribution: number;
  compositeScore: number;
  rank: number;
  badges: string[];
}
