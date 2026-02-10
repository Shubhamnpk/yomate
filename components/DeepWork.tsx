
import React, { useState, useEffect, useRef } from 'react';
import { DayLog, Subject } from '../types';
import { saveLog, getAppSettings, getCustomSubjects } from '../services/storageService';
import { playNoise, stopNoise, NoiseType } from '../services/audioGen';
import { Play, Square, Smartphone, Check, Ban, Plus, Timer, Brain, Coffee, Volume2, ListTodo, X, Eye, EyeOff, Tag } from 'lucide-react';

interface Props {
  log: DayLog;
  refreshLog: () => void;
  initialTask?: string; // New prop
}

type FocusMode = 'DEEP' | 'POMODORO';
type TimerState = 'IDLE' | 'RUNNING';

export const DeepWork: React.FC<Props> = ({ log, refreshLog, initialTask = '' }) => {
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

  // New: Zen Mode
  const [zenMode, setZenMode] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const logRef = useRef(log);

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
    if (initialTask && timerState === 'IDLE') {
      setSessionTask(initialTask);
    }
  }, [initialTask]);

  useEffect(() => {
    logRef.current = log;
  }, [log]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      stopNoise(); // Stop audio on unmount
    };
  }, []);

  // --- AUDIO & HELPERS ---
  const toggleNoise = () => {
    const modes: NoiseType[] = ['off', 'brown', 'pink', 'white'];
    const nextIdx = (modes.indexOf(activeNoise) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setActiveNoise(nextMode);
    if (timerState === 'RUNNING') {
      playNoise(nextMode);
    }
  };

  const playCompleteSound = () => {
    const settings = getAppSettings();
    if (!settings.enableSounds) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePhoneCheck = (location: 'desk' | 'room' | 'hand') => {
    if (location === 'hand') {
      setPhoneState('danger');
      const currentLog = logRef.current;
      const newLog = { ...currentLog, phoneViolations: currentLog.phoneViolations + 1 };
      saveLog(currentLog.date, newLog);
      refreshLog();
    } else {
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

  const startSession = () => {
    if (phoneState !== 'safe') return;
    
    let durationMinutes = selectedDuration;
    if (focusMode === 'POMODORO') durationMinutes = 25;

    const durationSec = durationMinutes * 60;
    setTotalTime(durationSec);
    setTimeLeft(durationSec);
    setTimerState('RUNNING');
    setZenMode(false); // Reset zen mode on start
    
    // Start Audio if selected
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
  };

  const finishTimer = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    setTimerState('IDLE');
    setPhoneState('unchecked');
    stopNoise(); // Stop background noise
    
    playCompleteSound();

    const minutesDone = Math.ceil(totalTime / 60);
    const currentLog = logRef.current;
    
    const newLog = { 
      ...currentLog, 
      deepWorkMinutes: currentLog.deepWorkMinutes + minutesDone,
      schedule: currentLog.schedule.map(b => b.mode === 'Deep Work' ? {...b, isCompleted: true} : b)
    };
    
    saveLog(currentLog.date, newLog);
    refreshLog();
    
    if (focusMode === 'POMODORO') {
      alert("Pomodoro Complete! Take a 5 minute break.");
    } else {
      alert(`Deep Work Session Complete. +${minutesDone} minutes logged.`);
    }
    setSessionTask('');
    setSubTasks([]);
  };

  const stopSession = () => {
    if (window.confirm("Abort session? Focus progress will be discarded.")) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      setTimerState('IDLE');
      stopNoise();
    }
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
          <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 shadow-2xl border border-zinc-800 rotate-3">
            <Smartphone className="text-zinc-400" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Device Check</h2>
          <p className="text-zinc-500 mb-10 max-w-[280px] leading-relaxed">
            Distraction is the enemy of depth. Where is your phone?
          </p>
          
          <div className="space-y-3 w-full max-w-sm">
            <button onClick={() => handlePhoneCheck('room')} className="group w-full p-5 bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-950/10 rounded-2xl transition-all flex items-center justify-between">
              <span className="font-semibold text-zinc-300 group-hover:text-emerald-400">Another Room</span>
              <Check size={20} className="opacity-0 group-hover:opacity-100 text-emerald-500 transition-opacity"/>
            </button>
            <button onClick={() => handlePhoneCheck('desk')} className="group w-full p-5 bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 hover:bg-blue-950/10 rounded-2xl transition-all flex items-center justify-between">
              <span className="font-semibold text-zinc-300 group-hover:text-blue-400">On Desk (Airplane)</span>
              <Check size={20} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity"/>
            </button>
            <button onClick={() => handlePhoneCheck('hand')} className="group w-full p-5 bg-zinc-900/50 border border-zinc-800 hover:border-rose-500/50 hover:bg-rose-950/10 rounded-2xl transition-all flex items-center justify-between">
              <span className="font-semibold text-zinc-300 group-hover:text-rose-400">In My Hand</span>
              <Ban size={20} className="opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity"/>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phoneState === 'danger') {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center bg-red-950/20 p-6 animate-in shake">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <Ban size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-red-400 mb-3">Distraction Detected</h2>
        <p className="text-zinc-400 mb-8 max-w-xs leading-relaxed">
          You are negotiating with mediocrity. Put the device away and reclaim your focus.
        </p>
        <button 
          onClick={() => setPhoneState('unchecked')} 
          className="px-10 py-4 bg-zinc-900 rounded-full border border-zinc-700 text-white font-semibold hover:bg-zinc-800 transition-colors"
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
           <h2 className="text-4xl font-bold text-white tracking-tight">Initiate Focus</h2>
        </div>

        {/* Focus Mode */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            onClick={() => setFocusMode('DEEP')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300
              ${focusMode === 'DEEP' 
                ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/30' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
          >
            <Brain size={24} />
            <span className="text-sm font-bold">Deep Work</span>
          </button>
          
          <button 
            onClick={() => setFocusMode('POMODORO')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300
              ${focusMode === 'POMODORO' 
                ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/30' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
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
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'}`}
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
              className="w-full bg-zinc-900/50 border-b-2 border-zinc-800 py-3 pl-3 pr-10 text-xl text-white outline-none focus:border-white transition-colors placeholder-zinc-700"
              value={sessionTask}
              onChange={(e) => setSessionTask(e.target.value)}
            />
            {sessionTask && (
              <button 
                onClick={() => setSessionTask('')}
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
               <div key={i} className="flex justify-between items-center p-2 bg-zinc-900 rounded-lg text-sm text-zinc-300 border border-zinc-800/50 animate-in slide-in-from-left-2">
                 <span>{task}</span>
                 <button onClick={() => removeSubTask(i)} className="text-zinc-600 hover:text-white"><X size={14} /></button>
               </div>
             ))}
           </div>
           
           <div className="flex gap-2">
             <input 
              value={newSubTask}
              onChange={(e) => setNewSubTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSubTask()}
              placeholder="Add micro-task..."
              className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-zinc-600 outline-none"
             />
             <button onClick={addSubTask} className="bg-zinc-800 p-2 rounded-lg text-white hover:bg-zinc-700"><Plus size={16}/></button>
           </div>
        </div>

        {/* Settings (Duration & Sound) */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Duration */}
            <div>
               <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2 block">Time</label>
               {focusMode === 'POMODORO' ? (
                 <div className="py-3 px-4 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400 font-mono">25 Min</div>
               ) : (
                 <select 
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(Number(e.target.value))}
                  className="w-full bg-zinc-900 text-white p-3 rounded-lg border border-zinc-800 outline-none appearance-none font-mono text-sm"
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
                onClick={toggleNoise}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${activeNoise !== 'off' ? 'bg-primary-500/10 border-primary-500/30 text-primary-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
               >
                 <span className="capitalize">{activeNoise === 'off' ? 'Silence' : activeNoise}</span>
                 <Volume2 size={14} className={activeNoise !== 'off' ? 'animate-pulse' : ''} />
               </button>
            </div>
        </div>

        <div className="mt-auto">
          <button 
            onClick={startSession}
            disabled={!sessionTask.trim()}
            className={`group w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold tracking-wide transition-all duration-300 shadow-xl
              ${sessionTask.trim() 
                ? focusMode === 'DEEP' ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-primary-900/20' : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-900/20'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
            `}
          >
            <Play size={24} className={sessionTask.trim() ? 'fill-current' : ''} />
            {focusMode === 'DEEP' ? 'ENTER DEEP WORK' : 'START POMODORO'}
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIVE SESSION ---
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-700">
      
      {/* Zen Mode Toggle (Absolute Top Right) */}
      <button 
        onClick={() => setZenMode(!zenMode)} 
        className="absolute top-6 right-6 z-[200] text-zinc-600 hover:text-white transition-colors"
      >
        {zenMode ? <EyeOff size={24} /> : <Eye size={24} />}
      </button>

      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] blur-[120px] rounded-full pointer-events-none opacity-20 transition-all duration-1000
        ${focusMode === 'DEEP' ? 'bg-primary-900' : 'bg-rose-900'}
        ${zenMode ? 'opacity-5 scale-90' : 'opacity-20'}
      `}>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center h-full justify-center">
        
        {/* Header Information (Hidden in Zen Mode) */}
        <div className={`absolute top-12 w-full flex flex-col items-center transition-all duration-700 ${zenMode ? 'opacity-0 -translate-y-10' : 'opacity-100'}`}>
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4 backdrop-blur-md
            ${focusMode === 'DEEP' 
              ? 'bg-primary-500/10 border-primary-500/20 text-primary-300' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
            {focusMode === 'DEEP' ? <Brain size={14} /> : <Timer size={14} />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{focusMode === 'DEEP' ? 'Deep Work' : 'Pomodoro'}</span>
          </div>
          <h3 className="text-zinc-200 text-xl font-medium text-center line-clamp-2 max-w-[80%]">{sessionTask}</h3>
          
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
          <div className={`animate-[pulse-slow_4s_ease-in-out_infinite] scale-90 sm:scale-100 transition-opacity duration-700 ${zenMode ? 'opacity-30' : 'opacity-100'}`}>
            <svg 
              className="transform -rotate-90 w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] drop-shadow-2xl"
              viewBox="0 0 320 320"
            >
              <circle cx="160" cy="160" r={radius} stroke="#1f1f22" strokeWidth="12" fill="transparent" />
              <circle
                cx="160" cy="160" r={radius}
                stroke={focusMode === 'DEEP' ? 'rgb(var(--primary))' : '#e11d48'}
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
        <div className={`absolute bottom-16 w-full px-10 flex items-center max-w-xs sm:max-w-sm z-[200] transition-all duration-700 ${focusMode === 'POMODORO' ? 'justify-center' : 'justify-between'} ${zenMode ? 'translate-y-20 opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
             <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${activeNoise !== 'off' ? 'bg-primary-900/20 border-primary-500/50 text-primary-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                <Volume2 size={20} />
             </div>
          </button>

          {focusMode === 'DEEP' && (
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
    </div>
  );
};
