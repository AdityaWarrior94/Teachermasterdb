import React, { useState, useMemo, useEffect } from 'react';
import { StudentSummary, AdminTicket, AttendanceRecord, TaggedStudentItem, MentorContact, MentorResponseLog } from '../types';
import {
  UserCheck,
  Send,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  PlusCircle,
  Search,
  Filter,
  XCircle,
  FileText,
  MessageSquare,
  ShieldCheck,
  Tag,
  ExternalLink,
  ChevronRight,
  Inbox,
  CheckSquare,
  Check,
  AlertTriangle,
  RefreshCw,
  Users,
  Layers,
  Sparkles,
  ListFilter,
  CheckCircle,
  AtSign,
  Copy,
  BookOpen,
  Phone,
  Edit,
  Trash2,
  Download,
  UserPlus,
  MessageCircle,
  Save,
  Share2,
  Database,
  BookMarked,
  FolderPlus,
} from 'lucide-react';

interface TabAdminTasksProps {
  students: StudentSummary[];
  attendanceRecords?: AttendanceRecord[];
  tickets: AdminTicket[];
  onCreateTicket: (ticket: Omit<AdminTicket, 'id' | 'createdDate' | 'status'>) => void;
  onCloseTicket: (ticketId: string, closingNote: string) => void;
  onUpdateTicketStatus?: (
    ticketId: string,
    status: 'Open' | 'In Progress' | 'Closed',
    mentorNote?: string
  ) => void;
  onMarkEmailSent?: (ticketId: string) => void;
  loggedInUserEmail?: string;
  onViewStudentReport: (studentName: string) => void;
  googleAccessToken?: string | null;
  onConnectGoogle?: () => void;
}

export const AUTHORIZED_ADMIN_EMAILS = [
  'aditya.kumar3@pw.live',
  'rajni.mamgai@pw.live',
  'behuman93adi@gmail.com',
  'ahsan.khan@pw.live',
  'ritika.sinha@pw.live',
];

