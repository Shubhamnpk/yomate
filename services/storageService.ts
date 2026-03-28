
import { DayLog, ScheduleBlock, Subject, AppSettings, WeeklyPlan, Deadline } from '../types';
import { DEFAULT_SCHEDULE, ALL_SUBJECTS } from '../constants';
import { addMinutes, getCurrentTime24, getMinutesDiff } from './timeService';

// Bumped to v5 for new Settings features
const STORAGE_KEY = 'youmeet_data_v5';
const TEMPLATE_KEY = 'youmeet_template_v1';
const SUBJECTS_KEY = 'youmeet_subjects_v1';
const SETTINGS_KEY = 'youmeet_settings_v1';
const CURRICULUM_PROGRESS_KEY = 'youmeet_curriculum_progress_v1';
const LOG_SAVE_DEBOUNCE_MS = 250;

export type CurriculumProgramId = 'pharmacy-year-2' | 'pharmacy-year-3' | 'class-11-science';

export interface CurriculumProgramProgress {
  readUnitIds: string[];
  completedSubUnitIds: string[];
  updatedAt: string | null;
}

export type CurriculumProgressMap = Record<CurriculumProgramId, CurriculumProgramProgress>;

const DEFAULT_CURRICULUM_PROGRESS: CurriculumProgressMap = {
  'pharmacy-year-2': { readUnitIds: [], completedSubUnitIds: [], updatedAt: null },
  'pharmacy-year-3': { readUnitIds: [], completedSubUnitIds: [], updatedAt: null },
  'class-11-science': { readUnitIds: [], completedSubUnitIds: [], updatedAt: null },
};

const createDefaultCurriculumProgress = (): CurriculumProgressMap => ({
  'pharmacy-year-2': { ...DEFAULT_CURRICULUM_PROGRESS['pharmacy-year-2'], readUnitIds: [], completedSubUnitIds: [] },
  'pharmacy-year-3': { ...DEFAULT_CURRICULUM_PROGRESS['pharmacy-year-3'], readUnitIds: [], completedSubUnitIds: [] },
  'class-11-science': { ...DEFAULT_CURRICULUM_PROGRESS['class-11-science'], readUnitIds: [], completedSubUnitIds: [] },
});

let logCache: Record<string, DayLog> | null = null;
let logSaveTimer: number | null = null;

const persistLogsNow = () => {
  if (logCache === null) {
    logSaveTimer = null;
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logCache || {}));
  logSaveTimer = null;
};
const scheduleLogPersist = () => {
  if (logSaveTimer) {
    window.clearTimeout(logSaveTimer);
  }
  logSaveTimer = window.setTimeout(persistLogsNow, LOG_SAVE_DEBOUNCE_MS);
};

const invalidateLogCache = () => {
  logCache = null;
  if (logSaveTimer) {
    window.clearTimeout(logSaveTimer);
    logSaveTimer = null;
  }
};

const inferDefaultFixed = (block: Pick<ScheduleBlock, 'blockType' | 'mode' | 'activityName'>): boolean => {
  if (block.blockType === 'EVENT' || block.mode === 'Class' || block.mode === 'Rest') {
    return true;
  }
  const name = (block.activityName || '').toLowerCase();
  return /breakfast|lunch|dinner|meal|rest|sleep|nap|break/.test(name);
};

const normalizeScheduleBlock = (block: ScheduleBlock): ScheduleBlock => {
  const normalizedDays = block.daysOfWeek && block.daysOfWeek.length > 0
    ? Array.from(new Set(block.daysOfWeek)).sort((a, b) => a - b)
    : undefined;
  const normalizedDate = block.eventDate && /^\d{4}-\d{2}-\d{2}$/.test(block.eventDate)
    ? block.eventDate
    : undefined;
  const normalizedEndDate = block.eventEndDate && /^\d{4}-\d{2}-\d{2}$/.test(block.eventEndDate)
    ? block.eventEndDate
    : undefined;
  const computedDuration = getMinutesDiff(block.startTime, block.endTime);
  const normalizedDuration = typeof block.durationMinutes === 'number' && block.durationMinutes > 0
    ? Math.round(block.durationMinutes)
    : computedDuration;
  return {
    ...block,
    blockType: block.blockType || (block.mode === 'Class' ? 'EVENT' : 'TASK'),
    isFixed: typeof block.isFixed === 'boolean' ? block.isFixed : inferDefaultFixed(block),
    daysOfWeek: normalizedDays,
    eventDate: normalizedDate,
    eventEndDate: normalizedEndDate,
    durationMinutes: normalizedDuration,
  };
};

