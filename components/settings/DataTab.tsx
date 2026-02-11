
import React, { useRef } from 'react';
import { Download, Upload, AlertOctagon } from 'lucide-react';
import { exportData, importData, resetApp } from '../../services/storageService';
import { haptic } from '../../services/hapticService';

export const DataTab: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                importData(event.target.result as string);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Backup & Restore</h3>
                <button
                    onClick={() => { haptic.medium(); exportData(); }}
                    className="w-full py-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active-scale transition-all"
                >
                    <Download size={16} /> Export Backup (JSON)
                </button>
                <div className="relative">
                    <button
                        className="w-full py-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active-scale transition-all"
                    >
                        <Upload size={16} /> Import Backup
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => { haptic.medium(); handleFileUpload(e); }}
                        accept=".json"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </div>
            </div>
            <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => { haptic.error(); resetApp(); }}
                    className="w-full py-4 border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/10 text-rose-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active-scale transition-all"
                >
                    <AlertOctagon size={16} /> Reset Everything
                </button>
            </div>
        </div>
    );
};
