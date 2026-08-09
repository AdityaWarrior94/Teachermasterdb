import React, { useState, useMemo } from 'react';
import {
  Columns,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  ArrowUpDown,
  Check,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (item: T) => string | number;
  stickyLeft?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  hideByDefault?: boolean;
}

export interface EnhancedTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T, index: number) => string;
  title?: string;
  searchPlaceholder?: string;
  onExportCSV?: () => void;
  defaultPageSize?: number;
  emptyMessage?: string;
  className?: string;
}

export function EnhancedTable<T>({
  data,
  columns,
  keyExtractor,
  title,
  searchPlaceholder = 'Search table data...',
  onExportCSV,
  defaultPageSize = 25,
  emptyMessage = 'No matching records found.',
  className = '',
}: EnhancedTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => {
    const hidden = new Set<string>();
    columns.forEach((c) => {
      if (c.hideByDefault) hidden.add(c.key);
    });
    return hidden;
  });
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  // Toggle Column Visibility
  const toggleColumnVisibility = (key: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        // Must keep at least 1 column visible
        if (columns.length - next.size > 1) {
          next.add(key);
        }
      }
      return next;
    });
  };

  const visibleColumns = useMemo(() => {
    return columns.filter((c) => !hiddenColumns.has(c.key));
  }, [columns, hiddenColumns]);

  // Search Filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();
    return data.filter((item) => {
      return columns.some((col) => {
        const val = col.sortValue ? col.sortValue(item) : col.accessor(item);
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [data, searchQuery, columns]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA: any = col.sortValue ? col.sortValue(a) : col.accessor(a);
      let valB: any = col.sortValue ? col.sortValue(b) : col.accessor(b);

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [filteredData, sortKey, sortAsc, columns]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false); // default desc for numeric
    }
  };

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = pageSize === -1 ? 1 : Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    if (pageSize === -1) return sortedData;
    const start = (safePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safePage, pageSize]);

  const startRecord = pageSize === -1 ? (totalItems > 0 ? 1 : 0) : Math.min((safePage - 1) * pageSize + 1, totalItems);
  const endRecord = pageSize === -1 ? totalItems : Math.min(safePage * pageSize, totalItems);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Table Action Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 p-3 rounded-xl border border-slate-200/80">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          {/* Column Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Toggle Visible Columns"
            >
              <Columns className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              <span>Columns ({visibleColumns.length}/{columns.length})</span>
            </button>

            {showColumnPicker && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-3 text-xs space-y-2 animate-fadeIn max-h-72 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800">Customize Columns</span>
                  <button
                    onClick={() => setShowColumnPicker(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {columns.map((col) => {
                  const isVis = !hiddenColumns.has(col.key);
                  return (
                    <label
                      key={col.key}
                      className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer font-medium text-slate-700 select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isVis}
                        onChange={() => toggleColumnVisibility(col.key)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="truncate">{col.header}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export CSV Button */}
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="inline-flex items-center px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              CSV
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container with Sticky Headers & Sticky First Column */}
      <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs bg-white relative max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-20 bg-slate-100/95 backdrop-blur-md border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              {visibleColumns.map((col, idx) => {
                const isStickyFirst = idx === 0 || col.stickyLeft;
                const alignClass = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left';

                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`py-3 px-3 sm:px-4 ${alignClass} ${
                      isStickyFirst ? 'sticky left-0 z-30 bg-slate-100 shadow-xs' : ''
                    }`}
                  >
                    {col.sortable !== false ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="inline-flex items-center space-x-1 font-bold text-slate-700 hover:text-indigo-600 cursor-pointer focus:outline-none"
                      >
                        <span>{col.header}</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 hover:text-indigo-600 shrink-0" />
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {paginatedData.map((item, rowIdx) => (
              <tr key={keyExtractor(item, rowIdx)} className="hover:bg-indigo-50/30 transition-colors">
                {visibleColumns.map((col, colIdx) => {
                  const isStickyFirst = colIdx === 0 || col.stickyLeft;
                  const alignClass = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left';

                  return (
                    <td
                      key={col.key}
                      className={`py-3 px-3 sm:px-4 ${alignClass} ${
                        isStickyFirst ? 'sticky left-0 z-10 bg-white shadow-2xs font-bold text-slate-900' : ''
                      }`}
                    >
                      {col.accessor(item)}
                    </td>
                  );
                })}
              </tr>
            ))}

            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={visibleColumns.length} className="py-12 text-center text-slate-400 font-medium">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 px-1 text-xs text-slate-500">
        <div className="flex items-center space-x-3">
          <span>
            Showing <strong>{startRecord}</strong> to <strong>{endRecord}</strong> of{' '}
            <strong>{totalItems}</strong> entries
          </span>

          {/* Items per page selector */}
          <div className="flex items-center space-x-1.5 ml-2">
            <span className="text-[11px] text-slate-400 font-medium">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>All</option>
            </select>
          </div>
        </div>

        {/* Page Navigation Buttons */}
        {pageSize !== -1 && totalPages > 1 && (
          <div className="flex items-center space-x-1.5 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:hover:bg-white cursor-pointer font-semibold transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Prev
            </button>

            <span className="px-2 font-bold text-slate-700">
              Page {safePage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="inline-flex items-center px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:hover:bg-white cursor-pointer font-semibold transition-all"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
