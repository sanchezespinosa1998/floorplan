import { Search, RotateCcw, CalendarDays } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSelect {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}

interface ListFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  selects?: FilterSelect[];
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  onReset?: () => void;
  className?: string;
  rightSlot?: ReactNode;
}

export function ListFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  searchAriaLabel = "Buscar",
  selects = [],
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onReset,
  className,
  rightSlot,
}: ListFiltersProps) {
  const showDateFilters = typeof onDateFromChange === "function" || typeof onDateToChange === "function";

  return (
    <div className={`flex flex-wrap items-end gap-3 ${className || ""}`.trim()}>
      <div className="relative min-w-[240px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={searchValue}
          onChange={event => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel}
          className="pl-9"
        />
      </div>

      {selects.map((filter, index) => (
        <label key={`${filter.label}-${index}`} className="flex min-w-[180px] flex-col gap-1 text-xs text-muted-foreground">
          {filter.label}
          <select
            value={filter.value}
            onChange={event => filter.onChange(event.target.value)}
            className="h-[39.06px] rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
          >
            {filter.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      {showDateFilters && (
        <>
          <label className="flex min-w-[170px] flex-col gap-1 text-xs text-muted-foreground">
            Desde
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={dateFrom || ""}
                onChange={event => onDateFromChange?.(event.target.value)}
                className="pl-9"
              />
            </div>
          </label>

          <label className="flex min-w-[170px] flex-col gap-1 text-xs text-muted-foreground">
            Hasta
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={dateTo || ""}
                onChange={event => onDateToChange?.(event.target.value)}
                className="pl-9"
              />
            </div>
          </label>
        </>
      )}

      {onReset && (
        <Button type="button" variant="ghost" onClick={onReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Limpiar
        </Button>
      )}

      {rightSlot}
    </div>
  );
}
