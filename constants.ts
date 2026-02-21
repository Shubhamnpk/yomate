
import { Subject, ScheduleBlock } from './types';

export const ALL_SUBJECTS: Subject[] = [
  // NEB Subjects
  { id: 'neb1', name: 'Physics (NEB)', category: 'Other', priority: 'Normal' },
  { id: 'neb2', name: 'Chemistry (NEB)', category: 'Other', priority: 'Normal' },
  { id: 'neb3', name: 'Biology (NEB)', category: 'Other', priority: 'Normal' },
  { id: 'neb4', name: 'Mathematics (NEB)', category: 'Other', priority: 'Normal' },
  { id: 'neb5', name: 'English (NEB)', category: 'Other', priority: 'Normal' },
  { id: 'neb6', name: 'Nepali (NEB)', category: 'Other', priority: 'Normal' },

  // Pharmacy 2nd Year - Defaults High Priority due to "Student" context
  { id: 'ph1', name: 'Pharm. Chemistry', category: 'Pharmacy', priority: 'High' },
  { id: 'ph2', name: 'Pharmacology', category: 'Pharmacy', priority: 'High' },
  { id: 'ph3', name: 'Pharmaceutics', category: 'Pharmacy', priority: 'High' },
  { id: 'ph4', name: 'Biochemistry', category: 'Pharmacy', priority: 'Normal' },
  { id: 'ph5', name: 'Public Health', category: 'Pharmacy', priority: 'Normal' },
  { id: 'ph6', name: 'Pharmacognosy', category: 'Pharmacy', priority: 'Normal' },
  { id: 'ph7', name: 'Pharm. Management', category: 'Pharmacy', priority: 'Normal' },
  { id: 'ph8', name: 'PharmaTherapeutics', category: 'Pharmacy', priority: 'High' },

  // Coding
  { id: 'code1', name: 'Coding / Dev', category: 'Coding', priority: 'High' },
  { id: 'other_read', name: 'Reading', category: 'Other', priority: 'Normal' },
];

export const DEFAULT_SCHEDULE: ScheduleBlock[] = [
  { id: 'b1', startTime: '07:00', endTime: '08:30', activityName: 'Morning Study (Main 1)', mode: 'Study', isCompleted: false },
  { id: 'b2', startTime: '08:30', endTime: '09:30', activityName: 'Breakfast & Commute', mode: 'Rest', isCompleted: false },
  { id: 'b3', startTime: '09:30', endTime: '16:40', activityName: 'Classes (College)', mode: 'Class', isCompleted: false },
  { id: 'b4', startTime: '16:40', endTime: '17:00', activityName: 'Rest & Commute Back', mode: 'Rest', isCompleted: false },
  
  // Adjusted Evening Block
  { id: 'b5', startTime: '17:00', endTime: '18:00', activityName: 'Deep Work (Coding)', mode: 'Deep Work', isCompleted: false },
  { id: 'b6', startTime: '18:00', endTime: '18:30', activityName: 'Dinner', mode: 'Rest', isCompleted: false },
  { id: 'b7', startTime: '18:30', endTime: '19:00', activityName: 'Shop Duty', mode: 'Class', isCompleted: false },
  
  { id: 'b8', startTime: '19:00', endTime: '21:00', activityName: 'Evening Study (Main 2)', mode: 'Study', isCompleted: false },
  { id: 'b9', startTime: '21:00', endTime: '22:00', activityName: 'Light Review / Journal', mode: 'Study', isCompleted: false },
  { id: 'b10', startTime: '22:00', endTime: '23:00', activityName: 'Call with Partner', mode: 'Human', isCompleted: false },
  { id: 'b11', startTime: '23:00', endTime: '00:20', activityName: 'Sleep Prep', mode: 'Rest', isCompleted: false },
];
