import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Star, Newspaper, TrendingUp, TrendingDown, Search } from "lucide-react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { marketIndices, watchlist, marketNews } from "@/data/fintechMockData";
import { cn } from "@/lib/utils";

function formatNumber(value: number, decimals = 2) {
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value);
}

function timeAgo(iso: string) {
  const diffH = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (diffH < 1) return "just now";
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

export default function Markets() {
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState<"all" | "Equity" | "ETF" | "Crypto" | "FX" | "Commodity">("all");

  const filteredWatchlist = useMemo(() => {
    const q = query.trim().toLowerCase();
    return watchlist.filter((w) => {
      if (classFilter !== "all" && w.assetClass !== classFilter) return false;
      if (!q) return true;
      return (w.ticker + " " + w.name).toLowerCase().includes(q);
    });
  }, [query, classFilter]);

  const advancers = watchlist.filter((w) => w.changePct > 0).length;
  const decliners = watchlist.filter((w) => w.changePct < 0).length;
  const inPortfolio = watchlist.filter((w) => w.inPortfolio).length;
  const avgMove = watchlist.reduce((s, w) => s + w.changePct, 0) / watchlist.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        eyebrow="Investing"
        title="Markets & Watchlist"
        description="Live indices, sector heatmap, watchlist and macro news in one operational console."
        actions={<Button size="sm" variant="outline" className="text-xs">Add to watchlist</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Watchlist size" value={watchlist.length} subtitle={`${inPortfolio} held in portfolio`} />
        <KpiCard title="Advancers"      value={advancers}        subtitle="Up on the day" />
        <KpiCard title="Decliners"      value={decliners}        subtitle="Down on the day" />
        <KpiCard title="Avg. move"      value={`${avgMove.toFixed(2)}%`} subtitle="Equal-weighted, intraday" />
      </div>

      {/* Indices strip */}
      <div className="bg-card border border-border overflow-hidden">
        <header className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Global indices</h2>
          <p className="text-[10px] text-muted-foreground">Last update · just now</p>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y lg:divide-y-0 divide-border">
          {marketIndices.map((idx) => (
            <div key={idx.id} className="p-3.5 hover:bg-muted/30 transition-colors">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{idx.name}</p>
              <p className="text-base font-bold text-foreground tabular-nums mt-0.5">{formatNumber(idx.level)}</p>
              <p className={cn(
                "text-[11px] font-semibold tabular-nums flex items-center gap-1 mt-0.5",
                idx.changePct >= 0 ? "text-emerald-500" : "text-rose-500"
              )}>
                {idx.changePct >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {idx.changePct >= 0 ? "+" : ""}{idx.changePct.toFixed(2)}% · {idx.changeAbs >= 0 ? "+" : ""}{formatNumber(idx.changeAbs)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlist (main) */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border overflow-hidden">
            <header className="px-4 py-3 border-b border-border flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Watchlist</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    className="pl-8 h-8 text-xs w-full sm:w-56"
                    placeholder="Search ticker or name…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <Tabs value={classFilter} onValueChange={(v) => setClassFilter(v as typeof classFilter)}>
                  <TabsList className="h-8">
                    <TabsTrigger value="all" className="text-[10px] px-2">All</TabsTrigger>
                    <TabsTrigger value="Equity" className="text-[10px] px-2">Equity</TabsTrigger>
                    <TabsTrigger value="ETF" className="text-[10px] px-2">ETF</TabsTrigger>
                    <TabsTrigger value="Crypto" className="text-[10px] px-2">Crypto</TabsTrigger>
                    <TabsTrigger value="FX" className="text-[10px] px-2">FX</TabsTrigger>
                    <TabsTrigger value="Commodity" className="text-[10px] px-2">Comm.</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-4 py-2.5 font-semibold">Ticker</th>
                    <th className="text-left px-4 py-2.5 font-semibold hidden md:table-cell">Class</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Last</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Δ Day</th>
                    <th className="text-right px-4 py-2.5 font-semibold hidden lg:table-cell">P/E</th>
                    <th className="text-right px-4 py-2.5 font-semibold hidden lg:table-cell">Mkt cap</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredWatchlist.map((w, i) => (
                    <motion.tr
                      key={w.ticker}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          {w.inPortfolio && <span className="h-1.5 w-1.5 bg-primary rounded-full shrink-0" title="In portfolio" />}
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">{w.ticker}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{w.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-muted-foreground hidden md:table-cell">{w.assetClass}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {w.lastPrice >= 1000 ? formatNumber(w.lastPrice, 0) : formatNumber(w.lastPrice, 2)}
                        <span className="ml-1 text-[10px] text-muted-foreground">{w.currency}</span>
                      </td>
                      <td className={cn(
                        "px-4 py-2.5 text-right tabular-nums font-semibold",
                        w.changePct >= 0 ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {w.changePct >= 0 ? "+" : ""}{w.changePct.toFixed(2)}%
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums hidden lg:table-cell">{w.pe?.toFixed(1) ?? "—"}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums hidden lg:table-cell text-muted-foreground">
                        {w.marketCap ? `€${w.marketCap.toLocaleString("en-GB")} B` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Button size="sm" variant="outline" className="h-7 text-[11px]">Trade</Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sector heatmap */}
          <div className="bg-card border border-border mt-4 overflow-hidden">
            <header className="px-4 py-3 border-b border-border flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Watchlist heatmap</h2>
            </header>
            <div className="p-3 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {watchlist.map((w) => {
                const intensity = Math.min(Math.abs(w.changePct) / 5, 1);
                const bg = w.changePct >= 0
                  ? `rgba(34, 197, 94, ${0.15 + intensity * 0.5})`
                  : `rgba(239, 68, 68, ${0.15 + intensity * 0.5})`;
                return (
                  <div
                    key={w.ticker}
                    className="border border-border p-2 text-center"
                    style={{ backgroundColor: bg }}
                  >
                    <p className="text-[10.5px] font-bold text-foreground">{w.ticker}</p>
                    <p className={cn(
                      "text-[10px] font-semibold mt-0.5",
                      w.changePct >= 0 ? "text-emerald-300" : "text-rose-300"
                    )}>
                      {w.changePct >= 0 ? "+" : ""}{w.changePct.toFixed(2)}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* News column */}
        <aside className="bg-card border border-border h-fit overflow-hidden">
          <header className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Macro news</h2>
          </header>
          <div className="divide-y divide-border">
            {marketNews.map((n, i) => (
              <motion.article
                key={n.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="px-4 py-3 hover:bg-muted/30"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{n.source}</p>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border",
                    n.impact === "high" ? "border-rose-500/40 bg-rose-500/10 text-rose-500" :
                    n.impact === "medium" ? "border-amber-500/40 bg-amber-500/10 text-amber-500" :
                                            "border-border text-muted-foreground"
                  )}>
                    {n.impact}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-snug">{n.headline}</p>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
                  <span className="capitalize">{n.category}</span>
                  <span>{timeAgo(n.publishedAt)}</span>
                </div>
              </motion.article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
