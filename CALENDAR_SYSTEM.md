# Calendar System Documentation

> How **YoMeet** handles dual-calendar support: **English (Gregorian)** and **Nepali (Bikram Sambat / विक्रम सम्वत्)**

---

## Table of Contents

1. [Overview](#overview)
2. [Package Dependency](#package-dependency)
3. [The `DateSystem` Type](#the-datesystem-type)
4. [User Setting & Default](#user-setting--default)
5. [Core Service — `dateDisplay.ts`](#core-service--datedisplayts)
   - [Month & Weekday Constants](#month--weekday-constants)
   - [`getDateLocale()`](#getdatelocale)
   - [`formatNepaliDate()`](#formatnepalidate)
   - [`formatDateBySystem()`](#formatdatebysystem)
   - [`formatDateTimeBySystem()`](#formatdatetimebysystem)
   - [`getYearInfoBySystem()`](#getyearinfobysystem)
   - [`parseNepaliDateRange()`](#parsenepalidaterange)
   - [`getDateRangeStatus()`](#getdaterangestatus)
6. [Storage Layer — How Dates Are Stored](#storage-layer--how-dates-are-stored)
7. [Calendar UI — `Timetable.tsx`](#calendar-ui--timetabletsx)
   - [Month Metadata Computation (BS vs. AD)](#month-metadata-computation-bs-vs-ad)
   - [Day-Cell Generation](#day-cell-generation)
8. [How the Setting Flows Through the App](#how-the-setting-flows-through-the-app)
9. [Quick Reference — Function Map](#quick-reference--function-map)

---

## Overview

YoMeet supports two calendar systems simultaneously:

| Calendar | Identifier | Description |
|----------|-----------|-------------|
| **English** | `'ENGLISH'` | Standard Gregorian / AD calendar |
| **Nepali** | `'NEPALI'` | Bikram Sambat (BS) — the official calendar of Nepal, ~56–57 years ahead of AD |

All **internal data** (log keys, event dates, deadlines) is always stored as `YYYY-MM-DD` in the **Gregorian** calendar. The calendar system preference only affects *display*. This means switching between systems never corrupts stored data.

---

## Package Dependency

```json
// package.json
"dependencies": {
  "nepali-date-converter": "^3.4.0"
}
```

**`nepali-date-converter`** is the only external date library used. It exposes a `NepaliDate` class that:
- Converts a JS `Date` → BS date (`new NepaliDate(jsDate)`)
- Converts a BS date → JS `Date` (`.toJsDate()`)
- Provides `.getYear()`, `.getMonth()` (0-based), `.getDate()`, `.getDay()` accessors

---

## The `DateSystem` Type

Defined in `types.ts`:

```ts
export type DateSystem = 'ENGLISH' | 'NEPALI';
```

It is part of `AppSettings`:

```ts
export interface AppSettings {
  // ...
  dateSystem: DateSystem;
  // ...
}
```

---

## User Setting & Default

**Default value** (in `storageService.ts`):

```ts
const DEFAULT_SETTINGS: AppSettings = {
  dateSystem: 'ENGLISH',   // ← Gregorian is the default
  // ...
};
```

**Settings persistence key:** `youmeet_settings_v1` in `localStorage`.

**UI toggle** is in `components/settings/AppearanceTab.tsx` under the "Date System" section:

```tsx
{ id: 'ENGLISH', label: 'English', desc: 'Gregorian' },
{ id: 'NEPALI',  label: 'Nepali',  desc: 'Bikram Sambat' },
```

Clicking a button calls:
```ts
handleSaveSettings({ ...settings, dateSystem: system.id as AppSettings['dateSystem'] });
```

---

## Core Service — `dateDisplay.ts`

> **Path:** `services/dateDisplay.ts`  
> **Import:** `import NepaliDate from 'nepali-date-converter';`

This file is the **single source of truth** for all date formatting in the app.

---

### Month & Weekday Constants

```ts
const BS_MONTHS_SHORT = ['Bai', 'Jes', 'Asa', 'Shr', 'Bha', 'Asw', 'Kar', 'Man', 'Pou', 'Mag', 'Fal', 'Cha'];
const BS_MONTHS_LONG  = ['Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashwin',
                         'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
const WEEKDAYS_SHORT  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_LONG   = ['Sunday', 'Monday', ...];
```

Also exported for parsing:

```ts
export const MONTHS_MAP: Record<string, number> = {
  baisakh: 0, baishakh: 0,
  jestha: 1, jeth: 1,
  ashad: 2, asar: 2,
  // ... all 12 months with common variant spellings
};

export const MONTH_NAMES = ['Baisakh', 'Jestha', 'Ashad', 'Shrawan', 'Bhadra', 'Ashwin',
                             'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
```

---

### `getDateLocale()`

```ts
export const getDateLocale = (dateSystem: DateSystem): string =>
  dateSystem === 'NEPALI' ? 'ne-NP-u-ca-bikram-sambat' : 'en-US';
```

Returns a BCP 47 locale string. Used when falling back to `Intl.DateTimeFormat` for English mode.

---

### `formatNepaliDate()`

*(Internal, not exported)*

Converts a JS `Date` to a human-readable BS date string, respecting `Intl.DateTimeFormatOptions`-style options.

**Flow:**
```
JS Date
  ↓ new NepaliDate(date)
BS year / month / day / weekday
  ↓ apply options (weekday, month, day, year formats)
  ↓ build string parts
"Baisakh 15, 2082" (or any variant)
```

**Supported option combinations:**

| `options`                                | Example output |
|------------------------------------------|----------------|
| `undefined`                              | `2082/01/15` |
| `{ weekday: 'short' }`                   | `Sat` |
| `{ weekday: 'long' }`                    | `Saturday` |
| `{ month: 'long', year: 'numeric' }`     | `Baisakh 2082` |
| `{ month: 'short', day: 'numeric' }`     | `Bai 15` |
| `{ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }` | `Saturday, Baisakh 15, 2082` |

---

### `formatDateBySystem()`

**Signature:**
```ts
export const formatDateBySystem = (
  value: Date | string,
  dateSystem: DateSystem,
  options?: Intl.DateTimeFormatOptions
): string
```

**Main entry point** used across the entire app for date-only formatting.

- Accepts either a `Date` object or a `YYYY-MM-DD` string
- String parsing avoids UTC day-shift by constructing `new Date(year, month-1, day, 12, 0, 0)`
- Delegates to `formatNepaliDate()` for `'NEPALI'`, or `date.toLocaleDateString('en-US', options)` for `'ENGLISH'`

**Usage examples across the codebase:**

```ts
// Timetable header — today's date
formatDateBySystem(new Date(), dateSystem, { weekday: 'short', month: 'long', day: 'numeric' })
// → "Sat, Baisakh 15" (BS) or "Sat, April 28" (AD)

// Stats heatmap label
formatDateBySystem(date, settings.dateSystem, { year: 'numeric', month: 'short', day: 'numeric' })

// Deadline display
formatDateBySystem(deadline.date, settings.dateSystem)
// → "2082/01/15" (BS) or "4/28/2025" (AD)

// Calendar month header
formatDateBySystem(firstDate, dateSystem, { month: 'long', year: 'numeric' })
// → "Baisakh 2082" (BS) or "April 2025" (AD)

// Weekly report generation date
formatDateBySystem(new Date(), dateSystem, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
```

---

### `formatDateTimeBySystem()`

```ts
export const formatDateTimeBySystem = (
  value: Date | string,
  dateSystem: DateSystem,
  options?: Intl.DateTimeFormatOptions
): string
```

Like `formatDateBySystem` but includes time. For Nepali mode, it:
1. Formats the date part using BS (via `formatNepaliDate`)
2. Formats the time part using `en-US` locale (12h with AM/PM)
3. Concatenates: `"Baisakh 15, 2082 10:30 AM"`

---

### `getYearInfoBySystem()`

```ts
export const getYearInfoBySystem = (
  dateSystem: DateSystem,
  refDate: Date | string = new Date()
): { year: number; start: Date; end: Date; label: string }
```

Returns the **year boundaries** in the active system, used for the Stats year-heatmap:

| System | `year` | `start` | `end` | `label` |
|--------|--------|---------|-------|---------|
| ENGLISH | 2025 | Jan 1, 2025 | Dec 31, 2025 | `"2025"` |
| NEPALI | 2082 | Baisakh 1, 2082 (~Apr 14, 2025) | Chaitra 30, 2082 (~Apr 13, 2026) | `"2082 BS"` |

For Nepali, it converts BS year boundaries back to JS `Date` for range calculations.

---

### `parseNepaliDateRange()`

```ts
export const parseNepaliDateRange = (rangeStr: string): { start: Date; end: Date } | null
```

Parses natural-language BS date range strings, used for academic/exam schedule imports:

```
"22nd - 26th Magh, 2082"         → { start: Date(Magh 22, 2082), end: Date(Magh 26, 2082) }
"28th Magh - 4th Falgun, 2082"   → { start: Date(Magh 28, 2082), end: Date(Falgun 4, 2082) }
```

**Logic:**
1. Strips ordinal suffixes, normalizes case
2. Extracts the year from the last token (falls back to current BS year)
3. Splits on `-`, `to`, or `till`
4. Parses each part against `MONTHS_MAP` (with variant spellings)
5. Handles year rollover when end month < start month
6. Converts each BS date → JS `Date` via `.toJsDate()`

---

### `getDateRangeStatus()`

```ts
export const getDateRangeStatus = (startDate: Date, endDate: Date) =>
  { status: 'upcoming' | 'open' | 'closed'; daysRemaining: number; openingDay: string; closingDay: string }
```

Calendar-system-agnostic utility (operates on JS `Date` objects directly).  
Used to compute deadline/event status badges in the UI.

---

## Storage Layer — How Dates Are Stored

All date keys and date strings in `localStorage` are **always Gregorian `YYYY-MM-DD`**, regardless of the active date system.

| Storage Key | Format | Example |
|-------------|--------|---------|
| Day log keys (`youmeet_data_v5`) | `YYYY-MM-DD` | `"2025-04-28"` |
| `ScheduleBlock.eventDate` | `YYYY-MM-DD` | `"2025-04-28"` |
| `Deadline.date` | `YYYY-MM-DD` | `"2025-05-15"` |
| `FocusSession.startAt / endAt` | ISO string | `"2025-04-28T10:00:00.000Z"` |

**Key helpers in `storageService.ts`:**

```ts
// Convert JS Date → storage key
const toLocalDateKey = (date: Date): string => {
  // Uses local year/month/day to avoid UTC shift
  return `${year}-${month}-${day}`;
};

// Parse storage key → local midnight JS Date
const parseDateKeyLocal = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Get today's key
export const getTodayDateString = (): string => toLocalDateKey(new Date());
```

> **Key design:** There is no timezone conversion at the storage boundary. Dates are always treated as **local wall-clock dates**.

---

## Calendar UI — `Timetable.tsx`

The full-featured monthly calendar is rendered inside `Timetable.tsx` when the user switches to the `'CALENDAR'` panel.

### Month Metadata Computation (BS vs. AD)

```ts
const calendarMonthMeta = useMemo(() => {
  if (dateSystem === 'NEPALI') {
    const bs = new NepaliDate(calendarAnchorDate);
    const year = bs.getYear();
    const month = bs.getMonth(); // 0-based (0 = Baisakh)

    const firstDate = new NepaliDate(year, month, 1).toJsDate();
    const nextMonthDate = month === 11
      ? new NepaliDate(year + 1, 0, 1).toJsDate()
      : new NepaliDate(year, month + 1, 1).toJsDate();

    const endDate = new Date(nextMonthDate);
    endDate.setDate(endDate.getDate() - 1);
    const daysInMonth = new NepaliDate(endDate).getDate();

    return {
      label: formatDateBySystem(firstDate, 'NEPALI', { month: 'long', year: 'numeric' }),
      firstDate,
      daysInMonth,            // e.g., 31 (BS months vary 29–32 days)
      startWeekday: firstDate.getDay(),
      prevMonthAnchor: ...,   // NepaliDate of prev month's 1st
      nextMonthAnchor: nextMonthDate,
    };
  }

  // English (Gregorian) path
  const year = calendarAnchorDate.getFullYear();
  const month = calendarAnchorDate.getMonth();
  const firstDate = new Date(year, month, 1, 12, 0, 0);
  return {
    label: formatDateBySystem(firstDate, 'ENGLISH', { month: 'long', year: 'numeric' }),
    firstDate,
    daysInMonth: new Date(year, month + 1, 0).getDate(), // standard JS trick
    startWeekday: firstDate.getDay(),
    prevMonthAnchor: new Date(year, month - 1, 1, 12, 0, 0),
    nextMonthAnchor: new Date(year, month + 1, 1, 12, 0, 0),
  };
}, [calendarAnchorDate, dateSystem]);
```

> **Note:** BS months vary in length (29–32 days). The library handles this correctly. The "days in month" is computed by finding the last day of the month via the next month's first day minus one.

---

### Day-Cell Generation

```ts
const calendarDays = useMemo(() => {
  const cells = [];

  // Leading empty cells for the start weekday
  for (let i = 0; i < calendarMonthMeta.startWeekday; i++) {
    cells.push({ key: `empty-start-${i}`, date: null, currentMonth: false });
  }

  // Day cells — always converted to Gregorian string for storage lookup
  for (let day = 1; day <= calendarMonthMeta.daysInMonth; day++) {
    const jsDate = dateSystem === 'NEPALI'
      ? new NepaliDate(...).toJsDate()   // BS day → JS Date
      : new Date(year, month, day, 12);

    const dateStr = toLocalDateString(jsDate); // Always "YYYY-MM-DD" (Gregorian)
    cells.push({ key: dateStr, date: dateStr, currentMonth: true });
  }

  // Trailing empty cells to complete the grid row
  while (cells.length % 7 !== 0) {
    cells.push({ key: `empty-end-${cells.length}`, date: null, currentMonth: false });
  }

  return cells;
}, [calendarMonthMeta, dateSystem]);
```

Each cell's `date` value is **always a Gregorian key**, ensuring consistent lookups against `DayLog` records regardless of which calendar is displayed.

---

## How the Setting Flows Through the App

```
User taps "Nepali" in Settings (AppearanceTab.tsx)
  ↓
handleSaveSettings({ ...settings, dateSystem: 'NEPALI' })
  ↓
saveAppSettings() → localStorage('youmeet_settings_v1')
  ↓
Components read it via getAppSettings().dateSystem
  ↓
Pass to formatDateBySystem(date, dateSystem, options)
  ↓
formatNepaliDate(date, options)  ←→  NepaliDate library
  ↓
Displayed BS date in every view
```

**Components that consume `dateSystem`:**

| Component | How it gets `dateSystem` | What it formats |
|-----------|--------------------------|-----------------|
| `Timetable.tsx` | `useState` initialized from `getAppSettings()` | Today's header date, calendar grid month label, selected day detail |
| `StatsView.tsx` | `settings.dateSystem` prop/read | Heatmap day labels, year range, focus session timestamps, deadline dates |
| `WeeklyReport.tsx` | `dateSystem` prop | Report generation date |
| `ProductivityModule.tsx` | `getAppSettings().dateSystem` | Entry dates in history list and chart axis |
| `CurriculumTracker.tsx` | `getAppSettings().dateSystem` | Progress `updatedAt` display |
| `settings/StrategyTab.tsx` | `settings.dateSystem` | Deadline dates in horizon list |

---

## Quick Reference — Function Map

| Function | File | Purpose |
|----------|------|---------|
| `formatDateBySystem()` | `services/dateDisplay.ts` | **Primary display** — date only |
| `formatDateTimeBySystem()` | `services/dateDisplay.ts` | Date + time display |
| `getYearInfoBySystem()` | `services/dateDisplay.ts` | Year boundaries for stats heatmap |
| `getDateLocale()` | `services/dateDisplay.ts` | BCP 47 locale string |
| `parseNepaliDateRange()` | `services/dateDisplay.ts` | Parse "22nd Magh - 4th Falgun, 2082" |
| `getDateRangeStatus()` | `services/dateDisplay.ts` | upcoming / open / closed badge |
| `getTodayDateString()` | `services/storageService.ts` | Today as `YYYY-MM-DD` (always Gregorian) |
| `toLocalDateKey()` *(private)* | `services/storageService.ts` | JS Date → `YYYY-MM-DD` storage key |
| `parseDateKeyLocal()` *(private)* | `services/storageService.ts` | `YYYY-MM-DD` → local JS Date |

---

*Generated: 2026-04-05*
