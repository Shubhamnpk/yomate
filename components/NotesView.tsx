
import React, { useState, useRef, useEffect } from 'react';
import { DayLog, TodoItem } from '../types';
import { saveLog } from '../services/storageService';
import { StickyNote, Plus, Trash2, Square, CheckSquare, Eye, EyeOff } from 'lucide-react';
import { haptic } from '../services/hapticService';
import { renderMarkdown } from '../services/markdown';

interface Props {
  log: DayLog;
  refreshLog: () => void;
}

export const NotesView: React.FC<Props> = React.memo(({ log, refreshLog }) => {
  const [scratchpad, setScratchpad] = useState(log.scratchpad || '');
  const [newTodo, setNewTodo] = useState('');
  const scratchpadRef = useRef<HTMLTextAreaElement | null>(null);
  const [previewMarkdown, setPreviewMarkdown] = useState(false);

  // Debounce save for text area
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scratchpad !== log.scratchpad) {
        const newLog = { ...log, scratchpad };
        saveLog(log.date, newLog);
        // We don't call refreshLog here to avoid re-rendering while typing causing cursor jumps
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [scratchpad]);

  useEffect(() => {
    const handleQuickNote = () => {
      scratchpadRef.current?.focus();
      const len = scratchpadRef.current?.value.length || 0;
      scratchpadRef.current?.setSelectionRange(len, len);
    };
    window.addEventListener('quick-note', handleQuickNote);
    return () => window.removeEventListener('quick-note', handleQuickNote);
  }, []);

  const handleAddTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTodo.trim()) return;

    const newItem: TodoItem = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false
    };

    const newLog = { ...log, todos: [...(log.todos || []), newItem], scratchpad }; // Ensure scratchpad is current
    saveLog(log.date, newLog);
    refreshLog();
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = (log.todos || []).map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    const newLog = { ...log, todos: updatedTodos, scratchpad };
    saveLog(log.date, newLog);
    refreshLog();
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = (log.todos || []).filter(t => t.id !== id);
    const newLog = { ...log, todos: updatedTodos, scratchpad };
    saveLog(log.date, newLog);
    refreshLog();
  };

  return (
    <div className="p-5 pb-32 animate-in fade-in duration-500 flex flex-col h-full">
      <header className="mt-4 mb-6">
        <h1 className="text-3xl font-display font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
          Brain Dump <StickyNote className="text-amber-500" size={28} />
        </h1>
        <p className="text-zinc-500 text-sm">Clear your mind. Tasks & thoughts.</p>
      </header>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">

        {/* To-Do Section */}
        <div className="flex flex-col max-h-[50%]">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Quick Tasks</h2>

          <form onSubmit={handleAddTodo} className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a task..."
              className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!newTodo.trim()}
              className="bg-zinc-900 dark:bg-white text-white dark:text-black p-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all active-scale"
              onClick={() => haptic.medium()}
            >
              <Plus size={20} />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 no-scrollbar">
            {(log.todos || []).length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800/50 rounded-xl">
                <p className="text-zinc-400 text-xs">No tasks yet.</p>
              </div>
            )}
            {(log.todos || []).map(todo => (
              <div key={todo.id} className="group flex items-center justify-between p-3 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-amber-500/30 transition-colors">
                <button
                  onClick={() => { haptic.light(); toggleTodo(todo.id); }}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <div className={`shrink-0 transition-colors ${todo.completed ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-600'}`}>
                    {todo.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                  </div>
                  <span className={`text-sm font-medium transition-all ${todo.completed ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200'}`}>
                    {todo.text}
                  </span>
                </button>
                <button
                  onClick={() => { haptic.medium(); deleteTodo(todo.id); }}
                  className="text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all px-2 active-scale"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Scratchpad Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Free Notes</h2>
            <button
              onClick={() => setPreviewMarkdown(prev => !prev)}
              className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
            >
              {previewMarkdown ? <EyeOff size={12} /> : <Eye size={12} />}
              {previewMarkdown ? 'Edit' : 'Preview'}
            </button>
          </div>
          <div className="flex-1 bg-amber-50 dark:bg-zinc-900 border border-amber-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm relative overflow-hidden focus-within:ring-1 focus-within:ring-amber-500/50 transition-all">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-400/50"></div>
            {previewMarkdown ? (
              <div className="w-full h-full overflow-y-auto no-scrollbar pr-1">
                {scratchpad.trim() ? renderMarkdown(scratchpad) : <p className="text-zinc-400 text-sm">Nothing to preview yet.</p>}
              </div>
            ) : (
              <textarea
                ref={scratchpadRef}
                value={scratchpad}
                onChange={(e) => setScratchpad(e.target.value)}
                placeholder="Type anything here... Use Markdown like # heading, - list, **bold**"
                className="w-full h-full bg-transparent resize-none outline-none text-zinc-800 dark:text-zinc-300 placeholder-zinc-400 leading-relaxed text-sm"
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
});
