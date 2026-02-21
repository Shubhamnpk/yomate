
import React, { useState, useEffect } from 'react';
import { DayLog } from '../types';
import { saveLog, saveTomorrowObjective } from '../services/storageService';
import { getMentorFeedback } from '../services/geminiService';
import { getCurrentTime24, formatTo12h } from '../services/timeService';
import { Battery, Smile, Clock, Moon, CheckCircle2, XCircle, Send, Dumbbell, Target, Sparkles, Map, Lock } from 'lucide-react';

interface Props {
  log: DayLog;
  refreshLog: () => void;
}

export const NightRoutine: React.FC<Props> = React.memo(({ log, refreshLog }) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  // Auto-set time on mount if empty
  useEffect(() => {
    if (!log.sleepTime) {
      handleUpdate('sleepTime', getCurrentTime24());
    }
  }, []);

  useEffect(() => {
    const time = getCurrentTime24();
    // Lock logic: Only allow access between 9PM and 4AM
    if (time >= '21:00' || time < '04:00') {
      setIsLocked(false);
    }
  }, []);

  const classesDone = log.schedule.some(b => b.mode === 'Class' && b.isCompleted);
  const studiedSubjectCount = (() => {
    const studied = new Set<string>();
    const { main1, main2, light } = log.selectedSubjects;
    if (main1) studied.add(main1);
    if (main2) studied.add(main2);
    if (light) studied.add(light);
    (log.additionalSubjects || []).forEach(id => studied.add(id));
    Object.entries(log.subjectMinutes || {}).forEach(([id, mins]) => {
      if ((mins as number) > 0) studied.add(id);
    });
    return studied.size;
  })();
  const multiSubjectDone = studiedSubjectCount >= 2;
  const deepWorkDone = log.deepWorkMinutes >= 60;

  const isSleepGood = () => {
    if (!log.sleepTime) return false;
    const [h, m] = log.sleepTime.split(':').map(Number);
    // Good if before 00:30 (i.e. 21:00-23:59 OR 00:00-00:30)
    if (h >= 21) return true;
    if (h === 0 && m <= 30) return true;
    return false;
  };

  const ritualsDone = (log.completedRituals || []).length >= 1; // At least one ritual

  let score = 0;
  if (classesDone) score++;
  if (multiSubjectDone) score++;
  if (deepWorkDone) score++;
  if (isSleepGood()) score++;
  if (ritualsDone) score++; // Max score 5

  const getScoreLabel = (s: number) => {
    if (s === 5) return { text: 'Perfect', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (s === 4) return { text: 'Excellent', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
    if (s === 3) return { text: 'Good', color: 'text-zinc-700 dark:text-zinc-300', bg: 'bg-zinc-500/10 border-zinc-500/20' };
    return { text: 'Needs Adjustment', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
  };

  const handleUpdate = (field: keyof DayLog | string, value: any) => {
    const newLog: any = { ...log };
    if (field.startsWith('ref_')) {
      newLog.reflection[field.replace('ref_', '')] = value;
    } else {
      newLog[field] = value;
    }
    saveLog(log.date, newLog);
    refreshLog();
  };

  const submitReflection = async () => {
    if (!log.reflection.whatWentRight || !log.reflection.fixForTomorrow) return;
    setLoadingAI(true);
    const feedback = await getMentorFeedback(log);
    handleUpdate('ref_aiMentorFeedback', feedback);
    setLoadingAI(false);
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 ring-1 ring-zinc-200 dark:ring-zinc-800">
          <Lock size={30} className="text-zinc-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Protocol Locked</h2>
        <p className="text-zinc-600 dark:text-zinc-500 mb-8 max-w-xs leading-relaxed">
          The day isn't over. Focus on your tasks. Return after 9:00 PM to reflect.
        </p>
        <button
          onClick={() => setIsLocked(false)}
          className="text-xs text-zinc-600 hover:text-zinc-400 font-mono border-b border-transparent hover:border-zinc-600 transition-colors"
        >
          Override Protocol (Early Sleep)
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 pb-32 animate-in slide-in-from-bottom duration-500">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">Closing Protocol</h1>
        <p className="text-zinc-600 dark:text-zinc-500 text-sm">Review. Reflect. Reset.</p>
      </header>

      {/* 1. Sleep & Call Section */}
      <section className="space-y-4 mb-8">
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex flex-col gap-4">
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

      {/* 2. Mood & Energy */}
      <section className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl mb-8 space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><Battery size={16} /><span className="text-xs font-bold uppercase tracking-wider">Energy Level</span></div>
            <span className="text-xs font-mono text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{log.energy}/5</span>
          </div>
          <input
            type="range" min="1" max="5" value={log.energy}
            title="Set Energy Level"
            onChange={(e) => handleUpdate('energy', Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-600 mt-1 uppercase font-bold">
            <span>Drained</span>
            <span>Charged</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><Smile size={16} /><span className="text-xs font-bold uppercase tracking-wider">Mood</span></div>
            <span className="text-xs font-mono text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{log.mood}/5</span>
          </div>
          <input
            type="range" min="1" max="5" value={log.mood}
            title="Set Mood Level"
            onChange={(e) => handleUpdate('mood', Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-600 mt-1 uppercase font-bold">
            <span>Rough</span>
            <span>Great</span>
          </div>
        </div>
      </section>

      {/* 3. Reflection */}
      <section className="space-y-4 mb-10">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <Moon size={18} className="text-primary-400" />
          The Review
        </h2>

        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-3 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Win</span>
            <textarea
              placeholder="What went right?"
              rows={2}
              className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 pt-8 pb-3 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:border-emerald-500/50 transition-colors resize-none"
              value={log.reflection.whatWentRight}
              onChange={(e) => handleUpdate('ref_whatWentRight', e.target.value)}
            />
          </div>

          <div className="relative">
            <span className="absolute left-4 top-3 text-[10px] font-bold text-rose-500 uppercase tracking-widest">Loss</span>
            <textarea
              placeholder="Where did distraction win?"
              rows={2}
              className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 pt-8 pb-3 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:border-rose-500/50 transition-colors resize-none"
              value={log.reflection.distractionWin}
              onChange={(e) => handleUpdate('ref_distractionWin', e.target.value)}
            />
          </div>

          <div className="relative">
            <span className="absolute left-4 top-3 text-[10px] font-bold text-primary-500 uppercase tracking-widest">Fix</span>
            <textarea
              placeholder="One fix for tomorrow?"
              rows={2}
              className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 pt-8 pb-3 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:border-primary-500/50 transition-colors resize-none"
              value={log.reflection.fixForTomorrow}
              onChange={(e) => handleUpdate('ref_fixForTomorrow', e.target.value)}
            />
          </div>
        </div>

        {!log.reflection.aiMentorFeedback ? (
          <button
            onClick={submitReflection}
            disabled={loadingAI}
            className="w-full mt-4 py-4 bg-white text-black rounded-xl text-sm font-bold tracking-wide hover:bg-zinc-200 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loadingAI ? 'ANALYZING...' : (
              <>
                FINISH DAY <Send size={16} />
              </>
            )}
          </button>
        ) : (
          <div className="p-6 bg-primary-900/10 border border-primary-500/20 rounded-2xl mt-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
            <p className="text-xs text-primary-400 font-mono mb-3 uppercase tracking-widest flex items-center gap-2">
              Mentor Protocol <CheckCircle2 size={12} />
            </p>
            <p className="text-primary-100 italic text-lg font-medium leading-relaxed">"{log.reflection.aiMentorFeedback}"</p>
          </div>
        )}
      </section>

      {/* 4. THE FORGE: MISSION PREVIEW */}
      {log.reflection.aiMentorFeedback && (
        <section className="mt-12 space-y-8 animate-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800"></div>
            <div className="flex items-center gap-2 text-primary-400">
              <Sparkles size={18} />
              <span className="text-xs font-bold uppercase tracking-[0.4em]">The Forge</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800"></div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Prepare tomorrow's descent.</h3>
            <p className="text-zinc-600 dark:text-zinc-500 text-sm">Set your primary objective to anchor your focus.</p>
          </div>

          <div className="bg-white/90 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl space-y-6 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Target size={80} />
            </div>

            <div>
              <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-3 block">Primary Objective (Ghost Text)</label>
              <input
                type="text"
                placeholder="e.g. Master Pharmacology Chapter 4"
                className="w-full bg-zinc-100 dark:bg-black/40 border-b-2 border-zinc-300 dark:border-zinc-800 py-3 text-lg text-zinc-900 dark:text-white outline-none focus:border-primary-500 transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-700"
                onBlur={(e) => saveTomorrowObjective(e.target.value)}
                defaultValue={log.primaryObjective || ''}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-500">
                <Map size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Visual Map (Tomorrow)</span>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                {log.schedule.map((b, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800/50 rounded-xl">
                    <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-600 w-16 whitespace-nowrap">
                      {formatTo12h(b.startTime)}
                    </div>
                    <div className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-400 truncate">
                      {b.activityName}
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${b.mode === 'Study' || b.mode === 'Deep Work' ? 'bg-primary-500' : 'bg-zinc-700'
                      }`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 text-center">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">
              Objective will appear in HUD header <br /> upon next protocol initiation.
            </p>
          </div>
        </section>
      )}

      {/* Score Card */}
      <div className={`border rounded-2xl p-6 ${getScoreLabel(score).bg}`}>
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-xs opacity-70 uppercase tracking-widest block mb-1 font-bold">Daily Score</span>
            <h2 className={`text-3xl font-bold ${getScoreLabel(score).color}`}>{getScoreLabel(score).text}</h2>
          </div>
          <span className="text-5xl font-mono font-bold opacity-20">{score}/5</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider">
          <div className={`p-3 rounded-lg border flex items-center justify-between ${classesDone ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-zinc-100 dark:bg-black/20 border-zinc-200 dark:border-black/10 text-zinc-500 dark:text-zinc-400 opacity-70'}`}>
            Classes
            {classesDone && <CheckCircle2 size={14} />}
          </div>
          <div className={`p-3 rounded-lg border flex items-center justify-between ${multiSubjectDone ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-zinc-100 dark:bg-black/20 border-zinc-200 dark:border-black/10 text-zinc-500 dark:text-zinc-400 opacity-70'}`}>
            2+ Subjects
            {multiSubjectDone && <CheckCircle2 size={14} />}
          </div>
          <div className={`p-3 rounded-lg border flex items-center justify-between ${deepWorkDone ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-zinc-100 dark:bg-black/20 border-zinc-200 dark:border-black/10 text-zinc-500 dark:text-zinc-400 opacity-70'}`}>
            Deep Work
            {deepWorkDone && <CheckCircle2 size={14} />}
          </div>
          <div className={`p-3 rounded-lg border flex items-center justify-between ${isSleepGood() ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-zinc-100 dark:bg-black/20 border-zinc-200 dark:border-black/10 text-zinc-500 dark:text-zinc-400 opacity-70'}`}>
            Sleep Target
            {isSleepGood() && <CheckCircle2 size={14} />}
          </div>
          <div className={`p-3 rounded-lg border flex items-center justify-between ${ritualsDone ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-zinc-100 dark:bg-black/20 border-zinc-200 dark:border-black/10 text-zinc-500 dark:text-zinc-400 opacity-70'}`}>
            Rituals
            {ritualsDone && <CheckCircle2 size={14} />}
          </div>
        </div>
      </div>
    </div>
  );
});

