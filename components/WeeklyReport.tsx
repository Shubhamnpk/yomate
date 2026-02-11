
import React, { useMemo } from 'react';
import { getHistory, getCustomSubjects } from '../services/storageService';
import { X, TrendingUp, TrendingDown, Award, AlertTriangle, Calendar, Clock, BookOpen, Target } from 'lucide-react';

interface Props {
    onClose: () => void;
}

export const WeeklyReport: React.FC<Props> = ({ onClose }) => {
    // Fetch last 14 days to compare strict weeks
    const history = useMemo(() => getHistory(14), []);
    const customSubjects = useMemo(() => getCustomSubjects(), []);

    // Split into "This Week" (last 7 days) and "Last Week" (7 days before that)
    // Note: getHistory returns chronological, so last 7 elements are "this week"
    const thisWeek = history.slice(-7);
    const lastWeek = history.slice(0, 7);

    // Metrics Logic
    const calculateMetrics = (logs: typeof history) => {
        const totalDeepWork = logs.reduce((acc, l) => acc + l.deepWorkMinutes, 0);
        const totalViolations = logs.reduce((acc, l) => acc + l.phoneViolations, 0);

        // Subject Breakdown
        const subjectCounts: Record<string, number> = {};
        logs.forEach(l => {
            const { main1, main2, light } = l.selectedSubjects;
            if (main1) subjectCounts[main1] = (subjectCounts[main1] || 0) + 1;
            if (main2) subjectCounts[main2] = (subjectCounts[main2] || 0) + 1;
            if (light) subjectCounts[light] = (subjectCounts[light] || 0) + 0.5;
        });

        // Find Top Subject
        let topSubjectId = null;
        let maxCount = 0;
        Object.entries(subjectCounts).forEach(([id, count]) => {
            if (count > maxCount) {
                maxCount = count;
                topSubjectId = id;
            }
        });

        const completionRate = logs.reduce((acc, l) => {
            const completed = l.schedule.filter(b => b.isCompleted).length;
            const total = l.schedule.length;
            return acc + (total > 0 ? completed / total : 0);
        }, 0) / (logs.length || 1);

        return { totalDeepWork, totalViolations, topSubjectId, maxCount, completionRate };
    };

    const current = calculateMetrics(thisWeek);
    const previous = calculateMetrics(lastWeek);

    // Compare
    const deepWorkDiff = current.totalDeepWork - previous.totalDeepWork;
    const isDeepWorkUp = deepWorkDiff >= 0;
    const deepWorkGrowth = previous.totalDeepWork > 0
        ? Math.round((Math.abs(deepWorkDiff) / previous.totalDeepWork) * 100)
        : 100;

    const topSubjectName = current.topSubjectId
        ? customSubjects.find(s => s.id === current.topSubjectId)?.name
        : 'None';

    // Grade Calculation
    const calculateGrade = () => {
        if (current.totalDeepWork > 1200 && current.totalViolations < 5) return { grade: 'S', color: 'text-yellow-400' }; // ~3h/day
        if (current.totalDeepWork > 800) return { grade: 'A', color: 'text-emerald-400' }; // ~2h/day
        if (current.totalDeepWork > 400) return { grade: 'B', color: 'text-blue-400' }; // ~1h/day
        if (current.totalDeepWork > 200) return { grade: 'C', color: 'text-zinc-400' };
        return { grade: 'D', color: 'text-rose-400' };
    };

    const { grade, color: gradeColor } = calculateGrade();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5">

                {/* Header */}
                <div className="bg-gradient-to-br from-zinc-800 to-zinc-950 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Award size={100} />
                    </div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Weekly Report</h2>
                            <p className="text-zinc-400 text-xs uppercase font-bold tracking-widest mt-1">Last 7 Days</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mt-8 flex items-end gap-4">
                        <div className={`text-6xl font-display font-bold ${gradeColor}`}>
                            <span className="text-lg text-zinc-500 font-mono align-top mr-1">GRADE</span>
                            {grade}
                        </div>
                        <div className="pb-2">
                            <div className="flex items-center gap-2 mb-1">
                                {isDeepWorkUp ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-rose-500" />}
                                <span className={`text-sm font-bold ${isDeepWorkUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {deepWorkGrowth}% {isDeepWorkUp ? 'Growth' : 'Drop'}
                                </span>
                            </div>
                            <p className="text-[10px] text-zinc-500">vs Previous Week</p>
                        </div>
                    </div>
                </div>

                {/* content */}
                <div className="p-6 space-y-6">

                    {/* Deep Work Stat */}
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-800 rounded-2xl text-primary-400">
                            <Clock size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Deep Work</p>
                            <p className="text-xl font-bold text-white">
                                {Math.floor(current.totalDeepWork / 60)}<span className="text-sm text-zinc-500">h</span> {current.totalDeepWork % 60}<span className="text-sm text-zinc-500">m</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-zinc-500">Avg/Day</p>
                            <p className="text-sm font-mono text-zinc-300">{Math.round(current.totalDeepWork / 7)}m</p>
                        </div>
                    </div>

                    {/* Top Subject */}
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-800 rounded-2xl text-emerald-400">
                            <BookOpen size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Top Focus</p>
                            <p className="text-xl font-bold text-white truncate max-w-[150px]">{topSubjectName || '—'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-zinc-500">Sessions</p>
                            <p className="text-sm font-mono text-zinc-300">{current.maxCount}</p>
                        </div>
                    </div>

                    {/* Violations */}
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-800 rounded-2xl text-rose-400">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Distractions</p>
                            <p className="text-xl font-bold text-white">{current.totalViolations}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-zinc-500">Efficiency</p>
                            <p className="text-sm font-mono text-zinc-300">{Math.round(current.completionRate * 100)}%</p>
                        </div>
                    </div>

                    {/* Action */}
                    <button onClick={onClose} className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-colors uppercase tracking-widest text-xs mt-4">
                        Keep Grinding
                    </button>

                </div>
            </div>
        </div>
    );
};