export const isBlockScheduledForDay = (block: ScheduleBlock, dayOfWeek: number, date?: string): boolean => {
  if (block.eventDate) {
    if (!date) return false;
    if (block.eventEndDate) {
      return date >= block.eventDate && date <= block.eventEndDate;
    }
    return block.eventDate === date;
  }
  return !block.daysOfWeek || block.daysOfWeek.includes(dayOfWeek);
};

export const flushPendingLogSave = () => {
  if (logSaveTimer) {
    window.clearTimeout(logSaveTimer);
    persistLogsNow();
  }
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getDateDaysAgo = (dateStr: string, daysAgo: number): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const calculateStreakEndingAt = (logs: Record<string, DayLog>, dateStr: string): number => {
  let streak = 0;
  const date = new Date(dateStr);
  while (true) {
    const dStr = date.toISOString().split('T')[0];
    if (logs[dStr] && logs[dStr].deepWorkMinutes > 15) {
      streak++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

const evaluateAchievements = (logs: Record<string, DayLog>, date: string, settings: AppSettings): string[] => {
  const log = logs[date];
  if (!log) return [];

  const unlocked = new Set<string>(log.unlockedAchievements || []);
  const rituals = settings.rituals || [];

  if (log.deepWorkMinutes >= 100) unlocked.add('FIRST_100_MIN_DAY');
  if (calculateStreakEndingAt(logs, date) >= 7) unlocked.add('STREAK_7');

  const noPhone3 = [0, 1, 2].every(offset => {
    const dStr = getDateDaysAgo(date, offset);
    return logs[dStr] && logs[dStr].phoneViolations === 0;
  });
  if (noPhone3) unlocked.add('NO_PHONE_3_DAYS');

  if (rituals.length > 0) {
    const ritualsWeek = Array.from({ length: 7 }).every((_, offset) => {
      const dStr = getDateDaysAgo(date, offset);
      const dLog = logs[dStr];
      if (!dLog) return false;
      const completed = new Set(dLog.completedRituals || []);
      return rituals.every(r => completed.has(r));
    });
    if (ritualsWeek) unlocked.add('RITUALS_WEEK');
  }

  return Array.from(unlocked);
};

export const getStoredLog = (): Record<string, DayLog> => {
  if (logCache) return logCache;
  const stored = localStorage.getItem(STORAGE_KEY);
  logCache = stored ? JSON.parse(stored) : {};
  return logCache;
};

// --- SETTINGS MANAGEMENT ---

const DEFAULT_WEEKLY_PLAN: WeeklyPlan = {
  0: { main1: null, main2: null, light: null }, // Sun
  1: { main1: null, main2: null, light: null }, // Mon
  2: { main1: null, main2: null, light: null }, // Tue
  3: { main1: null, main2: null, light: null }, // Wed
  4: { main1: null, main2: null, light: null }, // Thu
  5: { main1: null, main2: null, light: null }, // Fri
  6: { main1: null, main2: null, light: null }, // Sat
};

const DEFAULT_WEEKLY_TARGETS: AppSettings['weeklyTargets'] = {
  deepWorkHours: 10,
  zeroViolationDays: 5,
  ritualCompletionDays: 5,
};

const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Student',
  themeAccent: 'indigo',
  themeMode: 'zinc',
  dateSystem: 'ENGLISH',
  timeFormat: '12H',
  enableSounds: true,
  defaultFocusMinutes: 60,
  appMode: 'Normal',
  weeklyPlan: DEFAULT_WEEKLY_PLAN,
  weeklyTargets: DEFAULT_WEEKLY_TARGETS,
  cloudSyncEnabled: false,
  cloudSyncPushUrl: '',
  cloudSyncPullUrl: '',
  cloudSyncToken: '',
  deadlines: [],
  rituals: ['Exercise', 'Reading', 'Meditation'],
  productivityMonthlyGoals: [
    'One page of language practice',
    'Push one hard thing fully',
    'Do one fun activity',
  ],
  productivityDailyGoals: [
    'Drink enough water',
    'Sleep at least 5 hours',
    'Go outside for a bit',
    'Read 10 pages',
    'Practice one skill',
  ],
  onboarded: false,
};

export const getAppSettings = (): AppSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  const parsed = stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    onboarded: parsed.onboarded ?? false,
    timeFormat: parsed.timeFormat === '24H' ? '24H' : '12H',
    weeklyPlan: { ...DEFAULT_WEEKLY_PLAN, ...parsed.weeklyPlan },
    weeklyTargets: { ...DEFAULT_WEEKLY_TARGETS, ...(parsed.weeklyTargets || {}) },
  };
};

export const saveAppSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// --- TEMPLATE MANAGEMENT ---

export const getScheduleTemplate = (): ScheduleBlock[] => {
  const stored = localStorage.getItem(TEMPLATE_KEY);
  const parsed = stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
  return parsed.map((b: ScheduleBlock) => normalizeScheduleBlock(b));
};

export const saveScheduleTemplate = (schedule: ScheduleBlock[]) => {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(schedule.map(normalizeScheduleBlock)));
};

