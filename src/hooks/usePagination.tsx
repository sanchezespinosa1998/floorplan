import { useState, useMemo } from 'react';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface UsePaginationOptions<T> {
  items: T[];
  itemsPerPage?: number;
}

interface UsePaginationReturn<T> {
  paginatedItems: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setItemsPerPage: (n: number) => void;
  PaginationComponent: React.FC;
}

export function usePagination<T>({ items, itemsPerPage: initialPageSize = 10 }: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setPageSize] = useState(initialPageSize);

  const sizeOptions = useMemo(
    () => PAGE_SIZE_OPTIONS.includes(initialPageSize)
      ? PAGE_SIZE_OPTIONS
      : [...PAGE_SIZE_OPTIONS, initialPageSize].sort((a, b) => a - b),
    [initialPageSize],
  );

  const setItemsPerPage = (n: number) => {
    setPageSize(n);
    setCurrentPage(1);
  };

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => { if (hasNextPage) setCurrentPage(p => p + 1); };
  const prevPage = () => { if (hasPrevPage) setCurrentPage(p => p - 1); };

  const PaginationComponent: React.FC = () => {
    const showNav = totalPages > 1;

    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...'); pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1); pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1); pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...'); pages.push(totalPages);
      }
      return pages;
    };

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
        {/* Left: items-per-page selector */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="whitespace-nowrap">Filas por página</span>
          <select
            value={itemsPerPage}
            onChange={e => setItemsPerPage(Number(e.target.value))}
            className="px-2 py-1.5 rounded-md border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {sizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Center: count info */}
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {totalItems === 0 ? '0 elementos' : `${startItem}–${endItem} de ${totalItems}`}
        </span>

        {/* Right: page navigation */}
        {showNav && (
          <div className="flex items-center gap-1">
            <button
              onClick={prevPage}
              disabled={!hasPrevPage}
              className="px-3 py-1.5 text-sm rounded-md border border-border bg-card text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            {getPageNumbers().map((page, index) => (
              typeof page === 'number' ? (
                <button
                  key={index}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    page === currentPage
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span key={index} className="px-2 text-muted-foreground">...</span>
              )
            ))}
            <button
              onClick={nextPage}
              disabled={!hasNextPage}
              className="px-3 py-1.5 text-sm rounded-md border border-border bg-card text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    );
  };

  return {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage,
    PaginationComponent,
  };
}