/* Mounts a web diorama inside #stage for the launch story. window.__story.mount(kind,opts) */
window.__storyReady=false;
window.__story={mount(kind,opts){const host=document.getElementById('stage');const R=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});R.setPixelRatio(1);R.setSize(host.clientWidth,host.clientHeight,false);R.setClearColor(0,0);R.shadowMap.enabled=false;/* no shadows: swiftshader cost ×10 per capture, invisible at story size */host.appendChild(R.domElement);R.domElement.style.width='100%';R.domElement.style.height='100%';
 const S=kind==='hero'?sceneHero():sceneBailey(opts.st);if(kind!=='hero'){S.apply(opts.st,'reset');S.prewarm()}else S.prewarm();
 const asp=host.clientWidth/host.clientHeight;const rot=asp<1.3&&S.long==='x';if(S.root)S.root.rotation.y=rot?Math.PI/2:0;fitCam(S.cam,orientBox(S.box,rot),asp,asp<1.3?S.azP:S.az,S.el,opts.pad||1.04);
 /* piece-by-piece: remember each child's final scale, start at 0 */
 const parts=S.root?S.root.children.slice():[];const fin=parts.map(o=>o.scale.clone());if(opts.assemble){parts.forEach(o=>o.scale.setScalar(0.0001))}
 let t=0,last=performance.now();const ease=x=>1-Math.pow(1-x,3);
 function frame(now){requestAnimationFrame(frame);let dt=Math.min(0.1,(now-last)/1000);last=now;if(window.__budget!=null){if(document.hidden)return;dt=window.__budget;window.__budget=0;if(dt===0)return}/* recorder: one render per frame, none while capturing *//* recorder: deterministic time, frozen during capture */
  if(opts.assemble&&window.__phase>=1){t+=dt;const per=opts.assemble/parts.length,span=per*4;parts.forEach((o,i)=>{const u=Math.max(0,Math.min(1,(t-i*per)/span));const k=0.0001+ease(u)*(1-0.0001);o.scale.set(fin[i].x*k,fin[i].y*k,fin[i].z*k)})}
  if(S.tick&&(!opts.assemble||window.__phase>=1))S.tick(dt*(opts.speed!=null?opts.speed:1),1)/* speed 0 = frozen day */;
  if(S.fleet&&opts.settle&&t<1.2){t+=dt;S.fleet.step(dt,9)}
  if(opts.drift&&S.fleet){window.__t=window.__tFixed!=null?window.__tFixed:(window.__t||0)+dt;/* recorder may pin the phase to the frame index */const F=S.fleet;for(let i=0;i<F.n;i++)if(F.on[i])F.bob[i]=Math.abs(Math.sin(window.__t*(Math.PI/1.1)+i*0.7))*0.04*opts.drift;F.commit()}
  R.render(S.scene,S.cam)}
 requestAnimationFrame(frame);window.__storyReady=true;return S}};
