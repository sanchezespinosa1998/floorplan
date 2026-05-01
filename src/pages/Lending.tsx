import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Home, Car, Wallet, ShoppingCart, CreditCard, TrendingUp, Calculator } from "lucide-react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { loans, creditScore, type Loan } from "@/data/fintechMockData";
import { cn } from "@/lib/utils";

const kindIcon = {
  mortgage:    Home,
  auto:        Car,
  personal:    Wallet,
  bnpl:        ShoppingCart,
  'credit-line': CreditCard,
} as const;

const kindLabel = {
  mortgage:      'Mortgage',
  auto:          'Auto',
  personal:      'Personal',
  bnpl:          'BNPL',
  'credit-line': 'Credit line',
} as const;

const SCORE_BAND_COLOR = {
  'poor':       'text-rose-500 border-rose-500/40 bg-rose-500/10',
  'fair':       'text-amber-500 border-amber-500/40 bg-amber-500/10',
  'good':       'text-yellow-500 border-yellow-500/40 bg-yellow-500/10',
  'very-good':  'text-lime-500 border-lime-500/40 bg-lime-500/10',
  'excellent':  'text-emerald-500 border-emerald-500/40 bg-emerald-500/10',
};

function formatEUR(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export default function Lending() {
  const [tab, setTab] = useState<"loans" | "score" | "calculator">("loans");

  // Mortgage calculator state
  const [principal, setPrincipal] = useState("250000");
  const [years, setYears] = useState("25");
  const [rate, setRate] = useState("3.10");

  const monthly = useMemo(() => {
    const P = parseFloat(principal); const r = parseFloat(rate) / 100 / 12; const n = parseFloat(years) * 12;
    if (!P || !n || !r) return 0;
    return (P * r) / (1 - Math.pow(1 + r, -n));
  }, [principal, years, rate]);

  const totalDebt   = loans.reduce((s, l) => s + l.outstanding, 0);
  const totalMonthly = loans.reduce((s, l) => s + l.monthlyPayment, 0);
  const avgRate     = loans.reduce((s, l) => s + l.ratePct * l.outstanding, 0) / Math.max(totalDebt, 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        eyebrow="Lifestyle"
        title="Lending & Credit"
        description="Mortgage, auto, BNPL, personal loans and credit-line management. Live credit score and mortgage calculator."
        actions={<Button size="sm">Apply for credit</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Total debt"      value={formatEUR(totalDebt)}    subtitle={`${loans.length} active products`} />
        <KpiCard title="Monthly service" value={formatEUR(totalMonthly)} subtitle="Combined principal + interest" />
        <KpiCard title="Blended rate"    value={`${avgRate.toFixed(2)}%`} subtitle="Weighted by outstanding" />
        <KpiCard title="Credit score"    value={creditScore.score}        subtitle={`${creditScore.band.replace('-', ' ')} · ${creditScore.delta30d >= 0 ? "+" : ""}${creditScore.delta30d} 30d`} />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="score">Credit score</TabsTrigger>
          <TabsTrigger value="calculator">Mortgage calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="loans" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {loans.map((loan, i) => <LoanCard key={loan.id} loan={loan} index={i} />)}
          </div>
        </TabsContent>

        <TabsContent value="score" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-5 lg:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-primary">FICO score</p>
              <p className="text-6xl font-bold text-foreground mt-3 tabular-nums">{creditScore.score}</p>
              <span className={cn("inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border", SCORE_BAND_COLOR[creditScore.band])}>
                {creditScore.band.replace('-', ' ')}
              </span>
              <p className={cn("text-sm mt-3 font-semibold", creditScore.delta30d >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {creditScore.delta30d >= 0 ? "+" : ""}{creditScore.delta30d} pts in the last 30 days
              </p>

              {/* Progress bar */}
              <div className="mt-5 h-2 w-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-amber-500 via-yellow-500 via-lime-500 to-emerald-500"
                  style={{ width: `${((creditScore.score - 300) / 550) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground mt-1 tabular-nums">
                <span>300</span><span>500</span><span>700</span><span>850</span>
              </div>
            </div>

            <div className="bg-card border border-border p-5 lg:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-primary">Score factors</p>
              <h3 className="text-base font-semibold text-foreground mt-1 mb-4">What's driving your score</h3>
              <div className="space-y-4">
                <ScoreFactor label="On-time payments"   value={`${creditScore.onTimePct.toFixed(1)}%`}     pct={creditScore.onTimePct}                              good />
                <ScoreFactor label="Credit utilisation" value={`${creditScore.utilisationPct}%`}           pct={100 - (creditScore.utilisationPct / 30) * 100}      good={creditScore.utilisationPct < 30} />
                <ScoreFactor label="Credit age"         value={`${Math.floor(creditScore.ageMonths / 12)} y ${creditScore.ageMonths % 12} m`} pct={(creditScore.ageMonths / 240) * 100} good />
                <ScoreFactor label="Hard enquiries (12m)" value={creditScore.hardEnquiries12M.toString()} pct={creditScore.hardEnquiries12M <= 2 ? 90 : 30}        good={creditScore.hardEnquiries12M <= 2} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-5 lg:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-primary">Mortgage calculator</p>
              <h3 className="text-base font-semibold text-foreground mt-1 flex items-center gap-2">
                <Calculator className="h-4 w-4" /> What can you afford?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="principal">Principal</Label>
                  <Input id="principal" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="years">Term (years)</Label>
                  <Input id="years" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rate">Rate (%)</Label>
                  <Input id="rate" type="number" step="0.05" value={rate} onChange={(e) => setRate(e.target.value)} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 pt-4 border-t border-border">
                <div>
                  <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Monthly payment</p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">{formatEUR(monthly)}</p>
                </div>
                <div>
                  <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Total interest</p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">{formatEUR(monthly * parseFloat(years) * 12 - parseFloat(principal))}</p>
                </div>
                <div>
                  <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Total repaid</p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">{formatEUR(monthly * parseFloat(years) * 12)}</p>
                </div>
              </div>
            </div>

            <aside className="bg-card border border-border p-5">
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-primary">Pre-approved offers</p>
              <h3 className="text-base font-semibold text-foreground mt-1">Personalised rates</h3>

              <div className="mt-3 space-y-2">
                {[
                  { p: "Mortgage 25y",      r: "2.95%", limit: "€350,000" },
                  { p: "Auto loan 5y",      r: "4.80%", limit: "€60,000"  },
                  { p: "Personal loan 4y",  r: "6.40%", limit: "€25,000"  },
                  { p: "Revolving credit",  r: "7.95%", limit: "€20,000"  },
                ].map((o) => (
                  <div key={o.p} className="border border-border p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{o.p}</p>
                      <p className="text-[10.5px] text-muted-foreground">Up to {o.limit}</p>
                    </div>
                    <p className="text-base font-bold text-primary tabular-nums">{o.r}</p>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-[10px] text-muted-foreground">Rates personalised based on your credit score of {creditScore.score}. APR varies.</p>
            </aside>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoanCard({ loan, index }: { loan: Loan; index: number }) {
  const Icon = kindIcon[loan.kind];
  const repaidPct = ((loan.principal - loan.outstanding) / loan.principal) * 100;
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-md border border-border bg-secondary flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{loan.label}</p>
            <p className="text-[10.5px] text-muted-foreground">{kindLabel[loan.kind]} · {loan.ratePct.toFixed(2)}% APR</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Outstanding</p>
          <p className="text-lg font-bold text-foreground tabular-nums">{formatEUR(loan.outstanding)}</p>
        </div>
        <div className="h-1.5 w-full bg-muted overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${repaidPct}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground">{repaidPct.toFixed(0)}% repaid · {formatEUR(loan.principal - loan.outstanding)} of {formatEUR(loan.principal)}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Monthly</p>
          <p className="text-sm font-semibold text-foreground tabular-nums">{formatEUR(loan.monthlyPayment)}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Maturity</p>
          <p className="text-sm font-semibold text-foreground">{loan.endDate}</p>
        </div>
      </div>
    </motion.article>
  );
}

function ScoreFactor({ label, value, pct, good }: { label: string; value: string; pct: number; good?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-sm font-semibold tabular-nums">{value}</p>
      </div>
      <div className="h-1.5 w-full bg-muted overflow-hidden">
        <div
          className={cn("h-full", good ? "bg-emerald-500" : "bg-amber-500")}
          style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
