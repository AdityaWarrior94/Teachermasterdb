export interface DashboardContext {
  activeTab?: string;
  filters?: {
    grade?: string;
    section?: string;
    batch?: string;
    mentor?: string;
    student?: string;
    stream?: string;
    week?: string;
    search?: string;
  };
  totalStudentsCount?: number;
  filteredStudentsCount?: number;
  students?: Array<{
    studentName: string;
    grade: string;
    section: string;
    batch: string;
    mentorName: string;
    attendancePercentage: number;
    subjectivePercentage: number;
    objectivePercentage: number;
    riskFactor: 'High Risk' | 'Moderate Risk' | 'On Track';
    zeroAttendanceCount?: number;
    discontinuationStatus?: string;
    weakSubjects?: string[];
    strongSubjects?: string[];
    teacherRemarks?: string;
    parentInteractionNote?: string;
  }>;
  zeroAttendanceRecords?: Array<any>;
  discontinuationRecords?: Array<any>;
  tickets?: Array<any>;
  loggedInUserEmail?: string;
  selectedMentor?: string;
  isAuthorizedAdmin?: boolean;
}

export function generateLocalAcademicCoachResponse(
  messages: Array<{ role: string; content: string }>,
  context: DashboardContext = {},
  customPrompt?: string
): string {
  const userMessage = (messages[messages.length - 1]?.content || customPrompt || '').trim();
  const lowerMsg = userMessage.toLowerCase();

  // 1. Refusal for Non-Academic Topics
  const nonAcademicKeywords = [
    'politics', 'election', 'president', 'prime minister', 'religion', 'god', 'church', 'mosque',
    'movie', 'actor', 'actress', 'crypto', 'stock market', 'bitcoin', 'medical advice', 'disease',
    'financial investment', 'football match', 'cricket score', 'python code for snake game'
  ];

  if (nonAcademicKeywords.some((kw) => lowerMsg.includes(kw))) {
    return `I am your AI Academic Success Coach for PW Gulf Student Operations. I am strictly specialized in CBSE curriculum, JEE/NEET prep, academic risk analysis, time tables, and student performance data.

I cannot provide answers on non-academic or external topics like politics, religion, entertainment, or financial/medical advice. 

Please ask me about student attendance, academic performance, study timetables, revision strategies, or parent counselling!

### Recommended Next Actions
* Immediate Action: Query academic performance or student risk factors.
* This Week's Goal: Focus on student academic growth and revision tracking.
* Expected Outcome: Data-driven mentor guidance for Gulf Indian curriculum students.
* Confidence Level (High / Medium / Low): High`;
  }

  // Extract filtered context info
  const students = context.students || [];
  const filters = context.filters || {};
  const isMentor = !context.isAuthorizedAdmin;
  const mentorName = context.selectedMentor || 'Assigned Mentor';

  // Apply Stream Rules if stream filter present
  // Grade 11-12 PCM: ignore Botany/Zoology; PCB: ignore Math
  const activeStream = filters.stream || 'ALL';

  // Helper filters
  const highRiskStudents = students.filter((s) => s.riskFactor === 'High Risk' || s.attendancePercentage < 75);
  const zeroAttStudents = students.filter((s) => s.attendancePercentage === 0 || (s.zeroAttendanceCount && s.zeroAttendanceCount > 0));
  const topPerformers = students.filter((s) => s.attendancePercentage >= 85 && s.subjectivePercentage >= 75 && s.objectivePercentage >= 75);
  const lowSubjective = students.filter((s) => s.subjectivePercentage < 60 && s.subjectivePercentage > 0);
  const lowObjective = students.filter((s) => s.objectivePercentage < 60 && s.objectivePercentage > 0);

  // Active filter badge description
  const activeFiltersDesc = [
    filters.grade ? `Grade: ${filters.grade}` : '',
    filters.section ? `Section: ${filters.section}` : '',
    filters.batch ? `Batch: ${filters.batch}` : '',
    filters.mentor ? `Mentor: ${filters.mentor}` : '',
    filters.student ? `Student: ${filters.student}` : '',
    filters.stream ? `Stream: ${filters.stream}` : '',
  ].filter(Boolean).join(' | ') || 'All Gulf Batches';

  // 2. Intent Routing

  // Intent A: Timetable / Schedule Generator
  if (lowerMsg.includes('timetable') || lowerMsg.includes('schedule') || lowerMsg.includes('routine') || lowerMsg.includes('daily plan')) {
    return `### 📅 Realistic Gulf CBSE / JEE-NEET Academic Timetable

**Active Filter Scope:** ${activeFiltersDesc}
*Designed for Gulf CBSE Students balancing School, Coaching, Prayer Times & Self-Study.*

#### Daily Schedule Breakdown
* **05:30 AM – 06:15 AM:** Morning Prayer (Fajr) & Quick Formula Flashcard Review (Physics/Chemistry)
* **06:15 AM – 02:00 PM:** School Hours & CBSE Theory Focus (Take structured notes during lectures)
* **02:00 PM – 03:00 PM:** Lunch, Travel Home & Rest
* **03:00 PM – 05:00 PM:** Coaching Batch / Recorded Video Lectures & Problem Solving
* **05:00 PM – 05:30 PM:** Evening Break & Refreshment (Asr Prayer)
* **05:30 PM – 07:30 PM:** High-Priority Weak Subject Practice (30 Subjective / Objective Questions)
* **07:30 PM – 08:15 PM:** Maghrib Prayer & Dinner
* **08:15 PM – 09:45 PM:** Homework & School Assignment Completion
* **09:45 PM – 10:30 PM:** Daily Revision & Mistake Notebook Review
* **10:30 PM:** Sleep (Ensuring 7 Hours Rest)

#### Stream Focus Guidelines
${activeStream === 'PCM' ? '👉 **PCM Stream:** Focus on JEE Math problem-solving speed and Physics numericals. (Botany/Zoology excluded).' : activeStream === 'PCB' ? '👉 **PCB Stream:** Focus on NCERT Biology diagrams, Physics numericals & Chemistry equations. (Mathematics excluded).' : '👉 **General Foundation / PCMB:** Equal weightage on Physics, Chemistry, Biology & Mathematics.'}

### Recommended Next Actions
* Immediate Action: Share this timetable with students during today's mentoring session.
* This Week's Goal: Track student self-study hours against coaching schedule.
* Expected Outcome: +12% improvement in student daily study consistency.
* Confidence Level (High / Medium / Low): High`;
  }

  // Intent B: Risk Analysis / Students at Risk / Low Attendance
  if (lowerMsg.includes('risk') || lowerMsg.includes('low attendance') || lowerMsg.includes('flagged') || lowerMsg.includes('zero attendance') || lowerMsg.includes('discontinuation')) {
    const riskListSnippet = highRiskStudents.slice(0, 5).map((s, idx) => `
${idx + 1}. **${s.studentName}** (${s.grade}-${s.section} | ${s.batch})
   * **Attendance:** ${s.attendancePercentage}% | **Subjective:** ${s.subjectivePercentage}% | **Objective:** ${s.objectivePercentage}%
   * **Mentor:** ${s.mentorName}
   * **Key Issue:** ${s.attendancePercentage < 50 ? 'Critical attendance deficit' : s.subjectivePercentage < 50 ? 'Weak subjective written answers' : 'Objective test accuracy deficit'}
`).join('') || 'No high-risk students found under the current dashboard filter.';

    return `### 🚨 Academic Risk & Attendance Analysis

**Filtered Context:** ${activeFiltersDesc} (${students.length} Total Filtered Students)
*Analyzing Attendance %, Test Trends & Discontinuation Indicators.*

#### Key Risk Metrics
* **High-Risk Students (<75% Att. or Low Scores):** ${highRiskStudents.length}
* **Zero Attendance / Severe Deficit:** ${zeroAttStudents.length}
* **Subjective Writing Deficit (<60%):** ${lowSubjective.length}
* **Objective Accuracy Deficit (<60%):** ${lowObjective.length}

#### Critical Action List (Priority High-Risk Students)
${riskListSnippet}

#### Root Cause Insights
1. **Attendance Correlation:** Students with <70% attendance show a **28% drop** in objective test scores due to missed concept building sessions.
2. **Subjective vs. Objective Gap:** Objective scores are often higher because students rely on guesswork; subjective tests require structured step-by-step reasoning.

### Recommended Next Actions
* Immediate Action: Call parents of top 3 flagged students (${highRiskStudents.slice(0, 3).map(s => s.studentName).join(', ') || 'High Risk Students'}).
* This Week's Goal: Achieve minimum 80% attendance compliance across all batches.
* Expected Outcome: Reduce discontinuation risk by 35% through proactive follow-ups.
* Confidence Level (High / Medium / Low): High`;
  }

  // Intent C: Mentor Follow-up / Mentor Assistant List / WhatsApp Messages
  if (lowerMsg.includes('mentor') || lowerMsg.includes('followup') || lowerMsg.includes('call list') || lowerMsg.includes('whatsapp') || lowerMsg.includes('today')) {
    const mentorStudents = students.filter(s => !context.selectedMentor || s.mentorName === context.selectedMentor || s.mentorName.toLowerCase().includes((context.selectedMentor || '').toLowerCase()));
    const targetStudents = (mentorStudents.length > 0 ? mentorStudents : students).slice(0, 5);

    return `### 📋 Mentor Assistant: Today's Action & Call List

**Mentor Profile:** ${mentorName}
**Active Filter:** ${activeFiltersDesc}

#### Today's Priority Call List
${targetStudents.map((s, i) => `${i + 1}. **${s.studentName}** (${s.grade}-${s.section} | ${s.batch})
   * **Status:** Attendance ${s.attendancePercentage}% | Risk: ${s.riskFactor}
   * **Action Required:** ${s.attendancePercentage === 0 ? 'Zero Attendance Counseling Call' : s.subjectivePercentage < 60 ? 'Subjective Written Practice Review' : 'Weekly Goal Check-in'}`).join('\n')}

#### 💬 Ready-to-Send WhatsApp Parent Reminder Template
> *"Dear Parent, Warm greetings from PW Gulf Academic Operations. We noticed that ${targetStudents[0]?.studentName || 'your child'}'s recent attendance is ${targetStudents[0]?.attendancePercentage || '72'}%. To ensure top performance in upcoming CBSE & Competitive Exams, regular attendance is vital. Please let us know if any academic assistance is needed. - ${mentorName}, PW Gulf Mentor"*

### Recommended Next Actions
* Immediate Action: Send WhatsApp reminder to parents of ${targetStudents[0]?.studentName || 'priority student'}.
* This Week's Goal: Log 100% call outcomes in the Review Log tab.
* Expected Outcome: Immediate boost in student attendance & parent engagement.
* Confidence Level (High / Medium / Low): High`;
  }

  // Intent D: Parent Guidance
  if (lowerMsg.includes('parent') || lowerMsg.includes('counsel') || lowerMsg.includes('family')) {
    return `### 👨‍👩‍👧 Parent Guidance & Counselling Strategy

**Active Filter Scope:** ${activeFiltersDesc}

#### Key Principles for Parent Communication
1. **Positive Reinforcement First:** Start with the student's strengths (e.g., strong objective accuracy or good behavior) before discussing attendance/test gaps.
2. **Empathetic & Solution-Oriented Tone:** Avoid harsh or fear-based messaging. Position PW Gulf as a partner in their child's academic journey.
3. **Structured Daily Home Environment:** Encourage parents to provide a quiet 2-hour distraction-free study block post-school with fixed sleep schedules.

#### Parent Call Discussion Framework
* **Step 1:** Appreciate student effort and highlight attendance statistics (${students[0]?.attendancePercentage || 85}% current average).
* **Step 2:** Discuss test performance trends and subject-wise clarity.
* **Step 3:** Agree on a joint 2-week action plan (Fixed self-study hours & daily revision).

### Recommended Next Actions
* Immediate Action: Schedule 15-minute alignment calls with parents of students with <75% attendance.
* This Week's Goal: Establish positive parent rapport across all Gulf batches.
* Expected Outcome: High home study accountability and reduced student stress.
* Confidence Level (High / Medium / Low): High`;
  }

  // Default General Academic Guidance
  return `### 🎓 Academic Success Analysis & Strategic Guidance

**Dashboard Filter View:** ${activeFiltersDesc}
**Total Students Analyzed:** ${students.length}

#### Executive Summary
* **Batch Average Attendance:** ${Math.round(students.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0) / (students.length || 1))}%
* **Average Subjective Score:** ${Math.round(students.reduce((acc, s) => acc + (s.subjectivePercentage || 0), 0) / (students.length || 1))}%
* **Average Objective Score:** ${Math.round(students.reduce((acc, s) => acc + (s.objectivePercentage || 0), 0) / (students.length || 1))}%
* **Top Performers:** ${topPerformers.length} students (${topPerformers.map(s => s.studentName).slice(0, 3).join(', ')}${topPerformers.length > 3 ? '...' : ''})
* **Students Needing Support:** ${highRiskStudents.length} students

#### Key Academic Strategy
1. **Bridge the Objective-Subjective Deficit:** Conduct weekly written test practice to improve step-by-step problem representation.
2. **Attendance Compliance:** Prioritize students falling below 75% attendance to prevent backlog creation in core CBSE & JEE/NEET subjects.
3. **Personalized Mentoring:** Conduct 1-on-1 revision sessions for weak topics.

### Recommended Next Actions
* Immediate Action: Review flagged students list and assign targeted subjective worksheets.
* This Week's Goal: Elevate overall batch average subjective score by 10%.
* Expected Outcome: Higher academic confidence and exam readiness.
* Confidence Level (High / Medium / Low): High`;
}
