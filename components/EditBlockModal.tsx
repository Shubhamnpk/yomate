
import React, { useState } from 'react';
import { ScheduleBlock, ActivityMode } from '../types';
import { X, Save, Clock, Tag, AlertCircle } from 'lucide-react';
import { haptic } from '../services/hapticService';
import { getMinutesDiff } from '../services/timeService';

interface Props {
  block: ScheduleBlock;
  onSave: (id: string, updates: Partial<ScheduleBlock>) => void;
  onClose: () => void;
}

export const EditBlockModal: React.FC<Props> = ({ block, onSave, onClose }) => {
  const [startTime, setStartTime] = useState(block.startTime);
  const [endTime, setEndTime] = useState(block.endTime);
  const [activityName, setActivityName] = useState(block.activityName);
  const [mode, setMode] = useState<ActivityMode>(block.mode);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    // Validation: use proper minute diff that handles cross-midnight
    const diff = getMinutesDiff(startTime, endTime);
    if (diff <= 0 || diff > 12 * 60) {
      setError("Invalid time range. End time must be after start time (max 12 hours).");
      return;
    }

    onSave(block.id, {
      startTime,
      endTime,
      activityName,
      mode
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-300">
      <div onClick={onClose} className="absolute inset-0"></div>
      <div className="bg-zinc-900 border-t sm:border border-zinc-800 w-full max-w-md sm:rounded-2xl p-6 sm:pb-6 pb-12 shadow-2xl relative animate-slide-up sm:animate-in sm:zoom-in-95">
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6 sm:hidden" />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
            Edit Activity
          </h2>
          <button onClick={() => { haptic.light(); onClose(); }} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors hidden sm:block">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-sm animate-shake">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-widest flex items-center gap-1.5">
              <Tag size={12} /> Activity Name
            </label>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              className="w-full bg-black text-white p-4 rounded-xl border border-zinc-800 focus:border-primary-500/50 outline-none transition-all placeholder-zinc-700 text-lg"
              placeholder="e.g. Pharmacology Study"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-widest flex items-center gap-1.5">
                <Clock size={12} /> Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setError(null);
                }}
                className="w-full bg-black text-white p-4 rounded-xl border border-zinc-800 focus:border-primary-500/50 outline-none appearance-none text-lg"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-widest flex items-center gap-1.5">
                <Clock size={12} /> End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setError(null);
                }}
                className="w-full bg-black text-white p-4 rounded-xl border border-zinc-800 focus:border-primary-500/50 outline-none appearance-none text-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase mb-3 block tracking-widest">Category Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Study', 'Deep Work', 'Class', 'Rest', 'Human'] as ActivityMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { haptic.light(); setMode(m); }}
                  className={`text-xs font-bold py-3 rounded-xl border transition-all active-scale
                    ${mode === m
                      ? 'bg-white text-black border-white shadow-lg'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => { haptic.success(); handleSubmit(); }}
            className="w-full mt-4 bg-primary-600 text-white font-bold py-4 rounded-2xl hover:bg-primary-500 active-scale transition-all shadow-xl shadow-primary-900/20 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Update Protocol
          </button>
        </div>
      </div>
    </div>
  );
};
