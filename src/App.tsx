import React, { useState, useMemo, useEffect } from 'react';
import {
  AttendanceRecord,
  ObjectiveRecord,
  SubjectiveRecord,
  DiscontinuationRecord,
  FollowupLog,
  FilterState,
  StudentSummary,
  ReasonBucket,
  AdminTicket,
  AppTheme,
} from './types';
import {
  INITIAL_ATTENDANCE,
  INITIAL_OBJECTIVE,
  INITIAL_SUBJECTIVE,
  INITIAL_DISCONTINUATION,
  INITIAL_LOGS,
} from './data/initialData';
import {
  calculateStudentSummaries,
  applyFilters,
  calculateMentorLeaderboard,
} from './utils/dataProcessor';
import {
  mapRawAttendanceRows,
  mapRawObjectiveRows,
  mapRawSubjectiveRows,
  mapRawDiscontinuationRows,
} from './utils/syncDataMapper';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { TabOverview } from './components/TabOverview';
import { TabZeroAttendance } from './components/TabZeroAttendance';
import { TabFlaggedStudents } from './components/TabFlaggedStudents';
import { TabReviewLog } from './components/TabReviewLog';
import { TabMasterInsights } from './components/TabMasterInsights';
import { TabDiscontinuation } from './components/TabDiscontinuation';
import { TabAdminTasks } from './components/TabAdminTasks';
import { LogModal } from './components/LogModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { SyncConfigModal } from './components/SyncConfigModal';
import { UserAuthModal, AUTHORIZED_ADMIN_EMAILS } from './components/UserAuthModal';
import { AcademicSuccessCoachChat } from './components/AcademicSuccessCoachChat';
import { Sparkles, Bot } from 'lucide-react';
import { DashboardLayoutProvider } from './context/DashboardLayoutContext';
import { HiddenPanelsBar } from './components/HiddenPanelsBar';