export const getCustomSubjects = (): Subject[] => {
  const stored = localStorage.getItem(SUBJECTS_KEY);
  return stored ? JSON.parse(stored) : ALL_SUBJECTS;
};

export const saveCustomSubjects = (subjects: Subject[]) => {
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
};

export const getCurriculumProgress = (): CurriculumProgressMap => {
  const stored = localStorage.getItem(CURRICULUM_PROGRESS_KEY);
  if (!stored) return createDefaultCurriculumProgress();

  try {
    const parsed = JSON.parse(stored) as Partial<CurriculumProgressMap>;
    const normalize = (programId: CurriculumProgramId): CurriculumProgramProgress => {
      const entry = parsed?.[programId];
      const readUnitIds = Array.isArray(entry?.readUnitIds)
        ? Array.from(new Set(entry.readUnitIds.filter((id): id is string => typeof id === 'string')))
        : [];
      const completedSubUnitIds = Array.isArray(entry?.completedSubUnitIds)
        ? Array.from(new Set(entry.completedSubUnitIds.filter((id): id is string => typeof id === 'string')))
        : [];

      return {
        readUnitIds,
        completedSubUnitIds,
        updatedAt: typeof entry?.updatedAt === 'string' ? entry.updatedAt : null,
      };
    };

    return {
      'pharmacy-year-2': normalize('pharmacy-year-2'),
      'pharmacy-year-3': normalize('pharmacy-year-3'),
      'class-11-science': normalize('class-11-science'),
    };
  } catch {
    return createDefaultCurriculumProgress();
  }
};

export const saveCurriculumProgress = (progress: CurriculumProgressMap) => {
  localStorage.setItem(CURRICULUM_PROGRESS_KEY, JSON.stringify(progress));
};

// --- DATA MANAGEMENT (Import/Export/Reset) ---

export const getBackupPayload = () => {
  flushPendingLogSave();
  return {
    logs: getStoredLog(),
    template: getScheduleTemplate(),
    subjects: getCustomSubjects(),
    curriculumProgress: getCurriculumProgress(),
    settings: getAppSettings(),
    version: 'v6'
  };
};

const applyBackupPayload = (data: any) => {
  invalidateLogCache();
  if (data.logs) {
    logCache = data.logs;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.logs));
  }
  if (data.template) localStorage.setItem(TEMPLATE_KEY, JSON.stringify(data.template));
  if (data.subjects) localStorage.setItem(SUBJECTS_KEY, JSON.stringify(data.subjects));
  if (data.curriculumProgress) localStorage.setItem(CURRICULUM_PROGRESS_KEY, JSON.stringify(data.curriculumProgress));
  if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
};

