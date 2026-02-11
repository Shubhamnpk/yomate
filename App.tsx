
import React, { useEffect, useState, useRef } from 'react';
import { initializeToday, getStoredLog, getAppSettings, resetApp, saveLog } from './services/storageService';
import { DayLog, ViewState, AppSettings } from './types';
import { getCurrentTime24 } from './services/timeService';
import { initializeAudio } from './services/audioGen';
import { haptic } from './services/hapticService';
import { Navigation } from './components/Navigation';
import { Timetable } from './components/Timetable';
import { DeepWork } from './components/DeepWork';
import { NightRoutine } from './components/NightRoutine';
import { StatsView } from './components/StatsView';
import { NotesView } from './components/NotesView';
import { Onboarding } from './components/Onboarding';
import { Moon, AlertTriangle, Terminal, X, RotateCcw, Move, Zap, Smartphone, CheckCircle2 } from 'lucide-react';

// Map of accent names to RGB values for Tailwind variable injection
const ACCENT_COLORS: Record<string, string> = {
  indigo: '99 102 241',  // #6366f1
  emerald: '16 185 129', // #10b981
  rose: '244 63 94',     // #f43f5e
  violet: '139 92 246',  // #8b5cf6
  orange: '249 115 22',  // #f97316
};

interface SleepHUDProps {
  currentTime: string;
}

