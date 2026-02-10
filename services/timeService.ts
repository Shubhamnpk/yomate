
// Helper to convert 24h string (HH:mm) to 12h string (h:mm AM/PM)
export const formatTo12h = (time24: string): string => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Check if current time is within a range
export const isTimeInRange = (current: string, start: string, end: string): boolean => {
  if (end < start) {
    return current >= start || current < end;
  }
  return current >= start && current < end;
};

// Get current 24h time HH:mm
export const getCurrentTime24 = (): string => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

// --- Time Math Helpers ---

export const getMinutesDiff = (start: string, end: string): number => {
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  const startMins = h1 * 60 + m1;
  const endMins = h2 * 60 + m2;
  return endMins - startMins;
};

export const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
};
