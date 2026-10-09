import * as THREE from 'three';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';

/** Rain's authored mesh, skin, hair and facial shapes are preserved in the GLB. */
export function prepareRain(gltf:GLTF) {
 const bones:Record<string,THREE.Bone>={},faces:THREE.Mesh[]=[];
 gltf.scene.scale.setScalar(1.1);
 gltf.scene.traverse(object=>{
  if((object as THREE.Bone).isBone)bones[object.name]=object as THREE.Bone;
  const mesh=object as THREE.Mesh;
  if(mesh.isMesh&&mesh.morphTargetDictionary)faces.push(mesh);
 });
 for(const name of ['Head','neck_01','upperarm_l','lowerarm_l','hand_l'])
  if(!bones[name])throw new Error(`Rain joint missing: ${name}`);
 const head=faces.find(mesh=>mesh.name==='Rain-head');
 if(!head||!['open','round','wide','press','blink','smile'].every(name=>name in head.morphTargetDictionary!))
  throw new Error('Rain facial poses missing');
 const face=(pose:{open:number;round:number;wide:number;press:number},blink:number,smile:number)=>{
  const sum=Math.max(1,pose.open+pose.round+pose.wide+pose.press);
  const weights:Record<string,number>={
   open:pose.open/sum,round:pose.round/sum,wide:pose.wide/sum,press:pose.press/sum,
   blink:THREE.MathUtils.clamp(blink,0,1),smile:smile*(1-pose.open*.6),brow:pose.open*.1
  };
  for(const mesh of faces)for(const [name,index]of Object.entries(mesh.morphTargetDictionary!))
   mesh.morphTargetInfluences![index]=weights[name]||0;
 };
 return {bones,face};
}