export const exportData = () => {
  const data = getBackupPayload();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `youmeet_backup_${getTodayDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);
    applyBackupPayload(data);
    window.location.reload();
  } catch (e) {
    alert("Invalid backup file.");
  }
};

export const pushBackupToCloud = async (pushUrl: string, token?: string) => {
  if (!pushUrl) throw new Error('Cloud push URL is required.');
  const payload = getBackupPayload();
  const res = await fetch(pushUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      app: 'yomate',
      timestamp: new Date().toISOString(),
      backup: payload,
    }),
  });
  if (!res.ok) {
    throw new Error(`Cloud push failed (${res.status})`);
  }
  return true;
};

export const pullBackupFromCloud = async (pullUrl: string, token?: string) => {
  if (!pullUrl) throw new Error('Cloud pull URL is required.');
  const res = await fetch(pullUrl, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Cloud pull failed (${res.status})`);
  }
  const data = await res.json();
  const backup = data?.backup || data;
  if (!backup || typeof backup !== 'object') {
    throw new Error('Invalid cloud payload');
  }
  applyBackupPayload(backup);
  window.location.reload();
};

const ICS_DAY_MAP: Record<string, number> = {
  SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
};

const unfoldIcsLines = (icsText: string) => {
  const raw = icsText.replace(/\r/g, '').split('\n');
  const out: string[] = [];
  for (const line of raw) {
    if (!line) continue;
    if ((line.startsWith(' ') || line.startsWith('\t')) && out.length > 0) {
      out[out.length - 1] += line.trimStart();
    } else {
      out.push(line);
    }
  }
  return out;
};

const parseIcsField = (line: string) => {
  const sep = line.indexOf(':');
  if (sep === -1) return null;
  const left = line.slice(0, sep);
  const value = line.slice(sep + 1).trim();
  const [nameRaw, ...paramParts] = left.split(';');
  const params: Record<string, string> = {};
  paramParts.forEach(p => {
    const [k, v] = p.split('=');
    if (k && v) params[k.toUpperCase()] = v;
  });
  return { name: nameRaw.toUpperCase(), params, value };
};

const parseIcsDateTime = (raw: string, isDateOnly = false) => {
  if (!raw) return null;
  if (isDateOnly || /^\d{8}$/.test(raw)) {
    const y = Number(raw.slice(0, 4));
    const m = Number(raw.slice(4, 6));
    const d = Number(raw.slice(6, 8));
    const date = `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    return { date, time: null };
  }
  const zulu = raw.endsWith('Z');
  const core = zulu ? raw.slice(0, -1) : raw;
  const [datePart, timePartRaw] = core.split('T');
  if (!datePart || !timePartRaw) return null;
  const y = Number(datePart.slice(0, 4));
  const m = Number(datePart.slice(4, 6));
  const d = Number(datePart.slice(6, 8));
  const hh = Number(timePartRaw.slice(0, 2));
  const mm = Number(timePartRaw.slice(2, 4));

  if (zulu) {
    const utc = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));
    return {
      date: utc.toISOString().slice(0, 10),
      time: `${utc.getHours().toString().padStart(2, '0')}:${utc.getMinutes().toString().padStart(2, '0')}`,
    };
  }
  return {
    date: `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
    time: `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`,
  };
};

