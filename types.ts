
export type ActivityMode = 'Study' | 'Deep Work' | 'Human' | 'Rest' | 'Class';

export interface ScheduleBlock {
  id: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  activityName: string;
  mode: ActivityMode;
  isCompleted: boolean;
}

export interface Subject {
  id: string;
  name: string;
  category: 'Pharmacy' | 'Coding' | 'Other';
  priority?: 'High' | 'Normal'; // New field for rotation logic
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Deadline {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'Exam' | 'Assignment' | 'Project' | 'Other';
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  selectedSubjects: {
    main1: string | null;
    main2: string | null;
    light: string | null;
  };
  schedule: ScheduleBlock[];
  deepWorkMinutes: number;
  phoneViolations: number; // "In hand" selections
  callCompleted: boolean;
  reelsAfterCall: boolean | null; // null = not answered yet, false = good, true = bad
  sleepTime: string | null; // HH:mm
  mood: number; // 1-5
  energy: number; // 1-5
  scratchpad: string; // Brain Dump text
  todos: TodoItem[]; // Brain Dump Todos
  completedRituals: string[]; // Tracked Habits
  timeEarned: number; // For "Momentum Shift" efficiency tracking
  primaryObjective?: string; // For "The Forge"
  reflection: {
    whatWentRight: string;
    distractionWin: string;
    fixForTomorrow: string;
    aiMentorFeedback?: string;
  };
}

export type AppMode = 'Normal' | 'Serious' | 'Exam';

export interface WeeklyPlan {
  // 0 = Sunday, 1 = Monday, etc.
  [key: number]: {
    main1: string | null;
    main2: string | null;
    light: string | null;
  };
}

export interface AppSettings {
  userName: string; // Personalization
  themeAccent: 'indigo' | 'emerald' | 'rose' | 'violet' | 'orange';
  themeMode: 'zinc' | 'black' | 'light'; // zinc = original deep gray, black = OLED, light = clean white
  enableSounds: boolean;
  defaultFocusMinutes: number; // Workflow preference
  appMode: AppMode;
  weeklyPlan: WeeklyPlan; // Weekly Scheduler
  deadlines: Deadline[]; // Horizon Feature
  rituals: string[]; // New: Habits
}

export type ViewState = 'TIMETABLE' | 'PLAN' | 'FOCUS' | 'NOTES' | 'NIGHT' | 'STATS';

export interface PhoneCheckResult {
  location: 'desk' | 'room' | 'hand';
  timestamp: number;
}
