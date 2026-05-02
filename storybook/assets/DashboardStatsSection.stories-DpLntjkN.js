import{j as e}from"./iframe-BLfZXjDa.js";import"./preload-helper-C1FmrZbK.js";function b({cards:v}){return e.jsx("section",{className:"stats-grid",children:v.map(t=>e.jsx("div",{className:"stats-card ui-hover-lift ui-theme-card min-w-0 min-h-[100px] rounded-[8.19px] border-b-[3px] border-[var(--db-accent)] px-3 py-3 sm:min-h-[140px] sm:border-b-[4px] sm:px-3.5 sm:py-4 lg:min-h-[161px] lg:px-[17px] lg:py-5",children:e.jsxs("div",{className:"flex h-full flex-col justify-center gap-1.5 sm:gap-[8.19px]",children:[e.jsx("p",{className:"stats-card-title whitespace-pre-line font-bold uppercase tracking-[0.9px] text-[#dadada] sm:tracking-[1.37px]",children:t.title}),e.jsx("p",{className:"stats-card-value font-bold text-[#dadada]",style:{overflowWrap:"anywhere"},children:t.value}),e.jsx("p",{className:"stats-card-subtitle font-normal text-[#dadada]",children:t.subtitle})]})},t.id))})}const f={title:"Dashboard/DashboardStatsSection",component:b,parameters:{layout:"padded",docs:{description:{component:"5-card hero strip used at the top of every fintech module. Cards are non-interactive (hover-only) — the value/title/subtitle each accept a string or pre-rendered ReactNode."}}}},a={args:{cards:[{id:"balance",title:`Aggregate
balance`,value:"€1.4 M",subtitle:"6 accounts (EUR equivalent)"},{id:"liquid",title:`Liquid
assets`,value:"€122,870",subtitle:"Excl. brokerage & pension"},{id:"change",title:`30-day
Δ`,value:"+€18,400",subtitle:"Net inflows minus outflows"},{id:"pending",title:`Pending
outflows`,value:"€330",subtitle:"Holds and authorisations"},{id:"count",title:`Total
accounts`,value:6,subtitle:"2 current · 1 savings"}]}},s={args:{cards:[{id:"a",title:`Open
claims`,value:2,subtitle:"Filed in the last 30 days"},{id:"b",title:`Resolved
YTD`,value:12,subtitle:"Avg processing time 6 days"},{id:"c",title:"Coverage",value:"€820k",subtitle:"Health + life + home"}]}},n={args:{cards:[{id:"x",title:`Estimated
tax owed`,value:"€3,180",subtitle:"Effective rate 26.2% · €9,580 of harvesting opportunity available across 3 lots"},{id:"y",title:`Net
realised`,value:"+€12,120",subtitle:"From 14 closed positions"},{id:"z",title:`ISA allowance
used`,value:"72%",subtitle:"€5,600 of headroom · finish before 5 April"}]}};var i,l,r;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    cards: [{
      id: "balance",
      title: "Aggregate\\nbalance",
      value: "€1.4 M",
      subtitle: "6 accounts (EUR equivalent)"
    }, {
      id: "liquid",
      title: "Liquid\\nassets",
      value: "€122,870",
      subtitle: "Excl. brokerage & pension"
    }, {
      id: "change",
      title: "30-day\\nΔ",
      value: "+€18,400",
      subtitle: "Net inflows minus outflows"
    }, {
      id: "pending",
      title: "Pending\\noutflows",
      value: "€330",
      subtitle: "Holds and authorisations"
    }, {
      id: "count",
      title: "Total\\naccounts",
      value: 6,
      subtitle: "2 current · 1 savings"
    }]
  }
}`,...(r=(l=a.parameters)==null?void 0:l.docs)==null?void 0:r.source}}};var o,d,c;s.parameters={...s.parameters,docs:{...(o=s.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    cards: [{
      id: "a",
      title: "Open\\nclaims",
      value: 2,
      subtitle: "Filed in the last 30 days"
    }, {
      id: "b",
      title: "Resolved\\nYTD",
      value: 12,
      subtitle: "Avg processing time 6 days"
    }, {
      id: "c",
      title: "Coverage",
      value: "€820k",
      subtitle: "Health + life + home"
    }]
  }
}`,...(c=(d=s.parameters)==null?void 0:d.docs)==null?void 0:c.source}}};var u,p,m;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    cards: [{
      id: "x",
      title: "Estimated\\ntax owed",
      value: "€3,180",
      subtitle: "Effective rate 26.2% · €9,580 of harvesting opportunity available across 3 lots"
    }, {
      id: "y",
      title: "Net\\nrealised",
      value: "+€12,120",
      subtitle: "From 14 closed positions"
    }, {
      id: "z",
      title: "ISA allowance\\nused",
      value: "72%",
      subtitle: "€5,600 of headroom · finish before 5 April"
    }]
  }
}`,...(m=(p=n.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};const x=["FiveCards","ThreeCards","LongSubtitles"];export{a as FiveCards,n as LongSubtitles,s as ThreeCards,x as __namedExportsOrder,f as default};
