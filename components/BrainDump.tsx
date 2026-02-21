import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DayLog, TodoItem } from '../types';
import { saveLog } from '../services/storageService';
import { X, StickyNote, Plus, CheckSquare, Square } from 'lucide-react';
import { haptic } from '../services/hapticService';

interface Props {
  log: DayLog;
  onClose: () => void;
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

export const BrainDump: React.FC<Props> = ({ log, onClose, refreshLog }) => {
  const [content, setContent] = useState(log.scratchpad || '');
  const [newTodo, setNewTodo] = useState('');
  const [todos, setTodos] = useState<TodoItem[]>(log.todos || []);
  const quillRef = useRef<ReactQuill | null>(null);
  const [isMobileToolbar, setIsMobileToolbar] = useState(() => window.innerWidth <= 640);

  useEffect(() => {
    quillRef.current?.focus();
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobileToolbar(window.innerWidth <= 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setContent(log.scratchpad || '');
    setTodos(log.todos || []);
  }, [log.date, log.scratchpad, log.todos]);

  const handleSave = () => {
    saveLog(log.date, { ...log, scratchpad: content, todos });
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
  const quillModules = useMemo(() => (isMobileToolbar ? MOBILE_QUILL_MODULES : QUILL_MODULES), [isMobileToolbar]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div onClick={() => { haptic.light(); onClose(); }} className="absolute inset-0"></div>
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[70vh] overflow-hidden animate-slide-up sm:animate-in sm:zoom-in-95 relative">
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold">
            <StickyNote size={18} className="text-amber-500" />
            <h3 className="font-display">Brain Dump</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">React Quill</span>
            <button
              onClick={() => { haptic.success(); handleSave(); }}
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 active-scale"
            >
              Save & Close
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 max-h-[40%] flex flex-col shrink-0">
            <form onSubmit={handleAddTodo} className="flex gap-2 mb-2">
              <input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Quick task..."
                className="flex-1 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition-all font-medium"
              />
              <button title="Add Todo" type="submit" disabled={!newTodo.trim()} className="bg-zinc-900 dark:bg-white text-white dark:text-black p-3 rounded-xl active-scale" onClick={() => haptic.medium()}><Plus size={16} /></button>
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

          <div className="flex-1 p-4 bg-yellow-50 dark:bg-zinc-950/50">
            <div className="h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <QuillEditor
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                placeholder="Dump your thoughts here..."
                className="h-full"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
