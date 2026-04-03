import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  label: string;
  checked: boolean;
  onToggle: () => void;
  className?: string;
}

export const ClickToggleItem: React.FC<Props> = ({
  label,
  checked,
  onToggle,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
        checked
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
          : 'bg-white dark:bg-black/20 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
      } ${className}`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-md border ${
          checked
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-zinc-300 dark:border-zinc-700 bg-transparent'
        }`}
      >
        {checked && <CheckCircle2 size={12} />}
      </span>
      <span className="flex-1">{label}</span>
    </button>
  );
};
