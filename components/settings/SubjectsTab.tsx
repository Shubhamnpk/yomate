
import React, { useState } from 'react';
import { Plus, Star, Trash2 } from 'lucide-react';
import { Subject } from '../../types';
import { saveCustomSubjects } from '../../services/storageService';

interface Props {
    subjects: Subject[];
    setSubjects: (s: Subject[]) => void;
}

export const SubjectsTab: React.FC<Props> = ({ subjects, setSubjects }) => {
    const [newSubName, setNewSubName] = useState('');
    const [newSubCat, setNewSubCat] = useState('Pharmacy');

    const handleAddSubject = () => {
        if (!newSubName) return;
        const newSub: Subject = {
            id: `custom_${Date.now()}`,
            name: newSubName,
            category: newSubCat as any,
            priority: 'Normal'
        };
        const newSubjects = [...subjects, newSub];
        setSubjects(newSubjects);
        saveCustomSubjects(newSubjects);
        setNewSubName('');
    };

    const handleRemoveSubject = (id: string) => {
        if (confirm("Remove this subject?")) {
            const newSubjects = subjects.filter(s => s.id !== id);
            setSubjects(newSubjects);
            saveCustomSubjects(newSubjects);
        }
    };

    const toggleSubjectPriority = (id: string) => {
        const newSubjects = subjects.map(s => {
            if (s.id === id) {
                return { ...s, priority: s.priority === 'High' ? 'Normal' : 'High' } as Subject;
            }
            return s;
        });
        setSubjects(newSubjects);
        saveCustomSubjects(newSubjects);
    };

    return (
        <div className="space-y-6">
            <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Add Subject</h3>
                <div className="space-y-3">
                    <input
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        placeholder="Subject Name"
                        className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm text-zinc-900 dark:text-white focus:border-primary-500 outline-none"
                    />
                    <div className="flex gap-2">
                        <select
                            value={newSubCat}
                            onChange={(e) => setNewSubCat(e.target.value)}
                            className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm text-zinc-500 dark:text-zinc-400 focus:border-primary-500 outline-none flex-1"
                        >
                            <option value="Pharmacy">Pharmacy</option>
                            <option value="Coding">Coding</option>
                            <option value="Other">Other</option>
                        </select>
                        <button
                            onClick={handleAddSubject}
                            disabled={!newSubName}
                            className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-lg px-4 flex items-center"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                {subjects.map(subject => (
                    <div key={subject.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-lg group">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => toggleSubjectPriority(subject.id)}
                                className={`transition-colors ${subject.priority === 'High' ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-500'}`}
                            >
                                <Star size={16} className={subject.priority === 'High' ? 'fill-current' : ''} />
                            </button>
                            <div>
                                <p className={`text-sm font-medium ${subject.priority === 'High' ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-300'}`}>{subject.name}</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{subject.category}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleRemoveSubject(subject.id)}
                            className="p-2 text-zinc-600 hover:text-rose-500 transition-colors opacity-50 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
