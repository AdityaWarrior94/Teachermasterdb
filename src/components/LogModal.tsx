import React, { useState } from 'react';
import {
  FollowupLog,
  FollowupStage,
  ReasonBucket,
  REASON_BUCKETS,
  ZERO_ATTENDANCE_REASON_BUCKETS,
  DISCONTINUATION_REASON_BUCKETS,
  StageHistoryItem
} from '../types';
import { X, Calendar, Clock, CheckCircle2, Save, History, Tag, FileText } from 'lucide-react';

interface LogModalProps {
  studentName: string;
  sourceTab: 'ZeroAttendance' | 'Flagged' | 'ReviewLog' | 'Discontinuation';
  existingLog?: FollowupLog;
  mentorName: string;
  grade: string;
  section: string;
  onSaveLog: (log: FollowupLog) => void;
  onClose: () => void;
}

export const LogModal: React.FC<LogModalProps> = ({
  studentName,
  sourceTab,
  existingLog,
  mentorName,
  grade,
  section,
  onSaveLog,
  onClose,
}) => {
  const availableBuckets =
    sourceTab === 'ZeroAttendance'
      ? ZERO_ATTENDANCE_REASON_BUCKETS
      : DISCONTINUATION_REASON_BUCKETS;

  const defaultBucket =
    sourceTab === 'ZeroAttendance' ? 'No Response' : 'Personal / No Reason Shared';

  const [currentStage, setCurrentStage] = useState<FollowupStage>(
    existingLog?.currentStage || 'In Progress'
  );
  const [reasonBucket, setReasonBucket] = useState<ReasonBucket>(
    existingLog?.reasonBucket || defaultBucket
  );
  const [scheduledDoubtDate, setScheduledDoubtDate] = useState<string>(
    existingLog?.scheduledDoubtDate || ''
  );
  const [scheduledDoubtTopic, setScheduledDoubtTopic] = useState<string>(
    existingLog?.scheduledDoubtTopic || ''
  );
  const [notes, setNotes] = useState<string>(existingLog?.notes || '');

  const stages: FollowupStage[] = [
    'Pending',
    'In Progress',
    'Doubt Scheduled',
    'Followed Up',
    'Resolved',
    'Closed',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newHistoryItem: StageHistoryItem = {
      id: `hist-${Date.now()}`,
      timestamp,
      stage: currentStage,
      actionBy: mentorName || 'Mentor',
      note: notes || `Updated stage to ${currentStage}`,
      scheduledDoubtDate: scheduledDoubtDate || undefined,
      scheduledDoubtTopic: scheduledDoubtTopic || undefined,
      reasonBucket,
    };

    const updatedHistory = existingLog?.history ? [...existingLog.history, newHistoryItem] : [newHistoryItem];

    const updatedLog: FollowupLog = {
      id: existingLog?.id || `log-${Date.now()}`,
      studentName,
      grade,
      section,
      mentorName,
      sourceTab,
      currentStage,
      reasonBucket,
      scheduledDoubtDate: scheduledDoubtDate || undefined,
      scheduledDoubtTopic: scheduledDoubtTopic || undefined,
      notes,
      history: updatedHistory,
      updatedAt: timestamp,
    };

    onSaveLog(updatedLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Log Followup & Action Entry
            </span>
            <h3 className="text-base font-bold text-white">{studentName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Grade {grade}-{section} | Mentor: {mentorName} | Tab: {sourceTab}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Reason Bucket Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center">
              <Tag className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              Reason Bucket Selection (Mandatory Category):
            </label>
            <select
              value={reasonBucket}
              onChange={(e) => setReasonBucket(e.target.value as ReasonBucket)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {availableBuckets.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Current Stage */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              Followup Stage / Status:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stages.map((stg) => {
                const isActive = currentStage === stg;
                return (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => setCurrentStage(stg)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {stg}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Doubt Date & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                Schedule Doubt Date (Optional):
              </label>
              <input
                type="date"
                value={scheduledDoubtDate}
                onChange={(e) => setScheduledDoubtDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                Doubt Topic / Focus:
              </label>
              <input
                type="text"
                placeholder="e.g. Subjective Physics Chapter 2"
                value={scheduledDoubtTopic}
                onChange={(e) => setScheduledDoubtTopic(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Detailed Notes */}
          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-slate-800">Intervention Notes & Call Remarks:</label>
            <textarea
              rows={3}
              placeholder="Record call discussions, parent responses, and follow-up plans..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Stage History Timeline */}
          {existingLog && existingLog.history && existingLog.history.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs flex items-center">
                <History className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                Stage History Log ({existingLog.history.length} stages)
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {existingLog.history.map((item) => (
                  <div key={item.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                      <span>
                        Stage: <strong className="text-indigo-700">{item.stage}</strong> by {item.actionBy}
                      </span>
                      <span className="text-slate-400">{item.timestamp}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-1">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Stage & Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
