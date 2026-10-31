// Verificación con Playwright: números contra los reels, modo juego para celular (navegador de Instagram),
// links por reel, hojas inferiores, compartir, biblioteca y capturas.
// Uso: node tests/verify.js   (THREE_JS, FONTS_DIR y PW opcionales: ver tests/env.js)
const {chromium}=require(process.env.PW||"playwright");
const fs=require("fs"),path=require("path");
const serve=require("./serve.js"),env=require("./env.js");
const OUT=path.resolve(__dirname,"../capturas");fs.mkdirSync(OUT,{recursive:true});
for(const f of fs.readdirSync(OUT))fs.unlinkSync(path.join(OUT,f));
const IG="Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.0 (iPhone14,5; iOS 17_5; es_CL; es; scale=3.00; 1170x2532)";
const checks=[];
function ok(name,cond,got){checks.push({name,pass:!!cond,got});console.log((cond?"PASS ":"FAIL ")+name+(got!==undefined?"  → "+JSON.stringify(got):""))}
const near=(a,b,t)=>Math.abs(a-b)<=t;
const BASE="http://127.0.0.1:8790/index.html";
const es1=x=>x.toLocaleString("es-CL",{minimumFractionDigits:1,maximumFractionDigits:1});

(async()=>{
 const srv=await serve(8790);const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const mk=async(vp,mobile,ua)=>{const ctx=await b.newContext({viewport:vp,locale:"es-CL",isMobile:!!mobile,hasTouch:!!mobile,deviceScaleFactor:mobile?2:1,userAgent:ua,permissions:["clipboard-read","clipboard-write"]});const p=await ctx.newPage();p.errs=[];p.on("pageerror",e=>p.errs.push(e.message));await env(p);return p};
 const shot=(p,name,full)=>p.screenshot({path:`${OUT}/${name}.png`,fullPage:!!full,timeout:120000});
 const metrics=p=>p.$$eval(".m",a=>a.map(e=>({v:e.querySelector(".mv").textContent,l:e.querySelector(".ml").textContent,cur:e.classList.contains("cur")})));
 const setR=(p,id,w,k,v)=>p.$eval(`#c-${id}-${w}-${k}`,(el,v)=>{el.value=v;el.dispatchEvent(new Event("input",{bubbles:true}))},v);

 /* ---------- 1. Núcleo contra los reels ---------- */
 const d=await mk({width:1280,height:800});
 await d.goto(BASE);await d.waitForTimeout(3500);
 ok("three.js r149 cargado",await d.evaluate(()=>window.THREE&&THREE.REVISION==="149"));
 const n=await d.evaluate(()=>{const j=EC.bStats("juntos",30,6,20,0),bl=EC.bStats("bailey",30,6,20,0),s=EC.bStats("seis",30,6,20,0);const th=EC.fTheory(3,10,15,1);const f=EC.fila({c:3,lam:10,S:15,pol:"pool",cv:1});
  const nv=EC.nivel({p:.98,n:85,meta:98,round:true,days:24,pen:5,period:"dia",x:0});return{j,bl,s,th,jsq:EC.fJsq(3,10,15,1),sim:f.base,nv,am:EC.amazon({k:9,L:100,z:1}).E,am1:EC.amazon({k:1,L:100,z:1}).E,ik:EC.ikea({n:12,pi:3,X:0}).ref,up:EC.ups({W:60,X:150,v:25,G:20,pol:"evita",r:0})}});
 ok("Bailey · todos juntos: el último espera 80 y el promedio 40",n.j.max===80&&n.j.avg===40);
 ok("Bailey · regla de Bailey 16 min; un turno 0; todas terminan 8:40",n.bl.avg===16&&n.s.avg===0&&n.j.fin===100&&n.bl.fin===100);
 ok("Fila · fórmula: separadas 75 min, fila única 21,1 min, ocupación 83 %",near(n.th.asig,75,1e-9)&&near(n.th.pool,21.07,0.01)&&near(n.th.rho,0.8333,1e-3),[n.th.asig,n.th.pool]);
 ok("Fila · jefe de patio ≈ 25 min (estimador rápido)",near(n.jsq,24.6,1.2),n.jsq);
 ok("Fila · simulación larga coincide con la fórmula (±3 %)",near(n.sim.asig,75,2.25)&&near(n.sim.pool,21.07,0.65),n.sim);
 ok("Nivel · 24,2 %, máximo 2 fallas, 5,8 días, US$ 348",(n.nv.ref*100).toFixed(1)==="24.2"&&n.nv.fmax===2&&n.nv.bad.toFixed(1)==="5.8"&&Math.round(n.nv.year)===348);
 ok("Amazon · 50 → 10 m",n.am1===50&&n.am===10);
 ok("IKEA · 11,4 de cada 100",(n.ik*100).toFixed(1)==="11.4");
 ok("UPS · 38,4 s por maniobra y 61 h al año",Math.round(n.up.diff*10)===384&&Math.round(n.up.year)===61);
 const mc=await d.evaluate(()=>{const r=EC.rngFrom(2024);let pw=0;const N=120000;for(let k=0;k<N;k++){let f=0;for(let i=0;i<510;i++)if(r()<.02)f++;if(!EC.okDay(f,510,98,true))pw++}return[pw/N,EC.nivel({p:.98,n:85,meta:98,round:true,days:24,pen:5,period:"semana",x:0}).you]});
 ok("Nivel · semanal: fórmula = Monte Carlo (±0,5 pp)",near(mc[0],mc[1],0.005),mc);

 /* ---------- 2. Inicio y biblioteca ---------- */
 await shot(d,"escritorio_inicio",true);
 ok("Inicio · 6 portadas con miniatura 3D y 3 con número de reel, sin estrellas",(await d.$$("#cards .card img")).length===6&&(await d.$$("#cards .reeln")).length===3&&!(await d.textContent("#cards")).includes("★"));
 await d.evaluate(()=>location.hash="biblioteca");await d.waitForSelector("#shelves .book");
 ok("Biblioteca · 20 libros de colores en 4 estantes",(await d.$$("#shelves .book")).length===20&&(await d.$$("#shelves .shelf")).length===4);
 await shot(d,"escritorio_biblioteca",true);
 await d.click('#shelves [data-book="erlang1917"]');await d.waitForTimeout(1500);
 ok("Libro abierto · idea, ecuación y «Con tus números» (21,1 min)",(await d.textContent(".pidea")).includes("Erlang")&&(await d.$$(".bk-page .beq")).length===1&&(await d.textContent(".blive")).includes("21,1 min"));
 await shot(d,"escritorio_libro_erlang");await d.keyboard.press("Escape");
 const allb=await d.evaluate(async()=>{const out=[];for(const s of ECAPP.SOURCES){ECAPP.openBook(s.id);const pg=document.querySelector(".bk-page");out.push(!!(pg.querySelector(".beq")||pg.querySelector(".bigstat"))&&!!pg.querySelector(".blive")&&pg.querySelector(".blive").textContent.length>20)}document.querySelector(".bk-x").click();return out});
 ok("Los 20 libros traen su ecuación o dato y un cálculo con tus números",allb.every(Boolean),allb);
 ok("Cada fuente: autor, año, título, revista, tipo, laboratorio, idea ES/EN y link",await d.evaluate(()=>ECAPP.SOURCES.every(s=>s.au&&s.yr&&s.ti&&s.ve&&s.ty&&s.labs.length&&s.idea.es&&s.idea.en&&/^https:/.test(s.url))));

 /* ---------- 3. Escritorio ---------- */
 await d.evaluate(()=>location.hash="fila");await d.waitForSelector("#play");await d.waitForTimeout(1500);
 const lay=await d.evaluate(()=>{const k=document.getElementById("panel").getBoundingClientRect(),c=document.querySelector(".game canvas").getBoundingClientRect();return{full:c.width===innerWidth&&c.height===innerHeight,panelRight:k.left>innerWidth/2}});
 ok("Escritorio · escena a pantalla completa y panel a la derecha",lay.full&&lay.panelRight,lay);
 await d.click("#play");await d.waitForTimeout(2500);await shot(d,"escritorio_fila_simulando");await d.click("#skip").catch(()=>{});await d.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await d.waitForTimeout(900);await shot(d,"escritorio_fila_resultado");
 ok("Escritorio · sin errores de JavaScript",d.errs.length===0,d.errs);

 /* ---------- 4. Celular dentro de Instagram: preparar → ▶ Simular → resultado ---------- */
 const p=await mk({width:390,height:740},true,IG);
 await p.goto(BASE+"?reel=6");await p.waitForSelector("#play");await p.waitForTimeout(2500);
 ok("Link ?reel=6 abre directo el laboratorio, sin pasar por el inicio",await p.evaluate(()=>location.hash==="#fila"&&!document.getElementById("v-lab").hidden&&document.getElementById("v-inicio").hidden));
 const ui=await p.evaluate(()=>({canvas:(c=>c.width===innerWidth&&c.height===innerHeight)(document.querySelector(".game canvas").getBoundingClientRect()),scroll:document.documentElement.scrollHeight-innerHeight,ta:getComputedStyle(document.getElementById("stage")).touchAction,os:getComputedStyle(document.documentElement).overscrollBehaviorY,sw:document.documentElement.scrollWidth,inputs:document.querySelectorAll("#app input").length,buttons:[...document.querySelectorAll("#app button")].filter(b=>b.offsetParent).length,mode:ECAPP.mode}));
 ok("Escena 3D a pantalla completa, sin scroll ni desborde",ui.canvas&&ui.scroll<=1&&ui.sw<=390,ui);
 ok("Lienzo con touch-action:none y sin «tirar para recargar»",ui.ta==="none"&&ui.os==="none",ui);
 ok("Pantalla tranquila al llegar: título, situación, 2 reglas, ▶ Simular y 2 enlaces",ui.mode==="ready"&&ui.inputs===0&&ui.buttons<=7,ui);
 ok("La situación en una línea: «3 puertas · 10 camiones por hora · 15 min de descarga»",(await p.textContent(".sit")).includes("3 puertas · 10 camiones por hora"));
 ok("Elegir la regla: «Filas separadas» o «1 fila única»",(await p.$$("#rulepick button")).length===2&&(await p.getAttribute('#rulepick button[data-v="asig"]',"aria-pressed"))==="true");
 ok("Un solo botón protagonista: «▶ Simular la hora punta»",(await p.textContent("#play")).includes("Simular la hora punta"));
 ok("Una manito muestra dónde tocar, sin texto",await p.evaluate(()=>ECAPP.coach));
 await shot(p,"celular_ig_fila_preparar");
 const f0=await p.evaluate(()=>[ECAPP.renders,JSON.stringify(Array.from(ECAPP.S.fleet.cx).slice(0,12))]);await p.waitForTimeout(1500);const f1=await p.evaluate(()=>[ECAPP.renders,JSON.stringify(Array.from(ECAPP.S.fleet.cx).slice(0,12))]);
 ok("Nada avanza si no se pide simular (la maqueta está quieta)",f0[1]===f1[1]&&f1[0]-f0[0]<=1,{r0:f0[0],r1:f1[0]});
 const txy=await p.evaluate(()=>{const S=ECAPP.S,F=S.fleet,k=document.getElementById("panel").getBoundingClientRect();for(let i=0;i<F.n;i++){if(!F.on[i]||F.s[i]<0.5)continue;const v=new THREE.Vector3(F.cx[i],1.1*F.sc,F.cz[i]);S.root.localToWorld(v);v.project(S.cam);const x=(v.x+1)/2*innerWidth,y=(1-v.y)/2*innerHeight;if(y>90&&y<k.top-8)return[x,y]}return null});
 if(txy){await p.touchscreen.tap(txy[0],txy[1]);await p.waitForTimeout(250)}const bub=await p.evaluate(()=>{const b=document.getElementById("bubble");return b.hidden?"":b.textContent});
 ok("Tocar un camión (sin simular) cuenta su historia",/min|Descargando|Se va/.test(bub),{txy,bub});await shot(p,"celular_ig_toque_camion");await p.waitForTimeout(2700);
 const cam0=await p.evaluate(()=>ECAPP.cam);const bb=await (await p.$("#stage")).boundingBox();
 await p.mouse.move(bb.x+bb.width/2,bb.y+200);await p.mouse.down();await p.mouse.move(bb.x+20,bb.y+200,{steps:6});await p.mouse.up();await p.waitForTimeout(300);
 ok("Cámara fija: arrastrar el dedo no gira el mundo",JSON.stringify(cam0)===JSON.stringify(await p.evaluate(()=>ECAPP.cam)));
 await p.tap('#rulepick button[data-v="pool"]');await p.waitForTimeout(500);ok("Cambiar la regla no simula: solo prepara",(await p.evaluate(()=>ECAPP.mode))==="ready"&&(await p.getAttribute('#rulepick button[data-v="pool"]',"aria-pressed"))==="true");
 await p.tap('#rulepick button[data-v="asig"]');await p.waitForTimeout(400);
 await p.evaluate(()=>{window.__v=[];navigator.vibrate=x=>{window.__v.push(x);return true}});
 await p.tap("#play");await p.waitForTimeout(2600);
 const run=await p.evaluate(()=>({mode:ECAPP.mode,prog:parseFloat(document.getElementById("prog").style.width),clock:document.getElementById("clk").textContent,skip:!!document.getElementById("skip")}));
 ok("▶ Simular corre la hora punta con reloj, barra de avance y «Saltar al final»",run.mode==="run"&&run.prog>3&&/\d:\d\d/.test(run.clock)&&run.skip,run);
 await shot(p,"celular_ig_fila_simulando");
 await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await p.waitForTimeout(1000);
 ok("Al terminar aparece el resultado: 75,0 min de espera con 3 filas separadas",(await p.textContent("#rv"))==="75,0"&&(await p.textContent(".rl")).includes("3 filas separadas"));
 ok("El resultado propone probar la solución del reel",(await p.textContent("#trysol")).includes("1 fila única"));
 await shot(p,"celular_ig_fila_resultado");
 await p.tap("#trysol");await p.waitForTimeout(1200);ok("«Probar 1 fila única» vuelve a simular",(await p.evaluate(()=>ECAPP.mode))==="run");
 await p.tap("#skip");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await p.waitForTimeout(1200);
 const res2=await p.evaluate(()=>({v:document.getElementById("rv").textContent,cmp:(document.querySelector(".rcmp")||{}).textContent||"",aha:(document.querySelector(".raha")||{}).textContent||""}));
 ok("Comparación con la corrida anterior: 75,0 → 21,1 min (−72 %) y el ajá",res2.v==="21,1"&&res2.cmp.includes("75,0")&&res2.cmp.includes("−72 %")&&res2.aha.includes("Mismas puertas"),res2);
 ok("Vibración al terminar",(await p.evaluate(()=>window.__v.length))>0);
 await shot(p,"celular_ig_fila_comparacion");
 await p.tap('#panel [data-sheet="ciencia"]');await p.waitForTimeout(800);ok("«Por qué pasa»: los 7 libros de este laboratorio, de colores",(await p.$$("#sheet .book")).length===7);
 await p.tap('#sheet [data-book="erlang1917"]');await p.waitForTimeout(1600);ok("Libro de Erlang con la ecuación y tus números (21,1 min)",(await p.textContent(".blive")).includes("21,1"));await shot(p,"celular_ig_libro");await p.tap(".bk-x");await p.waitForTimeout(500);
 await p.tap('#panel [data-sheet="share"]');await p.waitForTimeout(700);const wa=decodeURIComponent(await p.getAttribute("#wa","href"));
 ok("Compartir: frase para WhatsApp con la mejora y link con la configuración",wa.includes("75,0 min")&&wa.includes("21,1 min")&&wa.includes("−72 %")&&wa.includes("caso=fila")&&wa.includes("regla=unica"),wa);
 await p.tap("#copy");await p.waitForTimeout(300);const clip=await p.evaluate(()=>navigator.clipboard.readText().catch(()=>window.__lastShare));ok("Copiar link y frase",clip.includes("Pruébalo:")&&clip.includes("caso=fila"),clip);await p.tap(".sh-x");await p.waitForTimeout(400);
 await p.tap("#edit");await p.waitForTimeout(700);
 ok("«Cambiar los números»: sliders, escenarios, vista e idioma, sin teclado",(await p.$$("#sheet input[type=range]")).length>=2&&(await p.$$("#chips .chip")).length===3&&(await p.$$("#sheet [data-view]")).length===2&&(await p.$$("#sheet input[type=number]")).length===0);
 await shot(p,"celular_ig_cambiar_numeros");
 await setR(p,"fila","a","lam",11);const zone=await p.$eval("#c-fila-a-lam",e=>({cls:e.classList.contains("zoned"),c:e.style.getPropertyValue("--c")}));
 ok("Zona roja desde 85 % de ocupación",zone.cls&&zone.c==="#FF4040",zone);
 ok("Cambiar un número vuelve a «preparar» (no simula solo)",(await p.evaluate(()=>ECAPP.mode))==="ready"&&(await p.textContent(".sit")).includes("11 camiones"));
 await setR(p,"fila","a","lam",10);await p.tap('#sheet [data-view="top"]');await p.waitForTimeout(900);ok("Vista desde arriba",await p.evaluate(()=>ECAPP.top));await p.tap('#sheet [data-view="3d"]');
 await p.tap('#sheet .lg[data-l="en"]');await p.waitForTimeout(400);ok("Inglés desde el mismo panel",(await p.textContent("#play")).includes("Simulate"));await p.tap('#sheet .lg[data-l="es"]');await p.tap(".sh-x");
 ok("Celular IG · sin errores de JavaScript",p.errs.length===0,p.errs);

 /* ---------- 5. Los otros reels, links con configuración y maquetas que crecen ---------- */
 const q=await mk({width:390,height:740},true,IG);
 const runOnce=async()=>{await q.tap("#play");await q.waitForTimeout(500);await q.tap("#skip").catch(()=>{});await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await q.waitForTimeout(900);return q.textContent("#rv")};
 await q.goto(BASE+"?caso=fila&puertas=2&camiones=7&regla=separadas");await q.waitForSelector("#play");await q.waitForTimeout(1200);
 ok("Link compartido abre la misma configuración (2 puertas, 7/h)",(await q.textContent(".sit")).includes("2 puertas · 7 camiones"));ok("…y su resultado es 105 min",(await runOnce())==="105");
 const cases=[["?reel=4","bailey","40,0","16,0"],["?caso=nivel","nivel","24,2","4,9"],["?reel=2","amazon","50,0","10,0"],["?caso=ikea","ikea","11,4","5,8"],["?caso=ups","ups","20,0","7,2"]];
 for(const [u,id,a0,a1] of cases){await q.goto(BASE+u);await q.waitForSelector("#play");await q.waitForTimeout(1500);await shot(q,`celular_ig_${id}_preparar`);
  const v0=await runOnce();ok(`${id} · el problema del reel da ${a0}`,v0===a0,v0);await shot(q,`celular_ig_${id}_resultado`);
  await q.tap("#trysol");await q.waitForTimeout(500);await q.tap("#skip").catch(()=>{});await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await q.waitForTimeout(1000);
  const v1=await q.textContent("#rv"),c1=await q.evaluate(()=>(document.querySelector(".rcmp")||{}).textContent||"");ok(`${id} · la solución del reel da ${a1} y se compara con ${a0}`,v1===a1&&c1.includes(a0),{v1,c1});await shot(q,`celular_ig_${id}_comparacion`);
  const sw=await q.evaluate(()=>[document.documentElement.scrollWidth,document.documentElement.scrollHeight-innerHeight]);ok(`${id} · sin desborde ni scroll`,sw[0]<=390&&sw[1]<=1,sw)}
 await q.goto(BASE+"?caso=ikea");await q.waitForSelector("#play");await q.waitForTimeout(1200);
 ok("IKEA · la situación habla de entregas (20 cajas por viaje)",(await q.textContent(".sit")).includes("20 por viaje"));
 const ikR2=await runOnce(),ikV=await q.textContent(".r2");ok("IKEA · en cajas: 11,4 de 100 y 5 viajes del furgón",ikR2==="11,4"&&/5 viajes/.test(ikV),{ikR2,ikV});
 await q.goto(BASE+"?caso=ikea&empaque=armado");await q.waitForSelector("#play");await q.waitForTimeout(1200);
 const ikA=await runOnce(),ikAV=await q.textContent(".r2");ok("IKEA · armado: 1,0 de 100 pero 34 viajes del furgón",ikA==="1,0"&&/34 viajes/.test(ikAV),{ikA,ikAV});await shot(q,"celular_ig_ikea_armado");
 const ikNext=await q.textContent("#trysol");ok("IKEA · después de armado propone «En cajas» (el caso del reel), no el escaneo",/En cajas/.test(ikNext),ikNext);
 const ikObs=await q.evaluate(()=>(document.querySelector(".robs")||{}).textContent||"");ok("IKEA · distingue esta partida del promedio",/Esta partida/.test(ikObs)&&/promedio/.test(ikObs),ikObs);
 await q.tap("#trysol");await q.waitForTimeout(500);await q.tap("#skip").catch(()=>{});await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await q.waitForTimeout(1000);
 const ikO=await q.evaluate(()=>({ouch:(document.querySelector(".rouch")||{}).textContent||"",aha:!!document.querySelector(".raha")}));ok("IKEA · armado → cajas: explica el trade-off (5 viajes en vez de 34) y no celebra",/5 viajes en vez de 34/.test(ikO.ouch)&&!ikO.aha,ikO);
 /* the lesson must follow the numbers: with a 10 s wait, avoiding the turn is worse */
 await q.goto(BASE+"?caso=ups&espera=10&regla=dobla");await q.waitForSelector("#play");await q.waitForTimeout(1200);await runOnce();
 await q.tap("#trysol");await q.waitForTimeout(500);await q.tap("#skip").catch(()=>{});await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await q.waitForTimeout(1000);
 const upO=await q.evaluate(()=>({v:document.querySelector("#rv").textContent,ouch:(document.querySelector(".rouch")||{}).textContent||"",aha:!!document.querySelector(".raha")}));ok("UPS · con 10 s de espera evitar el giro sale peor (7,2 min) y la página lo dice en vez de celebrar",upO.v==="7,2"&&/21,6 s/.test(upO.ouch)&&!upO.aha,upO);await shot(q,"celular_ig_ups_no_conviene");
 await q.goto(BASE+"?caso=nivel");await q.waitForSelector("#play");await q.waitForTimeout(1200);await runOnce();
 const nvN=await q.evaluate(()=>(document.querySelector(".rnote")||{}).textContent||"");ok("Nivel · el redondeo del contrato se ve junto al resultado (97,6 % cuenta como 98 %)",/97,6/.test(nvN)&&/redondea/.test(nvN),nvN);
 await q.evaluate(()=>ECAPP.openSheet("fila","ciencia"));await q.waitForTimeout(400);await q.evaluate(()=>ECAPP.openBook("odoni"));await q.waitForTimeout(600);
 const od=await q.evaluate(()=>document.querySelector(".bk-page .beq").textContent.replace(/\s+/g,""));ok("Libro de Odoni · la fórmula divide λ entre las c puertas",/λ−?\/c|λ\/c/.test(od)&&!/μ−λ$/.test(od),od);await q.evaluate(()=>ECAPP.closeSheet());
 const html=require("fs").readFileSync(__dirname+"/../index.html","utf8");
 /* round 2: lessons follow direction and numbers; links reproduce the case */
 await q.goto(BASE+"?reel=6");await q.waitForSelector("#play");await q.waitForTimeout(1200);await runOnce();
 await q.tap("#trysol");await q.waitForTimeout(500);await q.tap("#skip").catch(()=>{});await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await q.waitForTimeout(900);
 await q.evaluate(()=>ECAPP.set("fila",{pol:"asig"}));await q.waitForTimeout(600);await runOnce();
 const fiO=await q.evaluate(()=>({ouch:(document.querySelector(".rouch")||{}).textContent||"",aha:!!document.querySelector(".raha")}));ok("Fila · volver a filas separadas explica la puerta vacía (no el texto de la fila única)",/puerta puede quedar vacía/.test(fiO.ouch)&&!fiO.aha,fiO);
 await q.evaluate(()=>ECAPP.set("fila",{pol:"pool",c:4}));await q.waitForTimeout(600);await runOnce();
 const fiC=await q.evaluate(()=>({cmp:(document.querySelector(".rcmp")||{}).textContent||"",aha:!!document.querySelector(".raha"),ouch:!!document.querySelector(".rouch")}));ok("Fila · si cambian los números junto con la regla, no dice «mismas puertas»",/otros números/.test(fiC.cmp)&&!fiC.aha&&!fiC.ouch,fiC);
 await q.evaluate(()=>{try{localStorage.setItem("ec5-state",JSON.stringify({fila:{c:5,lam:10,S:15,pol:"asig",jq:false,cv:10}}))}catch(e){}});
 await q.goto(BASE+"?caso=fila&regla=unica");await q.waitForSelector("#play");await q.waitForTimeout(1200);
 const lk=await q.textContent(".sit");ok("Link compartido · abre con 3 puertas aunque el teléfono tenía 5 guardadas",/^3 puertas/.test(lk),lk);
 await q.goto(BASE+"?caso=nivel&eval=mes");await q.waitForSelector("#play");await q.waitForTimeout(1200);await runOnce();
 const nvM=await q.evaluate(()=>(document.querySelector(".rnote")||{}).textContent||"");ok("Nivel · medido por mes, la nota habla del mes (2.040 paradas, 24 días), no del día",/2\.040 paradas del mes/.test(nvM)&&/24 días/.test(nvM),nvM);
 await q.goto(BASE+"?reel=2&copias=4");await q.waitForSelector("#play");await q.waitForTimeout(1200);await runOnce();
 await q.tap("#trysol");await q.waitForTimeout(500);await q.tap("#skip").catch(()=>{});await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await q.waitForTimeout(900);
 const amA=await q.evaluate(()=>(document.querySelector(".raha")||{}).textContent||"");ok("Amazon · el ¡Ajá! usa tus copias (4 lugares, 20,0 m), no «9 lugares» fijo",/4 lugares/.test(amA)&&/20,0 m/.test(amA),amA);
 /* the yard must stay full of trucks for the whole run (slots are given back when a truck leaves) */
 await q.goto(BASE+"?caso=fila&puertas=4&camiones=17&regla=separadas");await q.waitForSelector("#play");await q.waitForTimeout(1200);
 await q.tap("#play");await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:60000});await q.waitForTimeout(800);
 const yard=await q.evaluate(()=>{const F=ECAPP.S.fleet;let vis=0;for(let i=0;i<F.n;i++)if(F.on[i]&&F.s[i]>0.5)vis++;return{vis,rv:document.querySelector("#rv").textContent,note:(document.querySelector(".rnote")||{}).textContent||""}});
 ok("Fila · con 4 puertas y 17/h el patio se ve lleno al final (≥ 15 camiones) y el ∞ viene explicado",yard.vis>=15&&yard.rv==="∞"&&/crece sin fin/.test(yard.note),yard);await shot(q,"celular_ig_fila_colapso");
 /* review round 3: run state, English numbers, invalid links, reset */
 await q.goto(BASE+"?reel=6");await q.waitForSelector("#play");await q.waitForTimeout(1000);await q.tap("#play");await q.waitForTimeout(600);
 await q.evaluate(()=>{location.hash="#bailey"});await q.waitForSelector("#play");await q.waitForTimeout(900);
 const rs=await q.evaluate(()=>({running:ECAPP.running,mode:ECAPP.mode}));ok("Cambiar de página a mitad de corrida no deja la simulación corriendo",rs.running===false&&rs.mode==="ready",rs);
 await q.evaluate(()=>document.getElementById("lang-en").click());await q.goto(BASE+"?caso=fila&puertas=2&camiones=7&regla=separadas");await q.waitForSelector("#play");await q.waitForTimeout(1000);
 const v0=await runOnce();await q.tap("#trysol");await q.waitForTimeout(400);await q.tap("#skip").catch(()=>{});await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await q.waitForTimeout(900);
 const en=await q.evaluate(()=>({v:document.querySelector("#rv").textContent,cmp:(document.querySelector(".rcmp")||{}).textContent||"",aha:!!document.querySelector(".raha"),ouch:!!document.querySelector(".rouch")}));
 ok("En inglés (105.0 → 49.0) la comparación y la lección siguen siendo correctas",v0==="105"&&en.v==="49.0"&&/−53 %/.test(en.cmp)&&en.aha&&!en.ouch,{v0,en});await q.evaluate(()=>document.getElementById("lang-es").click());
 await q.goto(BASE+"?caso=fila&puertas=0&camiones=abc&regla=loquesea");await q.waitForSelector("#play");await q.waitForTimeout(900);
 const inv=await q.evaluate(()=>({st:ECAPP.STATE.fila,rv:document.querySelector(".sit").textContent}));ok("Link con valores inválidos (0 puertas, texto) cae en los valores del reel sin romperse",inv.st.c===3&&inv.st.lam===10&&inv.st.pol==="asig"&&/3 puertas/.test(inv.rv),inv);
 await q.goto(BASE+"?caso=nivel&eval=foo&dias=0&excluye=150");await q.waitForSelector("#play");await q.waitForTimeout(900);const nvI=await runOnce();ok("Nivel · link con período inválido y 0 días: resultado válido (24,2)",nvI==="24,2",nvI);
 await q.goto(BASE+"?reel=4&g=15");await q.waitForSelector("#play");await q.waitForTimeout(900);await q.evaluate(()=>ECAPP.set("bailey",Object.assign({},ECAPP.LAB.bailey.def),{force:true}));await q.waitForTimeout(400);
 const rst=await q.evaluate(()=>ECAPP.STATE.bailey.rule);ok("Bailey · «Volver al ejemplo del reel» tras mover la perilla extra deja la regla del reel, no «propia»",rst==="juntos",rst);
 ok("Portada · Bailey compara promedio con promedio (40 → 16 min)",/40 → 16 min/.test(html)&&!/80 → 16 min/.test(html));
