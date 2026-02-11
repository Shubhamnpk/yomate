
import React from 'react';
import { ScheduleBlock } from '../../types';

interface Props {
    template: ScheduleBlock[];
    setEditingBlockId: (id: string | null) => void;
}

export const ScheduleTab: React.FC<Props> = ({ template, setEditingBlockId }) => {
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
                    </div>
                    <div className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                        {block.mode}
                    </div>
                </div>
            ))}
        </div>
    );
};
