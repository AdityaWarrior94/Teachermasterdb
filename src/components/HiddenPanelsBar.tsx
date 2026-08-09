import React from 'react';
import { Eye, EyeOff, RotateCcw, X } from 'lucide-react';
import { useDashboardLayout, WidgetMeta } from '../context/DashboardLayoutContext';

export const HiddenPanelsBar: React.FC = () => {
  const { hiddenWidgets, unhideWidget, restoreAllWidgets, toastMessage, setToastMessage } =
    useDashboardLayout();

  const hiddenList = Object.values(hiddenWidgets) as WidgetMeta[];

  return (
    <>
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center space-x-3 animate-slideUp">
          <Eye className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hidden Panels Sticky Restore Bar */}
      {hiddenList.length > 0 && (
        <div className="sticky top-16 z-20 mb-4 bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-2xl p-3 shadow-md text-amber-900 text-xs flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-extrabold uppercase tracking-wide text-amber-800">
              {hiddenList.length} Hidden Panel{hiddenList.length > 1 ? 's' : ''}:
            </span>
            <div className="flex flex-wrap gap-1.5 ml-1">
              {hiddenList.map((w) => (
                <button
                  key={w.id}
                  onClick={() => unhideWidget(w.id)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold border border-amber-300 transition-all cursor-pointer shadow-2xs"
                  title="Click to Unhide"
                >
                  <span>{w.title}</span>
                  <X className="w-3 h-3 text-amber-600 ml-0.5" />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={restoreAllWidgets}
            className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Restore All Hidden Panels
          </button>
        </div>
      )}
    </>
  );
};
