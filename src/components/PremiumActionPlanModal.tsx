import React, { useState, useEffect } from 'react';
import { PremiumActionPlan, SubjectActionPlan, StudentSummary } from '../types';
import { X, Save, CheckCircle, Clock, BookOpen, Sparkles, MessageSquare, Plus, Trash2, Award } from 'lucide-react';

interface PremiumActionPlanModalProps {
  student: StudentSummary;
  existingPlan?: PremiumActionPlan | null;
  onSavePlan: (plan: PremiumActionPlan) => void;
  onClose: () => void;
}

const DEFAULT_SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Social Studies (SST)'];

export const PremiumActionPlanModal: React.FC<PremiumActionPlanModalProps> = ({
  student,
  existingPlan,
  onSavePlan,
  onClose,
}) => {
  const [teacherName, setTeacherName] = useState<string>(existingPlan?.teacherName || student.mentorName || 'Lead Mentor');
  const [overallRemark, setOverallRemark] = useState<string>(
    existingPlan?.overallRemark || 'Student demonstrates strong potential. Focus on recommended revision lectures and subject-wise problem sets.'
  );

  const [subjects, setSubjects] = useState<SubjectActionPlan[]>(() => {
    if (existingPlan && existingPlan.subjects && existingPlan.subjects.length > 0) {
      return existingPlan.subjects;
    }
    return DEFAULT_SUBJECTS.map((subj) => ({
      subject: subj,
      improvementComment: '',
      topicRevised: '',
      lectureRevised: '',
      timeSpentHours: '',
    }));
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubjectChange = (index: number, field: keyof SubjectActionPlan, value: string) => {
    setSubjects((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddSubject = () => {
    setSubjects((prev) => [
      ...prev,
      {
        subject: `New Subject ${prev.length + 1}`,
        improvementComment: '',
        topicRevised: '',
        lectureRevised: '',
        timeSpentHours: '',
      },
    ]);
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const plan: PremiumActionPlan = {
      id: existingPlan?.id || `plan-${Date.now()}`,
      studentName: student.studentName,
      teacherName: teacherName.trim() || student.mentorName,
      updatedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      overallRemark: overallRemark.trim(),
      subjects: subjects.filter((s) => s.subject.trim() !== ''),
    };

    onSavePlan(plan);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex justify-between items-center border-b border-indigo-950 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600/30 rounded-xl border border-indigo-400/30 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide flex items-center gap-2">
                Premium Individual Action Plan & Subject Improvements
              </h3>
              <p className="text-xs text-indigo-200">
                Student: <strong className="text-white">{student.studentName}</strong> (Gr {student.grade}-{student.section})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* Teacher Info & Overall Remarks */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teacher / Mentor Name</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  placeholder="Enter mentor / teacher name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Completion Date / Target</label>
                <div className="text-xs text-slate-500 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 font-semibold flex items-center justify-between">
                  <span>Weekly Academic Progress Target</span>
                  <span className="text-indigo-600 font-bold">Active Revision Cycle</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Overall Teacher Strategic Guidance & Individual Remarks</span>
                <span className="text-[10px] text-indigo-600 font-semibold">Saved in Student Report</span>
              </label>
              <textarea
                value={overallRemark}
                onChange={(e) => setOverallRemark(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                placeholder="Enter holistic performance review, motivational comments, and parent recommendations..."
              />
            </div>
          </div>

          {/* Subject Wise Action Table / Cards */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Subject-Wise Improvements, Revision Topics & Time Spent
              </h4>

              <button
                type="button"
                onClick={handleAddSubject}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center gap-1 border border-indigo-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Subject
              </button>
            </div>

            <div className="space-y-4">
              {subjects.map((subj, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 relative group"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <input
                      type="text"
                      value={subj.subject}
                      onChange={(e) => handleSubjectChange(idx, 'subject', e.target.value)}
                      className="font-black text-xs text-indigo-900 bg-indigo-50/60 px-2.5 py-1 rounded-lg border border-indigo-200 focus:bg-white outline-none"
                      placeholder="Subject Name"
                    />

                    {subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Remove subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Topic Revised / Concepts Covered
                      </label>
                      <input
                        type="text"
                        value={subj.topicRevised}
                        onChange={(e) => handleSubjectChange(idx, 'topicRevised', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                        placeholder="e.g. Kinematics, Organic Reactions, Trigonometry"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Lecture Revised / Chapter Series
                      </label>
                      <input
                        type="text"
                        value={subj.lectureRevised}
                        onChange={(e) => handleSubjectChange(idx, 'lectureRevised', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                        placeholder="e.g. Lecture 4 to 8, Chapter 3 Video Series"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Subject Improvement Comment & Key Action
                      </label>
                      <input
                        type="text"
                        value={subj.improvementComment}
                        onChange={(e) => handleSubjectChange(idx, 'improvementComment', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                        placeholder="e.g. Needs extra practice in numericals, good progress in conceptual MCQs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-600" />
                        Time Spent (Hours/Wk)
                      </label>
                      <input
                        type="text"
                        value={subj.timeSpentHours}
                        onChange={(e) => handleSubjectChange(idx, 'timeSpentHours', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                        placeholder="e.g. 6 Hours"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all cursor-pointer shadow-md flex items-center gap-2 ${
                savedSuccess ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Premium Plan Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Premium Action Plan & Update Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
