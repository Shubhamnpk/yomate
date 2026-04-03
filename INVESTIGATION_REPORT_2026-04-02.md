# Investigation Report

Date: 2026-04-02
Project: `yomeet`
Scope: verify the reported issues first, separate real bugs from false alarms, and draft a short implementation report.

## Summary

Out of the 10 reported items:

- Confirmed bug: 2
- Confirmed missing/partial feature: 1, 3, 6, 9, 10
- Already implemented: 4
- Partially implemented but limited: 5
- Too vague to verify from code alone: 8
- Needs clarification before coding: 1
- Not present in current local curriculum data: 7

## Findings By Item

### 1. Support these strikes from the legacy system

Status: `Needs clarification`

What I found:

- The codebase already supports visual strikethrough in rich text editors and todo displays.
- `ReactQuill` toolbars include `strike` in both [components/NotesView.tsx](/d:/shubham/coding/yomeet/components/NotesView.tsx#L17) and [components/BrainDump.tsx](/d:/shubham/coding/yomeet/components/BrainDump.tsx#L19).
- Todo/task items also render completed text with `line-through` in [components/NotesView.tsx](/d:/shubham/coding/yomeet/components/NotesView.tsx#L202) and [components/BrainDump.tsx](/d:/shubham/coding/yomeet/components/BrainDump.tsx#L124).
- I did not find any explicit legacy migration for “strikes” or old strike-format data.

Assessment:

- This is not confirmed as a real bug yet.
- If “legacy strikes” means old saved editor content is losing strikethrough formatting during migration/import, I need one sample of the old data shape to verify it.

### 2. Header date changes after 12 AM, but calendar/main date stays on previous day

Status: `Confirmed bug`

What I found:

- The header uses `new Date()` directly for display in [components/Timetable.tsx](/d:/shubham/coding/yomeet/components/Timetable.tsx#L540).
- The timetable/calendar state depends on `log.date`, and calendar “today” highlighting checks `cell.date === log.date` in [components/Timetable.tsx](/d:/shubham/coding/yomeet/components/Timetable.tsx#L1007).
- The app generates “today” in many core places with `new Date().toISOString().split('T')[0]`, for example in [App.tsx](/d:/shubham/coding/yomeet/App.tsx#L587), [App.tsx](/d:/shubham/coding/yomeet/App.tsx#L134), and [services/storageService.ts](/d:/shubham/coding/yomeet/services/storageService.ts#L118).
- `toISOString()` is UTC-based, while the visible clock/header is local-time based.
- Productivity code already uses a safer local-date formatter in [services/productivityService.ts](/d:/shubham/coding/yomeet/services/productivityService.ts#L13), which highlights the inconsistency.

Assessment:

- This is a real timezone/date-rollover bug, not a false rumor.
- Likely symptom: after local midnight, the header can move to the new day while `log.date` still points to the UTC day key, so the calendar selection and data remain on the previous day.

Brief cause:

- Mixed use of local date logic and UTC date logic.

### 3. Show Nepali BS date in productivity history and other date-related displays when BS is selected

Status: `Partially missing feature`

What I found:

- A shared BS-aware formatter already exists in [services/dateDisplay.ts](/d:/shubham/coding/yomeet/services/dateDisplay.ts#L100).
- Some screens already use it, such as [components/WeeklyReport.tsx](/d:/shubham/coding/yomeet/components/WeeklyReport.tsx#L27), [components/StatsView.tsx](/d:/shubham/coding/yomeet/components/StatsView.tsx#L170), and [components/Timetable.tsx](/d:/shubham/coding/yomeet/components/Timetable.tsx#L1038).
- Productivity history still renders raw Gregorian strings in several places:
  - chart labels use `entry.date.slice(8)` in [components/ProductivityModule.tsx](/d:/shubham/coding/yomeet/components/ProductivityModule.tsx#L318)
  - expanded headers show `{entry.date} • {entry.time}` in [components/ProductivityModule.tsx](/d:/shubham/coding/yomeet/components/ProductivityModule.tsx#L318)
  - `lastScoreDate` is rendered directly in [components/ProductivityModule.tsx](/d:/shubham/coding/yomeet/components/ProductivityModule.tsx#L317)
- Date filter inputs are still native Gregorian date inputs, which may be acceptable for input, but the display side is not fully BS-aware.

Assessment:

- Real issue.
- The formatter foundation exists, but productivity views are not consistently using it yet.

### 4. After completing the form, ask whether the user wants to change the daily goal

Status: `Already implemented`

What I found:

- After saving, the module sets `setShowTomorrowPrompt(true)` in [components/ProductivityModule.tsx](/d:/shubham/coding/yomeet/components/ProductivityModule.tsx#L200).
- The saved state renders a prompt asking `Do you want to change the daily goals for tomorrow?` in [components/ProductivityModule.tsx](/d:/shubham/coding/yomeet/components/ProductivityModule.tsx#L313).
- There is also an editor flow for updating tomorrow’s monthly and daily goals in the same component.

Assessment:

- This is already present.
- Not a bug.

### 5. Find an alternative way to support Google ICS links and fetch from them

Status: `Partially implemented, but browser-limited`

What I found in code:

- File import of `.ics` is supported in [components/settings/StrategyTab.tsx](/d:/shubham/coding/yomeet/components/settings/StrategyTab.tsx#L169).
- Pasted raw ICS text import is supported in [components/settings/StrategyTab.tsx](/d:/shubham/coding/yomeet/components/settings/StrategyTab.tsx#L217).
- Direct URL import attempts `fetch(icsUrl)` in the browser in [components/settings/StrategyTab.tsx](/d:/shubham/coding/yomeet/components/settings/StrategyTab.tsx#L190).
- The UI already warns that direct URL import may be blocked in [components/settings/StrategyTab.tsx](/d:/shubham/coding/yomeet/components/settings/StrategyTab.tsx#L297).
- ICS parsing/import logic exists in [services/storageService.ts](/d:/shubham/coding/yomeet/services/storageService.ts#L532).

External confirmation:

- Google documents both `Public address in iCal format` and `Secret address in iCal format` for calendars:
  - https://support.google.com/calendar/answer/37083?hl=en-ID
  - https://support.google.com/calendar/answer/37648?hl=en

Assessment:

- The feature exists, but browser-only URL fetch is fragile because many calendar URLs are blocked by browser/network policy or remote server restrictions.
- Best alternatives:
  1. Keep file import and paste import as reliable fallbacks.
  2. Add a small server/proxy endpoint to fetch ICS server-side and return text to the app.
  3. For Google specifically, guide users to use the official iCal address or manual export if direct URL fetch fails.


### 7. Find out any curriculum of MSc Project Management

Status: `Not present locally; external curriculum research needed`

What I found locally:

- Current bundled curriculum data appears focused on pharmacy years and class 11 science in [services/storageService.ts](/d:/shubham/coding/yomeet/services/storageService.ts#L15).
- `CurriculumTracker` imports only `class11ScienceData`, `secondYearData`, and `thirdYearData` in [components/CurriculumTracker.tsx](/d:/shubham/coding/yomeet/components/CurriculumTracker.tsx#L12).
- No local MSc Project Management curriculum exists in the current repo.

External examples I found:

- University of London official MSc Project Management page with module structure:
  - https://www.london.ac.uk/study/courses/postgraduate/msc-project-management
- University of East London official MSc Project Management page with module overview:
  - https://www.uel.ac.uk/postgraduate/courses/msc-project-management

Assessment:

- This is not an existing app bug.
- It is a content expansion request requiring a source decision.

### 8. Improve the data settings with on-demand services and UI enhancement

Status: `Too vague to verify as a single bug`

What I found:

- There is already a data settings screen in [components/settings/DataTab.tsx](/d:/shubham/coding/yomeet/components/settings/DataTab.tsx).
- The request points more toward product/design enhancement than a specific defect.

Assessment:

- Not a verifiable bug in current form.
- Needs scoping into concrete subfeatures before implementation.

### 9. Don’t show the fixed badge in the timetable

Status: `Confirmed issue relative to requested UX`

What I found:

- Timeline cards show a `Fixed` badge for calendar events in [components/Timetable.tsx](/d:/shubham/coding/yomeet/components/Timetable.tsx#L917).
- This is not shown in the calendar day detail cards, only in the main timeline.

Assessment:

- The current behavior definitely exists.
- If the desired behavior is to hide this badge entirely from timetable cards, this is a straightforward UI change.

### 10. Remove the swipe transition between the tab

Status: `Confirmed existing behavior`

What I found:

- Main app view-to-view swipe navigation exists in [App.tsx](/d:/shubham/coding/yomeet/App.tsx#L333).
- Timetable also has internal swipe switching between `TIMELINE` and `CALENDAR` in [components/Timetable.tsx](/d:/shubham/coding/yomeet/components/Timetable.tsx#L472).
- The calendar/timeline panels also animate with slide transitions in [components/Timetable.tsx](/d:/shubham/coding/yomeet/components/Timetable.tsx#L980).

Assessment:

- This behavior is real, not a rumor.
- We will need to confirm whether you want to remove:
  - only the gesture,
  - only the animation,
  - or both.

## Priority Recommendation

Highest priority:

1. Fix item 2 first. It affects the core day model and can make the app feel incorrect after midnight.
2. Then complete item 3 so date display is consistent when BS is selected.
3. Then handle items 9 and 10 because they are contained UI changes.

Medium priority:

4. Improve item 5 with a server-side/proxy-based ICS fetch path.
5. Add item 6 only after deciding which source presets are worth bundling.

Needs clarification/content decision:

6. Item 1 needs one sample of legacy strike data or a clearer definition.
7. Item 7 needs a chosen university/source before adding curriculum content.
8. Item 8 should be split into smaller UI/data settings tasks.

## Final Conclusion

This report confirms that the midnight calendar/date mismatch is a real bug, BS date display is only partially implemented, the “change daily goals after form completion” feature already exists, Google ICS import is partially supported but limited by browser-side URL fetching, and the fixed badge plus swipe behavior are both present and removable.

The most important real defect is item 2 because it affects the app’s core notion of “today”.
