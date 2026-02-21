
import React, { useState, useEffect } from 'react';
import { DayLog, Subject, AppMode } from '../types';
import { getCustomSubjects, saveLog, getHistory, getAppSettings } from '../services/storageService';
import { Sparkles, Plus, AlertCircle, Star, X, BookOpen } from 'lucide-react';
import { haptic } from '../services/hapticService';

interface Props {
  log: DayLog;
  refreshLog: () => void;
  onClose: () => void;
}

export const SubjectManager: React.FC<Props> = ({ log, refreshLog, onClose }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [recommendations, setRecommendations] = useState<{ subject: Subject, count: number }[]>([]);
  const [appMode, setAppMode] = useState<AppMode>('Normal');
  const selectedInSlots = [log.selectedSubjects.main1, log.selectedSubjects.main2, log.selectedSubjects.light].filter(Boolean) as string[];
  const additionalSelected = log.additionalSubjects || [];

  const getUniqueSubjectIdsForDay = (day: DayLog) => {
    const ids = [
      day.selectedSubjects.main1,
      day.selectedSubjects.main2,
      day.selectedSubjects.light,
      ...(day.additionalSubjects || []),
    ].filter(Boolean) as string[];
    return Array.from(new Set(ids));
  };

  useEffect(() => {
    const allSubjects = getCustomSubjects();
    setSubjects(allSubjects);
    const settings = getAppSettings();
    setAppMode(settings.appMode);

    // Smart Analysis: Look back 10 days
    const history = getHistory(10);
    const counts: Record<string, number> = {};
    allSubjects.forEach(s => counts[s.id] = 0);

    history.forEach(day => {
      getUniqueSubjectIdsForDay(day).forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
      });
    });

    const currentSelection = getUniqueSubjectIdsForDay(log);

    const ranked = allSubjects
      .filter(s => !currentSelection.includes(s.id)) // Don't recommend what's already picked today
      .map(s => {
        let score = counts[s.id] || 0;
        // Priority Logic: Artificially lower the 'studied count' for high priority subjects so they bubble up
        if (s.priority === 'High') score -= 2;
        return { subject: s, count: counts[s.id] || 0, score };
      })
      .sort((a, b) => a.score - b.score); // Ascending (Neglected first)

    setRecommendations(ranked.slice(0, 3));
  }, [log, appMode]);

  const handleSelect = (slot: 'main1' | 'main2' | 'light', subjectId: string) => {
    const newLog = { ...log };
    newLog.selectedSubjects[slot] = subjectId === newLog.selectedSubjects[slot] ? null : subjectId;
    if (subjectId && (newLog.additionalSubjects || []).includes(subjectId)) {
      newLog.additionalSubjects = (newLog.additionalSubjects || []).filter(id => id !== subjectId);
    }
    saveLog(log.date, newLog);
    refreshLog();
  };

  const handleAdditionalToggle = (subjectId: string) => {
    if (selectedInSlots.includes(subjectId)) return;
    const current = new Set(log.additionalSubjects || []);
    if (current.has(subjectId)) current.delete(subjectId);
    else current.add(subjectId);
    const newLog = { ...log, additionalSubjects: Array.from(current) };
    saveLog(log.date, newLog);
    refreshLog();
  };

  const applyRecommendation = (subjectId: string) => {
    // Auto-fill logic: Find first empty slot
    let slot: 'main1' | 'main2' | 'light' | null = null;
    if (!log.selectedSubjects.main1) slot = 'main1';
    else if (!log.selectedSubjects.main2) slot = 'main2';
    else if (!log.selectedSubjects.light) slot = 'light';

    if (slot) handleSelect(slot, subjectId);
    else handleAdditionalToggle(subjectId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-300">
      <div onClick={() => { haptic.light(); onClose(); }} className="absolute inset-0"></div>
      <div className="bg-zinc-900 border-t sm:border border-zinc-800 w-full max-w-md sm:rounded-2xl p-6 sm:pb-6 pb-12 shadow-2xl relative animate-slide-up sm:animate-in sm:zoom-in-95 flex flex-col max-h-[85vh]">
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6 sm:hidden shrink-0" />
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h2 className="text-xl font-display font-bold text-white">Strategy</h2>
            <p className="text-xs text-zinc-500 font-medium">
              {appMode === 'Exam' ? 'Exam Mode: Maximize Coverage' : 'Balance your study mix'}
            </p>
          </div>
          <button title="Close" onClick={() => { haptic.light(); onClose(); }} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors hidden sm:block">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar space-y-6">
          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3 text-indigo-300">
                <Sparkles size={14} className="animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Smart Suggestions</span>
              </div>
              <p className="text-[10px] text-zinc-400 mb-3 leading-relaxed">
                neglected subjects detected. Tap to add to plan.
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {recommendations.map(({ subject, count }) => (
                  <button
                    key={subject.id}
                    onClick={() => { haptic.medium(); applyRecommendation(subject.id); }}
                    className="flex items-center gap-2 px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-xl transition-all whitespace-nowrap group active-scale shadow-sm"
                  >
                    <span className="text-xs font-bold text-zinc-200">{subject.name}</span>
                    {subject.priority === 'High' && <Star size={10} className="text-amber-400 fill-amber-400" />}
                    {count === 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>}
                    <Plus size={12} className="text-zinc-500 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-widest">Main Focus 1</label>
              <div className="relative">
                <select
                  className="w-full bg-black text-white p-4 rounded-xl border border-zinc-800 focus:border-primary-500/50 outline-none appearance-none text-sm font-medium transition-all"
                  value={log.selectedSubjects.main1 || ''}
                  title="Select Subject for Main Focus 1"
                  onChange={(e) => { haptic.light(); handleSelect('main1', e.target.value); }}
                >
                  <option value="">(Empty Slot)</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}{s.priority === 'High' ? ' (High)' : ''}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                  <BookOpen />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-widest">Main Focus 2</label>
              <div className="relative">
                <select title="Select your second main focus subject" className="w-full bg-black text-white p-4 rounded-xl border border-zinc-800 focus:border-primary-500/50 outline-none appearance-none text-sm font-medium transition-all" value={log.selectedSubjects.main2 || ''} onChange={(e) => { haptic.light(); handleSelect('main2', e.target.value); }}>
                  <option value="">(Empty Slot)</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}{s.priority === 'High' ? ' (High)' : ''}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                  <BookOpen />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-widest text-emerald-500/80">Light / Review</label>
              <div className="relative">
                <select
                  className="w-full bg-black text-zinc-300 p-4 rounded-xl border border-zinc-800 focus:border-emerald-500/50 outline-none appearance-none text-sm font-medium transition-all"
                  value={log.selectedSubjects.light || ''}
                  title="Select a subject for light study or review. This slot is ideal for subjects you want to keep in rotation without heavy focus."
                  onChange={(e) => { haptic.light(); handleSelect('light', e.target.value); }}
                >
                  <option value="">(Empty Slot)</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}{s.priority === 'High' ? ' (High)' : ''}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                  <BookOpen />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-widest">Additional Subjects (Multi)</label>
              <div className="flex flex-wrap gap-2">
                {subjects.map(s => {
                  const isDisabled = selectedInSlots.includes(s.id);
                  const isSelected = additionalSelected.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => { haptic.light(); handleAdditionalToggle(s.id); }}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all active-scale
                        ${isDisabled
                          ? 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed'
                          : isSelected
                            ? 'bg-primary-600/20 border-primary-500/40 text-primary-300'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'}`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-zinc-500 mt-2">
                Additional subjects are recognized once per day in analytics.
              </p>
            </div>
          </div>

          <button
            onClick={() => { haptic.success(); onClose(); }}
            className="w-full bg-zinc-100 text-black font-bold py-4 rounded-2xl hover:bg-white active-scale transition-all shadow-xl"
          >
            Confirm Protocol
          </button>
        </div>
      </div>
    </div>
  );
};

