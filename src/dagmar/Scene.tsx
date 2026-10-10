import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { prepareDagmar } from './model';
import asset from './asset.json';
import { SpeechTimeline } from './speech.mjs';

export type Gesture = {kind:'walk'|'point';id:number};
type Props={reduced:boolean;request:Gesture;timeline:SpeechTimeline;onReady:(ready:boolean)=>void};
const clock=()=>performance.now()/1000;

export default function Scene({reduced,request,timeline,onReady}:Props) {
 const host=useRef<HTMLDivElement>(null),settings=useRef({reduced,request,timeline});
 const [failed,setFailed]=useState(false);settings.current={reduced,request,timeline};
 useEffect(()=>{
  const container=host.current!;let disposed=false,renderer:THREE.WebGLRenderer;
  try {renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  renderer.setClearColor(0,0);renderer.domElement.className='dagmar-canvas';renderer.domElement.setAttribute('aria-hidden','true');container.append(renderer.domElement);
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight('#fff5e8','#5f6c72',.8));
  const pmrem=new THREE.PMREMGenerator(renderer),studio=new RoomEnvironment();
  const environment=pmrem.fromScene(studio,.04);scene.environment=environment.texture;scene.environmentIntensity=.6;
  studio.dispose();pmrem.dispose();
  const key=new THREE.DirectionalLight('#fff3df',2);key.position.set(-2,3,4);scene.add(key);
  const rim=new THREE.DirectionalLight('#dfefff',1.2);rim.position.set(2,2,-3);scene.add(rim);
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,20);camera.position.set(0,1.10,5);
  const actor=new THREE.Group();scene.add(actor);
  const ground=new THREE.Mesh(new THREE.CircleGeometry(.6,32),new THREE.MeshBasicMaterial({color:'#26433d',transparent:true,opacity:.10,depthWrite:false}));ground.rotation.x=-Math.PI/2;ground.scale.set(1,.29,1);ground.position.y=-.023;scene.add(ground);
  let frame=0,mixer:THREE.AnimationMixer|undefined,model:ReturnType<typeof prepareDagmar>|undefined;
  let actions:Record<string,THREE.AnimationAction>={},current='',previous=clock(),visible=true;
  let phaseStart=clock(),phase='idle',requestId=-1,lastReduced=false,time=0,nextBlink=2.4;
  let width=1,height=1,zoomHeight=2.09,lookHeight=.88,lookX=0;
  const setAction=(name:string)=>{if(current===name||!actions[name])return;const next=actions[name];next.reset().setEffectiveTimeScale(name==='walk'?.52/asset.walkSpeed:1).setEffectiveWeight(1).fadeIn(.30).play();if(actions[current])actions[current].fadeOut(.30);current=name;container.dataset.clip=name;};
  const resize=()=>{width=Math.max(1,container.clientWidth);height=Math.max(1,container.clientHeight);renderer.setSize(width,height,false);};
  const sizing=new ResizeObserver(resize);sizing.observe(container);resize();
  const draw=(timestamp:number)=>{
   if(disposed)return;
   const now=timestamp/1000,delta=Math.min(.10,Math.max(0,now-previous));previous=now;
   const options=settings.current,isReduced=options.reduced;
   if(model&&mixer) {
    if(!isReduced)time+=delta;
    if(options.request.id!==requestId){requestId=options.request.id;phase=isReduced||requestId===0?'idle':options.request.kind;phaseStart=time;}
    if(isReduced!==lastReduced){lastReduced=isReduced;phase='idle';phaseStart=time;actor.position.x=0;actor.rotation.y=0;setAction('idle');mixer.update(.31);}
    let duration=time-phaseStart,walking=false,targetYaw=0;
    const talking=options.timeline.active&&!options.timeline.paused;
    if(!isReduced) {
     if(talking){phase='talk';phaseStart=time;setAction('talk');}
     else if(phase==='talk'){phase='idle';phaseStart=time;duration=0;}
     if(phase==='walk') {
      walking=true;
      // Fixed travel speed is matched to the native slow walk clip. Turning and
      // brief rests are separate phases, not a sliding whole-image transform.
      const leg=duration;
      if(leg<.75){actor.position.x=leg*.52;targetYaw=Math.PI/2;}
      else if(leg<1.15){actor.position.x=.39;targetYaw=Math.PI/2-(leg-.75)/.4*Math.PI;walking=false;}
      else if(leg<2.65){actor.position.x=.39-(leg-1.15)*.52;targetYaw=-Math.PI/2;}
      else if(leg<3.05){actor.position.x=-.39;targetYaw=-Math.PI/2+(leg-2.65)/.4*Math.PI;walking=false;}
      else{actor.position.x=THREE.MathUtils.lerp(-.39,0,Math.min(1,(leg-3.05)/.75));targetYaw=Math.PI/2;if(leg>3.8){walking=false;targetYaw=0;}}
      setAction(walking?'walk':'idle');
      if(duration>=4.3){phase='idle';phaseStart=time;duration=0;walking=false;targetYaw=0;actor.position.x=0;}
     }
     if(phase==='point'){setAction('present');if(duration>4.5){phase='idle';phaseStart=time;}}
     if(phase==='idle')setAction('idle');
    } else setAction('idle');
    mixer.update(isReduced?0:delta);
    actor.rotation.y=THREE.MathUtils.damp(actor.rotation.y,targetYaw,9,delta);
    actor.updateMatrixWorld(true);
    let eyelids=0;
    if(!isReduced){if(time>nextBlink+.17)nextBlink=time+2.7+Math.random()*2.4;const blinkPhase=(time-nextBlink)/.17;if(blinkPhase>=0&&blinkPhase<=1)eyelids=Math.sin(blinkPhase*Math.PI);}
    const sampled=options.timeline.sample(now) as {open:number;round:number;wide:number;press:number};
    model.face(isReduced?{open:0,round:0,wide:0,press:0}:sampled,eyelids,talking?.55:.95);
    container.dataset.phase=isReduced?'still':phase;container.dataset.speaking=String(talking&&!isReduced);container.dataset.mouthOpen=sampled.open.toFixed(3);container.dataset.actorX=actor.position.x.toFixed(3);
    container.dataset.frames=String((Number(container.dataset.frames)||0)+1);
    // Keep the open-palm gesture inside a narrow phone column.
    // On wide stages a fixed camera makes the walking travel clearly visible.
    const closeUp=talking&&!isReduced;
    const span=phase==='point'?1.16:1.02;
    const targetHeight=closeUp?Math.max(1.27,.66*height/width):Math.max(2.09,span*height/width);
    const targetLook=closeUp?1.27:.88;
    const targetX=closeUp?actor.position.x:phase==='point'?actor.position.x+.075:actor.position.x*(width/height<.65?.7:.2);
    zoomHeight=THREE.MathUtils.damp(zoomHeight,targetHeight,4,delta);lookHeight=THREE.MathUtils.damp(lookHeight,targetLook,4,delta);
    lookX=THREE.MathUtils.damp(lookX,targetX,7,delta);
   }
   camera.top=zoomHeight/2;camera.bottom=-zoomHeight/2;camera.left=-zoomHeight*width/height/2;camera.right=zoomHeight*width/height/2;camera.position.y=lookHeight;
   camera.position.x=lookX;camera.lookAt(lookX,lookHeight,0);camera.updateProjectionMatrix();renderer.render(scene,camera);
   if(visible&&document.visibilityState==='visible'&&!settings.current.reduced)frame=requestAnimationFrame(draw);else frame=0;
  };
  const resume=()=>{if(disposed||frame||!model)return;previous=clock();frame=requestAnimationFrame(draw);};
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else resume();},{rootMargin:'40px'});intersection.observe(container);
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resume();};document.addEventListener('visibilitychange',visibility);
  const refresh=()=>{cancelAnimationFrame(frame);frame=0;resume();};
  container.addEventListener('dagmar-refresh',refresh);
  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(asset.url,gltf=>{
   if(disposed){disposeObjects(gltf.scene);return;}
   try {
    actor.add(gltf.scene);model=prepareDagmar(gltf);mixer=new THREE.AnimationMixer(gltf.scene);
    Object.values(model.bones).forEach(b=>b.userData.rest=b.quaternion.clone());
    actions=Object.fromEntries(gltf.animations.map(clip=>[clip.name,mixer!.clipAction(clip)]));
    actions.present?.setLoop(THREE.LoopOnce,1);if(actions.present)actions.present.clampWhenFinished=true;
    if(!['idle','walk','talk','present'].every(name=>actions[name]))throw new Error('Dagmar motion clip missing');
    setAction('idle');mixer.update(.4);container.dataset.ready='true';onReady(true);resume();
   }catch{setFailed(true);onReady(false);}
  },undefined,()=>{if(!disposed){setFailed(true);onReady(false);}});
  return()=>{disposed=true;cancelAnimationFrame(frame);intersection.disconnect();sizing.disconnect();document.removeEventListener('visibilitychange',visibility);container.removeEventListener('dagmar-refresh',refresh);mixer?.stopAllAction();disposeObjects(scene);environment.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
 },[timeline,onReady]);
 useEffect(()=>{host.current?.dispatchEvent(new Event('dagmar-refresh'));},[reduced,request]);
 return <div ref={host} className={`dagmar-3d ${failed?'failed':''}`} data-ready="false"/>;
}

function disposeObjects(root:THREE.Object3D) {
 const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
 root.traverse(object=>{const mesh=object as THREE.Mesh;if(!mesh.isMesh)return;geometries.add(mesh.geometry);for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material]){materials.add(m);for(const value of Object.values(m))if(value instanceof THREE.Texture)textures.add(value);}});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>{const source=t.source?.data;if(typeof ImageBitmap!=='undefined'&&source instanceof ImageBitmap)source.close();t.dispose();});
}