export default function App() {
  // Main Data States
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [objective, setObjective] = useState<ObjectiveRecord[]>(INITIAL_OBJECTIVE);
  const [subjective, setSubjective] = useState<SubjectiveRecord[]>(INITIAL_SUBJECTIVE);
  const [discontinuation, setDiscontinuation] = useState<DiscontinuationRecord[]>(INITIAL_DISCONTINUATION);
  const [logs, setLogs] = useState<FollowupLog[]>(INITIAL_LOGS);

  // User Auth & Mentor Access States
  const [loggedInUserEmail, setLoggedInUserEmail] = useState<string>(() => {
    return localStorage.getItem('pw_gulf_user_email') || 'Behuman93adi@gmail.com';
  });
  const [selectedMentor, setSelectedMentor] = useState<string>(() => {
    return localStorage.getItem('pw_gulf_selected_mentor') || '';
  });
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('pw_gulf_app_theme') as AppTheme) || 'corporate';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCoachChatOpen, setIsCoachChatOpen] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('theme-contrast');
    } else if (currentTheme === 'contrast') {
      root.classList.add('dark', 'theme-contrast');
    } else {
      root.classList.remove('dark', 'theme-contrast');
    }
  }, [currentTheme]);

  const isAuthorizedAdmin = useMemo(() => {
    return AUTHORIZED_ADMIN_EMAILS.some(
      (e) => e.toLowerCase() === loggedInUserEmail.trim().toLowerCase()
    );
  }, [loggedInUserEmail]);

  const handleUpdateUserEmail = (email: string) => {
    setLoggedInUserEmail(email);
    try {
      localStorage.setItem('pw_gulf_user_email', email);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSelectedMentor = (mentor: string) => {
    setSelectedMentor(mentor);
    try {
      localStorage.setItem('pw_gulf_selected_mentor', mentor);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTheme = (theme: AppTheme) => {
    setCurrentTheme(theme);
    try {
      localStorage.setItem('pw_gulf_app_theme', theme);
    } catch (e) {
      console.error(e);
    }
  };

  // Review Comments Map: studentName -> comment items
  const [reviewCommentsMap, setReviewCommentsMap] = useState<
    Record<string, { id: string; author: string; text: string; timestamp: string }[]>
  >({
    'Nishant Aditya (QATAR)': [
      {
        id: 'comm-1',
        author: 'Vibha Raj',
        text: 'Top performer in physics and biology. Excellent subject engagement.',
        timestamp: '2026-08-02 14:10',
      },
    ],
    'Saanvi Sushilkumar Shinde (QATAR)': [
      {
        id: 'comm-2',
        author: 'Rahul Sharma',
        text: 'Struggling with subjective mathematics test. Needs special 1-on-1 doubt session.',
        timestamp: '2026-08-04 11:30',
      },
    ],
  });

  // Admin Mentor Review Tickets State
  const [adminTickets, setAdminTickets] = useState<AdminTicket[]>(() => {
    try {
      const saved = localStorage.getItem('admin_mentor_tickets');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'ticket-1',
        mentorName: 'Vibha Raj',
        mentorEmail: 'vibha.raj@schoolmentors.org',
        studentName: 'Nishant Aditya (QATAR)',
        category: 'Academic Review',
        priority: 'High',
        message: 'Please review physics subjective test score and conduct 1-on-1 counseling session.',
        deadlineDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        createdDate: new Date().toLocaleDateString(),
        status: 'Open',
        emailSent: true,
      },
      {
        id: 'ticket-2',
        mentorName: 'Rahul Sharma',
        mentorEmail: 'rahul.sharma@schoolmentors.org',
        studentName: 'Saanvi Sushilkumar Shinde (QATAR)',
        category: 'Zero Attendance',
        priority: 'Critical',
        message: 'Student had 0% attendance last week. Please contact parents immediately.',
        deadlineDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        createdDate: new Date().toLocaleDateString(),
        status: 'Open',
        emailSent: true,
      },
    ];
  });

  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  const handleCreateTicket = (ticketData: Omit<AdminTicket, 'id' | 'createdDate' | 'status'>) => {
    const ticketId = `ticket-${Date.now()}`;
    const newTicket: AdminTicket = {
      ...ticketData,
      id: ticketId,
      createdDate: new Date().toLocaleDateString(),
      status: 'Open',
    };
    const updatedTickets = [newTicket, ...adminTickets];
    setAdminTickets(updatedTickets);
    try {
      localStorage.setItem('admin_mentor_tickets', JSON.stringify(updatedTickets));
    } catch (e) {
      console.error(e);
    }

    // Automatically create / update FollowupLog entries for tagged students
    if (newTicket.taggedStudents && newTicket.taggedStudents.length > 0) {
      const sourceTab: 'ZeroAttendance' | 'Flagged' =
        newTicket.category.includes('Flagged') ? 'Flagged' : 'ZeroAttendance';

      const newLogs = [...logs];

      newTicket.taggedStudents.forEach((st) => {
        const studentName = st.studentName.trim();
        const existingIdx = newLogs.findIndex(
          (l) => l.studentName.trim().toLowerCase() === studentName.toLowerCase() && l.sourceTab === sourceTab
        );

        const newHistoryItem = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toLocaleString(),
          stage: 'Pending' as const,
          actionBy: `Admin (${newTicket.mentorName})`,
          note: `Admin Task assigned (${newTicket.category}): ${newTicket.message}`,
        };

        if (existingIdx >= 0) {
          newLogs[existingIdx] = {
            ...newLogs[existingIdx],
            assignedTicketId: ticketId,
            deadlineDate: newTicket.deadlineDate,
            adminRemarks: newTicket.message,
            notes: `${newLogs[existingIdx].notes ? newLogs[existingIdx].notes + ' | ' : ''}Admin Task (${newTicket.category}): ${newTicket.message}`,
            history: [newHistoryItem, ...(newLogs[existingIdx].history || [])],
            updatedAt: new Date().toISOString(),
          };
        } else {
          newLogs.push({
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            studentName: studentName,
            grade: st.grade || '10',
            section: st.section || 'A',
            mentorName: newTicket.mentorName,
            sourceTab: sourceTab,
            currentStage: 'Pending',
            reasonBucket: 'Personal / No Reason Shared',
            notes: `Admin Task assigned: ${newTicket.message}`,
            history: [newHistoryItem],
            updatedAt: new Date().toISOString(),
            assignedTicketId: ticketId,
            deadlineDate: newTicket.deadlineDate,
            adminRemarks: newTicket.message,
          });
        }
      });

      setLogs(newLogs);
      try {
        localStorage.setItem('mentor_followup_logs', JSON.stringify(newLogs));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUpdateTicketStatus = (
    ticketId: string,
    status: 'Open' | 'In Progress' | 'Closed',
    mentorNote?: string
  ) => {
    const updated = adminTickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            status,
            mentorProgressNote: mentorNote || t.mentorProgressNote,
            ...(status === 'Closed'
              ? {
                  adminClosingNote: mentorNote || t.adminClosingNote || 'Closed by mentor',
                  closedDate: new Date().toLocaleDateString(),
                }
              : {}),
          }
        : t
    );
    setAdminTickets(updated);
    try {
      localStorage.setItem('admin_mentor_tickets', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCloseTicket = (ticketId: string, closingNote: string) => {
    handleUpdateTicketStatus(ticketId, 'Closed', closingNote);
  };

  const handleMarkEmailSent = (ticketId: string) => {
    const updated = adminTickets.map((t) =>
      t.id === ticketId ? { ...t, emailSent: true } : t
    );
    setAdminTickets(updated);
    try {
      localStorage.setItem('admin_mentor_tickets', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Active Tab State
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Sidebar Layout States
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    mentors: [],
    batches: [],
    sections: [],
    streams: [],
    grades: [],
    searchQuery: '',
  });

  // Google Sheet Sync States
  const [sheetUrl, setSheetUrl] = useState<string>(
    'https://docs.google.com/spreadsheets/d/1Eyk3ilG5pXZQTGdH35i2DW_hms17bMcQrsuVUgKJvJI/edit?gid=290978682#gid=290978682'
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(new Date().toISOString());

  // Modal States
  const [logModalState, setLogModalState] = useState<{
    isOpen: boolean;
    studentName: string;
    sourceTab: 'ZeroAttendance' | 'Flagged' | 'ReviewLog' | 'Discontinuation';
  } | null>(null);

  const [detailModalStudent, setDetailModalStudent] = useState<StudentSummary | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Calculate Student Summaries
  const allSummaries = useMemo(() => {
    return calculateStudentSummaries(attendance, objective, subjective, discontinuation);
  }, [attendance, objective, subjective, discontinuation]);

  // Apply Checkbox Filters
  const filteredSummaries = useMemo(() => {
    return applyFilters(allSummaries, filters);
  }, [allSummaries, filters]);

  // Available Filter Options for Checkboxes
  const availableMentors = useMemo(
    () => Array.from(new Set(allSummaries.map((s) => (s.mentorName ? s.mentorName.trim() : '')))).filter(Boolean).sort(),
    [allSummaries]
  );
  const availableBatches = useMemo(
    () => Array.from(new Set(allSummaries.map((s) => (s.batch ? s.batch.trim() : '')))).filter(Boolean).sort(),
    [allSummaries]
  );
  const availableSections = useMemo(
    () => Array.from(new Set(allSummaries.map((s) => (s.section ? s.section.trim() : '')))).filter(Boolean).sort(),
    [allSummaries]
  );
  const availableStreams = useMemo(
    () => Array.from(new Set(allSummaries.map((s) => (s.stream ? s.stream.trim() : '')))).filter(Boolean).sort(),
    [allSummaries]
  );
  const availableGrades = useMemo(
    () => Array.from(new Set(allSummaries.map((s) => String(s.grade || '').trim()))).filter(Boolean).sort(),
    [allSummaries]
  );

  // Leaderboard Computation
  const leaderboard = useMemo(() => {
    return calculateMentorLeaderboard(allSummaries, logs, discontinuation);
  }, [allSummaries, logs, discontinuation]);

  // Map Zero Attendance Calls for week-wise Subsheet sync
  const zeroCallsForSheet = useMemo(() => {
    return allSummaries
      .filter((s) => s.isZeroAttendance)
      .map((st) => {
        const matchingLog = logs.find(
          (l) => l.studentName.trim().toLowerCase() === st.studentName.trim().toLowerCase()
        );
        return {
          week: st.attendanceRecord?.week || 'Week 2 (Current)',
          studentName: st.studentName,
          grade: st.grade,
          section: st.section,
          batch: st.batch,
          mentorName: st.mentorName,
          attendancePercentage: st.attendancePercentage,
          currentStage: matchingLog?.currentStage || 'Pending',
          reasonBucket: matchingLog?.reasonBucket || 'Unassigned',
          notes: matchingLog?.notes || matchingLog?.adminRemarks || 'Follow-up call pending',
          updatedAt: matchingLog?.updatedAt || new Date().toISOString(),
        };
      });
  }, [allSummaries, logs]);

  // Map Discontinuation Calls for week-wise Subsheet sync
  const discontinuationCallsForSheet = useMemo(() => {
    return discontinuation.map((rec) => {
      const matchingLog = logs.find(
        (l) => l.studentName.trim().toLowerCase() === rec.studentName.trim().toLowerCase()
      );
      return {
        month: rec.month || rec.date || 'August 2026',
        date: rec.date,
        studentName: rec.studentName,
        grade: rec.grade,
        section: rec.section,
        batch: rec.batch || 'PW Gulf Batch',
        mentorName: rec.mentorName,
        status: rec.status,
        reasonBucket: rec.reasonBucket || 'Unassigned',
        mentorComments: rec.mentorComments || rec.comment || matchingLog?.notes || '',
        contact1: rec.contact1,
        contact2: rec.contact2,
        updatedAt: matchingLog?.updatedAt || new Date().toISOString().slice(0, 10),
      };
    });
  }, [discontinuation, logs]);

  // Sync adminTickets, logs, zeroCalls, and discontinuationCalls to backend subsheets store
  useEffect(() => {
    fetch('/api/sheets/update-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tickets: adminTickets,
        logs,
        zeroCalls: zeroCallsForSheet,
        discontinuationCalls: discontinuationCallsForSheet,
      }),
    }).catch((err) => console.error('Subsheet activity sync error:', err));
  }, [adminTickets, logs, zeroCallsForSheet, discontinuationCallsForSheet]);

  // Non-Admin Redirect Guard: prevent non-admins from viewing admin-tasks tab
  useEffect(() => {
    if (!isAuthorizedAdmin && activeTab === 'admin-tasks') {
      setActiveTab('overview');
    }
  }, [isAuthorizedAdmin, activeTab]);

  // Non-Admin Mentor Lock Effect: filter dashboard by selected mentor
  useEffect(() => {
    if (!isAuthorizedAdmin && selectedMentor) {
      setFilters((prev) => ({
        ...prev,
        mentors: [selectedMentor],
      }));
    }
  }, [isAuthorizedAdmin, selectedMentor]);

  // Handle Sync from Live Google Sheet
  const handleSyncSheet = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sheets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.Attendance && json.data.Attendance.length > 0) {
            setAttendance(mapRawAttendanceRows(json.data.Attendance));
          }
          if (json.data.Objective && json.data.Objective.length > 0) {
            setObjective(mapRawObjectiveRows(json.data.Objective));
          }
          if (json.data.Subjective && json.data.Subjective.length > 0) {
            setSubjective(mapRawSubjectiveRows(json.data.Subjective));
          }
          if (json.data.Discontinuation && json.data.Discontinuation.length > 0) {
            setDiscontinuation(mapRawDiscontinuationRows(json.data.Discontinuation));
          }
          setLastSyncTime(json.lastSyncTime || new Date().toISOString());
        }
      }
    } catch (err) {
      console.error('Error syncing Google Sheet:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handlers for Logs & Modals
  const handleOpenLogModal = (
    studentName: string,
    sourceTab: 'ZeroAttendance' | 'Flagged' | 'ReviewLog' | 'Discontinuation' = 'ZeroAttendance'
  ) => {
    setLogModalState({
      isOpen: true,
      studentName,
      sourceTab,
    });
  };

  const handleSaveLog = (savedLog: FollowupLog) => {
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.studentName.trim() === savedLog.studentName.trim());
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedLog;
        return copy;
      } else {
        return [...prev, savedLog];
      }
    });
  };

  const handleUpdateRecordBucket = (recordId: string, bucket: ReasonBucket) => {
    setDiscontinuation((prev) =>
      prev.map((rec) => (rec.id === recordId ? { ...rec, reasonBucket: bucket } : rec))
    );
  };

  const handleAddReviewComment = (studentName: string, commentText: string) => {
    const newCommentItem = {
      id: `comm-${Date.now()}`,
      author: 'Mentor',
      text: commentText,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setReviewCommentsMap((prev) => {
      const existing = prev[studentName] || [];
      return {
        ...prev,
        [studentName]: [newCommentItem, ...existing],
      };
    });
  };

  // Counts for Top Header Badges
  const totalStudentsCount = allSummaries.length;
  const zeroAttendanceCount = allSummaries.filter((s) => s.isZeroAttendance).length;
  const flaggedCount = allSummaries.filter((s) => s.isFlagged).length;
  const discontinuedCount = discontinuation.length;
  const openTicketsCount = adminTickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;

  const modalStudentSummary = logModalState
    ? allSummaries.find((s) => s.studentName.trim() === logModalState.studentName.trim())
    : null;

  return (
    <DashboardLayoutProvider>
      <div
        className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
          currentTheme === 'dark'
            ? 'bg-bento-pattern-dark text-slate-100 dark'
            : currentTheme === 'contrast'
            ? 'bg-bento-pattern-contrast text-white theme-contrast dark'
            : 'bg-bento-pattern text-slate-800'
        }`}
      >
        {/* Fixed Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCoachChat={() => setIsCoachChatOpen(true)}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          totalStudents={totalStudentsCount}
          zeroAttendanceCount={zeroAttendanceCount}
          flaggedCount={flaggedCount}
          discontinuedCount={discontinuedCount}
          openTicketsCount={openTicketsCount}
          onSync={handleSyncSheet}
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          loggedInUserEmail={loggedInUserEmail}
          selectedMentor={selectedMentor}
          isAuthorizedAdmin={isAuthorizedAdmin}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Content Wrapper dynamically adjusted for Sidebar */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out flex flex-col ${
            isSidebarOpen
              ? isSidebarCollapsed
                ? 'lg:ml-20'
                : 'lg:ml-64'
              : 'lg:ml-0'
          }`}
        >
          {/* Top Main Navigation Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenCoachChat={() => setIsCoachChatOpen(true)}
            onSync={handleSyncSheet}
            isSyncing={isSyncing}
            lastSyncTime={lastSyncTime}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            totalStudents={totalStudentsCount}
            zeroAttendanceCount={zeroAttendanceCount}
            flaggedCount={flaggedCount}
            discontinuedCount={discontinuedCount}
            openTicketsCount={openTicketsCount}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            loggedInUserEmail={loggedInUserEmail}
            selectedMentor={selectedMentor}
            isAuthorizedAdmin={isAuthorizedAdmin}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />

          {/* Main Container */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Global Multi-select Filter Bar */}
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            availableMentors={availableMentors}
            availableBatches={availableBatches}
            availableSections={availableSections}
            availableStreams={availableStreams}
            availableGrades={availableGrades}
            totalResults={filteredSummaries.length}
          />

          {/* Hidden Panels Restore Bar */}
          <HiddenPanelsBar />

        {/* Tab 0: Admin Tasks & Mentor Tagging Tab */}
        {activeTab === 'admin-tasks' && (
          <TabAdminTasks
            students={allSummaries}
            attendanceRecords={attendance}
            tickets={adminTickets}
            onCreateTicket={handleCreateTicket}
            onCloseTicket={handleCloseTicket}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onMarkEmailSent={handleMarkEmailSent}
            loggedInUserEmail={loggedInUserEmail}
            onViewStudentReport={(stName) => {
              const found = allSummaries.find((s) => s.studentName.trim().toLowerCase() === stName.trim().toLowerCase());
              if (found) {
                setDetailModalStudent(found);
              }
            }}
            googleAccessToken={googleAccessToken}
            onConnectGoogle={() => {
              // Trigger Google OAuth connection
            }}
          />
        )}

        {/* Tab 1: Overall Performance */}
        {activeTab === 'overview' && (
          <TabOverview
            students={filteredSummaries}
            logs={logs}
            onOpenLogModal={handleOpenLogModal}
            onOpenDetailModal={(st) => setDetailModalStudent(st)}
          />
        )}

        {/* Tab 2: Zero Attendance Tab */}
        {activeTab === 'zero-attendance' && (
          <TabZeroAttendance
            students={filteredSummaries}
            attendanceRecords={attendance}
            logs={logs}
            tickets={adminTickets}
            onOpenLogModal={(stName) => handleOpenLogModal(stName, 'ZeroAttendance')}
          />
        )}

        {/* Tab 3: Flagged Students List Tab (<75% in all 3) */}
        {activeTab === 'flagged' && (
          <TabFlaggedStudents
            students={filteredSummaries}
            logs={logs}
            tickets={adminTickets}
            onOpenLogModal={(stName) => handleOpenLogModal(stName, 'Flagged')}
            onOpenDetailModal={(st) => setDetailModalStudent(st)}
          />
        )}

        {/* Tab 4: Review Log Tab */}
        {activeTab === 'review-log' && (
          <TabReviewLog
            students={filteredSummaries}
            attendanceRecords={attendance}
            objectiveRecords={objective}
            subjectiveRecords={subjective}
            logs={logs}
            onOpenLogModal={(stName) => handleOpenLogModal(stName, 'ReviewLog')}
            onAddReviewComment={handleAddReviewComment}
            reviewCommentsMap={reviewCommentsMap}
          />
        )}

        {/* Tab 5: Discontinuation Sheet Tab */}
        {activeTab === 'discontinuation' && (
          <TabDiscontinuation
            discontinuationRecords={discontinuation}
            logs={logs}
            onOpenLogModal={(stName) => handleOpenLogModal(stName, 'Discontinuation')}
            onUpdateRecordBucket={handleUpdateRecordBucket}
          />
        )}

        {/* Tab 6: Master Insights Tab (Unified Analytics, Mentor Leaderboard & Academic Leaderboard) */}
        {(activeTab === 'master-insights' ||
          activeTab === 'analytics' ||
          activeTab === 'leaderboard' ||
          activeTab === 'academic-leaderboard') && (
          <TabMasterInsights
            students={filteredSummaries}
            attendanceRecords={attendance}
            objectiveRecords={objective}
            subjectiveRecords={subjective}
            logs={logs}
            discontinuation={discontinuation}
            tickets={adminTickets}
          />
        )}
      </main>
      </div>

      {/* Log & Doubt Followup Modal */}
      {logModalState && logModalState.isOpen && (
        <LogModal
          studentName={logModalState.studentName}
          sourceTab={logModalState.sourceTab}
          existingLog={logs.find((l) => l.studentName.trim() === logModalState.studentName.trim())}
          mentorName={modalStudentSummary?.mentorName || 'Mentor'}
          grade={modalStudentSummary?.grade || '8'}
          section={modalStudentSummary?.section || 'A'}
          onSaveLog={handleSaveLog}
          onClose={() => setLogModalState(null)}
        />
      )}

      {/* Student Detail Modal */}
      {detailModalStudent && (
        <StudentDetailModal
          student={detailModalStudent}
          allStudents={allSummaries}
          attendanceRecords={attendance}
          objectiveRecords={objective}
          subjectiveRecords={subjective}
          log={logs.find((l) => l.studentName.trim() === detailModalStudent.studentName.trim())}
          onClose={() => setDetailModalStudent(null)}
          onOpenLogModal={(stName) => {
            setDetailModalStudent(null);
            handleOpenLogModal(stName, 'ReviewLog');
          }}
        />
      )}

      {/* Google Sheet Link & Sync Config Modal */}
      {isSyncModalOpen && (
        <SyncConfigModal
          sheetUrl={sheetUrl}
          setSheetUrl={setSheetUrl}
          onSync={handleSyncSheet}
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
          onClose={() => setIsSyncModalOpen(false)}
        />
      )}

      {/* User Login & Mentor Selection Modal */}
      <UserAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        loggedInUserEmail={loggedInUserEmail}
        onUpdateUserEmail={handleUpdateUserEmail}
        selectedMentor={selectedMentor}
        onUpdateSelectedMentor={handleUpdateSelectedMentor}
        availableMentors={availableMentors}
        currentTheme={currentTheme}
        onUpdateTheme={handleUpdateTheme}
      />

      {/* AI Academic Success Coach Assistant Modal */}
      <AcademicSuccessCoachChat
        isOpen={isCoachChatOpen}
        onClose={() => setIsCoachChatOpen(false)}
        students={filteredSummaries}
        filters={{
          grade: filters.grades.join(', '),
          section: filters.sections.join(', '),
          batch: filters.batches.join(', '),
          mentor: filters.mentors.join(', '),
          stream: filters.streams.join(', '),
          search: filters.searchQuery,
        }}
        zeroAttendanceList={zeroCallsForSheet}
        discontinuationList={discontinuationCallsForSheet}
        tickets={adminTickets}
        loggedInUserEmail={loggedInUserEmail}
        selectedMentor={selectedMentor}
        isAuthorizedAdmin={isAuthorizedAdmin}
      />

      {/* Floating AI Success Coach Launcher Widget */}
      {!isCoachChatOpen && (
        <button
          onClick={() => setIsCoachChatOpen(true)}
          className="fixed bottom-5 right-5 z-40 px-4 py-3 bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-2xl shadow-indigo-600/40 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 border border-white/20 cursor-pointer group"
          title="Open AI Academic Success Coach Assistant"
        >
          <div className="p-1.5 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <span className="block text-[9px] text-teal-200 font-extrabold uppercase tracking-wider">AI Operations Coach</span>
            <span className="block font-black text-xs">Academic Coach</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold">
            {filteredSummaries.length} Students
          </span>
        </button>
      )}
      </div>
    </DashboardLayoutProvider>
  );
}
