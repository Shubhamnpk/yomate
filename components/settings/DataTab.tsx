import React, { useMemo, useRef, useState } from 'react';
import { Download, Upload, AlertOctagon, Cloud, ShieldCheck, Database, FileJson, ChevronDown } from 'lucide-react';
import {
    ALL_BACKUP_SECTIONS,
    BackupSection,
    exportData,
    exportDataBySections,
    importData,
    importDataBySections,
    pullBackupFromCloud,
    pushBackupToCloud,
    resetApp
} from '../../services/storageService';
import { haptic } from '../../services/hapticService';
import { AppSettings } from '../../types';
import { exportProductivityHistory, getProductivityEntryCount, importProductivityHistory } from '../../services/productivityService';

interface Props {
    settings: AppSettings;
    handleSaveSettings: (newSettings: AppSettings) => void;
}

const SECTION_LABELS: Record<BackupSection, string> = {
    logs: 'Timetable logs',
    template: 'Schedule template',
    subjects: 'Subjects',
    curriculumProgress: 'Curriculum progress',
    settings: 'Settings',
    productivityEntries: 'Productivity history',
};

export const DataTab: React.FC<Props> = ({ settings, handleSaveSettings }) => {
    const backupFileInputRef = useRef<HTMLInputElement>(null);
    const selectiveBackupFileInputRef = useRef<HTMLInputElement>(null);
    const productivityMergeInputRef = useRef<HTMLInputElement>(null);
    const productivityReplaceInputRef = useRef<HTMLInputElement>(null);

    const [syncing, setSyncing] = useState(false);
    const [syncNotice, setSyncNotice] = useState('');
    const [dataNotice, setDataNotice] = useState('');
    const [productivityNotice, setProductivityNotice] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showProductivityTools, setShowProductivityTools] = useState(false);
    const [showCloud, setShowCloud] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [showImportOptions, setShowImportOptions] = useState(false);
    const [exportSections, setExportSections] = useState<BackupSection[]>(ALL_BACKUP_SECTIONS);
    const [importSections, setImportSections] = useState<BackupSection[]>(ALL_BACKUP_SECTIONS);

    const productivityEntryCount = getProductivityEntryCount();
    const exportSummary = useMemo(
        () => exportSections.length === ALL_BACKUP_SECTIONS.length ? 'All categories selected' : `${exportSections.length} categories selected`,
        [exportSections]
    );
    const importSummary = useMemo(
        () => importSections.length === ALL_BACKUP_SECTIONS.length ? 'All categories selected' : `${importSections.length} categories selected`,
        [importSections]
    );

    const toggleSelection = (section: BackupSection, mode: 'export' | 'import') => {
        const setter = mode === 'export' ? setExportSections : setImportSections;
        setter((prev) => prev.includes(section) ? prev.filter((item) => item !== section) : [...prev, section]);
    };

    const setAllSelections = (mode: 'export' | 'import', includeAll: boolean) => {
        const setter = mode === 'export' ? setExportSections : setImportSections;
        setter(includeAll ? [...ALL_BACKUP_SECTIONS] : []);
    };

    const handleBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target?.result) return;
            try {
                importData(event.target.result as string);
            } catch (error) {
                setDataNotice(error instanceof Error ? error.message : 'Import failed.');
                haptic.error();
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleSelectiveBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target?.result) return;
            try {
                importDataBySections(event.target.result as string, importSections);
            } catch (error) {
                setDataNotice(error instanceof Error ? error.message : 'Selected import failed.');
                haptic.error();
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
                        ? `Replaced productivity history with ${result.importedCount} entries.`
                        : `Imported ${result.importedCount} entries. Total now: ${result.totalCount}.`
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
        <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-5 space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Database size={12} /> Quick Import / Export
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                    <button
                        onClick={() => { haptic.medium(); setDataNotice(''); exportData(); }}
                        className="py-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active-scale transition-all"
                    >
                        <Download size={16} /> Export All Data
                    </button>
                    <div className="relative">
                        <button className="w-full py-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active-scale transition-all">
                            <Upload size={16} /> Import All Data
                        </button>
                        <input
                            type="file"
                            ref={backupFileInputRef}
                            onChange={(e) => { haptic.medium(); handleBackupUpload(e); }}
                            accept=".json"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
                {dataNotice && <p className="text-xs text-zinc-500 text-center">{dataNotice}</p>}
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                <button
                    type="button"
                    onClick={() => setShowAdvanced((prev) => !prev)}
                    className="w-full flex items-center justify-between gap-3 text-left"
                >
                    <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">Advanced Tools</p>
                        <p className="text-xs text-zinc-500 mt-1">Use category-based import/export only when you need partial restore.</p>
                    </div>
                    <ChevronDown size={16} className={`text-zinc-500 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>

                {showAdvanced && (
                    <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30 p-4">
                                <button
                                    type="button"
                                    onClick={() => setShowExportOptions((prev) => !prev)}
                                    className="w-full flex items-center justify-between gap-3 text-left"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">On-demand export</p>
                                        <p className="text-xs text-zinc-500 mt-1">{exportSummary}</p>
                                    </div>
                                    <ChevronDown size={14} className={`text-zinc-500 transition-transform ${showExportOptions ? 'rotate-180' : ''}`} />
                                </button>
                                {showExportOptions && (
                                    <div className="mt-3 space-y-3">
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setAllSelections('export', true)} className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-[11px] font-semibold">All</button>
                                            <button type="button" onClick={() => setAllSelections('export', false)} className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-[11px] font-semibold">None</button>
                                        </div>
                                        <div className="space-y-2">
                                            {ALL_BACKUP_SECTIONS.map((section) => (
                                                <label key={`export-${section}`} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                                                    <input
                                                        type="checkbox"
                                                        checked={exportSections.includes(section)}
                                                        onChange={() => toggleSelection(section, 'export')}
                                                        className="w-4 h-4 accent-primary-500"
                                                    />
                                                    {SECTION_LABELS[section]}
                                                </label>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { haptic.medium(); setDataNotice(''); exportDataBySections(exportSections); }}
                                            disabled={exportSections.length === 0}
                                            className="w-full py-2.5 rounded-xl border border-primary-200 dark:border-primary-900/30 bg-primary-50/70 dark:bg-primary-950/10 text-primary-700 dark:text-primary-300 text-sm font-bold disabled:opacity-50"
                                        >
                                            Export Selected
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30 p-4">
                                <button
                                    type="button"
                                    onClick={() => setShowImportOptions((prev) => !prev)}
                                    className="w-full flex items-center justify-between gap-3 text-left"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">On-demand import</p>
                                        <p className="text-xs text-zinc-500 mt-1">{importSummary}</p>
                                    </div>
                                    <ChevronDown size={14} className={`text-zinc-500 transition-transform ${showImportOptions ? 'rotate-180' : ''}`} />
                                </button>
                                {showImportOptions && (
                                    <div className="mt-3 space-y-3">
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setAllSelections('import', true)} className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-[11px] font-semibold">All</button>
                                            <button type="button" onClick={() => setAllSelections('import', false)} className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-[11px] font-semibold">None</button>
                                        </div>
                                        <div className="space-y-2">
                                            {ALL_BACKUP_SECTIONS.map((section) => (
                                                <label key={`import-${section}`} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                                                    <input
                                                        type="checkbox"
                                                        checked={importSections.includes(section)}
                                                        onChange={() => toggleSelection(section, 'import')}
                                                        className="w-4 h-4 accent-primary-500"
                                                    />
                                                    {SECTION_LABELS[section]}
                                                </label>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <button
                                                className="w-full py-2.5 rounded-xl border border-primary-200 dark:border-primary-900/30 bg-primary-50/70 dark:bg-primary-950/10 text-primary-700 dark:text-primary-300 text-sm font-bold disabled:opacity-50"
                                                disabled={importSections.length === 0}
                                            >
                                                Import Selected
                                            </button>
                                            <input
                                                type="file"
                                                ref={selectiveBackupFileInputRef}
                                                onChange={(e) => { haptic.medium(); handleSelectiveBackupUpload(e); }}
                                                accept=".json"
                                                disabled={importSections.length === 0}
                                                className="absolute inset-0 opacity-0 cursor-pointer disabled:pointer-events-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30 p-4">
                            <button
                                type="button"
                                onClick={() => setShowProductivityTools((prev) => !prev)}
                                className="w-full flex items-center justify-between gap-3 text-left"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                        <FileJson size={14} /> Productivity-only tools
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-1">Optional: move only productivity journal history.</p>
                                </div>
                                <ChevronDown size={14} className={`text-zinc-500 transition-transform ${showProductivityTools ? 'rotate-180' : ''}`} />
                            </button>
                            {showProductivityTools && (
                                <div className="mt-3 space-y-3">
                                    <button
                                        onClick={() => { haptic.medium(); setProductivityNotice(''); exportProductivityHistory(); }}
                                        className="w-full py-2.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                                    >
                                        <Download size={14} /> Export Productivity
                                    </button>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div className="relative">
                                            <button className="w-full py-2.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
                                                <Upload size={14} /> Import + Merge
                                            </button>
                                            <input type="file" ref={productivityMergeInputRef} onChange={handleProductivityUpload('merge')} accept=".json" className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                        <div className="relative">
                                            <button className="w-full py-2.5 border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/10 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2">
                                                <Upload size={14} /> Replace
                                            </button>
                                            <input type="file" ref={productivityReplaceInputRef} onChange={handleProductivityUpload('replace')} accept=".json" className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    </div>
                                    {productivityNotice && <p className="text-xs text-zinc-500">{productivityNotice}</p>}
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30 p-4">
                            <button
                                type="button"
                                onClick={() => setShowCloud((prev) => !prev)}
                                className="w-full flex items-center justify-between gap-3 text-left"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                        <Cloud size={14} /> Cloud sync
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-1">Optional Convex push/pull backup endpoints.</p>
                                </div>
                                <ChevronDown size={14} className={`text-zinc-500 transition-transform ${showCloud ? 'rotate-180' : ''}`} />
                            </button>
                            {showCloud && (
                                <div className="mt-3 space-y-2">
                                    <label className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Enable Cloud Sync</span>
                                        <input
                                            type="checkbox"
                                            checked={!!settings.cloudSyncEnabled}
                                            onChange={(e) => handleSaveSettings({ ...settings, cloudSyncEnabled: e.target.checked })}
                                            className="w-4 h-4 accent-primary-500"
                                        />
                                    </label>
                                    <input value={settings.cloudSyncPushUrl || ''} onChange={(e) => handleSaveSettings({ ...settings, cloudSyncPushUrl: e.target.value })} placeholder="Convex Push URL" className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm outline-none focus:border-primary-500" />
                                    <input value={settings.cloudSyncPullUrl || ''} onChange={(e) => handleSaveSettings({ ...settings, cloudSyncPullUrl: e.target.value })} placeholder="Convex Pull URL" className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm outline-none focus:border-primary-500" />
                                    <input value={settings.cloudSyncToken || ''} onChange={(e) => handleSaveSettings({ ...settings, cloudSyncToken: e.target.value })} placeholder="Auth token (optional)" className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm outline-none focus:border-primary-500" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <button disabled={syncing || !settings.cloudSyncEnabled} onClick={handlePush} className="w-full py-2.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 disabled:opacity-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
                                            <Upload size={14} /> Push
                                        </button>
                                        <button disabled={syncing || !settings.cloudSyncEnabled} onClick={handlePull} className="w-full py-2.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 disabled:opacity-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
                                            <Download size={14} /> Pull
                                        </button>
                                    </div>
                                    {syncNotice && <p className="text-xs text-zinc-500">{syncNotice}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-2">
                <button
                    onClick={() => {
                        if (!confirm('Reset the whole app and erase local data on this device? Export a backup first if needed.')) return;
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
