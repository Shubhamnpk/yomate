import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { getHistory, getCustomSubjects } from '../services/storageService';
import { X, TrendingUp, TrendingDown, Award, AlertTriangle, Clock, BookOpen, Download } from 'lucide-react';

interface Props {
    onClose: () => void;
}

const PrintLayout: React.FC<{
    current: any;
    previous: any;
    grade: string;
    topSubjectName: string;
    isDeepWorkUp: boolean;
    deepWorkGrowth: number;
}> = ({ current, grade, topSubjectName, isDeepWorkUp, deepWorkGrowth }) => {
    return (
        <div className="p-12 bg-white text-black font-sans max-w-[210mm] mx-auto min-h-[297mm]">
            {/* A4 Header */}
            <div className="flex justify-between items-start mb-12 border-b-2 border-black pb-6">
                <div>
                    <h1 className="text-5xl font-bold mb-2 tracking-tight text-black">Focus Report</h1>
                    <p className="text-zinc-500 font-medium">Generated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                    <div className="text-8xl font-bold text-black leading-none">{grade}</div>
                    <div className="text-sm font-bold uppercase tracking-widest text-zinc-500 mt-2">Efficiency Grade</div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-200">
                    <div className="flex items-center gap-3 mb-4 text-zinc-500">
                        <Clock size={24} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Deep Work Volume</h3>
                    </div>
                    <div className="text-6xl font-bold mb-2 text-zinc-900">
                        {Math.floor(current.totalDeepWork / 60)}<span className="text-2xl text-zinc-400">h</span> {current.totalDeepWork % 60}<span className="text-2xl text-zinc-400">m</span>
                    </div>
                    <div className={`flex items-center gap-2 text-lg font-bold ${isDeepWorkUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isDeepWorkUp ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        {deepWorkGrowth}% {isDeepWorkUp ? 'Growth' : 'Decline'}
                        <span className="text-sm font-normal text-zinc-400 ml-1">vs last week</span>
                    </div>
                </div>

                <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-200">
                    <div className="flex items-center gap-3 mb-4 text-zinc-500">
                        <BookOpen size={24} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Primary Focus</h3>
                    </div>
                    <div className="text-4xl font-bold mb-2 text-zinc-900 line-clamp-2 leading-tight">
                        {topSubjectName || 'No Data'}
                    </div>
                    <p className="text-zinc-500 mt-2">
                        You dedicated <span className="font-bold text-zinc-900">
                            {current.metricType === 'minutes' ? `${Math.floor(current.maxVal / 60)}h ${current.maxVal % 60}m` : `${current.maxVal} sessions`}
                        </span> to this subject.
                    </p>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="mb-12">
                <h3 className="text-2xl font-bold mb-6 border-b border-zinc-200 pb-3">Performance Analytics</h3>
                <div className="space-y-0">
                    <div className="flex justify-between items-center py-4 border-b border-zinc-100">
                        <span className="text-zinc-600 font-medium">Schedule Completion Rate</span>
                        <span className="font-mono font-bold text-xl">{Math.round(current.completionRate * 100)}%</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-zinc-100">
                        <span className="text-zinc-600 font-medium">Distractions & Phone Violations</span>
                        <span className={`font-mono font-bold text-xl ${current.totalViolations === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{current.totalViolations}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-zinc-100">
                        <span className="text-zinc-600 font-medium">Daily Deep Work Average</span>
                        <span className="font-mono font-bold text-xl">{Math.round(current.totalDeepWork / 7)} min</span>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-12 border-t border-zinc-200 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Yomate Productivity Suite</p>
                <p className="text-zinc-300 italic text-sm">"Consistency is the code to greatness."</p>
            </div>
        </div>
    );
};

export const WeeklyReport: React.FC<Props> = ({ onClose }) => {
    // Fetch last 14 days to compare strict weeks
    const history = useMemo(() => getHistory(14), []);
    const customSubjects = useMemo(() => getCustomSubjects(), []);

    const thisWeek = history.slice(-7);
    const lastWeek = history.slice(0, 7);

    const calculateMetrics = (logs: typeof history) => {
        const totalDeepWork = logs.reduce((acc, l) => acc + l.deepWorkMinutes, 0);
        const totalViolations = logs.reduce((acc, l) => acc + l.phoneViolations, 0);

        // Subject Breakdown
        const subjectMinutes: Record<string, number> = {};
        const subjectCounts: Record<string, number> = {};

        logs.forEach(l => {
            // Precise Minutes (New System)
            if (l.subjectMinutes) {
                const minutes = l.subjectMinutes as Record<string, number>;
                Object.entries(minutes).forEach(([id, mins]) => {
                    subjectMinutes[id] = (subjectMinutes[id] || 0) + (mins as number);
                });
            }

            // Fallback Counts (Old System)
            const { main1, main2, light } = l.selectedSubjects;
            if (main1) subjectCounts[main1] = (subjectCounts[main1] || 0) + 1;
            if (main2) subjectCounts[main2] = (subjectCounts[main2] || 0) + 1;
            if (light) subjectCounts[light] = (subjectCounts[light] || 0) + 0.5;
        });

        // Determine Top Subject
        let topSubjectId = null;
        let maxVal = 0;
        let metricType: 'minutes' | 'sessions' = 'sessions';

        // Check if we have any minute data
        const totalTrackedMinutes = Object.values(subjectMinutes).reduce((a, b) => a + b, 0);

        if (totalTrackedMinutes > 0) {
            metricType = 'minutes';
            Object.entries(subjectMinutes).forEach(([id, mins]) => {
                if (mins > maxVal) {
                    maxVal = mins;
                    topSubjectId = id;
                }
            });
        } else {
            // Fallback to counts
            Object.entries(subjectCounts).forEach(([id, count]) => {
                if (count > maxVal) {
                    maxVal = count;
                    topSubjectId = id;
                }
            });
        }

        const completionRate = logs.reduce((acc, l) => {
            const completed = l.schedule.filter(b => b.isCompleted).length;
            const total = l.schedule.length;
            return acc + (total > 0 ? completed / total : 0);
        }, 0) / (logs.length || 1);

        return { totalDeepWork, totalViolations, topSubjectId, maxVal, metricType, completionRate };
    };

    const current = calculateMetrics(thisWeek);
    const previous = calculateMetrics(lastWeek);

    const deepWorkDiff = current.totalDeepWork - previous.totalDeepWork;
    const isDeepWorkUp = deepWorkDiff >= 0;
    const deepWorkGrowth = previous.totalDeepWork > 0
        ? Math.round((Math.abs(deepWorkDiff) / previous.totalDeepWork) * 100)
        : 100;

    const topSubjectName = current.topSubjectId
        ? customSubjects.find(s => s.id === current.topSubjectId)?.name
        : 'None';

    const calculateGrade = () => {
        if (current.totalDeepWork > 1200 && current.totalViolations < 5) return { grade: 'S', color: 'text-yellow-400' };
        if (current.totalDeepWork > 800) return { grade: 'A', color: 'text-emerald-400' };
        if (current.totalDeepWork > 400) return { grade: 'B', color: 'text-blue-400' };
        if (current.totalDeepWork > 200) return { grade: 'C', color: 'text-zinc-400' };
        return { grade: 'D', color: 'text-rose-400' };
    };

    const { grade, color: gradeColor } = calculateGrade();
    const printRoot = document.getElementById('print-root');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            {/* Print Portal */}
            {printRoot && createPortal(
                <PrintLayout
                    current={current}
                    previous={previous}
                    grade={grade}
                    topSubjectName={topSubjectName || ''}
                    isDeepWorkUp={isDeepWorkUp}
                    deepWorkGrowth={deepWorkGrowth}
                />,
                printRoot
            )}

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
                        <div className="flex gap-2">
                            <button
                                onClick={() => window.print()}
                                className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                                title="Export PDF"
                            >
                                <Download size={20} />
                            </button>
                            <button onClick={onClose} className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
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

                {/* Content */}
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
                            <p className="text-xs text-zinc-500">{current.metricType === 'minutes' ? 'Time' : 'Sessions'}</p>
                            <p className="text-sm font-mono text-zinc-300">
                                {current.metricType === 'minutes' ? `${Math.floor(current.maxVal / 60)}h ${current.maxVal % 60}m` : current.maxVal}
                            </p>
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
                    <div className="grid grid-cols-1 gap-2 mt-4">
                        <button onClick={onClose} className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-colors uppercase tracking-widest text-xs">
                            Keep Grinding
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
