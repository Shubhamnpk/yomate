
import React from 'react';
import { ScheduleBlock } from '../../types';

interface Props {
    template: ScheduleBlock[];
    setEditingBlockId: (id: string | null) => void;
}

export const ScheduleTab: React.FC<Props> = ({ template, setEditingBlockId }) => {
    const formatDays = (days?: number[]) => {
        if (!days || days.length === 0 || days.length === 7) return 'Every day';
        const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return [...days].sort((a, b) => a - b).map(d => names[d]).join(', ');
    };

    return (
        <div className="space-y-2">
            {template.map((block) => (
                <div
                    key={block.id}
                    onClick={() => setEditingBlockId(block.id)}
                    className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer"
                >
                    <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200">{block.activityName}</p>
                        <p className="text-xs text-zinc-500 font-mono mt-1">{block.startTime} - {block.endTime}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">
                            {block.eventDate
                                ? `Date: ${block.eventDate}${block.eventEndDate ? ` to ${block.eventEndDate}` : ''}`
                                : formatDays(block.daysOfWeek)}
                        </p>
                        {block.blockType === 'EVENT' && typeof block.durationMinutes === 'number' && (
                            <p className="text-[10px] text-zinc-500 mt-1">Duration: {block.durationMinutes} min</p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                            {block.mode}
                        </div>
                        <div className="px-2 py-0.5 bg-primary-500/10 rounded text-[9px] font-bold text-primary-500 uppercase">
                            {block.blockType || (block.mode === 'Class' ? 'EVENT' : 'TASK')}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
