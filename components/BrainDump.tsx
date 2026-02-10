
import React, { useState, useEffect, useRef } from 'react';
import { DayLog, TodoItem } from '../types';
import { saveLog } from '../services/storageService';
import { X, StickyNote, Trash2, Plus, CheckSquare, Square } from 'lucide-react';

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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col h-[70vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold">
            <StickyNote size={18} className="text-amber-500" />
            <h3>Brain Dump</h3>
          </div>
          <button 
            onClick={handleSave}
            className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
           {/* Todo Section (Mini) */}
           <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 max-h-[40%] flex flex-col">
              <form onSubmit={handleAddTodo} className="flex gap-2 mb-2">
                <input 
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Quick task..."
                  className="flex-1 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-amber-500"
                />
                <button type="submit" disabled={!newTodo.trim()} className="bg-zinc-900 dark:bg-white text-white dark:text-black p-2 rounded-lg"><Plus size={16}/></button>
              </form>
              <div className="overflow-y-auto space-y-1 pr-1">
                 {todos.map(t => (
                   <div key={t.id} onClick={() => toggleTodo(t.id)} className="flex items-center gap-2 p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                      <div className={t.completed ? 'text-emerald-500' : 'text-zinc-300'}>
                        {t.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                      </div>
                      <span className={`text-sm truncate ${t.completed ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'}`}>{t.text}</span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Text Section */}
           <div className="flex-1 p-4 bg-yellow-50 dark:bg-zinc-950/50">
            <textarea
              ref={textareaRef}
              className="w-full h-full bg-transparent resize-none outline-none text-zinc-800 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-600 leading-relaxed text-sm"
              placeholder="Dump your thoughts here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
           <button 
             onClick={handleSave}
             className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
           >
             Save Sync
           </button>
        </div>

      </div>
    </div>
  );
};
