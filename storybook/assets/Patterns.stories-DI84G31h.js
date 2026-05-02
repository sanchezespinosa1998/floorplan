import{j as e,r as f}from"./iframe-BLfZXjDa.js";import"./preload-helper-C1FmrZbK.js";const j={title:"Patterns/Layout",parameters:{layout:"padded",docs:{description:{component:"Composition patterns the app uses repeatedly — copy-paste these snippets when building a new module so the visual language stays consistent."}}}};function h(){const[a,i]=f.useState("all"),t=[{key:"all",label:"All"},{key:"ontrack",label:"On track"},{key:"atrisk",label:"At risk"},{key:"over",label:"Over budget"}];return e.jsx("div",{className:"grid w-full grid-cols-4 items-center gap-1 rounded-[8.19px] border border-[#333333] bg-[#141414] p-1",children:t.map(r=>e.jsx("button",{type:"button",onClick:()=>i(r.key),className:a===r.key?"inline-flex h-[29px] w-full items-center justify-center whitespace-nowrap rounded-[6.55px] bg-[#8fee00] px-2 text-[11px] font-semibold text-[#0a0a0a]":"ui-hover-surface ui-interactive-base inline-flex h-[29px] w-full items-center justify-center whitespace-nowrap rounded-[6.55px] px-2 text-[11px] font-semibold text-[#dadada]",children:r.label},r.key))})}const n={name:"Filter button group",render:()=>e.jsxs("div",{className:"grid w-[600px] gap-3 rounded-[10px] border border-[#333333] bg-[#141414] p-5",children:[e.jsx("p",{className:"text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]",children:"Filter chips"}),e.jsx(h,{}),e.jsxs("p",{className:"text-[10.5px] text-[#9a9a9a]",children:["This is the default ",e.jsx("code",{children:"headerContent"})," in every table — passes a button group sized to the filter dimension (3 / 4 / 7 columns depending on options)."]})]})};function v(){const[a,i]=f.useState("a");return e.jsxs("div",{className:"grid gap-3",children:[e.jsx("div",{className:"grid w-[280px] grid-cols-2 items-center gap-1 rounded-[8.19px] border border-[#333333] bg-[#141414] p-1",children:["a","b"].map(t=>e.jsx("button",{type:"button",onClick:()=>i(t),className:a===t?"inline-flex h-[29px] w-full items-center justify-center rounded-[6.55px] bg-[#8fee00] px-2 text-[11px] font-semibold text-[#0a0a0a]":"ui-hover-surface ui-interactive-base inline-flex h-[29px] w-full items-center justify-center rounded-[6.55px] px-2 text-[11px] font-semibold text-[#dadada]",children:t==="a"?"Beneficiaries":"Standing orders"},t))}),e.jsx("div",{className:"rounded-[8px] border border-[#333333] bg-[#141414] px-3 py-3 text-[12px] text-[#dadada]",children:a==="a"?"Beneficiary list rendered here":"Recurring payments rendered here"})]})}const s={name:"Tab switcher",render:()=>e.jsxs("div",{className:"grid w-[600px] gap-3 rounded-[10px] border border-[#333333] bg-[#141414] p-5",children:[e.jsx("p",{className:"text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]",children:"Tab switcher pattern"}),e.jsx(v,{})]})},d={name:"Canonical page layout",parameters:{layout:"fullscreen"},render:()=>e.jsxs("div",{className:"flex h-screen flex-col gap-[10.24px] bg-[#0a0a0a] p-4",children:[e.jsx("section",{className:"grid w-full gap-3 sm:gap-[13.72px]",style:{gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 110px), 1fr))"},children:[{id:1,t:`Total
debt`,v:"€264,500",s:"5 active products"},{id:2,t:`Monthly
service`,v:"€2,933",s:"Principal + interest"},{id:3,t:`Blended
rate`,v:"3.85%",s:"Weighted by outstanding"},{id:4,t:"FICO",v:"782",s:"Very good · +6 30d"},{id:5,t:"Repaid",v:"32%",s:"€84k of principal"}].map(a=>e.jsx("div",{className:"ui-hover-lift ui-theme-card min-h-[120px] rounded-[8.19px] border-b-[4px] border-[var(--db-accent)] px-4 py-4",children:e.jsxs("div",{className:"flex h-full flex-col justify-center gap-2",children:[e.jsx("p",{className:"whitespace-pre-line text-[10px] font-bold uppercase tracking-[1.1px] text-[#dadada]",children:a.t}),e.jsx("p",{className:"text-[28px] font-bold leading-[0.85] text-[#dadada]",children:a.v}),e.jsx("p",{className:"text-[10px] text-[#dadada]",children:a.s})]})},a.id))}),e.jsxs("div",{className:"mb-[16px] grid grid-cols-1 gap-[10.24px] lg:min-h-0 lg:flex-1 lg:grid-cols-3",children:[e.jsxs("div",{className:"rounded-[8.19px] border border-[#333333] bg-[#141414] p-5",children:[e.jsx("p",{className:"text-[10.5px] font-bold uppercase tracking-[1px] text-[var(--db-accent)]",children:"Recent activity"}),e.jsx("p",{className:"mt-2 text-[14px] text-[#fafafa]",children:"Left panel — DashboardInfoTable"}),e.jsx("p",{className:"mt-1 text-[11px] text-[#9a9a9a]",children:"List · cards · calendar views"})]}),e.jsxs("div",{className:"rounded-[8.19px] border border-[#333333] bg-[#141414] p-5 lg:col-span-2",children:[e.jsx("p",{className:"text-[10.5px] font-bold uppercase tracking-[1px] text-[var(--db-accent)]",children:"Lending portfolio"}),e.jsx("p",{className:"mt-2 text-[14px] text-[#fafafa]",children:"Main panel — RecentFairsTable"}),e.jsx("p",{className:"mt-1 text-[11px] text-[#9a9a9a]",children:"List · cards · treemap views · search · per-column sort & filter"})]})]})]})};var p,l,c;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  name: "Filter button group",
  render: () => <div className="grid w-[600px] gap-3 rounded-[10px] border border-[#333333] bg-[#141414] p-5">\r
      <p className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]">Filter chips</p>\r
      <FilterButtonGroupDemo />\r
      <p className="text-[10.5px] text-[#9a9a9a]">\r
        This is the default <code>headerContent</code> in every table — passes a button group sized to the filter dimension (3 / 4 / 7 columns depending on options).\r
      </p>\r
    </div>
}`,...(c=(l=n.parameters)==null?void 0:l.docs)==null?void 0:c.source}}};var o,x,m;s.parameters={...s.parameters,docs:{...(o=s.parameters)==null?void 0:o.docs,source:{originalSource:`{
  name: "Tab switcher",
  render: () => <div className="grid w-[600px] gap-3 rounded-[10px] border border-[#333333] bg-[#141414] p-5">\r
      <p className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]">Tab switcher pattern</p>\r
      <TabSwitcherDemo />\r
    </div>
}`,...(m=(x=s.parameters)==null?void 0:x.docs)==null?void 0:m.source}}};var u,b,g;d.parameters={...d.parameters,docs:{...(u=d.parameters)==null?void 0:u.docs,source:{originalSource:`{
  name: "Canonical page layout",
  parameters: {
    layout: "fullscreen"
  },
  render: () => <div className="flex h-screen flex-col gap-[10.24px] bg-[#0a0a0a] p-4">\r
      {/* Stats row */}\r
      <section className="grid w-full gap-3 sm:gap-[13.72px]" style={{
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 110px), 1fr))"
    }}>\r
        {[{
        id: 1,
        t: "Total\\ndebt",
        v: "€264,500",
        s: "5 active products"
      }, {
        id: 2,
        t: "Monthly\\nservice",
        v: "€2,933",
        s: "Principal + interest"
      }, {
        id: 3,
        t: "Blended\\nrate",
        v: "3.85%",
        s: "Weighted by outstanding"
      }, {
        id: 4,
        t: "FICO",
        v: "782",
        s: "Very good · +6 30d"
      }, {
        id: 5,
        t: "Repaid",
        v: "32%",
        s: "€84k of principal"
      }].map(card => <div key={card.id} className="ui-hover-lift ui-theme-card min-h-[120px] rounded-[8.19px] border-b-[4px] border-[var(--db-accent)] px-4 py-4">\r
            <div className="flex h-full flex-col justify-center gap-2">\r
              <p className="whitespace-pre-line text-[10px] font-bold uppercase tracking-[1.1px] text-[#dadada]">{card.t}</p>\r
              <p className="text-[28px] font-bold leading-[0.85] text-[#dadada]">{card.v}</p>\r
              <p className="text-[10px] text-[#dadada]">{card.s}</p>\r
            </div>\r
          </div>)}\r
      </section>\r
\r
      {/* Body — 3-col grid */}\r
      <div className="mb-[16px] grid grid-cols-1 gap-[10.24px] lg:min-h-0 lg:flex-1 lg:grid-cols-3">\r
        <div className="rounded-[8.19px] border border-[#333333] bg-[#141414] p-5">\r
          <p className="text-[10.5px] font-bold uppercase tracking-[1px] text-[var(--db-accent)]">Recent activity</p>\r
          <p className="mt-2 text-[14px] text-[#fafafa]">Left panel — DashboardInfoTable</p>\r
          <p className="mt-1 text-[11px] text-[#9a9a9a]">List · cards · calendar views</p>\r
        </div>\r
        <div className="rounded-[8.19px] border border-[#333333] bg-[#141414] p-5 lg:col-span-2">\r
          <p className="text-[10.5px] font-bold uppercase tracking-[1px] text-[var(--db-accent)]">Lending portfolio</p>\r
          <p className="mt-2 text-[14px] text-[#fafafa]">Main panel — RecentFairsTable</p>\r
          <p className="mt-1 text-[11px] text-[#9a9a9a]">List · cards · treemap views · search · per-column sort & filter</p>\r
        </div>\r
      </div>\r
    </div>
}`,...(g=(b=d.parameters)==null?void 0:b.docs)==null?void 0:g.source}}};const w=["FilterButtonGroup","TabSwitcher","CanonicalPageLayout"];export{d as CanonicalPageLayout,n as FilterButtonGroup,s as TabSwitcher,w as __namedExportsOrder,j as default};
