import React, { useState } from 'react';
import {
  StudentSummary,
  AttendanceRecord,
  ObjectiveRecord,
  SubjectiveRecord,
  FollowupLog,
  DiscontinuationRecord,
  AdminTicket,
} from '../types';
import { TabAnalytics } from './TabAnalytics';
import { TabLeaderboard } from './TabLeaderboard';
import { TabAcademicLeaderboard } from './TabAcademicLeaderboard';
import { TabWeeklyGoalVsActual } from './TabWeeklyGoalVsActual';
import { PieChart, Award, GraduationCap, Sparkles, Search, Target } from 'lucide-react';

export interface TabMasterInsightsProps {
  students: StudentSummary[];
  attendanceRecords: AttendanceRecord[];
  objectiveRecords: ObjectiveRecord[];
  subjectiveRecords: SubjectiveRecord[];
  logs: FollowupLog[];
  discontinuation: DiscontinuationRecord[];
  tickets?: AdminTicket[];
}

type SubCategory = 'analytics' | 'goal-vs-actual' | 'mentor-leaderboard' | 'academic-leaderboard';

export const TabMasterInsights: React.FC<TabMasterInsightsProps> = ({
  students,
  attendanceRecords,
  objectiveRecords,
  subjectiveRecords,
  logs,
  discontinuation,
  tickets = [],
}) => {
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategory>('goal-vs-actual');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const subCategories = [
    {
      id: 'goal-vs-actual' as const,
      label: 'Weekly Goal vs Actual',
      shortLabel: 'Goal vs Actual',
      icon: Target,
      description: 'Mentor task progress bars, closure rate & weekly targets',
      badge: 'Goal Tracking',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'analytics' as const,
      label: 'Analytics & Reason Buckets',
      shortLabel: 'Analytics',
      icon: PieChart,
      description: 'Zero attendance & discontinuation category breakdowns',
      badge: 'Tables & CSV',
      color: 'from-rose-500 to-amber-500',
    },
    {
      id: 'mentor-leaderboard' as const,
      label: 'Mentor Operations Leaderboard',
      shortLabel: 'Mentor Leaderboard',
      icon: Award,
      description: 'Operational score, followup index & resolution metrics',
      badge: 'KPI & Ranks',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'academic-leaderboard' as const,
      label: 'Academic Leaderboard',
      shortLabel: 'Academic Leaderboard',
      icon: GraduationCap,
      description: 'Student test averages, top performers & subject metrics',
      badge: 'Performance & Att.',
      color: 'from-blue-500 to-teal-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Subcategory Navigation Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Master Insights Hub</h2>
              <p className="text-xs text-slate-400 font-medium">
                Unified intelligence: Weekly Goal vs Actual progress, reason bucket analytics, mentor operation ranks, and academic performance
              </p>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search student or mentor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs font-bold w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Subcategory Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
          {subCategories.map((sub) => {
            const Icon = sub.icon;
            const isActive = activeSubCategory === sub.id;

            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubCategory(sub.id)}
                className={`flex items-start space-x-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800/90 border-indigo-500/80 shadow-lg ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-bold truncate ${
                        isActive ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {sub.label}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border shrink-0 ${
                        isActive
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {sub.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    {sub.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Subcategory Content */}
      <div className="transition-all duration-200">
        {activeSubCategory === 'goal-vs-actual' && (
          <TabWeeklyGoalVsActual
            students={students}
            attendanceRecords={attendanceRecords}
            logs={logs}
            tickets={tickets}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {activeSubCategory === 'analytics' && (
          <TabAnalytics
            students={students}
            logs={logs}
            discontinuation={discontinuation}
          />
        )}

        {activeSubCategory === 'mentor-leaderboard' && (
          <TabLeaderboard
            students={students}
            attendanceRecords={attendanceRecords}
            objectiveRecords={objectiveRecords}
            subjectiveRecords={subjectiveRecords}
            logs={logs}
            discontinuation={discontinuation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {activeSubCategory === 'academic-leaderboard' && (
          <TabAcademicLeaderboard
            students={students}
            attendanceRecords={attendanceRecords}
            objectiveRecords={objectiveRecords}
            subjectiveRecords={subjectiveRecords}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
      </div>
    </div>
  );
};
