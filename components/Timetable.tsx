import React, { useEffect, useState, useRef, useMemo, startTransition } from 'react';
import { DayLog, ScheduleBlock, AppMode, DateSystem } from '../types';
import { updateScheduleStatus, updateScheduleBlock, splitBlockInSchedule, shiftScheduleForward, getAppSettings, getYesterdayLog, saveLog, getStreak, isBlockScheduledForDay } from '../services/storageService';
import { formatTo12h, isTimeInRange, getMinutesDiff } from '../services/timeService';
import { formatDateBySystem } from '../services/dateDisplay';
import { SubjectManager } from './SubjectManager';
import { EditBlockModal } from './EditBlockModal';
import { BlockActionModal } from './BlockActionModal';
import { SettingsView } from './SettingsView';
import { BrainDump } from './BrainDump';
import { getCustomSubjects } from '../services/storageService';
import { Settings, Pencil, CheckCircle2, Circle, Play, ChevronRight, MessageSquareQuote, X, Moon, Sunrise, Coffee, AlarmClock, StickyNote, Flag, AlertTriangle, Dumbbell, Zap, Flame } from 'lucide-react';
import { haptic } from '../services/hapticService';

interface Props {
  log: DayLog;
  refreshLog: () => void;
  refreshApp: () => void;
  onNavigateToFocus?: (taskName: string) => void;
  currentTime: string; // Lifted state
}

