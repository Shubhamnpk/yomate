
import React, { useRef, useState } from 'react';
import { Download, Upload, AlertOctagon, Cloud } from 'lucide-react';
import { exportData, importData, pullBackupFromCloud, pushBackupToCloud, resetApp } from '../../services/storageService';
import { haptic } from '../../services/hapticService';
import { AppSettings } from '../../types';

interface Props {
    settings: AppSettings;
    handleSaveSettings: (newSettings: AppSettings) => void;
}

export const DataTab: React.FC<Props> = ({ settings, handleSaveSettings }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [syncing, setSyncing] = useState(false);
    const [syncNotice, setSyncNotice] = useState('');

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
                    onClick={() => { haptic.error(); resetApp(); }}
                    className="w-full py-4 border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/10 text-rose-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active-scale transition-all"
                >
                    <AlertOctagon size={16} /> Reset Everything
                </button>
            </div>
        </div>
    );
};
