import{j as e}from"./iframe-BLfZXjDa.js";import"./preload-helper-C1FmrZbK.js";const I={title:"Foundations/Design tokens",parameters:{layout:"padded",docs:{description:{component:"All theme variables exposed by `src/index.css`. Switch the active theme in the toolbar to see how each token resolves."}}}};function r({name:c,description:y}){return e.jsxs("div",{className:"grid grid-cols-[140px_60px_1fr] items-center gap-3 rounded-[8px] border border-[var(--db-border)] bg-[var(--db-bg-1)] px-3 py-2",children:[e.jsx("span",{className:"font-mono text-[10.5px] uppercase tracking-[0.6px] text-[var(--db-text-muted)]",children:c}),e.jsx("span",{className:"block h-[28px] w-[60px] rounded-[6px] border border-[var(--db-border)]",style:{background:`var(${c})`}}),e.jsx("span",{className:"text-[11.5px] text-[var(--db-text)]",children:y})]})}const t={render:()=>e.jsxs("div",{className:"grid gap-2",children:[e.jsx("h2",{className:"text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]",children:"Surfaces"}),e.jsx(r,{name:"--db-bg-0",description:"Page background"}),e.jsx(r,{name:"--db-bg-1",description:"Surface · cards, tables, modal body"}),e.jsx(r,{name:"--db-bg-2",description:"Surface raised · group nodes, hovered rows"}),e.jsx(r,{name:"--db-bg-3",description:"Surface inset · inputs"}),e.jsx(r,{name:"--db-card",description:"Card token (currently same as bg-1)"})]})},a={render:()=>e.jsxs("div",{className:"grid gap-2",children:[e.jsx("h2",{className:"text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]",children:"Borders & track"}),e.jsx(r,{name:"--db-border",description:"Default border"}),e.jsx(r,{name:"--db-border-strong",description:"Stronger border (focus ring, hovered surfaces)"}),e.jsx(r,{name:"--db-track",description:"Inactive track behind progress bars"})]})},s={render:()=>e.jsxs("div",{className:"grid gap-2",children:[e.jsx("h2",{className:"text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]",children:"Text"}),e.jsx(r,{name:"--db-text",description:"Default body text"}),e.jsx(r,{name:"--db-text-strong",description:"Headings, prominent values"}),e.jsx(r,{name:"--db-text-muted",description:"Subtle / metadata"})]})},n={render:()=>e.jsxs("div",{className:"grid gap-2",children:[e.jsx("h2",{className:"text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]",children:"Accent"}),e.jsx(r,{name:"--db-accent",description:"Primary brand colour"}),e.jsx(r,{name:"--db-accent-contrast",description:"Text on accent surface"}),e.jsx(r,{name:"--db-accent-surface",description:"Tinted surface for accent CTAs"})]})},d={render:()=>e.jsxs("div",{className:"grid grid-cols-1 gap-3 md:grid-cols-2",children:[e.jsxs("div",{className:"grid gap-2",children:[e.jsx("h2",{className:"text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]",children:"Success"}),e.jsx(r,{name:"--db-success-text"}),e.jsx(r,{name:"--db-success-surface"}),e.jsx(r,{name:"--db-success-border"})]}),e.jsxs("div",{className:"grid gap-2",children:[e.jsx("h2",{className:"text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]",children:"Warning"}),e.jsx(r,{name:"--db-warning-text"}),e.jsx(r,{name:"--db-warning-surface"}),e.jsx(r,{name:"--db-warning-border"})]}),e.jsxs("div",{className:"grid gap-2",children:[e.jsx("h2",{className:"text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]",children:"Danger"}),e.jsx(r,{name:"--db-danger-text"}),e.jsx(r,{name:"--db-danger-surface"}),e.jsx(r,{name:"--db-danger-border"})]}),e.jsxs("div",{className:"grid gap-2",children:[e.jsx("h2",{className:"text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]",children:"Info"}),e.jsx(r,{name:"--db-info-text"}),e.jsx(r,{name:"--db-info-surface"}),e.jsx(r,{name:"--db-info-border"})]})]})},o={render:()=>e.jsxs("div",{className:"grid gap-3 rounded-[10px] border border-[var(--db-border)] bg-[var(--db-bg-1)] p-5",children:[e.jsx("p",{className:"text-[10.5px] font-bold uppercase tracking-[1.4px] text-[var(--db-accent)]",children:"Eyebrow / 10.5px / 1.4 tracking"}),e.jsx("h1",{className:"text-[24px] font-bold leading-[1.1] text-[var(--db-text-strong)]",children:"Page title · 24px bold"}),e.jsx("h2",{className:"text-[16px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]",children:"Section · 16px uppercase"}),e.jsx("p",{className:"text-[12.8px] font-light text-[var(--db-text)]",children:"Body — 12.8px font-light leading 1.55. Used for descriptions, table cells, modal copy."}),e.jsx("p",{className:"font-mono text-[11px] text-[var(--db-text-muted)]",children:"Mono · 11px · IBANs, IPs, codes"}),e.jsx("p",{className:"tabular-nums text-[12.8px] font-semibold text-[var(--db-text-strong)]",children:"Numbers · tabular-nums · 12.8px semibold · €1,240,000"})]})};var i,x,p;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => <div className="grid gap-2">\r
      <h2 className="text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]">Surfaces</h2>\r
      <TokenRow name="--db-bg-0" description="Page background" />\r
      <TokenRow name="--db-bg-1" description="Surface · cards, tables, modal body" />\r
      <TokenRow name="--db-bg-2" description="Surface raised · group nodes, hovered rows" />\r
      <TokenRow name="--db-bg-3" description="Surface inset · inputs" />\r
      <TokenRow name="--db-card" description="Card token (currently same as bg-1)" />\r
    </div>
}`,...(p=(x=t.parameters)==null?void 0:x.docs)==null?void 0:p.source}}};var b,m,l;a.parameters={...a.parameters,docs:{...(b=a.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="grid gap-2">\r
      <h2 className="text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]">Borders & track</h2>\r
      <TokenRow name="--db-border" description="Default border" />\r
      <TokenRow name="--db-border-strong" description="Stronger border (focus ring, hovered surfaces)" />\r
      <TokenRow name="--db-track" description="Inactive track behind progress bars" />\r
    </div>
}`,...(l=(m=a.parameters)==null?void 0:m.docs)==null?void 0:l.source}}};var g,u,v;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div className="grid gap-2">\r
      <h2 className="text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]">Text</h2>\r
      <TokenRow name="--db-text" description="Default body text" />\r
      <TokenRow name="--db-text-strong" description="Headings, prominent values" />\r
      <TokenRow name="--db-text-muted" description="Subtle / metadata" />\r
    </div>
}`,...(v=(u=s.parameters)==null?void 0:u.docs)==null?void 0:v.source}}};var f,h,k;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <div className="grid gap-2">\r
      <h2 className="text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]">Accent</h2>\r
      <TokenRow name="--db-accent" description="Primary brand colour" />\r
      <TokenRow name="--db-accent-contrast" description="Text on accent surface" />\r
      <TokenRow name="--db-accent-surface" description="Tinted surface for accent CTAs" />\r
    </div>
}`,...(k=(h=n.parameters)==null?void 0:h.docs)==null?void 0:k.source}}};var j,N,w;d.parameters={...d.parameters,docs:{...(j=d.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <div className="grid grid-cols-1 gap-3 md:grid-cols-2">\r
      <div className="grid gap-2">\r
        <h2 className="text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]">Success</h2>\r
        <TokenRow name="--db-success-text" />\r
        <TokenRow name="--db-success-surface" />\r
        <TokenRow name="--db-success-border" />\r
      </div>\r
      <div className="grid gap-2">\r
        <h2 className="text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]">Warning</h2>\r
        <TokenRow name="--db-warning-text" />\r
        <TokenRow name="--db-warning-surface" />\r
        <TokenRow name="--db-warning-border" />\r
      </div>\r
      <div className="grid gap-2">\r
        <h2 className="text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]">Danger</h2>\r
        <TokenRow name="--db-danger-text" />\r
        <TokenRow name="--db-danger-surface" />\r
        <TokenRow name="--db-danger-border" />\r
      </div>\r
      <div className="grid gap-2">\r
        <h2 className="text-[14px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]">Info</h2>\r
        <TokenRow name="--db-info-text" />\r
        <TokenRow name="--db-info-surface" />\r
        <TokenRow name="--db-info-border" />\r
      </div>\r
    </div>
}`,...(w=(N=d.parameters)==null?void 0:N.docs)==null?void 0:w.source}}};var T,R,S;o.parameters={...o.parameters,docs:{...(T=o.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <div className="grid gap-3 rounded-[10px] border border-[var(--db-border)] bg-[var(--db-bg-1)] p-5">\r
      <p className="text-[10.5px] font-bold uppercase tracking-[1.4px] text-[var(--db-accent)]">Eyebrow / 10.5px / 1.4 tracking</p>\r
      <h1 className="text-[24px] font-bold leading-[1.1] text-[var(--db-text-strong)]">Page title · 24px bold</h1>\r
      <h2 className="text-[16px] font-bold uppercase tracking-[0.8px] text-[var(--db-text-strong)]">Section · 16px uppercase</h2>\r
      <p className="text-[12.8px] font-light text-[var(--db-text)]">Body — 12.8px font-light leading 1.55. Used for descriptions, table cells, modal copy.</p>\r
      <p className="font-mono text-[11px] text-[var(--db-text-muted)]">Mono · 11px · IBANs, IPs, codes</p>\r
      <p className="tabular-nums text-[12.8px] font-semibold text-[var(--db-text-strong)]">Numbers · tabular-nums · 12.8px semibold · €1,240,000</p>\r
    </div>
}`,...(S=(R=o.parameters)==null?void 0:R.docs)==null?void 0:S.source}}};const P=["Surfaces","Borders","Text","Accent","Status","Typography"];export{n as Accent,a as Borders,d as Status,t as Surfaces,s as Text,o as Typography,P as __namedExportsOrder,I as default};
