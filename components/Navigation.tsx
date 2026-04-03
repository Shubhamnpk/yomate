
import React from 'react';
import { ViewState } from '../types';
import { LayoutList, Zap, Moon, BarChart2, StickyNote, BookOpenCheck } from 'lucide-react';
import { haptic } from '../services/hapticService';

interface Props {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navigation: React.FC<Props> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'TIMETABLE', label: 'Day', icon: LayoutList },
    { id: 'NOTES', label: 'Notes', icon: StickyNote },
    { id: 'CURRICULUM', label: 'Track', icon: BookOpenCheck },
    { id: 'FOCUS', label: 'Focus', icon: Zap },
    { id: 'STATS', label: 'Stats', icon: BarChart2 },
    { id: 'NIGHT', label: 'End', icon: Moon },
  ] as const;

  return (
    <nav className="pointer-events-auto">
      <div className="flex items-center gap-1 p-2 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-300 dark:border-zinc-800/50 rounded-2xl shadow-xl dark:shadow-2xl ring-1 ring-zinc-200/60 dark:ring-white/5">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          const compact = navItems.length > 5;

          return (
            <button
              key={item.id}
              onClick={() => {
                haptic.light();
                setView(item.id);
              }}
              className={`relative flex flex-col items-center justify-center ${compact ? 'w-12 h-12' : 'w-14 h-14'} rounded-xl transition-all duration-300 group active-scale border
                ${isActive
                  ? 'bg-primary-500/12 dark:bg-zinc-800 text-primary-700 dark:text-white border-primary-500/35 dark:border-zinc-700 dark: shadow-sm shadow-primary-500/10 [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.72)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                  : 'text-zinc-600 border-transparent hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-transparent dark:hover:border-zinc-700/80'
                }`}
            >
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-transparent via-primary-500 to-transparent rounded-full shadow-[0_0_8px_rgb(var(--primary))]"></span>
              )}

              <Icon
                size={compact ? 18 : 20}
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-transform duration-300 ${isActive ? 'scale-110 mb-1' : 'group-hover:scale-105'}`}
              />

              {isActive && (
                <span className="text-[9px] font-bold tracking-wider uppercase opacity-0 animate-in fade-in slide-in-from-bottom-1 duration-200 fill-mode-forwards" style={{ animationDelay: '100ms', opacity: 1 }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