export const importIcsCalendar = (icsText: string) => {
  const lines = unfoldIcsLines(icsText);
  const events: Array<Record<string, { value: string; params: Record<string, string> }>> = [];
  let current: Record<string, { value: string; params: Record<string, string> }> | null = null;

  lines.forEach(line => {
    if (line === 'BEGIN:VEVENT') {
      current = {};
      return;
    }
    if (line === 'END:VEVENT') {
      if (current) events.push(current);
      current = null;
      return;
    }
    if (!current) return;
    const parsed = parseIcsField(line);
    if (!parsed) return;
    current[parsed.name] = { value: parsed.value, params: parsed.params };
  });

  const existingTemplate = getScheduleTemplate();
  const existingSettings = getAppSettings();
  const existingDeadlines = [...(existingSettings.deadlines || [])];
  const existingDeadlineKey = new Set(existingDeadlines.map(d => `${d.title.toLowerCase()}|${d.date}`));
  const existingEventKey = new Set(existingTemplate.map(b => `${b.activityName.toLowerCase()}|${b.startTime}|${b.endTime}|${b.eventDate || ''}|${(b.daysOfWeek || []).join(',')}`));

  const addedEvents: ScheduleBlock[] = [];
  const addedDeadlines: Deadline[] = [];

  events.forEach((evt, idx) => {
    const summary = (evt.SUMMARY?.value || 'Imported Event').trim();
    const dtStartRaw = evt.DTSTART?.value;
    const dtEndRaw = evt.DTEND?.value;
    if (!dtStartRaw) return;
    const dtStart = parseIcsDateTime(dtStartRaw, evt.DTSTART?.params?.VALUE === 'DATE');
    const dtEnd = dtEndRaw ? parseIcsDateTime(dtEndRaw, evt.DTEND?.params?.VALUE === 'DATE') : null;
    if (!dtStart) return;

    const lower = summary.toLowerCase();
    const looksLikeDeadline = /exam|midterm|final|quiz|assignment|project|deadline|submission/.test(lower);
    if (looksLikeDeadline && dtStart.date) {
      const type: Deadline['type'] =
        /exam|midterm|final|quiz/.test(lower) ? 'Exam'
          : /assignment|submission/.test(lower) ? 'Assignment'
            : /project/.test(lower) ? 'Project'
              : 'Other';
      const key = `${summary.toLowerCase()}|${dtStart.date}`;
      if (!existingDeadlineKey.has(key)) {
        existingDeadlineKey.add(key);
        addedDeadlines.push({
          id: `ics_deadline_${Date.now()}_${idx}`,
          title: summary,
          date: dtStart.date,
          type,
        });
      }
    }

    if (!dtStart.time) return;
    const endTime = dtEnd?.time || addMinutes(dtStart.time, 60);
    const rrule = evt.RRULE?.value || '';
    const byDay = /BYDAY=([^;]+)/.exec(rrule)?.[1];
    const daysOfWeek = byDay
      ? byDay.split(',').map(code => ICS_DAY_MAP[code.trim().toUpperCase()]).filter((v): v is number => typeof v === 'number')
      : undefined;
    const untilRaw = /UNTIL=([^;]+)/.exec(rrule)?.[1];
    const until = untilRaw ? parseIcsDateTime(untilRaw)?.date : undefined;

    const newBlock: ScheduleBlock = normalizeScheduleBlock({
      id: `ics_event_${Date.now()}_${idx}`,
      startTime: dtStart.time,
      endTime,
      activityName: summary,
      mode: 'Class',
      blockType: 'EVENT',
      daysOfWeek: daysOfWeek && daysOfWeek.length > 0 ? daysOfWeek : undefined,
      eventDate: daysOfWeek && daysOfWeek.length > 0 ? dtStart.date : dtStart.date,
      eventEndDate: until,
      isCompleted: false,
    });
    const key = `${newBlock.activityName.toLowerCase()}|${newBlock.startTime}|${newBlock.endTime}|${newBlock.eventDate || ''}|${(newBlock.daysOfWeek || []).join(',')}`;
    if (!existingEventKey.has(key)) {
      existingEventKey.add(key);
      addedEvents.push(newBlock);
    }
  });

  if (addedEvents.length > 0) {
    const merged = [...existingTemplate, ...addedEvents].sort((a, b) => a.startTime.localeCompare(b.startTime));
    saveScheduleTemplate(merged);
  }
  if (addedDeadlines.length > 0) {
    const mergedDeadlines = [...existingDeadlines, ...addedDeadlines].sort((a, b) => a.date.localeCompare(b.date));
    saveAppSettings({ ...existingSettings, deadlines: mergedDeadlines });
  }

  return {
    importedEvents: addedEvents.length,
    importedDeadlines: addedDeadlines.length,
    totalEventsParsed: events.length,
  };
};

export const resetApp = () => {
  invalidateLogCache();
  // Only clear Yomate-specific keys, not all localStorage
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TEMPLATE_KEY);
  localStorage.removeItem(SUBJECTS_KEY);
  localStorage.removeItem(CURRICULUM_PROGRESS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  window.location.reload();
};

// --- HISTORY & LOGGING ---

export const getHistory = (days: number): DayLog[] => {
  const logs = getStoredLog();
  const result: DayLog[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (logs[dateStr]) {
      result.push(logs[dateStr]);
    } else {
      result.push({ ...initializeToday(true), date: dateStr, schedule: [] });
    }
  }
  return result;
};

