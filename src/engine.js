/* =====================================================================
   3D ENGINE · toy dioramas (three.js r149, one shared renderer)
   ===================================================================== */
const HAS3=typeof window.THREE!=="undefined";
const P={slab:0x1B2747,slabTop:0x2B3858,asphalt:0x3B4563,asphalt2:0x323B57,road:0x2A3149,line:0xF4EBD9,grass:0x4E8F62,grass2:0x5FA373,wall:0xF1E8D6,wallDark:0x2B3654,roof:0x55658C,door:0xC9D2E3,dark:0x1A2133,glass:0x3E5C8A,yellow:0xFFC726,coral:0xFF7A59,red:0xFF4040,green:0x40FF73,mint:0x4BE38A,sky:0x6EC1FF,lilac:0xB79CFF,white:0xFAFAF5,wood:0xB98552,carton:0xD9B07A,blue:0x5B7BD5,skin:0xF2C7A0,trunk:0x7A5236,leaf:0x5FAE6E,leaf2:0x86C97F,floor:0x56617E,terracotta:0xD9774E};
const CABS=[P.yellow,P.coral,P.mint,P.sky,P.red,P.yellow];
const MC={},GC={};
function mat(hex,o){o=o||{};const k=hex+"|"+(o.basic?1:0)+"|"+(o.op||1)+"|"+(o.flat?1:0);if(!MC[k]){const a={color:hex};if(o.op){a.transparent=true;a.opacity=o.op;a.depthWrite=false}if(o.flat)a.flatShading=true;MC[k]=o.basic?new THREE.MeshBasicMaterial(a):new THREE.MeshLambertMaterial(a)}return MC[k]}
function GEO(){if(!GC._){GC._=1;GC.plane=new THREE.PlaneGeometry(1,1);GC.head=new THREE.SphereGeometry(0.22,14,10);GC.ball=new THREE.SphereGeometry(0.5,16,12);GC.leaf=new THREE.IcosahedronGeometry(0.75,0);GC.trunk=new THREE.CylinderGeometry(0.11,0.15,0.8,7);GC.wheel=new THREE.CylinderGeometry(0.3,0.3,1.18,14);GC.wheelS=new THREE.CylinderGeometry(0.2,0.2,0.5,10);GC.pyr=new THREE.ConeGeometry(1,1,4);GC.post=new THREE.CylinderGeometry(0.07,0.07,1,8);GC.ring=new THREE.RingGeometry(0.42,0.5,24)}return GC}
function rboxG(w,h,d,r){w=Math.round(w*100)/100;h=Math.round(h*100)/100;d=Math.round(d*100)/100;r=Math.round((r==null?Math.min(w,h,d)*0.18:r)*100)/100;const key=[w,h,d,r].join(",");if(GC[key])return GC[key];
 const b=Math.max(0,Math.min(r*0.5,w/4,h/4,d/4));const sw=w-2*b,sh=h-2*b;const rr=Math.max(0.001,Math.min(r,sw/2-0.001,sh/2-0.001));
 const s=new THREE.Shape();const x=-sw/2,y=-sh/2;s.moveTo(x+rr,y);s.lineTo(x+sw-rr,y);s.quadraticCurveTo(x+sw,y,x+sw,y+rr);s.lineTo(x+sw,y+sh-rr);s.quadraticCurveTo(x+sw,y+sh,x+sw-rr,y+sh);s.lineTo(x+rr,y+sh);s.quadraticCurveTo(x,y+sh,x,y+sh-rr);s.lineTo(x,y+rr);s.quadraticCurveTo(x,y,x+rr,y);
 const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(0.002,d-2*b),bevelEnabled:b>0.004,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:3});g.translate(0,0,-(d-2*b)/2);GC[key]=g;return g}
