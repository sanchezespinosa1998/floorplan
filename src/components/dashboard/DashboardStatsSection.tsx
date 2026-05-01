interface DashboardStatCard {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
}

interface DashboardStatsSectionProps {
  cards: DashboardStatCard[];
}

export function DashboardStatsSection({ cards }: DashboardStatsSectionProps) {
  return (
    <section
      className="grid w-full gap-3 sm:gap-[13.72px]"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 110px), 1fr))" }}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className="ui-hover-lift ui-theme-card min-w-0 min-h-[120px] rounded-[8.19px] px-3 py-3 border-b-[4px] border-[#8fee00] sm:min-h-[140px] sm:px-3.5 sm:py-4 lg:min-h-[161px] lg:px-[17px] lg:py-5"
        >
          <div className="flex h-full flex-col justify-center gap-[8.19px]">
            <p className="whitespace-pre-line text-[10px] font-bold uppercase leading-[1.25] tracking-[1.1px] text-[#dadada] sm:text-[11px] sm:tracking-[1.37px] lg:text-[12.8px]">
              {card.title}
            </p>
            <p className="text-[32px] font-bold leading-[0.85] text-[#dadada] sm:text-[40px] lg:text-[48.83px] lg:leading-[0.8]">
              {card.value}
            </p>
            <p className="text-[10px] font-normal leading-[1.25] text-[#dadada] sm:text-[11px] lg:text-[12.8px]">
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
