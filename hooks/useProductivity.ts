import { useCallback, useMemo, useState } from 'react';
import { ProductivityEntry } from '../types';

const PRODUCTIVITY_STORAGE_KEY = 'productivityEntries';

export const getProductivityEntries = (): ProductivityEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PRODUCTIVITY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProductivityEntry[];
    return Array.isArray(parsed)
      ? parsed.sort((a, b) => a.date.localeCompare(b.date))
      : [];
  } catch {
    return [];
  }
};

const writeEntries = (entries: ProductivityEntry[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PRODUCTIVITY_STORAGE_KEY, JSON.stringify(entries));
};

const getDateDaysAgo = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const calculateStreak = (entries: ProductivityEntry[]) => {
  const byDate = new Set(entries.map((entry) => entry.date));
  let streak = 0;

  for (let i = 0; ; i++) {
    const targetDate = getDateDaysAgo(i);
    if (!byDate.has(targetDate)) break;
    streak++;
  }

  return streak;
};

export const useProductivity = () => {
  const [entries, setEntries] = useState<ProductivityEntry[]>(() => getProductivityEntries());

  const saveEntries = useCallback((nextEntries: ProductivityEntry[]) => {
    const sorted = [...nextEntries].sort((a, b) => a.date.localeCompare(b.date));
    setEntries(sorted);
    writeEntries(sorted);
  }, []);

  const addEntry = useCallback((entry: ProductivityEntry) => {
    const existing = getProductivityEntries();
    const withoutSameDay = existing.filter((item) => item.date !== entry.date);
    saveEntries([...withoutSameDay, entry]);
  }, [saveEntries]);

  const deleteEntry = useCallback((id: string) => {
    const existing = getProductivityEntries();
    saveEntries(existing.filter((item) => item.id !== id));
  }, [saveEntries]);

  const importEntries = useCallback((incoming: ProductivityEntry[]) => {
    saveEntries(incoming);
  }, [saveEntries]);

  const exportEntries = useCallback(() => JSON.stringify(entries, null, 2), [entries]);

  const sortedRecent = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries]
  );

  const lastEntry = sortedRecent[0] || null;

  return {
    entries: sortedRecent,
    recentEntries: sortedRecent.slice(0, 7).reverse(),
    lastScore: lastEntry?.totalScore ?? null,
    lastScoreDate: lastEntry?.date ?? null,
    streak: calculateStreak(entries),
    addEntry,
    deleteEntry,
    importEntries,
    exportEntries,
  };
};

