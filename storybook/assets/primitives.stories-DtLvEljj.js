import{j as e}from"./iframe-BLfZXjDa.js";import{S as x,A as t,E as K,I as f,P as s,T as r}from"./primitives-cLbbm4y2.js";import{c as H}from"./createLucideIcon-D01s97XY.js";import{B as J}from"./bitcoin-CzsM6W4r.js";import{T as Q}from"./triangle-alert-BwDiUtqi.js";import"./preload-helper-C1FmrZbK.js";import"./utils-DOIGBiOF.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=H("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=H("Snowflake",[["line",{x1:"2",x2:"22",y1:"12",y2:"12",key:"1dnqot"}],["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"m20 16-4-4 4-4",key:"rquw4f"}],["path",{d:"m4 8 4 4-4 4",key:"12s3z9"}],["path",{d:"m16 4-4 4-4-4",key:"1tumq1"}],["path",{d:"m8 20 4-4 4 4",key:"9p200w"}]]),v=["success","warning","danger","info","neutral","purple","orange"],ne={title:"Primitives/StatusBadge",component:x,parameters:{layout:"centered"},argTypes:{tone:{control:"select",options:v},label:{control:"text"},size:{control:"radio",options:["sm","md"]}},args:{tone:"success",label:"Active",size:"md"}},n={},o={args:{icon:g}},c={parameters:{layout:"padded"},render:()=>e.jsx("div",{className:"flex flex-wrap gap-2 bg-[#0a0a0a] p-6",children:v.map(a=>e.jsx(x,{tone:a,label:a},a))})},l={parameters:{layout:"padded"},render:()=>e.jsxs("div",{className:"flex items-center gap-3 bg-[#0a0a0a] p-6",children:[e.jsx(x,{tone:"success",label:"Small",size:"sm",icon:g}),e.jsx(x,{tone:"success",label:"Medium",size:"md",icon:g})]})},i={name:"TrendArrow · gains and losses",render:()=>e.jsxs("div",{className:"grid grid-cols-2 gap-3 bg-[#0a0a0a] p-6",children:[e.jsx(r,{value:12.45,format:a=>`${a.toFixed(2)}%`}),e.jsx(r,{value:-4.2,format:a=>`${a.toFixed(2)}%`}),e.jsx(r,{value:.08,format:a=>`${a.toFixed(2)}%`}),e.jsx(r,{value:-32.4,format:a=>`${a.toFixed(2)}%`}),e.jsx(r,{value:18.6,format:a=>`${a.toFixed(1)}%`,positiveIsBad:!0}),e.jsx(r,{value:-8.1,format:a=>`${a.toFixed(1)}%`,positiveIsBad:!0})]})},d={name:"ProgressBar · all thresholds",render:()=>e.jsxs("div",{className:"grid w-[360px] gap-4 bg-[#0a0a0a] p-6",children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-1 text-[11px] uppercase tracking-wide text-[#9a9a9a]",children:"25% used"}),e.jsx(s,{value:25})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-1 text-[11px] uppercase tracking-wide text-[#9a9a9a]",children:"75% used (warn)"}),e.jsx(s,{value:75})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-1 text-[11px] uppercase tracking-wide text-[#9a9a9a]",children:"95% used (danger)"}),e.jsx(s,{value:95})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-1 text-[11px] uppercase tracking-wide text-[#9a9a9a]",children:"110% — overflow"}),e.jsx(s,{value:110})]})]})},X=[{icon:J,label:"Crypto"},{icon:U,label:"Frozen"},{icon:Q,label:"Alert"}],p={name:"IconBadge · tones",render:()=>e.jsxs("div",{className:"flex items-center gap-2 bg-[#0a0a0a] p-6",children:[X.map(({icon:a,label:b})=>e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx(f,{icon:a,tone:"default"}),e.jsx("p",{className:"text-[10px] text-[#9a9a9a]",children:b})]},b)),v.slice(0,5).map(a=>e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx(f,{icon:J,tone:a}),e.jsx("p",{className:"text-[10px] text-[#9a9a9a]",children:a})]},a))]})},m={name:"EmptyState · default",parameters:{layout:"padded"},render:()=>e.jsx("div",{className:"rounded-[10px] border border-[#333333] bg-[#141414]",children:e.jsx(K,{title:"No transactions yet",body:"Connect a bank account to start streaming activity into PortfolioMap.",cta:{label:"Connect a bank",onClick:()=>alert("→ /connections")}})})},u={name:"ActionButton",parameters:{layout:"padded"},render:()=>e.jsxs("div",{className:"flex items-center gap-3 bg-[#0a0a0a] p-6",children:[e.jsx(t,{label:"Manage",onClick:()=>alert("Manage")}),e.jsx(t,{label:"Trade",onClick:()=>alert("Trade"),tone:"accent"}),e.jsx(t,{label:"Top up",onClick:()=>alert("Top up"),tone:"accent"}),e.jsx(t,{label:"Edit",onClick:()=>alert("Edit")}),e.jsx(t,{label:"View",onClick:()=>alert("View")})]})};var j,k,h;n.parameters={...n.parameters,docs:{...(j=n.parameters)==null?void 0:j.docs,source:{originalSource:"{}",...(h=(k=n.parameters)==null?void 0:k.docs)==null?void 0:h.source}}};var w,y,B;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    icon: Check
  }
}`,...(B=(y=o.parameters)==null?void 0:y.docs)==null?void 0:B.source}}};var S,N,A;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
  parameters: {
    layout: "padded"
  },
  render: () => <div className="flex flex-wrap gap-2 bg-[#0a0a0a] p-6">\r
      {ALL_TONES.map(tone => <StatusBadge key={tone} tone={tone} label={tone} />)}\r
    </div>
}`,...(A=(N=c.parameters)==null?void 0:N.docs)==null?void 0:A.source}}};var T,C,I;l.parameters={...l.parameters,docs:{...(T=l.parameters)==null?void 0:T.docs,source:{originalSource:`{
  parameters: {
    layout: "padded"
  },
  render: () => <div className="flex items-center gap-3 bg-[#0a0a0a] p-6">\r
      <StatusBadge tone="success" label="Small" size="sm" icon={Check} />\r
      <StatusBadge tone="success" label="Medium" size="md" icon={Check} />\r
    </div>
}`,...(I=(C=l.parameters)==null?void 0:C.docs)==null?void 0:I.source}}};var E,F,P;i.parameters={...i.parameters,docs:{...(E=i.parameters)==null?void 0:E.docs,source:{originalSource:'{\n  name: "TrendArrow · gains and losses",\n  render: () => <div className="grid grid-cols-2 gap-3 bg-[#0a0a0a] p-6">\r\n      <TrendArrow value={+12.45} format={v => `${v.toFixed(2)}%`} />\r\n      <TrendArrow value={-4.20} format={v => `${v.toFixed(2)}%`} />\r\n      <TrendArrow value={+0.08} format={v => `${v.toFixed(2)}%`} />\r\n      <TrendArrow value={-32.40} format={v => `${v.toFixed(2)}%`} />\r\n      <TrendArrow value={+18.6} format={v => `${v.toFixed(1)}%`} positiveIsBad />\r\n      <TrendArrow value={-8.1} format={v => `${v.toFixed(1)}%`} positiveIsBad />\r\n    </div>\n}',...(P=(F=i.parameters)==null?void 0:F.docs)==null?void 0:P.source}}};var $,z,M;d.parameters={...d.parameters,docs:{...($=d.parameters)==null?void 0:$.docs,source:{originalSource:`{
  name: "ProgressBar · all thresholds",
  render: () => <div className="grid w-[360px] gap-4 bg-[#0a0a0a] p-6">\r
      <div>\r
        <p className="mb-1 text-[11px] uppercase tracking-wide text-[#9a9a9a]">25% used</p>\r
        <ProgressBar value={25} />\r
      </div>\r
      <div>\r
        <p className="mb-1 text-[11px] uppercase tracking-wide text-[#9a9a9a]">75% used (warn)</p>\r
        <ProgressBar value={75} />\r
      </div>\r
      <div>\r
        <p className="mb-1 text-[11px] uppercase tracking-wide text-[#9a9a9a]">95% used (danger)</p>\r
        <ProgressBar value={95} />\r
      </div>\r
      <div>\r
        <p className="mb-1 text-[11px] uppercase tracking-wide text-[#9a9a9a]">110% — overflow</p>\r
        <ProgressBar value={110} />\r
      </div>\r
    </div>
}`,...(M=(z=d.parameters)==null?void 0:z.docs)==null?void 0:M.source}}};var L,O,q;p.parameters={...p.parameters,docs:{...(L=p.parameters)==null?void 0:L.docs,source:{originalSource:`{
  name: "IconBadge · tones",
  render: () => <div className="flex items-center gap-2 bg-[#0a0a0a] p-6">\r
      {ICONS.map(({
      icon,
      label
    }) => <div key={label} className="flex flex-col items-center gap-1">\r
          <IconBadge icon={icon} tone="default" />\r
          <p className="text-[10px] text-[#9a9a9a]">{label}</p>\r
        </div>)}\r
      {ALL_TONES.slice(0, 5).map(tone => <div key={tone} className="flex flex-col items-center gap-1">\r
          <IconBadge icon={Bitcoin} tone={tone} />\r
          <p className="text-[10px] text-[#9a9a9a]">{tone}</p>\r
        </div>)}\r
    </div>
}`,...(q=(O=p.parameters)==null?void 0:O.docs)==null?void 0:q.source}}};var _,D,V;m.parameters={...m.parameters,docs:{...(_=m.parameters)==null?void 0:_.docs,source:{originalSource:`{
  name: "EmptyState · default",
  parameters: {
    layout: "padded"
  },
  render: () => <div className="rounded-[10px] border border-[#333333] bg-[#141414]">\r
      <EmptyState title="No transactions yet" body="Connect a bank account to start streaming activity into PortfolioMap." cta={{
      label: "Connect a bank",
      onClick: () => alert("→ /connections")
    }} />\r
    </div>
}`,...(V=(D=m.parameters)==null?void 0:D.docs)==null?void 0:V.source}}};var G,W,R;u.parameters={...u.parameters,docs:{...(G=u.parameters)==null?void 0:G.docs,source:{originalSource:`{
  name: "ActionButton",
  parameters: {
    layout: "padded"
  },
  render: () => <div className="flex items-center gap-3 bg-[#0a0a0a] p-6">\r
      <ActionButton label="Manage" onClick={() => alert("Manage")} />\r
      <ActionButton label="Trade" onClick={() => alert("Trade")} tone="accent" />\r
      <ActionButton label="Top up" onClick={() => alert("Top up")} tone="accent" />\r
      <ActionButton label="Edit" onClick={() => alert("Edit")} />\r
      <ActionButton label="View" onClick={() => alert("View")} />\r
    </div>
}`,...(R=(W=u.parameters)==null?void 0:W.docs)==null?void 0:R.source}}};const oe=["Default","WithIcon","AllTones","Sizes","TrendArrowGains","ProgressBarShowcase","IconBadgeShowcase","EmptyStateDefault","ActionButtonStory"];export{u as ActionButtonStory,c as AllTones,n as Default,m as EmptyStateDefault,p as IconBadgeShowcase,d as ProgressBarShowcase,l as Sizes,i as TrendArrowGains,o as WithIcon,oe as __namedExportsOrder,ne as default};
