
import React, { useMemo, useState, useEffect } from 'react';
import { getHistory, getCustomSubjects, getAppSettings } from '../services/storageService';
import { Subject, AppSettings, DayLog } from '../types';
import { BarChart3, AlertTriangle, CheckCircle, GraduationCap, Flag, Milestone, AlertOctagon, Sparkles, CalendarDays, Trophy } from 'lucide-react';
import { WeeklyReport } from './WeeklyReport';
import { formatDateBySystem, formatDateTimeBySystem, getYearInfoBySystem } from '../services/dateDisplay';

export const StatsView: React.FC = React.memo(() => {
  const ACCENT_HEX: Record<AppSettings['themeAccent'], string> = {
    indigo: '#6366f1',
    emerald: '#10b981',
    rose: '#f43f5e',
    violet: '#8b5cf6',
    orange: '#f97316',
  };
  const hexToRgba = (hex: string, alpha: number) => {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  // Use 14 days for coverage stat to be meaningful
  const history = useMemo(() => getHistory(14), []);
  const rolling90History = useMemo(() => getHistory(90), []);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [showReport, setShowReport] = useState(false);
  const yearHistory = useMemo(() => getHistory(365), []);
  const allRecentLogs = useMemo(() => getHistory(400), []);
  const [heatmapView, setHeatmapView] = useState<'90D' | 'YEAR'>('90D');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const accentHex = ACCENT_HEX[settings.themeAccent] || ACCENT_HEX.indigo;

  useEffect(() => {
    setSubjects(getCustomSubjects());
    setSettings(getAppSettings());
  }, []);

  useEffect(() => {
    if (selectedSubjectId === 'ALL') return;
    if (!subjects.some(s => s.id === selectedSubjectId)) {
      setSelectedSubjectId('ALL');
    }
  }, [subjects, selectedSubjectId]);

  const subjectStats = useMemo(() => {
    // ... existing logic ...
    const counts: Record<string, number> = {};
    const touchedSubjects = new Set<string>();

    subjects.forEach(s => counts[s.id] = 0);

    history.forEach(log => {
      const uniqueIds = Array.from(new Set([
        log.selectedSubjects.main1,
        log.selectedSubjects.main2,
        log.selectedSubjects.light,
        ...(log.additionalSubjects || []),
      ].filter(Boolean) as string[]));
      uniqueIds.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
        touchedSubjects.add(id);
      });
    });

    return {
      sorted: Object.entries(counts).sort(([, a], [, b]) => b - a),
      coverage: subjects.length > 0 ? Math.round((touchedSubjects.size / subjects.length) * 100) : 0
    };
  }, [history, subjects]);

  const last7Days = history.slice(0, 7);
  // ... existing calculation ...
  const deepWorkTotal = last7Days.reduce((acc, curr) => acc + curr.deepWorkMinutes, 0);
  const totalViolations = last7Days.reduce((acc, curr) => acc + curr.phoneViolations, 0);

  // Filter deadlines for future only
  const upcomingDeadlines = (settings.deadlines || [])
    .filter(d => new Date(d.date).getTime() > (new Date().getTime() - 86400000))
    .sort((a, b) => a.date.localeCompare(b.date));

  const aiInsight = useMemo(() => {
    // ... keep existing aiInsight logic ...
    if (history.length < 3) return {
      message: "I'm still learning your patterns. Keep focusing to unlock deep insights.",
      type: 'neutral'
    };

    const recent = history.slice(-3);
    const avgMins = recent.reduce((acc, curr) => acc + curr.deepWorkMinutes, 0) / 3;
    const avgViolations = recent.reduce((acc, curr) => acc + curr.phoneViolations, 0) / 3;

    if (avgViolations > 2) return {
      message: "Focus leak detected. You're negotiating with your devices. Try leaving your phone in another room for the next session.",
      type: 'warning'
    };

    if (avgMins > 120) return {
      message: "Elite performance. You've entered the top 1% of focus intensity. Remember to rest your eyes between sessions.",
      type: 'success'
    };

    if (avgMins < 30 && subjectStats.coverage < 50) return {
      message: "Shallow work threat. You're skimming the surface. Pick ONE subject tomorrow and commit to 60 minutes of depth.",
      type: 'info'
    };

    return {
      message: "Steady momentum. You're building the habit of depth. Try a 'River' soundscape for your next session to stay in flow.",
      type: 'neutral'
    };
  }, [history, subjectStats.coverage]);

  const heatmapData = useMemo(() => {
    const intensityOpacity = (mins: number) => {
      if (mins <= 0) return 0;
      if (mins < 30) return 0.35;
      if (mins < 90) return 0.65;
      return 1;
    };

    type LogLike = Pick<DayLog, 'selectedSubjects' | 'subjectMinutes' | 'additionalSubjects'>;

    const getSubjectCountForDay = (log: LogLike) => {
      const subjects = new Set<string>();
      const { main1, main2, light } = log.selectedSubjects;
      if (main1) subjects.add(main1);
      if (main2) subjects.add(main2);
      if (light) subjects.add(light);
      (log.additionalSubjects || []).forEach(id => subjects.add(id));
      Object.entries((log.subjectMinutes || {}) as Record<string, number>).forEach(([id, mins]) => {
        if ((mins || 0) > 0) subjects.add(id);
      });
      return subjects.size;
    };

    const getSubjectMinutesForDay = (log: LogLike, subjectId: string) => {
      const fromMinutes = (log.subjectMinutes || {})[subjectId] || 0;
      if (fromMinutes > 0) return fromMinutes;
      const { main1, main2, light } = log.selectedSubjects;
      if ((log.additionalSubjects || []).includes(subjectId)) return 30;
      if (main1 === subjectId || main2 === subjectId || light === subjectId) return 30;
      return 0;
    };

    const getNinetyValue = (log: (typeof rolling90History)[number]) => {
      if (selectedSubjectId === 'ALL') return getSubjectCountForDay(log);
      return getSubjectMinutesForDay(log, selectedSubjectId);
    };

    const getNinetyOpacity = (log: (typeof rolling90History)[number]) => {
      if (selectedSubjectId === 'ALL') {
        const count = getSubjectCountForDay(log);
        if (count <= 0) return 0;
        return Math.min(1, 0.2 + count * 0.2);
      }
      return intensityOpacity(getSubjectMinutesForDay(log, selectedSubjectId));
    };

    const weeks90: typeof rolling90History[] = [];
    for (let i = 0; i < rolling90History.length; i += 7) {
      weeks90.push(rolling90History.slice(i, i + 7));
    }
    const subjectActiveDays90 = rolling90History.filter(d => getNinetyValue(d) > 0).length;
    const subjectCoverage90 = Math.round((subjectActiveDays90 / rolling90History.length) * 100);
    const avgSubjectsPerDay90 = Number((rolling90History.reduce((sum, d) => sum + getNinetyValue(d), 0) / rolling90History.length).toFixed(1));

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yearInfo = getYearInfoBySystem(settings.dateSystem, now);
    const yearStart = yearInfo.start;
    const yearEnd = yearInfo.end;
    const totalYearDays = Math.floor((yearEnd.getTime() - yearStart.getTime()) / 86400000) + 1;
    const logsByDate = allRecentLogs.reduce<Record<string, (typeof allRecentLogs)[number]>>((acc, l) => {
      acc[l.date] = l;
      return acc;
    }, {});
    const yearDays: Array<{ date: string; value: number; isFuture: boolean; isToday: boolean }> = [];

    for (let d = new Date(yearStart); d <= yearEnd; d.setDate(d.getDate() + 1)) {
      const dStr = d.toISOString().split('T')[0];
      const dayDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const isFuture = dayDate > today;
      const isToday = dayDate.getTime() === today.getTime();
      const log = logsByDate[dStr];
      const value = log
        ? (selectedSubjectId === 'ALL' ? getSubjectCountForDay(log) : getSubjectMinutesForDay(log, selectedSubjectId))
        : 0;
      yearDays.push({
        date: dStr,
        value,
        isFuture,
        isToday,
      });
    }

    const yearColumns: typeof yearDays[] = [];
    for (let i = 0; i < yearDays.length; i += 8) {
      yearColumns.push(yearDays.slice(i, i + 8));
    }

    const elapsedDays = yearDays.filter(d => !d.isFuture).length;
    const completedElapsedDays = yearDays.filter(d => !d.isFuture && d.value > 0).length;
    const yearCompletionPct = elapsedDays > 0 ? Math.round((completedElapsedDays / elapsedDays) * 100) : 0;
    const yearGonePct = Math.round((elapsedDays / totalYearDays) * 100);

    return {
      weeks90,
      subjectActiveDays90,
      subjectCoverage90,
      avgSubjectsPerDay90,
      yearColumns,
      elapsedDays,
      completedElapsedDays,
      yearCompletionPct,
      yearGonePct,
      totalYearDays,
      yearLabel: yearInfo.label,
      getSubjectCountForDay,
      getNinetyValue,
      getNinetyOpacity,
      intensityOpacity,
    };
  }, [rolling90History, allRecentLogs, selectedSubjectId, settings.dateSystem]);

  const achievementMeta: Record<string, string> = {
    FIRST_100_MIN_DAY: 'First 100 minutes in a day',
    STREAK_7: '7-day deep work streak',
    NO_PHONE_3_DAYS: 'Zero phone violations for 3 days',
    RITUALS_WEEK: 'All rituals completed for 7 days',
  };
  const todayAchievements = useMemo(() => {
    const today = getHistory(1)[0];
    return (today?.unlockedAchievements || []).map(id => ({ id, label: achievementMeta[id] || id }));
  }, []);
  const sessionInsights = useMemo(() => {
    const sessions = yearHistory
      .flatMap(d => d.focusSessions || [])
      .sort((a, b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime());

    const hourBuckets: Record<number, { totalMins: number; count: number }> = {};
    sessions.forEach(s => {
      const hour = new Date(s.startAt).getHours();
      hourBuckets[hour] = hourBuckets[hour] || { totalMins: 0, count: 0 };
      hourBuckets[hour].totalMins += s.durationMinutes;
      hourBuckets[hour].count += 1;
    });

    const bestHour = Object.entries(hourBuckets).sort(([, a], [, b]) => (b.totalMins / b.count) - (a.totalMins / a.count))[0];
    return {
      sessions,
      bestHour: bestHour ? Number(bestHour[0]) : null,
    };
  }, [yearHistory]);

  return (
    <div className="p-5 pb-32 animate-in fade-in duration-500 space-y-6">
      {showReport && <WeeklyReport onClose={() => setShowReport(false)} />}

      <header className="mt-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">Analytics</h1>
          <p className="text-zinc-500 text-sm">Performance Overview</p>
        </div>
        <button
          onClick={() => setShowReport(true)}
          className="bg-white dark:bg-zinc-800 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
        >
          View Report
        </button>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Coverage Card */}
        <div className="col-span-2 bg-gradient-to-r from-zinc-100 to-white dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <GraduationCap size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Exam Readiness</span>
            </div>
            <p className="text-3xl font-mono font-bold text-zinc-900 dark:text-white">{subjectStats.coverage}%</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Subjects studied (14 Days)</p>
          </div>

          {/* Mini Pie Visual */}
          <div className="w-16 h-16 rounded-full border-4 border-zinc-200 dark:border-zinc-800 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500" style={{ clipPath: `inset(0 ${100 - subjectStats.coverage}% 0 0)` }}></div>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{subjects.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-2">
            <BarChart3 size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Deep Work</span>
          </div>
          <p className="text-2xl font-mono font-bold text-zinc-900 dark:text-white">{Math.round(deepWorkTotal / 60)}<span className="text-sm text-zinc-500 ml-1">hrs</span></p>
          <p className="text-[10px] text-zinc-500 mt-1">Last 7 Days</p>
        </div>

        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 mb-2">
            <AlertTriangle size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Focus</span>
          </div>
          <p className="text-2xl font-mono font-bold text-zinc-900 dark:text-white">{totalViolations}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Violations (7d)</p>
        </div>
      </div>

      {/* AI Coach Insight */}
      <div className={`p-5 rounded-[2rem] border animate-in slide-in-from-top-2 duration-700 shadow-sm
        ${aiInsight.type === 'warning' ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300' :
          aiInsight.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
            aiInsight.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300' :
              'bg-primary-500/10 border-primary-500/20 text-primary-700 dark:text-primary-300'}
      `}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/60 dark:bg-black/40 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">AI Mentor Insights</span>
        </div>
        <p className="text-sm font-medium leading-relaxed italic opacity-90">
          "{aiInsight.message}"
        </p>
      </div>

      {/* Upcoming Deadlines Widget */}
      {upcomingDeadlines.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Flag size={14} /> Upcoming Horizon
        </h3>
          <div className="space-y-3">
            {upcomingDeadlines.slice(0, 3).map(deadline => {
              const daysLeft = Math.ceil((new Date(deadline.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const urgencyColor = daysLeft <= 3 ? 'text-rose-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-zinc-500';

              return (
                <div key={deadline.id} className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${daysLeft <= 3 ? 'bg-rose-500/10 text-rose-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                      {deadline.type === 'Exam' ? <AlertOctagon size={14} /> : <Milestone size={14} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{deadline.title}</p>
                      <p className="text-[10px] text-zinc-500">{formatDateBySystem(deadline.date, settings.dateSystem)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-mono font-bold ${urgencyColor}`}>{daysLeft}d</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-6 uppercase tracking-wider">Consistency (7 Days)</h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {last7Days.map((log, idx) => {
            const height = Math.min((log.deepWorkMinutes / 120) * 100, 100);
            const dayLabel = formatDateBySystem(log.date, settings.dateSystem, { weekday: 'narrow' });
            const isToday = idx === last7Days.length - 1;

            return (
              <div key={log.date} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full bg-zinc-200 dark:bg-zinc-900 rounded-t-lg overflow-hidden h-full flex items-end">
                  <div
                    style={{ height: `${height}%` }}
                    className={`w-full transition-all duration-1000 ${isToday ? 'bg-primary-500' : 'bg-zinc-400 dark:bg-zinc-700 group-hover:bg-zinc-500 dark:group-hover:bg-zinc-600'}`}
                  ></div>
                </div>
                <span className={`text-[10px] font-mono ${isToday ? 'text-zinc-900 dark:text-white font-bold' : 'text-zinc-500 dark:text-zinc-600'}`}>{dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <CalendarDays size={14} /> Focus Heatmap
          </h3>
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setHeatmapView('90D')}
              className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${heatmapView === '90D' ? 'bg-primary-500 text-white' : 'text-zinc-500'}`}
            >
              90 Days
            </button>
            <button
              onClick={() => setHeatmapView('YEAR')}
              className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${heatmapView === 'YEAR' ? 'bg-primary-500 text-white' : 'text-zinc-500'}`}
            >
              Year
            </button>
          </div>
        </div>

        <div className="mb-3">
          <select title="Select Subject" value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-700 dark:text-zinc-200 font-semibold outline-none focus:border-primary-500">
            <option value="ALL">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end justify-between mb-3">
          {heatmapView === '90D' ? (
            <>
              <div>
                <p className="text-lg font-mono font-bold text-zinc-900 dark:text-white">{heatmapData.subjectCoverage90}%</p>
                <p className="text-[10px] text-zinc-500">
                  {heatmapData.subjectActiveDays90}/90 {selectedSubjectId === 'ALL' ? 'subject-active days' : 'active days'}
                </p>
              </div>
              <p className="text-[10px] text-zinc-500">
                {selectedSubjectId === 'ALL' ? `Avg subjects/day: ${heatmapData.avgSubjectsPerDay90}` : `Avg mins/day: ${heatmapData.avgSubjectsPerDay90}`}
              </p>
            </>
          ) : (
            <>
              <div>
                <p className="text-lg font-mono font-bold text-zinc-900 dark:text-white">{heatmapData.yearCompletionPct}%</p>
                <p className="text-[10px] text-zinc-500">
                  {selectedSubjectId === 'ALL' ? 'Subject-active completion' : 'Subject completion'} in {heatmapData.yearLabel}
                </p>
              </div>
              <p className="text-[10px] text-zinc-500">
                {heatmapData.completedElapsedDays}/{heatmapData.elapsedDays} active days • Year gone: {heatmapData.yearGonePct}%
              </p>
            </>
          )}
        </div>

        <div className="w-full overflow-hidden">
          <div className="w-full">
            {heatmapView === '90D' &&
              <div
                className="grid gap-1 w-full"
                style={{ gridTemplateColumns: `repeat(${heatmapData.weeks90.length}, minmax(0, 1fr))` }}
              >
                {heatmapData.weeks90.map((week, weekIdx) => (
                  <div key={`w90-${weekIdx}`} className="grid grid-rows-7 gap-1">
                    {Array.from({ length: 7 }).map((_, rowIdx) => {
                      const day = week[rowIdx];
                      if (!day) return <div key={`w90-empty-${weekIdx}-${rowIdx}`} className="aspect-square rounded-[3px] bg-transparent" />;
                      const opacity = heatmapData.getNinetyOpacity(day);
                      return (
                        <div
                          key={day.date}
                          title={`${formatDateBySystem(day.date, settings.dateSystem, { year: 'numeric', month: 'short', day: 'numeric' })} • ${selectedSubjectId === 'ALL' ? `${heatmapData.getSubjectCountForDay(day)} subjects` : `${heatmapData.getNinetyValue(day)} mins`}`}
                          className={`aspect-square rounded-[3px] transition-colors ${heatmapData.getNinetyValue(day) === 0 ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}
                          style={heatmapData.getNinetyValue(day) > 0 ? { backgroundColor: hexToRgba(accentHex, opacity) } : undefined}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>}
            {heatmapView === 'YEAR' &&
              <div
                className="grid gap-px w-full"
                style={{ gridTemplateColumns: `repeat(${heatmapData.yearColumns.length}, minmax(0, 1fr))` }}
              >
                {heatmapData.yearColumns.map((col, colIdx) => (
                  <div key={`wy-${colIdx}`} className="grid grid-rows-8 gap-px">
                    {Array.from({ length: 8 }).map((_, rowIdx) => {
                      const day = col[rowIdx];
                      if (!day) return <div key={`wy-empty-${colIdx}-${rowIdx}`} className="aspect-square rounded-full bg-transparent" />;
                      return (
                        <div
                          key={day.date}
                          title={`${formatDateBySystem(day.date, settings.dateSystem, { year: 'numeric', month: 'short', day: 'numeric' })} • ${selectedSubjectId === 'ALL' ? `${day.value} subjects` : `${day.value} mins`}`}
                          className={`aspect-square rounded-full transition-colors ${day.isFuture ? 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700' : day.isToday ? 'bg-zinc-200 dark:bg-zinc-800' : day.value > 0 ? '' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                          style={
                            day.isFuture
                              ? undefined
                              : day.isToday
                                ? { backgroundImage: `linear-gradient(to right, ${accentHex} 50%, transparent 50%)` }
                                : day.value > 0
                                  ? { backgroundColor: accentHex }
                                  : undefined
                          }
                        />
                      );
                    })}
                  </div>
                ))}
              </div>}
          </div>
        </div>

        {heatmapView === '90D' ? (
          <div className="flex items-center justify-between mt-4 text-[10px] text-zinc-500">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-zinc-200 dark:bg-zinc-800"></div>
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: hexToRgba(accentHex, 0.35) }}></div>
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: hexToRgba(accentHex, 0.65) }}></div>
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: accentHex }}></div>
            </div>
            <span>More</span>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-4 text-[10px] text-zinc-500">
            <span>Unfilled</span>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800" style={{ backgroundImage: `linear-gradient(to right, ${accentHex} 50%, transparent 50%)` }}></div>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentHex }}></div>
            </div>
            <span>Filled</span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Trophy size={14} /> Milestones
        </h3>
        {todayAchievements.length === 0 ? (
          <p className="text-sm text-zinc-500">No achievements unlocked yet. Keep stacking focused sessions.</p>
        ) : (
          <div className="space-y-2">
            {todayAchievements.map(ach => (
              <div key={ach.id} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <Trophy size={14} className="text-emerald-400" />
                <span className="text-sm text-zinc-800 dark:text-zinc-200">{ach.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-4 uppercase tracking-wider">Session History</h3>
        {sessionInsights.bestHour !== null && (
          <p className="text-xs text-zinc-500 mb-3">
            Best focus hour: <span className="text-zinc-900 dark:text-white font-semibold">{sessionInsights.bestHour}:00</span>
          </p>
        )}
        {sessionInsights.sessions.length === 0 ? (
          <p className="text-sm text-zinc-500">No sessions recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 no-scrollbar">
            {sessionInsights.sessions.slice(0, 8).map(s => (
              <div key={s.id} className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{s.taskName}</p>
                  <p className="text-[10px] text-zinc-500">{formatDateTimeBySystem(s.startAt, settings.dateSystem)} · {s.mode} · {s.noiseType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-zinc-900 dark:text-white">{s.durationMinutes}m</p>
                  <p className="text-[10px] text-zinc-500">violations: {s.phoneViolationsDuringSession}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Subject Heatmap (14 Days)</h3>
        <div className="space-y-2">
          {subjectStats.sorted.map(([id, count]) => {
            const subject = subjects.find(s => s.id === id);
            if (!subject) return null;

            const isNeglected = count === 0;

            return (
              <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isNeglected ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                  <span className={`text-sm ${isNeglected ? 'text-zinc-500' : 'text-zinc-700 dark:text-zinc-200'}`}>{subject.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.ceil(count) }).map((_, i) => (
                      <div key={i} className="w-1 h-3 bg-zinc-300 dark:bg-zinc-600 rounded-sm"></div>
                    ))}
                  </div>
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-600 w-4 text-right">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
