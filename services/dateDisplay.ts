import { DateSystem } from '../types';
import NepaliDate from 'nepali-date-converter';

export const getDateLocale = (dateSystem: DateSystem): string => {
  return dateSystem === 'NEPALI' ? 'ne-NP-u-ca-bikram-sambat' : 'en-US';
};

const BS_MONTHS_SHORT = ['Bai', 'Jes', 'Asa', 'Shr', 'Bha', 'Asw', 'Kar', 'Man', 'Pou', 'Mag', 'Fal', 'Cha'];
const BS_MONTHS_LONG = ['Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Aswin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const MONTHS_MAP: Record<string, number> = {
  baisakh: 0, baishakh: 0,
  jestha: 1, jeth: 1,
  ashad: 2, asar: 2, ashadh: 2,
  shrawan: 3, saun: 3,
  bhadra: 4, bhadu: 4,
  ashwin: 5, asoj: 5,
  kartik: 6,
  mangsir: 7, mansir: 7,
  poush: 8, pus: 8,
  magh: 9, mgh: 9, math: 9,
  falgun: 10, phagun: 10,
  chaitra: 11, chait: 11,
};

export const MONTH_NAMES = [
  'Baisakh', 'Jestha', 'Ashad', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra',
];

const parseInputDate = (value: Date | string): Date => {
  if (value instanceof Date) return value;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match) {
    // Parse storage date keys as local dates to avoid UTC day-shift.
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0);
  }
  return new Date(value);
};

const pad2 = (n: number) => String(n).padStart(2, '0');

const formatNepaliDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  const bs = new NepaliDate(date);
  const year = bs.getYear();
  const monthIndex = bs.getMonth();
  const dayOfMonth = bs.getDate();
  const weekdayIndex = bs.getDay();

  if (!options) {
    return `${year}/${pad2(monthIndex + 1)}/${pad2(dayOfMonth)}`;
  }

  if (options.weekday && !options.month && !options.day && !options.year) {
    if (options.weekday === 'narrow') return WEEKDAYS_SHORT[weekdayIndex].charAt(0);
    if (options.weekday === 'short') return WEEKDAYS_SHORT[weekdayIndex];
    return WEEKDAYS_LONG[weekdayIndex];
  }

  const weekdayPart = options.weekday
    ? (options.weekday === 'narrow'
      ? WEEKDAYS_SHORT[weekdayIndex].charAt(0)
      : options.weekday === 'short'
        ? WEEKDAYS_SHORT[weekdayIndex]
        : WEEKDAYS_LONG[weekdayIndex])
    : '';

  const monthPart = options.month
    ? (options.month === 'numeric'
      ? String(monthIndex + 1)
      : options.month === '2-digit'
        ? pad2(monthIndex + 1)
        : options.month === 'short' || options.month === 'narrow'
          ? BS_MONTHS_SHORT[monthIndex]
          : BS_MONTHS_LONG[monthIndex])
    : '';

  const dayPart = options.day
    ? (options.day === '2-digit' ? pad2(dayOfMonth) : String(dayOfMonth))
    : '';

  const yearPart = options.year
    ? (options.year === '2-digit' ? String(year).slice(-2) : String(year))
    : '';

  let datePart = '';
  if (monthPart && dayPart && yearPart) datePart = `${monthPart} ${dayPart}, ${yearPart}`;
  else if (monthPart && dayPart) datePart = `${monthPart} ${dayPart}`;
  else if (yearPart && monthPart) datePart = `${monthPart} ${yearPart}`;
  else if (yearPart && dayPart) datePart = `${dayPart}/${yearPart}`;
  else datePart = [yearPart, monthPart, dayPart].filter(Boolean).join('/');

  if (weekdayPart && datePart) return `${weekdayPart}, ${datePart}`;
  return weekdayPart || datePart || `${year}/${pad2(monthIndex + 1)}/${pad2(dayOfMonth)}`;
};

