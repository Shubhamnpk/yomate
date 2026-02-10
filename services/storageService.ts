
import { DayLog, ScheduleBlock, Subject, AppSettings, WeeklyPlan } from '../types';
import { DEFAULT_SCHEDULE, ALL_SUBJECTS } from '../constants';
import { addMinutes, getCurrentTime24, getMinutesDiff } from './timeService';

// Bumped to v5 for new Settings features
const STORAGE_KEY = 'youmeet_data_v5';
const TEMPLATE_KEY = 'youmeet_template_v1';
const SUBJECTS_KEY = 'youmeet_subjects_v1';
const SETTINGS_KEY = 'youmeet_settings_v1';

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getStoredLog = (): Record<string, DayLog> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
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

const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Student',
  themeAccent: 'indigo',
  themeMode: 'zinc',
  enableSounds: true,
  defaultFocusMinutes: 60,
  appMode: 'Normal',
  weeklyPlan: DEFAULT_WEEKLY_PLAN,
  deadlines: [],
  rituals: ['Exercise', 'Reading', 'Meditation'], // Default Habits
};

export const getAppSettings = (): AppSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  // Merge with default to ensure new fields (userName, weeklyPlan, deadlines, rituals) exist for old users
  const parsed = stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...parsed, weeklyPlan: { ...DEFAULT_WEEKLY_PLAN, ...parsed.weeklyPlan } };
};

export const saveAppSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// --- TEMPLATE MANAGEMENT ---

export const getScheduleTemplate = (): ScheduleBlock[] => {
  const stored = localStorage.getItem(TEMPLATE_KEY);
  return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
};

export const saveScheduleTemplate = (schedule: ScheduleBlock[]) => {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(schedule));
};

export const getCustomSubjects = (): Subject[] => {
  const stored = localStorage.getItem(SUBJECTS_KEY);
  return stored ? JSON.parse(stored) : ALL_SUBJECTS;
};

export const saveCustomSubjects = (subjects: Subject[]) => {
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
};

// --- DATA MANAGEMENT (Import/Export/Reset) ---

export const exportData = () => {
  const data = {
    logs: getStoredLog(),
    template: getScheduleTemplate(),
    subjects: getCustomSubjects(),
    settings: getAppSettings(),
    version: 'v5'
  };
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
    if (data.logs) localStorage.setItem(STORAGE_KEY, JSON.stringify(data.logs));
    if (data.template) localStorage.setItem(TEMPLATE_KEY, JSON.stringify(data.template));
    if (data.subjects) localStorage.setItem(SUBJECTS_KEY, JSON.stringify(data.subjects));
    if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
    window.location.reload();
  } catch (e) {
    alert("Invalid backup file.");
  }
};

export const resetApp = () => {
  if (confirm("Are you sure? This will delete all history, custom subjects, and settings.")) {
    localStorage.clear();
    window.location.reload();
  }
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

// New Helper: Get specifically yesterday's log to see reflection
export const getYesterdayLog = (): DayLog | null => {
  const logs = getStoredLog();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];
  return logs[dateStr] || null;
};

export const saveLog = (date: string, data: DayLog) => {
  const allLogs = getStoredLog();
  allLogs[date] = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allLogs));
};

export const initializeToday = (dryRun = false): DayLog => {
  const date = getTodayDateString();
  const logs = getStoredLog();

  if (logs[date] && !dryRun) {
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
    return logs[date];
  }

  const template = getScheduleTemplate();
  const settings = getAppSettings();

  // Weekly Plan Injection
  const dayOfWeek = new Date().getDay(); // 0-6
  const todaysPlan = settings.weeklyPlan[dayOfWeek] || { main1: null, main2: null, light: null };

  const newLog: DayLog = {
    date,
    selectedSubjects: {
      main1: todaysPlan.main1,
      main2: todaysPlan.main2,
      light: todaysPlan.light
    },
    schedule: template,
    deepWorkMinutes: 0,
    phoneViolations: 0,
    callCompleted: false,
    reelsAfterCall: null,
    sleepTime: null,
    mood: 3,
    energy: 3,
    scratchpad: '',
    todos: [], // Init Todos
    completedRituals: [], // Init Rituals
    timeEarned: 0, // Init Earned Time
    reflection: {
      whatWentRight: '',
      distractionWin: '',
      fixForTomorrow: '',
    }
  };

  // Look for primary objective set yesterday
  const yesterday = getYesterdayLog();
  if (yesterday && yesterday.reflection.fixForTomorrow) {
    // We already use fixForTomorrow as a hint in Timetable, but we can also use tomorrowObjective if we add it
  }

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

  // Shift all subsequent blocks
  for (let i = blockIndex + 1; i < today.schedule.length; i++) {
    const b = today.schedule[i];
    today.schedule[i] = {
      ...b,
      startTime: addMinutes(b.startTime, -timeSaved),
      endTime: addMinutes(b.endTime, -timeSaved)
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

  return {
    date,
    selectedSubjects: {
      main1: todaysPlan.main1,
      main2: todaysPlan.main2,
      light: todaysPlan.light
    },
    schedule: template,
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
    timeEarned: 0,
    reflection: {
      whatWentRight: '',
      distractionWin: '',
      fixForTomorrow: '',
    }
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
