var be=Object.defineProperty,Ae=Object.defineProperties;var Se=Object.getOwnPropertyDescriptors;var q=Object.getOwnPropertySymbols;var oe=Object.prototype.hasOwnProperty,ae=Object.prototype.propertyIsEnumerable;var ne=(t,e,n)=>e in t?be(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,f=(t,e)=>{for(var n in e||(e={}))oe.call(e,n)&&ne(t,n,e[n]);if(q)for(var n of q(e))ae.call(e,n)&&ne(t,n,e[n]);return t},W=(t,e)=>Ae(t,Se(e));var se=(t,e)=>{var n={};for(var a in t)oe.call(t,a)&&e.indexOf(a)<0&&(n[a]=t[a]);if(t!=null&&q)for(var a of q(t))e.indexOf(a)<0&&ae.call(t,a)&&(n[a]=t[a]);return n};import{l as Ce,f as Ne,a as We,b as De,c as Oe,r as d,R as o,C as Re,t as fe,F as $,d as Me}from"./vendor.83369c53.js";import{i as Ie,c as ke,a as re,p as ze,b as Pe,h as _e,X as Fe,d as Te,e as Ue,f as Xe}from"./shared.2af4653f.js";const Be=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function n(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerpolicy&&(i.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?i.credentials="include":r.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(r){if(r.ep)return;r.ep=!0;const i=n(r);fetch(r.href,i)}};Be();/**
 * Xpra Typescript Client Example
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const Le=[Ne,We,De,Oe];Le.forEach(t=>Ce.add(t));/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */function Ye(t){if(t){const{image:e,xhot:n,yhot:a}=t;return`transparent url('${e}') no-repeat ${n}px ${a}px`}return""}function Ve(t,e=""){if(t){const{image:n,xhot:a,yhot:r}=t,i=e?`, ${e}`:"";return`url('${n}') ${a} ${r}${i}`}return e}function ie(t,e,n){let a="";const{width:r,height:i,x:l,y:u}=t.getBoundingClientRect(),m=e[0]-l,c=e[1]-u;return c<=n?a+="n":c>=i-n&&(a+="s"),m<=n?a+="w":m>=r-n&&(a+="e"),a}function le(t){const{onDown:e,onMove:n,onRelease:a}=t();return r=>{r.preventDefault();const i=r.pageX,l=r.pageY;let u=!1;const m=E=>{E.stopPropagation();const S=E.pageX-i,y=E.pageY-l;u=!0,n(E,S,y)},c=E=>{window.removeEventListener("mousemove",m,!0),window.removeEventListener("mouseup",c,!0),a(E,u)};window.addEventListener("mousemove",m,!0),window.addEventListener("mouseup",c,!0),e&&e(r.nativeEvent,i,l)}}function ce({opacity:t}){if(typeof t=="number")return t<0?1:t/4294967296}/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */var v=(t=>(t.SetHost="SET_HOST",t.SetShowOptions="SET_SHOW_OPTIONS",t.AddWindow="ADD_WINDOW",t.RemoveWindow="REMOVE_WINDOW",t.SetWindowIcon="SET_WINDOW_ICON",t.SetConnected="SET_CONNECTED",t.SetCursor="SET_CURSOR",t.UpdateStats="UPDATE_STATS",t.MoveResizeWindow="MOVE_RESIZE_WINDOW",t.MaximizeWindow="MAXIMIZE_WINDOW",t.UpdateMetadata="UPDATE_METADATA",t.RaiseWindow="RAISE_WINDOW",t.AddNotification="ADD_NOTIFICATION",t.RemoveNotification="REMOVE_NOTIFICATION,",t.SetDraggingWindow="SET_DRAGGING_WINDOW",t.ClearWindows="CLEAR_WINDOWS",t.SetOption="SET_OPTION",t.UpdateMenu="UPDATE_MENU",t.SetError="SET_ERROR",t.SetStarted="SET_STARTED",t))(v||{});let de=1;const Q={connect:!1,host:"ws://127.0.0.1:10000",showOptions:!1,connected:!1,cursor:null,windows:[],notifications:[],activeWindow:0,draggingWindow:-1,actualDesktopSize:[0,0],stats:f({},Ie),options:f({},ke()),menu:[],error:"",started:!1};function Ge(t,e){var a,r;const n=(i,l)=>{const u=t.windows,m=u.find(c=>c.id===i);return m&&Object.assign(m,l(m)),W(f({},t),{windows:u})};switch(e.type){case"SET_HOST":return W(f({},t),{host:e.payload});case"SET_SHOW_OPTIONS":return W(f({},t),{showOptions:e.payload});case"ADD_WINDOW":const i=!!e.payload.metadata.tray;return W(f({},t),{activeWindow:e.payload.id,windows:[...t.windows,{id:e.payload.id,minimized:e.payload.metadata.iconic===!0,maximized:!1,title:e.payload.metadata.title||String(e.payload.id),position:e.payload.position,dimension:e.payload.dimension,minDimension:(a=e.payload.metadata["size-constraints"])==null?void 0:a["minimum-size"],maxDimension:(r=e.payload.metadata["size-constraints"])==null?void 0:r["maximum-size"],opacity:ce(e.payload.metadata),tray:i,zIndex:i?0:re(e.payload,++de)}]});case"REMOVE_WINDOW":const{windows:l}=t,u=l.findIndex(D=>D.id===e.payload);u!==-1&&l.splice(u,1);const m=l.length>0?l[l.length-1].id:0;return W(f({},t),{activeWindow:m,windows:l});case"SET_WINDOW_ICON":const c=e.payload;return n(c.wid,()=>({icon:c}));case"SET_CONNECTED":return W(f({},t),{started:!1,windows:e.payload?t.windows:[],connected:e.payload});case"SET_CURSOR":return W(f({},t),{cursor:e.payload});case"UPDATE_STATS":return W(f({},t),{stats:f(f({},t.stats),e.payload)});case"MOVE_RESIZE_WINDOW":const{wid:E,position:S,dimension:y}=e.payload;return n(E,D=>({position:S||D.position,dimension:y||D.dimension}));case"MAXIMIZE_WINDOW":const{maximize:x}=e.payload;return n(e.payload.wid,D=>({oldPosition:x?D.position:void 0,oldDimension:x?D.dimension:void 0,position:x?e.payload.position:D.oldPosition,dimension:x?e.payload.dimension:D.oldDimension,maximized:x}));case"UPDATE_METADATA":const{title:s,iconic:g}=e.payload.metadata;return n(e.payload.wid,D=>({opacity:ce(e.payload.metadata),minimized:g===void 0?D.minimized:g===!0,title:s===void 0?D.title:s}));case"RAISE_WINDOW":return W(f({},n(e.payload.id,()=>({zIndex:re(e.payload,++de)}))),{activeWindow:e.payload.id});case"ADD_NOTIFICATION":return W(f({},t),{notifications:[...t.notifications,e.payload]});case"REMOVE_NOTIFICATION,":const{notifications:b}=t,I=b.findIndex(([D])=>D.id===e.payload);return I!==-1&&b.splice(I,1),W(f({},t),{notifications:b});case"SET_DRAGGING_WINDOW":return W(f({},t),{draggingWindow:e.payload});case"CLEAR_WINDOWS":return W(f({},t),{cursor:null,windows:[],notifications:[],draggingWindow:-1});case"SET_OPTION":const[R,C]=e.payload;return W(f({},t),{options:W(f({},t.options),{[R]:C})});case"UPDATE_MENU":return W(f({},t),{menu:e.payload});case"SET_ERROR":return W(f({},t),{error:e.payload});case"SET_STARTED":return W(f({},t),{started:e.payload});default:return t}}/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const T=d.exports.createContext({wm:null,xpra:null,state:Q,root:null,setRoot:()=>{},setCursor:()=>{},dispatch:()=>{}}),He=ze({booleans:["connect"],required:["connect","host"]}),Ze=Pe(),Ke=W(f(f({},Q),He),{options:f(f({},Q.options),Ze)}),qe=({children:t,wm:e,xpra:n})=>{const[a,r]=d.exports.useReducer(Ge,Ke),[i,l]=d.exports.useState(null),[u,m]=d.exports.useState(null),c=()=>{r({type:v.SetConnected,payload:!0}),r({type:v.SetError,payload:""})},E=p=>{r({type:v.SetConnected,payload:p!=="disconnected"}),r({type:v.ClearWindows})},S=p=>r({type:v.AddWindow,payload:p}),y=p=>r({type:v.RemoveWindow,payload:p}),x=p=>r({type:v.SetWindowIcon,payload:p}),s=p=>r({type:v.UpdateStats,payload:p}),g=p=>r({type:v.SetCursor,payload:p}),b=p=>r({type:v.MoveResizeWindow,payload:p}),I=p=>{const _=e.getWindow(p);_&&r({type:v.RaiseWindow,payload:_.attributes})},R=p=>r({type:v.UpdateMetadata,payload:p}),C=p=>{},D=async p=>r({type:v.AddNotification,payload:[p,await e.createNotification(p)]}),Z=p=>r({type:v.RemoveNotification,payload:p}),Y=p=>{if(u){const[_,L]=p.position;Object.assign(u.style,{left:`${_}px`,top:`${L}px`})}},U=p=>r({type:v.SetError,payload:p}),V=p=>r({type:v.UpdateMenu,payload:p}),G=()=>r({type:v.SetStarted,payload:!0}),H=(p,_)=>{if(p.digest.startsWith("keycloak"))_e(p,_);else{const L=prompt("Login password");_(L||"")}};return d.exports.useEffect(()=>(n.on("connect",c),n.on("disconnect",E),n.on("newWindow",S),n.on("removeWindow",y),n.on("windowIcon",x),n.on("pong",s),n.on("cursor",g),n.on("moveResizeWindow",b),n.on("updateWindowMetadata",R),n.on("raiseWindow",I),n.on("initiateMoveResize",C),n.on("showNotification",D),n.on("hideNotification",Z),n.on("pointerPosition",Y),n.on("newTray",S),n.on("updateXDGMenu",V),n.on("error",U),n.on("sessionStarted",G),n.on("challengePrompt",H),()=>{n.off("connect",c),n.off("disconnect",E),n.off("newWindow",S),n.off("removeWindow",y),n.off("windowIcon",x),n.off("pong",s),n.off("cursor",g),n.off("moveResizeWindow",b),n.off("updateWindowMetadata",R),n.off("raiseWindow",I),n.off("initiateMoveResize",C),n.off("showNotification",D),n.off("hideNotification",Z),n.off("pointerPosition",Y),n.off("newTray",S),n.off("updateXDGMenu",V),n.off("error",U),n.off("sessionStarted",G),n.off("challengePrompt",H)}),[]),d.exports.useEffect(()=>{a.connect&&n.connect(a.host,a.options)},[]),d.exports.useEffect(()=>{e.setDesktopElement(i)},[i]),d.exports.useEffect(()=>{e.setActiveWindow(a.activeWindow)},[a.activeWindow]),o.createElement(T.Provider,{value:{state:a,dispatch:r,root:i,wm:e,xpra:n,setRoot:l,setCursor:m}},t)};/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const je=300,B=({toggled:t,children:e,mountOnEnter:n=!0,unmountOnExit:a=!0})=>o.createElement(Re,{in:t,timeout:je,mountOnEnter:n,unmountOnExit:a,classNames:"fade-on-out"},e);var $e="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAASdAAAEnQB3mYfeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAUdEVYdEF1dGhvcgBKYWt1YiBTdGVpbmVy5vv3LwAAADV0RVh0RGVzY3JpcHRpb24ASW52ZXJ0ZWQgdmFyaWFudCBvZiB0aGUgRE1aIGN1cnNvciB0aGVtZS5odVs8AAAAM3RFWHRTb3VyY2UAaHR0cDovL2ppbW1hYy5tdXNpY2hhbGwuY3ovdGhlbWVzLnBocD9za2luPTdQM5WxAAADwUlEQVRYhe2WTUhsZRjHf+PVcdLU48d1GkMvdwI185ZIzEYpaKttWqhcKhlFF65USjcK6equNFJbCEokiISiochQgfmBaI6CKGmg5MeIwpBXZpIRPec8LWb0Wte6c1SsRX94eDcvvD+er/8L/+sFEpFX/833o3Vd9zc3N78FxAIRdw0QKyISCAT8xcXFDuDlu4aIl5D8fr+voKDgbe44E/EiIu3t7eL3+8Xn8x3l5ua+GYIw3RlAeXm5FBUVSSAQEJ/Pd2i32x8BMbcBEVYqdV1nfn4ep9OJxWJJXFpa+t5msz0AXropRFgAmqahqiqTk5NUVVURGxtrXV1ddQFpgOUmEIYAVFVlYmKCuro6FEXJ8Hq93wE2IPq6EGEBiMgFgKqquFwuGhoaSE5Ofri/v/8t8Mp1IcIep8sAqqoyPj5Oa2srVqs1d29vbwiwAmajENcGUFWV4eFh2traSEtLy9/Z2fkGSDUKYWihXAUxMDBAZ2cn6enpjo2Nja+A+0YgDANcbsjz6O/vp6+vD7vd/t7a2tqXQAoQFQ6EIYC/NuPl6OnpYXBwkKysrPdXVla+CBfC8E6/6vHzrHR3dzM8PExOTs4HCwsLT4BkIPKfICKNAlwuAYDD4cBisWA2m4mOjmZxcZG8vDzy8/M/mpmZ+b2wsPAz4ClwZvQtCHlBSUmJABcRGRkpcXFxYrVaxe12y99J13WZnp5+Aii3lgGAsrIyxsbGUFWVrq4uent76ejo+GFoaOgns9l8bDKZxGQy6WazOSAivxJcUtfScxmora0VXdelpqZGEhISxGazyebmpni93qdAEfA6YAceAg8ILqiYWwFoaGgQXdfl9PRU9Xg8oiiKpKSkSH19vWiaJk1NTY0EvcEM3AtFBDcwqwuAxsZGERFZXFxcdzqdn2uaJtXV1aIoimRkZMjBwYEcHBx4gDe4oUM+BzA3Nye6rsvs7OwK8DFQcHR05Nna2hJFUSQ1NVVaWlpEVVWprKysIDh+t/Jtiz/v5qmpqSXgQ+ARkDw6OvpY0zSpqKiQpKQkyczMlOPjY1leXp4DXiO4hG4HYH5+/kegDMgF4ghOj+L3+/c2NjYkMTFRsrOz5fDwUNbX138OQd5KGWJ3d3e/Bt4Bsnn2LTcBUS6X6/HZ2Zlsb29LIBCQk5MTvbS0tCV017A1X6UoIJGgw8Xw57qagPiRkZFPPB7PL2632+1wOD4F3iXoA2H1wIsITQRHSQA9dF7WPYIluU/wg3oC/Ab4APWK+4YBwlEEz2ZeC8X54vrv6w+aYEf+AZkZtAAAAABJRU5ErkJggg==";/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const ue=16;let pe=!1;const Qe=({win:t,bar:e,winstance:n})=>{const{oldPosition:a,oldDimension:r}=t,{wm:i,xpra:l,root:u,dispatch:m}=d.exports.useContext(T),c="w-4 h-4 rounded-full cursor-pointer bg-gradient-to-b shadow-inner hover:shadow",E=y=>{y.stopPropagation(),y.preventDefault()},S=()=>{if(e.current&&u)if(t.maximized)a&&r&&(i.maximize(n,a,r),m({type:v.MaximizeWindow,payload:{wid:t.id,maximize:!1}}));else{const x=e.current.offsetHeight,s=u.offsetWidth,g=u.offsetHeight-x;i.maximize(n,[0,x],[s,g]),m({type:v.MaximizeWindow,payload:{wid:t.id,position:[0,x],dimension:[s,g],maximize:!0}})}};return o.createElement("div",{className:"flex items-center space-x-2",onMouseDown:E},o.createElement("div",{title:"Minimize",className:`${c} from-green-300 to-green-500 hover:from-green-400`,onClick:()=>i.minimize(n)}),o.createElement("div",{title:"Maximize",className:`${c} from-blue-300 to-blue-500 hover:from-blue-400`,onClick:S}),!l.isReadOnly()&&o.createElement("div",{title:"Close",className:`${c} from-red-300 to-red-500 hover:from-red-400`,onClick:()=>i.close(n)}))},Ee=({win:{icon:t,title:e}})=>o.createElement(o.Fragment,null,t&&o.createElement("img",{alt:e,src:t.image,className:"max-h-full"}),!t&&o.createElement("div",{className:"w-full h-full bg-gray-500 rounded"})),J=({id:t})=>{const e=d.exports.useRef(null),{wm:n,state:a}=d.exports.useContext(T),r=n.getWindow(t),i=a.draggingWindow>=0?"pointer-events-none":"",l=c=>{n.mouseButton(r,c.nativeEvent,!0)},u=c=>{c.stopPropagation(),n.mouseButton(r,c.nativeEvent,!1)},m=c=>{c.preventDefault(),c.stopPropagation(),n.mouseMove(r,c.nativeEvent)};return d.exports.useEffect(()=>{e.current&&e.current.appendChild(r.canvas)},[e.current]),o.createElement("div",{ref:e,className:i,onMouseDown:l,onMouseUp:u,onMouseMove:m})},Je=({win:t})=>{var te;const{id:e,position:n,dimension:a,title:r,minimized:i,maximized:l,opacity:u,zIndex:m,minDimension:c,maxDimension:E}=t,[S,y]=d.exports.useState("default"),{wm:x,dispatch:s,xpra:g}=d.exports.useContext(T),b=d.exports.useRef(null),I=d.exports.useRef(null),R=d.exports.useRef(null),C=x.getWindow(e),D={opacity:u,zIndex:m},Z={cursor:S},Y={toggled:!i,mountOnEnter:!1,unmountOnExit:!1},U=(w,N,A,h,O=!1)=>{b.current&&Object.assign(b.current.style,{left:`${w}px`,top:`${N}px`,width:`${A}px`,height:`${h}px`}),C!=null&&C.canvas&&Object.assign(C.canvas.style,{width:`${A}px`,height:`${h}px`}),O&&s({type:v.MoveResizeWindow,payload:{wid:e,position:[w,N],dimension:[A,h]}})},V=(w=!1)=>{const[N,A]=n,[h,O]=a;U(N,A,h,O,w)},G=w=>(N,A,h,O,k)=>{const[z,P]=c||[100,100],[F,K]=E||[Number.MAX_VALUE,Number.MAX_VALUE];h=Math.min(F,Math.max(z,h)),O=Math.min(K,Math.max(P,O)),w(N,A,h,O,k)},H=G((w,N,A,h)=>{!g.isReadOnly()&&!l&&U(w,N,A,h),_(!0)}),p=G((w,N,A,h,O)=>{_(!1),!g.isReadOnly()&&!l&&(U(w,N,A,h,!0),O&&x.moveResize(C,[w,N],[A,h]))}),_=w=>{(!w||!pe)&&s({type:v.SetDraggingWindow,payload:w?e:-1}),pe=w},L=w=>{w.preventDefault(),w.stopPropagation(),x.raise(C),s({type:v.RaiseWindow,payload:C.attributes})},ve=fe(w=>{if(R.current){const N=ie(R.current,[w.pageX,w.pageY],ue);y(`${N}-resize`)}else y("default")},100),he=d.exports.useCallback(le(()=>{const[w,N]=a;let[A,h]=n,O=0;return{onDown(){var k;O=((k=I.current)==null?void 0:k.offsetHeight)||0},onMove(k,z,P){A=n[0]+z,h=Math.max(O,n[1]+P),H(A,h,w,N),_(!0)},onRelease(k,z){p(A,h,w,N,z)}}}),[n,a]),xe=d.exports.useCallback(le(()=>{let w="",N=0,[A,h]=n,[O,k]=a;return{onDown(z,P,F){var K;z.stopPropagation(),R.current&&(w=ie(R.current,[P,F],ue),N=((K=I.current)==null?void 0:K.offsetHeight)||0)},onMove(z,P,F){w.startsWith("n")?(h=n[1]+F,h>N?k=a[1]-F:h=N):w.startsWith("s")&&(k=a[1]+F),w.endsWith("w")?(O=a[0]-P,A=n[0]+P):w.endsWith("e")&&(O=a[0]+P),H(A,h,O,k)},onRelease(z,P){p(A,h,O,k,P)}}}),[R,n,a]);return d.exports.useEffect(()=>{V()},[n,a]),d.exports.useEffect(()=>{V()},[b]),d.exports.useEffect(()=>{var O,k;if((O=C==null?void 0:C.attributes)!=null&&O.overrideRedirect)return;const[w,N]=n,[A,h]=a;if(!g.isReadOnly()){const z=((k=I.current)==null?void 0:k.offsetHeight)||0;if(w<=0||N<=z){const F=z;x.moveResize(C,[100,F],[A,h]),U(100,F,A,h,!0)}}},[]),(te=C==null?void 0:C.attributes)!=null&&te.overrideRedirect?o.createElement(B,f({},Y),o.createElement("div",{className:"absolute bg-black cursor-default shadow",ref:b,style:D,onMouseDown:L},o.createElement(J,{id:e}))):o.createElement(B,f({},Y),o.createElement("div",{ref:b,style:D,className:"absolute",onMouseDown:L,onMouseMove:ve},o.createElement("div",{ref:R,className:"absolute z-10 -left-2 -top-10 -bottom-2 -right-2",style:Z,onMouseDown:xe}),o.createElement("div",{className:"relative w-full h-full z-20 outline outline-1 outline-gray-200 shadow-xl"},o.createElement("div",{className:"absolute -top-8 w-full flex items-center p-1 px-2 h-8 space-x-2 outline outline-1 outline-gray-200 bg-gray-100 cursor-default",ref:I,onMouseDown:he},o.createElement("div",{className:"flex items-center justify-center",style:{width:"16px",height:"16px"}},o.createElement(Ee,{win:t})),o.createElement("div",{className:"flex-grow truncate text-sm"},o.createElement("span",null,r||e)),o.createElement(Qe,{winstance:C,win:t,bar:I,outer:b})),o.createElement("div",{className:"xpra-window-canvas w-full h-full bg-black"},o.createElement(J,{id:e})))))},et=({children:t})=>{const e=d.exports.createRef(),n=d.exports.createRef(),{wm:a,state:r,setRoot:i,setCursor:l}=d.exports.useContext(T),u=fe(s=>{a.mouseMove(null,s.nativeEvent)},200),m=s=>{s.preventDefault()},c=d.exports.useCallback(s=>{a.mouseButton(null,s,!0)},[]),E=d.exports.useCallback(s=>{a.mouseButton(null,s,!1)},[]),S=f({dimension:[32,32],xhot:8,yhot:3,image:$e},r.cursor||{}),y=`
.xpra-cursor {
  background: ${Ye(S)};
}

.xpra-window-canvas {
  cursor: ${Ve(r.cursor,"default")};
}
`,x=r.windows.filter(s=>!s.tray);return d.exports.useEffect(()=>{const s=e.current,g=b=>{s&&(s.contains(b.target)||s===b.target)&&document.activeElement&&document.activeElement.blur()};return s&&(i(s),s.addEventListener("click",g,!0)),()=>{s&&s.removeEventListener("click",g,!0)}},[e.current]),d.exports.useEffect(()=>{n.current&&l(n.current)},[n.current]),o.createElement(o.Fragment,null,o.createElement("div",{id:"xpra-desktop",className:"absolute inset-0 z-30 overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-300 to-emerald-500",ref:e,onMouseMove:u,onContextMenu:m,onMouseDown:c,onMouseUp:E},r.connected&&x.map(s=>o.createElement(Je,{key:s.id,win:s})),t),o.createElement("div",{ref:n,className:"xpra-cursor absolute z-50"}),o.createElement("style",null,y))};/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */let we=1;const me=({disabled:t,label:e,value:n,required:a,options:r,onChange:i})=>{const l=`xpra_${++we}`,u="rounded bg-white border border-black-100 w-full p-1 px-2 disabled:opacity-40 disabled:cursor-not-allowed";return o.createElement("div",null,e&&o.createElement("label",{htmlFor:l},e),o.createElement("div",null,o.createElement("select",{className:u,id:l,required:a,disabled:t,defaultValue:n,onChange:i},Object.entries(r).map(([m,c])=>o.createElement("option",{key:m,value:m},c)))))},X=({children:t,disabled:e,label:n,type:a,transparent:r,onClick:i})=>{let l="flex items-center justify-center relative rounded w-full p-1 px-2 disabled:opacity-40 disabled:cursor-not-allowed hover:outline hover:outline-1";return r?l+=" border border border-transparent":l+=" bg-white border border-black-100",o.createElement("button",{className:l,disabled:e,type:a||"button",onClick:i},n||t)},j=({disabled:t,label:e,value:n,type:a,placeholder:r,required:i,onChange:l})=>{const u=`xpra_${++we}`,m="rounded bg-white border border-black-100 w-full p-1 px-2 disabled:opacity-40 disabled:cursor-not-allowed";return o.createElement("div",null,e&&o.createElement("label",{htmlFor:u},e),o.createElement("div",null,o.createElement("input",{type:a||"text",className:m,id:u,placeholder:r,required:i,disabled:t,defaultValue:n,onInput:l})))},M=({label:t,value:e,onChange:n})=>o.createElement("div",{className:"select-none"},o.createElement("label",{className:"inline-flex items-center space-x-2 cursor-pointer"},o.createElement("input",{type:"checkbox",defaultChecked:e,onChange:n}),o.createElement("span",null,t)));/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const tt=["shadow-lg","bg-emerald-100/50","opacity-90","rounded"],ge=(...t)=>t.join(" "),ye=({items:t,onCallback:e=()=>{},root:n=!0})=>{const a=d.exports.useRef(null),[r,i]=d.exports.useState(-1),l=["max-h-96","max-w-xs"];n?l.push("top-full","left-0"):l.push("top-0","left-full","overflow-auto");const u=E=>i(E),m=()=>i(-1),c=E=>{E&&E(),e()};if(n){const E=S=>{if(a.current){const y=S.target;y&&(a.current.contains(y)||y===a.current.parentNode)||c()}};d.exports.useEffect(()=>(document.addEventListener("click",E),()=>{document.removeEventListener("click",E)}),[a])}return o.createElement("div",{ref:a,className:ge("absolute","shadow","bg-emerald-100/80",...l),onMouseLeave:m},t.map(({icon:E,title:S,items:y,callback:x},s)=>o.createElement("div",{key:s,className:"relative text-left"},o.createElement("div",{className:"p-2 hover:bg-white truncate flex space-x-2 items-center",onClick:()=>c(x),onMouseOver:()=>u(s)},E&&o.createElement("img",{src:E,className:"w-4 h-4"}),o.createElement("span",{className:"flex-grow"},S),y&&y.length&&o.createElement($,{icon:"chevron-right"})),r===s&&y&&y.length>0&&o.createElement(ye,{root:!1,items:y}))))},ee=({classNames:t,children:e})=>{const n=ge("absolute","z-50",...tt,...t),a=r=>{r.preventDefault()};return o.createElement("div",{className:n,onContextMenu:a},e)},nt=()=>{const{xpra:t,state:e,dispatch:n}=d.exports.useContext(T),a=e.showOptions?"Hide options":"Show options",r=(s,g)=>n({type:v.SetOption,payload:[s,g]}),i=Object.fromEntries(["CBC","CFB","CTR"].map(s=>`AES-${s}`).map(s=>[s,s])),l=[{key:"reconnect",label:"Automatically reconnect",component:M},{key:"shareSession",label:"Share Session",component:M},{key:"stealSession",label:"Steal Session",component:M},{key:"clipboard",label:"Clipboard",component:M},{key:"clipboardImages",label:"Clipboard Images",component:M},{key:"fileTransfer",label:"File Transfer",component:M},{key:"printing",label:"Printing",component:M},{key:"bell",label:"Bell",component:M},{key:"notifications",label:"Notifications",component:M},{key:"openUrl",label:"Open URLs",component:M},{key:"audio",label:"Audio",component:M},{key:"showStartMenu",label:"XDG Menu",component:M},{key:"swapKeys",label:"Swap Ctrl and Cmd key",component:M},{key:"reverseScrollX",label:"Reverse X scroll",component:M},{key:"reverseScrollY",label:"Reverse Y scroll",component:M},{key:"keyboardLayout",label:"Keyboard Layout",component:me,options:Fe}].map(s=>W(f({},s),{value:e.options[s.key],onChange:g=>r(s.key,g.target.value)})),u=s=>n({type:v.SetHost,payload:s.target.value}),m=s=>r("username",s.target.value),c=s=>r("password",s.target.value),E=s=>r("encryption",s.target.value||null),S=s=>r("encryptionKey",s.target.value),y=s=>{s.preventDefault(),n({type:v.SetError,payload:""}),t.connect(e.host,e.options)},x=()=>n({type:v.SetShowOptions,payload:!e.showOptions});return o.createElement(ee,{classNames:["p-8","top-1/2","left-1/2 transform","-translate-x-1/2","-translate-y-1/2","w-11/12","max-w-xl","max-h-full","overflow-auto"]},o.createElement("form",{className:"space-y-4",onSubmit:y},o.createElement("div",{className:"space-y-2"},o.createElement(j,{required:!0,placeholder:"Host",value:e.host,onChange:u}),o.createElement("div",{className:"grid gap-2 grid-cols-2"},o.createElement(j,{placeholder:"Username",value:e.options.username,onChange:m}),o.createElement(j,{type:"password",placeholder:"Password",value:e.options.password,onChange:c}),o.createElement(me,{value:e.options.encryption||"",options:f({"":"No encryption"},i),onChange:E}),o.createElement(j,{type:"password",placeholder:"Encryption key",value:e.options.encryptionKey,onChange:S}))),e.error&&o.createElement("div",{className:"bg-red-300 border border-red-500 text-red-500 p-2 rounded"},e.error),o.createElement("div",{className:"flex space-x-2"},o.createElement(X,{label:"Connect",type:"submit"}),o.createElement(X,{label:a,onClick:x})),o.createElement(B,{toggled:e.showOptions},o.createElement("div",{className:"px-2 text-sm"},l.map(I=>{var R=I,{component:s,key:g}=R,b=se(R,["component","key"]);const C=s;return o.createElement(C,f({key:g},b))})))))},ot=()=>{const{state:t}=d.exports.useContext(T),e=[["Last server ping",t.stats.lastServerPing],["Last client echo",t.stats.lastClientEcho],["Client ping latency",t.stats.clientPingLatency],["Server ping latency",t.stats.serverPingLatency],["Server load",t.stats.serverLoad.join(" / ")],["Window count",t.windows.length]];return o.createElement("div",{className:"absolute bottom-1 left-1 p-1 z-0 opacity-50 bg-emerald-100 rounded"},o.createElement("table",{className:"text-xs"},o.createElement("tbody",null,e.map(([n,a])=>o.createElement("tr",{key:n},o.createElement("td",{className:"p-1"},n),o.createElement("td",{className:"p-1 text-right text-gray-500"},a))))))},at=()=>{const{wm:t,state:e,dispatch:n,xpra:a}=d.exports.useContext(T),[r,i]=d.exports.useState(!1),l=e.windows.filter(s=>s.minimized),u=e.windows.filter(s=>s.tray),m=[...e.menu.map(s=>({title:s.name,icon:s.icon,items:s.entries.map(g=>({title:g.name,icon:g.icon,callback:()=>{a.sendStartCommand(g.name,g.exec,!1)}}))})),{title:"Server",items:[{title:"Shutdown server",callback:()=>{confirm("Are you sure you want to shut down the server ?")&&a.sendShutdown()}}]},{title:"Disconnect",callback:()=>a.disconnect()}],c=s=>g=>{g.stopPropagation(),g.preventDefault();const b=t.getWindow(s.id);b&&(t.restore(b),t.raise(b),n({type:v.RaiseWindow,payload:b.attributes}))},E=()=>i(!r),S=()=>{i(!1)},y=()=>a.clipboard.poll(),x=async()=>{(await Te()).forEach(({buffer:g,name:b,size:I,type:R})=>a.sendFile(b,R,I,g))};return o.createElement(ee,{classNames:["top-1","left-1/2","-translate-x-1/2","p-1","select-none"]},o.createElement("div",{className:"flex space-x-4 px-2"},o.createElement("div",{className:"flex space-x-1"},o.createElement(X,{transparent:!0,onClick:E},o.createElement($,{icon:"bars",className:"pointer-events-none"}),o.createElement(B,{toggled:r},o.createElement(ye,{items:m,onCallback:S}))),e.options.clipboard&&o.createElement(X,{transparent:!0,onClick:y},o.createElement($,{icon:"clipboard"})),e.options.fileTransfer&&o.createElement(X,{transparent:!0,onClick:x},o.createElement($,{icon:"upload"}))),l.length>0&&o.createElement("div",{className:"flex space-x-1"},l.map(s=>o.createElement(X,{key:s.id,transparent:!0,onClick:c(s)},o.createElement("div",{className:"flex space-x-1 items-center",style:{maxWidth:"128px"}},o.createElement("div",{className:"w-4 h-4"},o.createElement(Ee,{win:s})),o.createElement("div",{className:"truncate text-center text-sm"},s.title))))),u.length>0&&o.createElement("div",{className:"flex space-x-1"},u.map(s=>o.createElement("div",{key:s.id,className:"flex space-x-1 items-center"},o.createElement("div",{className:"flex items-center justify-center w-4 h-4 overflow-hidden",title:s.title},o.createElement(J,{id:s.id})))))))},st=()=>{const{state:t,xpra:e}=d.exports.useContext(T),n=()=>e.disconnect();return o.createElement(ee,{classNames:["p-8","top-1/2","left-1/2 transform","-translate-x-1/2","-translate-y-1/2","w-96"]},o.createElement("div",{className:"space-y-4"},o.createElement("div",{className:"text-center"},"Connecting to ",t.host),o.createElement("div",null,o.createElement(X,{onClick:n},"Cancel"))))};/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */function rt(){const{state:t,xpra:e}=d.exports.useContext(T),n=e.getOptions().showStatistics;return o.createElement(o.Fragment,null,o.createElement(B,{toggled:!t.connected},o.createElement(nt,null)),o.createElement(B,{toggled:!t.started&&t.connected},o.createElement(st,null)),o.createElement(et,null,t.connected&&n&&o.createElement(ot,null)),o.createElement(B,{toggled:t.started},o.createElement(at,null)),o.createElement("div",{className:"fixed z-50 bottom-0 right-0 text-xs text-right opacity-50 p-2"},o.createElement("a",{className:"underline",rel:"noreferrer",target:"_blank",href:"https://github.com/andersevenrud/xpra-html5-client"},"xpra-html5-client on Github")))}function it({xpra:t,wm:e}){return o.createElement(qe,{wm:e,xpra:t},o.createElement(rt,null))}function lt(){return new Worker("assets/worker.f70d85e3.js",{type:"module"})}/**
 * Xpra Typescript Client Example
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */async function ct(){const t=document.querySelector("#app"),e=new lt,n=new Ue({worker:e}),a=new Xe(n);await n.init(),a.init(),t&&Me.render(d.exports.createElement(it,{xpra:n,wm:a}),t)}window.addEventListener("DOMContentLoaded",()=>{ct()});
//# sourceMappingURL=index.2591b28a.js.map
