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
    
<section className="flex w-full flex-row gap-[13.72px]">
      {cards.map((card) => (
        <div
          key={card.id}
          className="ui-hover-lift ui-theme-card flex-1 min-h-[161px] rounded-[8.19px] px-[17px] py-5 border-b-[4px] border-[#8fee00]"
        >
          <div className="flex h-full flex-col justify-center gap-[8.19px]">
            <p className="whitespace-pre-line text-[12.8px] font-bold uppercase leading-[1.25] tracking-[1.37px] text-[#dadada]">
              {card.title}
            </p>
            <p className="text-[48.83px] font-bold leading-[0.8] text-[#dadada]">
              {card.value}
            </p>
            <p className="text-[12.8px] font-normal leading-[1.25] text-[#dadada]">
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}