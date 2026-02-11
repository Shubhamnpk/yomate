
import React, { useMemo, useState, useEffect } from 'react';
import { getHistory, getCustomSubjects, getAppSettings } from '../services/storageService';
import { Subject, AppSettings } from '../types';
import { BarChart3, AlertTriangle, CheckCircle, GraduationCap, Flag, Milestone, AlertOctagon, Sparkles } from 'lucide-react';
import { WeeklyReport } from './WeeklyReport';

export const StatsView: React.FC = () => {
  // Use 14 days for coverage stat to be meaningful
  const history = useMemo(() => getHistory(14), []);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    setSubjects(getCustomSubjects());
    setSettings(getAppSettings());
  }, []);

  const subjectStats = useMemo(() => {
    // ... existing logic ...
    const counts: Record<string, number> = {};
    const touchedSubjects = new Set<string>();

    subjects.forEach(s => counts[s.id] = 0);

    history.forEach(log => {
      const { main1, main2, light } = log.selectedSubjects;
      if (main1) { counts[main1] = (counts[main1] || 0) + 1; touchedSubjects.add(main1); }
      if (main2) { counts[main2] = (counts[main2] || 0) + 1; touchedSubjects.add(main2); }
      if (light) { counts[light] = (counts[light] || 0) + 0.5; touchedSubjects.add(light); }
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
        <div className="col-span-2 bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <GraduationCap size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Exam Readiness</span>
            </div>
            <p className="text-3xl font-mono font-bold text-white">{subjectStats.coverage}%</p>
            <p className="text-xs text-zinc-400 mt-1">Subjects studied (14 Days)</p>
          </div>

          {/* Mini Pie Visual */}
          <div className="w-16 h-16 rounded-full border-4 border-zinc-800 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500" style={{ clipPath: `inset(0 ${100 - subjectStats.coverage}% 0 0)` }}></div>
            <span className="text-xs font-bold text-zinc-400">{subjects.length}</span>
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
        ${aiInsight.type === 'warning' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' :
          aiInsight.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
            aiInsight.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' :
              'bg-primary-500/10 border-primary-500/20 text-primary-300'}
      `}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
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
          <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
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
                      <p className="text-[10px] text-zinc-500">{new Date(deadline.date).toLocaleDateString()}</p>
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
        <h3 className="text-sm font-bold text-zinc-400 mb-6 uppercase tracking-wider">Consistency (7 Days)</h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {last7Days.map((log, idx) => {
            const height = Math.min((log.deepWorkMinutes / 120) * 100, 100);
            const dayLabel = new Date(log.date).toLocaleDateString('en-US', { weekday: 'narrow' });
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

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Subject Heatmap (14 Days)</h3>
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
};
