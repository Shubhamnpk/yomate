
import React, { useState, useEffect, useRef } from 'react';
import { DayLog, TodoItem } from '../types';
import { saveLog } from '../services/storageService';
import { X, StickyNote, Plus, CheckSquare, Square, Eye, EyeOff } from 'lucide-react';
import { haptic } from '../services/hapticService';
import { renderMarkdown } from '../services/markdown';

interface Props {
  log: DayLog;
  onClose: () => void;
  refreshLog: () => void;
}

export const BrainDump: React.FC<Props> = ({ log, onClose, refreshLog }) => {
  const [content, setContent] = useState(log.scratchpad || '');
  const [newTodo, setNewTodo] = useState('');
  const [todos, setTodos] = useState<TodoItem[]>(log.todos || []);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [previewMarkdown, setPreviewMarkdown] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSave = () => {
    const newLog = { ...log, scratchpad: content, todos };
    saveLog(log.date, newLog);
    refreshLog();
    onClose();
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const newItem: TodoItem = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false
    };
    setTodos([...todos, newItem]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div onClick={() => { haptic.light(); onClose(); }} className="absolute inset-0"></div>
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[70vh] overflow-hidden animate-slide-up sm:animate-in sm:zoom-in-95 relative">
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold">
            <StickyNote size={18} className="text-amber-500" />
            <h3 className="font-display">Brain Dump</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMarkdown(prev => !prev)}
              className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
            >
              {previewMarkdown ? <EyeOff size={12} /> : <Eye size={12} />}
              {previewMarkdown ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={() => { haptic.success(); handleSave(); }}
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 active-scale"
            >
              Save & Close
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Todo Section (Mini) */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 max-h-[40%] flex flex-col shrink-0">
            <form onSubmit={handleAddTodo} className="flex gap-2 mb-2">
              <input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Quick task..."
                className="flex-1 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition-all font-medium"
              />
              <button type="submit" disabled={!newTodo.trim()} className="bg-zinc-900 dark:bg-white text-white dark:text-black p-3 rounded-xl active-scale" onClick={() => haptic.medium()}><Plus size={16} /></button>
            </form>
            <div className="overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {todos.map(t => (
                <div key={t.id} onClick={() => { haptic.light(); toggleTodo(t.id); }} className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group">
                  <div className={`transition-all ${t.completed ? 'text-emerald-500 scale-110' : 'text-zinc-300'}`}>
                    {t.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                  </div>
                  <span className={`text-sm truncate transition-all ${t.completed ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'}`}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Text Section */}
          <div className="flex-1 p-4 bg-yellow-50 dark:bg-zinc-950/50 relative">
            {previewMarkdown ? (
              <div className="w-full h-full overflow-y-auto pr-1 custom-scrollbar">
                {content.trim() ? renderMarkdown(content) : <p className="text-zinc-400 text-sm">Nothing to preview yet.</p>}
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                className="w-full h-full bg-transparent resize-none outline-none text-zinc-800 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-600 leading-relaxed text-base font-medium"
                placeholder="Dump your thoughts here... Use Markdown like # heading, - list, **bold**"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            )}
            <div className="absolute bottom-4 right-4 opacity-50 pointer-events-none">
              <StickyNote size={64} className="text-amber-500/10" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
