import { ProductivityEntry } from '../types';

export const PRODUCTIVITY_STORAGE_KEY = 'productivityEntries';
export const PRODUCTIVITY_SCHEMA_VERSION = 1;
export const PRODUCTIVITY_SCORING_VERSION = 1;

type GoalItem = { id: string; text: string; completed: boolean };

type LegacyProductivityEntry = ProductivityEntry & {
  ritualGoals?: GoalItem[];
};

export const getLocalDateString = (value: Date = new Date()) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getNowTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const normalizeGoalList = (value: unknown, prefix: string): GoalItem[] => (Array.isArray(value) ? value : []).map((item, index) => {
  if (typeof item === 'string') return { id: `${prefix}-${index + 1}`, text: item, completed: false };
  if (item && typeof item === 'object') {
    const goal = item as { id?: string; text?: string; completed?: boolean };
    return {
      id: goal.id || `${prefix}-${index + 1}`,
      text: goal.text || '',
      completed: Boolean(goal.completed),
    };
  }
  return { id: `${prefix}-${index + 1}`, text: '', completed: false };
});

export const getNonEmptyItemCount = (items: string[]) => items.map((item) => item.trim()).filter(Boolean).length;

export const getProsConsScore = (pros: string[], cons: string[]) => {
  const rawScore = getNonEmptyItemCount(pros) - getNonEmptyItemCount(cons);
  return Math.max(-5, Math.min(5, rawScore));
};

export const getGoalCompletionStats = (monthlyGoals: GoalItem[], dailyGoals: GoalItem[]) => {
  const allGoals = [...monthlyGoals, ...dailyGoals].filter((goal) => goal.text.trim());
  const totalGoals = allGoals.length;
  const completedGoals = allGoals.filter((goal) => goal.completed).length;
  const completionRatio = totalGoals > 0 ? completedGoals / totalGoals : 0;

  return {
    totalGoals,
    completedGoals,
    completionPercent: Math.round(completionRatio * 100),
    goalsScore: Number((((completionRatio * 10) - 5)).toFixed(2)),
  };
};

export const getTotalProductivityScore = (params: {
  goalsScore: number;
  learningScore: number;
  prosConsScore: number;
  gratitudeScore: number;
}) => Number((((params.goalsScore * 0.4) + (params.learningScore * 0.3) + (params.prosConsScore * 0.2) + (params.gratitudeScore * 0.1)).toFixed(2)));

export const normalizeProductivityEntry = (entry: ProductivityEntry | Record<string, unknown>): ProductivityEntry => {
  const raw = entry as Partial<LegacyProductivityEntry> & { activities?: string; interests?: string };
  const date = typeof raw.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : getLocalDateString();
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : `${date}T${typeof raw.time === 'string' ? raw.time : '21:00'}:00`;
  const monthlyGoals = normalizeGoalList(raw.monthlyGoals, 'm');
  const dailyGoals = normalizeGoalList(raw.dailyGoals, 'd');
  const ritualGoals = normalizeGoalList(raw.ritualGoals, 'r');

  ritualGoals.forEach((goal, index) => {
    if (!goal.text.trim()) return;
    if (dailyGoals.some((dailyGoal) => dailyGoal.text.trim() === goal.text.trim())) return;
    dailyGoals.push({ ...goal, id: `r-${index + 1}` });
  });

  const computedGoalStats = getGoalCompletionStats(monthlyGoals, dailyGoals);
  const learningScore = typeof raw.learningScore === 'number' ? raw.learningScore : 0;
  const gratitudeScore = typeof raw.gratitudeScore === 'number' ? raw.gratitudeScore : 0;
  const normalizedPros = Array.isArray(raw.pros) ? raw.pros.filter((item): item is string => typeof item === 'string') : [];
  const normalizedCons = Array.isArray(raw.cons) ? raw.cons.filter((item): item is string => typeof item === 'string') : [];
  const prosConsScore = typeof raw.prosConsScore === 'number' ? raw.prosConsScore : getProsConsScore(normalizedPros, normalizedCons);
  const goalsScore = typeof raw.goalsScore === 'number' ? raw.goalsScore : computedGoalStats.goalsScore;

  return {
    schemaVersion: typeof raw.schemaVersion === 'number' ? raw.schemaVersion : PRODUCTIVITY_SCHEMA_VERSION,
    scoringVersion: typeof raw.scoringVersion === 'number' ? raw.scoringVersion : PRODUCTIVITY_SCORING_VERSION,
    id: raw.id || `${date}-${createdAt}`,
    date,
    time: typeof raw.time === 'string' ? raw.time : createdAt.slice(11, 16),
    createdAt,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
    mainFocus: typeof raw.mainFocus === 'string' ? raw.mainFocus : (raw.activities || ''),
    activities: typeof raw.activities === 'string' ? raw.activities : (typeof raw.mainFocus === 'string' ? raw.mainFocus : ''),
    location: typeof raw.location === 'string' ? raw.location : '',
    mood: typeof raw.mood === 'string' ? raw.mood : '',
    learnings: typeof raw.learnings === 'string' ? raw.learnings : (raw.interests || ''),
    interests: typeof raw.interests === 'string' ? raw.interests : (typeof raw.learnings === 'string' ? raw.learnings : ''),
    pros: normalizedPros,
    cons: normalizedCons,
    gratitude: Array.isArray(raw.gratitude) ? raw.gratitude.filter((item): item is string => typeof item === 'string') : [],
    finalThoughts: typeof raw.finalThoughts === 'string' ? raw.finalThoughts : '',
    monthlyGoals,
    dailyGoals,
    goalCompletionPercent: typeof raw.goalCompletionPercent === 'number' ? raw.goalCompletionPercent : computedGoalStats.completionPercent,
    completedGoals: typeof raw.completedGoals === 'number' ? raw.completedGoals : computedGoalStats.completedGoals,
    totalGoals: typeof raw.totalGoals === 'number' ? raw.totalGoals : computedGoalStats.totalGoals,
    goalsScore,
    learningScore,
    prosConsScore,
    gratitudeScore,
    totalScore: typeof raw.totalScore === 'number'
      ? raw.totalScore
      : getTotalProductivityScore({ goalsScore, learningScore, prosConsScore, gratitudeScore }),
    overrideUsed: Boolean(raw.overrideUsed),
  };
};

