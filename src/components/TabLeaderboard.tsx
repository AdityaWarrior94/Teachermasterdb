import React, { useState, useMemo } from 'react';
import {
  StudentSummary,
  AttendanceRecord,
  ObjectiveRecord,
  SubjectiveRecord,
  FollowupLog,
  DiscontinuationRecord,
  MentorLeaderboardItem,
} from '../types';
import { calculateMentorLeaderboard } from '../utils/dataProcessor';
import {
  Trophy,
  Medal,
  Crown,
  Calendar,
  Scale,
  Users,
  Award,
  Search,
} from 'lucide-react';
import { KpiCard } from './KpiCard';
import { DashboardWidget } from './DashboardWidget';

interface TabLeaderboardProps {
  students?: StudentSummary[];
  attendanceRecords?: AttendanceRecord[];
  objectiveRecords?: ObjectiveRecord[];
  subjectiveRecords?: SubjectiveRecord[];
  logs?: FollowupLog[];
  discontinuation?: DiscontinuationRecord[];
  leaderboard?: MentorLeaderboardItem[];
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const TabLeaderboard: React.FC<TabLeaderboardProps> = ({
  students = [],
  attendanceRecords = [],
  objectiveRecords = [],
  subjectiveRecords = [],
  logs = [],
  discontinuation = [],
  leaderboard: precalculatedLeaderboard,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedWeek, setSelectedWeek] = useState<string>('All');
  const [internalSearch, setInternalSearch] = useState<string>('');

  const effectiveSearch = searchQuery !== undefined ? searchQuery : internalSearch;

  const handleSearchChange = (val: string) => {
    setInternalSearch(val);
    if (onSearchChange) onSearchChange(val);
  };

  // Extract unique weeks from attendance records
  const availableWeeks = useMemo(() => {
    const set = new Set<string>();
    attendanceRecords.forEach((a) => {
      if (a.week) set.add(a.week);
    });
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
  }, [attendanceRecords]);

  // Calculate dynamic leaderboard based on selected week and active weightage rules
  const activeLeaderboard: MentorLeaderboardItem[] = useMemo(() => {
    if (students.length > 0) {
      return calculateMentorLeaderboard(
        students,
        logs,
        discontinuation,
        attendanceRecords,
        objectiveRecords,
        subjectiveRecords,
        selectedWeek
      );
    }
    return precalculatedLeaderboard || [];
  }, [
    students,
    logs,
    discontinuation,
    attendanceRecords,
    objectiveRecords,
    subjectiveRecords,
    selectedWeek,
    precalculatedLeaderboard,
  ]);

  // Filter leaderboard based on active search query
  const filteredLeaderboard = useMemo(() => {
    if (!effectiveSearch.trim()) return activeLeaderboard;
    const q = effectiveSearch.toLowerCase().trim();
    return activeLeaderboard.filter(
      (m) =>
        m.mentorName.toLowerCase().includes(q) ||
        m.badges.some((b) => b.toLowerCase().includes(q)) ||
        m.criteriaType.toLowerCase().includes(q)
    );
  }, [activeLeaderboard, effectiveSearch]);

  const topThree = filteredLeaderboard.slice(0, 3);
  const topMentor = activeLeaderboard[0];

  return (
    <div className="space-y-6">
      {/* KPI Overview Widget */}
      <DashboardWidget
        id="leaderboard-kpis"
        title="Mentor Weightage Leaderboard & Formula"
        subtitle="Dynamic evaluation rules automatically adjusting based on weekly test conduct. Excludes Discontinue & #NA entries."
        icon={Trophy}
        headerBg="bg-amber-50/80"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <KpiCard
            id="kpi-leaderboard-mentors"
            title="Evaluated Mentors"
            value={activeLeaderboard.length}
            subtext={selectedWeek === 'All' ? 'Overall Scope' : selectedWeek}
            icon={Users}
            color="indigo"
            trend={{ direction: 'up', value: 'Active Mentors' }}
            comparisonBadge={{ label: 'Rankings Live', type: 'indigo' }}
            tooltip="Total active mentors evaluated after filtering out discontinued students and #NA records."
          />

          <KpiCard
            id="kpi-leaderboard-top"
            title="Current Top Mentor"
            value={topMentor ? topMentor.mentorName : 'N/A'}
            subtext={topMentor ? `Score: ${topMentor.compositeScore} / 100` : 'No data'}
            icon={Trophy}
            color="amber"
            trend={{ direction: 'up', value: 'Rank #1' }}
            comparisonBadge={{ label: 'Top Performer', type: 'amber' }}
            tooltip="Highest performing mentor based on current week criteria weights."
          />

          <KpiCard
            id="kpi-leaderboard-criteria"
            title="Criteria Type Active"
            value={topMentor ? topMentor.criteriaType : 'With Tests'}
            subtext={
              topMentor?.hasTests
                ? 'Att 20% | ZeroAtt 30% | Obj 15% | Subj 15% | Disc 20%'
                : 'Att 40% | ZeroAtt 35% | Disc 25%'
            }
            icon={Award}
            color="emerald"
            trend={{ direction: 'neutral', value: 'Dynamic Weighting' }}
            comparisonBadge={{ label: 'Formula Adaptive', type: 'emerald' }}
            tooltip="Formula dynamically shifts weightage when tests are absent for a week."
          />
        </div>

        {/* Criteria Formula Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 flex items-start space-x-2">
            <Scale className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-900">With Test Criteria: </span>
              <span className="text-slate-700 text-[11px]">
                Attendance <strong>20%</strong> + Zero Att Completion <strong>30%</strong> + Objective{' '}
                <strong>15%</strong> + Subjective <strong>15%</strong> + Discontinuation <strong>20%</strong>
              </span>
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-start space-x-2">
            <Scale className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900">No Test Criteria: </span>
              <span className="text-slate-700 text-[11px]">
                Attendance <strong>40%</strong> + Zero Att Completion <strong>35%</strong> + Discontinuation{' '}
                <strong>25%</strong>
              </span>
            </div>
          </div>
        </div>
      </DashboardWidget>

      {/* Week Selection & Podium Widget */}
      <DashboardWidget
        id="leaderboard-podium"
        title="Mentor Performance Podium"
        subtitle="Top 3 ranked mentors for the selected timeframe"
        icon={Crown}
        customControls={
          <div className="flex items-center space-x-1.5 overflow-x-auto max-w-md">
            <button
              onClick={() => setSelectedWeek('All')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedWeek === 'All'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Overall
            </button>
            {availableWeeks.map((w) => (
              <button
                key={w}
                onClick={() => setSelectedWeek(w)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedWeek === w
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        }
      >
        {topThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topThree.map((m) => {
              const isFirst = m.rank === 1;
              const isSecond = m.rank === 2;
              const isThird = m.rank === 3;

              return (
                <div
                  key={m.mentorName}
                  className={`relative p-5 rounded-2xl border shadow-md flex flex-col justify-between space-y-4 overflow-hidden transition-all ${
                    isFirst
                      ? 'bg-gradient-to-b from-amber-500/10 via-amber-50/50 to-white border-amber-300 ring-2 ring-amber-400/30'
                      : isSecond
                      ? 'bg-gradient-to-b from-slate-200/40 via-slate-50 to-white border-slate-300'
                      : 'bg-gradient-to-b from-amber-900/5 via-orange-50/30 to-white border-orange-200'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      {isFirst && <Crown className="w-6 h-6 text-amber-500 fill-amber-400" />}
                      {isSecond && <Medal className="w-6 h-6 text-slate-400 fill-slate-300" />}
                      {isThird && <Medal className="w-6 h-6 text-amber-700 fill-amber-600" />}
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          isFirst
                            ? 'bg-amber-500 text-white'
                            : isSecond
                            ? 'bg-slate-700 text-white'
                            : 'bg-amber-800 text-white'
                        }`}
                      >
                        Rank #{m.rank}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs block">
                        Score: {m.compositeScore} / 100
                      </span>
                    </div>
                  </div>

                  {/* Mentor Info */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{m.mentorName}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          m.hasTests
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {m.criteriaType}
                      </span>
                      <span className="text-xs text-slate-500">
                        <strong>{m.totalStudents}</strong> Students
                      </span>
                    </div>
                  </div>

                  {/* Weighted Contribution Breakdown */}
                  <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Score Contribution Breakdown
                    </p>
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Attendance ({m.batchAttendanceAvg}%)</span>
                      <span className="font-bold text-emerald-600">
                        +{m.attendanceScoreContribution} pts
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Zero Att Log ({m.zeroAttendanceCompletionPct}%)</span>
                      <span className="font-bold text-amber-600">
                        +{m.zeroCompletionContribution} pts
                      </span>
                    </div>
                    {m.hasTests ? (
                      <>
                        <div className="flex justify-between items-center text-slate-700">
                          <span>Objective Test ({m.objectiveAvg}%)</span>
                          <span className="font-bold text-indigo-600">
                            +{m.objectiveContribution} pts
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-700">
                          <span>Subjective Test ({m.subjectiveAvg}%)</span>
                          <span className="font-bold text-indigo-600">
                            +{m.subjectiveContribution} pts
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center text-slate-400 italic text-[11px]">
                        <span>Tests Not Conducted</span>
                        <span>Weight Shifted</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-slate-700 border-t border-slate-100 pt-1">
                      <span>Discontinuation Score</span>
                      <span className="font-bold text-purple-600">
                        +{m.discontinuationContribution} pts
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1">
                    {m.badges.map((b) => (
                      <span
                        key={b}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DashboardWidget>

      {/* Full Leaderboard Table Widget */}
      <DashboardWidget
        id="leaderboard-master-table"
        title="Full Mentor Ranking & Evaluation Table"
        subtitle={`Showing performance scores for ${
          selectedWeek === 'All' ? 'All Weeks (Overall)' : selectedWeek
        }`}
        icon={Trophy}
        customControls={
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search mentor name..."
              value={effectiveSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
            {effectiveSearch && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        }
      >
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-3 px-3 text-center">Rank</th>
                <th className="py-3 px-4">Mentor Name</th>
                <th className="py-3 px-3 text-center">Criteria Used</th>
                <th className="py-3 px-2 text-center">Students</th>
                <th className="py-3 px-3 text-center">Attendance Avg</th>
                <th className="py-3 px-3 text-center">Zero Att Logged</th>
                <th className="py-3 px-3 text-center">Objective Avg</th>
                <th className="py-3 px-3 text-center">Subjective Avg</th>
                <th className="py-3 px-3 text-center">Discontinuation</th>
                <th className="py-3 px-4 text-center bg-indigo-50 text-indigo-900">Final Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLeaderboard.map((m) => (
                <tr key={m.mentorName} className="hover:bg-slate-50">
                  <td className="py-3 px-3 text-center font-bold">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs text-white ${
                        m.rank === 1
                          ? 'bg-amber-500 font-bold'
                          : m.rank === 2
                          ? 'bg-slate-500 font-bold'
                          : m.rank === 3
                          ? 'bg-amber-700 font-bold'
                          : 'bg-slate-200 text-slate-700 font-semibold'
                      }`}
                    >
                      {m.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex flex-col">
                      <span>{m.mentorName}</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {m.badges.map((b) => (
                          <span key={b} className="text-[9px] text-indigo-600 font-semibold">
                            #{b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.hasTests
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {m.hasTests ? 'With Test' : 'No Test'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center font-semibold text-slate-800">
                    {m.totalStudents}
                  </td>

                  {/* Attendance */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-bold text-emerald-600 block">{m.batchAttendanceAvg}%</span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      +{m.attendanceScoreContribution} pts
                    </span>
                  </td>

                  {/* Zero Attendance Followup */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-bold text-amber-600 block">
                      {m.zeroAttendanceCompletionPct}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      +{m.zeroCompletionContribution} pts
                    </span>
                  </td>

                  {/* Objective Avg */}
                  <td className="py-3 px-3 text-center">
                    {m.hasTests ? (
                      <>
                        <span className="font-bold text-indigo-600 block">{m.objectiveAvg}%</span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          +{m.objectiveContribution} pts
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">N/A</span>
                    )}
                  </td>

                  {/* Subjective Avg */}
                  <td className="py-3 px-3 text-center">
                    {m.hasTests ? (
                      <>
                        <span className="font-bold text-indigo-600 block">{m.subjectiveAvg}%</span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          +{m.subjectiveContribution} pts
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">N/A</span>
                    )}
                  </td>

                  {/* Discontinuation */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-bold text-purple-600 block">
                      {m.discontinuationCount} disc
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      +{m.discontinuationContribution} pts
                    </span>
                  </td>

                  {/* Final Composite Score */}
                  <td className="py-3 px-4 text-center font-black text-indigo-950 bg-indigo-50/80 text-sm">
                    {m.compositeScore}
                  </td>
                </tr>
              ))}

              {filteredLeaderboard.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-medium">
                    {effectiveSearch
                      ? `No active mentors found matching "${effectiveSearch}".`
                      : 'No active mentors found for the selected view.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardWidget>
    </div>
  );
};