ok("Sin preserveDrawingBuffer (ahorra GPU en el WebView) y con recuperación del contexto WebGL",!/preserveDrawingBuffer:true/.test(html)&&/webglcontextrestored/.test(html));
 ok("Sin control flotante sobre la maqueta (una cosa a la vez)",!/id="anchor"/.test(html)&&!/renderAnchor/.test(html));
 const box=async(id,set)=>{await q.evaluate(([i,s])=>ECAPP.set(i,s),[id,set]);await q.waitForTimeout(800);return q.evaluate(()=>{const b=ECAPP.S.box;return Math.round(Math.max(b.max.x-b.min.x,b.max.z-b.min.z))})};
 await q.goto(BASE+"?caso=amazon&orden=desordenada");await q.waitForSelector("#play");await q.waitForTimeout(1200);
 const a40=await box("amazon",{L:40}),a300=await box("amazon",{L:300});ok("Amazon · el pasillo crece con los metros (40 m → 300 m)",a300>a40*3,{a40,a300});await shot(q,"celular_ig_amazon_300m");
 await q.goto(BASE+"?reel=4");await q.waitForSelector("#play");await q.waitForTimeout(1200);
 const b4=await box("bailey",{c:4}),b10=await box("bailey",{c:10});const doors=await q.evaluate(()=>ECAPP.S.scene.getObjectByProperty("type","Group").children.filter(o=>o.isMesh&&o.geometry&&o.geometry.type==="SphereGeometry").length);
 ok("Bailey · al subir a 10 andenes aparecen 10 andenes",b10>b4&&doors===10,{b4,b10,doors});await shot(q,"celular_ig_bailey_10_andenes");
 ok("Otros reels · sin errores de JavaScript",q.errs.length===0,q.errs);

 /* ---------- 6. Pantalla chica y horizontal ---------- */
 const s=await mk({width:360,height:640},true,IG);await s.goto(BASE+"?reel=6");await s.waitForSelector("#play");await s.waitForTimeout(2000);
 const sm=await s.evaluate(()=>{const pl=document.getElementById("play").getBoundingClientRect(),pa=document.getElementById("panel").getBoundingClientRect();return{play:pl.bottom<=innerHeight&&pl.top>0,panelH:Math.round(pa.height/innerHeight*100),scroll:document.documentElement.scrollHeight-innerHeight,sw:document.documentElement.scrollWidth}});
 ok("Celular chico 360×640 · ▶ Simular a la vista, panel bajo la mitad de la pantalla, sin scroll",sm.play&&sm.panelH<50&&sm.scroll<=1&&sm.sw<=360,sm);await shot(s,"celular_chico_fila");
 const small=await s.$$eval("#app button",bs=>bs.filter(b=>b.offsetParent).map(b=>{const r=b.getBoundingClientRect();return[b.textContent.trim().slice(0,14),Math.round(r.height)]}).filter(x=>x[1]<38));ok("Celular chico · botones de 38 px o más",small.length===0,small);
 const l=await mk({width:844,height:390},true,IG);await l.goto(BASE+"?reel=4");await l.waitForSelector("#play");await l.waitForTimeout(2000);
 const ll=await l.evaluate(()=>{const k=document.getElementById("panel").getBoundingClientRect();return{right:k.left>innerWidth/2-20,inView:k.bottom<=innerHeight&&k.top>=0,sw:document.documentElement.scrollWidth}});
 ok("Celular horizontal · panel a la derecha y a la vista, sin desborde",ll.right&&ll.inView&&ll.sw<=844,ll);await shot(l,"celular_horizontal_bailey");
 ok("Pantallas chicas · sin errores de JavaScript",s.errs.length===0&&l.errs.length===0,[s.errs,l.errs]);
 ok("Sin menciones a Christian ni Ruck",!/\bchristian\b|\bruck\b/i.test(await d.content()));

 const fail=checks.filter(c=>!c.pass);fs.writeFileSync(`${OUT}/verificacion.json`,JSON.stringify({fecha:new Date().toISOString(),total:checks.length,fallas:fail.length,checks},null,1));
 console.log(`\n${checks.length-fail.length}/${checks.length} verificaciones OK`);await b.close();srv.close();process.exit(fail.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});
