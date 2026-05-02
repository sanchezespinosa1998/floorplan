import{r as s,N as H,s as M,h as G,f as Z,u as O,i as T,k as q,D as Y,l as N,m as A,n as X,j as J}from"./iframe-BLfZXjDa.js";import"./index-CQWq2qIJ.js";import{c as l}from"./createLucideIcon-D01s97XY.js";import{c as I,u as U,f as F,g as Q}from"./mockData-CkdZPP6m.js";/**
 * React Router DOM v6.30.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function S(){return S=Object.assign?Object.assign.bind():function(e){for(var a=1;a<arguments.length;a++){var o=arguments[a];for(var i in o)Object.prototype.hasOwnProperty.call(o,i)&&(e[i]=o[i])}return e},S.apply(this,arguments)}function W(e,a){if(e==null)return{};var o={},i=Object.keys(e),c,n;for(n=0;n<i.length;n++)c=i[n],!(a.indexOf(c)>=0)&&(o[c]=e[c]);return o}function $(e){return!!(e.metaKey||e.altKey||e.ctrlKey||e.shiftKey)}function ee(e,a){return e.button===0&&(!a||a==="_self")&&!$(e)}const te=["onClick","relative","reloadDocument","replace","state","target","to","preventScrollReset","viewTransition"],ae=["aria-current","caseSensitive","className","end","style","to","viewTransition","children"],ie="6";try{window.__reactRouterVersion=ie}catch{}const ne=s.createContext({isTransitioning:!1}),re=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u",oe=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,se=s.forwardRef(function(a,o){let{onClick:i,relative:c,reloadDocument:n,replace:r,state:u,target:v,to:d,preventScrollReset:k,viewTransition:t}=a,w=W(a,te),{basename:f}=s.useContext(H),m,g=!1;if(typeof d=="string"&&oe.test(d)&&(m=d,re))try{let y=new URL(window.location.href),h=d.startsWith("//")?new URL(y.protocol+d):new URL(d),b=M(h.pathname,f);h.origin===y.origin&&b!=null?d=b+h.search+h.hash:g=!0}catch{}let _=G(d,{relative:c}),x=ce(d,{replace:r,state:u,target:v,preventScrollReset:k,relative:c,viewTransition:t});function p(y){i&&i(y),y.defaultPrevented||x(y)}return s.createElement("a",S({},w,{href:m||_,onClick:g||n?i:p,ref:o,target:v}))}),ke=s.forwardRef(function(a,o){let{"aria-current":i="page",caseSensitive:c=!1,className:n="",end:r=!1,style:u,to:v,viewTransition:d,children:k}=a,t=W(a,ae),w=T(v,{relative:t.relative}),f=O(),m=s.useContext(Y),{navigator:g,basename:_}=s.useContext(H),x=m!=null&&de(w)&&d===!0,p=g.encodeLocation?g.encodeLocation(w).pathname:w.pathname,y=f.pathname,h=m&&m.navigation&&m.navigation.location?m.navigation.location.pathname:null;c||(y=y.toLowerCase(),h=h?h.toLowerCase():null,p=p.toLowerCase()),h&&_&&(h=M(h,_)||h);const b=p!=="/"&&p.endsWith("/")?p.length-1:p.length;let L=y===p||!r&&y.startsWith(p)&&y.charAt(b)==="/",j=h!=null&&(h===p||!r&&h.startsWith(p)&&h.charAt(p.length)==="/"),R={isActive:L,isPending:j,isTransitioning:x},K=L?i:void 0,P;typeof n=="function"?P=n(R):P=[n,L?"active":null,j?"pending":null,x?"transitioning":null].filter(Boolean).join(" ");let D=typeof u=="function"?u(R):u;return s.createElement(se,S({},t,{"aria-current":K,className:P,ref:o,style:D,to:v,viewTransition:d}),typeof k=="function"?k(R):k)});var E;(function(e){e.UseScrollRestoration="useScrollRestoration",e.UseSubmit="useSubmit",e.UseSubmitFetcher="useSubmitFetcher",e.UseFetcher="useFetcher",e.useViewTransitionState="useViewTransitionState"})(E||(E={}));var B;(function(e){e.UseFetcher="useFetcher",e.UseFetchers="useFetchers",e.UseScrollRestoration="useScrollRestoration"})(B||(B={}));function le(e){let a=s.useContext(X);return a||N(!1),a}function ce(e,a){let{target:o,replace:i,state:c,preventScrollReset:n,relative:r,viewTransition:u}=a===void 0?{}:a,v=Z(),d=O(),k=T(e,{relative:r});return s.useCallback(t=>{if(ee(t,o)){t.preventDefault();let w=i!==void 0?i:q(d)===q(k);v(e,{replace:w,state:c,preventScrollReset:n,relative:r,viewTransition:u})}},[d,v,k,i,c,o,e,n,r,u])}function de(e,a){a===void 0&&(a={});let o=s.useContext(ne);o==null&&N(!1);let{basename:i}=le(E.useViewTransitionState),c=T(e,{relative:a.relative});if(!o.isTransitioning)return!1;let n=M(o.currentLocation.pathname,i)||o.currentLocation.pathname,r=M(o.nextLocation.pathname,i)||o.nextLocation.pathname;return A(c.pathname,r)!=null||A(c.pathname,n)!=null}/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=l("ArrowLeftRight",[["path",{d:"M8 3 4 7l4 4",key:"9rb6wj"}],["path",{d:"M4 7h16",key:"6tx8e3"}],["path",{d:"m16 21 4-4-4-4",key:"siv7j2"}],["path",{d:"M20 17H4",key:"h6l3hr"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ge=l("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _e=l("Briefcase",[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xe=l("Building2",[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",key:"1b4qmf"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",key:"i71pzd"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",key:"10jefs"}],["path",{d:"M10 6h4",key:"1itunk"}],["path",{d:"M10 10h4",key:"tcdvrf"}],["path",{d:"M10 14h4",key:"kelpxr"}],["path",{d:"M10 18h4",key:"1ulq68"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const be=l("ChartLine",[["path",{d:"M3 3v16a2 2 0 0 0 2 2h16",key:"c24i48"}],["path",{d:"m19 9-5 5-4-4-3 3",key:"2osh9i"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ce=l("Coins",[["circle",{cx:"8",cy:"8",r:"6",key:"3yglwk"}],["path",{d:"M18.09 10.37A6 6 0 1 1 10.34 18",key:"t5s6rm"}],["path",{d:"M7 6h1v4",key:"1obek4"}],["path",{d:"m16.71 13.88.7.71-2.82 2.82",key:"1rbuyh"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Me=l("CreditCard",[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=l("FileChartColumnIncreasing",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M8 18v-2",key:"qcmpov"}],["path",{d:"M12 18v-4",key:"q1q25u"}],["path",{d:"M16 18v-6",key:"15y0np"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=l("FolderLock",[["rect",{width:"8",height:"5",x:"14",y:"17",rx:"1",key:"19aais"}],["path",{d:"M10 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v2.5",key:"1w6v7t"}],["path",{d:"M20 17v-2a2 2 0 1 0-4 0v2",key:"pwaxnr"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=l("Hourglass",[["path",{d:"M5 22h14",key:"ehvnwv"}],["path",{d:"M5 2h14",key:"pdyrp9"}],["path",{d:"M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22",key:"1d314k"}],["path",{d:"M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2",key:"1vvvr6"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pe=l("Landmark",[["line",{x1:"3",x2:"21",y1:"22",y2:"22",key:"j8o0r"}],["line",{x1:"6",x2:"6",y1:"18",y2:"11",key:"10tf0k"}],["line",{x1:"10",x2:"10",y1:"18",y2:"11",key:"54lgf6"}],["line",{x1:"14",x2:"14",y1:"18",y2:"11",key:"380y"}],["line",{x1:"18",x2:"18",y1:"18",y2:"11",key:"1kevvc"}],["polygon",{points:"12 2 20 7 4 7",key:"jkujk7"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=l("PiggyBank",[["path",{d:"M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z",key:"1ivx2i"}],["path",{d:"M2 9v1c0 1.1.9 2 2 2h1",key:"nm575m"}],["path",{d:"M16 11h.01",key:"xkw8gn"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ue=l("Receipt",[["path",{d:"M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z",key:"q3az6g"}],["path",{d:"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8",key:"1h4pet"}],["path",{d:"M12 17.5v-11",key:"1jc1ny"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fe=l("Repeat",[["path",{d:"m17 2 4 4-4 4",key:"nntrym"}],["path",{d:"M3 11v-1a4 4 0 0 1 4-4h14",key:"84bu3i"}],["path",{d:"m7 22-4-4 4-4",key:"1wqhfi"}],["path",{d:"M21 13v1a4 4 0 0 1-4 4H3",key:"1rx37r"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ve=l("ShieldAlert",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee=l("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Te=l("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=l("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qe=l("Wallet",[["path",{d:"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",key:"18etb6"}],["path",{d:"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",key:"xoc0q4"}]]),he={admin:["view_dashboard","view_fairs","view_venues","view_fair_detail","view_plan","edit_plan","view_bookings","manage_bookings","approve_bookings","view_fair_users","manage_users","view_fair_versions","manage_versions"],architect:["view_dashboard","view_fairs","view_venues","view_fair_detail","view_plan","edit_plan","view_bookings","manage_bookings","approve_bookings","view_fair_users","view_fair_versions","manage_versions"],commercial:["view_dashboard","view_fairs","view_venues","view_fair_detail","view_plan","view_bookings","manage_bookings","approve_bookings","view_fair_versions"],organizer:["view_dashboard","view_fairs","view_fair_detail","view_plan","view_bookings","manage_bookings","view_fair_users","view_fair_versions"],exhibitor:["view_exhibitor_portal","view_bookings","manage_bookings"],viewer:["view_dashboard","view_fairs","view_venues","view_fair_detail","view_plan","view_bookings","manage_bookings","view_fair_users","view_fair_versions"]};function ue(e,a){return he[e].includes(a)}function ve(e){return e==="exhibitor"?"/exhibitor":"/"}const V="fairplan-active-user-id",C="fairplan-active-fair-id",z=s.createContext(void 0);function Ae({children:e}){const[a,o]=s.useState(()=>{if(typeof window>"u")return I.id;const t=window.localStorage.getItem(V);return(t?U.some(f=>f.id===t):!1)&&t?t:I.id}),[i,c]=s.useState(()=>{if(typeof window>"u")return null;const t=window.localStorage.getItem(C);return(t?F.some(f=>f.id===t):!1)&&t?t:null});s.useEffect(()=>{typeof window>"u"||window.localStorage.setItem(V,a)},[a]),s.useEffect(()=>{typeof window>"u"||(i?window.localStorage.setItem(C,i):window.localStorage.removeItem(C))},[i]);const n=U.find(t=>t.id===a)||I,r=Q(n.id),u=n.role==="organizer"?F.filter(t=>t.id===(r==null?void 0:r.fairId)):F,v=n.role==="organizer"?(r==null?void 0:r.fairId)||null:i,d=v&&u.find(t=>t.id===v)||null;s.useEffect(()=>{if(n.role!=="organizer")return;const t=(r==null?void 0:r.fairId)||null;i!==t&&c(t)},[n.role,r==null?void 0:r.fairId,i]);const k=s.useMemo(()=>{const t=n.role,w=()=>{typeof window>"u"||(window.localStorage.removeItem(V),window.localStorage.removeItem(C),window.location.hash="#/login",window.location.reload())};return{activeUserId:n.id,setActiveUserId:o,availableUsers:U,activeUser:n,activeRole:t,can:f=>ue(t,f),isRole:f=>t===f,isInternalUser:t!=="exhibitor",homePath:ve(t),activeFairId:v,setActiveFairId:c,activeFair:d,availableFairs:u,canAccessFair:f=>u.some(m=>m.id===f),logout:w}},[n,v,d,u]);return J.jsx(z.Provider,{value:k,children:e})}function Be(){const e=s.useContext(z);if(!e)throw new Error("useProfile debe usarse dentro de ProfileProvider.");return e}export{me as A,_e as B,Me as C,Se as F,Re as H,Pe as L,ke as N,Ae as P,Ue as R,Ee as S,Te as T,je as U,qe as W,Ce as a,be as b,xe as c,Fe as d,Ie as e,ge as f,Ve as g,Le as h,se as i,Be as u};
