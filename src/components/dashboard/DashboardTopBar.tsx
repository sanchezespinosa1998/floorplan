import { Search, LogOut, Compass, ChevronDown, Palette } from "lucide-react";
import { bookings, roleLabels } from "@/data/mockData";
import { useProfile } from "@/context/ProfileContext";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickResult {
  id: string;
  title: string;
  subtitle: string;
  to: string;
  tag: "Fair" | "Booking";
}

export function DashboardTopBar() {
  const navigate = useNavigate();
  const { activeUser, activeFair, availableFairs, setActiveFairId, logout } = useProfile();
  const { themeMode, setThemeMode, themeOptions } = useTheme();
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPlanMenuOpen, setIsPlanMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const closePlanMenuTimerRef = useRef<number | null>(null);
  const closeThemeMenuTimerRef = useRef<number | null>(null);

  const preferredPlanFair = activeFair ?? availableFairs[0] ?? null;

  const quickResults = useMemo<QuickResult[]>(() => {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) return [];

    const allowedFairIds = new Set(availableFairs.map((fair) => fair.id));

    const fairResults: QuickResult[] = availableFairs
      .filter((fair) =>
        fair.name.toLowerCase().includes(searchTerm) ||
        fair.edition.toLowerCase().includes(searchTerm) ||
        fair.venueName.toLowerCase().includes(searchTerm)
      )
      .slice(0, 4)
      .map((fair) => ({
        id: `fair-${fair.id}`,
        title: `${fair.name} ${fair.edition}`,
        subtitle: fair.venueName,
        to: `/fairs/${fair.id}`,
        tag: "Fair",
      }));

    const bookingResults: QuickResult[] = bookings
      .filter((booking) => allowedFairIds.has(booking.fairId))
      .filter((booking) =>
        booking.standCode.toLowerCase().includes(searchTerm) ||
        booking.company.toLowerCase().includes(searchTerm) ||
        booking.fairName.toLowerCase().includes(searchTerm)
      )
      .slice(0, 4)
      .map((booking) => ({
        id: `booking-${booking.id}`,
        title: `${booking.standCode} · ${booking.company}`,
        subtitle: booking.fairName,
        to: `/fairs/${booking.fairId}/bookings`,
        tag: "Booking",
      }));

    return [...fairResults, ...bookingResults].slice(0, 8);
  }, [availableFairs, query]);

  const openSearchResult = (result: QuickResult) => {
    navigate(result.to);
    setQuery("");
    setIsSearchOpen(false);
  };

  useEffect(() => {
    return () => {
      if (closePlanMenuTimerRef.current !== null) {
        window.clearTimeout(closePlanMenuTimerRef.current);
      }

      if (closeThemeMenuTimerRef.current !== null) {
        window.clearTimeout(closeThemeMenuTimerRef.current);
      }
    };
  }, []);

  const openPlanMenu = () => {
    if (closePlanMenuTimerRef.current !== null) {
      window.clearTimeout(closePlanMenuTimerRef.current);
      closePlanMenuTimerRef.current = null;
    }
    setIsPlanMenuOpen(true);
  };

  const closePlanMenu = () => {
    if (closePlanMenuTimerRef.current !== null) {
      window.clearTimeout(closePlanMenuTimerRef.current);
    }
    closePlanMenuTimerRef.current = window.setTimeout(() => {
      setIsPlanMenuOpen(false);
    }, 110);
  };

  const selectPlan = (fairId: string) => {
    setActiveFairId(fairId);
    navigate(`/fairs/${fairId}/plan`);
    setIsPlanMenuOpen(false);
  };

  const openThemeMenu = () => {
    if (closeThemeMenuTimerRef.current !== null) {
      window.clearTimeout(closeThemeMenuTimerRef.current);
      closeThemeMenuTimerRef.current = null;
    }
    setIsThemeMenuOpen(true);
  };

  const closeThemeMenu = () => {
    if (closeThemeMenuTimerRef.current !== null) {
      window.clearTimeout(closeThemeMenuTimerRef.current);
    }
    closeThemeMenuTimerRef.current = window.setTimeout(() => {
      setIsThemeMenuOpen(false);
    }, 110);
  };

  const activeThemeLabel = themeOptions.find((option) => option.id === themeMode)?.label ?? "Theme";
  const activeTheme = themeOptions.find((option) => option.id === themeMode) ?? themeOptions[0];
  const userInitials = activeUser.name
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const activeFairLabel = activeFair ? `${activeFair.name} ${activeFair.edition}` : "Global workspace";

  return (
    <header className="shrink-0 bg-[#0a0a0a]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex shrink-0 items-center gap-2">
          <div className="ui-hover-lift flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#8fee00] bg-[#141414]">
            <div className="h-2 w-2 rounded-full bg-[#8fee00]" />
          </div>
          <p className="text-[20px] font-bold leading-none text-[#fafafa]">logotipo</p>
        </div>
        <div className="ui-hover-outline ui-interactive-base ui-theme-card flex h-[52px] flex-1 items-center gap-3 rounded-[10.24px] border border-[#2f4310] px-3 py-2">
          <div className="ui-hover-lift flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#2f4310] bg-[#141414] text-[12px] font-extrabold text-[#8fee00]">
            {userInitials}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.8px] font-bold uppercase tracking-[0.6px] text-[#fafafa]">
              {activeUser.name}
            </p>
            <p className="truncate text-[10.24px] font-medium text-[#9a9a9a]">
              {activeFairLabel}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex h-7 items-center rounded-[8px] border border-[#2f4310] bg-[#1d260f] px-2.5 text-[10px] font-bold uppercase tracking-[0.8px] text-[#8fee00]">
              {roleLabels[activeUser.role]}
            </span>

            <button
              type="button"
              onClick={logout}
              className="ui-hover-accent ui-interactive-base inline-flex h-7 items-center gap-[5.24px] rounded-[8px] border border-[#2f4310] bg-[#141414] px-3 text-[10.24px] font-semibold text-[#8fee00]"
            >
              <LogOut className="h-[11px] w-[11px]" />
              SALIR
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:flex-1">
          <div className="ui-focus-panel ui-interactive-base relative flex h-[52px] flex-1 items-center gap-[10.24px] rounded-[8.19px] border border-[#2f4310] bg-[#101010] px-4">
            <Search className="h-[10px] w-[10px] shrink-0 text-[#8fee00]" />
            <input
              type="text"
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
              placeholder="Custom Search"
              aria-label="Custom Search"
              className="w-full bg-transparent text-[12.8px] font-extralight text-[#8fee00] outline-none placeholder:text-[#8fee00]"
            />

            {isSearchOpen && query.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[8.19px] border border-[#333333] bg-[#141414] shadow-[0_4px_7.525px_rgba(0,0,0,0.75)]">
                <div className="max-h-72 overflow-auto p-1.5">
                  {quickResults.length > 0 ? (
                    quickResults.map((result) => (
                      <button
                        key={result.id}
                        onMouseDown={() => openSearchResult(result)}
                        className="ui-hover-surface ui-interactive-base w-full rounded-[6.55px] border border-transparent px-2.5 py-2 text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[12.8px] font-semibold text-[#fafafa]">{result.title}</p>
                          <span className={cn(
                            "rounded-[6.55px] border px-1.5 py-0.5 text-[10px] font-bold",
                            result.tag === "Fair"
                              ? "border-[#8fee00] bg-[#2f4310] text-[#8fee00]"
                              : "border-[#f97316] bg-[#22140b] text-[#f97316]"
                          )}>
                            {result.tag}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-[10.24px] text-[#dadada]">{result.subtitle}</p>
                      </button>
                    ))
                  ) : (
                    <p className="px-2.5 py-2 text-[10.24px] text-[#dadada]">No results found for your search.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          

          <div className="flex shrink-0 items-center gap-2">
            <div
              className="relative"
              onMouseEnter={openThemeMenu}
              onMouseLeave={closeThemeMenu}
            >
              <button
                type="button"
                onFocus={openThemeMenu}
                onBlur={closeThemeMenu}
                onClick={() => setIsThemeMenuOpen((prev) => !prev)}
                className="ui-hover-surface ui-interactive-base inline-flex h-[52px] items-center justify-center gap-[6.55px] rounded-[10.24px] border border-[#333333] bg-[#141414] px-[12.8px] text-[12.8px] font-semibold text-[#fafafa]"
              >
                <Palette className="h-4 w-4" />
                <span>{activeThemeLabel}</span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full border border-[#333333]" style={{ backgroundColor: activeTheme.preview.bg }} />
                  <span className="h-2 w-2 rounded-full border border-[#333333]" style={{ backgroundColor: activeTheme.preview.surface }} />
                  <span className="h-2 w-2 rounded-full border border-[#333333]" style={{ backgroundColor: activeTheme.preview.accent }} />
                </span>
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  isThemeMenuOpen && "rotate-180"
                )} />
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[260px] overflow-hidden rounded-[8.19px] border border-[#333333] bg-[#141414] shadow-[0_4px_7.525px_rgba(0,0,0,0.75)]">
                  <div className="max-h-72 overflow-auto p-1.5">
                    {themeOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onMouseDown={() => {
                          setThemeMode(option.id);
                          setIsThemeMenuOpen(false);
                        }}
                        className={cn(
                          "ui-hover-surface ui-interactive-base w-full rounded-[6.55px] border px-2.5 py-2 text-left",
                          themeMode === option.id
                            ? "border-[#8fee00] bg-[#1d260f]"
                            : "border-transparent"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-[12.8px] font-semibold text-[#fafafa]">{option.label}</p>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2.5 w-2.5 rounded-full border border-[#333333]" style={{ backgroundColor: option.preview.bg }} />
                            <span className="h-2.5 w-2.5 rounded-full border border-[#333333]" style={{ backgroundColor: option.preview.surface }} />
                            <span className="h-2.5 w-2.5 rounded-full border border-[#333333]" style={{ backgroundColor: option.preview.accent }} />
                          </span>
                        </div>
                        <p className="mt-1 truncate text-[10.24px] text-[#dadada]">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={openPlanMenu}
              onMouseLeave={closePlanMenu}
            >
              <button
                type="button"
                onFocus={openPlanMenu}
                onBlur={closePlanMenu}
                onClick={() => {
                  if (preferredPlanFair) {
                    selectPlan(preferredPlanFair.id);
                    return;
                  }
                  navigate("/fairs");
                }}
                className="ui-hover-accent ui-interactive-base inline-flex h-[52px] shrink-0 items-center justify-center gap-[6.55px] rounded-[10.24px] border border-[#2f4310] bg-[#141414] px-[20px] text-[12.8px] font-semibold text-[#8fee00]"
              >
                <Compass className="h-4 w-4" />
                open plan
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  isPlanMenuOpen && "rotate-180"
                )} />
              </button>

              {isPlanMenuOpen && availableFairs.length > 0 && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[260px] overflow-hidden rounded-[8.19px] border border-[#333333] bg-[#141414] shadow-[0_4px_7.525px_rgba(0,0,0,0.75)]">
                  <div className="max-h-72 overflow-auto p-1.5">
                    {availableFairs.map((fair) => (
                      <button
                        key={fair.id}
                        type="button"
                        onMouseDown={() => selectPlan(fair.id)}
                        className={cn(
                          "ui-hover-surface ui-interactive-base w-full rounded-[6.55px] border px-2.5 py-2 text-left",
                          activeFair?.id === fair.id
                            ? "border-[#8fee00] bg-[#1d260f]"
                            : "border-transparent"
                        )}
                      >
                        <p className="truncate text-[12.8px] font-semibold text-[#fafafa]">
                          {fair.name} {fair.edition}
                        </p>
                        <p className="mt-1 truncate text-[10.24px] text-[#dadada]">{fair.venueName}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}