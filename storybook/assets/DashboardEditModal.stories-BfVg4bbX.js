import{j as e,r as D}from"./iframe-BLfZXjDa.js";import{D as j}from"./DashboardEditModal-DaCrBYY5.js";import"./preload-helper-C1FmrZbK.js";import"./index-CQWq2qIJ.js";import"./utils-DOIGBiOF.js";const A={title:"Modals/DashboardEditModal",component:j,parameters:{layout:"fullscreen",docs:{description:{component:"Canonical modal shell. Used for every Edit / Manage / Generate flow across the app. Provides title, description, scrollable body, primary save button, optional secondary action, optional destructive tone."}}},argTypes:{saveTone:{control:"radio",options:["primary","destructive"]},saveDisabled:{control:"boolean"}},args:{title:"Edit something",description:"A short caption explains what this modal does.",saveLabel:"Save changes",cancelLabel:"Cancel",saveTone:"primary",saveDisabled:!1}};function d(a){const[i,r]=D.useState(!0);return e.jsxs("div",{className:"flex min-h-screen items-center justify-center bg-[#0a0a0a]",children:[e.jsx("button",{type:"button",onClick:()=>r(!0),className:"ui-hover-accent ui-interactive-base inline-flex h-[34px] items-center rounded-[8px] border border-[#2f4310] bg-[#2f4310] px-3 text-[12px] font-semibold text-[#8fee00]",children:"Open modal"}),e.jsx(j,{...a,open:i,onOpenChange:r,onSave:()=>r(!1)})]})}const t={render:a=>e.jsx(d,{...a,children:e.jsxs("p",{className:"text-[12.8px] text-[#dadada]",children:["This is the canonical modal shell. Use any combination of ",e.jsx("code",{children:"TextInput"}),", ",e.jsx("code",{children:"SelectInput"}),",",e.jsx("code",{children:" NumberInput"}),", ",e.jsx("code",{children:"ToggleField"})," or ",e.jsx("code",{children:"SummaryCard"})," inside."]})})},o={args:{title:"Manage device",description:"iPhone 15 · Safari",secondaryAction:{label:"Revoke device",onClick:()=>alert("Revoked"),tone:"destructive"}},render:a=>e.jsx(d,{...a,children:e.jsx("p",{className:"text-[12.8px] text-[#dadada]",children:"Adds a left-aligned auxiliary button (e.g. Cancel order, File claim, Revoke)."})})},n={args:{title:"Delete share",description:"This action cannot be undone.",saveLabel:"Yes, delete",saveTone:"destructive"},render:a=>e.jsx(d,{...a,children:e.jsxs("p",{className:"text-[12.8px] text-[#dadada]",children:["Use ",e.jsx("code",{children:'saveTone="destructive"'})," to gate destructive primary actions."]})})},s={args:{title:"Lots of content",description:"Body scrolls inside the modal at max-height 70dvh."},render:a=>e.jsx(d,{...a,children:Array.from({length:20}).map((i,r)=>e.jsxs("div",{className:"rounded-[8px] border border-[#333333] bg-[#101010] px-3 py-2.5 text-[12.8px] text-[#dadada]",children:["Field ",r+1," — fields stack and the inner area scrolls when they don't fit."]},r))})};var c,l,p;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: args => <Demo {...args}>\r
      <p className="text-[12.8px] text-[#dadada]">\r
        This is the canonical modal shell. Use any combination of <code>TextInput</code>, <code>SelectInput</code>,\r
        <code> NumberInput</code>, <code>ToggleField</code> or <code>SummaryCard</code> inside.\r
      </p>\r
    </Demo>
}`,...(p=(l=t.parameters)==null?void 0:l.docs)==null?void 0:p.source}}};var m,x,u;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    title: "Manage device",
    description: "iPhone 15 · Safari",
    secondaryAction: {
      label: "Revoke device",
      onClick: () => alert("Revoked"),
      tone: "destructive"
    }
  },
  render: args => <Demo {...args}>\r
      <p className="text-[12.8px] text-[#dadada]">\r
        Adds a left-aligned auxiliary button (e.g. Cancel order, File claim, Revoke).\r
      </p>\r
    </Demo>
}`,...(u=(x=o.parameters)==null?void 0:x.docs)==null?void 0:u.source}}};var h,g,v;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    title: "Delete share",
    description: "This action cannot be undone.",
    saveLabel: "Yes, delete",
    saveTone: "destructive"
  },
  render: args => <Demo {...args}>\r
      <p className="text-[12.8px] text-[#dadada]">\r
        Use <code>saveTone="destructive"</code> to gate destructive primary actions.\r
      </p>\r
    </Demo>
}`,...(v=(g=n.parameters)==null?void 0:g.docs)==null?void 0:v.source}}};var b,y,f;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    title: "Lots of content",
    description: "Body scrolls inside the modal at max-height 70dvh."
  },
  render: args => <Demo {...args}>\r
      {Array.from({
      length: 20
    }).map((_, i) => <div key={i} className="rounded-[8px] border border-[#333333] bg-[#101010] px-3 py-2.5 text-[12.8px] text-[#dadada]">\r
          Field {i + 1} — fields stack and the inner area scrolls when they don't fit.\r
        </div>)}\r
    </Demo>
}`,...(f=(y=s.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};const E=["Default","WithSecondaryAction","DestructivePrimary","ScrollingContent"];export{t as Default,n as DestructivePrimary,s as ScrollingContent,o as WithSecondaryAction,E as __namedExportsOrder,A as default};
