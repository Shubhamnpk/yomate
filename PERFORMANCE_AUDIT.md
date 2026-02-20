# 📊 Performance Audit — Mobile Slowness After RN → Vite Migration

**Reference commit (good):** `b7fa3e7846c5f83ca76511335fb751c7c4825d13`  
**Migration commit (regression introduced):** `84553d40a92beb09b26bb7ee1ce5988aa739ddc8`  
**Audit date:** 2026-02-19  

---

## Root Cause Summary

The migration from React Native to Vite/Web introduced several performance regressions that are **far more impactful on mobile** than on desktop. React Native's JS engine (Hermes) and native renderer handled state-invalidation differently; web browsers must do CSS layout, paint, and composite for every re-render — so patterns that were free on RN are expensive on mobile browsers.

---

## 🔴 Issue 1 — Clock ticks every 1 second → re-renders the ENTIRE tree

**File:** `App.tsx` line 353  
**Code:**
```ts
const interval = setInterval(() => {
  setRealTime(getCurrentTime24());
}, 1000);
```

**Impact:**  
- `realTime` changes every second → `App` re-renders → all child components re-render (Timetable, GlobalSleepHUD, DeepWork).
- On mobile, 60fps rendering budget is ~16ms. Even small re-renders accumulate.
- `Timetable` does heavy `useMemo` and `useEffect` checks on every `currentTime` change.
- The `<GlobalSleepHUD>` also recalculates on every tick.

**Fix:**  
Change tick interval from **1000ms → 60000ms (1 minute)** since the app only needs minute-level precision for schedule tracking. The `DeepWork` timer has its own internal `setInterval` and is unaffected.

---

## 🔴 Issue 2 — Heavy `blur-[120px]` decorative blobs re-painted every render

**File:** `App.tsx` lines 467–471  
**Code:**
```tsx
<div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
  <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[120px] rounded-full animate-pulse-soft"></div>
  <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>
  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
</div>
```

**Impact:**  
- `blur-[120px]` (Gaussian blur) on large divs is one of the **most expensive CSS operations** on mobile GPUs.
- Two animated blobs with `animate-pulse-soft` force GPU re-compositing at ~60fps constantly.
- `mix-blend-overlay` requires the browser to composite layers together, which is expensive.
- External network request to `grainy-gradients.vercel.app` adds latency on mobile networks.

**Fix:**  
- Reduce blur radius to `blur-[60px]` and move blobs to use `will-change: transform` + `contain: strict` to isolate their paint layer.
- Remove the external noise texture network request entirely (static noise can be done via CSS or skipped).
- Add `transform: translateZ(0)` to promote blobs to their own GPU composite layer so they don't trigger main content repaints.

---

## 🔴 Issue 3 — `animate-pulse` on Flame icon causes 60fps animation on every tick re-render

**File:** `Timetable.tsx` line 285  
**Code:**
```tsx
<Flame size={12} className="text-orange-500 fill-orange-500 animate-pulse" />
```

**Impact:**  
- `animate-pulse` is a CSS `opacity` animation running at 60fps.
- Combined with the 1s clock tick, this causes the parent component to repaint frequently.

**Fix:** Use `animation-duration: 2s` via inline style, or switch to a slower `@keyframes` variant to reduce animation frequency.

---

## 🟡 Issue 4 — `Timetable` runs `getBlockProgress` on every block per second

**File:** `Timetable.tsx` lines 472–476  
**Code:**
```tsx
{log.schedule.map((block) => {
  const active = block.id === activeBlockId;
  const progress = active ? getBlockProgress(block.startTime, block.endTime) : 0;
  const minsLeft = active ? getTimeRemaining(block.endTime) : 0;
  ...
```

**Impact:**  
- `getBlockProgress` and `getTimeRemaining` are called on every render, which (before fix 1) happens every second for the active block.
- This cascades into the `style={{ width: \`${progress}%\` }}` being recalculated per tick.

**Fix:**  
Once the clock interval is changed to 60s (Fix 1), this becomes trivial. The progress bar can use CSS `transition-all duration-[60s]` to animate smoothly between minute-level updates.

---

## 🟡 Issue 5 — `DeepWork` active-session background: `blur-[120px]` blob + `animate-[pulse-slow_4s]`

**File:** `DeepWork.tsx` lines 634–638, 692  
**Code:**
```tsx
<div className={`absolute top-1/2 left-1/2 ... w-[120vw] h-[120vw] blur-[120px] rounded-full ...`}>
</div>
<div className={`animate-[pulse-slow_4s_ease-in-out_infinite] ...`}>
```

**Impact:**  
- A `120vw × 120vw` div with `blur-[120px]` is massive on mobile (e.g. on a 390px wide phone = 468px wide blur).
- This is the active timer screen — it's on-screen for the entire focus session (up to 2 hours).
- Mobile GPU exhaustion leads to dropped frames in the SVG timer animation.

**Fix:**  
- Reduce blob size to `w-[80vw] h-[80vw]` and blur to `blur-[80px]`.
- Add `will-change: opacity` + `contain: layout style` to the pulsing container.
- The SVG circle `transition-all duration-1000` is correct and should stay.

---

## 🟡 Issue 6 — `backdrop-filter: blur()` on multiple overlapping elements

**File:** `index.css` (`.glass-morphism`, `.glass` classes), `DeepWork.tsx` line 644, 659  
**Code:**
```css
.glass-morphism {
  backdrop-filter: blur(24px) saturate(180%);
}
.glass {
  backdrop-filter: blur(12px);
}
```

**Impact:**  
- `backdrop-filter` creates a new stacking context and forces the browser to capture a snapshot of everything behind the element and apply a filter.
- Multiple nested `backdrop-filter` elements (Debug console + Sleep HUD + modals) compound this cost.
- On mobile Safari/Chrome, each `backdrop-filter` element is very expensive.

**Fix:**  
- Reduce `glass-morphism` blur from `24px` → `16px`.
- Reduce `glass` blur from `12px` → `8px`.
- Add `@media (prefers-reduced-motion: reduce)` to disable animations for users who have enabled it.

---

## 🟢 Issue 7 — `tailwind.config.js` missing `content` paths (full Tailwind scan)

**File:** `tailwind.config.js`  
**Impact:**  
- If Tailwind is scanning too broadly, the CSS bundle is larger than necessary, slowing initial parse on mobile.

**Fix:** Ensure content paths are specific (`['./index.html', './src/**/*.{ts,tsx}', './*.tsx', './components/**/*.{ts,tsx}']`)

---

## ✅ Summary of Fixes Applied

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | Clock tick 1s → full tree re-render | `App.tsx` | Change `setInterval` to **60000ms** |
| 2 | `blur-[120px]` decorative blobs (x2) | `App.tsx` | Reduce blur + add `will-change` + `contain` + remove external noise |
| 3 | Flame `animate-pulse` on every second | `Timetable.tsx` | Slow animation / no change needed after fix 1 |
| 4 | `getBlockProgress` per second | `Timetable.tsx` | Resolved by fix 1 (60s tick) |
| 5 | DeepWork `120vw` blur blob | `DeepWork.tsx` | Reduce size and blur radius |
| 6 | `backdrop-filter` stacking | `index.css` | Reduce blur values |
| 7 | Vite build chunk size | `vite.config.ts` | Already has manual chunks ✅ |
