
import React, { useState } from 'react';
import { CheckCircle2, Plus, X, CalendarDays, ChevronLeft, ChevronRight, Sparkles, Star, Clock, Flag, AlertOctagon, Milestone, Trash2 } from 'lucide-react';
import { AppSettings, Subject, DayLog, Deadline } from '../../types';
import { haptic } from '../../services/hapticService';

interface Props {
    settings: AppSettings;
    handleSaveSettings: (newSettings: AppSettings) => void;
    subjects: Subject[];
    recommendations: { subject: Subject, count: number, score: number }[];
    dayLog: DayLog;
    handleStrategySelect: (slot: 'main1' | 'main2' | 'light', subjectId: string) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const StrategyTab: React.FC<Props> = ({
    settings,
    handleSaveSettings,
    subjects,
    recommendations,
    dayLog,
    handleStrategySelect
}) => {
    const [newRitual, setNewRitual] = useState('');
    const [activePlannerDay, setActivePlannerDay] = useState(new Date().getDay());

    // Horizon State (Now part of Strategy)
    const [newDeadlineTitle, setNewDeadlineTitle] = useState('');
    const [newDeadlineDate, setNewDeadlineDate] = useState('');
    const [newDeadlineType, setNewDeadlineType] = useState<'Exam' | 'Assignment' | 'Project' | 'Other'>('Exam');

    const handleAddRitual = () => {
        if (!newRitual.trim()) return;
        if ((settings.rituals || []).length >= 5) {
            alert("Max 5 rituals allowed.");
            return;
        }
        const updatedRituals = [...(settings.rituals || []), newRitual.trim()];
        handleSaveSettings({ ...settings, rituals: updatedRituals });
        setNewRitual('');
    };

    const handleDeleteRitual = (index: number) => {
        const updatedRituals = [...(settings.rituals || [])];
        updatedRituals.splice(index, 1);
        handleSaveSettings({ ...settings, rituals: updatedRituals });
    };

    const handleWeeklyPlanChange = (dayIndex: number, slot: 'main1' | 'main2' | 'light', value: string) => {
        const newPlan = { ...settings.weeklyPlan };
        if (!newPlan[dayIndex]) newPlan[dayIndex] = { main1: null, main2: null, light: null };
        newPlan[dayIndex] = { ...newPlan[dayIndex], [slot]: value || null };
        handleSaveSettings({ ...settings, weeklyPlan: newPlan });
    };

    // Horizon Handlers
    const handleAddDeadline = () => {
        if (!newDeadlineTitle || !newDeadlineDate) return;
        const newDeadline: Deadline = {
            id: Date.now().toString(),
            title: newDeadlineTitle,
            date: newDeadlineDate,
            type: newDeadlineType
        };
        const updatedDeadlines = [...(settings.deadlines || []), newDeadline].sort((a, b) => a.date.localeCompare(b.date));
        handleSaveSettings({ ...settings, deadlines: updatedDeadlines });
        setNewDeadlineTitle('');
        setNewDeadlineDate('');
    };

    const handleDeleteDeadline = (id: string) => {
        const updatedDeadlines = settings.deadlines.filter(d => d.id !== id);
        handleSaveSettings({ ...settings, deadlines: updatedDeadlines });
    };

    return (
        <div className="text-zinc-900 dark:text-white space-y-8 animate-in fade-in slide-in-from-bottom-2">
            {/* HORIZON (Strategic Deadlines) */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Milestone size={12} /> Strategic Horizon
                </h3>
                <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-4">
                        <Flag size={16} className="text-primary-500" />
                        <span className="text-sm font-bold">Add Deadline</span>
                    </div>

                    <div className="space-y-3">
                        <input
                            value={newDeadlineTitle}
                            onChange={(e) => setNewDeadlineTitle(e.target.value)}
                            placeholder="Event Title (e.g. Pharmacology Final)"
                            className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:border-primary-500 outline-none"
                        />
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={newDeadlineDate}
                                onChange={(e) => setNewDeadlineDate(e.target.value)}
                                className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:border-primary-500 outline-none flex-1 text-zinc-500 dark:text-white"
                            />
                            <select
                                value={newDeadlineType}
                                onChange={(e) => setNewDeadlineType(e.target.value as any)}
                                className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm text-zinc-500 dark:text-zinc-400 focus:border-primary-500 outline-none w-32"
                            >
                                <option value="Exam">Exam</option>
                                <option value="Assignment">Assignment</option>
                                <option value="Project">Project</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <button
                            onClick={handleAddDeadline}
                            disabled={!newDeadlineTitle || !newDeadlineDate}
                            className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-lg py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Plus size={16} /> Add to Horizon
                        </button>
                    </div>

                    {/* List of upcoming deadlines */}
                    <div className="mt-4 space-y-2">
                        {(settings.deadlines || []).map(item => {
                            const daysLeft = Math.ceil((new Date(item.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-black/40 border border-zinc-200 dark:border-zinc-800/50 rounded-lg group">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${item.type === 'Exam' ? 'bg-rose-500/10 text-rose-500' :
                                            item.type === 'Assignment' ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-indigo-500/10 text-indigo-500'
                                            }`}>
                                            {item.type === 'Exam' ? <AlertOctagon size={16} /> : <Milestone size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{item.title}</p>
                                            <p className="text-[10px] text-zinc-500">{new Date(item.date).toLocaleDateString()} • {daysLeft} days left</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteDeadline(item.id)} className="p-2 text-zinc-400 hover:text-rose-500 transition-colors opacity-50 group-hover:opacity-100"><Trash2 size={16} /></button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* RITUALS */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={12} /> Daily Rituals
                </h3>
                <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
                    <div className="flex gap-2 mb-4">
                        <input
                            value={newRitual}
                            onChange={(e) => setNewRitual(e.target.value)}
                            placeholder="New Habit (e.g. Gym)"
                            className="flex-1 bg-white dark:bg-black text-sm p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 outline-none"
                        />
                        <button onClick={handleAddRitual} className="bg-primary-600 text-white p-3 rounded-lg"><Plus size={16} /></button>
                    </div>
                    <div className="space-y-2">
                        {(settings.rituals || []).map((r, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-black/40 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <span className="text-sm font-medium">{r}</span>
                                <button onClick={() => handleDeleteRitual(i)} className="text-zinc-400 hover:text-rose-500"><X size={14} /></button>
                            </div>
                        ))}
                        {(!settings.rituals || settings.rituals.length === 0) && (
                            <p className="text-xs text-zinc-500 text-center py-2">No daily rituals defined.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Weekly Planner */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <CalendarDays size={12} /> Weekly Protocol (Automation)
                </h3>

                <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => setActivePlannerDay((prev) => (prev - 1 + 7) % 7)} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500"><ChevronLeft size={20} /></button>
                        <div className="text-center">
                            <span className="block text-xl font-display font-bold text-zinc-900 dark:text-white">{DAYS[activePlannerDay]}</span>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Configure Auto-Fill</span>
                        </div>
                        <button onClick={() => setActivePlannerDay((prev) => (prev + 1) % 7)} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500"><ChevronRight size={20} /></button>
                    </div>

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

            <hr className="border-zinc-200 dark:border-zinc-800" />

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-zinc-900 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4 text-indigo-500 dark:text-indigo-400">
                    <Sparkles size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Smart Suggestions</h3>
                </div>

                {recommendations.length > 0 ? (
                    <div className="space-y-2">
                        {recommendations.map(({ subject, count }) => (
                            <div key={subject.id} className="flex items-center justify-between bg-white dark:bg-black/40 p-3 rounded-xl border border-zinc-100 dark:border-white/5">
                                <div className="flex items-center gap-3">
                                    {subject.priority === 'High' && <Star size={12} className="text-amber-400 fill-amber-400" />}
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{subject.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-zinc-500 uppercase">Studied {count}x recently</span>
                                    <button
                                        onClick={() => {
                                            if (!dayLog.selectedSubjects.main1) handleStrategySelect('main1', subject.id);
                                            else if (!dayLog.selectedSubjects.main2) handleStrategySelect('main2', subject.id);
                                            else if (!dayLog.selectedSubjects.light) handleStrategySelect('light', subject.id);
                                            else alert('Clear a slot below to add this.');
                                        }}
                                        className="p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-500 text-xs">No specific recommendations right now.</p>
                )}
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} /> Workflow
                </h3>
                <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Default Focus Duration</span>
                        <span className="font-mono text-primary-600 dark:text-primary-400">{settings.defaultFocusMinutes}m</span>
                    </div>
                    <input
                        type="range"
                        min="15" max="120" step="15"
                        value={settings.defaultFocusMinutes}
                        onChange={(e) => handleSaveSettings({ ...settings, defaultFocusMinutes: Number(e.target.value) })}
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                </div>
            </div>
        </div>
    );
};

