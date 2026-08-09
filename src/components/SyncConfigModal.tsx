import React, { useState, useEffect } from 'react';
import { X, Sheet, RefreshCw, Check, Link2, ExternalLink, Download, Copy, Database, Layers } from 'lucide-react';

interface SyncConfigModalProps {
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  lastSyncTime: string | null;
  onClose: () => void;
}

export const SyncConfigModal: React.FC<SyncConfigModalProps> = ({
  sheetUrl,
  setSheetUrl,
  onSync,
  isSyncing,
  lastSyncTime,
  onClose,
}) => {
  const [tempUrl, setTempUrl] = useState<string>(sheetUrl);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [subsheetInfo, setSubsheetInfo] = useState<Record<string, { count: number; csv: string }>>({});
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [isPushingWebhook, setIsPushingWebhook] = useState<boolean>(false);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);
  const [showScriptCode, setShowScriptCode] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/sheets/subsheets')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          if (json.subsheets) setSubsheetInfo(json.subsheets);
          if (json.webhookUrl) setWebhookUrl(json.webhookUrl);
        }
      })
      .catch((err) => console.error(err));
  }, [isSyncing]);

  const handlePushToWebhook = async () => {
    if (!webhookUrl.trim()) {
      alert('Please enter your Google Apps Script Web App URL first or deploy the script provided below.');
      return;
    }
    setIsPushingWebhook(true);
    setPushStatusMessage(null);
    try {
      const res = await fetch('/api/sheets/push-to-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setPushStatusMessage('✅ All subsheets (Tasks, Logs, Contacts, Responses) pushed directly into your Google Sheet!');
      } else {
        setPushStatusMessage(`❌ Error: ${data.error || 'Failed to push to Google Sheet.'}`);
      }
    } catch (err: any) {
      setPushStatusMessage(`❌ Connection error: ${err.message}`);
    } finally {
      setIsPushingWebhook(false);
    }
  };

  const appsScriptCodeSnippet = `// Google Apps Script code for 1-Click Direct Logging
// 1. In your Google Sheet, click "Extensions" > "Apps Script"
// 2. Clear any code and paste this script
// 3. Click "Deploy" > "New deployment" > Select type: "Web app"
// 4. Set "Who has access": "Anyone"
// 5. Click "Deploy", copy the Web App URL and paste it into this app!

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (data.subsheets) {
      for (var tabName in data.subsheets) {
        var sheet = ss.getSheetByName(tabName) || ss.insertSheet(tabName);
        var csvData = Utilities.parseCsv(data.subsheets[tabName].csv, '\\t'); // TSV parsing
        if (csvData && csvData.length > 0) {
          sheet.clearContents();
          sheet.getRange(1, 1, csvData.length, csvData[0].length).setValues(csvData);
        }
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", timestamp: new Date() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleSaveAndSync = () => {
    setSheetUrl(tempUrl);
    onSync();
  };

  const handleCopyCsv = (tabName: string) => {
    const data = subsheetInfo[tabName];
    if (data && data.csv) {
      navigator.clipboard.writeText(data.csv);
      setCopiedTab(tabName);
      setTimeout(() => setCopiedTab(null), 3000);
    }
  };

  const sheetTabsList = [
    { name: 'Attendance', label: 'Attendance Data', isNew: false },
    { name: 'Objective', label: 'Objective Test Scores', isNew: false },
    { name: 'Subjective', label: 'Subjective Test Scores', isNew: false },
    { name: 'Discontinuation', label: 'Discontinuation Records', isNew: false },
    { name: 'Weekly_Zero_Attendance_Calls', label: 'Weekly Zero Attendance Calls Subsheet', isNew: true },
    { name: 'Weekly_Discontinuation_Calls', label: 'Weekly Discontinuation Calls Subsheet', isNew: true },
    { name: 'Admin_Tasks', label: 'Admin Tasks & Tickets Subsheet', isNew: true },
    { name: 'Task_Logs', label: 'Mentor Followup Logs Subsheet', isNew: true },
    { name: 'Email_Dispatches', label: 'Dispatched Email Logs Subsheet', isNew: true },
    { name: 'Mentor_Contacts', label: 'Mentor Email Contacts Subsheet', isNew: true },
    { name: 'Mentor_Responses', label: 'Mentor Responses Extra Sheet', isNew: true },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col text-xs text-slate-700">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600/30 rounded-lg text-indigo-400">
              <Sheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Google Sheet Subsheet & Live Backend Sync</h3>
              <p className="text-[11px] text-slate-400">Synced to Google Sheet with dynamic subsheets for Tasks, Logs & Emails</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Sheet URL Input */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block text-xs">Connected Google Sheet URL:</label>
            <div className="relative">
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <Link2 className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Subsheets Manager Grid */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Active Google Sheet Subsheets (Tabs):
              </h4>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ⚡ 7 Subsheets Synchronized
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {sheetTabsList.map((tab) => {
                const info = subsheetInfo[tab.name];
                return (
                  <div
                    key={tab.name}
                    className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/50 transition-all"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Database className={`w-4 h-4 shrink-0 ${tab.isNew ? 'text-indigo-600' : 'text-slate-500'}`} />
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{tab.name}</span>
                          {tab.isNew && (
                            <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
                              NEW SUBSHEET
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{tab.label}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold">
                        {info ? `${info.count} entries` : 'Ready'}
                      </span>

                      {tab.isNew && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCopyCsv(tab.name)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-700 font-bold text-[11px] transition-all flex items-center space-x-1 cursor-pointer"
                            title="Copy formatted CSV data to paste directly in Google Sheet tab"
                          >
                            {copiedTab === tab.name ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-500" />
                                <span>Copy CSV</span>
                              </>
                            )}
                          </button>

                          <a
                            href={`/api/sheets/export-csv/${tab.name}`}
                            download={`${tab.name}.csv`}
                            className="p-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-700 transition-all cursor-pointer"
                            title={`Download ${tab.name}.csv file`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-indigo-50/80 p-3.5 rounded-xl border border-indigo-200/80 space-y-1 text-[11px]">
            <div className="flex justify-between items-center font-semibold text-indigo-950">
              <span>Sync Server Status:</span>
              <span className="font-mono text-indigo-900 font-bold">
                {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Live Connected'}
              </span>
            </div>
            <p className="text-indigo-800/90 leading-normal">
              New tasks, ticket updates, and dispatched email logs are dynamically backed up in backend subsheets. You can view or paste these formatted subsheets into your main Google Sheet.
            </p>
            <a
              href={tempUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-indigo-700 hover:text-indigo-900 font-bold pt-1 cursor-pointer"
            >
              Open Connected Google Sheet <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleSaveAndSync}
            disabled={isSyncing}
            className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Save & Refresh Subsheets'}
          </button>
        </div>
      </div>
    </div>
  );
};
