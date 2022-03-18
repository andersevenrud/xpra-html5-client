var he=Object.defineProperty,xe=Object.defineProperties;var Ae=Object.getOwnPropertyDescriptors;var q=Object.getOwnPropertySymbols;var ne=Object.prototype.hasOwnProperty,oe=Object.prototype.propertyIsEnumerable;var te=(t,e,n)=>e in t?he(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,v=(t,e)=>{for(var n in e||(e={}))ne.call(e,n)&&te(t,n,e[n]);if(q)for(var n of q(e))oe.call(e,n)&&te(t,n,e[n]);return t},W=(t,e)=>xe(t,Ae(e));var se=(t,e)=>{var n={};for(var s in t)ne.call(t,s)&&e.indexOf(s)<0&&(n[s]=t[s]);if(t!=null&&q)for(var s of q(t))e.indexOf(s)<0&&oe.call(t,s)&&(n[s]=t[s]);return n};import{r as c,R as o,C as Se,t as me,a as be}from"./vendor.f519d7b4.js";import{i as Ne,d as Ce,c as ae,p as We,a as De,X as Oe,b as Re,e as Me,f as Ie}from"./shared.4614174e.js";const ke=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function n(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerpolicy&&(r.referrerPolicy=a.referrerpolicy),a.crossorigin==="use-credentials"?r.credentials="include":a.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(a){if(a.ep)return;a.ep=!0;const r=n(a);fetch(a.href,r)}};ke();/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */function ze(t){if(t){const{image:e,xhot:n,yhot:s}=t;return`transparent url('${e}') no-repeat ${n}px ${s}px`}return""}function Pe(t,e=""){if(t){const{image:n,xhot:s,yhot:a}=t,r=e?`, ${e}`:"";return`url('${n}') ${s} ${a}${r}`}return e}function re(t,e,n){let s="";const{width:a,height:r,x:i,y:u}=t.getBoundingClientRect(),p=e[0]-i,l=e[1]-u;return l<=n?s+="n":l>=r-n&&(s+="s"),p<=n?s+="w":p>=a-n&&(s+="e"),s}function ie(t){const{onDown:e,onMove:n,onRelease:s}=t();return a=>{a.preventDefault();const r=a.pageX,i=a.pageY;let u=!1;const p=f=>{f.stopPropagation();const d=f.pageX-r,g=f.pageY-i;u=!0,n(f,d,g)},l=f=>{window.removeEventListener("mousemove",p,!0),window.removeEventListener("mouseup",l,!0),s(f,u)};window.addEventListener("mousemove",p,!0),window.addEventListener("mouseup",l,!0),e&&e(a.nativeEvent,r,i)}}function le({opacity:t}){if(typeof t=="number")return t<0?1:t/4294967296}/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */var h=(t=>(t.SetHost="SET_HOST",t.SetShowOptions="SET_SHOW_OPTIONS",t.AddWindow="ADD_WINDOW",t.RemoveWindow="REMOVE_WINDOW",t.SetWindowIcon="SET_WINDOW_ICON",t.SetConnected="SET_CONNECTED",t.SetCursor="SET_CURSOR",t.UpdateStats="UPDATE_STATS",t.MoveResizeWindow="MOVE_RESIZE_WINDOW",t.MaximizeWindow="MAXIMIZE_WINDOW",t.UpdateMetadata="UPDATE_METADATA",t.RaiseWindow="RAISE_WINDOW",t.AddNotification="ADD_NOTIFICATION",t.RemoveNotification="REMOVE_NOTIFICATION,",t.SetDraggingWindow="SET_DRAGGING_WINDOW",t.ClearWindows="CLEAR_WINDOWS",t.SetOption="SET_OPTION",t.UpdateMenu="UPDATE_MENU",t.SetError="SET_ERROR",t.SetStarted="SET_STARTED",t))(h||{});let ce=1;const j={connect:!1,host:"ws://127.0.0.1:10000",showOptions:!1,connected:!1,cursor:null,windows:[],notifications:[],activeWindow:0,draggingWindow:-1,actualDesktopSize:[0,0],stats:v({},Ne),options:v({},Ce),menu:[],error:"",started:!1};function _e(t,e){var s,a;const n=(r,i)=>{const u=t.windows,p=u.find(l=>l.id===r);return p&&Object.assign(p,i(p)),W(v({},t),{windows:u})};switch(e.type){case"SET_HOST":return W(v({},t),{host:e.payload});case"SET_SHOW_OPTIONS":return W(v({},t),{showOptions:e.payload});case"ADD_WINDOW":const r=!!e.payload.metadata.tray;return W(v({},t),{activeWindow:e.payload.id,windows:[...t.windows,{id:e.payload.id,minimized:e.payload.metadata.iconic===!0,maximized:!1,title:e.payload.metadata.title||String(e.payload.id),position:e.payload.position,dimension:e.payload.dimension,minDimension:(s=e.payload.metadata["size-constraints"])==null?void 0:s["minimum-size"],maxDimension:(a=e.payload.metadata["size-constraints"])==null?void 0:a["maximum-size"],opacity:le(e.payload.metadata),tray:r,zIndex:r?0:ae(e.payload,++ce)}]});case"REMOVE_WINDOW":const{windows:i}=t,u=i.findIndex(D=>D.id===e.payload);u!==-1&&i.splice(u,1);const p=i.length>0?i[i.length-1].id:0;return W(v({},t),{activeWindow:p,windows:i});case"SET_WINDOW_ICON":const l=e.payload;return n(l.wid,()=>({icon:l}));case"SET_CONNECTED":return W(v({},t),{started:!1,windows:e.payload?t.windows:[],connected:e.payload});case"SET_CURSOR":return W(v({},t),{cursor:e.payload});case"UPDATE_STATS":return W(v({},t),{stats:v(v({},t.stats),e.payload)});case"MOVE_RESIZE_WINDOW":const{wid:f,position:d,dimension:g}=e.payload;return n(f,D=>({position:d||D.position,dimension:g||D.dimension}));case"MAXIMIZE_WINDOW":const{maximize:A}=e.payload;return n(e.payload.wid,D=>({oldPosition:A?D.position:void 0,oldDimension:A?D.dimension:void 0,position:A?e.payload.position:D.oldPosition,dimension:A?e.payload.dimension:D.oldDimension,maximized:A}));case"UPDATE_METADATA":const{title:E,iconic:m}=e.payload.metadata;return n(e.payload.wid,D=>({opacity:le(e.payload.metadata),minimized:m===void 0?D.minimized:m===!0,title:E===void 0?D.title:E}));case"RAISE_WINDOW":return W(v({},n(e.payload.id,()=>({zIndex:ae(e.payload,++ce)}))),{activeWindow:e.payload.id});case"ADD_NOTIFICATION":return W(v({},t),{notifications:[...t.notifications,e.payload]});case"REMOVE_NOTIFICATION,":const{notifications:S}=t,R=S.findIndex(([D])=>D.id===e.payload);return R!==-1&&S.splice(R,1),W(v({},t),{notifications:S});case"SET_DRAGGING_WINDOW":return W(v({},t),{draggingWindow:e.payload});case"CLEAR_WINDOWS":return W(v({},t),{cursor:null,windows:[],notifications:[],draggingWindow:-1});case"SET_OPTION":const[k,N]=e.payload;return W(v({},t),{options:W(v({},t.options),{[k]:N})});case"UPDATE_MENU":return W(v({},t),{menu:e.payload});case"SET_ERROR":return W(v({},t),{error:e.payload});case"SET_STARTED":return W(v({},t),{started:e.payload});default:return t}}/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const T=c.exports.createContext({wm:null,xpra:null,state:j,root:null,setRoot:()=>{},setCursor:()=>{},dispatch:()=>{}}),Te=We(["connect"],[],["connect","host"]),Ue=De(),Xe=W(v(v({},j),Te),{options:v(v({},j.options),Ue)}),Fe=({children:t,wm:e,xpra:n})=>{const[s,a]=c.exports.useReducer(_e,Xe),[r,i]=c.exports.useState(null),[u,p]=c.exports.useState(null),l=()=>{a({type:h.SetConnected,payload:!0}),a({type:h.SetError,payload:""})},f=w=>{a({type:h.SetConnected,payload:w!=="disconnected"}),a({type:h.ClearWindows})},d=w=>a({type:h.AddWindow,payload:w}),g=w=>a({type:h.RemoveWindow,payload:w}),A=w=>a({type:h.SetWindowIcon,payload:w}),E=w=>a({type:h.UpdateStats,payload:w}),m=w=>a({type:h.SetCursor,payload:w}),S=w=>a({type:h.MoveResizeWindow,payload:w}),R=w=>{const F=e.getWindow(w);F&&a({type:h.RaiseWindow,payload:F.attributes})},k=w=>a({type:h.UpdateMetadata,payload:w}),N=w=>{},D=async w=>a({type:h.AddNotification,payload:[w,await e.createNotification(w)]}),H=w=>a({type:h.RemoveNotification,payload:w}),Y=w=>{if(u){const[F,G]=w.position;Object.assign(u.style,{left:`${F}px`,top:`${G}px`})}},X=w=>a({type:h.SetError,payload:w}),V=w=>a({type:h.UpdateMenu,payload:w}),L=()=>a({type:h.SetStarted,payload:!0});return c.exports.useEffect(()=>(n.on("connect",l),n.on("disconnect",f),n.on("newWindow",d),n.on("removeWindow",g),n.on("windowIcon",A),n.on("pong",E),n.on("cursor",m),n.on("moveResizeWindow",S),n.on("updateWindowMetadata",k),n.on("raiseWindow",R),n.on("initiateMoveResize",N),n.on("showNotification",D),n.on("hideNotification",H),n.on("pointerPosition",Y),n.on("newTray",d),n.on("updateXDGMenu",V),n.on("error",X),n.on("sessionStarted",L),()=>{n.off("connect",l),n.off("disconnect",f),n.off("newWindow",d),n.off("removeWindow",g),n.off("windowIcon",A),n.off("pong",E),n.off("cursor",m),n.off("moveResizeWindow",S),n.off("updateWindowMetadata",k),n.off("raiseWindow",R),n.off("initiateMoveResize",N),n.off("showNotification",D),n.off("hideNotification",H),n.off("pointerPosition",Y),n.off("newTray",d),n.off("updateXDGMenu",V),n.off("error",X),n.off("sessionStarted",L)}),[]),c.exports.useEffect(()=>{s.connect&&n.connect(s.host,s.options)},[]),c.exports.useEffect(()=>{e.setDesktopElement(r)},[r]),c.exports.useEffect(()=>{e.setActiveWindow(s.activeWindow)},[s.activeWindow]),o.createElement(T.Provider,{value:{state:s,dispatch:a,root:r,wm:e,xpra:n,setRoot:i,setCursor:p}},t)};/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const Be=300,B=({toggled:t,children:e,mountOnEnter:n=!0,unmountOnExit:s=!0})=>o.createElement(Se,{in:t,timeout:Be,mountOnEnter:n,unmountOnExit:s,classNames:"fade-on-out"},e);var Ye="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAASdAAAEnQB3mYfeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAUdEVYdEF1dGhvcgBKYWt1YiBTdGVpbmVy5vv3LwAAADV0RVh0RGVzY3JpcHRpb24ASW52ZXJ0ZWQgdmFyaWFudCBvZiB0aGUgRE1aIGN1cnNvciB0aGVtZS5odVs8AAAAM3RFWHRTb3VyY2UAaHR0cDovL2ppbW1hYy5tdXNpY2hhbGwuY3ovdGhlbWVzLnBocD9za2luPTdQM5WxAAADwUlEQVRYhe2WTUhsZRjHf+PVcdLU48d1GkMvdwI185ZIzEYpaKttWqhcKhlFF65USjcK6equNFJbCEokiISiochQgfmBaI6CKGmg5MeIwpBXZpIRPec8LWb0Wte6c1SsRX94eDcvvD+er/8L/+sFEpFX/833o3Vd9zc3N78FxAIRdw0QKyISCAT8xcXFDuDlu4aIl5D8fr+voKDgbe44E/EiIu3t7eL3+8Xn8x3l5ua+GYIw3RlAeXm5FBUVSSAQEJ/Pd2i32x8BMbcBEVYqdV1nfn4ep9OJxWJJXFpa+t5msz0AXropRFgAmqahqiqTk5NUVVURGxtrXV1ddQFpgOUmEIYAVFVlYmKCuro6FEXJ8Hq93wE2IPq6EGEBiMgFgKqquFwuGhoaSE5Ofri/v/8t8Mp1IcIep8sAqqoyPj5Oa2srVqs1d29vbwiwAmajENcGUFWV4eFh2traSEtLy9/Z2fkGSDUKYWihXAUxMDBAZ2cn6enpjo2Nja+A+0YgDANcbsjz6O/vp6+vD7vd/t7a2tqXQAoQFQ6EIYC/NuPl6OnpYXBwkKysrPdXVla+CBfC8E6/6vHzrHR3dzM8PExOTs4HCwsLT4BkIPKfICKNAlwuAYDD4cBisWA2m4mOjmZxcZG8vDzy8/M/mpmZ+b2wsPAz4ClwZvQtCHlBSUmJABcRGRkpcXFxYrVaxe12y99J13WZnp5+Aii3lgGAsrIyxsbGUFWVrq4uent76ejo+GFoaOgns9l8bDKZxGQy6WazOSAivxJcUtfScxmora0VXdelpqZGEhISxGazyebmpni93qdAEfA6YAceAg8ILqiYWwFoaGgQXdfl9PRU9Xg8oiiKpKSkSH19vWiaJk1NTY0EvcEM3AtFBDcwqwuAxsZGERFZXFxcdzqdn2uaJtXV1aIoimRkZMjBwYEcHBx4gDe4oUM+BzA3Nye6rsvs7OwK8DFQcHR05Nna2hJFUSQ1NVVaWlpEVVWprKysIDh+t/Jtiz/v5qmpqSXgQ+ARkDw6OvpY0zSpqKiQpKQkyczMlOPjY1leXp4DXiO4hG4HYH5+/kegDMgF4ghOj+L3+/c2NjYkMTFRsrOz5fDwUNbX138OQd5KGWJ3d3e/Bt4Bsnn2LTcBUS6X6/HZ2Zlsb29LIBCQk5MTvbS0tCV017A1X6UoIJGgw8Xw57qagPiRkZFPPB7PL2632+1wOD4F3iXoA2H1wIsITQRHSQA9dF7WPYIluU/wg3oC/Ab4APWK+4YBwlEEz2ZeC8X54vrv6w+aYEf+AZkZtAAAAABJRU5ErkJggg==";/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const de=16;let ue=!1;const Ve=({win:t,bar:e,winstance:n})=>{const{oldPosition:s,oldDimension:a}=t,{wm:r,xpra:i,root:u,dispatch:p}=c.exports.useContext(T),l="w-4 h-4 rounded-full cursor-pointer bg-gradient-to-b shadow-inner hover:shadow",f=g=>{g.stopPropagation(),g.preventDefault()},d=()=>{if(e.current&&u)if(t.maximized)s&&a&&(r.maximize(n,s,a),p({type:h.MaximizeWindow,payload:{wid:t.id,maximize:!1}}));else{const A=e.current.offsetHeight,E=u.offsetWidth,m=u.offsetHeight-A;r.maximize(n,[0,A],[E,m]),p({type:h.MaximizeWindow,payload:{wid:t.id,position:[0,A],dimension:[E,m],maximize:!0}})}};return o.createElement("div",{className:"flex items-center space-x-2",onMouseDown:f},o.createElement("div",{title:"Minimize",className:`${l} from-green-300 to-green-500 hover:from-green-400`,onClick:()=>r.minimize(n)}),o.createElement("div",{title:"Maximize",className:`${l} from-blue-300 to-blue-500 hover:from-blue-400`,onClick:d}),!i.isReadOnly()&&o.createElement("div",{title:"Close",className:`${l} from-red-300 to-red-500 hover:from-red-400`,onClick:()=>r.close(n)}))},pe=({win:{icon:t,title:e}})=>o.createElement(o.Fragment,null,t&&o.createElement("img",{alt:e,src:t.image,className:"max-h-full"}),!t&&o.createElement("div",{className:"w-full h-full bg-gray-500 rounded"})),Q=({id:t})=>{const e=c.exports.useRef(null),{wm:n,state:s}=c.exports.useContext(T),a=n.getWindow(t),r=s.draggingWindow>=0?"pointer-events-none":"",i=l=>{n.mouseButton(a,l.nativeEvent,!0)},u=l=>{l.stopPropagation(),n.mouseButton(a,l.nativeEvent,!1)},p=l=>{l.preventDefault(),l.stopPropagation(),n.mouseMove(a,l.nativeEvent)};return c.exports.useEffect(()=>{e.current&&e.current.appendChild(a.canvas)},[e.current]),o.createElement("div",{ref:e,className:r,onMouseDown:i,onMouseUp:u,onMouseMove:p})},Le=({win:t})=>{var ee;const{id:e,position:n,dimension:s,title:a,minimized:r,maximized:i,opacity:u,zIndex:p,minDimension:l,maxDimension:f}=t,[d,g]=c.exports.useState("default"),{wm:A,dispatch:E,xpra:m}=c.exports.useContext(T),S=c.exports.useRef(null),R=c.exports.useRef(null),k=c.exports.useRef(null),N=A.getWindow(e),D={opacity:u,zIndex:p},H={cursor:d},Y={toggled:!r,mountOnEnter:!1,unmountOnExit:!1},X=(y,C,b,x,O=!1)=>{S.current&&Object.assign(S.current.style,{left:`${y}px`,top:`${C}px`,width:`${b}px`,height:`${x}px`}),N!=null&&N.canvas&&Object.assign(N.canvas.style,{width:`${b}px`,height:`${x}px`}),O&&E({type:h.MoveResizeWindow,payload:{wid:e,position:[y,C],dimension:[b,x]}})},V=(y=!1)=>{const[C,b]=n,[x,O]=s;X(C,b,x,O,y)},L=y=>(C,b,x,O,I)=>{const[z,P]=l||[100,100],[_,Z]=f||[Number.MAX_VALUE,Number.MAX_VALUE];x=Math.min(_,Math.max(z,x)),O=Math.min(Z,Math.max(P,O)),y(C,b,x,O,I)},w=L((y,C,b,x)=>{!m.isReadOnly()&&!i&&X(y,C,b,x),G(!0)}),F=L((y,C,b,x,O)=>{G(!1),!m.isReadOnly()&&!i&&(X(y,C,b,x,!0),O&&A.moveResize(N,[y,C],[b,x]))}),G=y=>{(!y||!ue)&&E({type:h.SetDraggingWindow,payload:y?e:-1}),ue=y},J=y=>{y.preventDefault(),y.stopPropagation(),A.raise(N),E({type:h.RaiseWindow,payload:N.attributes})},ye=me(y=>{if(k.current){const C=re(k.current,[y.pageX,y.pageY],de);g(`${C}-resize`)}else g("default")},100),ve=c.exports.useCallback(ie(()=>{const[y,C]=s;let[b,x]=n,O=0;return{onDown(){var I;O=((I=R.current)==null?void 0:I.offsetHeight)||0},onMove(I,z,P){b=n[0]+z,x=Math.max(O,n[1]+P),w(b,x,y,C),G(!0)},onRelease(I,z){F(b,x,y,C,z)}}}),[n,s]),ge=c.exports.useCallback(ie(()=>{let y="",C=0,[b,x]=n,[O,I]=s;return{onDown(z,P,_){var Z;z.stopPropagation(),k.current&&(y=re(k.current,[P,_],de),C=((Z=R.current)==null?void 0:Z.offsetHeight)||0)},onMove(z,P,_){y.startsWith("n")?(x=n[1]+_,x>C?I=s[1]-_:x=C):y.startsWith("s")&&(I=s[1]+_),y.endsWith("w")?(O=s[0]-P,b=n[0]+P):y.endsWith("e")&&(O=s[0]+P),w(b,x,O,I)},onRelease(z,P){F(b,x,O,I,P)}}}),[k,n,s]);return c.exports.useEffect(()=>{V()},[n,s]),c.exports.useEffect(()=>{V()},[S]),c.exports.useEffect(()=>{var O,I;if((O=N==null?void 0:N.attributes)!=null&&O.overrideRedirect)return;const[y,C]=n,[b,x]=s;if(!m.isReadOnly()){const z=((I=R.current)==null?void 0:I.offsetHeight)||0;if(y<=0||C<=z){const _=z;A.moveResize(N,[100,_],[b,x]),X(100,_,b,x,!0)}}},[]),(ee=N==null?void 0:N.attributes)!=null&&ee.overrideRedirect?o.createElement(B,v({},Y),o.createElement("div",{className:"absolute bg-black cursor-default shadow",ref:S,style:D,onMouseDown:J},o.createElement(Q,{id:e}))):o.createElement(B,v({},Y),o.createElement("div",{ref:S,style:D,className:"absolute",onMouseDown:J,onMouseMove:ye},o.createElement("div",{ref:k,className:"absolute z-10 -left-2 -top-10 -bottom-2 -right-2",style:H,onMouseDown:ge}),o.createElement("div",{className:"relative w-full h-full z-20 outline outline-1 outline-gray-200 shadow-xl"},o.createElement("div",{className:"absolute -top-8 w-full flex items-center p-1 px-2 h-8 space-x-2 outline outline-1 outline-gray-200 bg-gray-100 cursor-default",ref:R,onMouseDown:ve},o.createElement("div",{className:"flex items-center justify-center",style:{width:"16px",height:"16px"}},o.createElement(pe,{win:t})),o.createElement("div",{className:"flex-grow truncate text-sm"},o.createElement("span",null,a||e)),o.createElement(Ve,{winstance:N,win:t,bar:R,outer:S})),o.createElement("div",{className:"xpra-window-canvas w-full h-full bg-black"},o.createElement(Q,{id:e})))))},Ge=({children:t})=>{const e=c.exports.createRef(),n=c.exports.createRef(),{wm:s,state:a,setRoot:r,setCursor:i}=c.exports.useContext(T),u=me(E=>{s.mouseMove(null,E.nativeEvent)},200),p=E=>{E.preventDefault()},l=c.exports.useCallback(E=>{s.mouseButton(null,E,!0)},[]),f=c.exports.useCallback(E=>{s.mouseButton(null,E,!1)},[]),d=v({dimension:[32,32],xhot:8,yhot:3,image:Ye},a.cursor||{}),g=`
.xpra-cursor {
  background: ${ze(d)};
}

.xpra-window-canvas {
  cursor: ${Pe(a.cursor,"default")};
}
`,A=a.windows.filter(E=>!E.tray);return c.exports.useEffect(()=>{e.current&&r(e.current)},[e.current]),c.exports.useEffect(()=>{n.current&&i(n.current)},[n.current]),o.createElement(o.Fragment,null,o.createElement("div",{id:"xpra-desktop",className:"absolute inset-0 z-30 overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-300 to-emerald-500",ref:e,onMouseMove:u,onContextMenu:p,onMouseDown:l,onMouseUp:f},a.connected&&A.map(E=>o.createElement(Le,{key:E.id,win:E})),t),o.createElement("div",{ref:n,className:"xpra-cursor absolute z-50"}),o.createElement("style",null,g))};/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */let fe=1;const He=({disabled:t,label:e,value:n,required:s,options:a,onChange:r})=>{const i=`xpra_${++fe}`,u="rounded bg-white border border-black-100 w-full p-1 disabled:opacity-20 disabled:cursor-not-allowed";return o.createElement("div",null,e&&o.createElement("label",{htmlFor:i},e),o.createElement("div",null,o.createElement("select",{className:u,id:i,required:s,disabled:t,defaultValue:n,onChange:r},Object.entries(a).map(([p,l])=>o.createElement("option",{key:p,value:p},l)))))},U=({children:t,disabled:e,label:n,type:s,transparent:a,onClick:r})=>{let i="flex items-center justify-center relative rounded w-full p-1 disabled:opacity-20 disabled:cursor-not-allowed hover:outline hover:outline-1";return a?i+=" border border border-transparent":i+=" bg-white border border-black-100",o.createElement("button",{className:i,disabled:e,type:s||"button",onClick:r},n||t)},K=({disabled:t,label:e,value:n,type:s,placeholder:a,required:r,onChange:i})=>{const u=`xpra_${++fe}`,p="rounded bg-white border border-black-100 w-full p-1 disabled:opacity-20 disabled:cursor-not-allowed";return o.createElement("div",null,e&&o.createElement("label",{htmlFor:u},e),o.createElement("div",null,o.createElement("input",{type:s||"text",className:p,id:u,placeholder:a,required:r,disabled:t,defaultValue:n,onInput:i})))},M=({label:t,value:e,onChange:n})=>o.createElement("div",{className:"select-none"},o.createElement("label",{className:"inline-flex items-center space-x-2 cursor-pointer"},o.createElement("input",{type:"checkbox",defaultChecked:e,onChange:n}),o.createElement("span",null,t)));/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const Ze=["shadow-lg","bg-emerald-100/50","opacity-90","rounded"],Ee=(...t)=>t.join(" "),we=({items:t,onCallback:e=()=>{},root:n=!0})=>{const s=c.exports.useRef(null),[a,r]=c.exports.useState(-1),i=["max-h-96","max-w-xs"];n?i.push("top-full","left-0"):i.push("top-0","left-full","overflow-auto");const u=f=>r(f),p=()=>r(-1),l=f=>{f&&f(),e()};if(n){const f=d=>{if(s.current){const g=d.target;g&&(s.current.contains(g)||g===s.current.parentNode)||l()}};c.exports.useEffect(()=>(document.addEventListener("click",f),()=>{document.removeEventListener("click",f)}),[s])}return o.createElement("div",{ref:s,className:Ee("absolute","shadow","bg-emerald-100/80",...i),onMouseLeave:p},t.map(({icon:f,title:d,items:g,callback:A},E)=>o.createElement("div",{key:E,className:"relative text-left"},o.createElement("div",{className:"p-2 hover:bg-white truncate flex space-x-2 items-center",onClick:()=>l(A),onMouseOver:()=>u(E)},f&&o.createElement("img",{src:f,className:"w-4 h-4"}),o.createElement("span",null,d)),a===E&&g&&g.length>0&&o.createElement(we,{root:!1,items:g}))))},$=({classNames:t,children:e})=>{const n=Ee("absolute","z-50",...Ze,...t);return o.createElement("div",{className:n},e)},qe=()=>{const{xpra:t,state:e,dispatch:n}=c.exports.useContext(T),s=e.showOptions?"Hide options":"Show options",a=(d,g)=>n({type:h.SetOption,payload:[d,g]}),r=[{key:"reconnect",label:"Automatically reconnect",component:M},{key:"shareSession",label:"Share Session",component:M},{key:"stealSession",label:"Steal Session",component:M},{key:"clipboard",label:"Clipboard",component:M},{key:"clipboardImages",label:"Clipboard Images",component:M},{key:"fileTransfer",label:"File Transfer",component:M},{key:"printing",label:"Printing",component:M},{key:"bell",label:"Bell",component:M},{key:"notifications",label:"Notifications",component:M},{key:"openUrl",label:"Open URLs",component:M},{key:"audio",label:"Audio",component:M},{key:"showStartMenu",label:"XDG Menu",component:M},{key:"swapKeys",label:"Swap Ctrl and Cmd key",component:M},{key:"reverseScrollX",label:"Reverse X scroll",component:M},{key:"reverseScrollY",label:"Reverse Y scroll",component:M},{key:"keyboardLayout",label:"Keyboard Layout",component:He,options:Oe}].map(d=>W(v({},d),{value:e.options[d.key],onChange:g=>a(d.key,g.target.value)})),i=d=>n({type:h.SetHost,payload:d.target.value}),u=d=>a("username",d.target.value),p=d=>a("password",d.target.value),l=d=>{d.preventDefault(),n({type:h.SetError,payload:""}),t.connect(e.host,e.options)},f=()=>n({type:h.SetShowOptions,payload:!e.showOptions});return o.createElement($,{classNames:["p-8","top-1/2","left-1/2 transform","-translate-x-1/2","-translate-y-1/2","w-96","max-w-full","max-h-full","overflow-auto"]},o.createElement("form",{className:"space-y-4",onSubmit:l},o.createElement("div",{className:"space-y-2"},o.createElement(K,{required:!0,placeholder:"Host",value:e.host,onChange:i}),o.createElement("div",{className:"flex space-x-2"},o.createElement(K,{placeholder:"Username",value:e.options.username,onChange:u}),o.createElement(K,{type:"password",placeholder:"Password",value:e.options.password,onChange:p}))),e.error&&o.createElement("div",{className:"bg-red-300 border border-red-500 text-red-500 p-2 rounded"},e.error),o.createElement("div",{className:"flex space-x-2"},o.createElement(U,{label:"Connect",type:"submit"}),o.createElement(U,{label:s,onClick:f})),o.createElement(B,{toggled:e.showOptions},o.createElement("div",{className:"px-2 text-sm"},r.map(E=>{var m=E,{component:d,key:g}=m,A=se(m,["component","key"]);const S=d;return o.createElement(S,v({key:g},A))})))))},Ke=()=>{const{state:t}=c.exports.useContext(T),e=[["Last server ping",t.stats.lastServerPing],["Last client echo",t.stats.lastClientEcho],["Client ping latency",t.stats.clientPingLatency],["Server ping latency",t.stats.serverPingLatency],["Server load",t.stats.serverLoad.join(" / ")],["Window count",t.windows.length]];return o.createElement("div",{className:"absolute bottom-1 left-1 p-1 z-0 opacity-50 bg-emerald-100 rounded"},o.createElement("table",{className:"text-xs"},o.createElement("tbody",null,e.map(([n,s])=>o.createElement("tr",{key:n},o.createElement("td",{className:"p-1"},n),o.createElement("td",{className:"p-1 text-right text-gray-500"},s))))))},je=()=>{const{wm:t,state:e,dispatch:n,xpra:s}=c.exports.useContext(T),[a,r]=c.exports.useState(!1),i=e.windows.filter(m=>m.minimized),u=e.windows.filter(m=>m.tray),p=[...e.menu.map(m=>({title:m.name,icon:m.icon,items:m.entries.map(S=>({title:S.name,icon:S.icon,callback:()=>{s.sendStartCommand(S.name,S.exec,!1)}}))})),{title:"Server",items:[{title:"Shutdown server",callback:()=>{confirm("Are you sure you want to shut down the server ?")&&s.sendShutdown()}}]}],l=()=>s.disconnect(),f=m=>S=>{S.stopPropagation(),S.preventDefault();const R=t.getWindow(m.id);R&&(t.restore(R),t.raise(R),n({type:h.RaiseWindow,payload:R.attributes}))},d=()=>r(!a),g=()=>{r(!1)},A=()=>s.clipboard.poll(),E=async()=>{(await Re()).forEach(({buffer:S,name:R,size:k,type:N})=>s.sendFile(R,N,k,S))};return o.createElement($,{classNames:["top-1","left-1/2","-translate-x-1/2","p-1","select-none"]},o.createElement("div",{className:"flex space-x-4 px-2"},o.createElement("div",{className:"flex space-x-1"},e.menu.length>0&&o.createElement(U,{transparent:!0,onClick:d},o.createElement("i",{className:"fa fa-bars pointer-events-none"}),o.createElement(B,{toggled:a},o.createElement(we,{items:p,onCallback:g}))),o.createElement(U,{transparent:!0,onClick:l},o.createElement("i",{className:"fa fa-unlink"})),e.options.clipboard&&o.createElement(U,{transparent:!0,onClick:A},o.createElement("i",{className:"fa fa-clipboard"})),e.options.fileTransfer&&o.createElement(U,{transparent:!0,onClick:E},o.createElement("i",{className:"fa fa-upload"}))),i.length>0&&o.createElement("div",{className:"flex space-x-1"},i.map(m=>o.createElement(U,{key:m.id,transparent:!0,onClick:f(m)},o.createElement("div",{className:"flex space-x-1 items-center",style:{maxWidth:"128px"}},o.createElement("div",{className:"w-4 h-4"},o.createElement(pe,{win:m})),o.createElement("div",{className:"truncate text-center text-sm"},m.title))))),u.length>0&&o.createElement("div",{className:"flex space-x-1"},u.map(m=>o.createElement("div",{key:m.id,className:"flex space-x-1 items-center"},o.createElement("div",{className:"flex items-center justify-center w-4 h-4 overflow-hidden",title:m.title},o.createElement(Q,{id:m.id})))))))},Qe=()=>{const{state:t,xpra:e}=c.exports.useContext(T),n=()=>e.disconnect();return o.createElement($,{classNames:["p-8","top-1/2","left-1/2 transform","-translate-x-1/2","-translate-y-1/2","w-96"]},o.createElement("div",{className:"space-y-4"},o.createElement("div",{className:"text-center"},"Connecting to ",t.host),o.createElement("div",null,o.createElement(U,{onClick:n},"Cancel"))))};/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */function $e(){const{state:t}=c.exports.useContext(T);return o.createElement(o.Fragment,null,o.createElement(B,{toggled:!t.connected},o.createElement(qe,null)),o.createElement(B,{toggled:!t.started&&t.connected},o.createElement(Qe,null)),o.createElement(Ge,null,t.connected&&o.createElement(Ke,null)),o.createElement(B,{toggled:t.started},o.createElement(je,null)))}function Je({xpra:t,wm:e}){return o.createElement(Fe,{wm:e,xpra:t},o.createElement($e,null))}function et(){return new Worker("assets/worker.25333acc.js",{type:"module"})}/**
 * Xpra Typescript Client Example
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */async function tt(){const t=document.querySelector("#app"),e=new et,n=new Me({worker:e}),s=new Ie(n);await n.init(),s.init(),t&&be.render(c.exports.createElement(Je,{xpra:n,wm:s}),t)}window.addEventListener("DOMContentLoaded",()=>{tt()});
//# sourceMappingURL=index.f6fd46a2.js.map
