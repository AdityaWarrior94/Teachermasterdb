import React, { createContext, useContext, useState, useEffect } from 'react';

export type WidgetSize = 'compact' | 'normal' | 'expanded';

export interface WidgetMeta {
  id: string;
  title: string;
  tabId?: string;
}

interface DashboardLayoutContextType {
  hiddenWidgets: Record<string, WidgetMeta>;
  minimizedWidgets: Set<string>;
  widgetSizes: Record<string, WidgetSize>;
  fullScreenWidgetId: string | null;
  refreshingWidgets: Set<string>;
  registerWidget: (id: string, title: string, tabId?: string) => void;
  hideWidget: (id: string, title?: string, tabId?: string) => void;
  unhideWidget: (id: string) => void;
  restoreAllWidgets: () => void;
  toggleMinimizeWidget: (id: string) => void;
  setWidgetSize: (id: string, size: WidgetSize) => void;
  enterFullScreen: (id: string) => void;
  exitFullScreen: () => void;
  triggerRefreshWidget: (id: string, callback?: () => void) => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}

const DashboardLayoutContext = createContext<DashboardLayoutContextType | undefined>(undefined);

export const DashboardLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hiddenWidgets, setHiddenWidgets] = useState<Record<string, WidgetMeta>>({});
  const [minimizedWidgets, setMinimizedWidgets] = useState<Set<string>>(new Set());
  const [widgetSizes, setWidgetSizes] = useState<Record<string, WidgetSize>>({});
  const [fullScreenWidgetId, setFullScreenWidgetId] = useState<string | null>(null);
  const [refreshingWidgets, setRefreshingWidgets] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keyboard shortcut ESC to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullScreenWidgetId) {
        setFullScreenWidgetId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullScreenWidgetId]);

  // Lock body scroll when full screen widget is open
  useEffect(() => {
    if (fullScreenWidgetId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [fullScreenWidgetId]);

  const registerWidget = (id: string, title: string, tabId?: string) => {
    // Registers widget metadata for restore UI
  };

  const hideWidget = (id: string, title: string = 'Widget', tabId?: string) => {
    setHiddenWidgets((prev) => ({
      ...prev,
      [id]: { id, title, tabId },
    }));
    showToast(`"${title}" hidden. You can unhide it anytime from the top bar.`);
  };

  const unhideWidget = (id: string) => {
    setHiddenWidgets((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    showToast(`Widget restored to dashboard.`);
  };

  const restoreAllWidgets = () => {
    setHiddenWidgets({});
    setMinimizedWidgets(new Set());
    showToast(`All dashboard widgets restored.`);
  };

  const toggleMinimizeWidget = (id: string) => {
    setMinimizedWidgets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const setWidgetSize = (id: string, size: WidgetSize) => {
    setWidgetSizes((prev) => ({ ...prev, [id]: size }));
  };

  const enterFullScreen = (id: string) => {
    setFullScreenWidgetId(id);
  };

  const exitFullScreen = () => {
    setFullScreenWidgetId(null);
  };

  const triggerRefreshWidget = (id: string, callback?: () => void) => {
    setRefreshingWidgets((prev) => new Set(prev).add(id));
    if (callback) callback();
    setTimeout(() => {
      setRefreshingWidgets((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      showToast(`Widget refreshed successfully.`);
    }, 600);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <DashboardLayoutContext.Provider
      value={{
        hiddenWidgets,
        minimizedWidgets,
        widgetSizes,
        fullScreenWidgetId,
        refreshingWidgets,
        registerWidget,
        hideWidget,
        unhideWidget,
        restoreAllWidgets,
        toggleMinimizeWidget,
        setWidgetSize,
        enterFullScreen,
        exitFullScreen,
        triggerRefreshWidget,
        toastMessage,
        setToastMessage,
      }}
    >
      {children}
    </DashboardLayoutContext.Provider>
  );
};

export const useDashboardLayout = () => {
  const context = useContext(DashboardLayoutContext);
  if (!context) {
    throw new Error('useDashboardLayout must be used within a DashboardLayoutProvider');
  }
  return context;
};