export const sortProductivityEntries = (entries: ProductivityEntry[]) => [...entries].sort((a, b) => `${a.date}T${a.time || '00:00'}|${a.createdAt}`.localeCompare(`${b.date}T${b.time || '00:00'}|${b.createdAt}`));

export const getProductivityEntries = (): ProductivityEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PRODUCTIVITY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<ProductivityEntry | Record<string, unknown>>;
    return Array.isArray(parsed) ? sortProductivityEntries(parsed.map(normalizeProductivityEntry)) : [];
  } catch {
    return [];
  }
};

export const writeProductivityEntries = (entries: ProductivityEntry[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PRODUCTIVITY_STORAGE_KEY, JSON.stringify(entries));
};

export const getProductivityEntryCount = () => getProductivityEntries().length;

export const getProductivityExportPayload = () => ({
  type: 'productivity-history',
  version: PRODUCTIVITY_SCHEMA_VERSION,
  exportedAt: new Date().toISOString(),
  entryCount: getProductivityEntryCount(),
  entries: getProductivityEntries(),
});

export const exportProductivityHistory = () => {
  if (typeof window === 'undefined') return;
  const payload = getProductivityExportPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `youmeet_productivity_history_${getLocalDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const parseProductivityImportPayload = (raw: unknown) => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const payload = raw as { entries?: unknown; productivityEntries?: unknown };
    if (Array.isArray(payload.entries)) return payload.entries;
    if (Array.isArray(payload.productivityEntries)) return payload.productivityEntries;
  }
  throw new Error('This file does not contain productivity history.');
};

export const importProductivityHistory = (
  jsonString: string,
  mode: 'replace' | 'merge' = 'merge',
) => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON file.');
  }

  const importedEntries = parseProductivityImportPayload(parsed).map((entry) => normalizeProductivityEntry(entry as ProductivityEntry | Record<string, unknown>));
  const existingEntries = getProductivityEntries();
  const merged = mode === 'replace'
    ? importedEntries
    : [...existingEntries, ...importedEntries];

  const deduped = Array.from(
    new Map(merged.map((entry) => [`${entry.id}|${entry.createdAt}`, entry] as const)).values(),
  );

  const normalized = sortProductivityEntries(deduped.map(normalizeProductivityEntry));
  writeProductivityEntries(normalized);

  return {
    importedCount: importedEntries.length,
    totalCount: normalized.length,
    mode,
  };
};

const getDateDaysAgo = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return getLocalDateString(d);
};

const calculateCurrentStreak = (entries: ProductivityEntry[]) => {
  const byDate = new Set(entries.map((entry) => entry.date));
  let streak = 0;
  for (let i = 0; ; i++) {
    const targetDate = getDateDaysAgo(i);
    if (!byDate.has(targetDate)) break;
    streak++;
  }
  return streak;
};

export const getProductivityCurrentStreak = (entries: ProductivityEntry[] = getProductivityEntries()) => calculateCurrentStreak(entries);

export const getProductivityStreakEndingAt = (date: string, entries: ProductivityEntry[] = getProductivityEntries()) => {
  const byDate = new Set(entries.map((entry) => entry.date));
  const cursor = new Date(`${date}T00:00:00`);
  let streak = 0;

  while (true) {
    const target = getLocalDateString(cursor);
    if (!byDate.has(target)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export const getLatestProductivitySubmission = (entries: ProductivityEntry[] = getProductivityEntries()) => {
  const sorted = sortProductivityEntries(entries);
  return sorted.length > 0 ? sorted[sorted.length - 1] : null;
};

export const isProductivityCooldownActive = (
  entries: ProductivityEntry[] = getProductivityEntries(),
  today = getLocalDateString(),
) => {
  const latest = getLatestProductivitySubmission(entries);
  if (!latest) return false;
  const lastSubmissionDate = latest.createdAt ? getLocalDateString(new Date(latest.createdAt)) : latest.date;
  return lastSubmissionDate === today;
};
