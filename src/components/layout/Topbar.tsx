import { Search, LogOut } from "lucide-react";
import { roleLabels } from "@/data/mockData";
import { useProfile } from "@/context/ProfileContext";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reservations } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface QuickResult {
  id: string;
  title: string;
  subtitle: string;
  to: string;
  tag: "Fair" | "Reserva";
}

export function Topbar() {
  const navigate = useNavigate();
  const { activeUser, availableFairs } = useProfile();
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

    const reservationResults: QuickResult[] = reservations
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
        tag: "Reserva",
      }));

    return [...fairResults, ...reservationResults].slice(0, 8);
  }, [availableFairs, query]);

  const handleLogout = () => {
    window.localStorage.removeItem("fairplan-active-user-id");
    window.localStorage.removeItem("fairplan-active-fair-id");
    window.location.reload();
  };

  const openSearchResult = (result: QuickResult) => {
    navigate(result.to);
    setQuery("");
    setIsSearchOpen(false);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-[16px] top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search projects, fairs, stands..."
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
          className="pl-[39.06px]"
        />

        {isSearchOpen && query.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+6.55px)] z-50 overflow-hidden border border-border bg-card">
            <div className="max-h-72 overflow-auto p-[6.55px]">
              {quickResults.length > 0 ? (
                quickResults.map(result => (
                  <button
                    key={result.id}
                    onMouseDown={() => openSearchResult(result)}
                    className="w-full border border-transparent px-[10.24px] py-[8.19px] text-left transition-colors hover:border-border hover:bg-secondary"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[12.8px] font-semibold text-foreground">{result.title}</p>
                      <span className={cn(
                        "border px-[6.55px] py-[3.36px] text-[10.24px] font-bold",
                        result.tag === "Fair"
                          ? "border-primary bg-primary-surface text-primary"
                          : "border-warning bg-warning-surface text-warning"
                      )}>
                        {result.tag}
                      </span>
                    </div>
                    <p className="mt-[5.24px] truncate text-[12.8px] text-muted-foreground">{result.subtitle}</p>
                  </button>
                ))
              ) : (
                <p className="px-[10.24px] py-[8.19px] text-[12.8px] text-muted-foreground">No results found for your search.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-[6.55px]">
        <div className="ml-[6.55px] flex items-center gap-[8.19px] border-l border-border pl-[12.8px]">
          <div className="flex h-[39.06px] w-[39.06px] items-center justify-center border border-primary bg-primary-surface text-[12.8px] font-bold text-primary">
            {activeUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="hidden leading-tight lg:block">
            <div className="text-[12.8px] font-bold text-foreground">{activeUser.name}</div>
            <div className="text-[10.24px] text-muted-foreground">{roleLabels[activeUser.role]}</div>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Salir"
            title="Salir"
            className="flex items-center gap-[6.55px] h-[39.06px] px-[12.8px] border border-border bg-card text-muted-foreground text-[12.8px] transition-colors hover:border-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden lg:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
