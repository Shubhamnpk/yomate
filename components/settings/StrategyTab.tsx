
import React, { useRef, useState } from 'react';
import { CheckCircle2, Plus, X, CalendarDays, ChevronLeft, ChevronRight, ChevronDown, Sparkles, Star, Clock, Flag, AlertOctagon, Milestone, Trash2, Upload, CalendarRange } from 'lucide-react';
import { AppSettings, Subject, DayLog, Deadline } from '../../types';
import { haptic } from '../../services/hapticService';
import { formatDateBySystem } from '../../services/dateDisplay';
import { getAppSettings, getHistory, importIcsCalendar } from '../../services/storageService';

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
    const [newMonthlyGoal, setNewMonthlyGoal] = useState('');
    const [newDailyGoal, setNewDailyGoal] = useState('');
    const [activePlannerDay, setActivePlannerDay] = useState(new Date().getDay());
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        horizon: false,
        rituals: false,
        productivityGoals: false,
        weeklyProtocol: false,
        weeklyTargets: false,
        suggestions: false,
        workflow: false,
    });

    // Horizon State (Now part of Strategy)
    const [newDeadlineTitle, setNewDeadlineTitle] = useState('');
    const [newDeadlineDate, setNewDeadlineDate] = useState('');
    const [newDeadlineType, setNewDeadlineType] = useState<'Exam' | 'Assignment' | 'Project' | 'Other'>('Exam');
    const [icsImportNotice, setIcsImportNotice] = useState<string>('');
    const [icsUrl, setIcsUrl] = useState('');
    const [icsText, setIcsText] = useState('');
    const [importingIcsUrl, setImportingIcsUrl] = useState(false);
    const icsFileRef = useRef<HTMLInputElement>(null);

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

    const handleAddProductivityGoal = (type: 'monthly' | 'daily') => {
        const raw = type === 'monthly' ? newMonthlyGoal : newDailyGoal;
        if (!raw.trim()) return;
        const key = type === 'monthly' ? 'productivityMonthlyGoals' : 'productivityDailyGoals';
        const updated = [...settings[key], raw.trim()];
        handleSaveSettings({ ...settings, [key]: updated });
        if (type === 'monthly') setNewMonthlyGoal('');
        else setNewDailyGoal('');
    };

    const handleDeleteProductivityGoal = (type: 'monthly' | 'daily', index: number) => {
        const key = type === 'monthly' ? 'productivityMonthlyGoals' : 'productivityDailyGoals';
        const updated = [...settings[key]];
        updated.splice(index, 1);
        handleSaveSettings({ ...settings, [key]: updated });
    };

    const handleWeeklyPlanChange = (dayIndex: number, slot: 'main1' | 'main2' | 'light', value: string) => {
        const newPlan = { ...settings.weeklyPlan };
        if (!newPlan[dayIndex]) newPlan[dayIndex] = { main1: null, main2: null, light: null };
        newPlan[dayIndex] = { ...newPlan[dayIndex], [slot]: value || null };
        handleSaveSettings({ ...settings, weeklyPlan: newPlan });
    };

    const handleAutoSuggestWeek = () => {
        if (subjects.length === 0) return;

        const usage14: Record<string, number> = {};
        const usage90: Record<string, number> = {};
        subjects.forEach(s => {
            usage14[s.id] = 0;
            usage90[s.id] = 0;
        });

        const countUsage = (days: number, bucket: Record<string, number>) => {
            getHistory(days).forEach(day => {
                const touched = new Set<string>();
                const { main1, main2, light } = day.selectedSubjects;
                if (main1) touched.add(main1);
                if (main2) touched.add(main2);
                if (light) touched.add(light);
                (day.additionalSubjects || []).forEach(id => touched.add(id));
                Object.entries(day.subjectMinutes || {}).forEach(([id, mins]) => {
                    if ((mins || 0) > 0) touched.add(id);
                });
                touched.forEach(id => {
                    bucket[id] = (bucket[id] || 0) + 1;
                });
            });
        };

        countUsage(14, usage14);
        countUsage(90, usage90);

        const weakFirst = [...subjects]
            .map(subject => {
                const recent14 = usage14[subject.id] || 0;
                const recent90 = usage90[subject.id] || 0;
                const weighted = (recent14 * 2) + (recent90 * 0.5);
                const priorityBoost = subject.priority === 'High' ? -2 : 0;
                return { subject, weighted: weighted + priorityBoost };
            })
            .sort((a, b) => a.weighted - b.weighted)
            .map(item => item.subject.id);

        const picks = weakFirst.slice(0, Math.min(4, weakFirst.length));
        if (picks.length === 0) return;

        const newPlan = { ...settings.weeklyPlan };
        for (let day = 0; day < 7; day++) {
            const main1 = picks[day % picks.length] || null;
            const main2 = picks.length > 1 ? picks[(day + 1) % picks.length] : null;
            const light = picks.length > 2 ? picks[(day + 2) % picks.length] : (picks[0] || null);
            newPlan[day] = { main1, main2, light };
        }
        handleSaveSettings({ ...settings, weeklyPlan: newPlan });
        haptic.success();
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

    const handleIcsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = String(event.target?.result || '');
                const result = importIcsCalendar(text);
                handleSaveSettings(getAppSettings());
                setIcsImportNotice(`Imported ${result.importedEvents} classes/events and ${result.importedDeadlines} deadlines.`);
                haptic.success();
            } catch (err) {
                setIcsImportNotice('Failed to import ICS. Please try a valid calendar export.');
                haptic.error();
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleIcsUrlImport = async () => {
        if (!icsUrl.trim()) return;
        setImportingIcsUrl(true);
        setIcsImportNotice('');
        try {
            const response = await fetch(icsUrl.trim(), {
                method: 'GET',
                headers: { Accept: 'text/calendar, text/plain, */*' },
            });
            if (!response.ok) {
                throw new Error(`Calendar URL failed (${response.status})`);
            }
            const text = await response.text();
            const result = importIcsCalendar(text);
            handleSaveSettings(getAppSettings());
            setIcsImportNotice(`Imported ${result.importedEvents} classes/events and ${result.importedDeadlines} deadlines from URL.`);
            haptic.success();
        } catch (err) {
            setIcsImportNotice('URL import failed. The calendar may block direct browser access. Download the .ics file and use the upload button instead.');
            haptic.error();
        } finally {
            setImportingIcsUrl(false);
        }
    };

    const handleIcsTextImport = () => {
        if (!icsText.trim()) return;
        try {
            const result = importIcsCalendar(icsText);
            handleSaveSettings(getAppSettings());
            setIcsImportNotice(`Imported ${result.importedEvents} classes/events and ${result.importedDeadlines} deadlines from pasted calendar text.`);
            haptic.success();
        } catch {
            setIcsImportNotice('Pasted calendar text is not a valid ICS feed.');
            haptic.error();
        }
    };

    const toggleSection = (key: keyof typeof openSections) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const sectionHeaderClass = "w-full flex items-center justify-between gap-3 text-left px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900";
    const sectionBodyClass = "mt-3";

    return (
        <div className="text-zinc-900 dark:text-white space-y-8 animate-in fade-in slide-in-from-bottom-2">
            {/* HORIZON (Strategic Deadlines) */}
            <div className="space-y-4">
                <button type="button" onClick={() => toggleSection('horizon')} className={sectionHeaderClass}>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Milestone size={12} /> Strategic Horizon
                    </span>
                    <ChevronDown size={16} className={`text-zinc-500 transition-transform ${openSections.horizon ? 'rotate-180' : ''}`} />
                </button>
                {openSections.horizon && <div className={`${sectionBodyClass} bg-zinc-100 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Flag size={16} className="text-primary-500" />
                        <span className="text-sm font-bold">Add Deadline</span>
                    </div>

                    <div className="mb-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-zinc-950 p-4">
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-300">
                                <CalendarRange size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-zinc-900 dark:text-white">Calendar Import</p>
                                <p className="text-[11px] text-zinc-500 mt-1">Import `.ics` files from Google Calendar, Apple Calendar, Outlook, or other calendar apps. Imported items appear on the timetable as fixed calendar events by date.</p>
                            </div>
                        </div>
                        <div className="relative mt-4">
                            <button
                                className="w-full bg-indigo-600/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 rounded-xl py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-indigo-600/20 transition-colors"
                            >
                                <Upload size={14} /> Import Calendar (.ics)
                            </button>
                            <input
                                ref={icsFileRef}
                                type="file"
                                accept=".ics,text/calendar"
                                onChange={handleIcsUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <div className="mt-3 space-y-2">
                            <input
                                value={icsUrl}
                                onChange={(e) => setIcsUrl(e.target.value)}
                                placeholder="Or paste a public .ics URL"
                                className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-sm outline-none focus:border-indigo-500"
                            />
                            <button
                                type="button"
                                onClick={handleIcsUrlImport}
                                disabled={!icsUrl.trim() || importingIcsUrl}
                                className="w-full rounded-xl bg-indigo-600 text-white py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-indigo-500 transition-colors"
                            >
                                {importingIcsUrl ? 'Importing URL...' : 'Import From URL'}
                            </button>
                        </div>
                        <div className="mt-4 space-y-2">
                            <textarea
                                rows={6}
                                value={icsText}
                                onChange={(e) => setIcsText(e.target.value)}
                                placeholder="If the URL is blocked, paste raw .ics text here"
                                className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-sm outline-none focus:border-indigo-500 resize-y"
                            />
                            <button
                                type="button"
                                onClick={handleIcsTextImport}
                                disabled={!icsText.trim()}
                                className="w-full rounded-xl border border-indigo-500/30 bg-indigo-600/10 text-indigo-600 dark:text-indigo-300 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-indigo-600/20 transition-colors"
                            >
                                Import Pasted Calendar Text
                            </button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            <span className="rounded-full bg-white dark:bg-zinc-900 px-2.5 py-1 border border-zinc-200 dark:border-zinc-800">Google Calendar export</span>
                            <span className="rounded-full bg-white dark:bg-zinc-900 px-2.5 py-1 border border-zinc-200 dark:border-zinc-800">Apple Calendar</span>
                            <span className="rounded-full bg-white dark:bg-zinc-900 px-2.5 py-1 border border-zinc-200 dark:border-zinc-800">Outlook</span>
                            <span className="rounded-full bg-white dark:bg-zinc-900 px-2.5 py-1 border border-zinc-200 dark:border-zinc-800">Other ICS apps</span>
                        </div>
                        {icsImportNotice && (
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-300 mt-3">{icsImportNotice}</p>
                        )}
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
                                            <p className="text-[10px] text-zinc-500">{formatDateBySystem(item.date, settings.dateSystem)} • {daysLeft} days left</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteDeadline(item.id)} className="p-2 text-zinc-400 hover:text-rose-500 transition-colors opacity-50 group-hover:opacity-100"><Trash2 size={16} /></button>
                                </div>
                            );
                        })}
                    </div>
                </div>}
            </div>

            {/* RITUALS */}
            <div className="space-y-4">
                <button type="button" onClick={() => toggleSection('rituals')} className={sectionHeaderClass}>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={12} /> Daily Rituals
                    </span>
                    <ChevronDown size={16} className={`text-zinc-500 transition-transform ${openSections.rituals ? 'rotate-180' : ''}`} />
                </button>
                {openSections.rituals && <div className={`${sectionBodyClass} bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4`}>
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
                </div>}
            </div>

            <div className="space-y-4">
                <button type="button" onClick={() => toggleSection('productivityGoals')} className={sectionHeaderClass}>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Flag size={12} /> Productivity Goals
                    </span>
                    <ChevronDown size={16} className={`text-zinc-500 transition-transform ${openSections.productivityGoals ? 'rotate-180' : ''}`} />
                </button>
                {openSections.productivityGoals && <div className={`${sectionBodyClass} bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-5`}>
                    <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Monthly Goals Template</p>
                        <div className="flex gap-2 mb-3">
                            <input
                                value={newMonthlyGoal}
                                onChange={(e) => setNewMonthlyGoal(e.target.value)}
                                placeholder="Add monthly goal"
                                className="flex-1 bg-white dark:bg-black text-sm p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 outline-none"
                            />
                            <button onClick={() => handleAddProductivityGoal('monthly')} className="bg-primary-600 text-white p-3 rounded-lg">
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {settings.productivityMonthlyGoals.map((goal, index) => (
                                <div key={`${goal}-${index}`} className="flex items-center justify-between p-3 bg-white dark:bg-black/40 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                    <span className="text-sm font-medium">{goal}</span>
                                    <button onClick={() => handleDeleteProductivityGoal('monthly', index)} className="text-zinc-400 hover:text-rose-500">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Daily Goals Template</p>
                        <div className="flex gap-2 mb-3">
                            <input
                                value={newDailyGoal}
                                onChange={(e) => setNewDailyGoal(e.target.value)}
                                placeholder="Add daily goal"
                                className="flex-1 bg-white dark:bg-black text-sm p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 outline-none"
                            />
                            <button onClick={() => handleAddProductivityGoal('daily')} className="bg-primary-600 text-white p-3 rounded-lg">
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {settings.productivityDailyGoals.map((goal, index) => (
                                <div key={`${goal}-${index}`} className="flex items-center justify-between p-3 bg-white dark:bg-black/40 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                    <span className="text-sm font-medium">{goal}</span>
                                    <button onClick={() => handleDeleteProductivityGoal('daily', index)} className="text-zinc-400 hover:text-rose-500">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>}
            </div>

            {/* Weekly Planner */}
            <div className="space-y-4">
                <button type="button" onClick={() => toggleSection('weeklyProtocol')} className={sectionHeaderClass}>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <CalendarDays size={12} /> Weekly Protocol (Automation)
                    </span>
                    <ChevronDown size={16} className={`text-zinc-500 transition-transform ${openSections.weeklyProtocol ? 'rotate-180' : ''}`} />
                </button>

                {openSections.weeklyProtocol && <div className={`${sectionBodyClass} bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4`}>
                    <button
                        onClick={handleAutoSuggestWeek}
                        className="w-full mb-4 py-2.5 rounded-xl bg-primary-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-primary-500 transition-colors active-scale"
                    >
                        Auto-Suggest Next Week
                    </button>
                    <div className="flex items-center justify-between mb-6">
                        <button title="Previous Day" onClick={() => setActivePlannerDay((prev) => (prev - 1 + 7) % 7)} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500"><ChevronLeft size={20} /></button>
                        <div className="text-center">
                            <span className="block text-xl font-display font-bold text-zinc-900 dark:text-white">{DAYS[activePlannerDay]}</span>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Configure Auto-Fill</span>
                        </div>
                        <button title="Next Day" onClick={() => setActivePlannerDay((prev) => (prev + 1) % 7)} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500"><ChevronRight size={20} /></button>
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
                                        title={savedId ? subjects.find(s => s.id === savedId)?.name : '(No subject)'}
                                        onChange={(e) => handleWeeklyPlanChange(activePlannerDay, slot.key as any, e.target.value)}
                                        className="w-full bg-white dark:bg-black text-zinc-900 dark:text-white p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-primary-500 outline-none text-sm transition-colors"
                                    >
                                        <option value="">(No specific subject)</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}{s.priority === 'High' ? ' (High)' : ''}</option>)}
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                </div>}
            </div>

            <div className="space-y-4">
                <button type="button" onClick={() => toggleSection('weeklyTargets')} className={sectionHeaderClass}>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Flag size={12} /> Weekly Targets
                    </span>
                    <ChevronDown size={16} className={`text-zinc-500 transition-transform ${openSections.weeklyTargets ? 'rotate-180' : ''}`} />
                </button>
                {openSections.weeklyTargets && <div className={`${sectionBodyClass} bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4`}>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Deep Work Hours</span>
                            <span className="font-mono text-primary-600 dark:text-primary-400">{settings.weeklyTargets.deepWorkHours}h</span>
                        </div>
                        <input
                            type="range"
                            min="4"
                            max="30"
                            step="1"
                            value={settings.weeklyTargets.deepWorkHours}
                            onChange={(e) => handleSaveSettings({
                                ...settings,
                                weeklyTargets: { ...settings.weeklyTargets, deepWorkHours: Number(e.target.value) }
                            })}
                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Zero-Violation Days</span>
                            <span className="font-mono text-primary-600 dark:text-primary-400">{settings.weeklyTargets.zeroViolationDays}d</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="7"
                            step="1"
                            value={settings.weeklyTargets.zeroViolationDays}
                            onChange={(e) => handleSaveSettings({
                                ...settings,
                                weeklyTargets: { ...settings.weeklyTargets, zeroViolationDays: Number(e.target.value) }
                            })}
                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Ritual Completion Days</span>
                            <span className="font-mono text-primary-600 dark:text-primary-400">{settings.weeklyTargets.ritualCompletionDays}d</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="7"
                            step="1"
                            value={settings.weeklyTargets.ritualCompletionDays}
                            onChange={(e) => handleSaveSettings({
                                ...settings,
                                weeklyTargets: { ...settings.weeklyTargets, ritualCompletionDays: Number(e.target.value) }
                            })}
                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        />
                    </div>
                </div>}
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800" />

            {/* Recommendations */}
            <div>
                <button type="button" onClick={() => toggleSection('suggestions')} className={sectionHeaderClass}>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={12} /> Smart Suggestions
                    </span>
                    <ChevronDown size={16} className={`text-zinc-500 transition-transform ${openSections.suggestions ? 'rotate-180' : ''}`} />
                </button>
                {openSections.suggestions && <div className={`${sectionBodyClass} bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-zinc-900 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl p-5`}>
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
                </div>}
            </div>

            <div className="space-y-4">
                <button type="button" onClick={() => toggleSection('workflow')} className={sectionHeaderClass}>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12} /> Workflow
                    </span>
                    <ChevronDown size={16} className={`text-zinc-500 transition-transform ${openSections.workflow ? 'rotate-180' : ''}`} />
                </button>
                {openSections.workflow && <div className={`${sectionBodyClass} bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4`}>
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
                </div>}
            </div>
        </div>
    );
};



