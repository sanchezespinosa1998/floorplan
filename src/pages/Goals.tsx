import { motion } from "framer-motion";
import { Home, GraduationCap, Plane, Wallet, ShieldCheck, TrendingUp, Plus, Target } from "lucide-react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Button } from "@/components/ui/button";
import { goals, accounts, personalNetWorthEUR, totalLiabilitiesEUR } from "@/data/fintechMockData";
import { cn } from "@/lib/utils";

const categoryIcon = {
  home:        Home,
  retirement:  ShieldCheck,
  travel:      Plane,
  emergency:   Wallet,
  education:   GraduationCap,
  wealth:      TrendingUp,
} as const;

const RISK_COLOR = {
  conservative: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  balanced:     'bg-amber-500/10 text-amber-500 border-amber-500/30',
  aggressive:   'bg-rose-500/10 text-rose-500 border-rose-500/30',
};

function formatEUR(value: number, options?: { compact?: boolean }) {
  if (options?.compact && Math.abs(value) >= 1_000_000) {
    return `€${(value / 1_000_000).toFixed(1)} M`;
  }
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function monthsUntil(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (30 * 24 * 3600 * 1000)));
}

export default function Goals() {
  const onTrackGoals = goals.filter((g) => {
    const months = monthsUntil(g.targetDate);
    const projected = g.current + months * g.monthlyContribution;
    return projected >= g.target;
  });

  const totalSaved = goals.reduce((s, g) => s + g.current, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const monthlyContrib = goals.reduce((s, g) => s + g.monthlyContribution, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        eyebrow="Lifestyle"
        title="Goals & Wealth"
        description="Savings goals, retirement projection and net-worth tracking. Auto-allocate from accounts to stay on track."
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New goal</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Personal net worth" value={formatEUR(personalNetWorthEUR, { compact: true })} subtitle={`Liabilities ${formatEUR(totalLiabilitiesEUR, { compact: true })}`} />
        <KpiCard title="Saved towards goals" value={formatEUR(totalSaved, { compact: true })} subtitle={`of ${formatEUR(totalTarget, { compact: true })} target`} />
        <KpiCard title="Monthly contribution" value={formatEUR(monthlyContrib)} subtitle="Across all active goals" />
        <KpiCard title="On track" value={`${onTrackGoals.length} / ${goals.length}`} subtitle="Goals projected to hit target" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {goals.map((g, i) => {
          const Icon = categoryIcon[g.category];
          const pct = (g.current / g.target) * 100;
          const months = monthsUntil(g.targetDate);
          const projected = g.current + months * g.monthlyContribution;
          const onTrack = projected >= g.target;
          const linked = accounts.find((a) => a.id === g.linkedAccountId);

          return (
            <motion.article
              key={g.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-md border border-border bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{g.label}</p>
                    <p className="text-[10.5px] text-muted-foreground capitalize">{g.category}</p>
                  </div>
                </div>
                <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border whitespace-nowrap", RISK_COLOR[g.riskProfile])}>
                  {g.riskProfile}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <p className="text-2xl font-bold text-foreground tabular-nums">{formatEUR(g.current, { compact: true })}</p>
                  <p className="text-xs text-muted-foreground">of {formatEUR(g.target, { compact: true })}</p>
                </div>
                <div className="h-1.5 w-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      onTrack ? "bg-emerald-500" : pct > 50 ? "bg-amber-500" : "bg-primary"
                    )}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {pct.toFixed(0)}% complete · {onTrack ? "On track to reach target" : `Below trajectory · projected ${formatEUR(projected, { compact: true })}`}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Monthly</p>
                  <p className="text-sm font-semibold text-foreground tabular-nums">{formatEUR(g.monthlyContribution)}</p>
                </div>
                <div>
                  <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Target date</p>
                  <p className="text-sm font-semibold text-foreground">{new Date(g.targetDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p>
                </div>
              </div>

              {linked && (
                <p className="mt-3 text-[10px] text-muted-foreground">Auto-allocated from <span className="text-foreground">{linked.name}</span></p>
              )}

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Top up</Button>
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Adjust plan</Button>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Net-worth summary */}
      <div className="bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Net worth breakdown</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Cash & savings",   value: accounts.filter((a) => a.kind === "current" || a.kind === "savings").reduce((s, a) => s + a.balanceEUR, 0) },
            { label: "Crypto",           value: accounts.filter((a) => a.kind === "crypto").reduce((s, a) => s + a.balanceEUR, 0) },
            { label: "Pension",          value: accounts.filter((a) => a.kind === "pension").reduce((s, a) => s + a.balanceEUR, 0) },
            { label: "Liabilities",      value: -totalLiabilitiesEUR },
          ].map((row) => (
            <div key={row.label} className="border border-border p-3">
              <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">{row.label}</p>
              <p className={cn(
                "text-base font-bold tabular-nums mt-1",
                row.value < 0 ? "text-rose-500" : "text-foreground"
              )}>
                {formatEUR(row.value, { compact: true })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
