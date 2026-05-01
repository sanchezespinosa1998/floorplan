import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Home, Car, Plane, ShieldCheck, Briefcase, Plus, FileText } from "lucide-react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { insurancePolicies, insuranceClaims } from "@/data/fintechMockData";
import { cn } from "@/lib/utils";

const kindIcon = {
  health:    Heart,
  life:      ShieldCheck,
  home:      Home,
  auto:      Car,
  travel:    Plane,
  liability: Briefcase,
} as const;

const STATUS_COLOR = {
  active:           'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  'pending-renewal':'bg-amber-500/10 text-amber-500 border-amber-500/30',
  lapsed:           'bg-rose-500/10 text-rose-500 border-rose-500/30',
};

const CLAIM_COLOR = {
  open:     'bg-amber-500/10 text-amber-500 border-amber-500/30',
  paid:     'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  rejected: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
};

function formatEUR(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function Insurance() {
  const [tab, setTab] = useState<"policies" | "claims">("policies");

  const totalCoverage = insurancePolicies.reduce((s, p) => s + p.coverageEUR, 0);
  const monthlyPremium = insurancePolicies.filter((p) => p.status !== "lapsed").reduce((s, p) => s + p.premiumMonthly, 0);
  const pendingRenewal = insurancePolicies.filter((p) => p.status === "pending-renewal").length;
  const openClaims = insuranceClaims.filter((c) => c.status === "open").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        eyebrow="Lifestyle"
        title="Insurance"
        description="Centralise all your policies — health, life, home, auto, travel and liability — and manage claims end-to-end."
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add policy
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Total coverage"  value={formatEUR(totalCoverage)}  subtitle={`${insurancePolicies.length} active policies`} />
        <KpiCard title="Monthly premium" value={formatEUR(monthlyPremium)} subtitle="Combined recurring cost" />
        <KpiCard title="Pending renewals" value={pendingRenewal}            subtitle="Within the next 90 days" />
        <KpiCard title="Open claims"      value={openClaims}                subtitle={`${insuranceClaims.filter((c) => c.status === "paid").length} paid YTD`} />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {insurancePolicies.map((p, i) => {
              const Icon = kindIcon[p.kind];
              return (
                <motion.article
                  key={p.id}
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
                        <p className="text-sm font-semibold text-foreground truncate capitalize">{p.kind}</p>
                        <p className="text-[10.5px] text-muted-foreground truncate">{p.provider}</p>
                      </div>
                    </div>
                    <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border whitespace-nowrap", STATUS_COLOR[p.status])}>
                      {p.status.replace('-', ' ')}
                    </span>
                  </div>

                  <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Coverage</p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">{formatEUR(p.coverageEUR)}</p>

                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Premium</p>
                      <p className="text-sm font-semibold tabular-nums">{formatEUR(p.premiumMonthly)} / mo</p>
                    </div>
                    <div>
                      <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Renewal</p>
                      <p className="text-sm font-semibold">{formatDate(p.renewalDate)}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-[10px] text-muted-foreground font-mono">Policy {p.policyNumber}</p>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">View policy</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">File claim</Button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="claims" className="mt-4">
          <div className="bg-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-4 py-2.5 font-semibold">Claim</th>
                    <th className="text-left px-4 py-2.5 font-semibold hidden md:table-cell">Policy</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Filed</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Amount</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {insuranceClaims.map((c, i) => {
                    const policy = insurancePolicies.find((p) => p.id === c.policyId);
                    const Icon = policy ? kindIcon[policy.kind] : FileText;
                    return (
                      <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{c.description}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{policy?.provider}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(c.filedAt)}</td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatEUR(c.amountEUR)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border", CLAIM_COLOR[c.status])}>
                            {c.status}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
