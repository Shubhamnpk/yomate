
import React from 'react';
import { User, Moon, Monitor, Sun, Zap, Coffee, GraduationCap, CalendarDays } from 'lucide-react';
import { AppSettings, AppMode } from '../../types';
import { haptic } from '../../services/hapticService';

interface Props {
    settings: AppSettings;
    handleSaveSettings: (newSettings: AppSettings) => void;
}

export const AppearanceTab: React.FC<Props> = ({ settings, handleSaveSettings }) => {
    const ThemeOption = ({ color, label, selected, onClick }: any) => (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${selected ? 'border-zinc-400 bg-zinc-800' : 'border-transparent hover:bg-zinc-800/50'}`}
        >
            <div className={`w-8 h-8 rounded-full ${color}`}></div>
            <span className="text-[10px] font-bold uppercase text-zinc-400">{label}</span>
        </button>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Identity</h3>
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                        <User size={20} />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Your Name</label>
                        <input
                            value={settings.userName}
                            onChange={(e) => handleSaveSettings({ ...settings, userName: e.target.value })}
                            placeholder="Enter name"
                            className="w-full bg-transparent text-zinc-900 dark:text-white font-display font-bold text-lg outline-none placeholder-zinc-400"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Background Theme</h3>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { id: 'zinc', label: 'Soft Dark', icon: Moon, desc: 'Zinc 950' },
                        { id: 'black', label: 'OLED', icon: Monitor, desc: 'Pure Black' },
                        { id: 'light', label: 'Light', icon: Sun, desc: 'Clean White' },
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => { haptic.light(); handleSaveSettings({ ...settings, themeMode: mode.id as any }); }}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all active-scale
                ${settings.themeMode === mode.id
                                    ? 'bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        >
                            <mode.icon size={24} className="mb-2" />
                            <span className="text-xs font-bold">{mode.label}</span>
                            <span className="text-[9px] opacity-60 uppercase">{mode.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Theme Accent</h3>
                <div className="grid grid-cols-5 gap-2">
                    <ThemeOption color="bg-indigo-500" label="Indigo" selected={settings.themeAccent === 'indigo'} onClick={() => handleSaveSettings({ ...settings, themeAccent: 'indigo' })} />
                    <ThemeOption color="bg-emerald-500" label="Emerald" selected={settings.themeAccent === 'emerald'} onClick={() => handleSaveSettings({ ...settings, themeAccent: 'emerald' })} />
                    <ThemeOption color="bg-rose-500" label="Rose" selected={settings.themeAccent === 'rose'} onClick={() => handleSaveSettings({ ...settings, themeAccent: 'rose' })} />
                    <ThemeOption color="bg-violet-500" label="Violet" selected={settings.themeAccent === 'violet'} onClick={() => handleSaveSettings({ ...settings, themeAccent: 'violet' })} />
                    <ThemeOption color="bg-orange-500" label="Orange" selected={settings.themeAccent === 'orange'} onClick={() => handleSaveSettings({ ...settings, themeAccent: 'orange' })} />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Application Mode</h3>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { id: 'Normal', label: 'Normal', icon: Coffee, desc: 'Balance' },
                        { id: 'Serious', label: 'Serious', icon: Zap, desc: 'Efficiency' },
                        { id: 'Exam', label: 'Exam', icon: GraduationCap, desc: 'Review' },
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => { haptic.light(); handleSaveSettings({ ...settings, appMode: mode.id as AppMode }); }}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all active-scale
                 ${settings.appMode === mode.id
                                    ? 'bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        >
                            <mode.icon size={20} className="mb-1" />
                            <span className="text-xs font-bold">{mode.label}</span>
                            <span className="text-[9px] opacity-60 uppercase">{mode.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Date System</h3>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'ENGLISH', label: 'English', desc: 'Gregorian' },
                        { id: 'NEPALI', label: 'Nepali', desc: 'Bikram Sambat' },
                    ].map((system) => (
                        <button
                            key={system.id}
                            onClick={() => { haptic.light(); handleSaveSettings({ ...settings, dateSystem: system.id as AppSettings['dateSystem'] }); }}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all active-scale
                ${settings.dateSystem === system.id
                                    ? 'bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        >
                            <div className="text-left">
                                <p className="text-xs font-bold">{system.label}</p>
                                <p className="text-[10px] opacity-70 uppercase">{system.desc}</p>
                            </div>
                            <CalendarDays size={16} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
