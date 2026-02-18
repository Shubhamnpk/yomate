
import React, { useState } from 'react';
import { Info, RefreshCw, Github, Globe, Shield, ExternalLink, Sparkles, Heart } from 'lucide-react';
import { haptic } from '../../services/hapticService';

// Version and Build details
const APP_VERSION = '5.2.0';
const BUILD_NUMBER = '2026.02.12.19';

export const AboutTab: React.FC = () => {
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'latest' | 'available'>('idle');

    const handleCheckUpdate = () => {
        haptic.medium();
        setIsCheckingUpdate(true);
        // Simulate update check
        setTimeout(() => {
            setIsCheckingUpdate(false);
            setUpdateStatus('latest');
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            {/* App Branding */}
            <div className="flex flex-col items-center justify-center py-6">
                <div className="relative mb-4">
                    <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full"></div>
                    <div className="relative w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-[1.5rem] flex items-center justify-center rotate-[10deg] shadow-2xl overflow-hidden">
                        <img src="/yomate.png" alt="yomate logo" className="w-full h-full object-cover p-2" />
                    </div>
                </div>
                <h2 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">Yomate</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Deep Work Forge</p>
            </div>

            {/* Version Info */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">System Status</h3>
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Info size={16} className="text-zinc-400" />
                            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Version</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white">{APP_VERSION}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Shield size={16} className="text-zinc-400" />
                            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Build</span>
                        </div>
                        <span className="text-sm font-mono text-zinc-400">{BUILD_NUMBER}</span>
                    </div>

                    <button
                        onClick={handleCheckUpdate}
                        disabled={isCheckingUpdate}
                        className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all active-scale
                            ${updateStatus === 'latest'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                : 'bg-zinc-900 dark:bg-white dark:text-black text-white hover:opacity-90'}`}
                    >
                        {isCheckingUpdate ? (
                            <RefreshCw size={14} className="animate-spin" />
                        ) : updateStatus === 'latest' ? (
                            'System Up to Date'
                        ) : (
                            'Check for Updates'
                        )}
                    </button>

                    {updateStatus === 'latest' && (
                        <p className="text-[10px] text-center text-emerald-500 font-bold uppercase tracking-tight animate-in fade-in">
                            You are running the latest stable release
                        </p>
                    )}
                </div>
            </div>

            {/* Links & Community */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Resources</h3>
                <div className="grid grid-cols-2 gap-3">
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); haptic.light(); }}
                        className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col gap-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                        <Github size={20} className="text-zinc-400" />
                        <span className="text-xs font-bold dark:text-white">Github</span>
                    </a>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); haptic.light(); }}
                        className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col gap-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                        <Globe size={20} className="text-zinc-400" />
                        <span className="text-xs font-bold dark:text-white">Website</span>
                    </a>
                </div>
            </div>

            {/* Support */}
            <div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-500/10 rounded-lg text-primary-500">
                        <Heart size={18} fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-sm font-bold dark:text-white">Support Development</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Buy us a coffee</p>
                    </div>
                </div>
                <ExternalLink size={16} className="text-zinc-500" />
            </div>

            {/* Footer */}
            <div className="text-center pb-4">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Designed with intensity</p>
                <p className="text-[10px] text-zinc-400 mt-1">© 2026 Yomate. All rights reserved.</p>
            </div>
        </div>
    );
};
