var xe=Object.defineProperty,Ae=Object.defineProperties;var be=Object.getOwnPropertyDescriptors;var K=Object.getOwnPropertySymbols;var ne=Object.prototype.hasOwnProperty,oe=Object.prototype.propertyIsEnumerable;var te=(t,e,n)=>e in t?xe(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,m=(t,e)=>{for(var n in e||(e={}))ne.call(e,n)&&te(t,n,e[n]);if(K)for(var n of K(e))oe.call(e,n)&&te(t,n,e[n]);return t},W=(t,e)=>Ae(t,be(e));var ae=(t,e)=>{var n={};for(var a in t)ne.call(t,a)&&e.indexOf(a)<0&&(n[a]=t[a]);if(t!=null&&K)for(var a of K(t))e.indexOf(a)<0&&oe.call(t,a)&&(n[a]=t[a]);return n};import{r as d,R as o,C as Ne,t as me,a as Se}from"./vendor.f519d7b4.js";import{i as Ce,c as We,a as se,p as De,b as Oe,X as Re,d as Me,e as Ie,f as ke}from"./shared.767b9c3f.js";const ze=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerpolicy&&(i.referrerPolicy=s.referrerpolicy),s.crossorigin==="use-credentials"?i.credentials="include":s.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}};ze();/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */function Pe(t){if(t){const{image:e,xhot:n,yhot:a}=t;return`transparent url('${e}') no-repeat ${n}px ${a}px`}return""}function _e(t,e=""){if(t){const{image:n,xhot:a,yhot:s}=t,i=e?`, ${e}`:"";return`url('${n}') ${a} ${s}${i}`}return e}function re(t,e,n){let a="";const{width:s,height:i,x:l,y:u}=t.getBoundingClientRect(),p=e[0]-l,c=e[1]-u;return c<=n?a+="n":c>=i-n&&(a+="s"),p<=n?a+="w":p>=s-n&&(a+="e"),a}function ie(t){const{onDown:e,onMove:n,onRelease:a}=t();return s=>{s.preventDefault();const i=s.pageX,l=s.pageY;let u=!1;const p=f=>{f.stopPropagation();const b=f.pageX-i,y=f.pageY-l;u=!0,n(f,b,y)},c=f=>{window.removeEventListener("mousemove",p,!0),window.removeEventListener("mouseup",c,!0),a(f,u)};window.addEventListener("mousemove",p,!0),window.addEventListener("mouseup",c,!0),e&&e(s.nativeEvent,i,l)}}function le({opacity:t}){if(typeof t=="number")return t<0?1:t/4294967296}/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */var v=(t=>(t.SetHost="SET_HOST",t.SetShowOptions="SET_SHOW_OPTIONS",t.AddWindow="ADD_WINDOW",t.RemoveWindow="REMOVE_WINDOW",t.SetWindowIcon="SET_WINDOW_ICON",t.SetConnected="SET_CONNECTED",t.SetCursor="SET_CURSOR",t.UpdateStats="UPDATE_STATS",t.MoveResizeWindow="MOVE_RESIZE_WINDOW",t.MaximizeWindow="MAXIMIZE_WINDOW",t.UpdateMetadata="UPDATE_METADATA",t.RaiseWindow="RAISE_WINDOW",t.AddNotification="ADD_NOTIFICATION",t.RemoveNotification="REMOVE_NOTIFICATION,",t.SetDraggingWindow="SET_DRAGGING_WINDOW",t.ClearWindows="CLEAR_WINDOWS",t.SetOption="SET_OPTION",t.UpdateMenu="UPDATE_MENU",t.SetError="SET_ERROR",t.SetStarted="SET_STARTED",t))(v||{});let ce=1;const j={connect:!1,host:"ws://127.0.0.1:10000",showOptions:!1,connected:!1,cursor:null,windows:[],notifications:[],activeWindow:0,draggingWindow:-1,actualDesktopSize:[0,0],stats:m({},Ce),options:m({},We()),menu:[],error:"",started:!1};function Te(t,e){var a,s;const n=(i,l)=>{const u=t.windows,p=u.find(c=>c.id===i);return p&&Object.assign(p,l(p)),W(m({},t),{windows:u})};switch(e.type){case"SET_HOST":return W(m({},t),{host:e.payload});case"SET_SHOW_OPTIONS":return W(m({},t),{showOptions:e.payload});case"ADD_WINDOW":const i=!!e.payload.metadata.tray;return W(m({},t),{activeWindow:e.payload.id,windows:[...t.windows,{id:e.payload.id,minimized:e.payload.metadata.iconic===!0,maximized:!1,title:e.payload.metadata.title||String(e.payload.id),position:e.payload.position,dimension:e.payload.dimension,minDimension:(a=e.payload.metadata["size-constraints"])==null?void 0:a["minimum-size"],maxDimension:(s=e.payload.metadata["size-constraints"])==null?void 0:s["maximum-size"],opacity:le(e.payload.metadata),tray:i,zIndex:i?0:se(e.payload,++ce)}]});case"REMOVE_WINDOW":const{windows:l}=t,u=l.findIndex(D=>D.id===e.payload);u!==-1&&l.splice(u,1);const p=l.length>0?l[l.length-1].id:0;return W(m({},t),{activeWindow:p,windows:l});case"SET_WINDOW_ICON":const c=e.payload;return n(c.wid,()=>({icon:c}));case"SET_CONNECTED":return W(m({},t),{started:!1,windows:e.payload?t.windows:[],connected:e.payload});case"SET_CURSOR":return W(m({},t),{cursor:e.payload});case"UPDATE_STATS":return W(m({},t),{stats:m(m({},t.stats),e.payload)});case"MOVE_RESIZE_WINDOW":const{wid:f,position:b,dimension:y}=e.payload;return n(f,D=>({position:b||D.position,dimension:y||D.dimension}));case"MAXIMIZE_WINDOW":const{maximize:x}=e.payload;return n(e.payload.wid,D=>({oldPosition:x?D.position:void 0,oldDimension:x?D.dimension:void 0,position:x?e.payload.position:D.oldPosition,dimension:x?e.payload.dimension:D.oldDimension,maximized:x}));case"UPDATE_METADATA":const{title:r,iconic:g}=e.payload.metadata;return n(e.payload.wid,D=>({opacity:le(e.payload.metadata),minimized:g===void 0?D.minimized:g===!0,title:r===void 0?D.title:r}));case"RAISE_WINDOW":return W(m({},n(e.payload.id,()=>({zIndex:se(e.payload,++ce)}))),{activeWindow:e.payload.id});case"ADD_NOTIFICATION":return W(m({},t),{notifications:[...t.notifications,e.payload]});case"REMOVE_NOTIFICATION,":const{notifications:N}=t,I=N.findIndex(([D])=>D.id===e.payload);return I!==-1&&N.splice(I,1),W(m({},t),{notifications:N});case"SET_DRAGGING_WINDOW":return W(m({},t),{draggingWindow:e.payload});case"CLEAR_WINDOWS":return W(m({},t),{cursor:null,windows:[],notifications:[],draggingWindow:-1});case"SET_OPTION":const[R,S]=e.payload;return W(m({},t),{options:W(m({},t.options),{[R]:S})});case"UPDATE_MENU":return W(m({},t),{menu:e.payload});case"SET_ERROR":return W(m({},t),{error:e.payload});case"SET_STARTED":return W(m({},t),{started:e.payload});default:return t}}/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const T=d.exports.createContext({wm:null,xpra:null,state:j,root:null,setRoot:()=>{},setCursor:()=>{},dispatch:()=>{}}),Ue=De(["connect"],[],["connect","host"]),Xe=Oe(),Fe=W(m(m({},j),Ue),{options:m(m({},j.options),Xe)}),Be=({children:t,wm:e,xpra:n})=>{const[a,s]=d.exports.useReducer(Te,Fe),[i,l]=d.exports.useState(null),[u,p]=d.exports.useState(null),c=()=>{s({type:v.SetConnected,payload:!0}),s({type:v.SetError,payload:""})},f=E=>{s({type:v.SetConnected,payload:E!=="disconnected"}),s({type:v.ClearWindows})},b=E=>s({type:v.AddWindow,payload:E}),y=E=>s({type:v.RemoveWindow,payload:E}),x=E=>s({type:v.SetWindowIcon,payload:E}),r=E=>s({type:v.UpdateStats,payload:E}),g=E=>s({type:v.SetCursor,payload:E}),N=E=>s({type:v.MoveResizeWindow,payload:E}),I=E=>{const X=e.getWindow(E);X&&s({type:v.RaiseWindow,payload:X.attributes})},R=E=>s({type:v.UpdateMetadata,payload:E}),S=E=>{},D=async E=>s({type:v.AddNotification,payload:[E,await e.createNotification(E)]}),H=E=>s({type:v.RemoveNotification,payload:E}),Y=E=>{if(u){const[X,G]=E.position;Object.assign(u.style,{left:`${X}px`,top:`${G}px`})}},U=E=>s({type:v.SetError,payload:E}),V=E=>s({type:v.UpdateMenu,payload:E}),L=()=>s({type:v.SetStarted,payload:!0});return d.exports.useEffect(()=>(n.on("connect",c),n.on("disconnect",f),n.on("newWindow",b),n.on("removeWindow",y),n.on("windowIcon",x),n.on("pong",r),n.on("cursor",g),n.on("moveResizeWindow",N),n.on("updateWindowMetadata",R),n.on("raiseWindow",I),n.on("initiateMoveResize",S),n.on("showNotification",D),n.on("hideNotification",H),n.on("pointerPosition",Y),n.on("newTray",b),n.on("updateXDGMenu",V),n.on("error",U),n.on("sessionStarted",L),()=>{n.off("connect",c),n.off("disconnect",f),n.off("newWindow",b),n.off("removeWindow",y),n.off("windowIcon",x),n.off("pong",r),n.off("cursor",g),n.off("moveResizeWindow",N),n.off("updateWindowMetadata",R),n.off("raiseWindow",I),n.off("initiateMoveResize",S),n.off("showNotification",D),n.off("hideNotification",H),n.off("pointerPosition",Y),n.off("newTray",b),n.off("updateXDGMenu",V),n.off("error",U),n.off("sessionStarted",L)}),[]),d.exports.useEffect(()=>{a.connect&&n.connect(a.host,a.options)},[]),d.exports.useEffect(()=>{e.setDesktopElement(i)},[i]),d.exports.useEffect(()=>{e.setActiveWindow(a.activeWindow)},[a.activeWindow]),o.createElement(T.Provider,{value:{state:a,dispatch:s,root:i,wm:e,xpra:n,setRoot:l,setCursor:p}},t)};/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const Ye=300,B=({toggled:t,children:e,mountOnEnter:n=!0,unmountOnExit:a=!0})=>o.createElement(Ne,{in:t,timeout:Ye,mountOnEnter:n,unmountOnExit:a,classNames:"fade-on-out"},e);var Ve="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAASdAAAEnQB3mYfeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAUdEVYdEF1dGhvcgBKYWt1YiBTdGVpbmVy5vv3LwAAADV0RVh0RGVzY3JpcHRpb24ASW52ZXJ0ZWQgdmFyaWFudCBvZiB0aGUgRE1aIGN1cnNvciB0aGVtZS5odVs8AAAAM3RFWHRTb3VyY2UAaHR0cDovL2ppbW1hYy5tdXNpY2hhbGwuY3ovdGhlbWVzLnBocD9za2luPTdQM5WxAAADwUlEQVRYhe2WTUhsZRjHf+PVcdLU48d1GkMvdwI185ZIzEYpaKttWqhcKhlFF65USjcK6equNFJbCEokiISiochQgfmBaI6CKGmg5MeIwpBXZpIRPec8LWb0Wte6c1SsRX94eDcvvD+er/8L/+sFEpFX/833o3Vd9zc3N78FxAIRdw0QKyISCAT8xcXFDuDlu4aIl5D8fr+voKDgbe44E/EiIu3t7eL3+8Xn8x3l5ua+GYIw3RlAeXm5FBUVSSAQEJ/Pd2i32x8BMbcBEVYqdV1nfn4ep9OJxWJJXFpa+t5msz0AXropRFgAmqahqiqTk5NUVVURGxtrXV1ddQFpgOUmEIYAVFVlYmKCuro6FEXJ8Hq93wE2IPq6EGEBiMgFgKqquFwuGhoaSE5Ofri/v/8t8Mp1IcIep8sAqqoyPj5Oa2srVqs1d29vbwiwAmajENcGUFWV4eFh2traSEtLy9/Z2fkGSDUKYWihXAUxMDBAZ2cn6enpjo2Nja+A+0YgDANcbsjz6O/vp6+vD7vd/t7a2tqXQAoQFQ6EIYC/NuPl6OnpYXBwkKysrPdXVla+CBfC8E6/6vHzrHR3dzM8PExOTs4HCwsLT4BkIPKfICKNAlwuAYDD4cBisWA2m4mOjmZxcZG8vDzy8/M/mpmZ+b2wsPAz4ClwZvQtCHlBSUmJABcRGRkpcXFxYrVaxe12y99J13WZnp5+Aii3lgGAsrIyxsbGUFWVrq4uent76ejo+GFoaOgns9l8bDKZxGQy6WazOSAivxJcUtfScxmora0VXdelpqZGEhISxGazyebmpni93qdAEfA6YAceAg8ILqiYWwFoaGgQXdfl9PRU9Xg8oiiKpKSkSH19vWiaJk1NTY0EvcEM3AtFBDcwqwuAxsZGERFZXFxcdzqdn2uaJtXV1aIoimRkZMjBwYEcHBx4gDe4oUM+BzA3Nye6rsvs7OwK8DFQcHR05Nna2hJFUSQ1NVVaWlpEVVWprKysIDh+t/Jtiz/v5qmpqSXgQ+ARkDw6OvpY0zSpqKiQpKQkyczMlOPjY1leXp4DXiO4hG4HYH5+/kegDMgF4ghOj+L3+/c2NjYkMTFRsrOz5fDwUNbX138OQd5KGWJ3d3e/Bt4Bsnn2LTcBUS6X6/HZ2Zlsb29LIBCQk5MTvbS0tCV017A1X6UoIJGgw8Xw57qagPiRkZFPPB7PL2632+1wOD4F3iXoA2H1wIsITQRHSQA9dF7WPYIluU/wg3oC/Ab4APWK+4YBwlEEz2ZeC8X54vrv6w+aYEf+AZkZtAAAAABJRU5ErkJggg==";/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const de=16;let ue=!1;const Le=({win:t,bar:e,winstance:n})=>{const{oldPosition:a,oldDimension:s}=t,{wm:i,xpra:l,root:u,dispatch:p}=d.exports.useContext(T),c="w-4 h-4 rounded-full cursor-pointer bg-gradient-to-b shadow-inner hover:shadow",f=y=>{y.stopPropagation(),y.preventDefault()},b=()=>{if(e.current&&u)if(t.maximized)a&&s&&(i.maximize(n,a,s),p({type:v.MaximizeWindow,payload:{wid:t.id,maximize:!1}}));else{const x=e.current.offsetHeight,r=u.offsetWidth,g=u.offsetHeight-x;i.maximize(n,[0,x],[r,g]),p({type:v.MaximizeWindow,payload:{wid:t.id,position:[0,x],dimension:[r,g],maximize:!0}})}};return o.createElement("div",{className:"flex items-center space-x-2",onMouseDown:f},o.createElement("div",{title:"Minimize",className:`${c} from-green-300 to-green-500 hover:from-green-400`,onClick:()=>i.minimize(n)}),o.createElement("div",{title:"Maximize",className:`${c} from-blue-300 to-blue-500 hover:from-blue-400`,onClick:b}),!l.isReadOnly()&&o.createElement("div",{title:"Close",className:`${c} from-red-300 to-red-500 hover:from-red-400`,onClick:()=>i.close(n)}))},fe=({win:{icon:t,title:e}})=>o.createElement(o.Fragment,null,t&&o.createElement("img",{alt:e,src:t.image,className:"max-h-full"}),!t&&o.createElement("div",{className:"w-full h-full bg-gray-500 rounded"})),Q=({id:t})=>{const e=d.exports.useRef(null),{wm:n,state:a}=d.exports.useContext(T),s=n.getWindow(t),i=a.draggingWindow>=0?"pointer-events-none":"",l=c=>{n.mouseButton(s,c.nativeEvent,!0)},u=c=>{c.stopPropagation(),n.mouseButton(s,c.nativeEvent,!1)},p=c=>{c.preventDefault(),c.stopPropagation(),n.mouseMove(s,c.nativeEvent)};return d.exports.useEffect(()=>{e.current&&e.current.appendChild(s.canvas)},[e.current]),o.createElement("div",{ref:e,className:i,onMouseDown:l,onMouseUp:u,onMouseMove:p})},Ge=({win:t})=>{var ee;const{id:e,position:n,dimension:a,title:s,minimized:i,maximized:l,opacity:u,zIndex:p,minDimension:c,maxDimension:f}=t,[b,y]=d.exports.useState("default"),{wm:x,dispatch:r,xpra:g}=d.exports.useContext(T),N=d.exports.useRef(null),I=d.exports.useRef(null),R=d.exports.useRef(null),S=x.getWindow(e),D={opacity:u,zIndex:p},H={cursor:b},Y={toggled:!i,mountOnEnter:!1,unmountOnExit:!1},U=(w,C,A,h,O=!1)=>{N.current&&Object.assign(N.current.style,{left:`${w}px`,top:`${C}px`,width:`${A}px`,height:`${h}px`}),S!=null&&S.canvas&&Object.assign(S.canvas.style,{width:`${A}px`,height:`${h}px`}),O&&r({type:v.MoveResizeWindow,payload:{wid:e,position:[w,C],dimension:[A,h]}})},V=(w=!1)=>{const[C,A]=n,[h,O]=a;U(C,A,h,O,w)},L=w=>(C,A,h,O,k)=>{const[z,P]=c||[100,100],[_,Z]=f||[Number.MAX_VALUE,Number.MAX_VALUE];h=Math.min(_,Math.max(z,h)),O=Math.min(Z,Math.max(P,O)),w(C,A,h,O,k)},E=L((w,C,A,h)=>{!g.isReadOnly()&&!l&&U(w,C,A,h),G(!0)}),X=L((w,C,A,h,O)=>{G(!1),!g.isReadOnly()&&!l&&(U(w,C,A,h,!0),O&&x.moveResize(S,[w,C],[A,h]))}),G=w=>{(!w||!ue)&&r({type:v.SetDraggingWindow,payload:w?e:-1}),ue=w},J=w=>{w.preventDefault(),w.stopPropagation(),x.raise(S),r({type:v.RaiseWindow,payload:S.attributes})},ge=me(w=>{if(R.current){const C=re(R.current,[w.pageX,w.pageY],de);y(`${C}-resize`)}else y("default")},100),ve=d.exports.useCallback(ie(()=>{const[w,C]=a;let[A,h]=n,O=0;return{onDown(){var k;O=((k=I.current)==null?void 0:k.offsetHeight)||0},onMove(k,z,P){A=n[0]+z,h=Math.max(O,n[1]+P),E(A,h,w,C),G(!0)},onRelease(k,z){X(A,h,w,C,z)}}}),[n,a]),he=d.exports.useCallback(ie(()=>{let w="",C=0,[A,h]=n,[O,k]=a;return{onDown(z,P,_){var Z;z.stopPropagation(),R.current&&(w=re(R.current,[P,_],de),C=((Z=I.current)==null?void 0:Z.offsetHeight)||0)},onMove(z,P,_){w.startsWith("n")?(h=n[1]+_,h>C?k=a[1]-_:h=C):w.startsWith("s")&&(k=a[1]+_),w.endsWith("w")?(O=a[0]-P,A=n[0]+P):w.endsWith("e")&&(O=a[0]+P),E(A,h,O,k)},onRelease(z,P){X(A,h,O,k,P)}}}),[R,n,a]);return d.exports.useEffect(()=>{V()},[n,a]),d.exports.useEffect(()=>{V()},[N]),d.exports.useEffect(()=>{var O,k;if((O=S==null?void 0:S.attributes)!=null&&O.overrideRedirect)return;const[w,C]=n,[A,h]=a;if(!g.isReadOnly()){const z=((k=I.current)==null?void 0:k.offsetHeight)||0;if(w<=0||C<=z){const _=z;x.moveResize(S,[100,_],[A,h]),U(100,_,A,h,!0)}}},[]),(ee=S==null?void 0:S.attributes)!=null&&ee.overrideRedirect?o.createElement(B,m({},Y),o.createElement("div",{className:"absolute bg-black cursor-default shadow",ref:N,style:D,onMouseDown:J},o.createElement(Q,{id:e}))):o.createElement(B,m({},Y),o.createElement("div",{ref:N,style:D,className:"absolute",onMouseDown:J,onMouseMove:ge},o.createElement("div",{ref:R,className:"absolute z-10 -left-2 -top-10 -bottom-2 -right-2",style:H,onMouseDown:he}),o.createElement("div",{className:"relative w-full h-full z-20 outline outline-1 outline-gray-200 shadow-xl"},o.createElement("div",{className:"absolute -top-8 w-full flex items-center p-1 px-2 h-8 space-x-2 outline outline-1 outline-gray-200 bg-gray-100 cursor-default",ref:I,onMouseDown:ve},o.createElement("div",{className:"flex items-center justify-center",style:{width:"16px",height:"16px"}},o.createElement(fe,{win:t})),o.createElement("div",{className:"flex-grow truncate text-sm"},o.createElement("span",null,s||e)),o.createElement(Le,{winstance:S,win:t,bar:I,outer:N})),o.createElement("div",{className:"xpra-window-canvas w-full h-full bg-black"},o.createElement(Q,{id:e})))))},He=({children:t})=>{const e=d.exports.createRef(),n=d.exports.createRef(),{wm:a,state:s,setRoot:i,setCursor:l}=d.exports.useContext(T),u=me(r=>{a.mouseMove(null,r.nativeEvent)},200),p=r=>{r.preventDefault()},c=d.exports.useCallback(r=>{a.mouseButton(null,r,!0)},[]),f=d.exports.useCallback(r=>{a.mouseButton(null,r,!1)},[]),b=m({dimension:[32,32],xhot:8,yhot:3,image:Ve},s.cursor||{}),y=`
.xpra-cursor {
  background: ${Pe(b)};
}

.xpra-window-canvas {
  cursor: ${_e(s.cursor,"default")};
}
`,x=s.windows.filter(r=>!r.tray);return d.exports.useEffect(()=>{e.current&&i(e.current)},[e.current]),d.exports.useEffect(()=>{n.current&&l(n.current)},[n.current]),o.createElement(o.Fragment,null,o.createElement("div",{id:"xpra-desktop",className:"absolute inset-0 z-30 overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-300 to-emerald-500",ref:e,onMouseMove:u,onContextMenu:p,onMouseDown:c,onMouseUp:f},s.connected&&x.map(r=>o.createElement(Ge,{key:r.id,win:r})),t),o.createElement("div",{ref:n,className:"xpra-cursor absolute z-50"}),o.createElement("style",null,y))};/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */let Ee=1;const pe=({disabled:t,label:e,value:n,required:a,options:s,onChange:i})=>{const l=`xpra_${++Ee}`,u="rounded bg-white border border-black-100 w-full p-1 px-2 disabled:opacity-40 disabled:cursor-not-allowed";return o.createElement("div",null,e&&o.createElement("label",{htmlFor:l},e),o.createElement("div",null,o.createElement("select",{className:u,id:l,required:a,disabled:t,defaultValue:n,onChange:i},Object.entries(s).map(([p,c])=>o.createElement("option",{key:p,value:p},c)))))},F=({children:t,disabled:e,label:n,type:a,transparent:s,onClick:i})=>{let l="flex items-center justify-center relative rounded w-full p-1 px-2 disabled:opacity-40 disabled:cursor-not-allowed hover:outline hover:outline-1";return s?l+=" border border border-transparent":l+=" bg-white border border-black-100",o.createElement("button",{className:l,disabled:e,type:a||"button",onClick:i},n||t)},q=({disabled:t,label:e,value:n,type:a,placeholder:s,required:i,onChange:l})=>{const u=`xpra_${++Ee}`,p="rounded bg-white border border-black-100 w-full p-1 px-2 disabled:opacity-40 disabled:cursor-not-allowed";return o.createElement("div",null,e&&o.createElement("label",{htmlFor:u},e),o.createElement("div",null,o.createElement("input",{type:a||"text",className:p,id:u,placeholder:s,required:i,disabled:t,defaultValue:n,onInput:l})))},M=({label:t,value:e,onChange:n})=>o.createElement("div",{className:"select-none"},o.createElement("label",{className:"inline-flex items-center space-x-2 cursor-pointer"},o.createElement("input",{type:"checkbox",defaultChecked:e,onChange:n}),o.createElement("span",null,t)));/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const Ze=["shadow-lg","bg-emerald-100/50","opacity-90","rounded"],we=(...t)=>t.join(" "),ye=({items:t,onCallback:e=()=>{},root:n=!0})=>{const a=d.exports.useRef(null),[s,i]=d.exports.useState(-1),l=["max-h-96","max-w-xs"];n?l.push("top-full","left-0"):l.push("top-0","left-full","overflow-auto");const u=f=>i(f),p=()=>i(-1),c=f=>{f&&f(),e()};if(n){const f=b=>{if(a.current){const y=b.target;y&&(a.current.contains(y)||y===a.current.parentNode)||c()}};d.exports.useEffect(()=>(document.addEventListener("click",f),()=>{document.removeEventListener("click",f)}),[a])}return o.createElement("div",{ref:a,className:we("absolute","shadow","bg-emerald-100/80",...l),onMouseLeave:p},t.map(({icon:f,title:b,items:y,callback:x},r)=>o.createElement("div",{key:r,className:"relative text-left"},o.createElement("div",{className:"p-2 hover:bg-white truncate flex space-x-2 items-center",onClick:()=>c(x),onMouseOver:()=>u(r)},f&&o.createElement("img",{src:f,className:"w-4 h-4"}),o.createElement("span",{className:"flex-grow"},b),y&&y.length&&o.createElement("i",{className:"fa fa-chevron-right"})),s===r&&y&&y.length>0&&o.createElement(ye,{root:!1,items:y}))))},$=({classNames:t,children:e})=>{const n=we("absolute","z-50",...Ze,...t);return o.createElement("div",{className:n},e)},Ke=()=>{const{xpra:t,state:e,dispatch:n}=d.exports.useContext(T),a=e.showOptions?"Hide options":"Show options",s=(r,g)=>n({type:v.SetOption,payload:[r,g]}),i=Object.fromEntries(["CBC","CFB","CTR"].map(r=>`AES-${r}`).map(r=>[r,r])),l=[{key:"reconnect",label:"Automatically reconnect",component:M},{key:"shareSession",label:"Share Session",component:M},{key:"stealSession",label:"Steal Session",component:M},{key:"clipboard",label:"Clipboard",component:M},{key:"clipboardImages",label:"Clipboard Images",component:M},{key:"fileTransfer",label:"File Transfer",component:M},{key:"printing",label:"Printing",component:M},{key:"bell",label:"Bell",component:M},{key:"notifications",label:"Notifications",component:M},{key:"openUrl",label:"Open URLs",component:M},{key:"audio",label:"Audio",component:M},{key:"showStartMenu",label:"XDG Menu",component:M},{key:"swapKeys",label:"Swap Ctrl and Cmd key",component:M},{key:"reverseScrollX",label:"Reverse X scroll",component:M},{key:"reverseScrollY",label:"Reverse Y scroll",component:M},{key:"keyboardLayout",label:"Keyboard Layout",component:pe,options:Re}].map(r=>W(m({},r),{value:e.options[r.key],onChange:g=>s(r.key,g.target.value)})),u=r=>n({type:v.SetHost,payload:r.target.value}),p=r=>s("username",r.target.value),c=r=>s("password",r.target.value),f=r=>s("encryption",r.target.value||null),b=r=>s("encryptionKey",r.target.value),y=r=>{r.preventDefault(),n({type:v.SetError,payload:""}),t.connect(e.host,e.options)},x=()=>n({type:v.SetShowOptions,payload:!e.showOptions});return o.createElement($,{classNames:["p-8","top-1/2","left-1/2 transform","-translate-x-1/2","-translate-y-1/2","w-11/12","max-w-xl","max-h-full","overflow-auto"]},o.createElement("form",{className:"space-y-4",onSubmit:y},o.createElement("div",{className:"space-y-2"},o.createElement(q,{required:!0,placeholder:"Host",value:e.host,onChange:u}),o.createElement("div",{className:"grid gap-2 grid-cols-2"},o.createElement(q,{placeholder:"Username",value:e.options.username,onChange:p}),o.createElement(q,{type:"password",placeholder:"Password",value:e.options.password,onChange:c}),o.createElement(pe,{disabled:!0,value:e.options.encryption||"",options:m({"":"No encryption"},i),onChange:f}),o.createElement(q,{disabled:!0,type:"password",placeholder:"Encryption key",value:e.options.encryptionKey,onChange:b}))),e.error&&o.createElement("div",{className:"bg-red-300 border border-red-500 text-red-500 p-2 rounded"},e.error),o.createElement("div",{className:"flex space-x-2"},o.createElement(F,{label:"Connect",type:"submit"}),o.createElement(F,{label:a,onClick:x})),o.createElement(B,{toggled:e.showOptions},o.createElement("div",{className:"px-2 text-sm"},l.map(I=>{var R=I,{component:r,key:g}=R,N=ae(R,["component","key"]);const S=r;return o.createElement(S,m({key:g},N))})))))},qe=()=>{const{state:t}=d.exports.useContext(T),e=[["Last server ping",t.stats.lastServerPing],["Last client echo",t.stats.lastClientEcho],["Client ping latency",t.stats.clientPingLatency],["Server ping latency",t.stats.serverPingLatency],["Server load",t.stats.serverLoad.join(" / ")],["Window count",t.windows.length]];return o.createElement("div",{className:"absolute bottom-1 left-1 p-1 z-0 opacity-50 bg-emerald-100 rounded"},o.createElement("table",{className:"text-xs"},o.createElement("tbody",null,e.map(([n,a])=>o.createElement("tr",{key:n},o.createElement("td",{className:"p-1"},n),o.createElement("td",{className:"p-1 text-right text-gray-500"},a))))))},je=()=>{const{wm:t,state:e,dispatch:n,xpra:a}=d.exports.useContext(T),[s,i]=d.exports.useState(!1),l=e.windows.filter(r=>r.minimized),u=e.windows.filter(r=>r.tray),p=[...e.menu.map(r=>({title:r.name,icon:r.icon,items:r.entries.map(g=>({title:g.name,icon:g.icon,callback:()=>{a.sendStartCommand(g.name,g.exec,!1)}}))})),{title:"Server",items:[{title:"Shutdown server",callback:()=>{confirm("Are you sure you want to shut down the server ?")&&a.sendShutdown()}}]},{title:"Disconnect",callback:()=>a.disconnect()}],c=r=>g=>{g.stopPropagation(),g.preventDefault();const N=t.getWindow(r.id);N&&(t.restore(N),t.raise(N),n({type:v.RaiseWindow,payload:N.attributes}))},f=()=>i(!s),b=()=>{i(!1)},y=()=>a.clipboard.poll(),x=async()=>{(await Me()).forEach(({buffer:g,name:N,size:I,type:R})=>a.sendFile(N,R,I,g))};return o.createElement($,{classNames:["top-1","left-1/2","-translate-x-1/2","p-1","select-none"]},o.createElement("div",{className:"flex space-x-4 px-2"},o.createElement("div",{className:"flex space-x-1"},o.createElement(F,{transparent:!0,onClick:f},o.createElement("i",{className:"fa fa-bars pointer-events-none"}),o.createElement(B,{toggled:s},o.createElement(ye,{items:p,onCallback:b}))),e.options.clipboard&&o.createElement(F,{transparent:!0,onClick:y},o.createElement("i",{className:"fa fa-clipboard"})),e.options.fileTransfer&&o.createElement(F,{transparent:!0,onClick:x},o.createElement("i",{className:"fa fa-upload"}))),l.length>0&&o.createElement("div",{className:"flex space-x-1"},l.map(r=>o.createElement(F,{key:r.id,transparent:!0,onClick:c(r)},o.createElement("div",{className:"flex space-x-1 items-center",style:{maxWidth:"128px"}},o.createElement("div",{className:"w-4 h-4"},o.createElement(fe,{win:r})),o.createElement("div",{className:"truncate text-center text-sm"},r.title))))),u.length>0&&o.createElement("div",{className:"flex space-x-1"},u.map(r=>o.createElement("div",{key:r.id,className:"flex space-x-1 items-center"},o.createElement("div",{className:"flex items-center justify-center w-4 h-4 overflow-hidden",title:r.title},o.createElement(Q,{id:r.id})))))))},Qe=()=>{const{state:t,xpra:e}=d.exports.useContext(T),n=()=>e.disconnect();return o.createElement($,{classNames:["p-8","top-1/2","left-1/2 transform","-translate-x-1/2","-translate-y-1/2","w-96"]},o.createElement("div",{className:"space-y-4"},o.createElement("div",{className:"text-center"},"Connecting to ",t.host),o.createElement("div",null,o.createElement(F,{onClick:n},"Cancel"))))};/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */function $e(){const{state:t}=d.exports.useContext(T);return o.createElement(o.Fragment,null,o.createElement(B,{toggled:!t.connected},o.createElement(Ke,null)),o.createElement(B,{toggled:!t.started&&t.connected},o.createElement(Qe,null)),o.createElement(He,null,t.connected&&o.createElement(qe,null)),o.createElement(B,{toggled:t.started},o.createElement(je,null)))}function Je({xpra:t,wm:e}){return o.createElement(Be,{wm:e,xpra:t},o.createElement($e,null))}function et(){return new Worker("assets/worker.83185d7c.js",{type:"module"})}/**
 * Xpra Typescript Client Example
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */async function tt(){const t=document.querySelector("#app"),e=new et,n=new Ie({worker:e}),a=new ke(n);await n.init(),a.init(),t&&Se.render(d.exports.createElement(Je,{xpra:n,wm:a}),t)}window.addEventListener("DOMContentLoaded",()=>{tt()});
//# sourceMappingURL=index.744119d0.js.map