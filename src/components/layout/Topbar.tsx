import { Search, LogOut, Sparkles } from "lucide-react";
import { roleLabels } from "@/data/mockData";
import { useProfile } from "@/context/ProfileContext";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookings } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface QuickResult {
  id: string;
  title: string;
  subtitle: string;
  to: string;
  tag: "Fair" | "Booking";
}

export function Topbar() {
  const navigate = useNavigate();
  const { activeUser, availableFairs, logout } = useProfile();
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const quickResults = useMemo<QuickResult[]>(() => {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) return [];

    const allowedFairIds = new Set(availableFairs.map(fair => fair.id));

    const fairResults: QuickResult[] = availableFairs
      .filter(fair =>
        fair.name.toLowerCase().includes(searchTerm) ||
        fair.edition.toLowerCase().includes(searchTerm) ||
        fair.venueName.toLowerCase().includes(searchTerm)
      )
      .slice(0, 4)
      .map(fair => ({
        id: `fair-${fair.id}`,
        title: `${fair.name} ${fair.edition}`,
        subtitle: fair.venueName,
        to: `/fairs/${fair.id}`,
        tag: "Fair",
      }));

    const reservationResults: QuickResult[] = bookings
      .filter(reservation => allowedFairIds.has(reservation.fairId))
      .filter(reservation =>
        reservation.standCode.toLowerCase().includes(searchTerm) ||
        reservation.company.toLowerCase().includes(searchTerm) ||
        reservation.fairName.toLowerCase().includes(searchTerm)
      )
      .slice(0, 4)
      .map(reservation => ({
        id: `reservation-${reservation.id}`,
        title: `${reservation.standCode} · ${reservation.company}`,
        subtitle: reservation.fairName,
        to: `/fairs/${reservation.fairId}/reservations`,
        tag: "Booking",
      }));

    return [...fairResults, ...reservationResults].slice(0, 8);
  }, [availableFairs, query]);

  const openSearchResult = (result: QuickResult) => {
    navigate(result.to);
    setQuery("");
    setIsSearchOpen(false);
  };

  return (
    <header className="shrink-0 border-b border-border bg-card px-4 py-3 md:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-2xl">
          <div className="flex h-12 items-center gap-3 border border-border bg-background px-3 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search fairs, stands or bookings"
                aria-label="Search in the platform"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => {
                  window.setTimeout(() => setIsSearchOpen(false), 120);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsSearchOpen(false);
                  }

                  if (event.key === "Enter" && quickResults.length > 0) {
                    event.preventDefault();
                    openSearchResult(quickResults[0]);
                  }
                }}
                className="h-8 border-none bg-transparent pl-6 pr-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
            <span className="hidden border border-border px-2 py-1 text-[11px] text-muted-foreground md:inline">Enter</span>
          </div>

          {isSearchOpen && query.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden border border-border bg-card shadow-lg">
              <div className="max-h-72 overflow-auto p-1.5">
                {quickResults.length > 0 ? (
                  quickResults.map(result => (
                    <button
                      key={result.id}
                      onMouseDown={() => openSearchResult(result)}
                      className="w-full border border-transparent px-2.5 py-2 text-left transition-colors hover:border-border hover:bg-secondary"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{result.title}</p>
                        <span className={cn(
                          "border px-1.5 py-0.5 text-[10px] font-bold",
                          result.tag === "Fair"
                            ? "border-primary bg-primary-surface text-primary"
                            : "border-warning bg-warning-surface text-warning"
                        )}>
                          {result.tag}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{result.subtitle}</p>
                    </button>
                  ))
                ) : (
                  <p className="px-2.5 py-2 text-xs text-muted-foreground">No results found for your search.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end">
          <div className="flex h-12 items-center gap-2 border border-border bg-background pl-2 pr-2.5 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center border border-primary bg-primary-surface text-xs font-bold text-primary">
              {activeUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="max-w-[150px] truncate text-xs font-bold text-foreground">{activeUser.name}</div>
              <div className="text-[11px] text-muted-foreground">{roleLabels[activeUser.role]}</div>
            </div>
            <button
              onClick={logout}
              aria-label="Sign out"
              title="Sign out"
              className="ml-1 flex h-8 items-center gap-1 border border-border px-2 text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
