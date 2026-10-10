import * as THREE from 'three';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';

/** User-approved Rocketbox woman: original skin, rig and native facial targets. */
export function prepareDagmar(gltf:GLTF) {
 const bones:Record<string,THREE.Bone>={},faces:THREE.Mesh[]=[];
 gltf.scene.traverse(object=>{
  if((object as THREE.Bone).isBone)bones[object.name.replaceAll('_',' ')]=object as THREE.Bone;
  const mesh=object as THREE.Mesh;
  if(mesh.isMesh&&mesh.morphTargetDictionary)faces.push(mesh);
 });
 for(const name of ['Bip01 Head','Bip01 Neck','Bip01 L UpperArm','Bip01 L Forearm','Bip01 L Hand'])
  if(!bones[name])throw new Error(`Dagmar joint missing: ${name}`);
 if(!faces.some(mesh=>['AA_VI_10_aa','AA_VI_13_O','AA_VI_11_E','AA_VI_01_PP','AK_44_MouthSmileLeft','AK_09_EyeBlinkLeft'].every(name=>name in mesh.morphTargetDictionary!)))
  throw new Error('Dagmar native facial poses missing');
 const face=(pose:{open:number;round:number;wide:number;press:number},blink:number,smile:number)=>{
  const sum=Math.max(1,pose.open+pose.round+pose.wide+pose.press);
  const friendly=.8*smile/.95*(1-pose.open*.6);
  const weights:Record<string,number>={
   AA_VI_10_aa:pose.open/sum,AA_VI_13_O:pose.round/sum,AA_VI_11_E:pose.wide/sum,AA_VI_01_PP:pose.press/sum,
   AK_09_EyeBlinkLeft:THREE.MathUtils.clamp(blink,0,1),AK_10_EyeBlinkRight:THREE.MathUtils.clamp(blink,0,1),
   AK_44_MouthSmileLeft:friendly,AK_45_MouthSmileRight:friendly,
   AK_07_CheekSquintLeft:.18,AK_08_CheekSquintRight:.18,AK_04_BrowOuterUpLeft:.08,AK_05_BrowOuterUpRight:.08
  };
  for(const mesh of faces)for(const [name,index]of Object.entries(mesh.morphTargetDictionary!))
   mesh.morphTargetInfluences![index]=weights[name]||0;
 };
 return {bones,face};
}
