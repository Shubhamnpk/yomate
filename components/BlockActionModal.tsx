
import React, { useState, useEffect } from 'react';
import { ScheduleBlock, AppMode } from '../types';
import { getCurrentTime24, getMinutesDiff } from '../services/timeService';
import { getScheduleTemplate } from '../services/storageService';
import { CheckCircle2, Clock, FastForward, Coffee, BookOpen, X, Moon, Sunrise } from 'lucide-react';
import { Model } from './ui/model';

import { haptic } from '../services/hapticService';

interface Props {
  block: ScheduleBlock;
  appMode: AppMode;
  onComplete: () => void; // Standard completion
  onSplit: (newActivity: string, mode: 'Rest' | 'Study') => void; // Insert break or review
  onShift: () => void; // Shift everything forward
  onClose: () => void;
}

export const BlockActionModal: React.FC<Props> = ({ block, appMode, onComplete, onSplit, onShift, onClose }) => {
  const [minutesSaved, setMinutesSaved] = useState(0);

  useEffect(() => {
    const now = getCurrentTime24();
    if (now < block.endTime && now > block.startTime) {
      setMinutesSaved(getMinutesDiff(now, block.endTime));
    }
  }, [block]);

  // SLEEP DETECTION LOGIC
  const isSleepBlock = block.activityName.toLowerCase().includes('sleep') || (block.mode === 'Rest' && block.startTime >= '22:00');

  if (isSleepBlock && !block.isCompleted) {
    const now = getCurrentTime24();
    const [h, m] = now.split(':').map(Number);

    // Dynamic Wake Up: Find first block of template
    const template = getScheduleTemplate();
    const firstBlock = template.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
    const wakeUpTime = firstBlock?.startTime || '07:00';
    const [wakeH, wakeM] = wakeUpTime.split(':').map(Number);

    // Calculate wake up hour (approximate for display)
    const wakeUpHour = wakeH + (wakeM / 60);

    let sleepHours = 0;

    // Logic to calculate hours until wake up
    if (h < wakeUpHour) {
      sleepHours = wakeUpHour - h - (m / 60);
    } else {
      sleepHours = (24 - h) + wakeUpHour - (m / 60);
    }

    // Cap just in case logic goes weird during day
    if (sleepHours > 12) sleepHours = 8;

    const formattedHours = Math.floor(sleepHours);
    const formattedMins = Math.round((sleepHours - formattedHours) * 60);

    return (
      <Model
        onClose={onClose}
        zIndexClass="z-[60]"
        layout="bottom"
        showMobileHandle
        contentClassName="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 sm:rounded-2xl p-6 sm:pb-6 pb-12 relative overflow-hidden animate-slide-up sm:animate-in sm:zoom-in-95"
      >

          {/* Background Decoration */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <button onClick={() => { haptic.light(); onClose(); }} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hidden sm:block"><X size={20} /></button>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mb-4">
              <Moon size={24} />
            </div>

            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 font-display">Heading to bed?</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
              If you sleep now, you will get approximately:
            </p>

            <div className="flex items-center gap-4 mb-8 bg-zinc-100 dark:bg-zinc-950/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/50">
              <div className="flex-1">
                <span className="block text-3xl font-mono font-bold text-zinc-900 dark:text-white">{formattedHours}<span className="text-sm text-zinc-500 ml-1">h</span> {formattedMins}<span className="text-sm text-zinc-500 ml-1">m</span></span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold">Rest Duration</span>
              </div>
              <div className="w-px h-8 bg-zinc-300 dark:bg-zinc-800"></div>
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-1 text-zinc-500 dark:text-zinc-400 mb-1">
                  <Sunrise size={14} />
                  <span className="text-xs font-bold">{wakeUpTime}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold">Wake Up</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { haptic.light(); onClose(); }} className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium active:opacity-70 active:scale-[0.98] transition-all">Not yet</button>
              <button
                onClick={() => { haptic.success(); onComplete(); }}
                className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-bold active:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
              >
                <Moon size={16} /> Good Night
              </button>
            </div>
          </div>
      </Model>
    );
  }

  // If task is already done, simple option to undo (handled by parent logic usually, but here we act as "Interact")
  if (block.isCompleted) {
    return (
      <Model
        onClose={onClose}
        zIndexClass="z-[60]"
        layout="bottom"
        showMobileHandle
        contentClassName="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 sm:rounded-2xl p-6 sm:pb-6 pb-12 animate-slide-up sm:animate-in sm:zoom-in-95"
      >
          <button onClick={() => { haptic.light(); onClose(); }} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hidden sm:block"><X size={20} /></button>

          <h3 className="text-zinc-900 dark:text-white font-bold mb-4 text-xl font-display">Task Completed</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 leading-relaxed">This block is marked as done. Do you want to reopen it?</p>
          <div className="flex gap-3">
            <button onClick={() => { haptic.light(); onClose(); }} className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 active-scale">Cancel</button>
            <button onClick={() => { haptic.medium(); onComplete(); }} className="flex-1 py-4 rounded-2xl bg-white text-black font-bold active-scale">Mark Incomplete</button>
          </div>
      </Model>
    );
  }

  // --- EARLY FINISH SCENARIO ---
  if (minutesSaved > 5) {
    return (
      <Model
        onClose={onClose}
        zIndexClass="z-[60]"
        layout="bottom"
        showMobileHandle
        contentClassName="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 sm:rounded-2xl p-6 sm:pb-6 pb-12 animate-slide-up sm:animate-in sm:zoom-in-95"
      >
          <button onClick={() => { haptic.light(); onClose(); }} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hidden sm:block"><X size={20} /></button>

          <div className="flex items-center gap-2 mb-2 text-primary-400">
            <Clock size={18} className="animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Efficiency Detected</span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 font-display">Momentum Shift</h2>
          <p className="text-zinc-600 dark:text-zinc-500 text-sm mb-6 leading-relaxed">
            You finished {minutesSaved}m early. How do you want to handle this gain?
          </p>

          <div className="space-y-3">
            <button
              onClick={() => { haptic.success(); onShift(); }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-primary-600 hover:bg-primary-500 active-scale transition-all text-left shadow-[0_10px_30px_rgba(var(--primary),0.2)] group"
            >
              <div className="p-2.5 rounded-xl bg-white/20 text-white group-hover:scale-110 transition-transform"><FastForward size={20} /></div>
              <div>
                <span className="block text-white font-bold text-sm">Start Next Task Now</span>
                <span className="block text-white/60 text-xs">Earn +{minutesSaved}m free time today</span>
              </div>
            </button>

            <button
              onClick={() => { haptic.medium(); onSplit("Tactical Recovery", 'Rest'); }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 active-scale transition-all text-left group"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform"><Coffee size={20} /></div>
              <div>
                <span className="block text-zinc-900 dark:text-white font-bold text-sm">Tactical Recovery</span>
                <span className="block text-zinc-500 text-xs">Maintain current slot until {block.endTime}</span>
              </div>
            </button>

            <button
              onClick={() => { haptic.medium(); onSplit("System Review", 'Study'); }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 active-scale transition-all text-left group"
            >
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform"><BookOpen size={20} /></div>
              <div>
                <span className="block text-zinc-900 dark:text-white font-bold text-sm">Drill Session</span>
                <span className="block text-zinc-500 text-xs">Push {minutesSaved}m into flashcards</span>
              </div>
            </button>
          </div>

          <button onClick={() => { haptic.light(); onComplete(); }} className="w-full mt-6 py-3 text-xs text-zinc-500 font-bold uppercase tracking-widest active-dim">
            Just mark as complete
          </button>
      </Model>
    );
  }

  // --- STANDARD FINISH ---
  return (
    <Model
      onClose={onClose}
      zIndexClass="z-[60]"
      layout="bottom"
      showMobileHandle
      contentClassName="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 sm:rounded-2xl p-6 sm:pb-6 pb-12 animate-slide-up sm:animate-in sm:zoom-in-95"
    >
      <button onClick={() => { haptic.light(); onClose(); }} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hidden sm:block"><X size={20} /></button>

      <h3 className="text-zinc-900 dark:text-white font-bold mb-2 text-xl font-display">Mark as Complete?</h3>
      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 leading-relaxed">{block.activityName}</p>
      <div className="flex gap-3">
        <button onClick={() => { haptic.light(); onClose(); }} className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium active-scale">Cancel</button>
        <button onClick={() => { haptic.success(); onComplete(); }} className="flex-1 py-4 rounded-2xl bg-primary-600 text-white font-bold active-scale flex items-center justify-center gap-2">
          <CheckCircle2 size={18} /> Confirm
        </button>
      </div>
    </Model>
  );
};
