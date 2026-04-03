
import React, { useEffect, useState } from 'react';
import { ScheduleBlock, ActivityMode } from '../types';
import { X, Save, Clock, Tag, AlertCircle } from 'lucide-react';
import { haptic } from '../services/hapticService';
import { addMinutes, getMinutesDiff } from '../services/timeService';
import { Model } from './ui/model';

interface Props {
  block: ScheduleBlock;
  onSave: (id: string, updates: Partial<ScheduleBlock>) => void;
  onClose: () => void;
}

const WEEK_DAYS = [
  { id: 0, short: 'Sun' },
  { id: 1, short: 'Mon' },
  { id: 2, short: 'Tue' },
  { id: 3, short: 'Wed' },
  { id: 4, short: 'Thu' },
  { id: 5, short: 'Fri' },
  { id: 6, short: 'Sat' },
];

export const EditBlockModal: React.FC<Props> = ({ block, onSave, onClose }) => {
  const inferFixed = (candidate: { blockType: 'TASK' | 'EVENT'; mode: ActivityMode; activityName: string }) => {
    if (candidate.blockType === 'EVENT' || candidate.mode === 'Class' || candidate.mode === 'Event' || candidate.mode === 'Rest') {
      return true;
    }
    const name = (candidate.activityName || '').toLowerCase();
    return /breakfast|lunch|dinner|meal|rest|sleep|nap|break/.test(name);
  };

  const [startTime, setStartTime] = useState(block.startTime);
  const [endTime, setEndTime] = useState(block.endTime);
  const [activityName, setActivityName] = useState(block.activityName);
  const [mode, setMode] = useState<ActivityMode>(block.mode);
  const [blockType, setBlockType] = useState<'TASK' | 'EVENT'>(block.blockType || (block.mode === 'Class' || block.mode === 'Event' ? 'EVENT' : 'TASK'));
  const [isFixed, setIsFixed] = useState<boolean>(
    typeof block.isFixed === 'boolean'
      ? block.isFixed
      : inferFixed({ blockType: block.blockType || (block.mode === 'Class' || block.mode === 'Event' ? 'EVENT' : 'TASK'), mode: block.mode, activityName: block.activityName })
  );
  const [fixedManuallyChanged, setFixedManuallyChanged] = useState(false);
  const [eventDate, setEventDate] = useState(block.eventDate || '');
  const [eventEndDate, setEventEndDate] = useState(block.eventEndDate || '');
  const [durationMinutes, setDurationMinutes] = useState<number>(
    block.durationMinutes || getMinutesDiff(block.startTime, block.endTime)
  );
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    block.daysOfWeek && block.daysOfWeek.length > 0 ? [...block.daysOfWeek] : [0, 1, 2, 3, 4, 5, 6]
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fixedManuallyChanged) return;
    setIsFixed(inferFixed({ blockType, mode, activityName }));
  }, [blockType, mode, activityName, fixedManuallyChanged]);

  const handleSubmit = () => {
    const computedEndTime = blockType === 'EVENT' ? addMinutes(startTime, durationMinutes) : endTime;
    // Validation: use proper minute diff that handles cross-midnight
    const diff = getMinutesDiff(startTime, computedEndTime);
    if (diff <= 0 || diff > 12 * 60) {
      setError("Invalid time range. End time must be after start time (max 12 hours).");
      return;
    }
    if (blockType === 'EVENT' && durationMinutes <= 0) {
      setError("Event duration must be greater than 0 minutes.");
      return;
    }
    if (blockType === 'EVENT' && eventEndDate && !eventDate) {
      setError("Set a start date before adding an end date.");
      return;
    }
    if (blockType === 'EVENT' && eventDate && eventEndDate && eventEndDate < eventDate) {
      setError("End date cannot be before start date.");
      return;
    }

    onSave(block.id, {
      startTime,
      endTime: computedEndTime,
      activityName,
      mode,
      blockType,
      isFixed,
      eventDate: blockType === 'EVENT' && eventDate ? eventDate : undefined,
      eventEndDate: blockType === 'EVENT' && eventEndDate ? eventEndDate : undefined,
      durationMinutes: blockType === 'EVENT' ? durationMinutes : undefined,
      daysOfWeek: daysOfWeek.length === 7 ? undefined : [...daysOfWeek].sort((a, b) => a - b),
    });
    onClose();
  };

  const toggleDay = (dayId: number) => {
    const has = daysOfWeek.includes(dayId);
    const next = has ? daysOfWeek.filter(d => d !== dayId) : [...daysOfWeek, dayId];
    setDaysOfWeek(next.sort((a, b) => a - b));
  };

  return (
    <Model
      onClose={onClose}
      zIndexClass="z-[60]"
      layout="bottom"
      showMobileHandle
      contentClassName="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 sm:rounded-2xl p-6 sm:pb-6 pb-12 animate-slide-up sm:animate-in sm:zoom-in-95"
    >

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 font-display">
          Edit Activity
        </h2>
        <button onClick={() => { haptic.light(); onClose(); }} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors hidden sm:block">
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
            className="w-full bg-white dark:bg-black text-zinc-900 dark:text-white p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-primary-500/50 outline-none transition-all placeholder-zinc-400 dark:placeholder-zinc-700 text-lg"
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
              className="w-full bg-white dark:bg-black text-zinc-900 dark:text-white p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-primary-500/50 outline-none appearance-none text-lg"
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
              className="w-full bg-white dark:bg-black text-zinc-900 dark:text-white p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-primary-500/50 outline-none appearance-none text-lg"
              disabled={blockType === 'EVENT'}
            />
          </div>
        </div>
        {blockType === 'EVENT' && (
          <p className="text-[10px] text-zinc-500 -mt-4">
            For events, end time is auto-calculated from start time + duration.
          </p>
        )}

        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase mb-3 block tracking-widest">Category Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Study', 'Deep Work', 'Task', 'Class', 'Event', 'Rest', 'Human'] as ActivityMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { haptic.light(); setMode(m); }}
                className={`text-xs font-bold py-3 rounded-xl border transition-all active-scale
                  ${mode === m
                    ? 'bg-white text-black border-white shadow-lg'
                    : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-500'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase mb-3 block tracking-widest">Block Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(['TASK', 'EVENT'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { haptic.light(); setBlockType(t); }}
                className={`text-xs font-bold py-3 rounded-xl border transition-all active-scale
                  ${blockType === t
                    ? 'bg-primary-600 text-white border-primary-500'
                    : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-500'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase mb-3 block tracking-widest">Timeline Behavior</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                haptic.light();
                setIsFixed(true);
                setFixedManuallyChanged(true);
              }}
              className={`text-xs font-bold py-3 rounded-xl border transition-all active-scale
                ${isFixed
                  ? 'bg-primary-600 text-white border-primary-500'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-500'}`}
            >
              Fixed
            </button>
            <button
              type="button"
              onClick={() => {
                haptic.light();
                setIsFixed(false);
                setFixedManuallyChanged(true);
              }}
              className={`text-xs font-bold py-3 rounded-xl border transition-all active-scale
                ${!isFixed
                  ? 'bg-primary-600 text-white border-primary-500'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-500'}`}
            >
              Flexible
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">
            Fixed blocks keep their time when earlier tasks finish early.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Days</label>
            <button
              type="button"
              onClick={() => setDaysOfWeek([0, 1, 2, 3, 4, 5, 6])}
              className="text-[10px] text-primary-500 font-bold uppercase tracking-wider"
            >
              Every Day
            </button>
          </div>
          {blockType === 'EVENT' && (
            <>
              <div className="mb-3">
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-widest">Date Range (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-500 mb-1 block">Start Date</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => {
                        setEventDate(e.target.value);
                        if (!e.target.value) setEventEndDate('');
                        setError(null);
                      }}
                      className="native-date-input w-full bg-white dark:bg-black text-zinc-900 dark:text-white p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-primary-500/50 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-500 mb-1 block">End Date</label>
                    <input
                      type="date"
                      value={eventEndDate}
                      min={eventDate || undefined}
                      onChange={(e) => {
                        setEventEndDate(e.target.value);
                        setError(null);
                      }}
                      className="native-date-input w-full bg-white dark:bg-black text-zinc-900 dark:text-white p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-primary-500/50 outline-none text-sm"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Left = start date, right = end date.</p>
                <p className="text-[10px] text-zinc-500 mt-1">Leave end date empty for a single-date event.</p>
              </div>
            </>
          )}
          {blockType === 'EVENT' && (
            <div className="mb-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-widest">Duration (minutes)</label>
              <input
                type="number"
                min={5}
                max={720}
                step={5}
                value={durationMinutes}
                onChange={(e) => {
                  setDurationMinutes(Math.max(0, Number(e.target.value) || 0));
                  setError(null);
                }}
                className="w-full bg-white dark:bg-black text-zinc-900 dark:text-white p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-primary-500/50 outline-none"
              />
            </div>
          )}
          <div className="grid grid-cols-7 gap-1.5">
            {WEEK_DAYS.map(day => {
              const isOn = daysOfWeek.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => { haptic.light(); toggleDay(day.id); }}
                  className={`py-2 rounded-lg border text-[10px] font-bold transition-all
                    ${isOn
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500'}`}
                >
                  {day.short}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Day selection is optional.</p>
        </div>

        <button
          onClick={() => { haptic.success(); handleSubmit(); }}
          className="w-full mt-4 bg-primary-600 text-white font-bold py-4 rounded-2xl hover:bg-primary-500 active-scale transition-all shadow-xl shadow-primary-900/20 flex items-center justify-center gap-2"
        >
          <Save size={18} />
          Update Protocol
        </button>
      </div>
    </Model>
  );
};
