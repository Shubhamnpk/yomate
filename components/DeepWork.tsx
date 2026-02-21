
import React, { useState, useEffect, useRef } from 'react';
import { DayLog, Subject, FocusSession } from '../types';
import { saveLog, getAppSettings, getCustomSubjects } from '../services/storageService';
import { playNoise, stopNoise, playSuccessTink, playAscensionSound, NoiseType } from '../services/audioGen';
import { Play, Square, Smartphone, Check, Ban, Plus, Timer, Brain, Coffee, Volume2, ListTodo, X, Eye, EyeOff, Tag, Sparkles } from 'lucide-react';
import { haptic } from '../services/hapticService';
import { requestNotificationPermission, sendTimerNotification } from '../services/notificationService';
import { getMinutesDiff, getCurrentTime24 } from '../services/timeService';

interface Props {
  log: DayLog;
  refreshLog: () => void;
  initialTask?: string;
  scheduledEnd?: string | null;
}

type FocusMode = 'DEEP' | 'POMODORO';
type TimerState = 'IDLE' | 'RUNNING' | 'PAUSED';
type PomoPhase = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

const NOISE_THEMES: Record<NoiseType, { bg: string, accent: string, glow: string }> = {
  off: { bg: 'bg-black', accent: 'primary', glow: 'primary-900' },
  rain: { bg: 'bg-slate-950', accent: 'blue', glow: 'blue-900' },
  river: { bg: 'bg-cyan-950', accent: 'cyan', glow: 'cyan-900' },
  wind: { bg: 'bg-zinc-950', accent: 'zinc', glow: 'zinc-800' },
  ocean: { bg: 'bg-blue-950', accent: 'blue', glow: 'blue-800' },
  forest: { bg: 'bg-emerald-950', accent: 'emerald', glow: 'emerald-900' },
  campfire: { bg: 'bg-orange-950', accent: 'orange', glow: 'orange-900' },
};

const SUCCESS_TITLES = [
  "Session Ascended",
  "Intensity Achieved",
  "Momentum Mastered",
  "Flow State Locked",
  "Depth Conquered",
  "Peak Protocol Meta"
];