function put(p,geo,m,x,y,z,cast){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=cast!==false;o.receiveShadow=true;p.add(o);return o}
/* rounded box with its base at y */
function rb(p,w,h,d,col,x,y,z,r,o){return put(p,rboxG(w,h,d,r),typeof col==="object"?col:mat(col,o),x,y+h/2,z,!(o&&o.noCast))}
function flat(p,w,d,col,x,y,z,o){const m=new THREE.Mesh(GEO().plane,typeof col==="object"?col:mat(col,o));m.rotation.x=-Math.PI/2;m.scale.set(w,d,1);m.position.set(x,y,z);m.receiveShadow=!(o&&o.basic);p.add(m);return m}
let BLOB=null;function blobMat(){if(!BLOB){const c=document.createElement("canvas");c.width=c.height=128;const x=c.getContext("2d");const gr=x.createRadialGradient(64,64,10,64,64,64);gr.addColorStop(0,"rgba(0,0,0,0.55)");gr.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=gr;x.fillRect(0,0,128,128);BLOB=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false})}return BLOB}
/* a floating diorama tile: scene + lights + island */
function diorama(W,D,top){const scene=new THREE.Scene();const g=new THREE.Group();scene.add(g);
 scene.add(new THREE.HemisphereLight(0xDDE8FF,0x4A3B2E,0.72));const R=Math.hypot(W,D)/2+2;const dl=new THREE.DirectionalLight(0xFFE7C4,0.82);dl.position.set(R*0.55,R*1.25,R*0.8);dl.castShadow=true;const sc=dl.shadow.camera;sc.left=-R;sc.right=R;sc.top=R;sc.bottom=-R;sc.near=1;sc.far=R*4;const ms=window.innerWidth<700?1024:2048;dl.shadow.mapSize.set(ms,ms);dl.shadow.bias=-0.0005;dl.shadow.normalBias=0.03;scene.add(dl);
 if(W>0){rb(g,W,1.8,D,P.slab,0,-1.86,0,1.3,{noCast:true});const t=rb(g,W-0.25,0.14,D-0.25,top||P.slabTop,0,-0.14,0,1.2,{noCast:true});t.castShadow=false;
  const sh=new THREE.Mesh(GEO().plane,blobMat());sh.rotation.x=-Math.PI/2;sh.scale.set(W*1.35,D*1.35,1);sh.position.y=-2.6;g.add(sh)}
 return{scene,g}}
