import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Snowflake, Plane, ShoppingBag, Plus, Smartphone, Wifi, Globe, Banknote, CheckCircle2, AlertCircle } from "lucide-react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cards, accounts, type PaymentCard } from "@/data/fintechMockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const cardKindLabel = {
  debit:   'Debit',
  credit:  'Credit',
  virtual: 'Virtual',
};

function formatEUR(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function CardFace({ card, selected, onClick }: { card: PaymentCard; selected: boolean; onClick: () => void }) {
  const colorMap = {
    graphite: "from-zinc-800 to-zinc-950 border-zinc-700",
    platinum: "from-zinc-300 to-zinc-500 text-zinc-900 border-zinc-400",
    titanium: "from-amber-700 to-amber-950 border-amber-700/60",
    neon:     "from-lime-400 to-emerald-700 text-zinc-900 border-lime-400",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full aspect-[1.6/1] bg-gradient-to-br p-5 text-left transition-all border-2",
        colorMap[card.color],
        selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]" : "hover:scale-[1.01]"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[1.4px] opacity-70">{cardKindLabel[card.kind]} · {card.network}</p>
          <p className="text-base font-semibold mt-0.5">{card.label}</p>
        </div>
        {card.status === "frozen" ? (
          <Snowflake className="h-5 w-5 opacity-90" />
        ) : (
          <CreditCard className="h-5 w-5 opacity-90" />
        )}
      </div>
      <div className="absolute bottom-5 left-5 right-5">
        <p className="font-mono text-base tabular-nums tracking-widest">•••• {card.lastFour}</p>
        <div className="mt-2 flex items-end justify-between">
          <p className="text-[10px] uppercase tracking-wider opacity-80 truncate max-w-[60%]">{card.holder}</p>
          <p className="text-[10px] tabular-nums opacity-80">{card.expiry}</p>
        </div>
      </div>
    </button>
  );
}

export default function CardsPage() {
  const [selectedId, setSelectedId] = useState(cards[0].id);
  const [filter, setFilter] = useState<"all" | "debit" | "credit" | "virtual">("all");
  const filtered = filter === "all" ? cards : cards.filter((c) => c.kind === filter);
  const selected = cards.find((c) => c.id === selectedId) ?? cards[0];
  const linkedAccount = accounts.find((a) => a.id === selected.linkedAccountId);

  const totalCards   = cards.length;
  const activeCards  = cards.filter((c) => c.status === "active").length;
  const frozenCards  = cards.filter((c) => c.status === "frozen").length;
  const monthlySpent = cards.reduce((s, c) => s + c.spentThisMonth, 0);

  const utilisation = (selected.spentThisMonth / selected.monthlyLimit) * 100;

  const toggleFreeze = () => {
    toast.success(selected.status === "frozen"
      ? `Card •••• ${selected.lastFour} unfrozen`
      : `Card •••• ${selected.lastFour} frozen — re-enable from this panel any time.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        eyebrow="Banking"
        title="Cards"
        description="Debit, credit and virtual cards. Spending limits, freeze/unfreeze, online & contactless toggles, Apple/Google Pay."
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Issue new card</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Cards" value={totalCards} subtitle={`${activeCards} active · ${frozenCards} frozen`} />
        <KpiCard title="Spent this month" value={formatEUR(monthlySpent)} subtitle="Across all cards" />
        <KpiCard title="Apple / Google Pay" value={cards.filter((c) => c.appleGooglePay).length} subtitle={`Of ${totalCards} provisioned`} />
        <KpiCard title="Virtual cards" value={cards.filter((c) => c.kind === "virtual").length} subtitle="One-tap create / revoke" />
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="debit">Debit</TabsTrigger>
          <TabsTrigger value="credit">Credit</TabsTrigger>
          <TabsTrigger value="virtual">Virtual</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            {/* Card grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <CardFace card={card} selected={card.id === selectedId} onClick={() => setSelectedId(card.id)} />
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{cardKindLabel[card.kind]} · {card.label}</span>
                    <span className={cn(
                      "font-medium",
                      card.status === "frozen" ? "text-sky-400" : card.status === "pending" ? "text-amber-500" : "text-emerald-500"
                    )}>
                      {card.status === "active" && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
                      {card.status === "frozen" && <Snowflake className="inline h-3 w-3 mr-1" />}
                      {card.status === "pending" && <AlertCircle className="inline h-3 w-3 mr-1" />}
                      {card.status[0].toUpperCase() + card.status.slice(1)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Side panel: details */}
            <aside className="bg-card border border-border p-5 space-y-5 h-fit">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-primary">Selected card</p>
                <h2 className="text-lg font-semibold text-foreground mt-1">{selected.label}</h2>
                <p className="text-xs text-muted-foreground">{selected.network} {cardKindLabel[selected.kind]} · •••• {selected.lastFour}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Monthly spend</span>
                  <span className="font-semibold tabular-nums">{formatEUR(selected.spentThisMonth)} / {formatEUR(selected.monthlyLimit)}</span>
                </div>
                <div className="h-1.5 w-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      utilisation > 85 ? "bg-rose-500" : utilisation > 60 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${Math.min(utilisation, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">{utilisation.toFixed(0)}% of limit</p>
              </div>

              <div className="space-y-2">
                <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Linked account</p>
                <p className="text-sm text-foreground">{linkedAccount?.name ?? "Unassigned"}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{linkedAccount?.iban ?? ""}</p>
              </div>

              {selected.rewardsRatePct && (
                <div className="bg-primary/10 border border-primary/30 p-3 text-xs">
                  <p className="font-semibold text-primary flex items-center gap-1.5">
                    <Banknote className="h-3.5 w-3.5" /> {selected.rewardsRatePct.toFixed(1)}% cashback
                  </p>
                  <p className="text-muted-foreground mt-0.5">Earned on every purchase. Credited monthly.</p>
                </div>
              )}

              <div className="space-y-1 text-xs">
                <ToggleRow icon={<Wifi className="h-3.5 w-3.5" />}    label="Contactless"    enabled={selected.contactless} />
                <ToggleRow icon={<Globe className="h-3.5 w-3.5" />}   label="Online payments" enabled={selected.online} />
                <ToggleRow icon={<Banknote className="h-3.5 w-3.5" />}label="ATM withdraw"   enabled={selected.withdraw} />
                <ToggleRow icon={<Smartphone className="h-3.5 w-3.5" />} label="Apple / Google Pay" enabled={selected.appleGooglePay} />
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-border">
                <Button onClick={toggleFreeze} variant={selected.status === "frozen" ? "default" : "outline"} size="sm" className="gap-1.5">
                  <Snowflake className="h-3.5 w-3.5" />
                  {selected.status === "frozen" ? "Unfreeze card" : "Freeze card"}
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  {selected.kind === "virtual" ? <><ShoppingBag className="h-3.5 w-3.5" /> Show CVV / PAN</> : <><Plane className="h-3.5 w-3.5" /> Travel notice</>}
                </Button>
              </div>
            </aside>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ToggleRow({ icon, label, enabled }: { icon: React.ReactNode; label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="flex items-center gap-2 text-foreground">{icon}{label}</span>
      <span className={cn(
        "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
        enabled ? "bg-primary/10 text-primary border-primary/40" : "bg-muted text-muted-foreground border-border"
      )}>
        {enabled ? "On" : "Off"}
      </span>
    </div>
  );
}
