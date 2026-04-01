
import React, { useRef, useState } from 'react';
import { Download, Upload, AlertOctagon, Cloud, ShieldCheck, Database, FileJson } from 'lucide-react';
import { exportData, importData, pullBackupFromCloud, pushBackupToCloud, resetApp } from '../../services/storageService';
import { haptic } from '../../services/hapticService';
import { AppSettings } from '../../types';
import { exportProductivityHistory, getProductivityEntryCount, importProductivityHistory } from '../../services/productivityService';

interface Props {
    settings: AppSettings;
    handleSaveSettings: (newSettings: AppSettings) => void;
}

export const DataTab: React.FC<Props> = ({ settings, handleSaveSettings }) => {
    const backupFileInputRef = useRef<HTMLInputElement>(null);
    const productivityMergeInputRef = useRef<HTMLInputElement>(null);
    const productivityReplaceInputRef = useRef<HTMLInputElement>(null);
    const [syncing, setSyncing] = useState(false);
    const [syncNotice, setSyncNotice] = useState('');
    const [dataNotice, setDataNotice] = useState('');
    const [productivityNotice, setProductivityNotice] = useState('');
    const productivityEntryCount = getProductivityEntryCount();

    const handleBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                try {
                    importData(event.target.result as string);
                } catch (error) {
                    setDataNotice(error instanceof Error ? error.message : 'Backup import failed.');
                    haptic.error();
                }
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleProductivityUpload = (mode: 'merge' | 'replace') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target?.result) return;
            try {
                const result = importProductivityHistory(event.target.result as string, mode);
                setProductivityNotice(
                    mode === 'replace'
                        ? `Replaced productivity history with ${result.importedCount} imported entries.`
                        : `Imported ${result.importedCount} entries. You now have ${result.totalCount} total entries.`,
                );
                haptic.success();
                window.location.reload();
            } catch (error) {
                setProductivityNotice(error instanceof Error ? error.message : 'Productivity import failed.');
                haptic.error();
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handlePush = async () => {
        if (!settings.cloudSyncPushUrl) {
            setSyncNotice('Set Cloud Push URL first.');
            return;
        }
        setSyncing(true);
        setSyncNotice('');
        try {
            await pushBackupToCloud(settings.cloudSyncPushUrl, settings.cloudSyncToken);
            setSyncNotice('Backup pushed to cloud.');
            haptic.success();
        } catch (e: any) {
            setSyncNotice(e?.message || 'Cloud push failed.');
            haptic.error();
        } finally {
            setSyncing(false);
        }
    };

    const handlePull = async () => {
        if (!settings.cloudSyncPullUrl) {
            setSyncNotice('Set Cloud Pull URL first.');
            return;
        }
        setSyncing(true);
        setSyncNotice('');
        try {
            await pullBackupFromCloud(settings.cloudSyncPullUrl, settings.cloudSyncToken);
            haptic.success();
        } catch (e: any) {
            setSyncNotice(e?.message || 'Cloud pull failed.');
            haptic.error();
            setSyncing(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 p-5 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300">
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Data Safety Center</h3>
                        <p className="text-xs text-zinc-500 mt-1">Export before major changes. Imports are validated, and productivity history can be restored separately without replacing your whole app.</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500">Productivity entries</p>
                        <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{productivityEntryCount}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500">Backup scope</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">Full app + productivity</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Database size={12} /> Full Backup & Restore
                </h3>
                <p className="text-xs text-zinc-500">This includes timetable logs, subjects, settings, curriculum progress, and productivity history.</p>
                <button
                    onClick={() => { haptic.medium(); setDataNotice(''); exportData(); }}
                    className="w-full py-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active-scale transition-all"
                >
                    <Download size={16} /> Export Full Backup
                </button>
                <div className="relative">
                    <button
                        className="w-full py-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active-scale transition-all"
                    >
                        <Upload size={16} /> Import Full Backup
                    </button>
                    <input
                        type="file"
                        ref={backupFileInputRef}
                        onChange={(e) => { haptic.medium(); handleBackupUpload(e); }}
                        accept=".json"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </div>
                {dataNotice && <p className="text-xs text-zinc-500">{dataNotice}</p>}
            </div>

            <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FileJson size={12} /> Productivity History Only
                </h3>
                <p className="text-xs text-zinc-500">Use this when you want to move or restore just your journaling history without touching schedule data, subjects, or other settings.</p>
                <button
                    onClick={() => { haptic.medium(); setProductivityNotice(''); exportProductivityHistory(); }}
                    className="w-full py-4 border border-primary-200 dark:border-primary-900/30 bg-primary-50/70 dark:bg-primary-950/10 text-primary-700 dark:text-primary-300 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active-scale transition-all"
                >
                    <Download size={16} /> Export Productivity History
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative">
                        <button
                            className="w-full py-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active-scale transition-all"
                        >
                            <Upload size={14} /> Import and Merge
                        </button>
                        <input
                            type="file"
                            ref={productivityMergeInputRef}
                            onChange={handleProductivityUpload('merge')}
                            accept=".json"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                    <div className="relative">
                        <button
                            className="w-full py-3 border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/10 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active-scale transition-all"
                        >
                            <Upload size={14} /> Replace Productivity Data
                        </button>
                        <input
                            type="file"
                            ref={productivityReplaceInputRef}
                            onChange={handleProductivityUpload('replace')}
                            accept=".json"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3 space-y-1">
                    <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Safer import options</p>
                    <p className="text-xs text-zinc-500">`Merge` keeps your current entries and adds imported ones with duplicate protection. `Replace` overwrites only productivity history.</p>
                </div>
                {productivityNotice && <p className="text-xs text-zinc-500">{productivityNotice}</p>}
            </div>
            <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Cloud size={12} /> Cloud Sync (Convex HTTP)
                </h3>
                <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Enable Cloud Sync</span>
                    <input
                        type="checkbox"
                        checked={!!settings.cloudSyncEnabled}
                        onChange={(e) => handleSaveSettings({ ...settings, cloudSyncEnabled: e.target.checked })}
                        className="w-4 h-4 accent-primary-500"
                    />
                </label>
                <input
                    value={settings.cloudSyncPushUrl || ''}
                    onChange={(e) => handleSaveSettings({ ...settings, cloudSyncPushUrl: e.target.value })}
                    placeholder="Convex Push URL (HTTP action)"
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm outline-none focus:border-primary-500"
                />
                <input
                    value={settings.cloudSyncPullUrl || ''}
                    onChange={(e) => handleSaveSettings({ ...settings, cloudSyncPullUrl: e.target.value })}
                    placeholder="Convex Pull URL (HTTP action)"
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm outline-none focus:border-primary-500"
                />
                <input
                    value={settings.cloudSyncToken || ''}
                    onChange={(e) => handleSaveSettings({ ...settings, cloudSyncToken: e.target.value })}
                    placeholder="Auth token (optional)"
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm outline-none focus:border-primary-500"
                />
                <div className="grid grid-cols-2 gap-2">
                    <button
                        disabled={syncing || !settings.cloudSyncEnabled}
                        onClick={handlePush}
                        className="w-full py-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 disabled:opacity-50 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active-scale transition-all"
                    >
                        <Upload size={14} /> Push
                    </button>
                    <button
                        disabled={syncing || !settings.cloudSyncEnabled}
                        onClick={handlePull}
                        className="w-full py-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 disabled:opacity-50 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active-scale transition-all"
                    >
                        <Download size={14} /> Pull
                    </button>
                </div>
                {syncNotice && <p className="text-xs text-zinc-500">{syncNotice}</p>}
            </div>
            <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => {
                        if (!confirm('Reset the whole app and erase local data on this device? Export a backup first if you may need it.')) return;
                        haptic.error();
                        resetApp();
                    }}
                    className="w-full py-4 border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/10 text-rose-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active-scale transition-all"
                >
                    <AlertOctagon size={16} /> Reset Everything
                </button>
            </div>
        </div>
    );
};