function tree(g,x,z,s,c){s=s||1;const t=new THREE.Group();put(t,GEO().trunk,mat(P.trunk),0,0.4,0);const l1=put(t,GEO().leaf,mat(c||P.leaf,{flat:true}),0,1.25,0);l1.scale.set(1,1.05,1);const l2=put(t,GEO().leaf,mat(P.leaf2,{flat:true}),0.12,1.85,0.05);l2.scale.setScalar(0.62);t.position.set(x,0,z);t.scale.setScalar(s);t.rotation.y=x*1.7+z;g.add(t);return t}
function person(g,shirt,x,z,ry){const p=new THREE.Group();put(p,rboxG(0.34,0.52,0.24,0.08),mat(P.dark),0,0.26,0);put(p,rboxG(0.48,0.58,0.3,0.13),mat(shirt||P.yellow),0,0.81,0);put(p,GEO().head,mat(P.skin),0,1.3,0);put(p,rboxG(0.4,0.1,0.4,0.05),mat(shirt===P.yellow?P.coral:P.yellow),0,1.5,0);p.position.set(x,0,z);p.rotation.y=ry||0;g.add(p);return p}
function cloud(g,x,y,z,s){const c=new THREE.Group();[[0,0,0,1],[0.9,-0.1,0.2,0.75],[-0.85,-0.15,-0.1,0.7],[0.3,0.35,0,0.7]].forEach(b=>{const m=put(c,GEO().ball,mat(0xFFFFFF),b[0],b[1],b[2],false);m.scale.setScalar(b[3]*1.6)});c.position.set(x,y,z);c.scale.setScalar(s||1);g.add(c);return c}
function canvasTex(w,h,draw){const c=document.createElement("canvas");c.width=w;c.height=h;draw(c.getContext("2d"),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
const ICONS={};
function iconTex(kind){if(ICONS[kind])return ICONS[kind];ICONS[kind]=canvasTex(128,128,(x)=>{x.lineWidth=9;const bub=(fill)=>{x.fillStyle=fill;x.strokeStyle="#0F1729";x.beginPath();x.arc(64,58,46,0,7);x.fill();x.stroke();x.beginPath();x.moveTo(52,100);x.lineTo(64,122);x.lineTo(76,100);x.closePath();x.fill();x.stroke();x.fillStyle=fill;x.fillRect(50,92,28,12)};
 if(kind==="clock"){bub("#FFFFFF");x.strokeStyle="#0F1729";x.lineCap="round";x.lineWidth=8;x.beginPath();x.moveTo(64,58);x.lineTo(64,30);x.moveTo(64,58);x.lineTo(84,66);x.stroke();x.fillStyle="#FF7A59";x.beginPath();x.arc(64,58,6,0,7);x.fill()}
 else if(kind==="bang"){bub("#FF4040");x.fillStyle="#fff";x.fillRect(57,26,14,38);x.beginPath();x.arc(64,78,8,0,7);x.fill()}
 else if(kind==="check"){bub("#4BE38A");x.strokeStyle="#0F1729";x.lineWidth=11;x.lineCap="round";x.lineJoin="round";x.beginPath();x.moveTo(42,60);x.lineTo(58,76);x.lineTo(88,40);x.stroke()}
 else if(kind==="q"){bub("#FAFAF5");x.fillStyle="#0F1729";x.font="bold 64px sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText("?",64,62)}
 else if(kind==="star"){bub("#FFC726");x.fillStyle="#0F1729";x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?12:28;x.lineTo(64+r*Math.cos(a),58+r*Math.sin(a))}x.closePath();x.fill()}});return ICONS[kind]}
/* billboard icons (instanced, always facing the camera) */
class Icons{constructor(g,kind,n,size){this.n=Math.max(1,n);this.im=new THREE.InstancedMesh(GEO().plane,new THREE.MeshBasicMaterial({map:iconTex(kind),transparent:true,depthWrite:false,alphaTest:0.05}),this.n);this.im.material.userData.own=true;this.im.userData.own=true;this.im.frustumCulled=false;this.im.renderOrder=5;g.add(this.im);this.size=size||1.1;this.x=new Float32Array(this.n);this.y=new Float32Array(this.n);this.z=new Float32Array(this.n);this.s=new Float32Array(this.n);this.ts=new Float32Array(this.n);this.ph=new Float32Array(this.n);for(let i=0;i<this.n;i++)this.ph[i]=i*0.77}
 set(i,x,y,z,on){this.x[i]=x;this.y[i]=y;this.z[i]=z;this.ts[i]=on?1:0}
 hideAll(){this.ts.fill(0);this.s.fill(0)}
 step(dt,q,t){const a=1-Math.exp(-14*dt);if(this.im.parent){this.im.parent.getWorldQuaternion(_q2);_q2.invert().multiply(q);q=_q2}for(let i=0;i<this.n;i++){this.s[i]+=(this.ts[i]-this.s[i])*a;const s=this.s[i]<0.02?0:this.s[i]*this.size*(1+0.12*Math.max(0,this.ts[i]-this.s[i]));_m4.compose(_v.set(this.x[i],this.y[i]+Math.sin(t*3+this.ph[i])*0.08,this.z[i]),q,_s.set(s,s,s));this.im.setMatrixAt(i,_m4)}this.im.instanceMatrix.needsUpdate=true}}
const _q2=HAS3?new THREE.Quaternion():null,_m4=HAS3?new THREE.Matrix4():null,_q=HAS3?new THREE.Quaternion():null,_v=HAS3?new THREE.Vector3():null,_s=HAS3?new THREE.Vector3():null,_e=HAS3?new THREE.Euler():null,_c=HAS3?new THREE.Color():null;
function setI(im,i,x,y,z,sx,sy,sz,ry,rx){_q.setFromEuler(_e.set(rx||0,ry||0,0));_m4.compose(_v.set(x,y,z),_q,_s.set(sx,sy,sz));im.setMatrixAt(i,_m4)}
function inst(g,geo,m,n,cast){const im=new THREE.InstancedMesh(geo,m,Math.max(1,n));im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;im.castShadow=cast!==false;im.receiveShadow=true;im.userData.own=true;g.add(im);return im}
/* ---- trucks: white box, colored cab, instanced parts ---- */
function truckParts(van){const L=van?0.72:1;return[
 {g:rboxG(3.3*L+0.1,0.24,0.98,0.08),c:P.dark,p:[0.05,0.46,0]},
 {g:rboxG(2.45*L,1.42,1.14,0.14),c:P.white,p:[-0.48*L-(van?0.15:0),1.28,0]},
 {g:rboxG(2.47*L,0.13,1.16,0.05),c:"cab",p:[-0.48*L-(van?0.15:0),0.78,0]},
 {g:rboxG(0.98,1.1,1.08,0.24),c:"cab",p:[1.28-(van?0.6:0),1.04,0]},
 {g:rboxG(0.07,0.42,0.86,0.03),c:P.glass,p:[1.77-(van?0.6:0),1.27,0]},
 {g:rboxG(0.06,0.13,0.2,0.03),c:P.yellow,p:[1.79-(van?0.6:0),0.74,0.33],basic:true},
 {g:rboxG(0.06,0.13,0.2,0.03),c:P.yellow,p:[1.79-(van?0.6:0),0.74,-0.33],basic:true},
 {g:GEO().wheel,c:P.dark,p:[1.28-(van?0.6:0),0.3,0],rx:Math.PI/2},
 {g:GEO().wheel,c:P.dark,p:[-0.62*L,0.3,0],rx:Math.PI/2},
 {g:GEO().wheel,c:P.dark,p:[-1.28*L,0.3,0],rx:Math.PI/2}]}
class Fleet{constructor(g,n,sc,opt){opt=opt||{};this.n=Math.max(1,n);this.sc=sc||1;this.parts=truckParts(opt.van).concat([{g:GEO().plane,c:"blob",p:[0,0.03,0],rx:-Math.PI/2,s:[4.2,1.9,1]}]).map(pt=>{if(pt.c==="blob"){const im=inst(g,pt.g,blobMat(),this.n,false);im.receiveShadow=false;im.renderOrder=-1;return{im,Lm:new THREE.Matrix4().compose(new THREE.Vector3(...pt.p),new THREE.Quaternion().setFromEuler(new THREE.Euler(pt.rx,0,0)),new THREE.Vector3(...pt.s)),colorable:false}}const colorable=pt.c==="cab";let m=colorable?new THREE.MeshLambertMaterial({color:0xffffff}):mat(pt.c,{basic:pt.basic});if(colorable)m.userData.own=true;const im=inst(g,pt.g,m,this.n,!pt.basic);
  const Lm=new THREE.Matrix4().compose(new THREE.Vector3(...pt.p),new THREE.Quaternion().setFromEuler(new THREE.Euler(pt.rx||0,0,0)),new THREE.Vector3(1,1,1));return{im,Lm,colorable}});
  const N=this.n;["cx","cz","cr","tx","tz","tr","s","ts","bob"].forEach(k=>this[k]=new Float32Array(N));this.fix=new Uint8Array(N);this.vib=new Uint8Array(N);this.on=new Uint8Array(N);this.col=[];for(let i=0;i<N;i++)this.col.push(opt.col!=null?opt.col:CABS[(i*7+3)%CABS.length]);this._t=new THREE.Matrix4();this.time=0;this.commit()}
 spawn(i,x,z,r){this.cx[i]=x;this.cz[i]=z;this.cr[i]=r;this.tx[i]=x;this.tz[i]=z;this.tr[i]=r;this.on[i]=1;this.s[i]=0;this.ts[i]=1}
 go(i,x,z,r,fix){if(!this.on[i])this.spawn(i,x,z,r);this.tx[i]=x;this.tz[i]=z;this.tr[i]=r;this.fix[i]=fix?1:0;if(this.ts[i]===0)this.ts[i]=1}
 leave(i){if(this.on[i])this.ts[i]=0}
 snap(i){this.cx[i]=this.tx[i];this.cz[i]=this.tz[i];this.cr[i]=this.tr[i];this.s[i]=this.ts[i];if(!this.ts[i])this.on[i]=0}
 hide(i){this.on[i]=0;this.s[i]=0}
 step(dt,k){this.time+=dt;let moving=false;const a=1-Math.exp(-(k||7)*dt),ar=1-Math.exp(-11*dt),as=1-Math.exp(-9*dt);
  for(let i=0;i<this.n;i++){if(!this.on[i])continue;const nx=this.cx[i]+(this.tx[i]-this.cx[i])*a,nz=this.cz[i]+(this.tz[i]-this.cz[i])*a;const dx=nx-this.cx[i],dz=nz-this.cz[i];const sp=Math.hypot(dx,dz);
   let rt=this.tr[i];if(!this.fix[i]&&sp>0.02)rt=Math.atan2(-dz,dx);const d=((rt-this.cr[i]+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;this.cr[i]+=d*ar;this.cx[i]=nx;this.cz[i]=nz;
   this.s[i]+=(this.ts[i]-this.s[i])*as;if(this.ts[i]===0&&this.s[i]<0.03)this.on[i]=0;
   const mv=sp/Math.max(dt,1e-3);this.bob[i]=mv>0.4?Math.abs(Math.sin(this.time*18+i))*0.05:0;if(sp>0.004||Math.abs(d)>0.01||Math.abs(this.ts[i]-this.s[i])>0.01)moving=true}
  this.commit();return moving}
 commit(){for(let i=0;i<this.n;i++){if(this.on[i]&&this.s[i]>0.01){_q.setFromEuler(_e.set(0,this.cr[i],0));const j=this.vib[i]?Math.sin(this.time*60+i*7)*0.06:0;_m4.compose(_v.set(this.cx[i]+j,this.bob[i],this.cz[i]),_q,_s.setScalar(this.sc*this.s[i]))}else _m4.makeScale(0,0,0);
   for(const pt of this.parts){this._t.multiplyMatrices(_m4,pt.Lm);pt.im.setMatrixAt(i,this._t);if(pt.colorable)pt.im.setColorAt(i,_c.setHex(this.col[i]))}}
  for(const pt of this.parts){pt.im.instanceMatrix.needsUpdate=true;if(pt.colorable&&pt.im.instanceColor)pt.im.instanceColor.needsUpdate=true}}}
function dashes(g,pts,sx,sz){const im=inst(g,GEO().plane,mat(P.line),pts.length,false);pts.forEach((q,i)=>setI(im,i,q[0],0.02,q[1],sx,sz,1,0,-Math.PI/2));im.instanceMatrix.needsUpdate=true;return im}
function roadX(g,x0,x1,z,w){flat(g,Math.abs(x1-x0),w,P.road,(x0+x1)/2,0.012,z);const pts=[];for(let x=Math.min(x0,x1)+0.8;x<Math.max(x0,x1)-0.8;x+=2.2)pts.push([x,z]);if(pts.length)dashes(g,pts,1.0,0.14)}
function roadZ(g,z0,z1,x,w){flat(g,w,Math.abs(z1-z0),P.road,x,0.012,(z0+z1)/2);const pts=[];for(let z=Math.min(z0,z1)+0.8;z<Math.max(z0,z1)-0.8;z+=2.2)pts.push([x,z]);if(pts.length)dashes(g,pts,0.14,1.0)}
function signTex(text,bg,fg){return canvasTex(512,128,(x,w,h)=>{x.fillStyle=bg;const r=28;x.beginPath();x.moveTo(r,0);x.arcTo(w,0,w,h,r);x.arcTo(w,h,0,h,r);x.arcTo(0,h,0,0,r);x.arcTo(0,0,w,0,r);x.fill();x.fillStyle=fg;x.font="800 52px 'Bricolage Grotesque', 'DM Sans', sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(text,w/2,h/2+2)})}
function sign(g,text,x,z,ry,bg,fg,wd){const s=new THREE.Group();put(s,GEO().post,mat(P.dark),-0.9*(wd||1),0.9,0).scale.y=1.8;put(s,GEO().post,mat(P.dark),0.9*(wd||1),0.9,0).scale.y=1.8;const m=new THREE.MeshLambertMaterial({map:signTex(text,bg||"#FFC726",fg||"#0F1729")});m.userData.own=true;const b=put(s,rboxG(2.4*(wd||1),0.62*(wd||1),0.12,0.08),mat(P.dark),0,1.75,0);const f=put(s,GEO().plane,m,0,1.75+0.31*(wd||1),0.07);f.scale.set(2.3*(wd||1),0.575*(wd||1),1);s.position.set(x,0,z);s.rotation.y=ry||0;g.add(s);return s}
function disposeScene(S){if(!S)return;S.scene.traverse(o=>{if(o.isInstancedMesh&&o.userData.own)o.dispose();if(o.material&&o.material.userData&&o.material.userData.own){if(o.material.map)o.material.map.dispose();o.material.dispose()}})}
function fitCam(cam,box,aspect,az,el,pad){const ctr=box.getCenter(new THREE.Vector3());const dir=new THREE.Vector3(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el));cam.position.copy(ctr).addScaledVector(dir,180);cam.up.set(0,1,0);cam.lookAt(ctr);cam.updateMatrixWorld();
 const right=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;const p=new THREE.Vector3();
 for(let i=0;i<8;i++){p.set(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z).sub(ctr);const a=p.dot(right),b=p.dot(up);x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b)}
 const cx=(x0+x1)/2,cy=(y0+y1)/2;let hw=(x1-x0)/2*(pad||1.03),hh=(y1-y0)/2*(pad||1.03);if(hw/hh<aspect)hw=hh*aspect;else hh=hw/aspect;cam.left=cx-hw;cam.right=cx+hw;cam.top=cy+hh;cam.bottom=cy-hh;cam.near=1;cam.far=700;cam.updateProjectionMatrix()}
/* portrait phones: turn the diorama so its long side runs up the screen */
function orientBox(box,rot){if(!rot)return box.clone();return new THREE.Box3(new THREE.Vector3(box.min.z,box.min.y,-box.max.x),new THREE.Vector3(box.max.z,box.max.y,-box.min.x))}
function mkS(scene,box,o){return Object.assign({scene,cam:new THREE.OrthographicCamera(),box,az:0.7,azP:0.32,el:0.62,long:"x",labels:[],cap:"",clock:"",badge:""},o||{})}
const ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);
const bounce=t=>{if(t<=0)return 0;if(t>=1)return 1;const n=7.5625,d=2.75;if(t<1/d)return n*t*t;if(t<2/d)return n*(t-=1.5/d)*t+0.75;if(t<2.5/d)return n*(t-=2.25/d)*t+0.9375;return n*(t-=2.625/d)*t+0.984375};
const B_=s=>`<em>${s}</em>`;
/* waiting color: white → yellow → red (and it shakes past 45 min) */
const _ca=HAS3?new THREE.Color():null,_cb=HAS3?new THREE.Color():null;
function waitCol(w){const W=0xF4F4F0,Y=0xFFC726,R=0xFF4040;if(w<4)return W;if(w<20){_ca.setHex(W).lerp(_cb.setHex(Y),(w-4)/16);return _ca.getHex()}if(w<45){_ca.setHex(Y).lerp(_cb.setHex(R),(w-20)/25);return _ca.getHex()}return R}