// Helper: Get current streak (consecutive days with >15 mins deep work)
export const getStreak = (): number => {
  const logs = getStoredLog();
  const todayStr = getTodayDateString();
  let streak = 0;
  let date = new Date(todayStr); // Start from today

  // If today has meaningful work, count it, otherwise start checking from yesterday
  if (logs[todayStr] && logs[todayStr].deepWorkMinutes > 15) {
    streak++;
  }

  // Check yesterday and backwards
  date.setDate(date.getDate() - 1);

  while (true) {
    const dStr = date.toISOString().split('T')[0];
    if (logs[dStr] && logs[dStr].deepWorkMinutes > 15) {
      streak++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

// New Helper: Get specifically yesterday's log to see reflection
export const getYesterdayLog = (): DayLog | null => {
  const logs = getStoredLog();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];
  return logs[dateStr] || null;
};

const toPrimaryObjectiveFromFix = (fixText?: string | null): string | undefined => {
  if (!fixText) return undefined;
  const cleaned = fixText
    .replace(/^[-*•\s]+/, '')
    .replace(/^(one\s+fix\s+(for\s+tomorrow)?\s*[:\-]\s*)/i, '')
    .trim();
  if (!cleaned) return undefined;
  const firstChunk = cleaned.split(/\r?\n|[.!?]/)[0].trim();
  if (!firstChunk) return undefined;
  return firstChunk.slice(0, 120);
};

export const saveLog = (date: string, data: DayLog) => {
  const allLogs = getStoredLog();
  const settings = getAppSettings();
  const merged: DayLog = {
    ...data,
    schedule: (data.schedule || []).map(normalizeScheduleBlock),
    additionalSubjects: data.additionalSubjects || [],
    focusSessions: data.focusSessions || [],
    unlockedAchievements: data.unlockedAchievements || [],
  };
  allLogs[date] = merged;
  allLogs[date].unlockedAchievements = evaluateAchievements(allLogs, date, settings);
  logCache = allLogs;
  scheduleLogPersist();
};

export const initializeToday = (dryRun = false): DayLog => {
  const date = getTodayDateString();
  const logs = getStoredLog();

  if (logs[date] && !dryRun) {
    logs[date].schedule = (logs[date].schedule || []).map(normalizeScheduleBlock);
    // Legacy support: ensure todos exist
    if (!logs[date].todos) {
      logs[date].todos = [];
      saveLog(date, logs[date]);
    }
    // Legacy support: ensure completedRituals exist
    if (!logs[date].completedRituals) {
      logs[date].completedRituals = [];
      saveLog(date, logs[date]);
    }
    // Legacy support: ensure subjectMinutes exist
    if (!logs[date].subjectMinutes) {
      logs[date].subjectMinutes = {};
      saveLog(date, logs[date]);
    }
    if (!logs[date].focusSessions) {
      logs[date].focusSessions = [];
      saveLog(date, logs[date]);
    }
    if (!logs[date].unlockedAchievements) {
      logs[date].unlockedAchievements = [];
      saveLog(date, logs[date]);
    }
    if (!logs[date].additionalSubjects) {
      logs[date].additionalSubjects = [];
      saveLog(date, logs[date]);
    }
    if (!logs[date].primaryObjective) {
      const inferredObjective = toPrimaryObjectiveFromFix(getYesterdayLog()?.reflection?.fixForTomorrow);
      if (inferredObjective) {
        logs[date].primaryObjective = inferredObjective;
        saveLog(date, logs[date]);
      }
    }
    return logs[date];
  }

  const template = getScheduleTemplate();
  const settings = getAppSettings();

  // Find incomplete todos from yesterday
  let pendingTodos: any[] = [];
  const yesterdayLog = getYesterdayLog();
  if (yesterdayLog && yesterdayLog.todos) {
    pendingTodos = yesterdayLog.todos.filter(t => !t.completed).map(t => ({
      ...t,
      text: `(Yesterday) ${t.text}` // Mark as carry over
    }));
  }

  // Weekly Plan Injection
  const dayOfWeek = new Date().getDay(); // 0-6
  const todaysPlan = settings.weeklyPlan[dayOfWeek] || { main1: null, main2: null, light: null };
  const todaysSchedule = template
    .filter((b) => isBlockScheduledForDay(b, dayOfWeek, date))
    .map((b) => ({ ...b, isCompleted: false }));

  const newLog: DayLog = {
    date,
    selectedSubjects: {
      main1: todaysPlan.main1,
      main2: todaysPlan.main2,
      light: todaysPlan.light
    },
    additionalSubjects: [],
    schedule: todaysSchedule,
    deepWorkMinutes: 0,
    phoneViolations: 0,
    callCompleted: false,
    reelsAfterCall: null,
    sleepTime: null,
    mood: 3,
    energy: 3,
    scratchpad: '',
    todos: pendingTodos, // Init with carried over tasks
    completedRituals: [], // Init Rituals
    subjectMinutes: {},
    timeEarned: 0, // Init Earned Time
    primaryObjective: toPrimaryObjectiveFromFix(yesterdayLog?.reflection?.fixForTomorrow),
    reflection: {
      whatWentRight: '',
      distractionWin: '',
      fixForTomorrow: '',
    },
    focusSessions: [],
    unlockedAchievements: [],
  };

  if (!dryRun) {
    saveLog(date, newLog);
  }
  return newLog;
};

// --- SMART SCHEDULE LOGIC ---

export const updateScheduleStatus = (blockId: string, completed: boolean) => {
  const date = getTodayDateString();
  const logs = getStoredLog();
  const today = logs[date] || initializeToday();

  today.schedule = today.schedule.map(b =>
    b.id === blockId ? { ...b, isCompleted: completed } : b
  );

  saveLog(date, today);
  return today;
};

// Function 1: Split a block (e.g., finish early -> insert break)
export const splitBlockInSchedule = (
  blockId: string,
  newActivityName: string,
  newMode: 'Rest' | 'Study'
) => {
  const date = getTodayDateString();
  const logs = getStoredLog();
  const today = logs[date] || initializeToday();

  const blockIndex = today.schedule.findIndex(b => b.id === blockId);
  if (blockIndex === -1) return today;

  const currentBlock = today.schedule[blockIndex];
  const now = getCurrentTime24();

  // Guard: Can only split if now is between start and end
  if (now <= currentBlock.startTime || now >= currentBlock.endTime) return today;

  const originalEndTime = currentBlock.endTime;

  // Update current block to end now and be complete
  const updatedCurrentBlock = {
    ...currentBlock,
    endTime: now,
    isCompleted: true
  };

  // Create new filler block (Break or Review)
  const newBlock: ScheduleBlock = {
    id: `split_${Date.now()}`,
    startTime: now,
    endTime: originalEndTime,
    activityName: newActivityName,
    mode: newMode,
    blockType: currentBlock.blockType || 'TASK',
    daysOfWeek: currentBlock.daysOfWeek,
    isCompleted: false
  };

  // Reconstruct array
  const newSchedule = [...today.schedule];
  newSchedule[blockIndex] = updatedCurrentBlock;
  newSchedule.splice(blockIndex + 1, 0, newBlock);

  today.schedule = newSchedule;
  saveLog(date, today);
  return today;
};

// Function 2: Shift entire schedule forward (Finish early -> start next task now)
export const shiftScheduleForward = (blockId: string) => {
  const date = getTodayDateString();
  const logs = getStoredLog();
  const today = logs[date] || initializeToday();

  const blockIndex = today.schedule.findIndex(b => b.id === blockId);
  if (blockIndex === -1 || blockIndex === today.schedule.length - 1) return today;

  const currentBlock = today.schedule[blockIndex];
  const now = getCurrentTime24();

  if (now <= currentBlock.startTime || now >= currentBlock.endTime) return today;

  const timeSaved = getMinutesDiff(now, currentBlock.endTime);

  // Update current block
  today.schedule[blockIndex] = {
    ...currentBlock,
    endTime: now,
    isCompleted: true
  };

  // Tracking: Add to timeEarned
  today.timeEarned = (today.timeEarned || 0) + timeSaved;

  // Shift only flexible blocks; keep fixed events/classes at their original times.
  // Once a fixed block is reached, we stop carrying the shift forward.
  const isFixedBlock = (block: ScheduleBlock) =>
    typeof block.isFixed === 'boolean' ? block.isFixed : inferDefaultFixed(block);

  let remainingShift = timeSaved;
  for (let i = blockIndex + 1; i < today.schedule.length; i++) {
    const b = today.schedule[i];
    if (remainingShift <= 0) break;
    if (isFixedBlock(b)) {
      remainingShift = 0;
      continue;
    }
    today.schedule[i] = {
      ...b,
      startTime: addMinutes(b.startTime, -remainingShift),
      endTime: addMinutes(b.endTime, -remainingShift)
    };
  }

  saveLog(date, today);
  return today;
};

// --- THE FORGE HELPERS ---

export const saveTomorrowObjective = (objective: string) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  const logs = getStoredLog();
  const tomorrowLog = logs[dateStr] || initializeTodayForDate(dateStr);

  tomorrowLog.primaryObjective = objective;
  saveLog(dateStr, tomorrowLog);
};

// Helper for saveTomorrowObjective
const initializeTodayForDate = (date: string): DayLog => {
  const template = getScheduleTemplate();
  const settings = getAppSettings();
  const dayOfWeek = new Date(date).getDay();
  const todaysPlan = settings.weeklyPlan[dayOfWeek] || { main1: null, main2: null, light: null };
  const todaysSchedule = template
    .filter((b) => isBlockScheduledForDay(b, dayOfWeek, date))
    .map((b) => ({ ...b, isCompleted: false }));

  return {
    date,
    selectedSubjects: {
      main1: todaysPlan.main1,
      main2: todaysPlan.main2,
      light: todaysPlan.light
    },
    additionalSubjects: [],
    schedule: todaysSchedule,
    deepWorkMinutes: 0,
    phoneViolations: 0,
    callCompleted: false,
    reelsAfterCall: null,
    sleepTime: null,
    mood: 3,
    energy: 3,
    scratchpad: '',
    todos: [],
    completedRituals: [],
    subjectMinutes: {},
    timeEarned: 0,
    reflection: {
      whatWentRight: '',
      distractionWin: '',
      fixForTomorrow: '',
    },
    focusSessions: [],
    unlockedAchievements: [],
  };
};

export const updateScheduleBlock = (blockId: string, updates: Partial<ScheduleBlock>) => {
  const date = getTodayDateString();
  const logs = getStoredLog();
  const today = logs[date] || initializeToday();

  today.schedule = today.schedule.map(b =>
    b.id === blockId ? { ...b, ...updates } : b
  );

  today.schedule.sort((a, b) => a.startTime.localeCompare(b.startTime));

  saveLog(date, today);
  return today;
};

export const pullBlockToNow = (blockId: string, fromTime?: string): { success: boolean; message: string } => {
  const date = getTodayDateString();
  const logs = getStoredLog();
  const today = logs[date] || initializeToday();
  const blockIndex = today.schedule.findIndex(b => b.id === blockId);
  if (blockIndex === -1) {
    return { success: false, message: 'Next block not found.' };
  }

  const now = fromTime || getCurrentTime24();
  const target = today.schedule[blockIndex];
  if (now >= target.startTime) {
    return { success: false, message: 'This block has already started.' };
  }

  const isFixedBlock = (block: ScheduleBlock) =>
    typeof block.isFixed === 'boolean' ? block.isFixed : inferDefaultFixed(block);
  if (isFixedBlock(target)) {
    return { success: false, message: 'Fixed block cannot be started early.' };
  }

  const pullBy = getMinutesDiff(now, target.startTime);
  if (pullBy <= 0) {
    return { success: false, message: 'No free time to pull from.' };
  }

  for (let i = blockIndex; i < today.schedule.length; i++) {
    const b = today.schedule[i];
    if (isFixedBlock(b)) break;
    today.schedule[i] = {
      ...b,
      startTime: addMinutes(b.startTime, -pullBy),
      endTime: addMinutes(b.endTime, -pullBy),
    };
  }

  saveLog(date, today);
  return { success: true, message: `Started "${target.activityName}" now.` };
};
