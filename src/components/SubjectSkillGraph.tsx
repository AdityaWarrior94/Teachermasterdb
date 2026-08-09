import React, { useState } from 'react';
import { ObjectiveRecord, SubjectiveRecord, StudentSummary } from '../types';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BrainCircuit, Trophy, Target, Sparkles, BarChart2, Zap } from 'lucide-react';

interface SubjectSkillGraphProps {
  student: StudentSummary;
  objectiveRecords: ObjectiveRecord[];
  subjectiveRecords: SubjectiveRecord[];
}

export const SubjectSkillGraph: React.FC<SubjectSkillGraphProps> = ({
  student,
  objectiveRecords,
  subjectiveRecords,
}) => {
  const [activeView, setActiveView] = useState<'radar' | 'bar'>('radar');

  const studentObj = objectiveRecords.find(
    (o) => o.studentName.trim().toLowerCase() === student.studentName.trim().toLowerCase()
  );

  const studentSub = subjectiveRecords.filter(
    (s) => s.studentName.trim().toLowerCase() === student.studentName.trim().toLowerCase()
  );

  // Subject list with normalized scores (0 - 100)
  const rawSubjects = [
    { name: 'Physics', objVal: studentObj?.physics, max: 40 },
    { name: 'Chemistry', objVal: studentObj?.chemistry, max: 40 },
    { name: 'Mathematics', objVal: studentObj?.maths, max: 40 },
    { name: 'Zoology', objVal: studentObj?.zoology, max: 40 },
    { name: 'Botany', objVal: studentObj?.botany, max: 40 },
    { name: 'Social Studies', objVal: studentObj?.sst, max: 40 },
    { name: 'Biology', objVal: studentObj?.biology, max: 40 },
    { name: 'English', objVal: studentObj?.english, max: 40 },
  ];

  // Map to Chart Data
  const chartData = rawSubjects.map((s) => {
    const isNotOpted =
      s.objVal === null || s.objVal === undefined || s.objVal === '-' || (typeof s.objVal === 'number' && (s.objVal < 0 || isNaN(s.objVal)));

    const objScore = typeof s.objVal === 'number' && !isNaN(s.objVal) && s.objVal >= 0 ? s.objVal : 0;
    const maxVal = typeof s.max === 'number' && s.max > 0 ? s.max : 40;
    const rawObjPct = !isNotOpted ? Math.round((objScore / maxVal) * 100) : 0;
    const objPct = isNaN(rawObjPct) ? 0 : rawObjPct;

    // Check subjective score for this subject
    const matchedSub = studentSub.filter(
      (sub) => sub.subject.toLowerCase().includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(sub.subject.toLowerCase())
    );

    const subPctSum = matchedSub.reduce((acc, curr) => {
      const p = typeof curr.percentage === 'number' && !isNaN(curr.percentage) ? curr.percentage : 0;
      return acc + p;
    }, 0);

    const rawSubPct = matchedSub.length > 0 ? Math.round(subPctSum / matchedSub.length) : objPct;
    const subPct = isNaN(rawSubPct) ? objPct : rawSubPct;

    const rawSkillScore = isNotOpted ? 0 : Math.round(objPct * 0.6 + subPct * 0.4);
    const skillScore = isNotOpted || isNaN(rawSkillScore) ? 0 : rawSkillScore;

    // Convert to IQ Index Scale (Base 70, Max 145)
    const rawIqIndex = isNotOpted ? 70 : Math.min(145, Math.round(70 + (skillScore / 100) * 75));
    const iqIndex = isNaN(rawIqIndex) ? 70 : rawIqIndex;

    return {
      subject: s.name,
      skillScore: skillScore,
      iqIndex: iqIndex,
      isNotOpted: isNotOpted,
      fullMark: 100,
    };
  });

  const activeChartData = chartData.filter((d) => !d.isNotOpted || d.skillScore > 0);
  const displayData = activeChartData.length > 0 ? activeChartData : chartData.slice(0, 5);

  // Overall IQ Index calculation
  const totalScoreSum = displayData.reduce((acc, curr) => acc + (typeof curr.skillScore === 'number' && !isNaN(curr.skillScore) ? curr.skillScore : 0), 0);
  const fallbackAvg = typeof student.overallAvg === 'number' && !isNaN(student.overallAvg) ? student.overallAvg : 0;
  const rawAvgSkillScore = displayData.length > 0 ? Math.round(totalScoreSum / displayData.length) : fallbackAvg;
  const avgSkillScore = isNaN(rawAvgSkillScore) ? 0 : rawAvgSkillScore;

  const rawOverallIq = Math.min(145, Math.round(70 + (avgSkillScore / 100) * 70));
  const overallIqIndex = isNaN(rawOverallIq) ? 70 : rawOverallIq;

  // Find Highest and Lowest skill
  const sorted = [...displayData].sort((a, b) => b.skillScore - a.skillScore);
  const topSkill = sorted[0];
  const lowestSkill = sorted[sorted.length - 1];

  const getIqTierLabel = (iq: number) => {
    if (iq >= 135) return { label: 'Superior / Expert Proficiency', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (iq >= 120) return { label: 'Advanced Aptitude', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    if (iq >= 105) return { label: 'Above Average Competency', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (iq >= 90) return { label: 'Standard Competency', color: 'text-slate-600 bg-slate-100 border-slate-200' };
    return { label: 'Focus & Foundation Required', color: 'text-rose-600 bg-rose-50 border-rose-200' };
  };

  const iqTier = getIqTierLabel(overallIqIndex);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              Subject Skill & IQ-Style Mastery Polygon Graph
            </h4>
            <p className="text-xs text-slate-500">
              Multi-dimensional cognitive aptitude & subject proficiency index
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveView('radar')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeView === 'radar'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            IQ Radar View
          </button>
          <button
            onClick={() => setActiveView('bar')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeView === 'bar'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Subject Bar Chart
          </button>
        </div>
      </div>

      {/* Top IQ Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-3.5 rounded-xl border border-indigo-950 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wider block">
              Cognitive Academic IQ Index
            </span>
            <span className="text-2xl font-black text-white mt-0.5 block">{overallIqIndex} <span className="text-xs text-indigo-300 font-normal">/ 145</span></span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-block mt-1 ${iqTier.color}`}>
              {iqTier.label}
            </span>
          </div>
          <Zap className="w-8 h-8 text-amber-400 opacity-80" />
        </div>

        {topSkill && (
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-500" />
                Strongest Subject Skill
              </span>
              <span className="text-sm font-black text-emerald-950 mt-1 block">{topSkill.subject}</span>
              <span className="text-xs font-bold text-emerald-700">
                {topSkill.skillScore}% Mastery (IQ Index: {topSkill.iqIndex})
              </span>
            </div>
          </div>
        )}

        {lowestSkill && (
          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                <Target className="w-3 h-3 text-amber-600" />
                Focus & Revision Priority
              </span>
              <span className="text-sm font-black text-amber-950 mt-1 block">{lowestSkill.subject}</span>
              <span className="text-xs font-bold text-amber-700">
                {lowestSkill.skillScore}% Mastery (IQ Index: {lowestSkill.iqIndex})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Chart Canvas */}
      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
        {activeView === 'radar' ? (
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={displayData}>
                <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#1e293b', fontSize: 11, fontWeight: '700' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar
                  name="Subject Skill Rating"
                  dataKey="skillScore"
                  stroke="#4f46e5"
                  fill="#6366f1"
                  fillOpacity={0.45}
                  strokeWidth={2.5}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs font-medium shadow-xl border border-slate-700 space-y-1">
                          <p className="font-extrabold text-indigo-300 text-sm">{data.subject}</p>
                          <p>Skill Score: <strong className="text-emerald-400">{data.skillScore}%</strong></p>
                          <p>IQ-Style Aptitude Index: <strong className="text-amber-300">{data.iqIndex}</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
                <XAxis
                  dataKey="subject"
                  tick={{ fill: '#334155', fontSize: 10, fontWeight: '700' }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs font-medium shadow-xl border border-slate-700 space-y-1">
                          <p className="font-extrabold text-indigo-300 text-sm">{data.subject}</p>
                          <p>Mastery: <strong className="text-emerald-400">{data.skillScore}%</strong></p>
                          <p>IQ Scale Aptitude: <strong className="text-amber-300">{data.iqIndex}</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="skillScore" radius={[8, 8, 0, 0]}>
                  {displayData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.skillScore >= 80
                          ? '#10b981'
                          : entry.skillScore >= 60
                          ? '#6366f1'
                          : entry.skillScore >= 40
                          ? '#f59e0b'
                          : '#f43f5e'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Legend Badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold pt-1">
        <span className="flex items-center gap-1 text-emerald-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> High Mastery (≥ 80%)
        </span>
        <span className="flex items-center gap-1 text-indigo-700">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Moderate (60% - 79%)
        </span>
        <span className="flex items-center gap-1 text-amber-700">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Focus Needed (40% - 59%)
        </span>
        <span className="flex items-center gap-1 text-rose-700">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Low / Unattempted (&lt; 40%)
        </span>
      </div>
    </div>
  );
};
