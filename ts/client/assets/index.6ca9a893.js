var be=Object.defineProperty,We=Object.defineProperties;var ke=Object.getOwnPropertyDescriptors;var $=Object.getOwnPropertySymbols;var ie=Object.prototype.hasOwnProperty,le=Object.prototype.propertyIsEnumerable;var re=(e,t,n)=>t in e?be(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,E=(e,t)=>{for(var n in t||(t={}))ie.call(t,n)&&re(e,n,t[n]);if($)for(var n of $(t))le.call(t,n)&&re(e,n,t[n]);return e},W=(e,t)=>We(e,ke(t));var ce=(e,t)=>{var n={};for(var a in e)ie.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(e!=null&&$)for(var a of $(e))t.indexOf(a)<0&&le.call(e,a)&&(n[a]=e[a]);return n};import{l as De,f as Me,a as Oe,b as Re,c as Ie,r as d,R as o,C as ze,t as ye,F as Q,d as Pe}from"./vendor.83369c53.js";import{i as Ue,c as _e,a as de,p as Te,b as Fe,h as Xe,X as Be,d as Le,e as Ye,f as Ve}from"./shared.bbfff364.js";const Ge=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerpolicy&&(i.referrerPolicy=s.referrerpolicy),s.crossorigin==="use-credentials"?i.credentials="include":s.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}};Ge();/**
 * Xpra Typescript Client Example
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const He=[Me,Oe,Re,Ie];He.forEach(e=>De.add(e));/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const Z=(...e)=>e.join(" ");function ve(){localStorage.getItem("theme")==="dark"?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark")}function Ze(){const e=localStorage.getItem("theme");localStorage.setItem("theme",e==="dark"?"light":"dark"),ve()}function Ke(){const e=window.matchMedia("(prefers-color-scheme: dark)"),t=n=>{n.matches?localStorage.setItem("theme","dark"):localStorage.setItem("theme","light"),ve()};e.addEventListener("change",t),t(e)}function qe(e){if(e){const{image:t,xhot:n,yhot:a}=e;return`transparent url('${t}') no-repeat ${n}px ${a}px`}return""}function $e(e,t=""){if(e){const{image:n,xhot:a,yhot:s}=e,i=t?`, ${t}`:"";return`url('${n}') ${a} ${s}${i}`}return t}function me(e,t,n){let a="";const{width:s,height:i,x:l,y:u}=e.getBoundingClientRect(),f=t[0]-l,c=t[1]-u;return c<=n?a+="n":c>=i-n&&(a+="s"),f<=n?a+="w":f>=s-n&&(a+="e"),a}function ue(e){const{onDown:t,onMove:n,onRelease:a}=e();return s=>{s.preventDefault();const i=s.pageX,l=s.pageY;let u=!1;const f=g=>{g.stopPropagation();const C=g.pageX-i,y=g.pageY-l;u=!0,n(g,C,y)},c=g=>{window.removeEventListener("mousemove",f,!0),window.removeEventListener("mouseup",c,!0),a(g,u)};window.addEventListener("mousemove",f,!0),window.addEventListener("mouseup",c,!0),t&&t(s.nativeEvent,i,l)}}function pe({opacity:e}){if(typeof e=="number")return e<0?1:e/4294967296}/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */var v=(e=>(e.SetHost="SET_HOST",e.SetShowOptions="SET_SHOW_OPTIONS",e.AddWindow="ADD_WINDOW",e.RemoveWindow="REMOVE_WINDOW",e.SetWindowIcon="SET_WINDOW_ICON",e.SetConnected="SET_CONNECTED",e.SetCursor="SET_CURSOR",e.UpdateStats="UPDATE_STATS",e.MoveResizeWindow="MOVE_RESIZE_WINDOW",e.MaximizeWindow="MAXIMIZE_WINDOW",e.UpdateMetadata="UPDATE_METADATA",e.RaiseWindow="RAISE_WINDOW",e.AddNotification="ADD_NOTIFICATION",e.RemoveNotification="REMOVE_NOTIFICATION,",e.SetDraggingWindow="SET_DRAGGING_WINDOW",e.ClearWindows="CLEAR_WINDOWS",e.SetOption="SET_OPTION",e.UpdateMenu="UPDATE_MENU",e.SetError="SET_ERROR",e.SetStarted="SET_STARTED",e))(v||{});let fe=1;const J={connect:!1,host:"ws://127.0.0.1:10000",showOptions:!1,connected:!1,cursor:null,windows:[],notifications:[],activeWindow:0,draggingWindow:-1,actualDesktopSize:[0,0],stats:E({},Ue),options:E({},_e()),menu:[],error:"",started:!1};function je(e,t){var a,s;const n=(i,l)=>{const u=e.windows,f=u.find(c=>c.id===i);return f&&Object.assign(f,l(f)),W(E({},e),{windows:u})};switch(t.type){case"SET_HOST":return W(E({},e),{host:t.payload});case"SET_SHOW_OPTIONS":return W(E({},e),{showOptions:t.payload});case"ADD_WINDOW":const i=!!t.payload.metadata.tray;return W(E({},e),{activeWindow:t.payload.id,windows:[...e.windows,{id:t.payload.id,minimized:t.payload.metadata.iconic===!0,maximized:!1,title:t.payload.metadata.title||String(t.payload.id),position:t.payload.position,dimension:t.payload.dimension,minDimension:(a=t.payload.metadata["size-constraints"])==null?void 0:a["minimum-size"],maxDimension:(s=t.payload.metadata["size-constraints"])==null?void 0:s["maximum-size"],opacity:pe(t.payload.metadata),tray:i,zIndex:i?0:de(t.payload,++fe)}]});case"REMOVE_WINDOW":const{windows:l}=e,u=l.findIndex(k=>k.id===t.payload);u!==-1&&l.splice(u,1);const f=l.length>0?l[l.length-1].id:0;return W(E({},e),{activeWindow:f,windows:l});case"SET_WINDOW_ICON":const c=t.payload;return n(c.wid,()=>({icon:c}));case"SET_CONNECTED":return W(E({},e),{started:!1,windows:t.payload?e.windows:[],connected:t.payload});case"SET_CURSOR":return W(E({},e),{cursor:t.payload});case"UPDATE_STATS":return W(E({},e),{stats:E(E({},e.stats),t.payload)});case"MOVE_RESIZE_WINDOW":const{wid:g,position:C,dimension:y}=t.payload;return n(g,k=>({position:C||k.position,dimension:y||k.dimension}));case"MAXIMIZE_WINDOW":const{maximize:x}=t.payload;return n(t.payload.wid,k=>({oldPosition:x?k.position:void 0,oldDimension:x?k.dimension:void 0,position:x?t.payload.position:k.oldPosition,dimension:x?t.payload.dimension:k.oldDimension,maximized:x}));case"UPDATE_METADATA":const{title:r,iconic:w}=t.payload.metadata;return n(t.payload.wid,k=>({opacity:pe(t.payload.metadata),minimized:w===void 0?k.minimized:w===!0,title:r===void 0?k.title:r}));case"RAISE_WINDOW":return W(E({},n(t.payload.id,()=>({zIndex:de(t.payload,++fe)}))),{activeWindow:t.payload.id});case"ADD_NOTIFICATION":return W(E({},e),{notifications:[...e.notifications,t.payload]});case"REMOVE_NOTIFICATION,":const{notifications:S}=e,R=S.findIndex(([k])=>k.id===t.payload);return R!==-1&&S.splice(R,1),W(E({},e),{notifications:S});case"SET_DRAGGING_WINDOW":return W(E({},e),{draggingWindow:t.payload});case"CLEAR_WINDOWS":return W(E({},e),{cursor:null,windows:[],notifications:[],draggingWindow:-1});case"SET_OPTION":const[M,N]=t.payload;return W(E({},e),{options:W(E({},e.options),{[M]:N})});case"UPDATE_MENU":return W(E({},e),{menu:t.payload});case"SET_ERROR":return W(E({},e),{error:t.payload});case"SET_STARTED":return W(E({},e),{started:t.payload});default:return e}}/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const T=d.exports.createContext({wm:null,xpra:null,state:J,root:null,setRoot:()=>{},setCursor:()=>{},dispatch:()=>{}}),Qe=Te(window.location.search,{booleans:["connect"],required:["connect","host"]}),Je=Fe(),et=W(E(E({},J),Qe),{options:E(E({},J.options),Je)}),tt=({children:e,wm:t,xpra:n})=>{const[a,s]=d.exports.useReducer(je,et),[i,l]=d.exports.useState(null),[u,f]=d.exports.useState(null),c=()=>{s({type:v.SetConnected,payload:!0}),s({type:v.SetError,payload:""})},g=m=>{s({type:v.SetConnected,payload:m!=="disconnected"}),s({type:v.ClearWindows})},C=m=>s({type:v.AddWindow,payload:m}),y=m=>{s({type:v.RemoveWindow,payload:m}),t.removeWindow(m)},x=m=>s({type:v.SetWindowIcon,payload:m}),r=m=>s({type:v.UpdateStats,payload:m}),w=m=>s({type:v.SetCursor,payload:m}),S=m=>s({type:v.MoveResizeWindow,payload:m}),R=m=>{const U=t.getWindow(m);U&&s({type:v.RaiseWindow,payload:U.attributes})},M=m=>s({type:v.UpdateMetadata,payload:m}),N=m=>{},k=async m=>s({type:v.AddNotification,payload:[m,await t.createNotification(m)]}),K=m=>s({type:v.RemoveNotification,payload:m}),Y=m=>{if(u){const[U,L]=m.position;Object.assign(u.style,{left:`${U}px`,top:`${L}px`})}},F=m=>s({type:v.SetError,payload:m}),V=m=>s({type:v.UpdateMenu,payload:m}),G=()=>s({type:v.SetStarted,payload:!0}),H=(m,U)=>{if(m.digest.startsWith("keycloak"))Xe(m,U);else{const L=prompt("Login password");U(L||"")}};return d.exports.useEffect(()=>(n.on("connect",c),n.on("disconnect",g),n.on("newWindow",C),n.on("removeWindow",y),n.on("windowIcon",x),n.on("pong",r),n.on("cursor",w),n.on("moveResizeWindow",S),n.on("updateWindowMetadata",M),n.on("raiseWindow",R),n.on("initiateMoveResize",N),n.on("showNotification",k),n.on("hideNotification",K),n.on("pointerPosition",Y),n.on("newTray",C),n.on("updateXDGMenu",V),n.on("error",F),n.on("sessionStarted",G),n.on("challengePrompt",H),()=>{n.off("connect",c),n.off("disconnect",g),n.off("newWindow",C),n.off("removeWindow",y),n.off("windowIcon",x),n.off("pong",r),n.off("cursor",w),n.off("moveResizeWindow",S),n.off("updateWindowMetadata",M),n.off("raiseWindow",R),n.off("initiateMoveResize",N),n.off("showNotification",k),n.off("hideNotification",K),n.off("pointerPosition",Y),n.off("newTray",C),n.off("updateXDGMenu",V),n.off("error",F),n.off("sessionStarted",G),n.off("challengePrompt",H)}),[]),d.exports.useEffect(()=>{a.connect&&n.connect(a.host,a.options)},[]),d.exports.useEffect(()=>{t.setDesktopElement(i)},[i]),d.exports.useEffect(()=>{t.setActiveWindow(a.activeWindow)},[a.activeWindow]),o.createElement(T.Provider,{value:{state:a,dispatch:s,root:i,wm:t,xpra:n,setRoot:l,setCursor:f}},e)};/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const nt=300,B=({toggled:e,children:t,mountOnEnter:n=!0,unmountOnExit:a=!0})=>o.createElement(ze,{in:e,timeout:nt,mountOnEnter:n,unmountOnExit:a,classNames:"fade-on-out"},t);var ot="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAASdAAAEnQB3mYfeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAUdEVYdEF1dGhvcgBKYWt1YiBTdGVpbmVy5vv3LwAAADV0RVh0RGVzY3JpcHRpb24ASW52ZXJ0ZWQgdmFyaWFudCBvZiB0aGUgRE1aIGN1cnNvciB0aGVtZS5odVs8AAAAM3RFWHRTb3VyY2UAaHR0cDovL2ppbW1hYy5tdXNpY2hhbGwuY3ovdGhlbWVzLnBocD9za2luPTdQM5WxAAADwUlEQVRYhe2WTUhsZRjHf+PVcdLU48d1GkMvdwI185ZIzEYpaKttWqhcKhlFF65USjcK6equNFJbCEokiISiochQgfmBaI6CKGmg5MeIwpBXZpIRPec8LWb0Wte6c1SsRX94eDcvvD+er/8L/+sFEpFX/833o3Vd9zc3N78FxAIRdw0QKyISCAT8xcXFDuDlu4aIl5D8fr+voKDgbe44E/EiIu3t7eL3+8Xn8x3l5ua+GYIw3RlAeXm5FBUVSSAQEJ/Pd2i32x8BMbcBEVYqdV1nfn4ep9OJxWJJXFpa+t5msz0AXropRFgAmqahqiqTk5NUVVURGxtrXV1ddQFpgOUmEIYAVFVlYmKCuro6FEXJ8Hq93wE2IPq6EGEBiMgFgKqquFwuGhoaSE5Ofri/v/8t8Mp1IcIep8sAqqoyPj5Oa2srVqs1d29vbwiwAmajENcGUFWV4eFh2traSEtLy9/Z2fkGSDUKYWihXAUxMDBAZ2cn6enpjo2Nja+A+0YgDANcbsjz6O/vp6+vD7vd/t7a2tqXQAoQFQ6EIYC/NuPl6OnpYXBwkKysrPdXVla+CBfC8E6/6vHzrHR3dzM8PExOTs4HCwsLT4BkIPKfICKNAlwuAYDD4cBisWA2m4mOjmZxcZG8vDzy8/M/mpmZ+b2wsPAz4ClwZvQtCHlBSUmJABcRGRkpcXFxYrVaxe12y99J13WZnp5+Aii3lgGAsrIyxsbGUFWVrq4uent76ejo+GFoaOgns9l8bDKZxGQy6WazOSAivxJcUtfScxmora0VXdelpqZGEhISxGazyebmpni93qdAEfA6YAceAg8ILqiYWwFoaGgQXdfl9PRU9Xg8oiiKpKSkSH19vWiaJk1NTY0EvcEM3AtFBDcwqwuAxsZGERFZXFxcdzqdn2uaJtXV1aIoimRkZMjBwYEcHBx4gDe4oUM+BzA3Nye6rsvs7OwK8DFQcHR05Nna2hJFUSQ1NVVaWlpEVVWprKysIDh+t/Jtiz/v5qmpqSXgQ+ARkDw6OvpY0zSpqKiQpKQkyczMlOPjY1leXp4DXiO4hG4HYH5+/kegDMgF4ghOj+L3+/c2NjYkMTFRsrOz5fDwUNbX138OQd5KGWJ3d3e/Bt4Bsnn2LTcBUS6X6/HZ2Zlsb29LIBCQk5MTvbS0tCV017A1X6UoIJGgw8Xw57qagPiRkZFPPB7PL2632+1wOD4F3iXoA2H1wIsITQRHSQA9dF7WPYIluU/wg3oC/Ab4APWK+4YBwlEEz2ZeC8X54vrv6w+aYEf+AZkZtAAAAABJRU5ErkJggg==";/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const Ee=16;let ge=!1;const at=({win:e,bar:t,winstance:n})=>{const{oldPosition:a,oldDimension:s}=e,{wm:i,xpra:l,root:u,dispatch:f}=d.exports.useContext(T),c="w-4 h-4 rounded-full cursor-pointer bg-gradient-to-b shadow-inner hover:shadow",g=y=>{y.stopPropagation(),y.preventDefault()},C=()=>{if(t.current&&u)if(e.maximized)a&&s&&(i.maximize(n,a,s),f({type:v.MaximizeWindow,payload:{wid:e.id,maximize:!1}}));else{const x=t.current.offsetHeight,r=u.offsetWidth,w=u.offsetHeight-x;i.maximize(n,[0,x],[r,w]),f({type:v.MaximizeWindow,payload:{wid:e.id,position:[0,x],dimension:[r,w],maximize:!0}})}};return o.createElement("div",{className:"flex items-center space-x-2",onMouseDown:g},o.createElement("div",{title:"Minimize",className:`${c} from-green-300 to-green-500 hover:from-green-400`,onClick:()=>i.minimize(n)}),o.createElement("div",{title:"Maximize",className:`${c} from-blue-300 to-blue-500 hover:from-blue-400`,onClick:C}),!l.isReadOnly()&&o.createElement("div",{title:"Close",className:`${c} from-red-300 to-red-500 hover:from-red-400`,onClick:()=>i.close(n)}))},he=({win:{icon:e,title:t}})=>o.createElement(o.Fragment,null,e&&o.createElement("img",{alt:t,src:e.image,className:"max-h-full"}),!e&&o.createElement("div",{className:"h-full w-full rounded bg-gray-500"})),ee=({id:e})=>{const t=d.exports.useRef(null),{wm:n,state:a}=d.exports.useContext(T),s=n.getWindow(e),i=a.draggingWindow>=0?"pointer-events-none":"",l=c=>{n.mouseButton(s,c.nativeEvent,!0)},u=c=>{c.stopPropagation(),n.mouseButton(s,c.nativeEvent,!1)},f=c=>{c.preventDefault(),c.stopPropagation(),n.mouseMove(s,c.nativeEvent)};return d.exports.useEffect(()=>{t.current&&(s==null?void 0:s.canvas)&&t.current.appendChild(s.canvas)},[t.current]),o.createElement("div",{ref:t,className:i,onMouseDown:l,onMouseUp:u,onMouseMove:f})},st=({win:e})=>{var se;const{id:t,position:n,dimension:a,title:s,minimized:i,maximized:l,opacity:u,zIndex:f,minDimension:c,maxDimension:g}=e,[C,y]=d.exports.useState("default"),{wm:x,dispatch:r,xpra:w}=d.exports.useContext(T),S=d.exports.useRef(null),R=d.exports.useRef(null),M=d.exports.useRef(null),N=x.getWindow(t),k={opacity:u,zIndex:f},K={cursor:C},Y={toggled:!i,mountOnEnter:!1,unmountOnExit:!1},F=(p,b,A,h,D=!1)=>{S.current&&Object.assign(S.current.style,{left:`${p}px`,top:`${b}px`,width:`${A}px`,height:`${h}px`}),N!=null&&N.canvas&&Object.assign(N.canvas.style,{width:`${A}px`,height:`${h}px`}),D&&r({type:v.MoveResizeWindow,payload:{wid:t,position:[p,b],dimension:[A,h]}})},V=(p=!1)=>{const[b,A]=n,[h,D]=a;F(b,A,h,D,p)},G=p=>(b,A,h,D,I)=>{const[z,P]=c||[100,100],[_,q]=g||[Number.MAX_VALUE,Number.MAX_VALUE];h=Math.min(_,Math.max(z,h)),D=Math.min(q,Math.max(P,D)),p(b,A,h,D,I)},H=G((p,b,A,h)=>{!w.isReadOnly()&&!l&&F(p,b,A,h),U(!0)}),m=G((p,b,A,h,D)=>{U(!1),!w.isReadOnly()&&!l&&(F(p,b,A,h,!0),D&&x.moveResize(N,[p,b],[A,h]))}),U=p=>{(!p||!ge)&&r({type:v.SetDraggingWindow,payload:p?t:-1}),ge=p},L=p=>{p.preventDefault(),p.stopPropagation()},ae=p=>{p.preventDefault(),p.stopPropagation(),x.raise(N),r({type:v.RaiseWindow,payload:N.attributes})},Ae=ye(p=>{if(M.current){const b=me(M.current,[p.pageX,p.pageY],Ee);y(`${b}-resize`)}else y("default")},100),Ce=d.exports.useCallback(ue(()=>{const[p,b]=a;let[A,h]=n,D=0;return{onDown(){var I;D=((I=R.current)==null?void 0:I.offsetHeight)||0},onMove(I,z,P){A=n[0]+z,h=Math.max(D,n[1]+P),H(A,h,p,b),U(!0)},onRelease(I,z){m(A,h,p,b,z)}}}),[n,a]),Ne=d.exports.useCallback(ue(()=>{let p="",b=0,[A,h]=n,[D,I]=a;return{onDown(z,P,_){var q;z.stopPropagation(),M.current&&(p=me(M.current,[P,_],Ee),b=((q=R.current)==null?void 0:q.offsetHeight)||0)},onMove(z,P,_){p.startsWith("n")?(h=n[1]+_,h>b?I=a[1]-_:h=b):p.startsWith("s")&&(I=a[1]+_),p.endsWith("w")?(D=a[0]-P,A=n[0]+P):p.endsWith("e")&&(D=a[0]+P),H(A,h,D,I)},onRelease(z,P){m(A,h,D,I,P)}}}),[M,n,a]);return d.exports.useEffect(()=>{V()},[n,a]),d.exports.useEffect(()=>{V()},[S]),d.exports.useEffect(()=>{var D,I;if((D=N==null?void 0:N.attributes)!=null&&D.overrideRedirect)return;const[p,b]=n,[A,h]=a;if(!w.isReadOnly()){const z=((I=R.current)==null?void 0:I.offsetHeight)||0;if(p<=0||b<=z){const _=z;x.moveResize(N,[100,_],[A,h]),F(100,_,A,h,!0)}}},[]),(se=N==null?void 0:N.attributes)!=null&&se.overrideRedirect?o.createElement(B,E({},Y),o.createElement("div",{className:"absolute cursor-default bg-black shadow",ref:S,style:k,onMouseDown:ae,onMouseUp:L},o.createElement(ee,{id:t}))):o.createElement(B,E({},Y),o.createElement("div",{ref:S,style:k,className:"absolute",onMouseDown:ae,onMouseUp:L,onMouseMove:Ae},o.createElement("div",{ref:M,className:"absolute -inset-x-2 -top-10 -bottom-2 z-10",style:K,onMouseDown:Ne}),o.createElement("div",{className:"relative z-20 h-full w-full shadow-xl outline outline-1 outline-gray-200 dark:outline-gray-900"},o.createElement("div",{className:"absolute -top-8 flex h-8 w-full cursor-default items-center space-x-2 bg-gray-100 p-1 px-2 outline outline-1 outline-gray-200 dark:bg-gray-900 dark:text-white dark:outline-gray-900",ref:R,onMouseDown:Ce},o.createElement("div",{className:"flex items-center justify-center",style:{width:"16px",height:"16px"}},o.createElement(he,{win:e})),o.createElement("div",{className:"grow truncate text-sm"},o.createElement("span",null,s||t)),o.createElement(at,{winstance:N,win:e,bar:R,outer:S})),o.createElement("div",{className:"xpra-window-canvas h-full w-full bg-black"},o.createElement(ee,{id:t})))))},rt=({children:e})=>{const t=d.exports.createRef(),n=d.exports.createRef(),{wm:a,state:s,setRoot:i,setCursor:l}=d.exports.useContext(T),u=ye(r=>{a.mouseMove(null,r.nativeEvent)},200),f=r=>{r.preventDefault()},c=d.exports.useCallback(r=>{a.mouseButton(null,r,!0)},[]),g=d.exports.useCallback(r=>{a.mouseButton(null,r,!1)},[]),C=E({dimension:[32,32],xhot:8,yhot:3,image:ot},s.cursor||{}),y=`
.xpra-cursor {
  background: ${qe(C)};
}

.xpra-window-canvas {
  cursor: ${$e(s.cursor,"default")};
}
`,x=s.windows.filter(r=>!r.tray);return d.exports.useEffect(()=>{const r=t.current,w=S=>{r&&(r.contains(S.target)||r===S.target)&&document.activeElement&&document.activeElement.blur()};return r&&(i(r),r.addEventListener("click",w,!0)),()=>{r&&r.removeEventListener("click",w,!0)}},[t.current]),d.exports.useEffect(()=>{n.current&&l(n.current)},[n.current]),o.createElement(o.Fragment,null,o.createElement("div",{id:"xpra-desktop",className:"absolute inset-0 z-30 overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-300 to-emerald-500 dark:from-emerald-900 dark:via-emerald-700 dark:to-emerald-900",ref:t,onMouseMove:u,onContextMenu:f,onMouseDown:c,onMouseUp:g},s.connected&&x.map(r=>o.createElement(st,{key:r.id,win:r})),e),o.createElement("div",{ref:n,className:"xpra-cursor absolute z-50"}),o.createElement("style",null,y))};/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */let xe=1;const te="bg-white/80 dark:bg-black/80 dark:text-white",ne="rounded border-none p-1 px-2 disabled:opacity-40 disabled:cursor-not-allowed hover:outline hover:outline-1 w-full",we=({disabled:e,label:t,value:n,required:a,options:s,onChange:i})=>{const l=`xpra_${++xe}`,u=Z(ne,te);return o.createElement("div",null,t&&o.createElement("label",{htmlFor:l},t),o.createElement("div",null,o.createElement("select",{className:u,id:l,required:a,disabled:e,defaultValue:n,onChange:i},Object.entries(s).map(([f,c])=>o.createElement("option",{key:f,value:f},c)))))},X=({children:e,disabled:t,label:n,type:a,transparent:s,onClick:i})=>{const l=[];return s||l.push(te),o.createElement("button",{className:Z(ne,...l),disabled:t,type:a||"button",onClick:i},n||e)},j=({disabled:e,label:t,value:n,type:a,placeholder:s,required:i,onChange:l})=>{const u=`xpra_${++xe}`,f=Z(ne,te);return o.createElement("div",null,t&&o.createElement("label",{htmlFor:u},t),o.createElement("div",null,o.createElement("input",{type:a||"text",className:f,id:u,placeholder:s,required:i,disabled:e,defaultValue:n,onInput:l})))},O=({label:e,value:t,onChange:n})=>o.createElement("div",{className:"select-none"},o.createElement("label",{className:"inline-flex cursor-pointer items-center space-x-2"},o.createElement("input",{type:"checkbox",defaultChecked:t,onChange:n}),o.createElement("span",null,e)));/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */const it=["shadow-lg","bg-emerald-100/50","dark:bg-emerald-900/50","opacity-90","rounded"],Se=({items:e,onCallback:t=()=>{},root:n=!0})=>{const a=d.exports.useRef(null),[s,i]=d.exports.useState(-1),l=["max-h-96","max-w-xs"];n?l.push("top-full","left-0"):l.push("top-0","left-full","overflow-auto");const u=g=>i(g),f=()=>i(-1),c=g=>{g&&g(),t()};if(n){const g=C=>{if(a.current){const y=C.target;y&&(a.current.contains(y)||y===a.current.parentNode)||c()}};d.exports.useEffect(()=>(document.addEventListener("click",g),()=>{document.removeEventListener("click",g)}),[a])}return o.createElement("div",{ref:a,className:Z("absolute","shadow","bg-emerald-100/80","dark:bg-emerald-900/80","dark:text-white",...l),onMouseLeave:f},e.map(({icon:g,title:C,items:y,callback:x},r)=>o.createElement("div",{key:r,className:"relative text-left"},o.createElement("div",{className:"flex items-center space-x-2 truncate p-2 hover:bg-white",onClick:()=>c(x),onMouseOver:()=>u(r)},g&&o.createElement("img",{src:g,className:"h-4 w-4"}),o.createElement("span",{className:"grow"},C),y&&y.length&&o.createElement(Q,{icon:"chevron-right"})),s===r&&y&&y.length>0&&o.createElement(Se,{root:!1,items:y}))))},oe=({classNames:e,children:t})=>{const n=Z("absolute","z-50",...it,...e),a=s=>{s.preventDefault()};return o.createElement("div",{className:n,onContextMenu:a},t)},lt=()=>{const{xpra:e,state:t,dispatch:n}=d.exports.useContext(T),a=t.showOptions?"Hide options":"Show options",s=(r,w)=>n({type:v.SetOption,payload:[r,w]}),i=Object.fromEntries(["CBC","CFB","CTR"].map(r=>`AES-${r}`).map(r=>[r,r])),l=[{key:"reconnect",label:"Automatically reconnect",component:O},{key:"shareSession",label:"Share Session",component:O},{key:"stealSession",label:"Steal Session",component:O},{key:"clipboard",label:"Clipboard",component:O},{key:"clipboardImages",label:"Clipboard Images",component:O},{key:"fileTransfer",label:"File Transfer",component:O},{key:"printing",label:"Printing",component:O},{key:"bell",label:"Bell",component:O},{key:"notifications",label:"Notifications",component:O},{key:"openUrl",label:"Open URLs",component:O},{key:"audio",label:"Audio",component:O},{key:"showStartMenu",label:"XDG Menu",component:O},{key:"swapKeys",label:"Swap Ctrl and Cmd key",component:O},{key:"reverseScrollX",label:"Reverse X scroll",component:O},{key:"reverseScrollY",label:"Reverse Y scroll",component:O},{key:"keyboardLayout",label:"Keyboard Layout",component:we,options:Be}].map(r=>W(E({},r),{value:t.options[r.key],onChange:w=>s(r.key,w.target.value)})),u=r=>n({type:v.SetHost,payload:r.target.value}),f=r=>s("username",r.target.value),c=r=>s("password",r.target.value),g=r=>s("encryption",r.target.value||null),C=r=>s("encryptionKey",r.target.value),y=r=>{r.preventDefault(),n({type:v.SetError,payload:""}),e.connect(t.host,t.options)},x=()=>n({type:v.SetShowOptions,payload:!t.showOptions});return o.createElement(oe,{classNames:["p-8","top-1/2","left-1/2 transform","-translate-x-1/2","-translate-y-1/2","w-11/12","max-w-xl","max-h-full","overflow-auto"]},o.createElement("form",{className:"space-y-4",onSubmit:y},o.createElement("div",{className:"space-y-2"},o.createElement(j,{required:!0,placeholder:"Host",value:t.host,onChange:u}),o.createElement("div",{className:"grid grid-cols-2 gap-2"},o.createElement(j,{placeholder:"Username",value:t.options.username,onChange:f}),o.createElement(j,{type:"password",placeholder:"Password",value:t.options.password,onChange:c}),o.createElement(we,{value:t.options.encryption||"",options:E({"":"No encryption"},i),onChange:g}),o.createElement(j,{type:"password",placeholder:"Encryption key",value:t.options.encryptionKey,onChange:C}))),t.error&&o.createElement("div",{className:"rounded border border-red-500 bg-red-300 p-2 text-red-500"},t.error),o.createElement("div",{className:"flex space-x-2"},o.createElement(X,{label:"Connect",type:"submit"}),o.createElement(X,{label:a,onClick:x})),o.createElement(B,{toggled:t.showOptions},o.createElement("div",{className:"px-2 text-sm"},l.map(R=>{var M=R,{component:r,key:w}=M,S=ce(M,["component","key"]);const N=r;return o.createElement(N,E({key:w},S))})))))},ct=()=>{const{state:e}=d.exports.useContext(T),t=[["Last server ping",e.stats.lastServerPing],["Last client echo",e.stats.lastClientEcho],["Client ping latency",e.stats.clientPingLatency],["Server ping latency",e.stats.serverPingLatency],["Server load",e.stats.serverLoad.join(" / ")],["Window count",e.windows.length]];return o.createElement("div",{className:"absolute bottom-1 left-1 z-0 rounded bg-emerald-100 p-1 opacity-50"},o.createElement("table",{className:"text-xs"},o.createElement("tbody",null,t.map(([n,a])=>o.createElement("tr",{key:n},o.createElement("td",{className:"p-1"},n),o.createElement("td",{className:"p-1 text-right text-gray-500"},a))))))},dt=()=>{const{wm:e,state:t,dispatch:n,xpra:a}=d.exports.useContext(T),[s,i]=d.exports.useState(!1),l=t.windows.filter(r=>r.minimized),u=t.windows.filter(r=>r.tray),f=[...t.menu.map(r=>({title:r.name,icon:r.icon,items:r.entries.map(w=>({title:w.name,icon:w.icon,callback:()=>{a.sendStartCommand(w.name,w.exec,!1)}}))})),{title:"Server",items:[{title:"Shutdown server",callback:()=>{confirm("Are you sure you want to shut down the server ?")&&a.sendShutdown()}}]},{title:"Disconnect",callback:()=>a.disconnect()}],c=r=>w=>{w.stopPropagation(),w.preventDefault();const S=e.getWindow(r.id);S&&(e.restore(S),e.raise(S),n({type:v.RaiseWindow,payload:S.attributes}))},g=()=>i(!s),C=()=>{i(!1)},y=()=>a.clipboard.poll(),x=async()=>{(await Le()).forEach(({buffer:w,name:S,size:R,type:M})=>a.sendFile(S,M,R,w))};return o.createElement(oe,{classNames:["top-1","left-1/2","-translate-x-1/2","p-1","select-none"]},o.createElement("div",{className:"flex space-x-4 px-2"},o.createElement("div",{className:"flex space-x-1"},o.createElement(X,{transparent:!0,onClick:g},o.createElement(Q,{icon:"bars",className:"pointer-events-none"}),o.createElement(B,{toggled:s},o.createElement(Se,{items:f,onCallback:C}))),t.options.clipboard&&o.createElement(X,{transparent:!0,onClick:y},o.createElement(Q,{icon:"clipboard"})),t.options.fileTransfer&&o.createElement(X,{transparent:!0,onClick:x},o.createElement(Q,{icon:"upload"}))),l.length>0&&o.createElement("div",{className:"flex space-x-1"},l.map(r=>o.createElement(X,{key:r.id,transparent:!0,onClick:c(r)},o.createElement("div",{className:"flex items-center space-x-1",style:{maxWidth:"128px"}},o.createElement("div",{className:"h-4 w-4"},o.createElement(he,{win:r})),o.createElement("div",{className:"truncate text-center text-sm"},r.title))))),u.length>0&&o.createElement("div",{className:"flex space-x-1"},u.map(r=>o.createElement("div",{key:r.id,className:"flex items-center space-x-1"},o.createElement("div",{className:"flex h-4 w-4 items-center justify-center overflow-hidden",title:r.title},o.createElement(ee,{id:r.id})))))))},mt=()=>{const{state:e,xpra:t}=d.exports.useContext(T),n=()=>t.disconnect();return o.createElement(oe,{classNames:["p-8","top-1/2","left-1/2 transform","-translate-x-1/2","-translate-y-1/2","w-96"]},o.createElement("div",{className:"space-y-4"},o.createElement("div",{className:"text-center"},"Connecting to ",e.host),o.createElement("div",null,o.createElement(X,{onClick:n},"Cancel"))))};/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */function ut(){const{state:e,xpra:t}=d.exports.useContext(T),n=t.getOptions().showStatistics,a=()=>Ze();return o.createElement(o.Fragment,null,o.createElement(B,{toggled:!e.connected},o.createElement(lt,null)),o.createElement(B,{toggled:!e.started&&e.connected},o.createElement(mt,null)),o.createElement(rt,null,e.connected&&n&&o.createElement(ct,null)),o.createElement(B,{toggled:e.started},o.createElement(dt,null)),o.createElement("div",{className:"fixed right-0 bottom-0 z-50 space-y-2 p-2 text-right text-xs opacity-50"},o.createElement("div",{className:"cursor-pointer underline"},o.createElement("span",{onClick:a},"Toggle dark mode")),o.createElement("div",null,o.createElement("a",{className:"underline",rel:"noreferrer",target:"_blank",href:"https://github.com/andersevenrud/xpra-html5-client"},"xpra-html5-client on Github"))))}function pt({xpra:e,wm:t}){return o.createElement(tt,{wm:t,xpra:e},o.createElement(ut,null))}function ft(){return new Worker("assets/worker.573f1ea1.js",{type:"module"})}function Et(){return new Worker("assets/decoder.90ce1009.js",{type:"module"})}/**
 * Xpra Typescript Client Example
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */async function gt(){const e=document.querySelector("#app"),t=new ft,n=new Et,a=new Ye({worker:t,decoder:n}),s=new Ve(a);await a.init(),s.init(),e&&Pe.render(d.exports.createElement(pt,{xpra:a,wm:s}),e)}window.addEventListener("DOMContentLoaded",()=>{Ke(),gt()});
//# sourceMappingURL=index.6ca9a893.js.map