export const Timetable: React.FC<Props> = React.memo(({ log, refreshLog, refreshApp, currentTime }) => {
  const [showStrategy, setShowStrategy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBrainDump, setShowBrainDump] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [appMode, setAppMode] = useState<AppMode>('Normal');
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState('Student');
  const [rituals, setRituals] = useState<string[]>([]);
  const [dateSystem, setDateSystem] = useState<DateSystem>('ENGLISH');
  const [yesterdayInsight, setYesterdayInsight] = useState<string | null>(null);
  const [showInsight, setShowInsight] = useState(true);
  const [deadlineInfo, setDeadlineInfo] = useState<{ title: string, days: number } | null>(null);
  const [clickedBlock, setClickedBlock] = useState<ScheduleBlock | null>(null);
  const [allSubjects, setAllSubjects] = useState(getCustomSubjects());
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const dayOfWeek = useMemo(() => {
    const [y, m, d] = log.date.split('-').map(Number);
    return new Date(y, m - 1, d).getDay();
  }, [log.date]);
  const visibleSchedule = useMemo(
    () => log.schedule.filter(b => isBlockScheduledForDay(b, dayOfWeek, log.date)),
    [log.schedule, dayOfWeek, log.date]
  );

  // Refs for scrolling
  const activeBlockRef = useRef<HTMLDivElement | null>(null);

  // Detect Active Block ID
  useEffect(() => {
    const active = visibleSchedule.find(b => isTimeInRange(currentTime, b.startTime, b.endTime));
    if (active && active.id !== activeBlockId) {
      setActiveBlockId(active.id);
    } else if (!active && activeBlockId) {
      setActiveBlockId(null);
    }
  }, [currentTime, visibleSchedule, activeBlockId]);

  // STRICT AUTO-SCROLL to Center
  useEffect(() => {
    if (activeBlockId && activeBlockRef.current) {
      setTimeout(() => {
        activeBlockRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }, 300);
    }
  }, [activeBlockId, showSettings]);

  useEffect(() => {
    setAllSubjects(getCustomSubjects());
    const settings = getAppSettings();
    setAppMode(settings.appMode);
    setStreak(getStreak());
    setUserName(settings.userName || 'Student');
    setRituals(settings.rituals || []);
    setDateSystem(settings.dateSystem || 'ENGLISH');

    const yesterday = getYesterdayLog();
    if (yesterday && yesterday.reflection.fixForTomorrow) {
      setYesterdayInsight(yesterday.reflection.fixForTomorrow);
    }

    if (settings.deadlines && settings.deadlines.length > 0) {
      const now = new Date().getTime();
      const sorted = settings.deadlines
        .map(d => ({ ...d, diff: new Date(d.date).getTime() - now }))
        .filter(d => d.diff > -86400000) // Keep deadlines from today onwards
        .sort((a, b) => a.diff - b.diff);

      if (sorted.length > 0) {
        const closest = sorted[0];
        const days = Math.ceil(closest.diff / (1000 * 60 * 60 * 24));
        setDeadlineInfo({ title: closest.title, days });
      } else {
        setDeadlineInfo(null);
      }
    } else {
      setDeadlineInfo(null);
    }

  }, [showSettings]);

  useEffect(() => {
    const handleEscape = () => {
      setShowStrategy(false);
      setShowSettings(false);
      setShowBrainDump(false);
      setSelectedBlockId(null);
      setClickedBlock(null);
      setEditMode(false);
    };
    window.addEventListener('app-escape', handleEscape);
    return () => window.removeEventListener('app-escape', handleEscape);
  }, []);

  // --- NEXT BLOCK LOGIC (Sleep/Break Detection) ---
  const { nextBlock, isSleep, timeUntil } = useMemo(() => {
    if (activeBlockId) return { nextBlock: null, isSleep: false, timeUntil: '' };

    const sorted = [...visibleSchedule].sort((a, b) => a.startTime.localeCompare(b.startTime));
    if (sorted.length === 0) return { nextBlock: null, isSleep: false, timeUntil: '' };

    const nextIndex = sorted.findIndex(b => b.startTime > currentTime);

    let targetBlock: ScheduleBlock;
    let isTomorrow = false;

    if (nextIndex !== -1) {
      targetBlock = sorted[nextIndex];
      // If next block is the first one in the sorted list, we are in the early morning gap (Sleep Phase)
      if (nextIndex === 0) isTomorrow = false; // Actually it's today, but it's the wake up block
    } else {
      // No blocks left today, cycle to tomorrow's first block
      targetBlock = sorted[0];
      isTomorrow = true;
    }

    // Logic: If the target is the FIRST block of the schedule, it's Sleep Phase (Wake Up).
    // Otherwise it's just a break between blocks.
    const isSleepPhase = targetBlock.id === sorted[0].id;

    // Time Calc
    const [hT, mT] = targetBlock.startTime.split(':').map(Number);
    const [hN, mN] = currentTime.split(':').map(Number);
    let diffMins = (hT * 60 + mT) - (hN * 60 + mN);
    if (isTomorrow || diffMins < 0) diffMins += 24 * 60;

    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    const timeString = h > 0 ? `${h}h ${m}m` : `${m}m`;

    return { nextBlock: targetBlock, isSleep: isSleepPhase, timeUntil: timeString };

  }, [visibleSchedule, currentTime, activeBlockId]);


  const handleBlockClick = (block: ScheduleBlock) => {
    if (editMode) {
      setSelectedBlockId(block.id);
    } else {
      setClickedBlock(block);
    }
  };

  // Defer storage-heavy work until after the next paint to improve tap responsiveness (INP).
  const deferInteractionWork = (fn: () => void) => {
    window.requestAnimationFrame(() => {
      window.setTimeout(fn, 0);
    });
  };

  const handleBlockActionComplete = () => {
    if (clickedBlock) {
      const block = clickedBlock;
      setClickedBlock(null);
      deferInteractionWork(() => {
        updateScheduleStatus(block.id, !block.isCompleted);
        startTransition(() => refreshLog());
      });
    }
  };

  const handleBlockActionSplit = (newActivity: string, mode: 'Rest' | 'Study') => {
    if (clickedBlock) {
      const blockId = clickedBlock.id;
      setClickedBlock(null);
      deferInteractionWork(() => {
        splitBlockInSchedule(blockId, newActivity, mode);
        startTransition(() => refreshLog());
      });
    }
  };

  const handleBlockActionShift = () => {
    if (clickedBlock) {
      const blockId = clickedBlock.id;
      setClickedBlock(null);
      deferInteractionWork(() => {
        shiftScheduleForward(blockId);
        startTransition(() => refreshLog());
      });
    }
  };

  const handleBlockSave = (id: string, updates: Partial<ScheduleBlock>) => {
    deferInteractionWork(() => {
      updateScheduleBlock(id, updates);
      startTransition(() => refreshLog());
    });
  };

  const handleQuickFocus = (e: React.MouseEvent, activityName: string, scheduledEnd?: string) => {
    e.stopPropagation();
    const event = new CustomEvent('navigate-focus', { detail: { task: activityName, scheduledEnd } });
    window.dispatchEvent(event);
  };

  const toggleRitual = (ritual: string) => {
    const current = log.completedRituals || [];
    let updated;
    if (current.includes(ritual)) {
      updated = current.filter(r => r !== ritual);
    } else {
      updated = [...current, ritual];
    }
    const newLog = { ...log, completedRituals: updated };
    deferInteractionWork(() => {
      saveLog(log.date, newLog);
      startTransition(() => refreshLog());
    });
  };

  const getRealActivityName = (blockActivity: string) => {
    const isMain1 = blockActivity.includes('Main 1') || blockActivity.includes('Study Block 1');
    const isMain2 = blockActivity.includes('Main 2') || blockActivity.includes('Study Block 2');
    const isLight = blockActivity.includes('Light Study') || blockActivity.includes('Light Review');

    if (isMain1 && log.selectedSubjects.main1) {
      const sub = allSubjects.find(s => s.id === log.selectedSubjects.main1);
      return sub ? `Study: ${sub.name}` : blockActivity;
    }
    if (isMain2 && log.selectedSubjects.main2) {
      const sub = allSubjects.find(s => s.id === log.selectedSubjects.main2);
      return sub ? `Study: ${sub.name}` : blockActivity;
    }
    if (isLight && log.selectedSubjects.light) {
      const sub = allSubjects.find(s => s.id === log.selectedSubjects.light);
      return sub ? `Review: ${sub.name}` : blockActivity;
    }
    return blockActivity;
  };

  const getBlockProgress = (start: string, end: string) => {
    if (!currentTime) return 0;
    const totalMins = getMinutesDiff(start, end);
    const passedMins = getMinutesDiff(start, currentTime);
    const percent = (passedMins / totalMins) * 100;
    return Math.min(Math.max(percent, 0), 100);
  };

  const getTimeRemaining = (end: string) => {
    if (!currentTime) return 0;
    return getMinutesDiff(currentTime, end);
  };

  const activeFocusBlock = useMemo(() => {
    if (!activeBlockId) return null;
    return visibleSchedule.find(b => b.id === activeBlockId && (b.mode === 'Study' || b.mode === 'Deep Work')) || null;
  }, [activeBlockId, visibleSchedule]);

  return (
    <div className="p-5 pb-32 animate-in fade-in duration-500">
      {showSettings && (
        <SettingsView onClose={() => setShowSettings(false)} refreshApp={refreshApp} />
      )}

      {showBrainDump && (
        <BrainDump log={log} refreshLog={refreshLog} onClose={() => setShowBrainDump(false)} />
      )}

      {showStrategy && (
        <SubjectManager log={log} refreshLog={refreshLog} onClose={() => setShowStrategy(false)} />
      )}

      {selectedBlockId && (
        <EditBlockModal
          block={visibleSchedule.find(b => b.id === selectedBlockId)!}
          onSave={handleBlockSave}
          onClose={() => setSelectedBlockId(null)}
        />
      )}

      {clickedBlock && (
        <BlockActionModal
          block={clickedBlock}
          appMode={appMode}
          onComplete={handleBlockActionComplete}
          onSplit={handleBlockActionSplit}
          onShift={handleBlockActionShift}
          onClose={() => setClickedBlock(null)}
        />
      )}

      <header className="flex justify-between items-start mb-6 mt-4 relative">
        <div className="flex-1">
          {log.primaryObjective && (
            <div className="mb-1 animate-in fade-in slide-in-from-left duration-1000">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500/50 dark:text-zinc-400/30">Primary Objective</span>
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 italic truncate max-w-[250px]">
                {log.primaryObjective}
              </p>
            </div>
          )}
          <h1 className="text-3xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">
            Hi, {userName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-wide">
              {formatDateBySystem(new Date(), dateSystem, { weekday: 'short', month: 'long', day: 'numeric' })}
            </p>
            <span className="text-zinc-700 dark:text-zinc-600">•</span>
            <p className="text-primary-500 text-xs font-bold uppercase tracking-wide">{appMode} Mode</p>
          </div>
          <div className={`inline-flex mt-2 items-center gap-1.5 px-2.5 py-0.5 rounded-full animate-in zoom-in ${streak > 0 ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-zinc-200/70 dark:bg-zinc-800/70 border border-zinc-300 dark:border-zinc-700'}`}>
            <Flame size={12} className={streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-zinc-500 dark:text-zinc-400'} />
            <span className={`text-[10px] font-bold font-mono ${streak > 0 ? 'text-orange-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
              {streak} day{streak === 1 ? '' : 's'} streak
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Brain Dump Button */}
          <button
            onClick={() => { haptic.medium(); setShowBrainDump(true); }}
            className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 hover:text-amber-500 hover:border-amber-500/50 transition-colors shadow-sm relative group active-scale"
            title="Brain Dump"
          >
            <StickyNote size={20} />
            {log.scratchpad && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => { haptic.medium(); setShowSettings(true); }}
            title="Settings"
            className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm active-scale"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* MOMENTUM SHIFT WIDGET (Efficiency Progress) */}
      {log.timeEarned > 0 && (
        <div className="mb-6 animate-in zoom-in-95 duration-500">
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-primary-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">System Efficiency</span>
            </div>
            <span className="text-xs font-mono font-bold text-primary-500">+{log.timeEarned}m Earned</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 shadow-[0_0_10px_rgb(var(--primary))] transition-all duration-1000"
              style={{ width: `${Math.min((log.timeEarned / 120) * 100, 100)}%` }} // 120m is the max bar width
            ></div>
          </div>
        </div>
      )}

      {/* HORIZON WIDGET */}
      {deadlineInfo && (
        <div className={`mb-4 p-4 rounded-xl border flex items-center justify-between animate-in slide-in-from-top-4
          ${deadlineInfo.days <= 3
            ? 'bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
            : deadlineInfo.days <= 7
              ? 'bg-amber-500/10 border-amber-500/20'
              : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`
        }>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${deadlineInfo.days <= 3 ? 'bg-rose-500 text-white' : deadlineInfo.days <= 7 ? 'bg-amber-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
              {deadlineInfo.days <= 3 ? <AlertTriangle size={18} /> : <Flag size={18} />}
            </div>
            <div>
              <p className={`text-[10px] uppercase font-bold tracking-wider ${deadlineInfo.days <= 3 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-500'}`}>Target in Sight</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">{deadlineInfo.title}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`block text-2xl font-mono font-bold ${deadlineInfo.days <= 3 ? 'text-rose-600 dark:text-rose-400' : deadlineInfo.days <= 7 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-white'}`}>{deadlineInfo.days}</span>
            <span className="text-[10px] uppercase font-bold text-zinc-500">Days Left</span>
          </div>
        </div>
      )}

      {/* DAILY RITUALS WIDGET (New Feature) */}
      {rituals.length > 0 && (
        <div className="mb-6 overflow-x-auto no-scrollbar flex gap-2 pb-2">
          {rituals.map(ritual => {
            const isDone = (log.completedRituals || []).includes(ritual);
            return (
              <button
                key={ritual}
                onClick={() => {
                  haptic.light();
                  toggleRitual(ritual);
                }}
                className={`flex-shrink-0 px-5 py-3 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all active-scale
                        ${isDone
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/20'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}
              >
                {isDone && <CheckCircle2 size={12} className="inline mr-1" />}
                {ritual}
              </button>
            )
          })}
        </div>
      )}

      {activeFocusBlock && !activeFocusBlock.isCompleted && (
        <button
          onClick={(e) => handleQuickFocus(e, getRealActivityName(activeFocusBlock.activityName), activeFocusBlock.endTime)}
          className="w-full mb-6 p-4 rounded-2xl border border-primary-500/30 bg-gradient-to-r from-primary-500/15 to-white dark:to-primary-500/5 hover:from-primary-500/25 dark:hover:from-primary-500/30 hover:to-primary-500/10 transition-all shadow-lg shadow-primary-900/20 flex items-center justify-between"
        >
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary-600 dark:text-primary-300">Quick Start</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">Launch focus for {getRealActivityName(activeFocusBlock.activityName)}</p>
            <p className="text-[10px] text-zinc-600 dark:text-zinc-400">Ends at {formatTo12h(activeFocusBlock.endTime)}</p>
          </div>
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-200">
            <Play size={16} className="fill-current" />
            <ChevronRight size={14} />
          </div>
        </button>
      )}

      {/* --- SLEEP / GAP PHASE UI --- */}
      {!activeBlockId && nextBlock && (
        <div className={`mb-8 p-6 rounded-3xl border shadow-xl animate-in zoom-in-95 duration-500 relative overflow-hidden
          ${isSleep
            ? 'bg-gradient-to-br from-indigo-900 to-zinc-950 border-indigo-500/30 text-white'
            : 'bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/50 dark:to-zinc-950 border-emerald-500/30'}`
        }>
          {/* Animated Background */}
          {isSleep && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse-slow"></div>}

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-full ${isSleep ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'}`}>
                {isSleep ? <Moon size={24} /> : <Coffee size={24} />}
              </div>
              <div>
                <h2 className={`text-xl font-bold leading-none ${isSleep ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                  {isSleep ? 'Sleep Protocol' : 'Free Time'}
                </h2>
                <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${isSleep ? 'text-indigo-300' : 'text-emerald-600 dark:text-emerald-300'}`}>
                  {isSleep ? 'Rest & Recovery' : 'Break Active'}
                </p>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider mb-1">Up Next</p>
                <div className="flex items-center gap-2">
                  {isSleep ? <Sunrise size={18} className="text-amber-500" /> : <AlarmClock size={18} className="text-zinc-400 dark:text-zinc-300" />}
                  <span className={`text-lg font-medium truncate max-w-[150px] ${isSleep ? 'text-zinc-200' : 'text-zinc-900 dark:text-zinc-200'}`}>
                    {getRealActivityName(nextBlock.activityName)}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className={`block text-4xl font-mono font-bold tracking-tight ${isSleep ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>{timeUntil}</span>
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Until Start</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yesterday's Insight Widget (The Feedback Loop) */}
      {yesterdayInsight && showInsight && (
        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl relative animate-in slide-in-from-top-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-full text-amber-600 dark:text-amber-400">
              <MessageSquareQuote size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">Mission Constraint (From Yesterday)</p>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100 italic">"{yesterdayInsight}"</p>
            </div>
            <button title="Close Insight" onClick={() => setShowInsight(false)} className="text-amber-500/50 hover:text-amber-400">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => { haptic.light(); setShowStrategy(true); }}
          className="flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 py-4 rounded-2xl transition-all shadow-sm active-scale"
        >
          Subject Strategy
        </button>

        <button
          onClick={() => { haptic.medium(); setEditMode(!editMode); }}
          className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest border py-4 rounded-2xl transition-all duration-300 shadow-sm active-scale
              ${editMode
              ? 'bg-primary-500 border-primary-600 text-white shadow-lg shadow-primary-500/20'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50'}`}
        >
          <Pencil size={14} />
          {editMode ? 'Finish' : 'Edit Day'}
        </button>
      </div>

      <div className="relative border-l-2 border-zinc-200 dark:border-zinc-900 ml-3 space-y-6">
        {visibleSchedule.map((block) => {
          const active = block.id === activeBlockId;
          const activityName = getRealActivityName(block.activityName);
          const progress = active ? getBlockProgress(block.startTime, block.endTime) : 0;
          const minsLeft = active ? getTimeRemaining(block.endTime) : 0;

          const isFocusable = (block.mode === 'Study' || block.mode === 'Deep Work') && active;
          const isMinimizedCompleted = block.isCompleted && !editMode && !active;

          // If Sleep Phase, dim everything
          const isDimmed = !active && isSleep;

          return (
            <div
              key={block.id}
              className={`relative pl-8 group ${isDimmed ? 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-opacity' : ''}`}
              ref={active ? activeBlockRef : null}
            >
              <div
                className={`absolute -left-[9px] ${isMinimizedCompleted ? 'top-4' : 'top-6'} w-4 h-4 rounded-full border-4 transition-all duration-500 z-10
                ${active
                    ? 'bg-primary-500 border-white dark:border-zinc-950 shadow-[0_0_15px_rgb(var(--primary))] scale-110'
                    : block.isCompleted
                      ? 'bg-zinc-400 dark:bg-zinc-800 border-zinc-50 dark:border-zinc-950'
                      : 'bg-zinc-200 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800'}`}
              ></div>

              <div
                onClick={() => handleBlockClick(block)}
                className={`relative rounded-2xl border cursor-pointer transition-all duration-500 ease-out overflow-hidden group/card
                  ${editMode
                    ? 'border-primary-500/30 bg-primary-500/5 hover:bg-primary-500/10'
                    : active
                      ? 'bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border-primary-500/30 shadow-lg shadow-primary-900/10 scale-[1.02] ring-1 ring-primary-500/20'
                      : block.isCompleted
                        ? 'bg-zinc-100/70 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-900 opacity-75 scale-[0.98]'
                        : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/80'}
                `}
              >
                {active && !editMode && (
                  <div
                    className="absolute top-0 left-0 bottom-0 bg-primary-500/5 transition-all duration-1000 ease-linear pointer-events-none"
                    style={{ width: `${progress}%` }}
                  ></div>
                )}

                <div className={`relative ${isMinimizedCompleted ? 'p-3' : 'p-5'}`}>
                  {editMode && (
                    <div className="absolute top-3 right-3 text-primary-400 opacity-50 group-hover/card:opacity-100">
                      <Pencil size={14} />
                    </div>
                  )}

                  {isMinimizedCompleted ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-display font-medium text-sm text-zinc-500 dark:text-zinc-500 line-through truncate">
                          {activityName}
                        </h3>
                        <p className="font-mono text-[10px] text-zinc-500 mt-1">
                          {formatTo12h(block.startTime)} - {formatTo12h(block.endTime)}
                        </p>
                      </div>
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md transition-colors
                            ${block.mode === 'Deep Work' ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' :
                              block.mode === 'Study' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                block.mode === 'Human' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                                  'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                            {block.mode}
                          </span>
                          {active && (
                            <span className="text-[10px] font-mono text-primary-600 dark:text-primary-400 font-bold animate-pulse">
                              {minsLeft}m left
                            </span>
                          )}
                        </div>

                        <span className="font-mono text-xs text-zinc-500">
                          {formatTo12h(block.startTime)} - {formatTo12h(block.endTime)}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <h3 className={`font-display font-medium text-lg leading-snug transition-colors ${block.isCompleted && !editMode ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-900 dark:text-zinc-200'}`}>
                          {activityName}
                        </h3>

                        {!editMode && (
                          <div className={`mt-1 transition-all duration-500 ${block.isCompleted ? 'text-emerald-500 scale-110' : 'text-zinc-300 dark:text-zinc-800 group-hover/card:text-zinc-400 dark:group-hover/card:text-zinc-700'}`}>
                            {block.isCompleted ? <CheckCircle2 size={20} className="animate-in zoom-in spin-in-12 duration-300" /> : <Circle size={20} />}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {isFocusable && !block.isCompleted && !editMode && (
                    <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/50 flex animate-in slide-in-from-top-2">
                      <button
                        onClick={(e) => handleQuickFocus(e, activityName, block.endTime)}
                        className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-300 hover:text-black dark:hover:text-white transition-colors group/btn"
                      >
                        <div className="p-1 rounded-full bg-primary-500/20 group-hover/btn:bg-primary-500 text-primary-600 dark:text-primary-400 group-hover/btn:text-white transition-all">
                          <Play size={12} className="ml-0.5" />
                        </div>
                        Start Timer Now
                        <ChevronRight size={12} className="opacity-50 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

