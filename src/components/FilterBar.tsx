import React, { useState, useRef, useEffect } from 'react';
import { FilterState } from '../types';
import { Filter, Search, X, Check, ChevronDown, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableMentors: string[];
  availableBatches: string[];
  availableSections: string[];
  availableStreams: string[];
  availableGrades: string[];
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  availableMentors,
  availableBatches,
  availableSections,
  availableStreams,
  availableGrades,
  totalResults,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Close dropdown on outside click
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleArrayFilter = (category: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const current = (prev[category] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const clearCategory = (category: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [category]: [] }));
  };

  const resetAllFilters = () => {
    setFilters({
      mentors: [],
      batches: [],
      sections: [],
      streams: [],
      grades: [],
      searchQuery: '',
    });
  };

  const activeFilterCount =
    filters.mentors.length +
    filters.batches.length +
    filters.sections.length +
    filters.streams.length +
    filters.grades.length +
    (filters.searchQuery ? 1 : 0);

  const renderDropdown = (
    label: string,
    category: keyof FilterState,
    options: string[]
  ) => {
    const selected = (filters[category] as string[]) || [];
    const isOpen = openDropdown === category;
    const deduplicatedOptions = Array.from(
      new Set(options.map((opt) => (opt ? opt.trim() : '')))
    )
      .filter(Boolean)
      .sort();

    return (
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(isOpen ? null : category)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            selected.length > 0
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>{label}</span>
          {selected.length > 0 ? (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
              {selected.length}
            </span>
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 text-slate-500 font-medium text-[11px]">
              <span>Select {label}</span>
              {selected.length > 0 && (
                <button
                  onClick={() => clearCategory(category)}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  Clear ({selected.length})
                </button>
              )}
            </div>

            <div className="max-h-52 overflow-y-auto py-1">
              {deduplicatedOptions.length === 0 ? (
                <p className="px-3 py-2 text-slate-400 text-center italic">No options available</p>
              ) : (
                deduplicatedOptions.map((opt) => {
                  const isChecked = selected.includes(opt);
                  return (
                    <label
                      key={opt}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleArrayFilter(category, opt);
                      }}
                      className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer select-none space-x-2 text-slate-700"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="font-medium text-slate-800">{opt}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, mentor, or batch..."
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            className="w-full pl-9.5 pr-8 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200/80 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Checkbox Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {renderDropdown('Mentor', 'mentors', availableMentors)}
          {renderDropdown('Batch', 'batches', availableBatches)}
          {renderDropdown('Section', 'sections', availableSections)}
          {renderDropdown('Stream', 'streams', availableStreams)}
          {renderDropdown('Grade', 'grades', availableGrades)}

          {activeFilterCount > 0 && (
            <button
              onClick={resetAllFilters}
              className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Reset Filters ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Badges Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium mr-1 text-[11px]">Filtered By:</span>

          {filters.mentors.map((m) => (
            <span
              key={m}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px]"
            >
              Mentor: {m}
              <X
                onClick={() => toggleArrayFilter('mentors', m)}
                className="w-3 h-3 ml-1 cursor-pointer hover:text-indigo-900"
              />
            </span>
          ))}

          {filters.batches.map((b) => (
            <span
              key={b}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]"
            >
              Batch: {b}
              <X
                onClick={() => toggleArrayFilter('batches', b)}
                className="w-3 h-3 ml-1 cursor-pointer hover:text-emerald-900"
              />
            </span>
          ))}

          {filters.sections.map((s) => (
            <span
              key={s}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px]"
            >
              Sec: {s}
              <X
                onClick={() => toggleArrayFilter('sections', s)}
                className="w-3 h-3 ml-1 cursor-pointer hover:text-purple-900"
              />
            </span>
          ))}

          {filters.streams.map((st) => (
            <span
              key={st}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px]"
            >
              Stream: {st}
              <X
                onClick={() => toggleArrayFilter('streams', st)}
                className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-900"
              />
            </span>
          ))}

          {filters.grades.map((g) => (
            <span
              key={g}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px]"
            >
              Grade {g}
              <X
                onClick={() => toggleArrayFilter('grades', g)}
                className="w-3 h-3 ml-1 cursor-pointer hover:text-amber-900"
              />
            </span>
          ))}

          <span className="ml-auto text-slate-500 font-medium text-[11px]">
            Showing <strong className="text-slate-800">{totalResults}</strong> records
          </span>
        </div>
      )}
    </div>
  );
};