export const formatDateBySystem = (
  value: Date | string,
  dateSystem: DateSystem,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = parseInputDate(value);
  if (dateSystem === 'NEPALI') {
    return formatNepaliDate(date, options);
  }
  return date.toLocaleDateString(getDateLocale(dateSystem), options);
};

export const formatDateTimeBySystem = (
  value: Date | string,
  dateSystem: DateSystem,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = parseInputDate(value);
  if (dateSystem === 'NEPALI') {
    const datePart = formatNepaliDate(date, { year: 'numeric', month: 'short', day: 'numeric' });
    const timePart = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${datePart} ${timePart}`;
  }
  return date.toLocaleString(getDateLocale(dateSystem), options);
};

export const getYearInfoBySystem = (
  dateSystem: DateSystem,
  refDate: Date | string = new Date()
): { year: number; start: Date; end: Date; label: string } => {
  const ref = parseInputDate(refDate);

  if (dateSystem === 'NEPALI') {
    const bsNow = new NepaliDate(ref);
    const bsYear = bsNow.getYear();
    const start = new NepaliDate(bsYear, 0, 1).toJsDate();
    const nextStart = new NepaliDate(bsYear + 1, 0, 1).toJsDate();
    const end = new Date(nextStart);
    end.setDate(end.getDate() - 1);
    return { year: bsYear, start, end, label: `${bsYear} BS` };
  }

  const year = ref.getFullYear();
  return { year, start: new Date(year, 0, 1), end: new Date(year, 11, 31), label: `${year}` };
};

/**
 * Parses values like:
 * - "22nd - 26th Magh, 2082"
 * - "28th Magh - 4th Falgun, 2082"
 */
export const parseNepaliDateRange = (rangeStr: string): { start: Date; end: Date } | null => {
  try {
    const cleanRange = rangeStr.toLowerCase().replace(/,/g, '').trim();
    const parts = cleanRange.split(/\s+/);

    let year = NaN;
    let rangePart = cleanRange;
    const lastPart = parts[parts.length - 1];

    if (/^\d{4}$/.test(lastPart)) {
      year = Number.parseInt(lastPart, 10);
      rangePart = cleanRange.slice(0, cleanRange.lastIndexOf(lastPart)).trim();
    } else {
      year = new NepaliDate().getYear();
    }

    const splitParts = rangePart.split(/\s*(?:-|to|till)\s*/);
    if (splitParts.length !== 2) return null;

    const startPart = splitParts[0].trim();
    const endPart = splitParts[1].trim();

    const parsePart = (part: string, fallbackMonth?: number) => {
      const dayMatch = part.match(/(\d+)/);
      if (!dayMatch) return null;
      const day = Number.parseInt(dayMatch[1], 10);

      let month = fallbackMonth;
      for (const [mName, mIndex] of Object.entries(MONTHS_MAP)) {
        if (part.includes(mName)) {
          month = mIndex;
          break;
        }
      }

      if (month === undefined) return null;
      return { day, month };
    };

    const endInfo = parsePart(endPart);
    if (!endInfo) return null;

    const startInfo = parsePart(startPart, endInfo.month);
    if (!startInfo) return null;

    let endYear = year;
    if (endInfo.month < startInfo.month) {
      endYear += 1;
    }

    const startDateBS = new NepaliDate(year, startInfo.month, startInfo.day);
    const endDateBS = new NepaliDate(endYear, endInfo.month, endInfo.day);

    return {
      start: startDateBS.toJsDate(),
      end: endDateBS.toJsDate(),
    };
  } catch {
    return null;
  }
};

export const getDateRangeStatus = (startDate: Date, endDate: Date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  const openingDay = WEEKDAYS_FULL[startDate.getDay()];
  const closingDay = WEEKDAYS_FULL[endDate.getDay()];

  if (today < start) {
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { status: 'upcoming' as const, daysRemaining: diffDays, openingDay, closingDay };
  }
  if (today <= end) {
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { status: 'open' as const, daysRemaining: diffDays, openingDay, closingDay };
  }
  return { status: 'closed' as const, daysRemaining: 0, openingDay, closingDay };
};
