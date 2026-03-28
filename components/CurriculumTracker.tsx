import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  BookOpen,
  GraduationCap,
  FlaskConical,
  ScrollText,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { class11ScienceData, secondYearData, thirdYearData, YearData } from '../data/curriculum';
import { haptic } from '../services/hapticService';
import {
  CurriculumProgramId,
  CurriculumProgressMap,
  getCurriculumProgress,
  saveCurriculumProgress,
} from '../services/storageService';

type ProgramConfig = {
  id: CurriculumProgramId;
  title: string;
  shortTitle: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  data: YearData;
};

type SubjectFilter = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

const PROGRAMS: ProgramConfig[] = [
  {
    id: 'pharmacy-year-2',
    title: 'Pharmacy Year 2',
    shortTitle: '2nd Year',
    subtitle: 'Diploma in Pharmacy',
    icon: FlaskConical,
    data: secondYearData,
  },
  {
    id: 'pharmacy-year-3',
    title: 'Pharmacy Year 3',
    shortTitle: '3rd Year',
    subtitle: 'Diploma in Pharmacy',
    icon: GraduationCap,
    data: thirdYearData,
  },
  {
    id: 'class-11-science',
    title: 'Class 11 Science',
    shortTitle: 'Class 11',
    subtitle: 'NEB Curriculum',
    icon: BookOpen,
    data: class11ScienceData,
  },
];

const FILTERS: { id: SubjectFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'COMPLETED', label: 'Completed' },
];

const cloneProgress = (progress: CurriculumProgressMap): CurriculumProgressMap => ({
  'pharmacy-year-2': {
    ...progress['pharmacy-year-2'],
    readUnitIds: [...progress['pharmacy-year-2'].readUnitIds],
    completedSubUnitIds: [...progress['pharmacy-year-2'].completedSubUnitIds],
  },
  'pharmacy-year-3': {
    ...progress['pharmacy-year-3'],
    readUnitIds: [...progress['pharmacy-year-3'].readUnitIds],
    completedSubUnitIds: [...progress['pharmacy-year-3'].completedSubUnitIds],
  },
  'class-11-science': {
    ...progress['class-11-science'],
    readUnitIds: [...progress['class-11-science'].readUnitIds],
    completedSubUnitIds: [...progress['class-11-science'].completedSubUnitIds],
  },
});

const dedupe = (items: string[]) => Array.from(new Set(items));

