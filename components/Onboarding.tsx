
import React, { useState } from 'react';
import { ArrowRight, User, Sparkles, Target, CheckCircle2, Zap, Smartphone, Moon, ShieldCheck } from 'lucide-react';
import { AppSettings, Subject } from '../types';
import { haptic } from '../services/hapticService';
import { saveAppSettings, saveCustomSubjects } from '../services/storageService';

interface Props {
    onComplete: () => void;
    settings: AppSettings;
}

const STEPS = ['WELCOME', 'IDENTITY', 'GOALS', 'HABITS', 'FINISH'];

export const Onboarding: React.FC<Props> = ({ onComplete, settings }) => {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [selectedRituals, setSelectedRituals] = useState<string[]>(['Exercise', 'Meditation', 'Reading']);

    const isDark = settings.themeMode !== 'light';
    const themeBg = {
        zinc: 'bg-zinc-950',
        black: 'bg-black',
        light: 'bg-zinc-50'
    }[settings.themeMode];

    const panelBg = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200';
    const textTitle = isDark ? 'text-white' : 'text-zinc-900';
    const textSub = isDark ? 'text-zinc-400' : 'text-zinc-500';

    const nextStep = () => {
        haptic.medium();
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            handleFinalize();
        }
    };

    const handleFinalize = () => {
        const finalSettings: AppSettings = {
            ...settings,
            userName: name || 'Seeker',
            rituals: selectedRituals,
            onboarded: true
        };

        saveAppSettings(finalSettings);
        onComplete();
    };

    const renderStep = () => {
        switch (STEPS[step]) {
            case 'WELCOME':
                return (
                    <div className="flex flex-col items-center text-center space-y-10 animate-in fade-in zoom-in duration-1000">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-500/30 blur-[60px] rounded-full animate-pulse-slow"></div>
                            <div className={`relative w-28 h-28 ${isDark ? 'bg-zinc-900 border-zinc-800/50' : 'bg-white border-zinc-100 shadow-xl'} border-2 rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-[15deg] overflow-hidden group transition-all duration-700 hover:rotate-0`}>
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-transparent"></div>
                                <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-1000"></div>
                                <Sparkles className="text-primary-500 w-14 h-14 drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-300">
                                <span className={`text-[10px] font-bold uppercase tracking-[0.4em] ${isDark ? 'text-zinc-500/50' : 'text-zinc-400'}`}>Protocol v5.2 Active</span>
                                <h1 className={`text-5xl font-display font-bold tracking-tight mt-2 ${isDark ? 'text-white' : 'text-zinc-900'} drop-shadow-sm`}>
                                    <span className="text-primary-500 italic">yomate</span>
                                </h1>
                            </div>
                            <p className={`${textSub} text-base font-medium max-w-[280px] leading-relaxed animate-in fade-in slide-in-from-bottom duration-700 delay-500`}>
                                A high-performance environment for <span className={textTitle}>Students</span>, <span className={textTitle}>Coders</span>, and <span className={textTitle}>Builders</span>.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full animate-in fade-in slide-in-from-bottom duration-700 delay-700">
                            <div className={`p-5 ${panelBg} border rounded-3xl flex flex-col items-start gap-4 transition-all hover:scale-[1.02] active:scale-[0.98]`}>
                                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 shadow-inner">
                                    <Zap size={22} className="animate-pulse" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Focus Hub</p>
                                    <p className={`text-sm font-bold ${textTitle}`}>Deep Work</p>
                                </div>
                            </div>
                            <div className={`p-5 ${panelBg} border rounded-3xl flex flex-col items-start gap-4 transition-all hover:scale-[1.02] active:scale-[0.98]`}>
                                <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500 shadow-inner">
                                    <Smartphone size={22} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Restraint</p>
                                    <p className={`text-sm font-bold ${textTitle}`}>Social Detox</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'IDENTITY':
                return (
                    <div className="flex flex-col space-y-8 animate-in slide-in-from-right duration-500">
                        <div className="space-y-2">
                            <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500">
                                <User size={24} />
                            </div>
                            <h2 className={`text-3xl font-bold ${textTitle}`}>Who are you?</h2>
                            <p className={textSub}>Personalize your protocol workspace.</p>
                        </div>

                        <div className="space-y-4">
                            <input
                                autoFocus
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className={`w-full ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border-2 focus:border-primary-500 rounded-2xl p-4 text-xl outline-none transition-all placeholder:text-zinc-700 ${isDark ? 'text-white' : 'text-zinc-900'}`}
                            />
                            <p className="text-xs text-zinc-500 pl-2 italic">How shall we address you in the forge?</p>
                        </div>
                    </div>
                );

            case 'GOALS':
                return (
                    <div className="flex flex-col space-y-8 animate-in slide-in-from-right duration-500">
                        <div className="space-y-2">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                                <Target size={24} />
                            </div>
                            <h2 className={`text-3xl font-bold ${textTitle}`}>Your Mission?</h2>
                            <p className={textSub}>What is the primary objective of this phase?</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { label: 'Academic Excellence', val: 'Exams & Mastery', icon: '🎓' },
                                { label: 'Software Mastery', val: 'Coding & Shipping', icon: '💻' },
                                { label: 'Creative Builder', val: 'Creating & Designing', icon: '🎨' },
                                { label: 'Pure Performance', val: 'General Productivity', icon: '⚡' },
                            ].map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => { haptic.light(); setGoal(opt.val); }}
                                    className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${goal === opt.val ? 'bg-primary-600 border-primary-500 shadow-lg shadow-primary-900/20 text-white' : `${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} hover:border-zinc-700`
                                        }`}
                                >
                                    <span className="text-2xl">{opt.icon}</span>
                                    <div>
                                        <p className={`font-bold ${goal === opt.val ? 'text-white' : textTitle}`}>{opt.label}</p>
                                        <p className={`text-xs ${goal === opt.val ? 'text-white/70' : 'text-zinc-400'}`}>{opt.val}</p>
                                    </div>
                                    {goal === opt.val && <CheckCircle2 className="ml-auto text-white" size={20} />}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'HABITS':
                return (
                    <div className="flex flex-col space-y-8 animate-in slide-in-from-right duration-500">
                        <div className="space-y-2">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                                <Moon size={24} />
                            </div>
                            <h2 className={`text-3xl font-bold ${textTitle}`}>Daily Rituals</h2>
                            <p className={textSub}>Non-negotiable habits to anchor your day.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                'Gym', 'Reading', 'Meditation', 'Journaling', 'No Socials', 'Deep Work', 'Hydrate', 'Walk'
                            ].map((ritual) => (
                                <button
                                    key={ritual}
                                    onClick={() => {
                                        haptic.light();
                                        setSelectedRituals(prev =>
                                            prev.includes(ritual) ? prev.filter(r => r !== ritual) : [...prev, ritual]
                                        );
                                    }}
                                    className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${selectedRituals.includes(ritual) ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/10' : `${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-500'}`
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedRituals.includes(ritual) ? 'border-white bg-white' : 'border-zinc-700'}`}>
                                        {selectedRituals.includes(ritual) && <CheckCircle2 size={12} className="text-indigo-600" />}
                                    </div>
                                    <span className="text-sm font-medium">{ritual}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Pick at least 3 rituals</p>
                    </div>
                );

            case 'FINISH':
                return (
                    <div className="flex flex-col items-center text-center space-y-10 animate-in fade-in zoom-in duration-1000">
                        <div className="w-32 h-32 relative">
                            <div className="absolute inset-0 bg-primary-500/20 blur-2xl animate-pulse"></div>
                            <div className={`relative ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xl'} border rounded-full h-full w-full flex items-center justify-center shadow-inner`}>
                                <ShieldCheck size={64} className="text-primary-500 animate-bounce" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className={`text-4xl font-display font-bold ${textTitle}`}>System Ready</h2>
                            <p className={`${textSub} max-w-[280px]`}>
                                Your personalization is complete. The forge awaits your arrival, <span className="text-primary-400">{name || 'Seeker'}</span>.
                            </p>
                        </div>

                        <div className={`p-4 ${panelBg} border rounded-2xl w-full flex items-center gap-4`}>
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
                                <Sparkles size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase">Status</p>
                                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Full Access Granted</p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={`fixed inset-0 z-[200] ${themeBg} flex flex-col p-8 overflow-hidden transition-colors duration-500`}>
            {/* Background Decor */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-600/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full"></div>

            {/* Step Indicator */}
            {step < STEPS.length && (
                <div className="flex gap-1.5 mb-12 relative z-10">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-500 ${i === step ? 'flex-[2] bg-primary-500' :
                                i < step ? 'flex-1 bg-zinc-500' : 'flex-1 bg-zinc-800'
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Main Container */}
            <div className="flex-1 flex flex-col justify-center relative z-10 max-w-sm mx-auto w-full">
                {renderStep()}
            </div>

            {/* Navigation Footer */}
            <div className="mt-8 relative z-10">
                <button
                    onClick={nextStep}
                    disabled={
                        (STEPS[step] === 'IDENTITY' && !name) ||
                        (STEPS[step] === 'GOALS' && !goal) ||
                        (STEPS[step] === 'HABITS' && selectedRituals.length < 3)
                    }
                    className={`w-full ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-black'} h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-30 disabled:grayscale transition-all active:scale-[0.98] shadow-2xl`}
                >
                    {STEPS[step] === 'WELCOME' ? 'Start Protocol' :
                        STEPS[step] === 'FINISH' ? 'Enter Workspace' :
                            'Continue'}
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};
