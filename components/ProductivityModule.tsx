import React, { useMemo, useState } from 'react';
import { ProductivityEntry } from '../types';
import { useProductivity } from '../hooks/useProductivity';
import { CheckCircle2, Flame, LineChart, Plus, Trash2 } from 'lucide-react';
import { getAppSettings, saveAppSettings } from '../services/storageService';

interface GoalItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Props {
  initialDate?: string;
  initialMainFocus?: string;
  initialMood?: number;
}

const getNowTime = () => new Date().toTimeString().slice(0, 5);

const toGoalItems = (items: string[], prefix: string): GoalItem[] =>
  items.map((text, index) => ({
    id: `${prefix}-${index + 1}`,
    text,
    completed: false,
  }));

const getGoalTemplates = () => {
  const settings = getAppSettings();
  return {
    monthlyGoals: toGoalItems(settings.productivityMonthlyGoals || [], 'm'),
    dailyGoals: toGoalItems(settings.productivityDailyGoals || [], 'd'),
  };
};

const createEmptyForm = (initialDate?: string, initialMainFocus?: string, initialMood?: number) => ({
  date: initialDate || new Date().toISOString().split('T')[0],
  time: getNowTime(),
  mainFocus: initialMainFocus || '',
  location: '',
  mood: initialMood ? String(initialMood) : '',
  ...getGoalTemplates(),
  learnings: '',
  pros: [''],
  cons: [''],
  gratitude: [''],
  finalThoughts: '',
  goalsScore: 0,
  learningScore: 0,
  prosConsScore: 0,
  gratitudeScore: 0,
});

const scoreBand = (score: number) => {
  if (score >= 4) return 'Outstanding day. Keep repeating this.';
  if (score >= 2) return 'Strong day. You are building momentum.';
  if (score >= 0) return 'Steady day. A few better closes will lift it.';
  if (score >= -2) return 'Tough day, but still recoverable tomorrow.';
  return 'Reset fully tomorrow and go simpler.';
};

const getGoalCompletionStats = (monthlyGoals: GoalItem[], dailyGoals: GoalItem[]) => {
  const allGoals = [...monthlyGoals, ...dailyGoals];
  const totalGoals = allGoals.length;
  const completedGoals = allGoals.filter((goal) => goal.completed).length;
  const completionRatio = totalGoals > 0 ? completedGoals / totalGoals : 0;
  const completionPercent = Math.round(completionRatio * 100);
  const goalsScore = Number((((completionRatio * 10) - 5)).toFixed(2));

  return {
    totalGoals,
    completedGoals,
    completionPercent,
    goalsScore,
  };
};

