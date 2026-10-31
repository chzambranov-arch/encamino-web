const $=id=>document.getElementById(id);
const qsa=(s,el)=>Array.from((el||document).querySelectorAll(s));
const body=document.body;
let lang="es";
try{const s=localStorage.getItem("ec-lang");if(s==="en"||s==="es")lang=s;else if((navigator.language||"").toLowerCase().startsWith("en"))lang="en"}catch(e){}
const T=(es,en)=>lang==="en"?en:es;
const L=(o,en)=>typeof o==="object"?`<span class="es">${o.es}</span><span class="en">${o.en}</span>`:`<span class="es">${o}</span><span class="en">${en}</span>`;
const tx=o=>lang==="en"?o.en:o.es;
const sv=v=>typeof v==="object"?tx(v):v;
const nf=(x,d)=>{d=d||0;return (+x).toLocaleString(lang==="en"?"en-US":"es-CL",{minimumFractionDigits:d,maximumFractionDigits:d})};
const clock=m=>{const t=7*60+Math.round(m);const h=Math.floor(t/60),mm=((t%60)+60)%60;return h+":"+String(mm).padStart(2,"0")};
const reduce=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
const LOGO=document.querySelector(".brand img").src;
