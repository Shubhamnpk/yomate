import React, { useEffect, useState } from 'react';
import { DayLog } from '../types';
import { saveLog } from '../services/storageService';
import { getCurrentTime24 } from '../services/timeService';
import { CheckCircle2, Clock, Lock, XCircle } from 'lucide-react';
import { ProductivityModule } from './ProductivityModule';

interface Props {
  log: DayLog;
  refreshLog: () => void;
}

export const NightRoutine: React.FC<Props> = React.memo(({ log, refreshLog }) => {
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    if (!log.sleepTime) {
      handleUpdate('sleepTime', getCurrentTime24());
    }
  }, []);

  useEffect(() => {
    const time = getCurrentTime24();
    if (time >= '21:00' || time < '04:00') {
      setIsLocked(false);
    }
  }, []);

  const handleUpdate = (field: keyof DayLog, value: DayLog[keyof DayLog]) => {
    const newLog = { ...log, [field]: value };
    saveLog(log.date, newLog);
    refreshLog();
  };

  const isSleepGood = () => {
    if (!log.sleepTime) return false;
    const [h, m] = log.sleepTime.split(':').map(Number);
    if (h >= 21) return true;
    if (h === 0 && m <= 30) return true;
    return false;
  };

  const getSleepProtocolStatus = () => {
    if (!log.sleepTime) {
      return {
        label: 'Set Sleep Time',
        hint: 'Target window: 22:30 to 00:30',
        tone: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800/60',
      };
    }

    const [h, m] = log.sleepTime.split(':').map(Number);
    const adjustedMinutes = h >= 21 ? (h - 24) * 60 + m : h * 60 + m;
    const targetMinutes = 30;
    const delta = adjustedMinutes - targetMinutes;

    if (adjustedMinutes > targetMinutes) {
      return {
        label: `Late by ${delta}m`,
        hint: 'Try winding down 30 to 45 minutes earlier tomorrow.',
        tone: 'text-rose-500 bg-rose-500/10',
      };
    }

    if (adjustedMinutes < -90) {
      return {
        label: `Early by ${Math.abs(delta)}m`,
        hint: 'Excellent recovery window. Keep this rhythm.',
        tone: 'text-indigo-500 bg-indigo-500/10',
      };
    }

    return {
      label: 'On Target',
      hint: 'Great timing for consistent recovery.',
      tone: 'text-emerald-500 bg-emerald-500/10',
    };
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 ring-1 ring-zinc-200 dark:ring-zinc-800">
          <Lock size={30} className="text-zinc-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Protocol Locked</h2>
        <p className="text-zinc-600 dark:text-zinc-500 mb-8 max-w-xs leading-relaxed">
          The day is still active. Come back after 9:00 PM to close it properly.
        </p>
        <button
          onClick={() => setIsLocked(false)}
          className="text-xs text-zinc-600 hover:text-zinc-400 font-mono border-b border-transparent hover:border-zinc-600 transition-colors"
        >
          Override Protocol
        </button>
      </div>
    );
  }

  const sleepStatus = getSleepProtocolStatus();

  return (
    <div className="p-5 pb-32 animate-in slide-in-from-bottom duration-500 space-y-8">
      <header className="mt-4">
        <h1 className="text-3xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">Closing Protocol</h1>
        <p className="text-zinc-600 dark:text-zinc-500 text-sm">Journal, score, and track the day before you shut down.</p>
      </header>

      <section className="space-y-4">
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex flex-col gap-4">
          <div className={`rounded-xl px-3 py-2 text-xs font-semibold ${sleepStatus.tone}`}>
            <p>{sleepStatus.label}</p>
            <p className="mt-1 text-[11px] opacity-80">{sleepStatus.hint}</p>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Clock size={18} />
              <span className="font-bold">Sleep Time</span>
            </div>
            {isSleepGood() ? (
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">On Target</span>
            ) : (
              <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded">Late</span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="time"
              title="Set Sleep Time"
              value={log.sleepTime || ''}
              onChange={(e) => handleUpdate('sleepTime', e.target.value)}
              className="flex-1 bg-white dark:bg-black text-zinc-900 dark:text-white p-3 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:border-primary-500 outline-none font-mono text-center text-lg"
            />
            <button
              onClick={() => handleUpdate('sleepTime', getCurrentTime24())}
              className="bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-700 text-white px-4 rounded-xl text-sm font-bold transition-colors"
            >
              NOW
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {['22:30', '23:00', '23:30', '00:30'].map((preset) => (
              <button
                key={preset}
                onClick={() => handleUpdate('sleepTime', preset)}
                className={`rounded-lg py-1.5 text-xs font-semibold border transition-colors ${
                  log.sleepTime === preset
                    ? 'bg-primary-500/15 border-primary-500/40 text-primary-600 dark:text-primary-300'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Call Completed?</span>
          <button
            title="Toggle Call Completion"
            onClick={() => handleUpdate('callCompleted', !log.callCompleted)}
            className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${log.callCompleted ? 'bg-emerald-500' : 'bg-zinc-800'}`}
          >
            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${log.callCompleted ? 'translate-x-6' : ''}`} />
          </button>
        </div>

        {log.callCompleted && (
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl animate-in zoom-in-95">
            <p className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Did you scroll Reels after the call?</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleUpdate('reelsAfterCall', false)}
                className={`flex-1 py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${log.reelsAfterCall === false ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-black text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <CheckCircle2 size={16} /> Clean
              </button>
              <button
                onClick={() => handleUpdate('reelsAfterCall', true)}
                className={`flex-1 py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${log.reelsAfterCall === true ? 'bg-rose-500/10 border-rose-500/50 text-rose-500' : 'border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-black text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <XCircle size={16} /> Guilty
              </button>
            </div>
          </div>
        )}
      </section>

      <ProductivityModule
        initialDate={log.date}
        initialMainFocus={log.primaryObjective || ''}
        initialMood={log.mood}
      />
    </div>
  );
});
