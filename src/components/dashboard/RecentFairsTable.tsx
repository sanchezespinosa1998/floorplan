import {
  Search, ChevronLeft, ChevronRight, LayoutGrid, List, Plus,
  ChevronUp, ChevronDown, ChevronsUpDown, SlidersHorizontal, X,
} from "lucide-react";
import { useState, useMemo, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useTableSort } from "@/hooks/useTableSort";
import { useColumnFilters } from "@/hooks/useColumnFilters";
import { usePagination } from "@/hooks/usePagination";

export interface RecentTableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  sortResolver?: (item: T) => string | number | null | undefined;
  filterable?: boolean;
  filterMode?: "text" | "enum";
  filterResolver?: (item: T) => string | number | null | undefined;
  enumOptions?: string[];
}

interface RecentFairsTableProps<T extends { id: string }> {
  title: string;
  headerContent?: ReactNode;
  initialViewMode?: "list" | "cards";
  onCreateRow?: () => void;
  createRowLabel?: string;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  recentFairsSearch: string;
  onRecentFairsSearchChange: (value: string) => void;
  items: T[];
  columns: RecentTableColumn<T>[];
  emptyMessage: string;
  initialItemsPerPage?: number;
  pageSizeOptions?: number[];
}

export function RecentFairsTable<T extends { id: string }>({
  title,
  headerContent,
  initialViewMode = "list",
  onCreateRow,
  createRowLabel = "Añadir fila",
  searchPlaceholder = "Search",
  searchAriaLabel = "Buscar elementos recientes",
  recentFairsSearch,
  onRecentFairsSearchChange,
  items,
  columns,
  emptyMessage,
  initialItemsPerPage = 5,
  pageSizeOptions = [5, 10, 25, 50, 100],
}: RecentFairsTableProps<T>) {
  const [viewMode, setViewMode] = useState<"list" | "cards">(initialViewMode);
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  const { filters, setFilter, clearFilter, clearAll, activeCount, applyFilters } = useColumnFilters<T>();

  const filterResolvers = useMemo(() => {
    const r: Record<string, (item: T) => string | number | null | undefined> = {};
    for (const col of columns) {
      if (col.filterable && col.filterResolver) r[col.key] = col.filterResolver;
    }
    return r;
  }, [columns]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columnFilteredItems = useMemo(() => applyFilters(items, filterResolvers), [items, filters, filterResolvers]);

  const sortResolver = useCallback(
    (item: T, key: string) => {
      const col = columns.find((c) => c.key === key);
      if (!col) return null;
      if (col.sortResolver) return col.sortResolver(item);
      if (col.filterResolver) return col.filterResolver(item);
      return null;
    },
    [columns],
  );

  const { sortedItems, sortKey, sortDir, handleSort } = useTableSort(columnFilteredItems, sortResolver);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage,
  } = usePagination({ items: sortedItems, itemsPerPage: initialItemsPerPage });

  // Keep goToPage ref stable for the reset effect below
  const goToPageRef = useRef(goToPage);
  goToPageRef.current = goToPage;

  // Reset to page 1 whenever the sorted+filtered dataset changes
  useEffect(() => {
    goToPageRef.current(1);
  }, [sortedItems]);

  // Trigger animation on data change
  useEffect(() => {
    setIsAnimating(true);
  }, [paginatedItems.length, currentPage]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const visiblePageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <section className="mb-5 flex h-full flex-col overflow-hidden rounded-[8.19px] border border-[#333333] bg-transparent shadow-[0_4px_7.525px_rgba(0,0,0,0.75)]">

      {/* Header */}
      <div 
        className="flex flex-col gap-4 border-b border-[#333333] px-4 py-4"
      >
        <div className="flex items-center justify-between gap-[10.24px]">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h2 className="text-[16px] font-bold text-[#dadada]">{title}</h2>
            {headerContent ? <div className="min-w-0 flex-1">{headerContent}</div> : null}
          </div>

          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1 rounded-[6.55px] border border-[#333333] bg-[#1a1a1a] px-2 py-1 text-[10.5px] font-medium text-[#9a9a9a] transition-colors hover:text-[#fafafa]"
              >
                <X className="h-3 w-3" />
                Limpiar filtros ({activeCount})
              </button>
            )}

            {onCreateRow && (
              <button
                type="button"
                onClick={onCreateRow}
                className="ui-hover-accent ui-interactive-base inline-flex h-[31px] items-center justify-center gap-1 rounded-[8.19px] border border-[#2f4310] bg-[#2f4310] px-3 text-[12.8px] font-semibold text-[#8fee00]"
              >
                <Plus className="h-4 w-4" />
                {createRowLabel}
              </button>
            )}

            <div className="flex items-center overflow-hidden rounded-[8.19px] border border-[#333333]">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={viewMode === "list"
                  ? "inline-flex h-[31px] w-[40px] items-center justify-center bg-[#8fee00] text-[#0a0a0a]"
                  : "ui-hover-surface ui-interactive-base inline-flex h-[31px] w-[40px] items-center justify-center bg-[#141414] text-[#fafafa]"
                }
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                aria-label="Card view"
                className={viewMode === "cards"
                  ? "inline-flex h-[31px] w-[40px] items-center justify-center bg-[#8fee00] text-[#0a0a0a]"
                  : "ui-hover-surface ui-interactive-base inline-flex h-[31px] w-[40px] items-center justify-center bg-[#141414] text-[#fafafa]"
                }
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global search */}
      <div className="border-b border-[#333333] bg-[#141414] px-[25px] py-[10.24px]">
        <label className="flex items-center gap-[8.19px] text-[12.8px] font-extralight text-[#dadada]">
          <Search className="h-[10px] w-[10px]" />
          <input
            type="text"
            value={recentFairsSearch}
            onChange={(event) => onRecentFairsSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchAriaLabel}
            className="w-full bg-transparent text-[12.8px] font-extralight text-[#dadada] outline-none placeholder:text-[#dadada]"
          />
        </label>
      </div>

      {/* Overlay to close open filter dropdowns */}
      {openFilterKey && (
        <div className="fixed inset-0 z-40" onMouseDown={() => setOpenFilterKey(null)} />
      )}

      {viewMode === "list" ? (
        <div className="min-h-0 flex-1 overflow-x-auto bg-[#141414]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="w-[50px] py-[10.24px] pl-[25px]" />
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-[25px] py-[10.24px] text-left text-[10.5px] font-bold uppercase tracking-[1.1px] text-[#9a9a9a]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{column.label}</span>

                      {column.sortable && (
                        <button
                          type="button"
                          onClick={() => handleSort(column.key)}
                          title={`Sort by ${column.label}`}
                          className={`inline-flex items-center justify-center rounded p-0.5 transition-colors ${
                            sortKey === column.key
                              ? "text-[var(--db-accent)]"
                              : "text-[#444444] hover:text-[#9a9a9a]"
                          }`}
                        >
                          {sortKey === column.key
                            ? sortDir === "asc"
                              ? <ChevronUp className="h-3 w-3" />
                              : <ChevronDown className="h-3 w-3" />
                            : <ChevronsUpDown className="h-3 w-3" />
                          }
                        </button>
                      )}

                      {column.filterable && (
                        <div className="relative">
                          <button
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenFilterKey(openFilterKey === column.key ? null : column.key);
                            }}
                            title={`Filter by ${column.label}`}
                            className={`inline-flex items-center justify-center rounded p-0.5 transition-colors ${
                              filters[column.key]?.values.length
                                ? "text-[var(--db-accent)]"
                                : "text-[#444444] hover:text-[#9a9a9a]"
                            }`}
                          >
                            <SlidersHorizontal className="h-3 w-3" />
                          </button>

                          {openFilterKey === column.key && (
                            <div
                              className="absolute left-0 top-full z-50 mt-1 min-w-[170px] rounded-[6.55px] border border-[#333333] bg-[#0f0f0f] p-2.5 shadow-xl"
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <span className="mb-2 block text-[9px] font-bold uppercase tracking-[1.3px] text-[#555555]">
                                {column.label}
                              </span>

                              {column.filterMode === "enum" ? (
                                <div className="flex flex-col gap-0.5">
                                  {column.enumOptions?.map((option) => {
                                    const active = filters[column.key]?.values ?? [];
                                    const checked = active.includes(option);
                                    return (
                                      <label
                                        key={option}
                                        className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-[11px] text-[#dadada] hover:bg-[#1a1a1a]"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={(e) => {
                                            const next = e.target.checked
                                              ? [...active, option]
                                              : active.filter((v) => v !== option);
                                            if (next.length === 0) clearFilter(column.key);
                                            else setFilter(column.key, { mode: "enum", values: next });
                                          }}
                                          className="h-3 w-3 accent-[#8fee00]"
                                        />
                                        {option}
                                      </label>
                                    );
                                  })}
                                  {(filters[column.key]?.values.length ?? 0) > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => clearFilter(column.key)}
                                      className="mt-1.5 text-left text-[10px] text-[#555555] hover:text-[#9a9a9a]"
                                    >
                                      Limpiar
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 rounded-[4px] border border-[#333333] bg-[#141414] px-2">
                                  <Search className="h-[9px] w-[9px] shrink-0 text-[#555555]" />
                                  <input
                                    type="text"
                                    // eslint-disable-next-line jsx-a11y/no-autofocus
                                    autoFocus
                                    value={filters[column.key]?.values[0] ?? ""}
                                    onChange={(e) => {
                                      if (!e.target.value) clearFilter(column.key);
                                      else setFilter(column.key, { mode: "text", values: [e.target.value] });
                                    }}
                                    placeholder="Filtrar…"
                                    className="h-[26px] w-full bg-transparent text-[11px] text-[#dadada] outline-none placeholder:text-[#444444]"
                                  />
                                  {(filters[column.key]?.values[0]?.length ?? 0) > 0 && (
                                    <button type="button" onClick={() => clearFilter(column.key)}>
                                      <X className="h-[9px] w-[9px] text-[#555555] hover:text-[#9a9a9a]" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className="group ui-row-hover border-b border-[#2a2a2a] bg-[#141414] animate-table-row"
                  style={isAnimating ? { animationDelay: `${rowIndex * 45}ms` } : undefined}
                >
                  <td className="py-[11px] pl-[25px] align-middle">
                    <span
                      className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: "var(--db-accent)", color: "var(--db-accent-contrast)" }}
                    >
                      {startItem + rowIndex}
                    </span>
                  </td>
                  {columns.map((column, index) => (
                    <td
                      key={column.key}
                      className={index === 0
                        ? "px-[25px] py-[11px] align-middle text-[12.8px] font-medium text-[#fafafa] transition-colors group-hover:text-[#fafafa]"
                        : "px-[25px] py-[11px] align-middle text-[12.8px] font-light text-[#dadada] transition-colors group-hover:text-[#fafafa]"
                      }
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}

              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-[25px] py-8 text-center text-[12.8px] font-light text-[#dadada]">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#141414] p-4">
          {paginatedItems.length === 0 ? (
            <div className="py-10 text-center text-[12.8px] font-light text-[#dadada]">{emptyMessage}</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedItems.map((row, rowIndex) => (
                <article
                  key={row.id}
                  className="ui-hover-lift ui-theme-card relative flex min-h-[250px] flex-col rounded-[8.19px] border border-[#333333] p-4 animate-card"
                  style={isAnimating ? { animationDelay: `${rowIndex * 60}ms` } : undefined}
                >
                  <span
                    className="absolute right-3 top-3 inline-flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: "var(--db-accent)", color: "var(--db-accent-contrast)" }}
                  >
                    {startItem + rowIndex}
                  </span>

                  {columns[0] && (
                    <div className="rounded-[6.55px] border border-[#2a2a2a] bg-[#111111] px-3 py-2.5">
                      <span className="text-[10.24px] font-semibold uppercase tracking-[1.1px] text-[#9a9a9a]">
                        {columns[0].label}
                      </span>
                      <div className="mt-1 text-[13px] font-semibold text-[#f2f2f2]">{columns[0].render(row)}</div>
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {columns.slice(1).map((column, index) => (
                      <div
                        key={column.key}
                        className={index === columns.slice(1).length - 1
                          ? "ui-cell-block rounded-[6.55px] px-2.5 py-2 sm:col-span-2"
                          : "ui-cell-block rounded-[6.55px] px-2.5 py-2"
                        }
                      >
                        <span className="text-[10.24px] font-semibold uppercase tracking-[1.1px] text-[#9a9a9a]">
                          {column.label}
                        </span>
                        <div className="mt-1 text-[12.8px] font-light text-[#dadada]">{column.render(row)}</div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination footer */}
      <div className="mt-auto flex flex-col gap-4 border-t border-[#333333] bg-[#0a0a0a] px-[12.8px] py-[12.8px] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 text-[14px] text-[#fafafa]">
          <span>Rows per page</span>
          <select
            value={itemsPerPage}
            onChange={(event) => setItemsPerPage(Number(event.target.value))}
            className="ui-hover-surface ui-interactive-base h-[29px] rounded-[8.19px] border border-[#333333] bg-transparent px-[12.8px] text-[14px] text-[#fafafa] outline-none"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size} className="bg-[#0a0a0a] text-[#fafafa]">
                {size}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[14px] text-[#fafafa]">
          {totalItems === 0 ? "0 de 0" : `${startItem}–${endItem} de ${totalItems}`}
        </span>

        <div className="flex items-center gap-[3.66px]">
          <button
            type="button"
            onClick={prevPage}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="ui-hover-surface ui-interactive-base inline-flex h-[31px] w-[40px] items-center justify-center rounded-[8.19px] border border-[#333333] bg-[#141414] text-[#fafafa] disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {visiblePageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => goToPage(pageNumber)}
              className={pageNumber === currentPage
                ? "inline-flex h-[31px] min-w-[40px] items-center justify-center rounded-[8.19px] border border-transparent bg-[#8fee00] px-[13px] text-[14px] font-medium text-[#0a0a0a]"
                : "ui-hover-surface ui-interactive-base inline-flex h-[31px] min-w-[40px] items-center justify-center rounded-[8.19px] border border-[#333333] bg-[#141414] px-[13px] text-[14px] font-medium text-[#fafafa]"
              }
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            onClick={nextPage}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="ui-hover-surface ui-interactive-base inline-flex h-[31px] w-[40px] items-center justify-center rounded-[8.19px] border border-[#333333] bg-[#141414] text-[#fafafa] disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
