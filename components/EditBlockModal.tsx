
import React, { useState } from 'react';
import { ScheduleBlock, ActivityMode } from '../types';
import { X, Save, Clock, Tag, AlertCircle } from 'lucide-react';

interface Props {
  block: ScheduleBlock;
  onSave: (id: string, updates: Partial<ScheduleBlock>) => void;
  onClose: () => void;
}

export const EditBlockModal: React.FC<Props> = ({ block, onSave, onClose }) => {
  const [startTime, setStartTime] = useState(block.startTime);
  const [endTime, setEndTime] = useState(block.endTime);
  const [activityName, setActivityName] = useState(block.activityName);
  const [mode, setMode] = useState<ActivityMode>(block.mode);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    // Validation
    if (endTime <= startTime && !endTime.startsWith('00') && !startTime.startsWith('23')) {
      setError("End time cannot be before Start time");
      return;
    }

    onSave(block.id, {
      startTime,
      endTime,
      activityName,
      mode
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Edit Block
          </h2>
          <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-sm">
             <AlertCircle size={14} />
             {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Activity Name */}
          <div>
            <label className="text-xs font-mono text-zinc-500 uppercase mb-2 block flex items-center gap-1.5">
              <Tag size={12} /> Activity Name
            </label>
            <input 
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              className="w-full bg-black text-white p-3 rounded-xl border border-zinc-800 focus:border-primary-500/50 outline-none transition-all placeholder-zinc-700"
              placeholder="e.g. Pharmacology Study"
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-zinc-500 uppercase mb-2 block flex items-center gap-1.5">
                <Clock size={12} /> Start
              </label>
              <input 
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setError(null);
                }}
                className="w-full bg-black text-white p-3 rounded-xl border border-zinc-800 focus:border-primary-500/50 outline-none appearance-none"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-500 uppercase mb-2 block flex items-center gap-1.5">
                <Clock size={12} /> End
              </label>
              <input 
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setError(null);
                }}
                className="w-full bg-black text-white p-3 rounded-xl border border-zinc-800 focus:border-primary-500/50 outline-none appearance-none"
              />
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="text-xs font-mono text-zinc-500 uppercase mb-2 block">Category Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Study', 'Deep Work', 'Class', 'Rest', 'Human'] as ActivityMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`text-xs font-medium py-2 rounded-lg border transition-all
                    ${mode === m 
                      ? 'bg-zinc-100 text-black border-zinc-100' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            className="w-full mt-4 bg-primary-600 text-white font-semibold py-3.5 rounded-xl hover:bg-primary-500 transition-colors shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