const GlobalSleepHUD: React.FC<SleepHUDProps> = ({ currentTime }) => {
  const [status, setStatus] = useState<'HIDDEN' | 'WARNING' | 'DANGER'>('HIDDEN');
  const [timeDisplay, setTimeDisplay] = useState('');

  useEffect(() => {
    const checkTime = () => {
      const [h, m] = currentTime.split(':').map(Number);
      const minutes = h * 60 + m;

      // Logic:
      // Target: 00:30 (24.5h)
      // Warning: 22:30 (22.5h) to 00:30
      // Danger: 00:31 to 05:00

      const targetMins = 24.5 * 60; // 1470 mins
      const currentMinsAdjusted = h < 5 ? (h + 24) * 60 + m : minutes;

      if (currentMinsAdjusted >= 22 * 60 + 30 && currentMinsAdjusted <= targetMins) {
        setStatus('WARNING');
        const minsLeft = targetMins - currentMinsAdjusted;
        setTimeDisplay(`${minsLeft}m until Target`);
      } else if (currentMinsAdjusted > targetMins && currentMinsAdjusted < 29 * 60) {
        setStatus('DANGER');
        const minsOver = currentMinsAdjusted - targetMins;
        setTimeDisplay(`${minsOver}m Overdue`);
      } else {
        setStatus('HIDDEN');
      }
    };

    checkTime();
  }, [currentTime]);

  if (status === 'HIDDEN') return null;

  const isDanger = status === 'DANGER';

  return (
    <>
      {/* Visual Alarm for Danger Mode */}
      {isDanger && (
        <div className="fixed inset-0 z-[55] pointer-events-none border-[6px] border-rose-500/50 animate-pulse inset-shadow-lg">
          <div className="absolute inset-0 bg-rose-500/5"></div>
        </div>
      )}

      <div className={`fixed top-0 left-0 right-0 z-[60] flex justify-center pointer-events-none transition-all duration-500 ${isDanger ? 'translate-y-2' : 'translate-y-0'}`}>
        <div className={`mt-2 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 border pointer-events-auto animate-in slide-in-from-top duration-500
          ${isDanger
            ? 'bg-rose-950/90 border-rose-500 text-rose-200 animate-[shake_0.5s_ease-in-out_infinite]'
            : 'bg-amber-950/90 border-amber-500/50 text-amber-200'}`}>

          <div className={`p-1.5 rounded-full ${isDanger ? 'bg-rose-500/20' : 'bg-amber-500/20'}`}>
            {isDanger ? <AlertTriangle size={14} className="animate-pulse" /> : <Moon size={14} />}
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5">
              {isDanger ? 'CRITICAL SLEEP' : 'Prepare Sleep'}
            </span>
            <span className="text-xs font-mono font-bold leading-none">
              {timeDisplay}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

const DebugConsole: React.FC<{
  show: boolean;
  onClose: () => void;
  onOverrideTime: (t: string | null) => void;
  currentTime: string;
  isOverridden: boolean;
  onRefresh: () => void;
}> = ({ show, onClose, onOverrideTime, currentTime, isOverridden, onRefresh }) => {
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  if (!show) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Helper to inject stats
  const modifyLog = (updates: Partial<DayLog>) => {
    const today = new Date().toISOString().split('T')[0];
    const log = getStoredLog()[today] || initializeToday();
    saveLog(today, { ...log, ...updates });
    onRefresh();
  };

  return (
    <div
      className="fixed z-[100] w-72 bg-black/90 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden animate-in zoom-in-95"
      style={{ left: position.x, top: position.y }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="flex justify-between items-center p-3 border-b border-zinc-800 bg-zinc-900/50 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-emerald-500">
          <Terminal size={14} />
          <span className="text-[10px] font-mono font-bold uppercase">DevTools v5.2</span>
        </div>
        <div className="flex items-center gap-2">
          <Move size={12} className="text-zinc-600" />
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={14} /></button>
        </div>
      </div>

      <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
        {/* Time Travel */}
        <div>
          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-2 tracking-wider">Time Travel Control</label>
          <div className="flex gap-2 mb-2">
            <input
              type="time"
              className="bg-zinc-900 border border-zinc-700 rounded p-1.5 text-white text-xs font-mono flex-1 outline-none focus:border-emerald-500"
              onChange={(e) => onOverrideTime(e.target.value)}
              value={currentTime}
            />
            {isOverridden && (
              <button onClick={() => onOverrideTime(null)} className="p-1.5 bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded hover:bg-rose-500/30" title="Reset to Real Time">
                <RotateCcw size={14} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button onClick={() => onOverrideTime('08:00')} className="px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[9px] text-zinc-400 hover:text-white hover:border-zinc-600">🌅 8AM</button>
            <button onClick={() => onOverrideTime('17:00')} className="px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[9px] text-zinc-400 hover:text-white hover:border-zinc-600">🌇 5PM</button>
            <button onClick={() => onOverrideTime('00:35')} className="px-2 py-1.5 bg-rose-950/30 border border-rose-900/50 rounded text-[9px] text-rose-400 hover:text-rose-300">⚠️ LATE</button>
          </div>
        </div>

        {/* State Injection */}
        <div>
          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-2 tracking-wider">State Injection</label>
          <div className="space-y-2">
            <button
              onClick={() => modifyLog({ deepWorkMinutes: 65, schedule: getStoredLog()[new Date().toISOString().split('T')[0]].schedule.map(s => s.mode === 'Deep Work' ? { ...s, isCompleted: true } : s) })}
              className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-emerald-500/20"
            >
              <Zap size={12} /> Add 1hr Deep Work
            </button>
            <button
              onClick={() => modifyLog({ phoneViolations: 5 })}
              className="w-full py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-amber-500/20"
            >
              <Smartphone size={12} /> Add 5 Violations
            </button>
            <button
              onClick={() => modifyLog({ sleepTime: '23:30', callCompleted: true })}
              className="w-full py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-zinc-700"
            >
              <CheckCircle2 size={12} /> Complete Routine
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-2 border-t border-zinc-800">
          <button
            onClick={() => { if (confirm('Reset all data?')) resetApp(); }}
            className="w-full py-2 bg-rose-950/30 text-rose-500 border border-rose-900/50 rounded text-[10px] font-bold hover:bg-rose-900/50"
          >
            FACTORY RESET APP
          </button>
        </div>
      </div>
    </div>
  );
}

const VIEW_ORDER: ViewState[] = ['TIMETABLE', 'NOTES', 'FOCUS', 'STATS', 'NIGHT'];

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewState>('TIMETABLE');
  const [dayLog, setDayLog] = useState<DayLog | null>(null);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [initialFocusTask, setInitialFocusTask] = useState<string>('');

  // Swipe Navigation State
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  // Time State (Lifted for Debugging)
  const [realTime, setRealTime] = useState(getCurrentTime24());
  const [overrideTime, setOverrideTime] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const effectiveTime = overrideTime || realTime;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 70;
    const isRightSwipe = distance < -70;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = VIEW_ORDER.indexOf(currentView);
      let nextIndex = currentIndex;

      if (isLeftSwipe && currentIndex < VIEW_ORDER.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (isRightSwipe && currentIndex > 0) {
        nextIndex = currentIndex - 1;
      }

      if (nextIndex !== currentIndex) {
        haptic.light();
        setView(VIEW_ORDER[nextIndex]);
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  };

  useEffect(() => {
    // Clock Tick
    const interval = setInterval(() => {
      setRealTime(getCurrentTime24());
    }, 1000);

    // DevTools Shortcut (Ctrl + D)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Audio Context Unlock
  useEffect(() => {
    const unlockAudio = async () => {
      try {
        await initializeAudio();
        // Remove listeners once successful
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      } catch (e) {
        // Silently fail if not allowed yet
      }
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    // Apply Dark Mode Class logic based on setting
    if (settings.themeMode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [settings.themeMode]);

  const refreshLog = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const logs = getStoredLog();
    if (logs[todayStr]) {
      setDayLog(logs[todayStr]);
    } else {
      setDayLog(initializeToday());
    }
  };

  const refreshApp = () => {
    setSettings(getAppSettings());
  };

  useEffect(() => {
    setDayLog(initializeToday());
    setSettings(getAppSettings());

    // Listen for Quick Focus navigation
    const handleFocusNav = (e: any) => {
      const task = e.detail?.task;
      if (task) {
        setInitialFocusTask(task);
        setView('FOCUS');
      }
    };
    window.addEventListener('navigate-focus', handleFocusNav);
    return () => window.removeEventListener('navigate-focus', handleFocusNav);
  }, []);

  if (!dayLog) return <div className="h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-500">Loading Protocol...</div>;

  // Determine styles
  const themeBg = {
    zinc: 'bg-zinc-950',
    black: 'bg-black',
    light: 'bg-zinc-50'
  }[settings.themeMode] || 'bg-zinc-950';

  const primaryRgb = ACCENT_COLORS[settings.themeAccent] || ACCENT_COLORS['indigo'];

  return (
    <div
      className={`h-[100dvh] w-full ${themeBg} text-zinc-900 dark:text-zinc-200 font-sans selection:bg-primary-500/30 overflow-hidden flex flex-col relative transition-colors duration-500`}
      style={{ '--primary': primaryRgb } as React.CSSProperties}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {!settings.onboarded ? (
        <Onboarding onComplete={refreshApp} settings={settings} />
      ) : (
        <>
          <GlobalSleepHUD currentTime={effectiveTime} />

          <DebugConsole
            show={showDebug}
            onClose={() => setShowDebug(false)}
            onOverrideTime={setOverrideTime}
            currentTime={effectiveTime}
            isOverridden={!!overrideTime}
            onRefresh={refreshLog}
          />

          <div className={`w-full max-w-md mx-auto h-full flex flex-col relative ${themeBg} shadow-2xl`}>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto scroll-smooth pb-safe no-scrollbar">
              {currentView === 'TIMETABLE' && (
                <Timetable
                  log={dayLog}
                  refreshLog={refreshLog}
                  refreshApp={refreshApp}
                  currentTime={effectiveTime} // Pass down time
                />
              )}
              {currentView === 'NOTES' && <NotesView log={dayLog} refreshLog={refreshLog} />}
              {currentView === 'FOCUS' && <DeepWork log={dayLog} refreshLog={refreshLog} initialTask={initialFocusTask} />}
              {currentView === 'STATS' && <StatsView />}
              {currentView === 'NIGHT' && <NightRoutine log={dayLog} refreshLog={refreshLog} />}
            </main>

            {/* Navigation */}
            <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none flex justify-center pb-6">
              <Navigation currentView={currentView} setView={setView} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
