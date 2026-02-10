
import React, { useState, useEffect } from 'react';
import { ScheduleBlock, AppMode } from '../types';
import { getCurrentTime24, getMinutesDiff } from '../services/timeService';
import { CheckCircle2, Clock, FastForward, Coffee, BookOpen, X, Moon, Sunrise } from 'lucide-react';

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
    // Assuming 7:00 AM wake up based on default schedule
    const wakeUpHour = 7;
    let sleepHours = 0;

    // Logic to calculate hours until 7am
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
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20} /></button>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mb-4">
              <Moon size={24} />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Heading to bed?</h2>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              If you sleep now, you will get approximately:
            </p>

            <div className="flex items-center gap-4 mb-6 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
              <div className="flex-1">
                <span className="block text-3xl font-mono font-bold text-white">{formattedHours}<span className="text-sm text-zinc-500 ml-1">h</span> {formattedMins}<span className="text-sm text-zinc-500 ml-1">m</span></span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold">Rest Duration</span>
              </div>
              <div className="w-px h-8 bg-zinc-800"></div>
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-1 text-zinc-400 mb-1">
                  <Sunrise size={14} />
                  <span className="text-xs font-bold">07:00</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold">Wake Up</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition-colors">Not yet</button>
              <button
                onClick={onComplete}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
              >
                <Moon size={16} /> Good Night
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If task is already done, simple option to undo (handled by parent logic usually, but here we act as "Interact")
  if (block.isCompleted) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
          <h3 className="text-white font-bold mb-4">Task Completed</h3>
          <p className="text-zinc-400 text-sm mb-6">This block is marked as done. Do you want to reopen it?</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300">Cancel</button>
            <button onClick={onComplete} className="flex-1 py-3 rounded-xl bg-white text-black font-bold">Mark Incomplete</button>
          </div>
        </div>
      </div>
    );
  }

  // --- EARLY FINISH SCENARIO ---
  if (minutesSaved > 5) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20} /></button>

          <div className="flex items-center gap-2 mb-2 text-primary-400">
            <Clock size={18} className="animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Efficiency Detected</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Momentum Shift</h2>
          <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
            You finished {minutesSaved}m early. How do you want to handle this gain?
          </p>

          <div className="space-y-3">
            {/* OPTION 1: Shift (Choice A) */}
            <button
              onClick={onShift}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-primary-600 hover:bg-primary-500 transition-all text-left shadow-[0_0_20px_rgba(var(--primary),0.2)] group"
            >
              <div className="p-2 rounded-full bg-white/20 text-white group-hover:scale-110 transition-transform"><FastForward size={20} /></div>
              <div>
                <span className="block text-white font-bold text-sm">Start Next Task Now</span>
                <span className="block text-white/60 text-xs">Earn +{minutesSaved}m free time today</span>
              </div>
            </button>

            {/* OPTION 2: Break (Choice B) */}
            <button
              onClick={() => onSplit("Tactical Recovery", 'Rest')}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-all text-left group"
            >
              <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform"><Coffee size={20} /></div>
              <div>
                <span className="block text-white font-bold text-sm">Tactical Recovery</span>
                <span className="block text-zinc-500 text-xs">Maintain current slot until {block.endTime}</span>
              </div>
            </button>

            {/* OPTION 3: Review */}
            <button
              onClick={() => onSplit("System Review", 'Study')}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-all text-left group"
            >
              <div className="p-2 rounded-full bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform"><BookOpen size={20} /></div>
              <div>
                <span className="block text-white font-bold text-sm">Drill Session</span>
                <span className="block text-zinc-500 text-xs">Push {minutesSaved}m into flashcards</span>
              </div>
            </button>
          </div>

          <button onClick={onComplete} className="w-full mt-4 py-3 text-xs text-zinc-500 hover:text-white transition-colors">
            Just mark as complete (no changes)
          </button>
        </div>
      </div>
    );
  }

  // --- STANDARD FINISH ---
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
        <h3 className="text-white font-bold mb-2 text-lg">Mark as Complete?</h3>
        <p className="text-zinc-400 text-sm mb-6">{block.activityName}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium">Cancel</button>
          <button onClick={onComplete} className="flex-1 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-500 transition-colors flex items-center justify-center gap-2">
            <CheckCircle2 size={18} /> Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
