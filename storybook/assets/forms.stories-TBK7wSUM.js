import{j as e,r}from"./iframe-BLfZXjDa.js";import{F as a,T as l,a as g,N as q,D as Y,S as z,b as _,c as S,d as v,e as j}from"./forms-CxKDOMOK.js";import"./preload-helper-C1FmrZbK.js";import"./utils-DOIGBiOF.js";const ee={title:"Forms/Primitives",parameters:{layout:"padded",docs:{description:{component:"Canonical form atoms used inside every action dialog. Drop them into a `DashboardEditModal` (or any container) to compose forms that match the design system without writing new CSS."}}}},p={name:"Field",render:()=>e.jsxs("div",{className:"grid w-[420px] gap-3 rounded-[10px] border border-[#333333] bg-[#141414] p-5",children:[e.jsx(a,{label:"Display name",children:e.jsx(l,{defaultValue:"Aleks Sánchez"})}),e.jsx(a,{label:"Email",children:e.jsx(l,{type:"email",defaultValue:"aleks@portfoliomap.app"})})]})},c={name:"FieldGroup · 1 / 2 / 3 cols",render:()=>e.jsxs("div",{className:"grid w-[600px] gap-4 rounded-[10px] border border-[#333333] bg-[#141414] p-5",children:[e.jsx(g,{cols:1,children:e.jsx(a,{label:"One column",children:e.jsx(l,{placeholder:"A"})})}),e.jsxs(g,{cols:2,children:[e.jsx(a,{label:"Two A",children:e.jsx(l,{placeholder:"A"})}),e.jsx(a,{label:"Two B",children:e.jsx(l,{placeholder:"B"})})]}),e.jsxs(g,{cols:3,children:[e.jsx(a,{label:"Three A",children:e.jsx(l,{placeholder:"A"})}),e.jsx(a,{label:"Three B",children:e.jsx(l,{placeholder:"B"})}),e.jsx(a,{label:"Three C",children:e.jsx(l,{placeholder:"C"})})]})]})},u={name:"Inputs · all variants",render:()=>e.jsxs("div",{className:"grid w-[420px] gap-3 rounded-[10px] border border-[#333333] bg-[#141414] p-5",children:[e.jsx(a,{label:"Text",children:e.jsx(l,{placeholder:"Type something"})}),e.jsx(a,{label:"Number",children:e.jsx(q,{placeholder:"0"})}),e.jsx(a,{label:"Date",children:e.jsx(Y,{})}),e.jsx(a,{label:"Select",children:e.jsxs(z,{defaultValue:"b",children:[e.jsx("option",{value:"a",children:"Option A"}),e.jsx("option",{value:"b",children:"Option B"}),e.jsx("option",{value:"c",children:"Option C"})]})}),e.jsx(a,{label:"Textarea",children:e.jsx(_,{placeholder:"Notes…"})})]})};function U(){const[n,s]=r.useState(!0),[o,t]=r.useState(!1),[d,i]=r.useState(!0);return e.jsxs("div",{className:"grid w-[420px] gap-3 rounded-[10px] border border-[#333333] bg-[#141414] p-5",children:[e.jsx(j,{label:"Paperless documents",hint:"Receive statements only via the in-app vault.",checked:n,onChange:s}),e.jsx(j,{label:"Auto-renew at expiry",checked:o,onChange:t}),e.jsx(j,{label:"Push alerts",hint:"Sends a push notification within 30 s of every flagged event.",checked:d,onChange:i})]})}const m={name:"ToggleField",render:()=>e.jsx(U,{})};function W(){const[n,s]=r.useState("buy"),[o,t]=r.useState("day"),[d,i]=r.useState("1m");return e.jsxs("div",{className:"grid w-[640px] gap-4 rounded-[10px] border border-[#333333] bg-[#141414] p-5",children:[e.jsx(a,{label:"Side",children:e.jsx(v,{value:n,onChange:s,options:[{value:"buy",label:"Buy"},{value:"sell",label:"Sell"}]})}),e.jsx(a,{label:"Time in force",children:e.jsx(v,{value:o,onChange:t,options:[{value:"day",label:"Day"},{value:"gtc",label:"GTC"},{value:"ioc",label:"IOC"}]})}),e.jsx(a,{label:"Range",children:e.jsx(v,{value:d,onChange:i,options:[{value:"1d",label:"1D"},{value:"1w",label:"1W"},{value:"1m",label:"1M"},{value:"3m",label:"3M"},{value:"ytd",label:"YTD"},{value:"1y",label:"1Y"}]})})]})}const b={name:"Segmented",render:()=>e.jsx(W,{})},x={name:"SummaryCard",render:()=>e.jsxs("div",{className:"grid w-[420px] gap-3 rounded-[10px] border border-[#333333] bg-[#141414] p-5",children:[e.jsx(S,{rows:[{label:"Balance",value:"€28,450",accent:!0},{label:"Available",value:"€28,120"},{label:"Pending",value:"€330"},{label:"IBAN",value:e.jsx("span",{className:"font-mono text-[11px]",children:"ES91 2100 0418 4502 0005 1332"})}]}),e.jsx(S,{rows:[{label:"P&L",value:"+€39,824 (+321.2%)",accent:!0},{label:"Cost basis",value:"€12,400"},{label:"Market value",value:"€52,224"}]})]})};function J(){const[n,s]=r.useState("harvest"),[o,t]=r.useState("85"),[d,i]=r.useState(!0);return e.jsxs("div",{className:"grid w-[560px] gap-3 rounded-[10px] border border-[#333333] bg-[#141414] p-5",children:[e.jsx(S,{rows:[{label:"Quantity",value:"85 TSLA"},{label:"Cost basis",value:"€22,410"},{label:"Unrealised",value:"−€7,510 (−33.5%)",accent:!0}]}),e.jsx(a,{label:"Strategy",children:e.jsx(v,{value:n,onChange:s,options:[{value:"hold",label:"Hold"},{value:"harvest",label:"Harvest loss"},{value:"realise",label:"Realise"}]})}),e.jsxs(g,{children:[e.jsx(a,{label:"Quantity",children:e.jsx(q,{value:o,onChange:H=>t(H.target.value)})}),e.jsx(a,{label:"Settlement",children:e.jsxs(z,{defaultValue:"t1",children:[e.jsx("option",{value:"t0",children:"T+0 (instant)"}),e.jsx("option",{value:"t1",children:"T+1"}),e.jsx("option",{value:"t2",children:"T+2"})]})})]}),e.jsx(j,{label:"Apply tax-loss to current quarter",hint:"Records a realisation event so the loss offsets gains immediately.",checked:d,onChange:i})]})}const h={name:"Composed dialog body",render:()=>e.jsx(J,{})};var F,T,y;p.parameters={...p.parameters,docs:{...(F=p.parameters)==null?void 0:F.docs,source:{originalSource:`{
  name: "Field",
  render: () => <div className="grid w-[420px] gap-3 rounded-[10px] border border-[#333333] bg-[#141414] p-5">\r
      <Field label="Display name">\r
        <TextInput defaultValue="Aleks Sánchez" />\r
      </Field>\r
      <Field label="Email">\r
        <TextInput type="email" defaultValue="aleks@portfoliomap.app" />\r
      </Field>\r
    </div>
}`,...(y=(T=p.parameters)==null?void 0:T.docs)==null?void 0:y.source}}};var C,f,w;c.parameters={...c.parameters,docs:{...(C=c.parameters)==null?void 0:C.docs,source:{originalSource:`{
  name: "FieldGroup · 1 / 2 / 3 cols",
  render: () => <div className="grid w-[600px] gap-4 rounded-[10px] border border-[#333333] bg-[#141414] p-5">\r
      <FieldGroup cols={1}>\r
        <Field label="One column"><TextInput placeholder="A" /></Field>\r
      </FieldGroup>\r
      <FieldGroup cols={2}>\r
        <Field label="Two A"><TextInput placeholder="A" /></Field>\r
        <Field label="Two B"><TextInput placeholder="B" /></Field>\r
      </FieldGroup>\r
      <FieldGroup cols={3}>\r
        <Field label="Three A"><TextInput placeholder="A" /></Field>\r
        <Field label="Three B"><TextInput placeholder="B" /></Field>\r
        <Field label="Three C"><TextInput placeholder="C" /></Field>\r
      </FieldGroup>\r
    </div>
}`,...(w=(f=c.parameters)==null?void 0:f.docs)==null?void 0:w.source}}};var I,A,N;u.parameters={...u.parameters,docs:{...(I=u.parameters)==null?void 0:I.docs,source:{originalSource:`{
  name: "Inputs · all variants",
  render: () => <div className="grid w-[420px] gap-3 rounded-[10px] border border-[#333333] bg-[#141414] p-5">\r
      <Field label="Text">\r
        <TextInput placeholder="Type something" />\r
      </Field>\r
      <Field label="Number">\r
        <NumberInput placeholder="0" />\r
      </Field>\r
      <Field label="Date">\r
        <DateInput />\r
      </Field>\r
      <Field label="Select">\r
        <SelectInput defaultValue="b">\r
          <option value="a">Option A</option>\r
          <option value="b">Option B</option>\r
          <option value="c">Option C</option>\r
        </SelectInput>\r
      </Field>\r
      <Field label="Textarea">\r
        <TextareaInput placeholder="Notes…" />\r
      </Field>\r
    </div>
}`,...(N=(A=u.parameters)==null?void 0:A.docs)==null?void 0:N.source}}};var D,B,G;m.parameters={...m.parameters,docs:{...(D=m.parameters)==null?void 0:D.docs,source:{originalSource:`{
  name: "ToggleField",
  render: () => <ToggleDemo />
}`,...(G=(B=m.parameters)==null?void 0:B.docs)==null?void 0:G.source}}};var k,E,O;b.parameters={...b.parameters,docs:{...(k=b.parameters)==null?void 0:k.docs,source:{originalSource:`{
  name: "Segmented",
  render: () => <SegmentedDemo />
}`,...(O=(E=b.parameters)==null?void 0:E.docs)==null?void 0:O.source}}};var P,R,V;x.parameters={...x.parameters,docs:{...(P=x.parameters)==null?void 0:P.docs,source:{originalSource:`{
  name: "SummaryCard",
  render: () => <div className="grid w-[420px] gap-3 rounded-[10px] border border-[#333333] bg-[#141414] p-5">\r
      <SummaryCard rows={[{
      label: "Balance",
      value: "€28,450",
      accent: true
    }, {
      label: "Available",
      value: "€28,120"
    }, {
      label: "Pending",
      value: "€330"
    }, {
      label: "IBAN",
      value: <span className="font-mono text-[11px]">ES91 2100 0418 4502 0005 1332</span>
    }]} />\r
      <SummaryCard rows={[{
      label: "P&L",
      value: "+€39,824 (+321.2%)",
      accent: true
    }, {
      label: "Cost basis",
      value: "€12,400"
    }, {
      label: "Market value",
      value: "€52,224"
    }]} />\r
    </div>
}`,...(V=(R=x.parameters)==null?void 0:R.docs)==null?void 0:V.source}}};var M,L,Q;h.parameters={...h.parameters,docs:{...(M=h.parameters)==null?void 0:M.docs,source:{originalSource:`{
  name: "Composed dialog body",
  render: () => <ComposedDialogDemo />
}`,...(Q=(L=h.parameters)==null?void 0:L.docs)==null?void 0:Q.source}}};const ae=["FieldExample","FieldGroupColumns","Inputs","ToggleFieldStory","SegmentedStory","SummaryCardStory","Composed"];export{h as Composed,p as FieldExample,c as FieldGroupColumns,u as Inputs,b as SegmentedStory,x as SummaryCardStory,m as ToggleFieldStory,ae as __namedExportsOrder,ee as default};
