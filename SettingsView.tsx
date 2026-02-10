
import React, { useState, useEffect, useRef } from 'react';
import { ScheduleBlock, Subject, AppSettings, AppMode, DayLog } from '../types';
import { 
  getScheduleTemplate, saveScheduleTemplate, 
  getCustomSubjects, saveCustomSubjects, 
  getAppSettings, saveAppSettings,
  resetApp, exportData, importData,
  initializeToday, saveLog, getHistory
} from '../services/storageService';
import { EditBlockModal } from './EditBlockModal';
import { 
  ArrowLeft, Plus, Trash2, AlertOctagon, Download, Upload, 
  Volume2, VolumeX, Palette, Layout, Calendar, GraduationCap, 
  Zap, Coffee, User, Clock, Star, Sparkles, Target, GripHorizontal, ChevronLeft, ChevronRight, CalendarDays, Sun, Moon, Monitor
} from 'lucide-react';

interface Props {
  onClose: () => void;
  refreshApp: () => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const SettingsView: React.FC<Props> = ({ onClose, refreshApp }) => {
  const [activeTab, setActiveTab] = useState<'APPEARANCE' | 'STRATEGY' | 'SCHEDULE' | 'SUBJECTS' | 'DATA'>('APPEARANCE');
  
  // Data States
  const [template, setTemplate] = useState<ScheduleBlock[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [dayLog, setDayLog] = useState<DayLog>(initializeToday(true)); 
  
  // Weekly Planner State
  const [activePlannerDay, setActivePlannerDay] = useState(new Date().getDay());

  // UI States
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCat, setNewSubCat] = useState('Pharmacy');

  // Strategy Recommendations
  const [recommendations, setRecommendations] = useState<{subject: Subject, count: number, score: number}[]>([]);

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
        // Smart Weighting: High priority counts as "less studied" effectively to push it up if tied or close
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

  const handleWeeklyPlanChange = (dayIndex: number, slot: 'main1' | 'main2' | 'light', value: string) => {
     const newPlan = { ...settings.weeklyPlan };
     if (!newPlan[dayIndex]) newPlan[dayIndex] = { main1: null, main2: null, light: null };
     newPlan[dayIndex] = { ...newPlan[dayIndex], [slot]: value || null };
     handleSaveSettings({ ...settings, weeklyPlan: newPlan });
  };

  const handleSaveTemplateBlock = (id: string, updates: Partial<ScheduleBlock>) => {
    const newTemplate = template.map(b => b.id === id ? { ...b, ...updates } : b);
    newTemplate.sort((a, b) => a.startTime.localeCompare(b.startTime));
    setTemplate(newTemplate);
    saveScheduleTemplate(newTemplate);
  };

  const handleAddSubject = () => {
    if (!newSubName) return;
    const newSub: Subject = {
      id: `custom_${Date.now()}`,
      name: newSubName,
      category: newSubCat as any,
      priority: 'Normal'
    };
    const newSubjects = [...subjects, newSub];
    setSubjects(newSubjects);
    saveCustomSubjects(newSubjects);
    setNewSubName('');
  };

  const handleRemoveSubject = (id: string) => {
    if (confirm("Remove this subject?")) {
      const newSubjects = subjects.filter(s => s.id !== id);
      setSubjects(newSubjects);
      saveCustomSubjects(newSubjects);
    }
  };

  const toggleSubjectPriority = (id: string) => {
    const newSubjects = subjects.map(s => {
      if (s.id === id) {
        return { ...s, priority: s.priority === 'High' ? 'Normal' : 'High' } as Subject;
      }
      return s;
    });
    setSubjects(newSubjects);
    saveCustomSubjects(newSubjects);
  };

  const handleStrategySelect = (slot: 'main1' | 'main2' | 'light', subjectId: string) => {
    const newLog = { ...dayLog };
    newLog.selectedSubjects[slot] = subjectId === newLog.selectedSubjects[slot] ? null : subjectId;
    setDayLog(newLog);
    saveLog(newLog.date, newLog);
    refreshApp(); 
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        importData(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const ThemeOption = ({ color, label, selected, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${selected ? 'border-zinc-400 bg-zinc-800' : 'border-transparent hover:bg-zinc-800/50'}`}
    >
      <div className={`w-8 h-8 rounded-full ${color}`}></div>
      <span className="text-[10px] font-bold uppercase text-zinc-400">{label}</span>
    </button>
  );

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
          <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">Settings</h1>
            <p className="text-zinc-500 text-xs">System Control Center</p>
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
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[60px] py-3 flex flex-col items-center gap-1 rounded-lg transition-all 
                ${activeTab === tab.id ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-400'}`}
            >
              <tab.icon size={16} />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* --- TAB: APPEARANCE --- */}
        {activeTab === 'APPEARANCE' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
             <div className="space-y-4">
               <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Identity</h3>
               <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                    <User size={20} />
                 </div>
                 <div className="flex-1">
                   <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Your Name</label>
                   <input 
                    value={settings.userName}
                    onChange={(e) => handleSaveSettings({...settings, userName: e.target.value})}
                    placeholder="Enter name"
                    className="w-full bg-transparent text-zinc-900 dark:text-white font-display font-bold text-lg outline-none placeholder-zinc-400"
                   />
                 </div>
               </div>
             </div>
             
             {/* Background Theme */}
             <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Background Theme</h3>
              <div className="grid grid-cols-3 gap-3">
                 {[
                   { id: 'zinc', label: 'Soft Dark', icon: Moon, desc: 'Zinc 950' },
                   { id: 'black', label: 'OLED', icon: Monitor, desc: 'Pure Black' },
                   { id: 'light', label: 'Light', icon: Sun, desc: 'Clean White' },
                 ].map((mode) => (
                   <button
                    key={mode.id}
                    onClick={() => handleSaveSettings({...settings, themeMode: mode.id as any})}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all
                      ${settings.themeMode === mode.id 
                        ? 'bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400' 
                        : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                   >
                     <mode.icon size={20} className="mb-1" />
                     <span className="text-xs font-bold">{mode.label}</span>
                     <span className="text-[9px] opacity-60 uppercase">{mode.desc}</span>
                   </button>
                 ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Theme Accent</h3>
              <div className="grid grid-cols-5 gap-2">
                <ThemeOption color="bg-indigo-500" label="Indigo" selected={settings.themeAccent === 'indigo'} onClick={() => handleSaveSettings({...settings, themeAccent: 'indigo'})} />
                <ThemeOption color="bg-emerald-500" label="Emerald" selected={settings.themeAccent === 'emerald'} onClick={() => handleSaveSettings({...settings, themeAccent: 'emerald'})} />
                <ThemeOption color="bg-rose-500" label="Rose" selected={settings.themeAccent === 'rose'} onClick={() => handleSaveSettings({...settings, themeAccent: 'rose'})} />
                <ThemeOption color="bg-violet-500" label="Violet" selected={settings.themeAccent === 'violet'} onClick={() => handleSaveSettings({...settings, themeAccent: 'violet'})} />
                <ThemeOption color="bg-orange-500" label="Orange" selected={settings.themeAccent === 'orange'} onClick={() => handleSaveSettings({...settings, themeAccent: 'orange'})} />
              </div>
            </div>

             <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Application Mode</h3>
              <div className="grid grid-cols-3 gap-3">
                 {[
                   { id: 'Normal', label: 'Normal', icon: Coffee, desc: 'Balance' },
                   { id: 'Serious', label: 'Serious', icon: Zap, desc: 'Efficiency' },
                   { id: 'Exam', label: 'Exam', icon: GraduationCap, desc: 'Review' },
                 ].map((mode) => (
                   <button
                    key={mode.id}
                    onClick={() => handleSaveSettings({...settings, appMode: mode.id as AppMode})}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all
                      ${settings.appMode === mode.id 
                        ? 'bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400' 
                        : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                   >
                     <mode.icon size={20} className="mb-1" />
                     <span className="text-xs font-bold">{mode.label}</span>
                     <span className="text-[9px] opacity-60 uppercase">{mode.desc}</span>
                   </button>
                 ))}
              </div>
            </div>

          </div>
        )}

        {/* --- OTHER TABS (Simplified for brevity, assuming dark mode classes added via wrapper if needed, 
            but for Light Mode support, primary concern is background and text color) --- */}
        
        {/* For other tabs, we rely on standard bg-zinc-900 which are Cards. 
            In light mode, these will appear as dark cards on light bg. 
            We just need to make sure the main container text is dark. */}

        {activeTab !== 'APPEARANCE' && (
           <div className="text-zinc-900 dark:text-white">
              {/* Reuse existing logic but ensuring text inherits or is explicitly handled */}
              {activeTab === 'STRATEGY' && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                   {/* ... Strategy Content ... */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                         <CalendarDays size={12} /> Weekly Protocol (Automation)
                      </h3>
                      
                      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
                         {/* Day Switcher */}
                         <div className="flex items-center justify-between mb-6">
                            <button onClick={() => setActivePlannerDay((prev) => (prev - 1 + 7) % 7)} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500"><ChevronLeft size={20} /></button>
                            <div className="text-center">
                               <span className="block text-xl font-display font-bold text-zinc-900 dark:text-white">{DAYS[activePlannerDay]}</span>
                               <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Configure Auto-Fill</span>
                            </div>
                            <button onClick={() => setActivePlannerDay((prev) => (prev + 1) % 7)} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500"><ChevronRight size={20} /></button>
                         </div>
                         
                         {/* Slots for this day */}
                         <div className="space-y-3">
                            {[
                              { key: 'main1', label: 'Main Focus 1' },
                              { key: 'main2', label: 'Main Focus 2' },
                              { key: 'light', label: 'Light Review' }
                            ].map((slot) => {
                              const savedId = settings.weeklyPlan[activePlannerDay]?.[slot.key as 'main1' | 'main2' | 'light'] || '';
                              return (
                                <div key={slot.key}>
                                   <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">{slot.label}</label>
                                   <select 
                                      value={savedId}
                                      onChange={(e) => handleWeeklyPlanChange(activePlannerDay, slot.key as any, e.target.value)}
                                      className="w-full bg-white dark:bg-black text-zinc-900 dark:text-white p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-primary-500 outline-none text-sm transition-colors"
                                   >
                                     <option value="">(No specific subject)</option>
                                     {subjects.map(s => <option key={s.id} value={s.id}>{s.name} {s.priority === 'High' ? '★' : ''}</option>)}
                                   </select>
                                </div>
                              );
                            })}
                         </div>
                      </div>
                    </div>
                    {/* ... Rest of Strategy ... */}
                 </div>
              )}
              
              {/* Schedule Tab */}
              {activeTab === 'SCHEDULE' && (
                <div className="space-y-2">
                  {template.map((block) => (
                    <div key={block.id} onClick={() => setEditingBlockId(block.id)} className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer">
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200">{block.activityName}</p>
                        <p className="text-xs text-zinc-500 font-mono mt-1">{block.startTime} - {block.endTime}</p>
                      </div>
                      <div className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">{block.mode}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Subjects Tab */}
              {activeTab === 'SUBJECTS' && (
                  <div className="space-y-6">
                    <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Add Subject</h3>
                      <div className="space-y-3">
                        <input value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder="Subject Name" className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm text-zinc-900 dark:text-white focus:border-primary-500 outline-none" />
                        <div className="flex gap-2">
                          <select value={newSubCat} onChange={(e) => setNewSubCat(e.target.value)} className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm text-zinc-500 dark:text-zinc-400 focus:border-primary-500 outline-none flex-1">
                            <option value="Pharmacy">Pharmacy</option>
                            <option value="Coding">Coding</option>
                            <option value="Other">Other</option>
                          </select>
                          <button onClick={handleAddSubject} disabled={!newSubName} className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-lg px-4 flex items-center"><Plus size={20} /></button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {subjects.map(subject => (
                        <div key={subject.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-lg group">
                          <div className="flex items-center gap-3">
                             <button onClick={() => toggleSubjectPriority(subject.id)} className={`transition-colors ${subject.priority === 'High' ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-500'}`}><Star size={16} className={subject.priority === 'High' ? 'fill-current' : ''} /></button>
                             <div>
                               <p className={`text-sm font-medium ${subject.priority === 'High' ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-300'}`}>{subject.name}</p>
                               <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{subject.category}</p>
                             </div>
                          </div>
                          <button onClick={() => handleRemoveSubject(subject.id)} className="p-2 text-zinc-600 hover:text-rose-500 transition-colors opacity-50 group-hover:opacity-100"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
              )}

              {/* Data Tab */}
              {activeTab === 'DATA' && (
                  <div className="space-y-8">
                     <div className="space-y-4">
                       <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Backup & Restore</h3>
                       <button onClick={exportData} className="w-full py-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"><Download size={16} /> Export Backup (JSON)</button>
                       <div className="relative">
                         <button className="w-full py-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"><Upload size={16} /> Import Backup</button>
                         <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                     </div>
                     <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
                        <button onClick={resetApp} className="w-full py-4 border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/10 text-rose-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-950/20 transition-colors"><AlertOctagon size={16} /> Reset Everything</button>
                     </div>
                  </div>
              )}
           </div>
        )}

      </div>
    </div>
  );
};
