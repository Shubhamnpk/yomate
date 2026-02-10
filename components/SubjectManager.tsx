
import React, { useState, useEffect } from 'react';
import { DayLog, Subject, AppMode } from '../types';
import { getCustomSubjects, saveLog, getHistory, getAppSettings } from '../services/storageService';
import { Sparkles, Plus, AlertCircle, Star } from 'lucide-react';

interface Props {
  log: DayLog;
  refreshLog: () => void;
  onClose: () => void;
}

export const SubjectManager: React.FC<Props> = ({ log, refreshLog, onClose }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [recommendations, setRecommendations] = useState<{subject: Subject, count: number}[]>([]);
  const [appMode, setAppMode] = useState<AppMode>('Normal');

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
      if (day.selectedSubjects.main1) counts[day.selectedSubjects.main1] = (counts[day.selectedSubjects.main1] || 0) + 1;
      if (day.selectedSubjects.main2) counts[day.selectedSubjects.main2] = (counts[day.selectedSubjects.main2] || 0) + 1;
      // Light counts as 0.5 study unit
      if (day.selectedSubjects.light) counts[day.selectedSubjects.light] = (counts[day.selectedSubjects.light] || 0) + 0.5;
    });

    const currentSelection = [log.selectedSubjects.main1, log.selectedSubjects.main2, log.selectedSubjects.light];

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
    saveLog(log.date, newLog);
    refreshLog();
  };

  const applyRecommendation = (subjectId: string) => {
    // Auto-fill logic: Find first empty slot
    let slot: 'main1' | 'main2' | 'light' | null = null;
    if (!log.selectedSubjects.main1) slot = 'main1';
    else if (!log.selectedSubjects.main2) slot = 'main2';
    else if (!log.selectedSubjects.light) slot = 'light';

    if (slot) {
      handleSelect(slot, subjectId);
    } else {
      alert("All slots are full. Please clear a slot (Main 1, Main 2, or Light) to add this subject.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-white">Strategy</h2>
            <p className="text-xs text-zinc-500">
              {appMode === 'Exam' ? 'Exam Mode Active: Prioritizing Coverage' : 'Plan your study mix'}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white px-2">✕</button>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mb-6 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 text-indigo-300">
              <Sparkles size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Smart Rotation</span>
            </div>
            <p className="text-[10px] text-zinc-500 mb-3">
              You haven't studied these much recently. Click to add.
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {recommendations.map(({subject, count}) => (
                <button
                  key={subject.id}
                  onClick={() => applyRecommendation(subject.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors whitespace-nowrap group"
                >
                  <span className="text-xs font-medium text-zinc-200">{subject.name}</span>
                  {subject.priority === 'High' && <Star size={10} className="text-amber-400 fill-amber-400" />}
                  {count === 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>}
                  <Plus size={12} className="text-zinc-500 group-hover:text-white" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-zinc-500 uppercase mb-2 block">Main Subject 1</label>
            <div className="relative">
              <select 
                className="w-full bg-zinc-950 text-white p-3 rounded-lg border border-zinc-800 focus:border-primary-500/50 outline-none appearance-none"
                value={log.selectedSubjects.main1 || ''}
                onChange={(e) => handleSelect('main1', e.target.value)}
              >
                <option value="">Select Subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} {s.priority === 'High' ? '★' : ''}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-zinc-500 uppercase mb-2 block">Main Subject 2</label>
             <select 
                className="w-full bg-zinc-950 text-white p-3 rounded-lg border border-zinc-800 focus:border-primary-500/50 outline-none appearance-none"
                value={log.selectedSubjects.main2 || ''}
                onChange={(e) => handleSelect('main2', e.target.value)}
              >
                <option value="">Select Subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} {s.priority === 'High' ? '★' : ''}</option>)}
              </select>
          </div>

          <div>
            <label className="text-xs font-mono text-zinc-500 uppercase mb-2 block">Light / Review</label>
             <select 
                className="w-full bg-zinc-950 text-zinc-300 p-3 rounded-lg border border-zinc-800 focus:border-primary-500/50 outline-none appearance-none"
                value={log.selectedSubjects.light || ''}
                onChange={(e) => handleSelect('light', e.target.value)}
              >
                <option value="">Select Subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} {s.priority === 'High' ? '★' : ''}</option>)}
              </select>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 bg-zinc-100 text-black font-bold py-3 rounded-xl hover:bg-white transition-colors"
        >
          Confirm Plan
        </button>
      </div>
    </div>
  );
};
