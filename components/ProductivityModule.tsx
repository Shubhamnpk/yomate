
import React, { useEffect, useMemo, useState } from 'react';
import { ProductivityEntry } from '../types';
import { useProductivity } from '../hooks/useProductivity';
import { CheckCircle2, ChevronDown, Flame, LineChart, Lock, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { getGoalCompletionStats, getLocalDateString, getNonEmptyItemCount, getNowTime, getProsConsScore, getTotalProductivityScore, PRODUCTIVITY_SCHEMA_VERSION, PRODUCTIVITY_SCORING_VERSION } from '../services/productivityService';
import { getAppSettings, saveAppSettings } from '../services/storageService';
import { ClickToggleItem } from './ui/click-toggle-item';

interface GoalItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Props {
  initialDate?: string;
  initialMainFocus?: string;
  initialMood?: number;
  initialCompletedRituals?: string[];
  onCompletedRitualsChange?: (completed: string[]) => void;
}

const toGoalItems = (items: string[], prefix: string, completedTexts: string[] = []): GoalItem[] =>
  items.map((text, index) => ({ id: `${prefix}-${index + 1}`, text, completed: completedTexts.includes(text) }));

const getGoalTemplates = (completedRituals: string[] = []) => {
  const settings = getAppSettings();
  const baseDaily = settings.productivityDailyGoals || [];
  const rituals = settings.rituals || [];
  return {
    monthlyGoals: toGoalItems(settings.productivityMonthlyGoals || [], 'm'),
    dailyGoals: [
      ...toGoalItems(baseDaily, 'd'),
      ...toGoalItems(rituals, 'r', completedRituals).filter((goal) => !baseDaily.includes(goal.text)),
    ],
  };
};

const createEmptyForm = (initialDate?: string, initialMainFocus?: string, initialMood?: number, initialCompletedRituals: string[] = []) => ({
  date: initialDate || getLocalDateString(),
  time: getNowTime(),
  mainFocus: initialMainFocus || '',
  location: '',
  mood: initialMood ? String(initialMood) : '',
  ...getGoalTemplates(initialCompletedRituals),
  learnings: '',
  pros: [''],
  cons: [''],
  gratitude: [''],
  finalThoughts: '',
  learningScore: 0,
  gratitudeScore: 0,
});

const scoreBand = (score: number) => {
  if (score >= 4) return 'Outstanding day. Keep repeating this.';
  if (score >= 2) return 'Strong day. You are building momentum.';
  if (score >= 0) return 'Steady day. A few better closes will lift it.';
  if (score >= -2) return 'Tough day, but still recoverable tomorrow.';
  return 'Reset fully tomorrow and go simpler.';
};

const flattenEntrySearch = (entry: ProductivityEntry) => [
  entry.mainFocus,
  entry.location,
  entry.mood,
  entry.learnings,
  entry.finalThoughts,
  ...entry.pros,
  ...entry.cons,
  ...entry.gratitude,
  ...entry.monthlyGoals.map((goal) => goal.text),
  ...entry.dailyGoals.map((goal) => goal.text),
].join(' ').toLowerCase();

export const ProductivityModule: React.FC<Props> = ({
  initialDate,
  initialMainFocus,
  initialMood,
  initialCompletedRituals = [],
  onCompletedRitualsChange,
}) => {
  const { addEntry, entries, recentEntries, lastScore, lastScoreDate, streak, deleteEntry, isCooldownActive, latestSubmission } = useProductivity();
  const ritualNames = useMemo(() => new Set(getAppSettings().rituals || []), []);
  const [saved, setSaved] = useState(false);
  const [overrideMode, setOverrideMode] = useState(false);
  const [showTomorrowPrompt, setShowTomorrowPrompt] = useState(false);
  const [showTomorrowEditor, setShowTomorrowEditor] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'detected' | 'failed'>('idle');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'SCORE_DESC' | 'SCORE_ASC'>('NEWEST');
  const [scoreFilter, setScoreFilter] = useState<'ALL' | 'HIGH' | 'MID' | 'LOW'>('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [tomorrowGoals, setTomorrowGoals] = useState(() => {
    const settings = getAppSettings();
    return { monthlyGoals: [...(settings.productivityMonthlyGoals || [])], dailyGoals: [...(settings.productivityDailyGoals || [])] };
  });
  const [form, setForm] = useState(() => createEmptyForm(initialDate, initialMainFocus, initialMood, initialCompletedRituals));

  const cooldownActive = isCooldownActive && !overrideMode;
  const goalStats = useMemo(() => getGoalCompletionStats(form.monthlyGoals, form.dailyGoals), [form.monthlyGoals, form.dailyGoals]);
  const prosCount = useMemo(() => getNonEmptyItemCount(form.pros), [form.pros]);
  const consCount = useMemo(() => getNonEmptyItemCount(form.cons), [form.cons]);
  const prosConsScore = useMemo(() => getProsConsScore(form.pros, form.cons), [form.pros, form.cons]);
  const totalScore = useMemo(() => getTotalProductivityScore({
    goalsScore: goalStats.goalsScore,
    learningScore: form.learningScore,
    prosConsScore,
    gratitudeScore: form.gratitudeScore,
  }), [goalStats.goalsScore, form.learningScore, prosConsScore, form.gratitudeScore]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      dailyGoals: prev.dailyGoals.map((goal) => ({ ...goal, completed: ritualNames.has(goal.text) ? initialCompletedRituals.includes(goal.text) : goal.completed })),
    }));
  }, [initialCompletedRituals, ritualNames]);

  useEffect(() => {
    let isCancelled = false;
    const autofillLocation = async () => {
      if (form.location.trim()) return;
      setLocationStatus('loading');
      try {
        const response = await fetch('https://ipwho.is/', { method: 'GET', headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('location lookup failed');
        const data = await response.json();
        if (isCancelled || !data?.success) throw new Error('location lookup failed');
        const parts = [data.city, data.region, data.country].filter(Boolean);
        if (parts.length === 0) throw new Error('empty location');
        setForm((prev) => prev.location.trim() ? prev : { ...prev, location: parts.join(', ') });
        setLocationStatus('detected');
      } catch {
        if (!isCancelled) setLocationStatus('failed');
      }
    };
    autofillLocation();
    return () => { isCancelled = true; };
  }, []);

  const updateField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateListItem = (field: 'pros' | 'cons' | 'gratitude', index: number, value: string) => {
    const next = [...form[field]];
    next[index] = value;
    updateField(field, next);
  };

  const addListItem = (field: 'pros' | 'cons' | 'gratitude') => updateField(field, [...form[field], '']);
  const removeListItem = (field: 'pros' | 'cons' | 'gratitude', index: number) => updateField(field, form[field].length === 1 ? [''] : form[field].filter((_, i) => i !== index));

  const toggleGoal = (field: 'monthlyGoals' | 'dailyGoals', id: string) => {
    const nextGoals = form[field].map((goal) => goal.id === id ? { ...goal, completed: !goal.completed } : goal);
    updateField(field, nextGoals);
    if (field === 'dailyGoals' && onCompletedRitualsChange) {
      onCompletedRitualsChange(nextGoals.filter((goal) => goal.completed && ritualNames.has(goal.text)).map((goal) => goal.text));
    }
  };
  const saveEntry = () => {
    const entry: ProductivityEntry = {
      schemaVersion: PRODUCTIVITY_SCHEMA_VERSION,
      scoringVersion: PRODUCTIVITY_SCORING_VERSION,
      id: `${form.date}-${Date.now()}`,
      date: form.date,
      time: form.time,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mainFocus: form.mainFocus.trim(),
      activities: form.mainFocus.trim(),
      location: form.location.trim(),
      mood: form.mood.trim(),
      learnings: form.learnings.trim(),
      interests: form.learnings.trim(),
      pros: form.pros.map((item) => item.trim()).filter(Boolean),
      cons: form.cons.map((item) => item.trim()).filter(Boolean),
      gratitude: form.gratitude.map((item) => item.trim()).filter(Boolean),
      finalThoughts: form.finalThoughts.trim(),
      monthlyGoals: form.monthlyGoals,
      dailyGoals: form.dailyGoals,
      goalCompletionPercent: goalStats.completionPercent,
      completedGoals: goalStats.completedGoals,
      totalGoals: goalStats.totalGoals,
      goalsScore: goalStats.goalsScore,
      learningScore: form.learningScore,
      prosConsScore,
      gratitudeScore: form.gratitudeScore,
      totalScore,
      overrideUsed: overrideMode,
    };
    addEntry(entry);
    setSaved(true);
    setOverrideMode(false);
    setShowTomorrowPrompt(true);
    setExpandedEntryId(entry.id);
  };

  const resetForm = () => {
    setForm(createEmptyForm(getLocalDateString(), initialMainFocus, initialMood, initialCompletedRituals));
    setSaved(false);
    setShowTomorrowPrompt(false);
    setShowTomorrowEditor(false);
    const settings = getAppSettings();
    setTomorrowGoals({ monthlyGoals: [...(settings.productivityMonthlyGoals || [])], dailyGoals: [...(settings.productivityDailyGoals || [])] });
  };

  const updateTomorrowGoal = (type: 'monthlyGoals' | 'dailyGoals', index: number, value: string) => {
    setTomorrowGoals((prev) => {
      const next = [...prev[type]];
      next[index] = value;
      return { ...prev, [type]: next };
    });
  };

  const addTomorrowGoal = (type: 'monthlyGoals' | 'dailyGoals') => setTomorrowGoals((prev) => ({ ...prev, [type]: [...prev[type], ''] }));
  const removeTomorrowGoal = (type: 'monthlyGoals' | 'dailyGoals', index: number) => setTomorrowGoals((prev) => {
    const next = prev[type].filter((_, i) => i !== index);
    return { ...prev, [type]: next.length > 0 ? next : [''] };
  });

  const saveTomorrowGoals = () => {
    const settings = getAppSettings();
    saveAppSettings({
      ...settings,
      productivityMonthlyGoals: tomorrowGoals.monthlyGoals.map((item) => item.trim()).filter(Boolean),
      productivityDailyGoals: tomorrowGoals.dailyGoals.map((item) => item.trim()).filter(Boolean),
    });
    setShowTomorrowEditor(false);
    setShowTomorrowPrompt(false);
  };

  const filteredEntries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const base = entries.filter((entry) => {
      if (query && !flattenEntrySearch(entry).includes(query)) return false;
      if (fromDate && entry.date < fromDate) return false;
      if (toDate && entry.date > toDate) return false;
      if (scoreFilter === 'HIGH' && entry.totalScore < 2) return false;
      if (scoreFilter === 'MID' && (entry.totalScore < -1 || entry.totalScore >= 2)) return false;
      if (scoreFilter === 'LOW' && entry.totalScore >= -1) return false;
      return true;
    });
    return [...base].sort((a, b) => {
      if (sortBy === 'OLDEST') return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
      if (sortBy === 'SCORE_DESC') return b.totalScore - a.totalScore;
      if (sortBy === 'SCORE_ASC') return a.totalScore - b.totalScore;
      return `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`);
    });
  }, [entries, fromDate, scoreFilter, searchTerm, sortBy, toDate]);

  const lastSubmissionLabel = latestSubmission ? `${latestSubmission.date} at ${latestSubmission.time}` : 'No entry yet';

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">Productivity Journal</p>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Daily reflection tracker</h2>
            <p className="text-sm text-zinc-500 mt-1">Every entry now keeps the full reflection, goal states, and searchable history in local storage.</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-zinc-900 dark:text-white">{totalScore.toFixed(2)}</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Current score</div>
          </div>
        </div>

        {cooldownActive ? (
          <div className="rounded-3xl border border-amber-500/25 bg-amber-500/10 p-5 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/25"><Lock size={18} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">Daily cooldown active</p>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">Today's form is closed until after 12:00 AM.</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">Last submission: {lastSubmissionLabel}. You can still override it if you need a correction or extra entry.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setOverrideMode(true)} className="rounded-2xl bg-amber-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-amber-500 transition-colors">Override For Today</button>
              <button type="button" onClick={resetForm} className="rounded-2xl border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Prep Another Entry</button>
            </div>
          </div>
        ) : (
          <>
            {overrideMode && <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">Override mode is enabled for today. This extra entry will still be saved, but it will be marked as a manual override.</div>}
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm"><span className="text-zinc-600 dark:text-zinc-400">Date</span><input type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none" /></label>
              <label className="space-y-1 text-sm"><span className="text-zinc-600 dark:text-zinc-400">Time</span><input type="time" value={form.time} onChange={(e) => updateField('time', e.target.value)} className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none" /></label>
              <label className="col-span-2 space-y-1 text-sm"><span className="text-zinc-600 dark:text-zinc-400">Main Focus</span><input type="text" value={form.mainFocus} onChange={(e) => updateField('mainFocus', e.target.value)} placeholder="What mattered most today?" className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none" /></label>
              <label className="space-y-1 text-sm"><span className="text-zinc-600 dark:text-zinc-400">Location</span><input type="text" value={form.location} onChange={(e) => updateField('location', e.target.value)} placeholder="Where were you?" className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none" /><span className="block text-[10px] text-zinc-500">{locationStatus === 'loading' && 'Detecting from mobile IP...'}{locationStatus === 'detected' && 'Auto-filled from your IP location'}{locationStatus === 'failed' && 'Could not auto-detect location'}</span></label>
              <label className="space-y-1 text-sm"><span className="text-zinc-600 dark:text-zinc-400">Mood</span><input type="text" value={form.mood} onChange={(e) => updateField('mood', e.target.value)} placeholder="How did the day feel?" className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none" /></label>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center justify-between gap-3 mb-3"><h3 className="font-semibold text-zinc-900 dark:text-white">Goals Progress</h3><span className="text-sm font-bold text-zinc-500">{goalStats.completionPercent}%</span></div>
                <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 px-4 py-3 mb-4"><div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mt-3"><div className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500" style={{ width: `${goalStats.completionPercent}%` }} /></div><div className="flex items-center justify-between mt-2 text-xs text-zinc-500"><span>{goalStats.completedGoals}/{goalStats.totalGoals} done</span><span>{goalStats.goalsScore}</span></div></div>
                <div className="grid grid-cols-1 gap-4 text-sm"><div><p className="mb-2 font-medium text-zinc-700 dark:text-zinc-300">Monthly goals</p><div className="space-y-2">{form.monthlyGoals.map((goal) => <ClickToggleItem key={goal.id} label={goal.text} checked={goal.completed} onToggle={() => toggleGoal('monthlyGoals', goal.id)} />)}</div></div><div><p className="mb-2 font-medium text-zinc-700 dark:text-zinc-300">Daily goals</p><div className="space-y-2">{form.dailyGoals.map((goal) => <ClickToggleItem key={goal.id} label={goal.text} checked={goal.completed} onToggle={() => toggleGoal('dailyGoals', goal.id)} />)}</div></div></div>
              </div>

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4"><div className="flex items-center justify-between gap-3 mb-3"><h3 className="font-semibold text-zinc-900 dark:text-white">Learning & Growth</h3><span className="text-sm font-bold text-zinc-500">{form.learningScore}</span></div><input type="range" min="-5" max="5" step="1" value={form.learningScore} onChange={(e) => updateField('learningScore', Number(e.target.value))} className="w-full accent-primary-500" /><textarea rows={3} value={form.learnings} onChange={(e) => updateField('learnings', e.target.value)} placeholder="What did you learn today?" className="mt-3 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none resize-none" /></div>

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4"><div className="flex items-center justify-between gap-3 mb-3"><div><h3 className="font-semibold text-zinc-900 dark:text-white">Pros & Cons</h3><p className="text-xs text-zinc-500 mt-1">{prosCount} pros, {consCount} cons</p></div><span className="text-sm font-bold text-zinc-500">{prosConsScore > 0 ? `+${prosConsScore}` : prosConsScore}</span></div><div className="rounded-xl bg-zinc-100 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300">{prosCount === consCount ? 'Balanced day.' : prosCount > consCount ? 'More pros than cons.' : 'More cons than pros.'}</div><div className="grid grid-cols-1 gap-4 mt-4"><div className="space-y-2"><p className="font-medium text-emerald-600">Pros</p>{form.pros.map((item, index) => <div key={`pro-${index}`} className="flex gap-2"><input type="text" value={item} onChange={(e) => updateListItem('pros', index, e.target.value)} placeholder={`Pro ${index + 1}`} className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none" /><button type="button" onClick={() => removeListItem('pros', index)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3"><Trash2 size={14} /></button></div>)}<button type="button" onClick={() => addListItem('pros')} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300"><Plus size={14} /> Add pro</button></div><div className="space-y-2"><p className="font-medium text-rose-600">Cons</p>{form.cons.map((item, index) => <div key={`con-${index}`} className="flex gap-2"><input type="text" value={item} onChange={(e) => updateListItem('cons', index, e.target.value)} placeholder={`Con ${index + 1}`} className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none" /><button type="button" onClick={() => removeListItem('cons', index)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3"><Trash2 size={14} /></button></div>)}<button type="button" onClick={() => addListItem('cons')} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300"><Plus size={14} /> Add con</button></div></div></div>

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4"><div className="flex items-center justify-between gap-3 mb-3"><h3 className="font-semibold text-zinc-900 dark:text-white">Gratitude</h3><span className="text-sm font-bold text-zinc-500">{form.gratitudeScore}</span></div><input type="range" min="-5" max="5" step="1" value={form.gratitudeScore} onChange={(e) => updateField('gratitudeScore', Number(e.target.value))} className="w-full accent-primary-500" /><div className="space-y-2 mt-4">{form.gratitude.map((item, index) => <div key={`gratitude-${index}`} className="flex gap-2"><input type="text" value={item} onChange={(e) => updateListItem('gratitude', index, e.target.value)} placeholder="What are you grateful for?" className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none" /><button type="button" onClick={() => removeListItem('gratitude', index)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3"><Trash2 size={14} /></button></div>)}<button type="button" onClick={() => addListItem('gratitude')} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300"><Plus size={14} /> Add gratitude</button></div></div>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3"><label className="space-y-1 text-sm block"><span className="text-zinc-600 dark:text-zinc-400">Final thoughts</span><textarea rows={2} value={form.finalThoughts} onChange={(e) => updateField('finalThoughts', e.target.value)} placeholder="Sum up the day in a few lines." className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none resize-none" /></label><div className="rounded-2xl bg-primary-500/8 border border-primary-500/15 p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-zinc-500">Productivity score</p><h3 className="text-3xl font-black text-zinc-900 dark:text-white">{totalScore.toFixed(2)}</h3></div><p className="max-w-[220px] text-sm text-zinc-600 dark:text-zinc-300 text-right">{scoreBand(totalScore)}</p></div></div>{!saved ? <button type="button" onClick={saveEntry} className="w-full rounded-2xl bg-primary-600 text-white font-bold py-3.5 hover:bg-primary-700 transition-colors">Save Productivity Entry</button> : <div className="space-y-3"><div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2"><CheckCircle2 size={16} />Entry saved. Your history, streak, and daily goals are updated.</div>{showTomorrowPrompt && !showTomorrowEditor && <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-4 space-y-3 bg-white dark:bg-black/20"><p className="text-sm font-semibold text-zinc-900 dark:text-white">Do you want to change the daily goals for tomorrow?</p><p className="text-xs text-zinc-500">You can keep them as they are or update them before tomorrow starts.</p><div className="flex gap-2"><button type="button" onClick={() => setShowTomorrowPrompt(false)} className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 py-2.5 text-sm font-semibold">No</button><button type="button" onClick={() => setShowTomorrowEditor(true)} className="flex-1 rounded-xl bg-primary-600 text-white py-2.5 text-sm font-semibold">Yes</button></div></div>}{showTomorrowEditor && <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-4 space-y-4 bg-white dark:bg-black/20"><div><p className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Tomorrow monthly goals</p><div className="space-y-2">{tomorrowGoals.monthlyGoals.map((goal, index) => <div key={`tm-${index}`} className="flex gap-2"><input type="text" value={goal} onChange={(e) => updateTomorrowGoal('monthlyGoals', index, e.target.value)} className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none" /><button type="button" onClick={() => removeTomorrowGoal('monthlyGoals', index)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3"><Trash2 size={14} /></button></div>)}</div><button type="button" onClick={() => addTomorrowGoal('monthlyGoals')} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 mt-2"><Plus size={14} /> Add monthly goal</button></div><div><p className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Tomorrow daily goals</p><div className="space-y-2">{tomorrowGoals.dailyGoals.map((goal, index) => <div key={`td-${index}`} className="flex gap-2"><input type="text" value={goal} onChange={(e) => updateTomorrowGoal('dailyGoals', index, e.target.value)} className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none" /><button type="button" onClick={() => removeTomorrowGoal('dailyGoals', index)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3"><Trash2 size={14} /></button></div>)}</div><button type="button" onClick={() => addTomorrowGoal('dailyGoals')} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 mt-2"><Plus size={14} /> Add daily goal</button></div><div className="flex gap-2"><button type="button" onClick={() => setShowTomorrowEditor(false)} className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 py-2.5 text-sm font-semibold">Cancel</button><button type="button" onClick={saveTomorrowGoals} className="flex-1 rounded-xl bg-primary-600 text-white py-2.5 text-sm font-semibold">Save Tomorrow Goals</button></div></div>}<button type="button" onClick={resetForm} className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 font-semibold py-3">Prepare Another Entry</button></div>}</div>
          </>
        )}
      </section>
      <section className="grid grid-cols-3 gap-3"><div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4"><p className="text-[10px] uppercase tracking-widest text-zinc-500">Last score</p><div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{lastScore !== null ? lastScore.toFixed(2) : '--'}</div><p className="text-xs text-zinc-500 mt-1">{lastScoreDate || 'No entry yet'}</p></div><div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4"><p className="text-[10px] uppercase tracking-widest text-zinc-500">Productivity streak</p><div className="flex items-center gap-2 mt-1"><Flame size={18} className="text-orange-500" /><span className="text-2xl font-bold text-zinc-900 dark:text-white">{streak}</span></div><p className="text-xs text-zinc-500 mt-1">Consecutive days with entries</p></div><div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4"><p className="text-[10px] uppercase tracking-widest text-zinc-500">Entries</p><div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{entries.length}</div><p className="text-xs text-zinc-500 mt-1">Saved in local storage</p></div></section>
      <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5"><div className="flex items-center gap-2 mb-4"><LineChart size={16} className="text-primary-500" /><h3 className="text-lg font-bold text-zinc-900 dark:text-white">Recent history</h3></div><div className="grid grid-cols-7 gap-2 items-end h-24 mb-5">{recentEntries.length > 0 ? recentEntries.map((entry) => { const normalized = ((entry.totalScore + 5) / 10) * 100; return <div key={entry.id} className="flex flex-col items-center justify-end gap-2 h-full"><div className="w-full h-full rounded-xl bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex items-end"><div className="w-full rounded-xl bg-gradient-to-t from-primary-500 to-emerald-400" style={{ height: `${Math.max(normalized, 8)}%` }} /></div><span className="text-[10px] font-mono text-zinc-500">{entry.date.slice(8)}</span></div>; }) : <div className="col-span-7 h-full rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-sm text-zinc-500">Save entries to start the chart</div>}</div><div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 mb-4 space-y-3"><div className="flex flex-col md:flex-row md:items-center gap-3"><label className="flex-1 flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/20 px-3 py-2.5"><Search size={16} className="text-zinc-500" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search focus, notes, rituals, gratitude..." className="w-full bg-transparent outline-none text-sm text-zinc-900 dark:text-white" /></label><button type="button" onClick={() => setShowFilters((prev) => !prev)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-200"><SlidersHorizontal size={14} /> Filters</button></div>{showFilters && <div className="grid grid-cols-1 md:grid-cols-4 gap-3 animate-in fade-in duration-300"><label className="space-y-1 text-xs text-zinc-500"><span>Sort</span><select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/20 px-3 py-2.5 text-sm text-zinc-900 dark:text-white outline-none"><option value="NEWEST">Newest first</option><option value="OLDEST">Oldest first</option><option value="SCORE_DESC">Highest score</option><option value="SCORE_ASC">Lowest score</option></select></label><label className="space-y-1 text-xs text-zinc-500"><span>Score band</span><select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value as typeof scoreFilter)} className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/20 px-3 py-2.5 text-sm text-zinc-900 dark:text-white outline-none"><option value="ALL">All scores</option><option value="HIGH">High (2 to 5)</option><option value="MID">Mid (-1 to 2)</option><option value="LOW">Low (&lt; -1)</option></select></label><label className="space-y-1 text-xs text-zinc-500"><span>From</span><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/20 px-3 py-2.5 text-sm text-zinc-900 dark:text-white outline-none" /></label><label className="space-y-1 text-xs text-zinc-500"><span>To</span><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/20 px-3 py-2.5 text-sm text-zinc-900 dark:text-white outline-none" /></label></div>}</div><div className="space-y-2">{filteredEntries.length > 0 ? filteredEntries.map((entry) => { const isExpanded = expandedEntryId === entry.id; return <div key={entry.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"><button type="button" onClick={() => setExpandedEntryId((prev) => prev === entry.id ? null : entry.id)} className="w-full px-4 py-4 flex items-center justify-between gap-4 bg-white dark:bg-zinc-900/30 text-left"><div className="min-w-0"><p className="font-semibold text-zinc-900 dark:text-white truncate">{entry.mainFocus || 'No main focus saved'}</p><p className="text-xs text-zinc-500 mt-1">{entry.date} • {entry.time} • score {entry.totalScore.toFixed(2)}</p></div><div className="flex items-center gap-3 shrink-0">{entry.overrideUsed && <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300">Override</span>}<button type="button" onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }} className="text-zinc-500 hover:text-rose-500"><Trash2 size={14} /></button><ChevronDown size={16} className={`text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></div></button>{isExpanded && <div className="px-4 pb-4 bg-zinc-50 dark:bg-zinc-950/40 border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-300 space-y-4"><div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4 text-sm"><div className="rounded-xl bg-white dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800"><p className="text-[10px] uppercase tracking-widest text-zinc-500">Location</p><p className="mt-1 text-zinc-900 dark:text-white">{entry.location || '-'}</p></div><div className="rounded-xl bg-white dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800"><p className="text-[10px] uppercase tracking-widest text-zinc-500">Mood</p><p className="mt-1 text-zinc-900 dark:text-white">{entry.mood || '-'}</p></div><div className="rounded-xl bg-white dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800"><p className="text-[10px] uppercase tracking-widest text-zinc-500">Goals</p><p className="mt-1 text-zinc-900 dark:text-white">{entry.completedGoals}/{entry.totalGoals} ({entry.goalCompletionPercent}%)</p></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"><div className="space-y-2"><h4 className="font-semibold text-zinc-900 dark:text-white">Learning</h4><p className="text-zinc-600 dark:text-zinc-300">{entry.learnings || 'No learning notes saved.'}</p></div><div className="space-y-2"><h4 className="font-semibold text-zinc-900 dark:text-white">Final thoughts</h4><p className="text-zinc-600 dark:text-zinc-300">{entry.finalThoughts || 'No final thoughts saved.'}</p></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"><div><h4 className="font-semibold text-emerald-600 mb-2">Pros</h4><div className="space-y-1">{entry.pros.length > 0 ? entry.pros.map((item, index) => <p key={`${entry.id}-pro-${index}`} className="text-zinc-600 dark:text-zinc-300">- {item}</p>) : <p className="text-zinc-500">No pros saved.</p>}</div></div><div><h4 className="font-semibold text-rose-600 mb-2">Cons</h4><div className="space-y-1">{entry.cons.length > 0 ? entry.cons.map((item, index) => <p key={`${entry.id}-con-${index}`} className="text-zinc-600 dark:text-zinc-300">- {item}</p>) : <p className="text-zinc-500">No cons saved.</p>}</div></div><div><h4 className="font-semibold text-amber-600 mb-2">Gratitude</h4><div className="space-y-1">{entry.gratitude.length > 0 ? entry.gratitude.map((item, index) => <p key={`${entry.id}-gratitude-${index}`} className="text-zinc-600 dark:text-zinc-300">- {item}</p>) : <p className="text-zinc-500">No gratitude saved.</p>}</div></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"><div><h4 className="font-semibold text-zinc-900 dark:text-white mb-2">Monthly goals</h4><div className="space-y-1">{entry.monthlyGoals.map((goal) => <p key={goal.id} className={goal.completed ? 'text-emerald-600 dark:text-emerald-300' : 'text-zinc-500'}>{goal.completed ? 'done' : 'open'} {goal.text}</p>)}</div></div><div><h4 className="font-semibold text-zinc-900 dark:text-white mb-2">Daily goals</h4><div className="space-y-1">{entry.dailyGoals.map((goal) => <p key={goal.id} className={goal.completed ? 'text-emerald-600 dark:text-emerald-300' : 'text-zinc-500'}>{goal.completed ? 'done' : 'open'} {goal.text}</p>)}</div></div></div></div>}</div>; }) : <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 px-4 py-6 text-sm text-zinc-500 text-center">No productivity history matches the current search and filters.</div>}</div></section>
    </div>
  );
};
