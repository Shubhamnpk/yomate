import { useCallback, useMemo, useState } from 'react';
import { ProductivityEntry } from '../types';
import {
  getLatestProductivitySubmission,
  getProductivityStreakEndingAt,
  getProductivityEntries,
  isProductivityCooldownActive,
  normalizeProductivityEntry,
  sortProductivityEntries,
  writeProductivityEntries,
} from '../services/productivityService';

export {
  PRODUCTIVITY_STORAGE_KEY,
  PRODUCTIVITY_SCHEMA_VERSION,
  PRODUCTIVITY_SCORING_VERSION,
  getProductivityEntries,
  getProductivityStreakEndingAt,
  getLatestProductivitySubmission,
  isProductivityCooldownActive,
} from '../services/productivityService';

export const useProductivity = () => {
  const [entries, setEntries] = useState<ProductivityEntry[]>(() => getProductivityEntries());

  const saveEntries = useCallback((nextEntries: ProductivityEntry[]) => {
    const sorted = sortProductivityEntries(nextEntries.map(normalizeProductivityEntry));
    setEntries(sorted);
    writeProductivityEntries(sorted);
  }, []);

  const addEntry = useCallback((entry: ProductivityEntry) => {
    const existing = getProductivityEntries();
    saveEntries([...existing, normalizeProductivityEntry(entry)]);
  }, [saveEntries]);

  const deleteEntry = useCallback((id: string) => {
    const existing = getProductivityEntries();
    saveEntries(existing.filter((item) => item.id !== id));
  }, [saveEntries]);

  const importEntries = useCallback((incoming: ProductivityEntry[]) => saveEntries(incoming), [saveEntries]);
  const exportEntries = useCallback(() => JSON.stringify(entries, null, 2), [entries]);
  const sortedRecent = useMemo(() => [...entries].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)), [entries]);
  const lastEntry = sortedRecent[0] || null;
  const latestSubmission = getLatestProductivitySubmission(entries);
  const streak = latestSubmission ? getProductivityStreakEndingAt(latestSubmission.date, entries) : 0;

  return {
    entries: sortedRecent,
    recentEntries: sortedRecent.slice(0, 7).reverse(),
    lastScore: lastEntry?.totalScore ?? null,
    lastScoreDate: lastEntry?.date ?? null,
    streak,
    isCooldownActive: isProductivityCooldownActive(entries),
    latestSubmission,
    addEntry,
    deleteEntry,
    importEntries,
    exportEntries,
  };
};
