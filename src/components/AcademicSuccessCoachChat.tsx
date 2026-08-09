import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Copy,
  Check,
  Share2,
  RefreshCw,
  SlidersHorizontal,
  Calendar,
  AlertTriangle,
  UserCheck,
  BookOpen,
  Target,
  MessageSquare,
  ChevronDown,
  Flame,
  FileText,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';
import { StudentSummary, AdminTicket } from '../types';

export interface AcademicSuccessCoachChatProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentSummary[];
  filters: {
    grade?: string;
    section?: string;
    batch?: string;
    mentor?: string;
    student?: string;
    stream?: string;
    week?: string;
    search?: string;
  };
  zeroAttendanceList?: any[];
  discontinuationList?: any[];
  tickets?: AdminTicket[];
  loggedInUserEmail: string;
  selectedMentor: string;
  isAuthorizedAdmin: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
}

export const AcademicSuccessCoachChat: React.FC<AcademicSuccessCoachChatProps> = ({
  isOpen,
  onClose,
  students,
  filters,
  zeroAttendanceList = [],
  discontinuationList = [],
  tickets = [],
  loggedInUserEmail,
  selectedMentor,
  isAuthorizedAdmin,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [quickPillCategory, setQuickPillCategory] = useState<'smart' | 'mentor' | 'timetable' | 'parent'>('smart');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Initial welcome message if history is empty
  useEffect(() => {
    if (messages.length === 0) {
      const activeFilterSummary = [
        filters.grade ? `Grade ${filters.grade}` : '',
        filters.batch ? `Batch ${filters.batch}` : '',
        filters.mentor ? `Mentor: ${filters.mentor}` : '',
        filters.student ? `Student: ${filters.student}` : '',
        filters.stream ? `Stream: ${filters.stream}` : '',
      ].filter(Boolean).join(' • ') || 'All Gulf Batches';

      const initialMessage: ChatMessage = {
        id: 'welcome-msg',
        role: 'assistant',
        content: `### 👋 Welcome to your AI Academic Success Coach!

I am aligned with your **active dashboard filters**: **${activeFilterSummary}** (${students.length} students loaded).

How can I assist your operations today?
* 🎯 **Risk Analysis:** Identify high-risk or low attendance students.
* 📅 **Timetable Generator:** Create realistic schedules balancing School, Coaching, Prayer & Revision.
* 📋 **Mentor Assistant:** Generate today's call list, WhatsApp reminders & follow-up tasks.
* 👨‍👩‍👧 **Parent Counselling:** Generate positive, evidence-based advice for parent interactions.

Select a quick action chip below or type your query!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([initialMessage]);
    }
  }, [filters, students.length]);

  if (!isOpen) return null;

  // Build context payload for API
  const buildDashboardContext = () => {
    // Top 30 students to keep payload optimized
    const sampleStudents = students.slice(0, 30).map((s) => ({
      studentName: s.studentName,
      grade: s.grade,
      section: s.section,
      batch: s.batchName,
      mentorName: s.mentorName,
      attendancePercentage: s.attendancePercentage,
      subjectivePercentage: s.subjectivePercentage,
      objectivePercentage: s.objectivePercentage,
      riskFactor: s.riskFactor,
      zeroAttendanceCount: s.zeroAttendanceCount,
      discontinuationStatus: s.discontinuationStatus,
      teacherRemarks: s.teacherRemarks,
      parentInteractionNote: s.parentInteractionNote,
    }));

    return {
      filters,
      totalStudentsCount: students.length,
      filteredStudentsCount: students.length,
      students: sampleStudents,
      zeroAttendanceRecords: zeroAttendanceList.slice(0, 10),
      discontinuationRecords: discontinuationList.slice(0, 10),
      tickets: tickets.slice(0, 10),
      loggedInUserEmail,
      selectedMentor,
      isAuthorizedAdmin,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/academic-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          dashboardContext: buildDashboardContext(),
          customPrompt: query,
        }),
      });

      const data = await response.json();
      if (data.success && data.text) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      console.error('Chat submit error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **System Notice:** Could not connect to AI endpoint. Please try again. (${err.message})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeFiltersBadge = [
    filters.grade ? `Gr ${filters.grade}` : '',
    filters.batch ? filters.batch : '',
    filters.mentor ? `Mentor: ${filters.mentor}` : '',
    filters.student ? `Student: ${filters.student}` : '',
    filters.stream ? `Stream: ${filters.stream}` : '',
  ].filter(Boolean).join(' • ') || 'All Gulf Batches';

  // Quick Action Chips
  const smartPills = [
    { label: '🚨 Students at Risk', prompt: 'Which students are currently at high risk or have attendance <75%? Provide risk reasons and actions.' },
    { label: '📉 Low Attendance (<75%)', prompt: 'Show low attendance students and analyze why their attendance is affecting their academic performance.' },
    { label: '🛑 Likely Discontinuation', prompt: 'Identify students in discontinuation or zero attendance list and suggest retention actions.' },
    { label: '🏆 Top Performers', prompt: 'Highlight top performing students eligible for appreciation or advanced JEE/NEET problem sets.' },
    { label: '📚 Students Needing Revision', prompt: 'List students who need immediate revision support and weak subject focus.' },
  ];

  const mentorPills = [
    { label: '📋 Today\'s Follow-up List', prompt: 'Generate today\'s priority student follow-up call list for mentor operations.' },
    { label: '💬 WhatsApp Reminder Text', prompt: 'Draft a polite WhatsApp message template to remind parents about attendance and test revision.' },
    { label: '📞 Priority Call List', prompt: 'List top 5 priority students I should call today with specific discussion points.' },
    { label: '📝 Homework & Revision Status', prompt: 'Review student homework and revision completion logs and suggest follow-up steps.' },
  ];

  const timetablePills = [
    { label: '📅 Daily Academic Timetable', prompt: 'Generate a realistic daily study timetable for Gulf CBSE/JEE/NEET students balancing school, coaching, prayer, and rest.' },
    { label: '📆 Weekly Revision Strategy', prompt: 'Create a weekly revision plan prioritizing weak subjects without creating burnout.' },
    { label: '🚀 Monthly Improvement Plan', prompt: 'Draft a 30-day monthly improvement roadmap to raise student test scores by 15%.' },
  ];

  const parentPills = [
    { label: '👨‍👩‍👧 Parent Counselling Brief', prompt: 'Generate a parent-friendly briefing explaining student academic progress in simple, positive language.' },
    { label: '💬 Encouraging Parent Message', prompt: 'Write an encouraging parent message focusing on joint home-school study discipline.' },
  ];

  const currentPills =
    quickPillCategory === 'smart'
      ? smartPills
      : quickPillCategory === 'mentor'
      ? mentorPills
      : quickPillCategory === 'timetable'
      ? timetablePills
      : parentPills;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl h-[92vh] max-h-[850px] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-teal-500 rounded-xl text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">AI Academic Success Coach</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                  Live Dashboard AI
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                <SlidersHorizontal className="w-3 h-3 text-indigo-400" />
                <span className="text-slate-300 font-semibold truncate max-w-[280px] sm:max-w-md">
                  Active Filter: {activeFiltersBadge} ({students.length} Students)
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMessages([])}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              title="Clear Chat History"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Action Category Selector */}
        <div className="px-3 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setQuickPillCategory('smart')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              quickPillCategory === 'smart'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart Suggestions</span>
          </button>
          <button
            onClick={() => setQuickPillCategory('mentor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              quickPillCategory === 'mentor'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mentor Assistant</span>
          </button>
          <button
            onClick={() => setQuickPillCategory('timetable')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              quickPillCategory === 'timetable'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Timetable & Plans</span>
          </button>
          <button
            onClick={() => setQuickPillCategory('parent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              quickPillCategory === 'parent'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
            <span>Parent Guidance</span>
          </button>
        </div>

        {/* Quick Action Prompt Chips */}
        <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
          {currentPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(pill.prompt)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950 hover:border-indigo-500/60 text-slate-200 hover:text-indigo-200 text-xs font-semibold border border-slate-700/80 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-2xs active:scale-95 disabled:opacity-50"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/90">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs ${
                    isUser
                      ? 'bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white ring-2 ring-indigo-500/30'
                      : 'bg-gradient-to-tr from-teal-600 to-emerald-600 text-white ring-2 ring-teal-500/30'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className={`max-w-[85%] sm:max-w-[78%] space-y-1`}>
                  <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {isUser ? 'You' : 'Academic Success Coach AI'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-800/95 border border-slate-700/80 text-slate-100 rounded-tl-none shadow-md'
                    }`}
                  >
                    {/* Render Formatted Markdown Content */}
                    <div className="prose prose-invert prose-xs sm:prose-sm max-w-none space-y-2">
                      {msg.content.split('\n').map((line, idx) => {
                        if (line.startsWith('### ')) {
                          return (
                            <h3 key={idx} className="text-sm font-extrabold text-teal-300 mt-2 mb-1 border-b border-slate-700/60 pb-1">
                              {line.replace('### ', '')}
                            </h3>
                          );
                        }
                        if (line.startsWith('#### ')) {
                          return (
                            <h4 key={idx} className="text-xs font-black text-indigo-300 mt-2 mb-1">
                              {line.replace('#### ', '')}
                            </h4>
                          );
                        }
                        if (line.startsWith('* ') || line.startsWith('- ')) {
                          return (
                            <div key={idx} className="flex items-start gap-1.5 ml-2 my-0.5">
                              <span className="text-indigo-400 font-extrabold">•</span>
                              <span className="text-slate-200">{formatMarkdownInline(line.slice(2))}</span>
                            </div>
                          );
                        }
                        if (line.trim() === '') return <div key={idx} className="h-1" />;
                        return (
                          <p key={idx} className="my-0.5 text-slate-200 leading-normal">
                            {formatMarkdownInline(line)}
                          </p>
                        );
                      })}
                    </div>

                    {/* Copy & Share Actions for Assistant Messages */}
                    {!isUser && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-emerald-400" />
                          <span>Data Verified against Dashboard</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="px-2 py-1 rounded bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span>Copy Text</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Skeleton Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800 border border-slate-700/80 p-4 rounded-2xl rounded-tl-none text-xs text-slate-300 flex items-center gap-3">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                <div>
                  <p className="font-extrabold text-white text-xs">Analyzing Student Dashboard Data...</p>
                  <p className="text-[10px] text-slate-400">Evaluating attendance, test scores & stream rules</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Section */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask AI Coach about ${students.length} filtered students, timetables, or parent counsel...`}
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Coach</span>
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 px-1">
            <span>Powered by Gemini 3.6 Flash & Live Dashboard Analytics</span>
            <span>Strictly Academic Guidance & Data Rules</span>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper function to format bold text **text**
function formatMarkdownInline(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-extrabold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
