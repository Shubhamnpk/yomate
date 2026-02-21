import React, { useMemo, useRef, useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DayLog, TodoItem } from '../types';
import { saveLog } from '../services/storageService';
import { StickyNote, Plus, Trash2, Square, CheckSquare } from 'lucide-react';
import { haptic } from '../services/hapticService';

interface Props {
  log: DayLog;
  refreshLog: () => void;
}

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
};
const MOBILE_QUILL_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'bullet' }, { list: 'ordered' }],
    ['blockquote', 'link'],
    ['clean'],
  ],
};
const QuillEditor = ReactQuill as any;

export const NotesView: React.FC<Props> = React.memo(({ log, refreshLog }) => {
  const [scratchpad, setScratchpad] = useState(log.scratchpad || '');
  const [newTodo, setNewTodo] = useState('');
  const quillRef = useRef<ReactQuill | null>(null);
  const [isMobileToolbar, setIsMobileToolbar] = useState(() => window.innerWidth <= 640);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scratchpad !== (log.scratchpad || '')) {
        saveLog(log.date, { ...log, scratchpad });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [scratchpad, log]);

  useEffect(() => {
    setScratchpad(log.scratchpad || '');
  }, [log.date, log.scratchpad]);

  useEffect(() => {
    const handleQuickNote = () => {
      setTimeout(() => {
        quillRef.current?.focus();
      }, 0);
    };
    window.addEventListener('quick-note', handleQuickNote);
    return () => window.removeEventListener('quick-note', handleQuickNote);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobileToolbar(window.innerWidth <= 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleAddTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTodo.trim()) return;

    const newItem: TodoItem = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false
    };

    const newLog = { ...log, todos: [...(log.todos || []), newItem], scratchpad };
    saveLog(log.date, newLog);
    refreshLog();
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = (log.todos || []).map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveLog(log.date, { ...log, todos: updatedTodos, scratchpad });
    refreshLog();
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = (log.todos || []).filter(t => t.id !== id);
    saveLog(log.date, { ...log, todos: updatedTodos, scratchpad });
    refreshLog();
  };

  const quillThemeClass = useMemo(
    () => 'quill-notes flex-1 min-h-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden',
    []
  );
  const quillModules = useMemo(() => (isMobileToolbar ? MOBILE_QUILL_MODULES : QUILL_MODULES), [isMobileToolbar]);

  return (
    <div className="p-5 pb-32 animate-in fade-in duration-500 flex flex-col h-full">
      <header className="mt-4 mb-6">
        <h1 className="text-3xl font-display font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
          Brain Dump <StickyNote className="text-amber-500" size={28} />
        </h1>
        <p className="text-zinc-500 text-sm">Rich text notes + tasks.</p>
      </header>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
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
              title="Add Task"
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
                  title="Delete Task"
                  className="text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all px-2 active-scale"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Free Notes</h2>
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">React Quill</span>
          </div>
          <div className={quillThemeClass}>
            <QuillEditor
              ref={quillRef}
              theme="snow"
              value={scratchpad}
              onChange={setScratchpad}
              modules={quillModules}
              placeholder="Write your notes..."
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
});