export const CurriculumTracker: React.FC = () => {
  const [selectedProgramId, setSelectedProgramId] = useState<CurriculumProgramId>('pharmacy-year-2');
  const [progressMap, setProgressMap] = useState<CurriculumProgressMap>(() => cloneProgress(getCurriculumProgress()));
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('ALL');

  const selectedProgram = useMemo(
    () => PROGRAMS.find((program) => program.id === selectedProgramId) || PROGRAMS[0],
    [selectedProgramId]
  );

  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);

  const selectedProgress = progressMap[selectedProgram.id];
  const readUnitSet = useMemo(() => new Set(selectedProgress.readUnitIds), [selectedProgress.readUnitIds]);
  const completedSubUnitSet = useMemo(
    () => new Set(selectedProgress.completedSubUnitIds),
    [selectedProgress.completedSubUnitIds]
  );

  const allUnitIds = useMemo(
    () => selectedProgram.data.subjects.flatMap((subject) => subject.units.map((unit) => unit.id)),
    [selectedProgram]
  );

  const allSubUnitIds = useMemo(
    () => selectedProgram.data.subjects.flatMap((subject) => subject.units.flatMap((unit) => unit.subUnits.map((subUnit) => subUnit.id))),
    [selectedProgram]
  );
  const unitSubUnitMap = useMemo(() => {
    const map = new Map<string, string[]>();
    selectedProgram.data.subjects.forEach((subject) => {
      subject.units.forEach((unit) => {
        map.set(unit.id, unit.subUnits.map((subUnit) => subUnit.id));
      });
    });
    return map;
  }, [selectedProgram]);
  const subUnitToUnitMap = useMemo(() => {
    const map = new Map<string, string>();
    selectedProgram.data.subjects.forEach((subject) => {
      subject.units.forEach((unit) => {
        unit.subUnits.forEach((subUnit) => {
          map.set(subUnit.id, unit.id);
        });
      });
    });
    return map;
  }, [selectedProgram]);

  const validReadUnits = useMemo(
    () => allUnitIds.filter((unitId) => readUnitSet.has(unitId)).length,
    [allUnitIds, readUnitSet]
  );

  const validCompletedSubUnits = useMemo(
    () => allSubUnitIds.filter((subUnitId) => completedSubUnitSet.has(subUnitId)).length,
    [allSubUnitIds, completedSubUnitSet]
  );

  const fullyCompletedUnitCount = useMemo(() => {
    return selectedProgram.data.subjects.flatMap((subject) => subject.units).filter((unit) =>
      unit.subUnits.length > 0 && unit.subUnits.every((subUnit) => completedSubUnitSet.has(subUnit.id))
    ).length;
  }, [selectedProgram, completedSubUnitSet]);

  const overallPercent = allSubUnitIds.length > 0
    ? Math.round((validCompletedSubUnits / allSubUnitIds.length) * 100)
    : (allUnitIds.length > 0 ? Math.round((validReadUnits / allUnitIds.length) * 100) : 0);

  const saveProgressForProgram = (programId: CurriculumProgramId, nextEntry: CurriculumProgressMap[CurriculumProgramId]) => {
    setProgressMap((prev) => {
      const normalized: CurriculumProgressMap = {
        ...prev,
        [programId]: {
          ...nextEntry,
          readUnitIds: dedupe(nextEntry.readUnitIds),
          completedSubUnitIds: dedupe(nextEntry.completedSubUnitIds),
          updatedAt: new Date().toISOString(),
        },
      };
      saveCurriculumProgress(normalized);
      return normalized;
    });
  };

  const toggleUnitRead = (unitId: string) => {
    haptic.light();
    const subUnitIds = unitSubUnitMap.get(unitId) || [];
    const willRead = !readUnitSet.has(unitId);
    const nextReadUnitIds = willRead
      ? [...selectedProgress.readUnitIds, unitId]
      : selectedProgress.readUnitIds.filter((id) => id !== unitId);
    const nextSubUnitIds = willRead
      ? [...selectedProgress.completedSubUnitIds, ...subUnitIds]
      : selectedProgress.completedSubUnitIds.filter((id) => !subUnitIds.includes(id));

    saveProgressForProgram(selectedProgram.id, {
      ...selectedProgress,
      readUnitIds: nextReadUnitIds,
      completedSubUnitIds: nextSubUnitIds,
    });
  };

  const toggleSubUnit = (subUnitId: string) => {
    haptic.light();
    const unitId = subUnitToUnitMap.get(subUnitId);
    if (!unitId) return;

    const nextSubUnitIds = completedSubUnitSet.has(subUnitId)
      ? selectedProgress.completedSubUnitIds.filter((id) => id !== subUnitId)
      : [...selectedProgress.completedSubUnitIds, subUnitId];
    const nextSubUnitSet = new Set(nextSubUnitIds);
    const unitSubUnits = unitSubUnitMap.get(unitId) || [];
    const unitFullyDone = unitSubUnits.length > 0 && unitSubUnits.every((id) => nextSubUnitSet.has(id));
    const nextReadUnitIds = unitFullyDone
      ? [...selectedProgress.readUnitIds, unitId]
      : selectedProgress.readUnitIds.filter((id) => id !== unitId);

    saveProgressForProgram(selectedProgram.id, {
      ...selectedProgress,
      readUnitIds: nextReadUnitIds,
      completedSubUnitIds: nextSubUnitIds,
    });
  };

  const toggleSubjectExpanded = (subjectId: string) => {
    haptic.light();
    setExpandedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const selectProgram = (programId: CurriculumProgramId) => {
    haptic.light();
    setSelectedProgramId(programId);
    setSearch('');
    setSubjectFilter('ALL');
    setExpandedSubjects([]);
    setExpandedUnits([]);
  };

  const matchesFilter = (progress: number, done: number, total: number) => {
    if (subjectFilter === 'ALL') return true;
    if (subjectFilter === 'COMPLETED') return total > 0 && done === total;
    if (subjectFilter === 'PENDING') return progress === 0;
    return progress > 0 && !(total > 0 && done === total);
  };

  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return selectedProgram.data.subjects.filter((subject) => {
      const subjectUnitIds = subject.units.map((unit) => unit.id);
      const subjectSubUnitIds = subject.units.flatMap((unit) => unit.subUnits.map((subUnit) => subUnit.id));
      const subjectReadUnits = subjectUnitIds.filter((id) => readUnitSet.has(id)).length;
      const subjectSubUnitsDone = subjectSubUnitIds.filter((id) => completedSubUnitSet.has(id)).length;
      const subjectPercent = subjectSubUnitIds.length > 0
        ? Math.round((subjectSubUnitsDone / subjectSubUnitIds.length) * 100)
        : (subjectUnitIds.length > 0 ? Math.round((subjectReadUnits / subjectUnitIds.length) * 100) : 0);

      const passesProgress = matchesFilter(subjectPercent, subjectSubUnitsDone, subjectSubUnitIds.length);
      if (!passesProgress) return false;
      if (!query) return true;

      const inSubject = subject.name.toLowerCase().includes(query);
      const inUnits = subject.units.some((unit) => unit.title.toLowerCase().includes(query));
      const inSubUnits = subject.units.some((unit) =>
        unit.subUnits.some((subUnit) => subUnit.text.toLowerCase().includes(query))
      );
      return inSubject || inUnits || inSubUnits;
    });
  }, [search, selectedProgram, readUnitSet, completedSubUnitSet, subjectFilter]);

  const toggleUnitExpanded = (unitId: string) => {
    haptic.light();
    setExpandedUnits((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    );
  };

  const updatedText = selectedProgress.updatedAt
    ? new Date(selectedProgress.updatedAt).toLocaleString()
    : 'Not updated yet';

  return (
    <section className="px-4 pt-6 pb-28 space-y-5 text-zinc-900 dark:text-zinc-100">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Curriculum Tracker</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Faster syllabus tracking by class, unit, and subunit.
        </p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {PROGRAMS.map((program) => {
          const selected = selectedProgram.id === program.id;
          return (
            <button
              key={program.id}
              onClick={() => selectProgram(program.id)}
              className={`min-w-[88px] rounded-xl px-2.5 py-1.5 border text-center transition-all shrink-0 ${selected
                ? 'bg-primary-600 text-white border-primary-500'
                : 'bg-white dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                }`}
            >
              <p className="font-bold text-xs leading-none">{program.shortTitle}</p>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <div className="flex-1 min-w-0 rounded-xl p-2 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800">
          <p className="text-[9px] uppercase font-bold text-zinc-500 truncate">Units Read</p>
          <p className="text-sm font-bold truncate">{validReadUnits}/{allUnitIds.length}</p>
        </div>
        <div className="flex-1 min-w-0 rounded-xl p-2 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800">
          <p className="text-[9px] uppercase font-bold text-zinc-500 truncate">Subunits</p>
          <p className="text-sm font-bold truncate">{validCompletedSubUnits}/{allSubUnitIds.length}</p>
        </div>
        <div className="flex-1 min-w-0 rounded-xl p-2 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800">
          <p className="text-[9px] uppercase font-bold text-zinc-500 truncate">Done Units</p>
          <p className="text-sm font-bold truncate">{fullyCompletedUnitCount}</p>
        </div>
        <div className="flex-1 min-w-0 rounded-xl p-2 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800">
          <p className="text-[9px] uppercase font-bold text-zinc-500 truncate">Overall</p>
          <p className="text-sm font-bold truncate">{overallPercent}%</p>
        </div>
      </div>

      <div className="rounded-2xl p-3 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Last update: {updatedText}
        </p>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject, unit, or topic..."
            className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 outline-none focus:border-primary-500 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const active = subjectFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => {
                  haptic.light();
                  setSubjectFilter(filter.id);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${active
                  ? 'bg-primary-600 text-white border-primary-500'
                  : 'bg-white dark:bg-zinc-900/70 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                  }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {filteredSubjects.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 text-sm text-zinc-500 dark:text-zinc-400">
            No matching subjects. Try a different search or filter.
          </div>
        )}

        {filteredSubjects.map((subject) => {
          const isExpanded = expandedSubjects.includes(subject.id);
          const subjectUnitIds = subject.units.map((unit) => unit.id);
          const subjectSubUnitIds = subject.units.flatMap((unit) => unit.subUnits.map((subUnit) => subUnit.id));
          const subjectReadUnits = subjectUnitIds.filter((id) => readUnitSet.has(id)).length;
          const subjectSubUnitsDone = subjectSubUnitIds.filter((id) => completedSubUnitSet.has(id)).length;
          const subjectPercent = subjectSubUnitIds.length > 0
            ? Math.round((subjectSubUnitsDone / subjectSubUnitIds.length) * 100)
            : (subjectUnitIds.length > 0 ? Math.round((subjectReadUnits / subjectUnitIds.length) * 100) : 0);

          return (
            <div key={subject.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 overflow-hidden">
              <button
                onClick={() => toggleSubjectExpanded(subject.id)}
                className="w-full px-3 py-3 text-left flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{subject.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {subjectReadUnits}/{subjectUnitIds.length} units read | {subjectSubUnitsDone}/{subjectSubUnitIds.length} subunits done
                  </p>
                </div>
                <div className="text-xs font-bold text-primary-500 shrink-0">{subjectPercent}%</div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-2 border-t border-zinc-100 dark:border-zinc-800/70">
                  {subject.units.map((unit) => {
                    const doneSubCount = unit.subUnits.filter((subUnit) => completedSubUnitSet.has(subUnit.id)).length;
                    const allSubDone = unit.subUnits.length > 0 && doneSubCount === unit.subUnits.length;
                    const isUnitExpanded = expandedUnits.includes(unit.id);

                    return (
                      <div key={unit.id} className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 ${isUnitExpanded ? 'p-3 space-y-2' : 'px-3 py-2'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => toggleUnitRead(unit.id)}
                            className={`min-w-0 flex-1 text-left rounded-lg px-2 py-1.5 border transition-colors ${readUnitSet.has(unit.id)
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200'
                              }`}
                          >
                            <p className="text-xs font-bold truncate">Unit {unit.unitNumber}: {unit.title}</p>
                            <p className="text-[11px] opacity-80">
                              {doneSubCount}/{unit.subUnits.length} subunits
                            </p>
                          </button>
                          {allSubDone && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                          <button
                            onClick={() => toggleUnitExpanded(unit.id)}
                            className="shrink-0 rounded-lg px-2 py-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300"
                            title={isUnitExpanded ? 'Hide subunits' : 'Show subunits'}
                          >
                            {isUnitExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>

                        {isUnitExpanded && (
                          <div className="space-y-1.5">
                            {unit.subUnits.map((subUnit) => {
                              const checked = completedSubUnitSet.has(subUnit.id);
                              return (
                                <label key={subUnit.id} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleSubUnit(subUnit.id)}
                                    className="mt-0.5 accent-primary-500"
                                  />
                                  <span>
                                    {subUnit.label ? `${subUnit.label}. ` : ''}
                                    {subUnit.text}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl p-3 bg-zinc-900 text-zinc-200 border border-zinc-800 flex items-start gap-2">
        <ScrollText size={16} className="mt-0.5 text-primary-400" />
        <p className="text-xs leading-relaxed">
          Quick flow: tap a unit card to mark it read, then open it and tick subunits as you finish them.
        </p>
      </div>
    </section>
  );
};
