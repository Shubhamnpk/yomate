
// Helper to convert 24h string (HH:mm) to 12h string (h:mm AM/PM)
export const formatTo12h = (time24: string): string => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const formatTimeByPreference = (time24: string, format: '12H' | '24H' = '12H'): string => {
  if (!time24) return '';
  return format === '24H' ? time24 : formatTo12h(time24);
};

// Check if current time is within a range
export const isTimeInRange = (current: string, start: string, end: string): boolean => {
  if (end < start) {
    // Handles overnight ranges like 22:00 - 05:00
    return current >= start || current < end;
  }
  return current >= start && current < end;
};

// Get current 24h time HH:mm
export const getCurrentTime24 = (): string => {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

// --- Time Math Helpers ---

export const getMinutesDiff = (start: string, end: string): number => {
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);

  let startMins = h1 * 60 + m1;
  let endMins = h2 * 60 + m2;

  // If end is before start, assume it's next day
  if (endMins < startMins) {
    endMins += 24 * 60;
  }

  return endMins - startMins;
};

export const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  let totalMinutes = h * 60 + m + minutes;

  // Handle negative minutes
  while (totalMinutes < 0) totalMinutes += 24 * 60;

  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
};