export const ProductivityModule: React.FC<Props> = ({
  initialDate,
  initialMainFocus,
  initialMood,
}) => {
  const { addEntry, entries, recentEntries, lastScore, lastScoreDate, streak, deleteEntry } = useProductivity();
  const [saved, setSaved] = useState(false);
  const [showTomorrowPrompt, setShowTomorrowPrompt] = useState(false);
  const [showTomorrowEditor, setShowTomorrowEditor] = useState(false);
  const [tomorrowGoals, setTomorrowGoals] = useState(() => {
    const settings = getAppSettings();
    return {
      monthlyGoals: [...(settings.productivityMonthlyGoals || [])],
      dailyGoals: [...(settings.productivityDailyGoals || [])],
    };
  });
  const [form, setForm] = useState(() => createEmptyForm(initialDate, initialMainFocus, initialMood));
  const goalStats = useMemo(
    () => getGoalCompletionStats(form.monthlyGoals, form.dailyGoals),
    [form.monthlyGoals, form.dailyGoals]
  );

  const totalScore = useMemo(() => {
    const total =
      (goalStats.goalsScore * 0.4) +
      (form.learningScore * 0.3) +
      (form.prosConsScore * 0.2) +
      (form.gratitudeScore * 0.1);
    return Number(total.toFixed(2));
  }, [goalStats.goalsScore, form.learningScore, form.prosConsScore, form.gratitudeScore]);

  const updateField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateListItem = (field: 'pros' | 'cons' | 'gratitude', index: number, value: string) => {
    const next = [...form[field]];
    next[index] = value;
    updateField(field, next);
  };

  const addListItem = (field: 'pros' | 'cons' | 'gratitude') => {
    updateField(field, [...form[field], '']);
  };

  const removeListItem = (field: 'pros' | 'cons' | 'gratitude', index: number) => {
    if (form[field].length === 1) {
      updateField(field, ['']);
      return;
    }
    updateField(field, form[field].filter((_, i) => i !== index));
  };

  const toggleGoal = (field: 'monthlyGoals' | 'dailyGoals', id: string) => {
    updateField(
      field,
      form[field].map((goal) => (
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      ))
    );
  };

  const saveEntry = () => {
    const entry: ProductivityEntry = {
      id: `${form.date}-${Date.now()}`,
      date: form.date,
      activities: form.mainFocus.trim(),
      interests: form.learnings.trim(),
      goalsScore: goalStats.goalsScore,
      learningScore: form.learningScore,
      prosConsScore: form.prosConsScore,
      totalScore,
    };

    addEntry(entry);
    setSaved(true);
    setShowTomorrowPrompt(true);
  };

  const resetForm = () => {
    setForm(createEmptyForm(initialDate, initialMainFocus, initialMood));
    setSaved(false);
    setShowTomorrowPrompt(false);
    setShowTomorrowEditor(false);
    const settings = getAppSettings();
    setTomorrowGoals({
      monthlyGoals: [...(settings.productivityMonthlyGoals || [])],
      dailyGoals: [...(settings.productivityDailyGoals || [])],
    });
  };

  const updateTomorrowGoal = (type: 'monthlyGoals' | 'dailyGoals', index: number, value: string) => {
    setTomorrowGoals((prev) => {
      const next = [...prev[type]];
      next[index] = value;
      return { ...prev, [type]: next };
    });
  };

  const addTomorrowGoal = (type: 'monthlyGoals' | 'dailyGoals') => {
    setTomorrowGoals((prev) => ({ ...prev, [type]: [...prev[type], ''] }));
  };

  const removeTomorrowGoal = (type: 'monthlyGoals' | 'dailyGoals', index: number) => {
    setTomorrowGoals((prev) => {
      const next = prev[type].filter((_, i) => i !== index);
      return { ...prev, [type]: next.length > 0 ? next : [''] };
    });
  };

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

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">Productivity Journal</p>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Daily reflection tracker</h2>
            <p className="text-sm text-zinc-500 mt-1">Score comes from goals, learning, pros and cons, and gratitude.</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-zinc-900 dark:text-white">{totalScore.toFixed(2)}</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Current score</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => updateField('date', e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Time</span>
            <input
              type="time"
              value={form.time}
              onChange={(e) => updateField('time', e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none"
            />
          </label>
          <label className="col-span-2 space-y-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Main Focus</span>
            <input
              type="text"
              value={form.mainFocus}
              onChange={(e) => updateField('mainFocus', e.target.value)}
              placeholder="What mattered most today?"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Location</span>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="Where were you?"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Mood</span>
            <input
              type="text"
              value={form.mood}
              onChange={(e) => updateField('mood', e.target.value)}
              placeholder="How did the day feel?"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Goals Progress</h3>
              <span className="text-sm font-bold text-zinc-500">{goalStats.completionPercent}%</span>
            </div>
            <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 px-4 py-3 mb-4">
              <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mt-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500"
                  style={{ width: `${goalStats.completionPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                <span>{goalStats.completedGoals}/{goalStats.totalGoals} done</span>
                <span>{goalStats.goalsScore}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <p className="mb-2 font-medium text-zinc-700 dark:text-zinc-300">Monthly goals</p>
                <div className="space-y-2">
                  {form.monthlyGoals.map((goal) => (
                    <label key={goal.id} className="flex items-center gap-2">
                      <input type="checkbox" checked={goal.completed} onChange={() => toggleGoal('monthlyGoals', goal.id)} />
                      <span>{goal.text}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 font-medium text-zinc-700 dark:text-zinc-300">Daily goals</p>
                <div className="space-y-2">
                  {form.dailyGoals.map((goal) => (
                    <label key={goal.id} className="flex items-center gap-2">
                      <input type="checkbox" checked={goal.completed} onChange={() => toggleGoal('dailyGoals', goal.id)} />
                      <span>{goal.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Learning & Growth</h3>
              <span className="text-sm font-bold text-zinc-500">{form.learningScore}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="1"
              value={form.learningScore}
              onChange={(e) => updateField('learningScore', Number(e.target.value))}
              className="w-full accent-primary-500"
            />
            <textarea
              rows={3}
              value={form.learnings}
              onChange={(e) => updateField('learnings', e.target.value)}
              placeholder="What did you learn today?"
              className="mt-3 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none resize-none"
            />
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Pros & Cons</h3>
              <span className="text-sm font-bold text-zinc-500">{form.prosConsScore}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="1"
              value={form.prosConsScore}
              onChange={(e) => updateField('prosConsScore', Number(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="space-y-2">
                <p className="font-medium text-emerald-600">Pros</p>
                {form.pros.map((item, index) => (
                  <div key={`pro-${index}`} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateListItem('pros', index, e.target.value)}
                      placeholder={`Pro ${index + 1}`}
                      className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none"
                    />
                    <button type="button" onClick={() => removeListItem('pros', index)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addListItem('pros')} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  <Plus size={14} /> Add pro
                </button>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-rose-600">Cons</p>
                {form.cons.map((item, index) => (
                  <div key={`con-${index}`} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateListItem('cons', index, e.target.value)}
                      placeholder={`Con ${index + 1}`}
                      className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none"
                    />
                    <button type="button" onClick={() => removeListItem('cons', index)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addListItem('cons')} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  <Plus size={14} /> Add con
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Gratitude</h3>
              <span className="text-sm font-bold text-zinc-500">{form.gratitudeScore}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="1"
              value={form.gratitudeScore}
              onChange={(e) => updateField('gratitudeScore', Number(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="space-y-2 mt-4">
              {form.gratitude.map((item, index) => (
                <div key={`gratitude-${index}`} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateListItem('gratitude', index, e.target.value)}
                    placeholder="What are you grateful for?"
                    className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none"
                  />
                  <button type="button" onClick={() => removeListItem('gratitude', index)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addListItem('gratitude')} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                <Plus size={14} /> Add gratitude
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
          <label className="space-y-1 text-sm block">
            <span className="text-zinc-600 dark:text-zinc-400">Final thoughts</span>
            <textarea
              rows={2}
              value={form.finalThoughts}
              onChange={(e) => updateField('finalThoughts', e.target.value)}
              placeholder="Sum up the day in a few lines."
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none resize-none"
            />
          </label>
          <div className="rounded-2xl bg-primary-500/8 border border-primary-500/15 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500">Productivity score</p>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white">{totalScore.toFixed(2)}</h3>
              </div>
              <p className="max-w-[220px] text-sm text-zinc-600 dark:text-zinc-300 text-right">{scoreBand(totalScore)}</p>
            </div>
          </div>
          {!saved ? (
            <button
              type="button"
              onClick={saveEntry}
              className="w-full rounded-2xl bg-primary-600 text-white font-bold py-3.5 hover:bg-primary-700 transition-colors"
            >
              Save Productivity Entry
            </button>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={16} />
                Entry saved. Your history and streak are updated.
              </div>
              {showTomorrowPrompt && !showTomorrowEditor && (
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-4 space-y-3 bg-white dark:bg-black/20">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">Do you want to change goals for tomorrow?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowTomorrowPrompt(false)}
                      className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 py-2.5 text-sm font-semibold"
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTomorrowEditor(true)}
                      className="flex-1 rounded-xl bg-primary-600 text-white py-2.5 text-sm font-semibold"
                    >
                      Yes
                    </button>
                  </div>
                </div>
              )}
              {showTomorrowEditor && (
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-4 space-y-4 bg-white dark:bg-black/20">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Tomorrow monthly goals</p>
                    <div className="space-y-2">
                      {tomorrowGoals.monthlyGoals.map((goal, index) => (
                        <div key={`tm-${index}`} className="flex gap-2">
                          <input
                            type="text"
                            value={goal}
                            onChange={(e) => updateTomorrowGoal('monthlyGoals', index, e.target.value)}
                            className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none"
                          />
                          <button type="button" onClick={() => removeTomorrowGoal('monthlyGoals', index)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => addTomorrowGoal('monthlyGoals')} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 mt-2">
                      <Plus size={14} /> Add monthly goal
                    </button>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Tomorrow daily goals</p>
                    <div className="space-y-2">
                      {tomorrowGoals.dailyGoals.map((goal, index) => (
                        <div key={`td-${index}`} className="flex gap-2">
                          <input
                            type="text"
                            value={goal}
                            onChange={(e) => updateTomorrowGoal('dailyGoals', index, e.target.value)}
                            className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black/30 px-3 py-2.5 outline-none"
                          />
                          <button type="button" onClick={() => removeTomorrowGoal('dailyGoals', index)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => addTomorrowGoal('dailyGoals')} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 mt-2">
                      <Plus size={14} /> Add daily goal
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowTomorrowEditor(false)}
                      className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 py-2.5 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveTomorrowGoals}
                      className="flex-1 rounded-xl bg-primary-600 text-white py-2.5 text-sm font-semibold"
                    >
                      Save Tomorrow Goals
                    </button>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 font-semibold py-3"
              >
                Add New Entry
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Last score</p>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
            {lastScore !== null ? lastScore.toFixed(2) : '--'}
          </div>
          <p className="text-xs text-zinc-500 mt-1">{lastScoreDate || 'No entry yet'}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Streak</p>
          <div className="flex items-center gap-2 mt-1">
            <Flame size={18} className="text-orange-500" />
            <span className="text-2xl font-bold text-zinc-900 dark:text-white">{streak}</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Consecutive days with entries</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Entries</p>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{entries.length}</div>
          <p className="text-xs text-zinc-500 mt-1">Saved in local storage</p>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <LineChart size={16} className="text-primary-500" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Recent history</h3>
        </div>

        <div className="grid grid-cols-7 gap-2 items-end h-24 mb-5">
          {recentEntries.length > 0 ? recentEntries.map((entry) => {
            const normalized = ((entry.totalScore + 5) / 10) * 100;
            return (
              <div key={entry.id} className="flex flex-col items-center justify-end gap-2 h-full">
                <div className="w-full h-full rounded-xl bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex items-end">
                  <div
                    className="w-full rounded-xl bg-gradient-to-t from-primary-500 to-emerald-400"
                    style={{ height: `${Math.max(normalized, 8)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-zinc-500">{entry.date.slice(8)}</span>
              </div>
            );
          }) : (
            <div className="col-span-7 h-full rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-sm text-zinc-500">
              Save entries to start the chart
            </div>
          )}
        </div>

        <div className="space-y-2">
          {entries.length > 0 ? entries.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900 dark:text-white truncate">{entry.activities || 'No main focus saved'}</p>
                <p className="text-xs text-zinc-500 mt-1">{entry.date}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-lg font-bold text-zinc-900 dark:text-white">{entry.totalScore.toFixed(2)}</span>
                <button type="button" onClick={() => deleteEntry(entry.id)} className="text-zinc-500 hover:text-rose-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 px-4 py-6 text-sm text-zinc-500 text-center">
              No productivity history yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