const INITIAL_MENTOR_CONTACTS: MentorContact[] = [
  {
    id: 'MC-1',
    mentorName: 'Vibha Raj',
    officialEmail: 'vibha.raj@schoolmentors.org',
    alternateEmail: 'vibha.raj@pw.live',
    phone: '+971 50 123 4567',
    department: 'Academic Mentoring (UAE)',
    activeStatus: 'Active',
    notes: 'Senior Mentor for Class 11-12 UAE Batches',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'MC-2',
    mentorName: 'Rahul Sharma',
    officialEmail: 'rahul.sharma@schoolmentors.org',
    alternateEmail: 'rahul.sharma@pw.live',
    phone: '+974 55 987 6543',
    department: 'Academic Mentoring (Qatar)',
    activeStatus: 'Active',
    notes: 'Mentor for Qatar JEE & Foundation Students',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'MC-3',
    mentorName: 'Pooja Gupta',
    officialEmail: 'pooja.gupta@schoolmentors.org',
    alternateEmail: 'pooja.gupta@pw.live',
    phone: '+966 50 444 3210',
    department: 'Academic Mentoring (Saudi Arabia)',
    activeStatus: 'Active',
    notes: 'Mentor for KSA NEET UG & Secondary Batches',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'MC-4',
    mentorName: 'Amit Verma',
    officialEmail: 'amit.verma@schoolmentors.org',
    alternateEmail: 'amit.verma@pw.live',
    phone: '+968 91 234 5678',
    department: 'Academic Mentoring (Oman)',
    activeStatus: 'Active',
    notes: 'Mentor for Oman Foundation & CBSE Batches',
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_MENTOR_RESPONSES: MentorResponseLog[] = [
  {
    id: 'RESP-1001',
    mentorName: 'Vibha Raj',
    mentorEmail: 'vibha.raj@schoolmentors.org',
    ticketRefId: 'ticket-1',
    responseDate: new Date().toLocaleDateString(),
    responseSummary: 'Contacted parent regarding physics attendance. Parent requested extra evening doubt sessions and confirmed student will attend class tomorrow.',
    actionTaken: 'Enrolled student in Friday doubt clearing batch',
    status: 'Resolved',
    loggedBy: 'Behuman93adi@gmail.com',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'RESP-1002',
    mentorName: 'Rahul Sharma',
    mentorEmail: 'rahul.sharma@schoolmentors.org',
    ticketRefId: 'ticket-2',
    responseDate: new Date().toLocaleDateString(),
    responseSummary: 'Student had fever during Week 2. Medical certificate received via email and attendance updated.',
    actionTaken: 'Shared recorded lectures and practice assignments',
    status: 'Reviewed',
    loggedBy: 'Behuman93adi@gmail.com',
    updatedAt: new Date().toISOString(),
  },
];

export const TabAdminTasks: React.FC<TabAdminTasksProps> = ({
  students,
  attendanceRecords = [],
  tickets,
  onCreateTicket,
  onCloseTicket,
  onUpdateTicketStatus,
  onMarkEmailSent,
  loggedInUserEmail = 'Behuman93adi@gmail.com',
  onViewStudentReport,
}) => {
  // Logged-in user sender account
  const [adminUserEmail, setAdminUserEmail] = useState<string>(loggedInUserEmail);

  // Subtab Navigation Mode
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'tickets' | 'contacts' | 'responses'>('tickets');

  // Mentor Contacts Directory State
  const [mentorContacts, setMentorContacts] = useState<MentorContact[]>(() => {
    try {
      const saved = localStorage.getItem('pw_gulf_mentor_contacts_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_MENTOR_CONTACTS;
  });

  // Mentor Responses Log State
  const [mentorResponses, setMentorResponses] = useState<MentorResponseLog[]>(() => {
    try {
      const saved = localStorage.getItem('pw_gulf_mentor_responses_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_MENTOR_RESPONSES;
  });

  // Contact Modal States
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<MentorContact | null>(null);
  const [contactFormName, setContactFormName] = useState<string>('');
  const [contactFormEmail, setContactFormEmail] = useState<string>('');
  const [contactFormAltEmail, setContactFormAltEmail] = useState<string>('');
  const [contactFormPhone, setContactFormPhone] = useState<string>('');
  const [contactFormDept, setContactFormDept] = useState<string>('Academic Mentoring');
  const [contactFormStatus, setContactFormStatus] = useState<'Active' | 'On Leave' | 'Inactive'>('Active');
  const [contactFormNotes, setContactFormNotes] = useState<string>('');
  const [contactsSearchQuery, setContactsSearchQuery] = useState<string>('');

  // Mentor Response Modal States
  const [isResponseModalOpen, setIsResponseModalOpen] = useState<boolean>(false);
  const [responseFormMentor, setResponseFormMentor] = useState<string>('');
  const [responseFormEmail, setResponseFormEmail] = useState<string>('');
  const [responseFormTicketId, setResponseFormTicketId] = useState<string>('');
  const [responseFormDate, setResponseFormDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [responseFormSummary, setResponseFormSummary] = useState<string>('');
  const [responseFormAction, setResponseFormAction] = useState<string>('');
  const [responseFormStatus, setResponseFormStatus] = useState<'Received' | 'Reviewed' | 'Action Required' | 'Resolved'>('Received');
  const [responsesSearchQuery, setResponsesSearchQuery] = useState<string>('');
  const [responsesStatusFilter, setResponsesStatusFilter] = useState<string>('All');

  useEffect(() => {
    if (loggedInUserEmail) {
      setAdminUserEmail(loggedInUserEmail);
    }
  }, [loggedInUserEmail]);

  // Check if current user is an authorized admin
  const isAuthorizedAdmin = useMemo(() => {
    if (!adminUserEmail) return false;
    const cleanEmail = adminUserEmail.trim().toLowerCase();
    return AUTHORIZED_ADMIN_EMAILS.some((e) => e.toLowerCase() === cleanEmail);
  }, [adminUserEmail]);

  // Extract unique mentor list from student data
  const mentorList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.mentorName && s.mentorName.trim() && s.mentorName.toLowerCase() !== 'unassigned') {
        set.add(s.mentorName.trim());
      }
    });
    return Array.from(set).sort();
  }, [students]);

  // Sync missing mentors into contacts directory
  useEffect(() => {
    if (mentorList.length > 0) {
      setMentorContacts((prev) => {
        let updated = [...prev];
        let changed = false;
        mentorList.forEach((mName) => {
          const exists = updated.some((c) => c.mentorName.trim().toLowerCase() === mName.trim().toLowerCase());
          if (!exists && mName.trim() && mName.toLowerCase() !== 'unassigned') {
            const clean = mName.toLowerCase().replace(/[^a-z0-9]/g, '.');
            updated.push({
              id: `MC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              mentorName: mName,
              officialEmail: `${clean}@schoolmentors.org`,
              alternateEmail: `${clean}@pw.live`,
              phone: '+971 50 000 0000',
              department: 'Academic Mentoring',
              activeStatus: 'Active',
              notes: 'Auto-added from student roster',
              updatedAt: new Date().toISOString(),
            });
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem('pw_gulf_mentor_contacts_v1', JSON.stringify(updated));
        }
        return updated;
      });
    }
  }, [mentorList]);

  // Extract available sorted weeks
  const availableWeeks = useMemo(() => {
    const set = new Set<string>();
    attendanceRecords.forEach((a) => {
      if (a.week && a.week !== '-') set.add(a.week);
    });
    const arr = Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
    return arr.length > 0 ? arr : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  }, [attendanceRecords]);

  // Form States
  const [selectedMentor, setSelectedMentor] = useState<string>(mentorList[0] || '');
  const [taskCategory, setTaskCategory] = useState<string>('Zero Attendance Followup');
  const [selectedWeek, setSelectedWeek] = useState<string>(
    availableWeeks[availableWeeks.length - 1] || 'Week 1'
  );
  const [mentorEmail, setMentorEmail] = useState<string>('');
  const [isEmailAutoPicked, setIsEmailAutoPicked] = useState<boolean>(false);
  const [taskPriority, setTaskPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [deadlineDate, setDeadlineDate] = useState<string>(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [message, setMessage] = useState<string>('');
  const [sendEmailOnAssign, setSendEmailOnAssign] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Multi-step Confirmation Dialog State for Bulk Assignments
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [confirmStep, setConfirmStep] = useState<1 | 2>(1);
  const [confirmChecklist, setConfirmChecklist] = useState<{
    verifiedStudents: boolean;
    authorizedDispatch: boolean;
  }>({
    verifiedStudents: false,
    authorizedDispatch: false,
  });

  // Selected Students array for assignment
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // AUTO-PICK email whenever selected mentor changes from Mentor Directory!
  useEffect(() => {
    if (selectedMentor) {
      const match = mentorContacts.find(
        (c) => c.mentorName.trim().toLowerCase() === selectedMentor.trim().toLowerCase()
      );
      if (match && match.officialEmail) {
        setMentorEmail(match.officialEmail);
        setIsEmailAutoPicked(true);
      } else {
        const clean = selectedMentor.toLowerCase().replace(/[^a-z0-9]/g, '.');
        setMentorEmail(`${clean}@schoolmentors.org`);
        setIsEmailAutoPicked(false);
      }
    }
  }, [selectedMentor, mentorContacts]);

  // Handler to Save/Update Contact in Directory
  const handleSaveContactInDirectory = (name: string, email: string, altEmail?: string, phone?: string, dept?: string, statusVal?: 'Active' | 'On Leave' | 'Inactive', notesVal?: string) => {
    if (!name.trim() || !email.trim()) {
      alert('Mentor name and official email are required.');
      return;
    }
    setMentorContacts((prev) => {
      const existingIdx = prev.findIndex(
        (c) => c.mentorName.trim().toLowerCase() === name.trim().toLowerCase()
      );
      let updated: MentorContact[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          mentorName: name,
          officialEmail: email,
          alternateEmail: altEmail ?? updated[existingIdx].alternateEmail,
          phone: phone ?? updated[existingIdx].phone,
          department: dept ?? updated[existingIdx].department,
          activeStatus: statusVal ?? updated[existingIdx].activeStatus,
          notes: notesVal ?? updated[existingIdx].notes,
          updatedAt: new Date().toISOString(),
        };
      } else {
        const newC: MentorContact = {
          id: `MC-${Date.now()}`,
          mentorName: name,
          officialEmail: email,
          alternateEmail: altEmail || '',
          phone: phone || '',
          department: dept || 'Academic Mentoring',
          activeStatus: statusVal || 'Active',
          notes: notesVal || '',
          updatedAt: new Date().toISOString(),
        };
        updated = [newC, ...prev];
      }
      localStorage.setItem('pw_gulf_mentor_contacts_v1', JSON.stringify(updated));

      // Sync backend
      fetch('/api/sheets/update-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorContacts: updated, mentorResponses }),
      }).catch((err) => console.error(err));

      return updated;
    });

    setSuccessMessage(`✅ Saved email contact for ${name} (${email}) in Directory!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Handler to Delete Contact
  const handleDeleteContact = (contactId: string) => {
    if (!confirm('Are you sure you want to delete this mentor contact?')) return;
    setMentorContacts((prev) => {
      const updated = prev.filter((c) => c.id !== contactId);
      localStorage.setItem('pw_gulf_mentor_contacts_v1', JSON.stringify(updated));
      return updated;
    });
  };

  // Open Edit Contact Modal
  const handleOpenEditContact = (contact: MentorContact) => {
    setEditingContact(contact);
    setContactFormName(contact.mentorName);
    setContactFormEmail(contact.officialEmail);
    setContactFormAltEmail(contact.alternateEmail || '');
    setContactFormPhone(contact.phone || '');
    setContactFormDept(contact.department || 'Academic Mentoring');
    setContactFormStatus(contact.activeStatus || 'Active');
    setContactFormNotes(contact.notes || '');
    setIsContactModalOpen(true);
  };

  // Submit Contact Form
  const handleSubmitContactForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveContactInDirectory(
      contactFormName,
      contactFormEmail,
      contactFormAltEmail,
      contactFormPhone,
      contactFormDept,
      contactFormStatus,
      contactFormNotes
    );
    setIsContactModalOpen(false);
    setEditingContact(null);
  };

  // Handler to Add Mentor Response to Extra Sheet
  const handleSaveMentorResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseFormMentor || !responseFormSummary.trim()) {
      alert('Please select a mentor and enter a response summary.');
      return;
    }

    const logItem: MentorResponseLog = {
      id: `RESP-${Date.now()}`,
      mentorName: responseFormMentor,
      mentorEmail: responseFormEmail || `${responseFormMentor.toLowerCase().replace(/[^a-z0-9]/g, '.')}@schoolmentors.org`,
      ticketRefId: responseFormTicketId || 'N/A',
      responseDate: responseFormDate,
      responseSummary: responseFormSummary,
      actionTaken: responseFormAction,
      status: responseFormStatus,
      loggedBy: adminUserEmail,
      updatedAt: new Date().toISOString(),
    };

    setMentorResponses((prev) => {
      const updated = [logItem, ...prev];
      localStorage.setItem('pw_gulf_mentor_responses_v1', JSON.stringify(updated));

      // Sync backend
      fetch('/api/sheets/update-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorContacts, mentorResponses: updated }),
      }).catch((err) => console.error(err));

      return updated;
    });

    setIsResponseModalOpen(false);
    setResponseFormSummary('');
    setResponseFormAction('');
    setSuccessMessage(`✅ Mentor response logged for ${responseFormMentor} in Extra Sheet!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Handler to Delete Response Log
  const handleDeleteResponse = (responseId: string) => {
    if (!confirm('Are you sure you want to remove this response log?')) return;
    setMentorResponses((prev) => {
      const updated = prev.filter((r) => r.id !== responseId);
      localStorage.setItem('pw_gulf_mentor_responses_v1', JSON.stringify(updated));
      return updated;
    });
  };

  // Filtered Mentor Contacts list
  const filteredMentorContacts = useMemo(() => {
    return mentorContacts.filter((c) => {
      if (!contactsSearchQuery.trim()) return true;
      const q = contactsSearchQuery.toLowerCase().trim();
      return (
        c.mentorName.toLowerCase().includes(q) ||
        c.officialEmail.toLowerCase().includes(q) ||
        (c.department && c.department.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
      );
    });
  }, [mentorContacts, contactsSearchQuery]);

  // Filtered Mentor Responses list
  const filteredMentorResponses = useMemo(() => {
    return mentorResponses.filter((r) => {
      if (responsesStatusFilter !== 'All' && r.status !== responsesStatusFilter) return false;
      if (!responsesSearchQuery.trim()) return true;
      const q = responsesSearchQuery.toLowerCase().trim();
      return (
        r.mentorName.toLowerCase().includes(q) ||
        r.mentorEmail.toLowerCase().includes(q) ||
        r.responseSummary.toLowerCase().includes(q) ||
        (r.actionTaken && r.actionTaken.toLowerCase().includes(q)) ||
        (r.ticketRefId && r.ticketRefId.toLowerCase().includes(q))
      );
    });
  }, [mentorResponses, responsesStatusFilter, responsesSearchQuery]);

  // Copy Contacts TSV
  const handleCopyContactsTsv = () => {
    const headers = ['Mentor ID', 'Mentor Name', 'Official Email', 'Alternate Email', 'Phone', 'Department', 'Status', 'Notes', 'Updated At'];
    const rows = mentorContacts.map((c) => [
      c.id,
      c.mentorName,
      c.officialEmail,
      c.alternateEmail || '',
      c.phone || '',
      c.department || '',
      c.activeStatus,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
      c.updatedAt,
    ]);
    const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsv);
    setSuccessMessage('📋 Formatted Mentor Contacts TSV copied! Paste directly into Google Sheet tab "Mentor_Contacts".');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Copy Responses TSV
  const handleCopyResponsesTsv = () => {
    const headers = ['Response ID', 'Mentor Name', 'Mentor Email', 'Ticket Ref ID', 'Response Date', 'Response Summary', 'Action Taken', 'Status', 'Logged By', 'Updated At'];
    const rows = mentorResponses.map((r) => [
      r.id,
      r.mentorName,
      r.mentorEmail,
      r.ticketRefId || 'N/A',
      r.responseDate,
      `"${r.responseSummary.replace(/"/g, '""')}"`,
      `"${(r.actionTaken || '').replace(/"/g, '""')}"`,
      r.status,
      r.loggedBy,
      r.updatedAt,
    ]);
    const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsv);
    setSuccessMessage('📋 Formatted Mentor Responses TSV copied! Paste directly into Google Sheet extra sheet tab "Mentor_Responses".');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Compute Zero Attendance & Candidate Students for the selected mentor and week
  const weekCandidateStudents = useMemo(() => {
    if (!selectedMentor) return [];

    // Filter students belonging to this mentor
    const mentorStudents = students.filter(
      (s) => s.mentorName?.trim().toLowerCase() === selectedMentor.trim().toLowerCase()
    );

    if (taskCategory === 'ZeroAttendance' || taskCategory === 'Zero Attendance Followup') {
      // Find students who had 0% attendance in selectedWeek
      const zeroAttInWeek = attendanceRecords.filter(
        (a) =>
          a.mentorName?.trim().toLowerCase() === selectedMentor.trim().toLowerCase() &&
          a.week === selectedWeek &&
          a.attendancePercentage === 0
      );
      const zeroNames = new Set(zeroAttInWeek.map((a) => a.studentName.trim()));

      // Fallback: If no week match, check if student summary marks zero attendance
      if (zeroNames.size === 0) {
        return mentorStudents.filter((s) => s.isZeroAttendance);
      }
      return mentorStudents.filter((s) => zeroNames.has(s.studentName.trim()));
    } else if (taskCategory === 'Flagged Performance (<75%)' || taskCategory === 'Flagged') {
      return mentorStudents.filter((s) => s.isFlagged || s.attendanceAvg < 75);
    } else {
      return mentorStudents;
    }
  }, [students, attendanceRecords, selectedMentor, selectedWeek, taskCategory]);

  // Auto-select candidates when mentor or week or category changes
  useEffect(() => {
    if (weekCandidateStudents.length > 0) {
      setSelectedStudents(weekCandidateStudents.map((s) => s.studentName));
    } else {
      setSelectedStudents([]);
    }
  }, [weekCandidateStudents]);

  // Toggle single student selection
  const handleToggleStudent = (studentName: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentName) ? prev.filter((name) => name !== studentName) : [...prev, studentName]
    );
  };

  // Select All / Deselect All candidates
  const handleToggleSelectAll = () => {
    if (selectedStudents.length === weekCandidateStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(weekCandidateStudents.map((s) => s.studentName));
    }
  };

  // Helper to get selected week & previous week attendance for preview table
  const getAttendanceInfo = (studentName: string) => {
    const studentRecords = attendanceRecords.filter(
      (a) => a.studentName.trim().toLowerCase() === studentName.trim().toLowerCase()
    );

    const weekRecord = studentRecords.find((a) => a.week === selectedWeek);
    const weekPct = weekRecord ? weekRecord.attendancePercentage : 0;

    // Find previous week
    const weekNum = parseInt(selectedWeek.replace(/\D/g, '') || '1', 10);
    const prevWeekName = `Week ${weekNum - 1}`;
    const prevRecord = studentRecords.find((a) => a.week === prevWeekName);
    const prevPct = prevRecord
      ? prevRecord.attendancePercentage
      : studentRecords.length > 0
      ? studentRecords[0].attendancePercentage
      : 80;

    return { weekPct, prevPct, prevWeekName };
  };

  // Dashboard Filters State
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('All');
  const [ticketMentorFilter, setTicketMentorFilter] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Ticket Progress / Close Modal State
  const [updatingTicket, setUpdatingTicket] = useState<AdminTicket | null>(null);
  const [updateStatusVal, setUpdateStatusVal] = useState<'Open' | 'In Progress' | 'Closed'>('In Progress');
  const [mentorProgressNoteText, setMentorProgressNoteText] = useState<string>('');

  // Email Composer Modal State
  const [emailModalTicket, setEmailModalTicket] = useState<AdminTicket | null>(null);
  const [emailRecipient, setEmailRecipient] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [emailSuccessToast, setEmailSuccessToast] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // Open Email Composer Modal for a ticket
  const openEmailModal = (ticket: AdminTicket) => {
    setEmailModalTicket(ticket);
    setEmailRecipient(ticket.mentorEmail || `${ticket.mentorName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@schoolmentors.org`);
    setEmailSubject(`${ticket.category} - ${ticket.week || 'Week'} | Priority: ${ticket.priority} (Admin Reminder)`);

    const taggedList = ticket.taggedStudents && ticket.taggedStudents.length > 0
      ? ticket.taggedStudents.map((st) => `• ${st.studentName} (Gr ${st.grade || ''}-${st.section || ''}, Week Att: ${st.weekAttendancePct ?? 0}%)`).join('\n')
      : `• ${ticket.studentName}`;

    const defaultBodyText = `Dear ${ticket.mentorName},

This is an official task notification and academic review reminder from PW Gulf Academic Management regarding Ticket #${ticket.id}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK SUMMARY & DETAILS:
• Category: ${ticket.category}
• Target Period: ${ticket.week || 'Selected Week'}
• Priority Level: ${ticket.priority}
• Completion Deadline: ${ticket.deadlineDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAGGED STUDENTS (${ticket.taggedStudents?.length || 1}):
${taggedList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADMIN INSTRUCTIONS & REMARKS:
"${ticket.message}"

Please review these student cases on high priority, conduct required outreach or 1-on-1 counseling, and log your resolution progress on the portal before ${ticket.deadlineDate}.

Warm regards,

Rajni Mamgai
Academic Head of PW Gulf
Physics Wallah Gulf Division`;

    setEmailBody(defaultBodyText);
    setEmailSuccessToast(null);
  };

  // Direct Backend Server Email Dispatch Helper
  const dispatchBackendEmail = async (params: {
    to: string;
    from: string;
    subject: string;
    body: string;
    ticketId?: string;
  }) => {
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Backend email dispatch error:', err);
      return { success: false, dispatchId: `MSG-${Date.now()}` };
    }
  };

  // Open Gmail Compose directly in browser with prefilled To, Subject, and Body
  const handleOpenGmailCompose = (recipient: string, subject: string, bodyText: string, ticketId?: string) => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    window.open(gmailUrl, '_blank');

    // Log to backend database
    dispatchBackendEmail({
      to: recipient,
      from: adminUserEmail,
      subject,
      body: bodyText,
      ticketId,
    });

    if (ticketId && onMarkEmailSent) {
      onMarkEmailSent(ticketId);
    }

    const msg = `✅ Opened in Gmail Web! Prefilled email for ${recipient} (Logged in: ${adminUserEmail}). Ticket marked Email Sent.`;
    setSuccessMessage(msg);
    if (setEmailSuccessToast) setEmailSuccessToast(msg);
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  // Open Outlook Web Compose directly in browser (Optional fallback)
  const handleOpenOutlookCompose = (recipient: string, subject: string, bodyText: string, ticketId?: string) => {
    const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(recipient)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    window.open(outlookUrl, '_blank');

    dispatchBackendEmail({
      to: recipient,
      from: adminUserEmail,
      subject,
      body: bodyText,
      ticketId,
    });

    if (ticketId && onMarkEmailSent) {
      onMarkEmailSent(ticketId);
    }

    const msg = `✅ Opened in Outlook Web! Prefilled email for ${recipient}. Ticket marked Email Sent.`;
    setSuccessMessage(msg);
    if (setEmailSuccessToast) setEmailSuccessToast(msg);
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  // Trigger default mail client without leaving blank tab
  const handleLaunchMailClient = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(emailRecipient)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    const a = document.createElement('a');
    a.href = mailtoUrl;
    a.click();

    dispatchBackendEmail({
      to: emailRecipient,
      from: adminUserEmail,
      subject: emailSubject,
      body: emailBody,
      ticketId: emailModalTicket?.id,
    });

    if (emailModalTicket) {
      if (onMarkEmailSent) {
        onMarkEmailSent(emailModalTicket.id);
      }
      const successText = `✅ Mail App Triggered! Dispatched to ${emailRecipient} from ${adminUserEmail}. Ticket marked Email Sent.`;
      setEmailSuccessToast(successText);
      setSuccessMessage(successText);
      setTimeout(() => setSuccessMessage(null), 6000);
    }
  };

  // Dispatch direct web email via Gmail Web Compose window
  const handleSendDirectWebEmail = async () => {
    handleOpenGmailCompose(
      emailRecipient,
      emailSubject,
      emailBody,
      emailModalTicket?.id
    );
  };

  // Quick One-Click Send Email directly via Gmail Compose for any ticket
  const handleQuickSendEmail = async (ticket: AdminTicket) => {
    if (!isAuthorizedAdmin) {
      alert('Email dispatching is restricted to authorized PW Gulf Academic Heads and Admins.');
      return;
    }

    const recipient = ticket.mentorEmail || `${ticket.mentorName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@schoolmentors.org`;
    const subject = `${ticket.category} - ${ticket.week || 'Week'} | Priority: ${ticket.priority} (Admin Reminder)`;

    const taggedList = ticket.taggedStudents && ticket.taggedStudents.length > 0
      ? ticket.taggedStudents.map((st) => `• ${st.studentName} (Gr ${st.grade || ''}-${st.section || ''}, Week Att: ${st.weekAttendancePct ?? 0}%)`).join('\n')
      : `• ${ticket.studentName}`;

    const bodyText = `Dear ${ticket.mentorName},

This is an official task notification and academic review reminder from PW Gulf Academic Management regarding Ticket #${ticket.id}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK SUMMARY & DETAILS:
• Category: ${ticket.category}
• Target Period: ${ticket.week || 'Selected Week'}
• Priority Level: ${ticket.priority}
• Completion Deadline: ${ticket.deadlineDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAGGED STUDENTS (${ticket.taggedStudents?.length || 1}):
${taggedList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADMIN INSTRUCTIONS & REMARKS:
"${ticket.message}"

Please review these student cases on high priority, conduct required outreach or 1-on-1 counseling, and log your resolution progress on the portal before ${ticket.deadlineDate}.

Warm regards,

Rajni Mamgai
Academic Head of PW Gulf
Physics Wallah Gulf Division`;

    handleOpenGmailCompose(recipient, subject, bodyText, ticket.id);
  };

  // Copy email draft
  const handleCopyEmailDraft = () => {
    navigator.clipboard.writeText(emailBody);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  // Open Multi-Step Confirmation Dialog before executing assignment
  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) {
      alert('Please select a mentor.');
      return;
    }
    if (selectedStudents.length === 0) {
      alert('Please select at least one student to assign the task.');
      return;
    }
    if (!message.trim()) {
      alert('Please type a task message or review instructions.');
      return;
    }

    // Open multi-step confirmation dialog
    setConfirmStep(1);
    setConfirmChecklist({ verifiedStudents: false, authorizedDispatch: false });
    setIsConfirmDialogOpen(true);
  };

  // Execute Final Task Assignment after multi-step confirmation
  const executeTaskAssignment = async () => {
    setIsSending(true);
    setSuccessMessage(null);

    // Build Tagged Student Items for the ticket
    const taggedItems: TaggedStudentItem[] = selectedStudents.map((stName) => {
      const summary = students.find((s) => s.studentName.trim() === stName.trim());
      const attInfo = getAttendanceInfo(stName);
      return {
        studentName: stName,
        grade: summary?.grade || '',
        section: summary?.section || '',
        batch: summary?.batch || '',
        weekAttendancePct: attInfo.weekPct,
        lastWeekAttendancePct: attInfo.prevPct,
        status: 'Open',
      };
    });

    const primaryStudentName =
      selectedStudents.length === 1
        ? selectedStudents[0]
        : `${selectedStudents[0]} + ${selectedStudents.length - 1} other students`;

    const cleanMentorEmail =
      mentorEmail || `${selectedMentor.toLowerCase().replace(/[^a-z0-9]/g, '.')}@schoolmentors.org`;

    // Save ticket locally
    onCreateTicket({
      mentorName: selectedMentor,
      mentorEmail: cleanMentorEmail,
      studentName: primaryStudentName,
      taggedStudents: taggedItems,
      week: selectedWeek,
      category: taskCategory,
      priority: taskPriority,
      message: message,
      deadlineDate: deadlineDate,
      emailSent: sendEmailOnAssign,
    });

    setIsSending(false);
    setIsConfirmDialogOpen(false);

    // Auto open email composer modal if send email option is checked
    const mockTicketForModal: AdminTicket = {
      id: `TICK-${Date.now()}`,
      mentorName: selectedMentor,
      mentorEmail: cleanMentorEmail,
      studentName: primaryStudentName,
      taggedStudents: taggedItems,
      week: selectedWeek,
      category: taskCategory,
      priority: taskPriority,
      message: message,
      deadlineDate: deadlineDate,
      createdDate: new Date().toLocaleDateString(),
      status: 'Open',
      emailSent: sendEmailOnAssign,
    };

    if (sendEmailOnAssign) {
      openEmailModal(mockTicketForModal);
    }

    setMessage('');
    setSuccessMessage(
      `Task assigned successfully! ${selectedStudents.length} student(s) marked Open under ${taskCategory} for ${selectedMentor}. ${
        sendEmailOnAssign ? 'Email draft prepared for ' + adminUserEmail + '.' : ''
      }`
    );

    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Filtered tickets list
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (ticketStatusFilter !== 'All' && t.status !== ticketStatusFilter) return false;
      if (ticketMentorFilter !== 'All' && t.mentorName !== ticketMentorFilter) return false;

      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        const matchMentor = t.mentorName.toLowerCase().includes(q);
        const matchStudent = t.studentName.toLowerCase().includes(q);
        const matchCategory = t.category.toLowerCase().includes(q);
        const matchMsg = t.message.toLowerCase().includes(q);
        return matchMentor || matchStudent || matchCategory || matchMsg;
      }
      return true;
    });
  }, [tickets, ticketStatusFilter, ticketMentorFilter, searchFilter]);

  // Ticket Counts
  const totalTicketsCount = tickets.length;
  const openTicketsCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressTicketsCount = tickets.filter((t) => t.status === 'In Progress').length;
  const closedTicketsCount = tickets.filter((t) => t.status === 'Closed').length;

  const handleSaveTicketStatusUpdate = () => {
    if (!updatingTicket) return;
    if (onUpdateTicketStatus) {
      onUpdateTicketStatus(updatingTicket.id, updateStatusVal, mentorProgressNoteText);
    } else {
      onCloseTicket(updatingTicket.id, mentorProgressNoteText || 'Task progress updated by mentor.');
    }
    setUpdatingTicket(null);
    setMentorProgressNoteText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-indigo-500/20 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              Admin Task & Review Portal
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">
            Weekly Mentor Tagging & Email Task Reminders
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Select a mentor and week to filter zero attendance or flagged students. Dispatch official task notifications and email reminders directly to mentors from the logged-in admin account.
          </p>
        </div>

        {/* Logged in Admin Identity & Ticket Metrics */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-slate-800/90 px-3.5 py-2.5 rounded-xl border border-indigo-500/30 flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
              <AtSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logged-in Admin Sender</p>
              <div className="flex items-center space-x-1.5">
                <input
                  type="email"
                  value={adminUserEmail}
                  onChange={(e) => setAdminUserEmail(e.target.value)}
                  className="bg-transparent text-xs font-black text-emerald-300 focus:outline-none border-b border-dashed border-emerald-500/50 max-w-[190px]"
                  title="Logged-in User Email (Click to edit if needed)"
                />
                {isAuthorizedAdmin ? (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-400/30 font-bold">
                    Authorized Admin
                  </span>
                ) : (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30 font-bold">
                    Standard User
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Active Mentor Tickets</p>
              <p className="text-sm font-black text-indigo-300">
                {openTicketsCount} Open / {totalTicketsCount} Total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subtab Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 pb-3 gap-3 overflow-x-auto">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveAdminSubTab('tickets')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeAdminSubTab === 'tickets'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Assign Tasks & Dispatches</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono font-black">
              {totalTicketsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminSubTab('contacts')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeAdminSubTab === 'contacts'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mentor Email Directory</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono font-black">
              {mentorContacts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminSubTab('responses')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeAdminSubTab === 'responses'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Mentor Responses (Extra Sheet)</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono font-black">
              {mentorResponses.length}
            </span>
          </button>
        </div>

        {/* Quick Action Buttons per Tab */}
        <div className="flex items-center space-x-2 shrink-0">
          {activeAdminSubTab === 'contacts' && (
            <>
              <button
                type="button"
                onClick={handleCopyContactsTsv}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Copy formatted contacts data for Google Sheets"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copy TSV for Sheet</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingContact(null);
                  setContactFormName('');
                  setContactFormEmail('');
                  setContactFormAltEmail('');
                  setContactFormPhone('');
                  setContactFormDept('Academic Mentoring');
                  setContactFormStatus('Active');
                  setContactFormNotes('');
                  setIsContactModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Mentor Contact</span>
              </button>
            </>
          )}

          {activeAdminSubTab === 'responses' && (
            <>
              <button
                type="button"
                onClick={handleCopyResponsesTsv}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Copy formatted mentor responses data for Google Sheets Extra Sheet tab"
              >
                <Copy className="w-3.5 h-3.5 text-amber-300" />
                <span>Copy Extra Sheet TSV</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setResponseFormMentor(mentorList[0] || '');
                  setResponseFormEmail(mentorContacts[0]?.officialEmail || '');
                  setResponseFormTicketId('');
                  setResponseFormDate(new Date().toISOString().slice(0, 10));
                  setResponseFormSummary('');
                  setResponseFormAction('');
                  setResponseFormStatus('Received');
                  setIsResponseModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Log Mentor Response</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 1. ASSIGN TASKS & DISPATCHES SUBTAB */}
      {activeAdminSubTab === 'tickets' && (
        <>
          {/* Task Creation & Tagging Form Section (Only for Authorized Admin Emails) */}
          {isAuthorizedAdmin ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-indigo-600" />
                    1. Select Mentor, Week & Task Category
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose the target week to automatically pull Zero Attendance or Flagged students under the selected mentor.
                  </p>
                </div>
                {successMessage && (
                  <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}
              </div>

            <form onSubmit={handleSubmitTask} className="space-y-6">
              {/* Top Control Grid: Mentor, Mentor Email, Category, Week */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Mentor Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Mentor <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={selectedMentor}
                      onChange={(e) => setSelectedMentor(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                      required
                    >
                      {mentorList.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Mentor Email Address */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Mentor Email Address <span className="text-rose-500">*</span>
                    </label>
                    {isEmailAutoPicked && (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Auto-Picked
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={mentorEmail}
                        onChange={(e) => {
                          setMentorEmail(e.target.value);
                          setIsEmailAutoPicked(false);
                        }}
                        placeholder="mentor.email@domain.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveContactInDirectory(selectedMentor, mentorEmail)}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-[11px] font-extrabold text-slate-700 flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Save or update this email in Mentor Directory"
                    >
                      <Save className="w-3 h-3 text-indigo-600" />
                      <span className="hidden xl:inline">Save Email</span>
                    </button>
                  </div>
                </div>

            {/* 3. Task Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Task Category / Issue Tag
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="Zero Attendance Followup">Zero Attendance Followup</option>
                  <option value="Flagged Performance (<75%)">Flagged Performance (&lt;75%)</option>
                  <option value="Academic / Subjective Review">Academic / Subjective Review</option>
                  <option value="General Action Item">General Action Item</option>
                </select>
              </div>
            </div>

            {/* 4. Week Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Attendance Week <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  {availableWeeks.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Zero Attendance Candidate Selector Banner */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg font-extrabold text-xs">
                  {selectedWeek}
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    Candidate Students for {selectedMentor} ({weekCandidateStudents.length} Found)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {taskCategory.includes('Zero')
                      ? `Students with 0% attendance recorded in ${selectedWeek}`
                      : taskCategory.includes('Flagged')
                      ? 'Students performing below 75% threshold'
                      : 'Active students under mentor'}
                  </p>
                </div>
              </div>

              {weekCandidateStudents.length > 0 && (
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  {selectedStudents.length === weekCandidateStudents.length
                    ? 'Deselect All Candidates'
                    : `Select All Candidates (${weekCandidateStudents.length})`}
                </button>
              )}
            </div>

            {/* Candidate Checklist */}
            {weekCandidateStudents.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs font-medium">
                No candidate students found for {selectedMentor} in {selectedWeek} under {taskCategory}.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {weekCandidateStudents.map((st) => {
                  const isChecked = selectedStudents.includes(st.studentName);
                  const attInfo = getAttendanceInfo(st.studentName);

                  return (
                    <label
                      key={st.studentName}
                      className={`flex items-center p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-indigo-50/90 border-indigo-300 ring-1 ring-indigo-400/20 text-indigo-950 font-bold'
                          : 'bg-white border-slate-200 hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleStudent(st.studentName)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-2.5 h-4 w-4"
                      />
                      <div className="truncate flex-1">
                        <p className="truncate font-bold text-slate-900">{st.studentName}</p>
                        <p className="text-[10px] text-slate-500">
                          Gr {st.grade}-{st.section} • {selectedWeek}:{' '}
                          <strong className={attInfo.weekPct === 0 ? 'text-rose-600 font-extrabold' : 'text-slate-700'}>
                            {attInfo.weekPct}%
                          </strong>
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Selected Students Verification Preview Table */}
          {selectedStudents.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Selected Students Verification Preview ({selectedStudents.length} Tagged)
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">
                  Verify attendance trend before finalizing task assignment
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Grade & Section</th>
                        <th className="py-2.5 px-3">Batch</th>
                        <th className="py-2.5 px-3 text-center">{selectedWeek} Att.</th>
                        <th className="py-2.5 px-3 text-center">Previous Week Att.</th>
                        <th className="py-2.5 px-3 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {selectedStudents.map((stName) => {
                        const summary = students.find((s) => s.studentName.trim() === stName.trim());
                        const attInfo = getAttendanceInfo(stName);

                        return (
                          <tr key={stName} className="hover:bg-slate-50/80">
                            <td className="py-2 px-3 font-bold text-slate-900">{stName}</td>
                            <td className="py-2 px-3">
                              {summary ? `Gr ${summary.grade}-${summary.section}` : '-'}
                            </td>
                            <td className="py-2 px-3">{summary?.batch || 'Impact'}</td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                  attInfo.weekPct === 0
                                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                                    : 'bg-amber-100 text-amber-800 border-amber-200'
                                }`}
                              >
                                {attInfo.weekPct}%
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {attInfo.prevPct}% ({attInfo.prevWeekName})
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleToggleStudent(stName)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove from task"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. Priority, Deadline & Email Option */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Priority Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Priority Level
              </label>
              <div className="flex items-center space-x-1.5">
                {(['Critical', 'High', 'Medium', 'Low'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTaskPriority(p)}
                    className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      taskPriority === p
                        ? p === 'Critical'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : p === 'High'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                          : p === 'Medium'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Task Completion Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            {/* Email Dispatch Checkbox */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Dispatch Setting
              </label>
              <label className="flex items-center p-2 rounded-xl border border-indigo-200 bg-indigo-50/60 text-xs font-bold text-indigo-950 cursor-pointer h-9 mt-0.5">
                <input
                  type="checkbox"
                  checked={sendEmailOnAssign}
                  onChange={(e) => setSendEmailOnAssign(e.target.checked)}
                  className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 mr-2 h-4 w-4"
                />
                <Mail className="w-3.5 h-3.5 mr-1.5 text-indigo-600 shrink-0" />
                <span className="truncate">Prepare Email Reminder (from {adminUserEmail})</span>
              </label>
            </div>
          </div>

          {/* Instructions Message */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Admin Remarks & Specific Instructions <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="e.g. Conduct urgent parent outreach, inquire reason for 0% attendance in Week 3, schedule 1-on-1 doubt session and update log stage before Friday."
              className="w-full p-3 rounded-xl border border-slate-300 font-medium text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSending || selectedStudents.length === 0}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isSending ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Assigning Task & Preparing Email Reminder...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>
                  Assign Task & Send Email to {selectedMentor} ({selectedStudents.length} Tagged)
                </span>
              </>
            )}
          </button>
        </form>
      </div>
      ) : (
        /* Non-Authorized Admin Notice Banner */
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-amber-950">
                Task Creation & Email Dispatch Restricted
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                You are currently logged in as <strong className="underline">{adminUserEmail}</strong>. Creating new tasks and dispatching email reminders is restricted to authorized PW Gulf Academic Heads:
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-amber-200/60">
            {AUTHORIZED_ADMIN_EMAILS.map((e) => (
              <span key={e} className="px-2 py-0.5 rounded bg-white text-amber-900 font-bold text-[11px] border border-amber-300 shadow-2xs">
                {e}
              </span>
            ))}
          </div>
          <p className="text-xs text-amber-800 font-medium pt-1">
            As a logged-in user, you can view assigned task tickets in the dashboard below, add progress updates, and mark completed tasks as closed.
          </p>
        </div>
      )}

      {/* Assigned Tasks & Tickets Management Dashboard */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 space-y-6">
        {/* KPI Row for Admin Tasks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-indigo-50/80 p-3.5 rounded-xl border border-indigo-200">
            <p className="text-[10px] font-bold text-indigo-700 uppercase">Total Tasks Assigned</p>
            <p className="text-xl font-black text-indigo-950 mt-1">{totalTicketsCount}</p>
          </div>
          <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200">
            <p className="text-[10px] font-bold text-amber-700 uppercase">Open / Pending</p>
            <p className="text-xl font-black text-amber-950 mt-1">{openTicketsCount}</p>
          </div>
          <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200">
            <p className="text-[10px] font-bold text-blue-700 uppercase">In Progress</p>
            <p className="text-xl font-black text-blue-950 mt-1">{inProgressTicketsCount}</p>
          </div>
          <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200">
            <p className="text-[10px] font-bold text-emerald-700 uppercase">Closed / Resolved</p>
            <p className="text-xl font-black text-emerald-950 mt-1">{closedTicketsCount}</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-indigo-600" />
              2. Assigned Admin Tickets & Mentor Progress Tracker
            </h3>
            <p className="text-xs text-slate-500">
              Track progress of assigned tasks, mentor notes, and dispatch email reminders directly to mentors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={ticketStatusFilter}
              onChange={(e) => setTicketStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Mentor Filter */}
            <select
              value={ticketMentorFilter}
              onChange={(e) => setTicketMentorFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Mentors</option>
              {mentorList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search ticket..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Tickets Cards Grid */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
              <p className="font-semibold text-slate-700">No tickets found matching current filters.</p>
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isClosed = t.status === 'Closed';
              const isInProgress = t.status === 'In Progress';
              const taggedCount = t.taggedStudents ? t.taggedStudents.length : 1;

              return (
                <div
                  key={t.id}
                  className={`p-5 rounded-2xl border shadow-2xs transition-all space-y-4 ${
                    isClosed
                      ? 'bg-slate-50/70 border-slate-200'
                      : isInProgress
                      ? 'bg-blue-50/30 border-blue-200/80 ring-1 ring-blue-400/20'
                      : 'bg-white border-amber-200/80 ring-1 ring-amber-400/20'
                  }`}
                >
                  {/* Ticket Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
                          isClosed
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isInProgress
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {t.status}
                      </span>

                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {t.category}
                      </span>

                      {t.week && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {t.week}
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          t.priority === 'Critical'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : t.priority === 'High'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.priority}
                      </span>

                      {/* Email Status Indicator */}
                      {t.emailSent ? (
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1"
                          title={`Email sent to mentor from ${adminUserEmail}`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Email Sent
                        </span>
                      ) : (
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1"
                          title="Email reminder pending"
                        >
                          <Mail className="w-3 h-3 text-amber-600" />
                          Email Pending
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: <strong className="text-slate-900 font-bold">{t.deadlineDate}</strong></span>
                    </div>
                  </div>

                  {/* Mentor & Tagged Student Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                        Assigned Mentor & Email
                      </p>
                      <p className="font-extrabold text-slate-900 text-sm">
                        {t.mentorName} <span className="text-slate-500 font-normal text-xs">({t.mentorEmail})</span>
                      </p>
                      <p className="text-slate-500 text-[11px] mt-1">Assigned on {t.createdDate}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                        Tagged Students ({taggedCount})
                      </p>
                      {t.taggedStudents && t.taggedStudents.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                          {t.taggedStudents.map((st) => (
                            <span
                              key={st.studentName}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200"
                            >
                              {st.studentName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="font-bold text-slate-900">{t.studentName}</p>
                      )}
                    </div>
                  </div>

                  {/* Admin Message */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-800 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Admin Instructions:</p>
                    <p className="font-medium whitespace-pre-wrap">{t.message}</p>
                  </div>

                  {/* Mentor Progress Note if existing */}
                  {t.mentorProgressNote && (
                    <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-200 text-xs text-indigo-950 space-y-1">
                      <p className="text-[10px] font-bold text-indigo-700 uppercase">Mentor Progress Update Note:</p>
                      <p className="font-medium whitespace-pre-wrap">{t.mentorProgressNote}</p>
                    </div>
                  )}

                  {/* Admin Closing Note if closed */}
                  {t.adminClosingNote && (
                    <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase">
                        Closing Remarks ({t.closedDate || 'Closed'}):
                      </p>
                      <p className="font-medium whitespace-pre-wrap">{t.adminClosingNote}</p>
                    </div>
                  )}

                  {/* Bottom Action Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-medium">
                      <AtSign className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Authorized Sender: <strong className="text-slate-800 font-bold">{adminUserEmail}</strong></span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isAuthorizedAdmin ? (
                        <>
                          {/* One-click Instant Send Email */}
                          <button
                            type="button"
                            onClick={() => handleQuickSendEmail(t)}
                            className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                            title="Send email immediately to mentor with all ticket information"
                          >
                            <Send className="w-3.5 h-3.5 mr-1.5 text-emerald-200" />
                            ⚡ Easy Send Email
                          </button>

                          {/* Preview / Customize Email Modal */}
                          <button
                            type="button"
                            onClick={() => openEmailModal(t)}
                            className="inline-flex items-center px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            title="Review or edit email content before sending"
                          >
                            <Mail className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                            Preview / Edit
                          </button>
                        </>
                      ) : (
                        <span
                          className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200"
                          title="Email sending is restricted to authorized Academic Heads"
                        >
                          Email Restricted
                        </span>
                      )}

                      {!isClosed && (
                        <button
                          type="button"
                          onClick={() => {
                            setUpdatingTicket(t);
                            setUpdateStatusVal('In Progress');
                            setMentorProgressNoteText(t.mentorProgressNote || '');
                          }}
                          className="inline-flex items-center px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                          Update Stage
                        </button>
                      )}

                      {!isClosed && (
                        <button
                          type="button"
                          onClick={() => {
                            setUpdatingTicket(t);
                            setUpdateStatusVal('Closed');
                            setMentorProgressNoteText('');
                          }}
                          className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                          Mark Closed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      </>
      )}

      {/* 2. MENTOR CONTACTS DIRECTORY SUBTAB */}
      {activeAdminSubTab === 'contacts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Mentor Email Directory & Official Contacts
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Store and auto-pick verified mentor email addresses for task assignments and Google Sheets sync.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyContactsTsv}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Copy className="w-4 h-4 text-emerald-400" />
                  <span>Copy TSV for Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingContact(null);
                    setContactFormName('');
                    setContactFormEmail('');
                    setContactFormAltEmail('');
                    setContactFormPhone('');
                    setContactFormDept('Academic Mentoring');
                    setContactFormStatus('Active');
                    setContactFormNotes('');
                    setIsContactModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Mentor Contact</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={contactsSearchQuery}
                  onChange={(e) => setContactsSearchQuery(e.target.value)}
                  placeholder="Search mentor name, email, department..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="text-xs font-bold text-slate-500">
                Showing <span className="text-slate-900 font-extrabold">{filteredMentorContacts.length}</span> of {mentorContacts.length} contacts
              </div>
            </div>

            {/* Directory Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] font-extrabold tracking-wider">
                    <th className="p-3">Mentor Name</th>
                    <th className="p-3">Official Email (Auto-Picked)</th>
                    <th className="p-3">Alternate Email & Phone</th>
                    <th className="p-3">Department / Region</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Notes</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredMentorContacts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 text-xs font-bold">
                        No mentor contacts match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredMentorContacts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-extrabold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                            {c.mentorName.charAt(0)}
                          </div>
                          <span>{c.mentorName}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 font-mono text-indigo-700 font-extrabold">
                            <AtSign className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>{c.officialEmail}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(c.officialEmail);
                                setSuccessMessage(`Copied ${c.officialEmail}!`);
                                setTimeout(() => setSuccessMessage(null), 3000);
                              }}
                              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                              title="Copy email address"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="p-3 space-y-0.5">
                          <p className="text-slate-600 font-medium text-[11px]">{c.alternateEmail || '—'}</p>
                          {c.phone && <p className="text-slate-500 font-mono text-[10px] flex items-center gap-1"><Phone className="w-2.5 h-2.5 text-slate-400" />{c.phone}</p>}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-extrabold text-[10px] border border-slate-200">
                            {c.department || 'Academic Mentoring'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              c.activeStatus === 'Active'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : c.activeStatus === 'On Leave'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {c.activeStatus}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 max-w-xs truncate text-[11px]">
                          {c.notes || '—'}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMentor(c.mentorName);
                                setActiveAdminSubTab('tickets');
                              }}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                              title="Assign task to this mentor"
                            >
                              <Send className="w-3 h-3" />
                              <span>Assign</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditContact(c)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Edit contact"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteContact(c.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete contact"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. MENTOR RESPONSES EXTRA SHEET SUBTAB */}
      {activeAdminSubTab === 'responses' && (
        <div className="space-y-6">
          {/* Extra Sheet Sync Information Banner */}
          <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-teal-500/30 shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <Database className="w-3 h-3 text-teal-400" />
                    Google Sheet Extra Sheet Sync Store
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">
                  Mentor Correspondence & Response Extra Sheet
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Log mentor responses and feedback notes. All entries populate directly into the extra sheet store (<code className="text-teal-300">Mentor_Responses</code>) for live sync with your Google Sheet.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyResponsesTsv}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Copy className="w-4 h-4 text-amber-300" />
                  <span>Copy Extra Sheet TSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResponseFormMentor(mentorList[0] || '');
                    setResponseFormEmail(mentorContacts[0]?.officialEmail || '');
                    setResponseFormTicketId('');
                    setResponseFormDate(new Date().toISOString().slice(0, 10));
                    setResponseFormSummary('');
                    setResponseFormAction('');
                    setResponseFormStatus('Received');
                    setIsResponseModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Log Mentor Response</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Bar & Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={responsesSearchQuery}
                    onChange={(e) => setResponsesSearchQuery(e.target.value)}
                    placeholder="Search mentor name, email, response text..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  />
                </div>

                <select
                  value={responsesStatusFilter}
                  onChange={(e) => setResponsesStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Received">Received</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Action Required">Action Required</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="text-xs font-bold text-slate-500">
                Showing <span className="text-slate-900 font-extrabold">{filteredMentorResponses.length}</span> response logs
              </div>
            </div>

            {/* Responses Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] font-extrabold tracking-wider">
                    <th className="p-3">Response ID</th>
                    <th className="p-3">Mentor Name & Email</th>
                    <th className="p-3">Ticket Ref</th>
                    <th className="p-3">Date Received</th>
                    <th className="p-3">Mentor Response Summary</th>
                    <th className="p-3">Action Taken</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredMentorResponses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 text-xs font-bold">
                        No mentor responses recorded yet. Click "Log Mentor Response" above to record one!
                      </td>
                    </tr>
                  ) : (
                    filteredMentorResponses.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-extrabold text-indigo-700 text-[11px]">
                          {r.id}
                        </td>
                        <td className="p-3">
                          <p className="font-extrabold text-slate-900">{r.mentorName}</p>
                          <p className="text-[10px] font-mono text-slate-500">{r.mentorEmail}</p>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600 font-bold">
                          {r.ticketRefId || '—'}
                        </td>
                        <td className="p-3 text-slate-600 font-medium">
                          {r.responseDate}
                        </td>
                        <td className="p-3 max-w-sm">
                          <p className="text-slate-800 font-semibold leading-snug line-clamp-2">
                            "{r.responseSummary}"
                          </p>
                        </td>
                        <td className="p-3 max-w-xs text-slate-700 font-medium">
                          {r.actionTaken || '—'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              r.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : r.status === 'Action Required'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : r.status === 'Reviewed'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteResponse(r.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete response log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Mentor Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {editingContact ? 'Edit Mentor Email Contact' : 'Add New Mentor Contact'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Auto-pick email when assigning tasks to mentors
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsContactModalOpen(false);
                  setEditingContact(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitContactForm} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mentor Name *</label>
                <input
                  type="text"
                  value={contactFormName}
                  onChange={(e) => setContactFormName(e.target.value)}
                  placeholder="e.g. Vibha Raj"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email Address *</label>
                <input
                  type="email"
                  value={contactFormEmail}
                  onChange={(e) => setContactFormEmail(e.target.value)}
                  placeholder="mentor.name@schoolmentors.org"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-extrabold text-indigo-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alternate Email</label>
                  <input
                    type="email"
                    value={contactFormAltEmail}
                    onChange={(e) => setContactFormAltEmail(e.target.value)}
                    placeholder="mentor@pw.live"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={contactFormPhone}
                    onChange={(e) => setContactFormPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department / Region</label>
                  <input
                    type="text"
                    value={contactFormDept}
                    onChange={(e) => setContactFormDept(e.target.value)}
                    placeholder="e.g. Academic Mentoring (UAE)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={contactFormStatus}
                    onChange={(e) => setContactFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Remarks</label>
                <textarea
                  value={contactFormNotes}
                  onChange={(e) => setContactFormNotes(e.target.value)}
                  placeholder="Special remarks or assigned batches..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsContactModalOpen(false);
                    setEditingContact(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingContact ? 'Update Contact' : 'Save Contact'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Mentor Response Modal */}
      {isResponseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Log Mentor Response for Google Sheet Extra Sheet
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Record mentor feedback or correspondence for automatic sync
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResponseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMentorResponse} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Mentor *</label>
                  <select
                    value={responseFormMentor}
                    onChange={(e) => {
                      const name = e.target.value;
                      setResponseFormMentor(name);
                      const match = mentorContacts.find((c) => c.mentorName.trim().toLowerCase() === name.trim().toLowerCase());
                      if (match) setResponseFormEmail(match.officialEmail);
                      else setResponseFormEmail(`${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@schoolmentors.org`);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-extrabold text-slate-900 bg-white"
                    required
                  >
                    {mentorList.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mentor Email</label>
                  <input
                    type="email"
                    value={responseFormEmail}
                    onChange={(e) => setResponseFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-indigo-700 font-bold bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ticket / Ref ID (Optional)</label>
                  <select
                    value={responseFormTicketId}
                    onChange={(e) => setResponseFormTicketId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                  >
                    <option value="">General Mentor Feedback</option>
                    {tickets.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id} - {t.mentorName} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Response Date *</label>
                  <input
                    type="date"
                    value={responseFormDate}
                    onChange={(e) => setResponseFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mentor Response Summary *</label>
                <textarea
                  value={responseFormSummary}
                  onChange={(e) => setResponseFormSummary(e.target.value)}
                  placeholder="Paste or type mentor response, call notes, or follow-up status..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Action Taken / Resolution</label>
                  <input
                    type="text"
                    value={responseFormAction}
                    onChange={(e) => setResponseFormAction(e.target.value)}
                    placeholder="e.g. Scheduled extra doubt batch"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={responseFormStatus}
                    onChange={(e) => setResponseFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white"
                  >
                    <option value="Received">Received</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Action Required">Action Required</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResponseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Sync Extra Sheet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Composer & Reminder Modal */}
      {emailModalTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Send Email Task Reminder to Mentor
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Official dispatch from logged-in admin user
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEmailModalTicket(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Success Toast Banner */}
            {emailSuccessToast && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{emailSuccessToast}</span>
              </div>
            )}

            {/* Email Form Fields */}
            <div className="space-y-3 text-xs">
              {/* From & To Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    From (Logged-in User Email)
                  </label>
                  <div className="flex items-center px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-extrabold">
                    <AtSign className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
                    <span className="truncate">{adminUserEmail}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    To (Mentor Email) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject Line <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Email Body Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Email Message Content
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyEmailDraft}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedToast ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEmailModalTicket(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendDirectWebEmail}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                  title="Open prefilled compose window in Gmail Web using your logged in Google account"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>🚀 Send via Gmail Web (Logged in User)</span>
                </button>

                <button
                  type="button"
                  onClick={handleLaunchMailClient}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer"
                  title="Trigger native Mail App or default browser mail client"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-300" />
                  <span>Mail App (mailto)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress & Closing Dialog Modal */}
      {updatingTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                Update Ticket Progress & Resolution
              </h3>
              <button
                onClick={() => setUpdatingTicket(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Mentor & Category</p>
                <p className="font-extrabold text-slate-800">
                  {updatingTicket.mentorName} • {updatingTicket.category} ({updatingTicket.week || 'Week'})
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ticket Status Stage
                </label>
                <div className="flex space-x-2">
                  {(['Open', 'In Progress', 'Closed'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setUpdateStatusVal(st)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        updateStatusVal === st
                          ? st === 'Closed'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : st === 'In Progress'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mentor Outreach & Action Notes
                </label>
                <textarea
                  value={mentorProgressNoteText}
                  onChange={(e) => setMentorProgressNoteText(e.target.value)}
                  rows={4}
                  placeholder="Enter details about phone calls, student/parent response, scheduled doubt sessions, or closing note..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUpdatingTicket(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTicketStatusUpdate}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Save Progress Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-step Confirmation Dialog for Bulk Task Assignment */}
      {isConfirmDialogOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            {/* Modal Header & Stepper */}
            <div className="border-b border-slate-100 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Bulk Assignment Confirmation
                    </h3>
                    <p className="text-xs text-slate-500">
                      Multi-step verification to prevent accidental ticket creation
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConfirmDialogOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Stepper Tabs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setConfirmStep(1)}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    confirmStep === 1
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 text-center text-xs flex items-center justify-center font-black">
                    1
                  </span>
                  <span>Review Tagged Roster</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmStep(2)}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    confirmStep === 2
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 text-center text-xs flex items-center justify-center font-black">
                    2
                  </span>
                  <span>Authorize & Execute</span>
                </button>
              </div>
            </div>

            {/* Step 1: Review Tagged Students & Parameters */}
            {confirmStep === 1 && (
              <div className="space-y-4 text-xs">
                {/* Summary Box */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Assigned Mentor</p>
                      <p className="font-extrabold text-slate-900 truncate">{selectedMentor}</p>
                      <p className="text-[10px] text-slate-500 truncate">{mentorEmail}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Task Category</p>
                      <p className="font-bold text-indigo-700 truncate">{taskCategory}</p>
                      <p className="text-[10px] text-slate-500">Target: {selectedWeek}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Priority & Deadline</p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          taskPriority === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : taskPriority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {taskPriority}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Due: {deadlineDate}</p>
                    </div>
                  </div>
                </div>

                {/* Tagged Student Preview Table */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Tagged Student Roster ({selectedStudents.length} Selected)
                    </p>
                    <span className="text-[10px] font-bold text-slate-500">
                      Verify student names before step 2
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-40 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                          <th className="py-2 px-3">Student Name</th>
                          <th className="py-2 px-3">Gr & Sec</th>
                          <th className="py-2 px-3 text-center">{selectedWeek} Att %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {selectedStudents.map((stName) => {
                          const summary = students.find((s) => s.studentName.trim() === stName.trim());
                          const attInfo = getAttendanceInfo(stName);

                          return (
                            <tr key={stName} className="hover:bg-slate-50">
                              <td className="py-1.5 px-3 font-bold text-slate-900">{stName}</td>
                              <td className="py-1.5 px-3 text-slate-600">
                                {summary ? `Gr ${summary.grade}-${summary.section}` : '-'}
                              </td>
                              <td className="py-1.5 px-3 text-center font-bold">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] ${
                                    attInfo.weekPct === 0
                                      ? 'bg-rose-100 text-rose-800 font-black'
                                      : 'bg-slate-100 text-slate-800'
                                  }`}
                                >
                                  {attInfo.weekPct}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Message Remarks Preview */}
                <div>
                  <p className="font-bold text-slate-700 text-[11px] mb-1">
                    Admin Remarks & Instructions Preview:
                  </p>
                  <p className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 text-amber-950 font-medium italic text-xs leading-relaxed">
                    "{message}"
                  </p>
                </div>

                {/* Footer buttons for Step 1 */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsConfirmDialogOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmStep(2)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Proceed to Step 2: Final Authorization</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Authorize & Execute Assignment */}
            {confirmStep === 2 && (
              <div className="space-y-4 text-xs">
                {/* Warning Callout Card */}
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-start space-x-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-amber-950 text-xs">
                        Bulk Ticket Creation Warning
                      </h4>
                      <p className="text-amber-900 leading-relaxed text-[11px]">
                        Executing this action will create an official ticket assigned to{' '}
                        <strong className="underline">{selectedMentor}</strong> containing{' '}
                        <strong>{selectedStudents.length} student(s)</strong>.
                      </p>
                      <p className="text-amber-800 text-[11px] font-medium">
                        Sender Account:{' '}
                        <strong className="text-amber-950">{adminUserEmail}</strong> • Email Dispatch:{' '}
                        <strong>{sendEmailOnAssign ? 'Enabled (Draft Prepared)' : 'Disabled'}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification Checkboxes */}
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <p className="font-extrabold text-slate-900 text-xs">
                    Please confirm all statements below before execution:
                  </p>

                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmChecklist.verifiedStudents}
                      onChange={(e) =>
                        setConfirmChecklist((prev) => ({
                          ...prev,
                          verifiedStudents: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5"
                    />
                    <span className="text-slate-700 font-semibold leading-tight">
                      I have verified that all {selectedStudents.length} student(s) listed belong to mentor{' '}
                      <strong>{selectedMentor}</strong> and require follow-up under <strong>{taskCategory}</strong>.
                    </span>
                  </label>

                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmChecklist.authorizedDispatch}
                      onChange={(e) =>
                        setConfirmChecklist((prev) => ({
                          ...prev,
                          authorizedDispatch: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5"
                    />
                    <span className="text-slate-700 font-semibold leading-tight">
                      I authorize creating this ticket and issuing instructions from account{' '}
                      <strong>{adminUserEmail}</strong> with deadline {deadlineDate}.
                    </span>
                  </label>
                </div>

                {/* Footer Buttons for Step 2 */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setConfirmStep(1)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    ← Back to Step 1
                  </button>

                  <button
                    type="button"
                    disabled={
                      isSending ||
                      !confirmChecklist.verifiedStudents ||
                      !confirmChecklist.authorizedDispatch
                    }
                    onClick={executeTaskAssignment}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-md flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSending ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Executing Ticket Creation...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Confirm & Execute Bulk Assignment</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