export const DeepWork: React.FC<Props> = React.memo(({ log, refreshLog, initialTask = '', scheduledEnd = null }) => {
  const [timerState, setTimerState] = useState<TimerState>('IDLE');
  const [focusMode, setFocusMode] = useState<FocusMode>('DEEP');

  // Timer settings
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [totalTime, setTotalTime] = useState(60 * 60);

  const [phoneState, setPhoneState] = useState<'unchecked' | 'safe' | 'danger'>('unchecked');
  const [sessionTask, setSessionTask] = useState(initialTask);

  // Advanced Features
  const [activeNoise, setActiveNoise] = useState<NoiseType>('off');
  const [subTasks, setSubTasks] = useState<string[]>([]);
  const [newSubTask, setNewSubTask] = useState('');

  // Subject Selection
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [successTitle, setSuccessTitle] = useState('');

  const [zenMode, setZenMode] = useState(false);
  const [showAbortModal, setShowAbortModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBrainDumpModal, setShowBrainDumpModal] = useState(false);
  const [quickNote, setQuickNote] = useState('');
  const [lastSessionMins, setLastSessionMins] = useState(0);

  // Pomodoro Specific
  const [pomoPhase, setPomoPhase] = useState<PomoPhase>('WORK');
  const [pomoCount, setPomoCount] = useState(0); // Completed work sessions

  const intervalRef = useRef<number | null>(null);
  const logRef = useRef(log);

  // Refs to avoid stale closures in setInterval callbacks
  const focusModeRef = useRef(focusMode);
  const pomoPhaseRef = useRef(pomoPhase);
  const pomoCountRef = useRef(pomoCount);
  const totalTimeRef = useRef(totalTime);
  const sessionTaskRef = useRef(sessionTask);
  const sessionStartRef = useRef<{ startedAt: string; startingViolations: number } | null>(null);

  // Load defaults
  useEffect(() => {
    const settings = getAppSettings();
    if (settings.defaultFocusMinutes) {
      setSelectedDuration(settings.defaultFocusMinutes);
    }
    setSubjects(getCustomSubjects());
  }, []);

  // Update session task if prop changes (e.g. navigation)
  useEffect(() => {
    if (timerState === 'IDLE') {
      if (initialTask) {
        setSessionTask(initialTask);
      }

      if (scheduledEnd) {
        const now = getCurrentTime24();
        const diff = getMinutesDiff(now, scheduledEnd);
        if (diff > 0) {
          setSelectedDuration(diff);
        }
      }
    }
  }, [initialTask, scheduledEnd, timerState]);

  useEffect(() => { logRef.current = log; }, [log]);
  useEffect(() => { focusModeRef.current = focusMode; }, [focusMode]);
  useEffect(() => { pomoPhaseRef.current = pomoPhase; }, [pomoPhase]);
  useEffect(() => { pomoCountRef.current = pomoCount; }, [pomoCount]);
  useEffect(() => { totalTimeRef.current = totalTime; }, [totalTime]);
  useEffect(() => { sessionTaskRef.current = sessionTask; }, [sessionTask]);

  useEffect(() => {
    // Request notification permission on mount
    requestNotificationPermission();

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      stopNoise(); // Stop audio on unmount
    };
  }, []);

  useEffect(() => {
    const handleFocusToggle = () => {
      if (phoneState === 'danger') return;
      if (timerState === 'RUNNING') {
        pauseSession();
        return;
      }
      if (timerState === 'PAUSED') {
        resumeSession();
        return;
      }
      if (phoneState === 'safe') {
        startSession();
      }
    };

    const handleEscape = () => {
      setShowAbortModal(false);
      setShowSuccessModal(false);
      setShowBrainDumpModal(false);
    };

    window.addEventListener('focus-toggle', handleFocusToggle);
    window.addEventListener('app-escape', handleEscape);
    return () => {
      window.removeEventListener('focus-toggle', handleFocusToggle);
      window.removeEventListener('app-escape', handleEscape);
    };
  }, [timerState, phoneState, activeNoise, selectedDuration, focusMode, pomoPhase, sessionTask]);

  // --- AUDIO & HELPERS ---
  const toggleNoise = () => {
    const modes: NoiseType[] = ['off', 'rain', 'river', 'wind', 'ocean', 'forest', 'campfire'];
    const nextIdx = (modes.indexOf(activeNoise) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setActiveNoise(nextMode);
    if (timerState === 'RUNNING') {
      playNoise(nextMode);
    }
  };


  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePhoneCheck = (location: 'desk' | 'room' | 'hand') => {
    if (location === 'hand') {
      haptic.error();
      setPhoneState('danger');
      const currentLog = logRef.current;
      const newLog = { ...currentLog, phoneViolations: currentLog.phoneViolations + 1 };
      saveLog(currentLog.date, newLog);
      refreshLog();
    } else {
      haptic.success();
      setPhoneState('safe');
    }
  };

  const addSubTask = () => {
    if (newSubTask.trim()) {
      setSubTasks([...subTasks, newSubTask.trim()]);
      setNewSubTask('');
    }
  };

  const removeSubTask = (idx: number) => {
    setSubTasks(subTasks.filter((_, i) => i !== idx));
  };

  const normalizeTask = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  const findMatchedSubject = (task: string, allSubjects: Subject[]) => {
    const cleanedTask = normalizeTask(task);
    if (!cleanedTask) return null;

    const exact = allSubjects.find(s => normalizeTask(s.name) === cleanedTask);
    if (exact) return exact;

    const loose = allSubjects.find(s => {
      const normalizedName = normalizeTask(s.name);
      return cleanedTask.includes(normalizedName) || normalizedName.includes(cleanedTask);
    });
    if (loose) return loose;

    if (cleanedTask.includes('coding')) {
      return allSubjects.find(s => s.category === 'Coding') || null;
    }
    if (cleanedTask.includes('read')) {
      return allSubjects.find(s => normalizeTask(s.name).includes('read')) || null;
    }

    return null;
  };

  const saveQuickNote = () => {
    if (!quickNote.trim()) return;
    const currentLog = logRef.current;
    const existing = currentLog.scratchpad || '';
    const hasHtml = /<\/?[a-z][\s\S]*>/i.test(existing);
    const safeNote = quickNote
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const newLog = {
      ...currentLog,
      scratchpad: hasHtml
        ? `${existing}<p>[DeepWork] ${safeNote}</p>`
        : (existing ? `${existing}\n- [DeepWork] ${quickNote}` : `- [DeepWork] ${quickNote}`)
    };
    saveLog(currentLog.date, newLog);
    refreshLog();
    setQuickNote('');
    setShowBrainDumpModal(false);
    haptic.success();
  };

  const startSession = () => {
    if (phoneState !== 'safe') return;

    let durationMinutes = selectedDuration;
    if (focusMode === 'POMODORO') {
      if (pomoPhase === 'WORK') durationMinutes = 25;
      else if (pomoPhase === 'SHORT_BREAK') durationMinutes = 5;
      else if (pomoPhase === 'LONG_BREAK') durationMinutes = 15;
    }

    const durationSec = durationMinutes * 60;
    if (!sessionStartRef.current) {
      sessionStartRef.current = {
        startedAt: new Date().toISOString(),
        startingViolations: logRef.current.phoneViolations || 0,
      };
    }
    setTotalTime(durationSec);
    setTimeLeft(durationSec);
    setTimerState('RUNNING');
    setZenMode(false); // Reset zen mode on start

    // Start Audio if selected
    if (activeNoise !== 'off') {
      playNoise(activeNoise);
    }

    haptic.success();
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseSession = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    stopNoise();
    setTimerState('PAUSED');
    haptic.light();
  };

  const resumeSession = () => {
    setTimerState('RUNNING');
    if (activeNoise !== 'off') {
      playNoise(activeNoise);
    }
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    haptic.light();
  };

  const skipPhase = () => {
    haptic.medium();
    finishTimer();
  };

  const switchPomoPhase = (newPhase: PomoPhase) => {
    haptic.medium();
    setPomoPhase(newPhase);
    let durationMinutes = 25;
    if (newPhase === 'SHORT_BREAK') durationMinutes = 5;
    else if (newPhase === 'LONG_BREAK') durationMinutes = 15;

    const durationSec = durationMinutes * 60;
    setTotalTime(durationSec);
    setTimeLeft(durationSec);
  };

  const finishTimer = () => {
    haptic.notification();
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    setTimerState('IDLE');
    setPhoneState('unchecked');
    stopNoise(); // Stop background noise

    playSuccessTink();

    // Celebratory Effects
    if (focusModeRef.current === 'DEEP' || (focusModeRef.current === 'POMODORO' && pomoPhaseRef.current === 'WORK')) {
      playAscensionSound();

      // @ts-ignore - External CDN import
      import('https://esm.sh/canvas-confetti').then(module => {
        const confetti = module.default;
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#ec4899']
        });
      });
    }

    // Send Browser Notification
    const currentFocusMode = focusModeRef.current;
    const currentPomoPhase = pomoPhaseRef.current;
    const currentPomoCount = pomoCountRef.current;
    const currentTotalTime = totalTimeRef.current;

    const successQuotes = [
      "Depth is the new IQ.",
      "Intensity is the prize.",
      "The zone is where you belong.",
      "Momentum is your ally."
    ];
    const randomQuote = successQuotes[Math.floor(Math.random() * successQuotes.length)];

    if (currentFocusMode === 'POMODORO') {
      if (currentPomoPhase === 'WORK') {
        sendTimerNotification('Yomate | Work Session Complete', `Time for a break! ${randomQuote}`, 'success');
      } else {
        sendTimerNotification('Yomate | Break Over', 'Time to get back into the zone!', 'info');
      }
    } else {
      sendTimerNotification('Yomate | Deep Work Complete', `Great session! ${randomQuote}`, 'success');
    }

    const minutesDone = Math.ceil(currentTotalTime / 60);
    const currentLog = logRef.current;

    // Handle Pomodoro Logic
    if (currentFocusMode === 'POMODORO') {
      if (currentPomoPhase === 'WORK') {
        const newCount = currentPomoCount + 1;
        setPomoCount(newCount);
        if (newCount % 4 === 0) {
          setPomoPhase('LONG_BREAK');
        } else {
          setPomoPhase('SHORT_BREAK');
        }
      } else {
        setPomoPhase('WORK');
      }
    }

    const isWorkPhase = currentPomoPhase === 'WORK';

    // Subject Tracking Logic
    const currentTask = sessionTaskRef.current;
    const allSubjects = getCustomSubjects();
    const matchedSubject = findMatchedSubject(currentTask, allSubjects);
    const updatedSubjectMinutes = { ...(currentLog.subjectMinutes || {}) };
    const slotIds = [currentLog.selectedSubjects.main1, currentLog.selectedSubjects.main2, currentLog.selectedSubjects.light].filter(Boolean) as string[];
    const existingAdditional = currentLog.additionalSubjects || [];
    let updatedAdditionalSubjects = existingAdditional;

    if (matchedSubject && isWorkPhase) {
      updatedSubjectMinutes[matchedSubject.id] = (updatedSubjectMinutes[matchedSubject.id] || 0) + minutesDone;
      if (!slotIds.includes(matchedSubject.id) && !existingAdditional.includes(matchedSubject.id)) {
        updatedAdditionalSubjects = [...existingAdditional, matchedSubject.id];
      }
    }

    const newLog = {
      ...currentLog,
      deepWorkMinutes: currentLog.deepWorkMinutes + (isWorkPhase ? minutesDone : 0),
      subjectMinutes: updatedSubjectMinutes,
      additionalSubjects: updatedAdditionalSubjects,
      schedule: currentLog.schedule.map(b => b.mode === 'Deep Work' ? { ...b, isCompleted: true } : b),
      focusSessions: (() => {
        const prev = currentLog.focusSessions || [];
        const startMeta = sessionStartRef.current;
        const startedAt = startMeta?.startedAt || new Date(Date.now() - currentTotalTime * 1000).toISOString();
        const currentViolations = currentLog.phoneViolations || 0;
        const baseViolations = startMeta?.startingViolations || 0;
        const session: FocusSession = {
          id: `session_${Date.now()}`,
          startAt: startedAt,
          endAt: new Date().toISOString(),
          durationMinutes: minutesDone,
          taskName: currentTask || 'General Focus',
          noiseType: activeNoise,
          mode: currentFocusMode,
          phoneViolationsDuringSession: Math.max(0, currentViolations - baseViolations),
        };
        return [...prev, session];
      })()
    };

    saveLog(currentLog.date, newLog);
    sessionStartRef.current = null;
    refreshLog();

    setLastSessionMins(minutesDone);
    setSuccessTitle(SUCCESS_TITLES[Math.floor(Math.random() * SUCCESS_TITLES.length)]);
    setShowSuccessModal(true);

    if (currentFocusMode === 'DEEP') {
      setSessionTask('');
      setSubTasks([]);
    }
  };

  const stopSession = () => {
    haptic.medium();
    setShowAbortModal(true);
  };

  const confirmAbort = () => {
    haptic.notification();
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    setTimerState('IDLE');
    stopNoise();
    sessionStartRef.current = null;
    setShowAbortModal(false);
  };

  const addTime = (minutes: number) => {
    setTimeLeft(prev => prev + (minutes * 60));
    setTotalTime(prev => prev + (minutes * 60));
  };

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const strokeDashoffset = circumference - (progress * circumference);

  // --- VIEWS ---

  if (phoneState === 'unchecked' && timerState === 'IDLE') {
    return (
      <div className="flex flex-col h-full px-6 py-10 animate-in zoom-in-95 duration-300 overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 rotate-3">
            <Smartphone className="text-zinc-500 dark:text-zinc-400" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">Device Check</h2>
          <p className="text-zinc-600 dark:text-zinc-500 mb-10 max-w-[280px] leading-relaxed">
            Distraction is the enemy of depth. Where is your phone?
          </p>

          <div className="space-y-3 w-full max-w-sm">
            <button onClick={() => handlePhoneCheck('room')} className="group w-full p-5 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 dark:hover:bg-emerald-950/10 rounded-2xl transition-all flex items-center justify-between">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-500">Another Room</span>
              <Check size={20} className="opacity-0 group-hover:opacity-100 text-emerald-500 transition-opacity" />
            </button>
            <button onClick={() => handlePhoneCheck('desk')} className="group w-full p-5 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/10 dark:hover:bg-blue-950/10 rounded-2xl transition-all flex items-center justify-between">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-blue-500">On Desk (Airplane)</span>
              <Check size={20} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
            </button>
            <button onClick={() => handlePhoneCheck('hand')} className="group w-full p-5 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50 hover:bg-rose-500/10 dark:hover:bg-rose-950/10 rounded-2xl transition-all flex items-center justify-between">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-rose-500">In My Hand</span>
              <Ban size={20} className="opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phoneState === 'danger') {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center bg-rose-100/60 dark:bg-red-950/20 p-6 animate-in shake">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <Ban size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-red-400 mb-3">Distraction Detected</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-xs leading-relaxed">
          You are negotiating with mediocrity. Put the device away and reclaim your focus.
        </p>
        <button
          onClick={() => setPhoneState('unchecked')}
          className="px-10 py-4 bg-zinc-900 dark:bg-zinc-900 rounded-full border border-zinc-700 text-white font-semibold hover:bg-zinc-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (timerState === 'IDLE') {
    return (
      <div className="flex flex-col h-full px-6 py-6 pb-24 overflow-y-auto animate-in fade-in duration-500">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
            <span className="text-emerald-500 text-xs font-mono tracking-widest uppercase">Environment Secure</span>
          </div>
          <h2 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">Initiate Focus</h2>
        </div>

        {/* Focus Mode */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setFocusMode('DEEP')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300
              ${focusMode === 'DEEP'
                ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/30'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <Brain size={24} />
            <span className="text-sm font-bold">Deep Work</span>
          </button>

          <button
            onClick={() => { setFocusMode('POMODORO'); setPomoPhase('WORK'); setPomoCount(0); }}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300
              ${focusMode === 'POMODORO'
                ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/30'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <Timer size={24} />
            <span className="text-sm font-bold">Pomodoro</span>
          </button>
        </div>


        {/* Main Intent */}
        <div className="mb-6">
          <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2 block flex items-center justify-between">
            Primary Intent
            <span className="text-[10px] text-zinc-600 font-normal normal-case">Select or Type</span>
          </label>

          {/* Quick Subject Select Chips */}
          {subjects.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 no-scrollbar">
              {subjects.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSessionTask(sub.name)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shrink-0
                    ${sessionTask === sub.name
                      ? 'bg-primary-500/20 border-primary-500 text-primary-300 shadow-[0_0_10px_rgb(var(--primary)/0.2)]'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              placeholder={focusMode === 'DEEP' ? "e.g. Master Redux" : "e.g. Clear Inbox"}
              className="w-full bg-white dark:bg-zinc-900/50 border-b-2 border-zinc-300 dark:border-zinc-800 py-3 pl-3 pr-10 text-xl text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white transition-colors placeholder-zinc-500 dark:placeholder-zinc-700"
              value={sessionTask}
              onChange={(e) => setSessionTask(e.target.value)}
            />
            {sessionTask && (
              <button
                onClick={() => setSessionTask('')}
                title="Clear Task"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tasks */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-2">
              <ListTodo size={12} /> Steps (Optional)
            </label>
            <span className="text-[10px] text-zinc-600">{subTasks.length} items</span>
          </div>

          <div className="space-y-2 mb-2">
            {subTasks.map((task, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800/50 animate-in slide-in-from-left-2">
                <span>{task}</span>
                <button title="Remove Subtask" onClick={() => removeSubTask(i)} className="text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white"><X size={14} /></button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={newSubTask}
              onChange={(e) => setNewSubTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSubTask()}
              placeholder="Add micro-task..."
              className="flex-1 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-zinc-500 dark:focus:border-zinc-600 outline-none"
            />
            <button title="Add Subtask" onClick={addSubTask} className="bg-zinc-900 dark:bg-zinc-800 p-2 rounded-lg text-white hover:bg-zinc-700"><Plus size={16} /></button>
          </div>
        </div>

        {/* Settings (Duration & Sound) */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Duration */}
          <div>
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2 block">
              {focusMode === 'POMODORO' ? 'Phase' : 'Time'}
            </label>
            {focusMode === 'POMODORO' ? (
              <select
                value={pomoPhase}
                title={pomoPhase === 'WORK' ? 'Focus Phase: 25 minutes of deep work' : pomoPhase === 'SHORT_BREAK' ? 'Short Break: 5 minutes of rest' : 'Long Break: 15 minutes of rest'}
                onChange={(e) => {
                  haptic.light();
                  setPomoPhase(e.target.value as PomoPhase);
                }}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:border-rose-500/50 outline-none appearance-none font-mono text-sm active-scale transition-all"
              >
                <option value="WORK">Work (25m)</option>
                <option value="SHORT_BREAK">Short Break (5m)</option>
                <option value="LONG_BREAK">Long Break (15m)</option>
              </select>
            ) : (
              <select
                value={selectedDuration}
                title={`Focus Duration: ${selectedDuration} minutes`}
                onChange={(e) => {
                  haptic.light();
                  setSelectedDuration(Number(e.target.value));
                }}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:border-primary-500/50 outline-none appearance-none font-mono text-sm active-scale transition-all"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
                <option value={90}>90 Minutes</option>
                <option value={120}>120 Minutes</option>
              </select>
            )}
          </div>

          {/* Soundscapes */}
          <div>
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2 block">Soundscape</label>
            <button
              onClick={() => { haptic.light(); toggleNoise(); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all active-scale shadow-sm ${activeNoise !== 'off' ? 'bg-primary-500/10 border-primary-500/30 text-primary-400' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
            >
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-0.5">Mode</span>
                <span className="capitalize font-medium">
                  {activeNoise === 'off' ? 'Silence' : activeNoise}
                </span>
              </div>
              <Volume2 size={16} className={activeNoise !== 'off' ? 'animate-pulse text-primary-400' : ''} />
            </button>
          </div>
        </div>

        <div className="mt-auto">
          {/* Pomodoro Session Tracker (Idle Bottom) */}
          {focusMode === 'POMODORO' && (
            <div className="flex justify-center gap-2 mb-6 animate-in fade-in zoom-in duration-700">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mr-2">Cycle</span>
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border transition-all duration-700
                    ${i <= pomoCount
                      ? 'bg-rose-500 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : 'bg-zinc-800 border-zinc-700'}`}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => {
              haptic.success();
              startSession();
            }}
            disabled={focusMode === 'DEEP' ? !sessionTask.trim() : (pomoPhase === 'WORK' ? !sessionTask.trim() : false)}
            className={`group w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold uppercase tracking-widest transition-all duration-300 shadow-xl active-scale
              ${(focusMode === 'DEEP' ? sessionTask.trim() : (pomoPhase === 'WORK' ? sessionTask.trim() : true))
                ? focusMode === 'DEEP' ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-primary-900/20' : pomoPhase === 'WORK' ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-900/20' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/20'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
            `}
          >
            <Play size={24} className={(focusMode === 'DEEP' ? sessionTask.trim() : (pomoPhase === 'WORK' ? sessionTask.trim() : true)) ? 'fill-current' : ''} />
            {focusMode === 'DEEP'
              ? 'Initiate Depth'
              : pomoPhase === 'WORK'
                ? 'Start Session'
                : 'Initiate Recovery'}
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIVE SESSION ---
  const theme = NOISE_THEMES[activeNoise] || NOISE_THEMES.off;

  return (
    <div className={`fixed inset-0 z-[100] ${theme.bg} flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-700 transition-colors duration-1000`}>

      {/* Zen Mode Toggle (Absolute Top Right) */}
      <button
        onClick={() => setZenMode(!zenMode)}
        className="absolute top-6 right-6 z-[200] text-zinc-600 hover:text-white transition-colors"
      >
        {zenMode ? <EyeOff size={24} /> : <Eye size={24} />}
      </button>

      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] blur-[70px] rounded-full pointer-events-none transition-opacity duration-1000
          ${activeNoise !== 'off' ? `bg-${theme.accent}-900` : focusMode === 'DEEP' ? 'bg-primary-900' : 'bg-rose-900'}
          ${zenMode ? 'opacity-5' : 'opacity-20'}
        `}
        style={{ willChange: 'opacity', transform: 'translate(-50%, -50%) translateZ(0)' }}
      >
      </div>

      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center h-full justify-center">

        {/* Header Information (Hidden in Zen Mode) */}
        <div className={`absolute top-12 w-full flex flex-col items-center transition-all duration-700 ${zenMode ? 'opacity-0 -translate-y-10' : 'opacity-100'}`}>
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4 backdrop-blur-md
            ${focusMode === 'DEEP'
              ? 'bg-primary-500/10 border-primary-500/20 text-primary-300'
              : pomoPhase === 'WORK'
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'}`}>
            {focusMode === 'DEEP' ? <Brain size={14} /> : pomoPhase === 'WORK' ? <Timer size={14} /> : <Coffee size={14} />}
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {focusMode === 'DEEP' ? 'Deep Work' : pomoPhase === 'WORK' ? `Pomodoro (${pomoCount + 1}/4)` : 'Break Time'}
            </span>
          </div>
          <h3 className="text-zinc-200 text-xl font-medium text-center line-clamp-2 max-w-[80%] mb-2">{pomoPhase === 'WORK' ? sessionTask : 'Time to Recharge'}</h3>
          {timerState === 'PAUSED' && (
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Paused</span>
          )}

          {/* Active Manual Phase Switcher (Timer Screen) */}
          {focusMode === 'POMODORO' && (
            <div className="flex bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-0.5 animate-in zoom-in-95 duration-700">
              <button
                onClick={() => switchPomoPhase('WORK')}
                className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-tight rounded-lg transition-all ${pomoPhase === 'WORK' ? 'bg-rose-500/80 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Work
              </button>
              <button
                onClick={() => switchPomoPhase('SHORT_BREAK')}
                className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-tight rounded-lg transition-all ${pomoPhase === 'SHORT_BREAK' ? 'bg-emerald-500/80 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Short
              </button>
              <button
                onClick={() => switchPomoPhase('LONG_BREAK')}
                className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-tight rounded-lg transition-all ${pomoPhase === 'LONG_BREAK' ? 'bg-emerald-500/80 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Long
              </button>
            </div>
          )}

          {/* Active Noise Indicator */}
          {activeNoise !== 'off' && (
            <div className="mt-2 flex items-center gap-1 text-zinc-500 text-xs">
              <Volume2 size={10} />
              <span className="uppercase">{activeNoise} Noise Active</span>
            </div>
          )}
        </div>

        {/* Timer Viz */}
        <div className="relative flex items-center justify-center pointer-events-none">
          <div className={`transition-opacity duration-700 ${zenMode ? 'opacity-30' : 'opacity-100'}`}>
            <svg
              className="transform -rotate-90 w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] drop-shadow-2xl"
              viewBox="0 0 320 320"
            >
              <circle cx="160" cy="160" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
              <circle
                cx="160" cy="160" r={radius}
                stroke={activeNoise !== 'off'
                  ? `var(--${theme.accent}-500, ${theme.accent === 'emerald' ? '#10b981' : theme.accent === 'blue' ? '#3b82f6' : theme.accent === 'orange' ? '#f97316' : theme.accent === 'cyan' ? '#06b6d4' : '#6366f1'})`
                  : focusMode === 'DEEP'
                    ? 'rgb(var(--primary))'
                    : pomoPhase === 'WORK'
                      ? '#e11d48'
                      : '#10b981'}
                strokeWidth="12" fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center">
            <span className="block text-6xl sm:text-8xl font-mono font-bold text-white tracking-tighter tabular-nums transition-all duration-500">
              {formatTime(timeLeft)}
            </span>
            <span className={`text-zinc-600 text-xs font-bold uppercase tracking-[0.2em] mt-2 transition-opacity duration-700 ${zenMode ? 'opacity-0' : 'opacity-100'}`}>Remaining</span>
          </div>
        </div>

        {/* Sub Tasks Viewer (Hidden in Zen Mode) */}
        {subTasks.length > 0 && !zenMode && (
          <div className="absolute bottom-40 w-full max-w-xs space-y-2 pointer-events-auto transition-all duration-500">
            <p className="text-xs text-zinc-600 font-bold uppercase text-center mb-2">Micro-Objectives</p>
            {subTasks.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-zinc-400 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
                {t}
              </div>
            ))}
          </div>
        )}

        {/* Controls (Hidden in Zen Mode) */}
        <div className={`absolute bottom-16 w-full px-4 flex items-center justify-around max-w-sm z-[200] transition-all duration-700 ${zenMode ? 'translate-y-20 opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <button
            onClick={stopSession}
            className="flex flex-col items-center gap-2 group cursor-pointer pointer-events-auto active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-white group-hover:border-red-500/50 group-hover:bg-red-950/20 flex items-center justify-center transition-all shadow-lg">
              <Square size={24} className="fill-current" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 group-hover:text-red-400">Abort</span>
          </button>

          {/* Sound Toggle In-Session */}
          <button
            onClick={toggleNoise}
            className="flex flex-col items-center gap-2 group cursor-pointer pointer-events-auto active:scale-95 transition-transform"
          >
            <div className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all shadow-lg ${activeNoise !== 'off' ? 'bg-primary-900/20 border-primary-500/50 text-primary-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600 group-hover:text-white'}`}>
              <Volume2 size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 group-hover:text-white">Sound</span>
          </button>

          <button
            onClick={() => { haptic.light(); setShowBrainDumpModal(true); }}
            className="flex flex-col items-center gap-2 group cursor-pointer pointer-events-auto active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-amber-400 group-hover:border-amber-500/50 flex items-center justify-center transition-all bg-white/5 shadow-lg">
              <Brain size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 group-hover:text-amber-400">Dump</span>
          </button>

          {focusMode === 'POMODORO' ? (
            <button
              onClick={skipPhase}
              className="flex flex-col items-center gap-2 group cursor-pointer pointer-events-auto active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-500 group-hover:text-emerald-400 group-hover:border-emerald-500/50 flex items-center justify-center transition-all shadow-lg">
                <Timer size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Skip</span>
            </button>
          ) : (
            <button
              onClick={() => addTime(5)}
              className="flex flex-col items-center gap-2 group cursor-pointer pointer-events-auto active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 group-hover:text-white group-hover:border-white group-hover:bg-white/10 flex items-center justify-center transition-all shadow-lg">
                <Plus size={28} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 group-hover:text-white">+5 min</span>
            </button>
          )}
        </div>

      </div>

      {/* Abort Confirmation Modal */}
      {showAbortModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAbortModal(false)}
          ></div>
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Ban size={32} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-white text-center mb-3">Abort Session?</h3>
            <p className="text-zinc-500 text-center mb-8 leading-relaxed">
              Your focus progress will be discarded. Are you sure you want to surrender?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowAbortModal(false)}
                className="py-4 rounded-xl bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={confirmAbort}
                className="py-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20"
              >
                Yes, Abort
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brain Dump Modal (Advanced Feature) */}
      {showBrainDumpModal && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowBrainDumpModal(false)}></div>
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-2 text-amber-500 mb-4">
              <Brain size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Momentary Distraction?</span>
            </div>
            <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
              Capture the thought now so you can return to intensity immediately.
            </p>
            <textarea
              autoFocus
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              placeholder="What just popped into your head?"
              className="w-full h-32 bg-black border border-zinc-800 rounded-xl p-4 text-white text-sm outline-none focus:border-amber-500/50 transition-colors resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowBrainDumpModal(false)}
                className="flex-1 py-3 text-zinc-500 text-sm font-semibold"
              >
                Discard
              </button>
              <button
                onClick={saveQuickNote}
                className="flex-[2] py-3 bg-amber-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-900/20"
              >
                Capture & Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 curve-bounce duration-500 text-center">
            <div className="w-24 h-24 bg-primary-500/10 rounded-full flex items-center justify-center mb-8 mx-auto relative overflow-hidden p-4">
              <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping"></div>
              <img src="/yomate.png" alt="success logo" className="w-full h-full object-cover relative z-10 drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
            </div>

            <h3 className="text-3xl font-display font-bold text-white mb-2 tracking-tight animate-in slide-in-from-top-4 duration-700">
              {focusMode === 'POMODORO' && pomoPhase !== 'WORK'
                ? 'Rest Protocol.'
                : successTitle || 'Session Complete'
              }
            </h3>
            <div className="flex justify-center gap-1 mb-6 animate-in fade-in duration-1000 delay-300">
              {[1, 2, 3, 4, 5].map(i => (
                <Sparkles key={i} size={14} className="text-amber-400 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
            <p className="text-zinc-400 mb-8 leading-relaxed max-w-[280px] mx-auto">
              {focusMode === 'POMODORO' && pomoPhase === 'SHORT_BREAK'
                ? "Session complete. Take 5 minutes to stretch and breathe. You're doing great."
                : focusMode === 'POMODORO' && pomoPhase === 'LONG_BREAK'
                  ? "Cycle complete! Take a long 15-minute rest. You've earned it."
                  : focusMode === 'POMODORO' && pomoPhase === 'WORK'
                    ? "Break's over. Time to dive back into the flow."
                    : `You've conquered ${lastSessionMins} minutes of deep intensity. Your momentum shifted in the right direction.`
              }
            </p>

            <div className="bg-zinc-800/50 rounded-2xl p-4 mb-8 flex items-center justify-around border border-zinc-800">
              <div className="text-center">
                <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1">Status</span>
                <span className="text-white font-mono font-bold">
                  {focusMode === 'POMODORO' && pomoPhase !== 'WORK' ? 'Recovering' : 'Complete'}
                </span>
              </div>
              <div className="w-px h-8 bg-zinc-700"></div>
              <div className="text-center">
                <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1">
                  {focusMode === 'POMODORO' ? 'Cycle' : 'Mastery'}
                </span>
                <span className="text-white font-bold">
                  {focusMode === 'POMODORO' ? `${pomoCount}/4` : (sessionTask || 'General')}
                </span>
              </div>
            </div>

            {focusMode === 'DEEP' && sessionTask && (
              <div className="mb-8">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase mb-2">
                  <span>Session Depth</span>
                  <span>+{lastSessionMins}m</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min((logRef.current.deepWorkMinutes / 120) * 100, 100)}%` }}></div>
                </div>
                <p className="text-[9px] text-zinc-600 mt-1">{logRef.current.deepWorkMinutes}m total today — Target: 120m</p>
              </div>
            )}

            <button
              onClick={() => setShowSuccessModal(false)}
              className={`w-full py-5 rounded-2xl text-white font-bold text-lg transition-all shadow-xl active-scale
                ${focusMode === 'POMODORO' && pomoPhase !== 'WORK'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
                  : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-primary-900/20'}
              `}
            >
              {focusMode === 'POMODORO'
                ? pomoPhase === 'WORK' ? 'Start Next Session' : 'Start Break'
                : 'Continue Journey'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
