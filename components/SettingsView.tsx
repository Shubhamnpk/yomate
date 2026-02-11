
import React, { useState, useEffect } from 'react';
import { ScheduleBlock, Subject, AppSettings, DayLog } from '../types';
import {
  getScheduleTemplate, saveScheduleTemplate,
  getCustomSubjects,
  getAppSettings, saveAppSettings,
  initializeToday, saveLog, getHistory
} from '../services/storageService';
import { EditBlockModal } from './EditBlockModal';
import {
  ArrowLeft, Palette, Layout, Calendar,
  AlertOctagon, Milestone, Target
} from 'lucide-react';
import { haptic } from '../services/hapticService';

// Modular Tab Components
import { AppearanceTab } from './settings/AppearanceTab';
import { StrategyTab } from './settings/StrategyTab';
import { SubjectsTab } from './settings/SubjectsTab';
import { ScheduleTab } from './settings/ScheduleTab';
import { DataTab } from './settings/DataTab';

interface Props {
  onClose: () => void;
  refreshApp: () => void;
}

export const SettingsView: React.FC<Props> = ({ onClose, refreshApp }) => {
  const [activeTab, setActiveTab] = useState<'APPEARANCE' | 'STRATEGY' | 'SCHEDULE' | 'SUBJECTS' | 'DATA'>('APPEARANCE');

  // Data States
  const [template, setTemplate] = useState<ScheduleBlock[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [dayLog, setDayLog] = useState<DayLog>(initializeToday(true));

  // UI States
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  // Strategy Recommendations
  const [recommendations, setRecommendations] = useState<{ subject: Subject, count: number, score: number }[]>([]);

  useEffect(() => {
    setTemplate(getScheduleTemplate());
    setSubjects(getCustomSubjects());
    setSettings(getAppSettings());
    setDayLog(initializeToday());
  }, []);

  // Recalculate recommendations when subjects change
  useEffect(() => {
    if (subjects.length === 0) return;

    const history = getHistory(10);
    const counts: Record<string, number> = {};
    subjects.forEach(s => counts[s.id] = 0);

    history.forEach(day => {
      if (day.selectedSubjects.main1) counts[day.selectedSubjects.main1] = (counts[day.selectedSubjects.main1] || 0) + 1;
      if (day.selectedSubjects.main2) counts[day.selectedSubjects.main2] = (counts[day.selectedSubjects.main2] || 0) + 1;
      if (day.selectedSubjects.light) counts[day.selectedSubjects.light] = (counts[day.selectedSubjects.light] || 0) + 0.5;
    });

    const currentSelection = [dayLog.selectedSubjects.main1, dayLog.selectedSubjects.main2, dayLog.selectedSubjects.light];

    const ranked = subjects
      .filter(s => !currentSelection.includes(s.id))
      .map(s => {
        let score = counts[s.id] || 0;
        if (s.priority === 'High') score -= 2;
        return { subject: s, count: counts[s.id] || 0, score };
      })
      .sort((a, b) => a.score - b.score);

    setRecommendations(ranked.slice(0, 4));
  }, [subjects, dayLog]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveAppSettings(newSettings);
    refreshApp();
  };

  const handleSaveTemplateBlock = (id: string, updates: Partial<ScheduleBlock>) => {
    const newTemplate = template.map(b => b.id === id ? { ...b, ...updates } : b);
    newTemplate.sort((a, b) => a.startTime.localeCompare(b.startTime));
    setTemplate(newTemplate);
    saveScheduleTemplate(newTemplate);
  };

  const handleStrategySelect = (slot: 'main1' | 'main2' | 'light', subjectId: string) => {
    const newLog = { ...dayLog };
    newLog.selectedSubjects[slot] = subjectId === newLog.selectedSubjects[slot] ? null : subjectId;
    setDayLog(newLog);
    saveLog(newLog.date, newLog);
    refreshApp();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl animate-in slide-in-from-right duration-300 overflow-y-auto">
      {editingBlockId && (
        <EditBlockModal
          block={template.find(b => b.id === editingBlockId)!}
          onSave={handleSaveTemplateBlock}
          onClose={() => setEditingBlockId(null)}
        />
      )}

      <div className="max-w-md mx-auto min-h-full p-6 pb-24">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => { haptic.light(); onClose(); }} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-500 hover:text-black dark:hover:text-white transition-colors active-scale">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">Settings</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">System Control Center</p>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl mb-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'APPEARANCE', icon: Palette, label: 'Look' },
            { id: 'STRATEGY', icon: Target, label: 'Strategy' },
            { id: 'SUBJECTS', icon: Layout, label: 'Subs' },
            { id: 'SCHEDULE', icon: Calendar, label: 'Plan' },
            { id: 'DATA', icon: AlertOctagon, label: 'Data' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { haptic.light(); setActiveTab(tab.id as any); }}
              className={`flex-1 min-w-[60px] py-3 flex flex-col items-center gap-1 rounded-lg transition-all active-scale
                ${activeTab === tab.id ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-400'}`}
            >
              <tab.icon size={16} />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* --- TAB CONTENT --- */}
        {activeTab === 'APPEARANCE' && <AppearanceTab settings={settings} handleSaveSettings={handleSaveSettings} />}
        {activeTab === 'STRATEGY' && (
          <StrategyTab
            settings={settings}
            handleSaveSettings={handleSaveSettings}
            subjects={subjects}
            recommendations={recommendations}
            dayLog={dayLog}
            handleStrategySelect={handleStrategySelect}
          />
        )}
        {activeTab === 'SUBJECTS' && <SubjectsTab subjects={subjects} setSubjects={setSubjects} />}
        {activeTab === 'SCHEDULE' && <ScheduleTab template={template} setEditingBlockId={setEditingBlockId} />}
        {activeTab === 'DATA' && <DataTab />}
      </div>
    </div>
  );
};

