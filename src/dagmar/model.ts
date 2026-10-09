import * as THREE from 'three';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';

const skin = new THREE.Color('#d9a582');
const cream = new THREE.Color('#e5d6bd');
const teal = new THREE.Color('#225563');
const shoe = new THREE.Color('#173b43');
const material = (color: string, roughness = .78) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
const sphere = new THREE.SphereGeometry(1, 20, 14);

function ellipsoid(parent: THREE.Object3D, colour: THREE.Material, at: number[], scale: number[]) {
 const mesh = new THREE.Mesh(sphere, colour);
 mesh.position.fromArray(at); mesh.scale.fromArray(scale); parent.add(mesh); return mesh;
}
function line(parent: THREE.Object3D, points: number[][], radius: number, colour: THREE.Material) {
 const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p as [number,number,number])));
 const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, radius, 6, false), colour); parent.add(mesh); return mesh;
}
function attachedInRestPose(bone: THREE.Object3D) {
 const group = new THREE.Group(); group.applyMatrix4(bone.matrixWorld.clone().invert()); bone.add(group); return group;
}
function skinGeometry(geometry: THREE.BufferGeometry, reference: THREE.SkinnedMesh, weights: (p: THREE.Vector3) => [string,number][]) {
 const names = new Map(reference.skeleton.bones.map((b,i) => [b.name,i]));
 const indices: number[] = [], values: number[] = [], position = geometry.getAttribute('position');
 for (let i=0;i<position.count;i++) {
  const row=weights(new THREE.Vector3().fromBufferAttribute(position,i));
  for (let j=0;j<4;j++) { indices.push(names.get(row[j]?.[0]) ?? 0); values.push(row[j]?.[1] ?? 0); }
 }
 geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));
 geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(values,4));
 const mesh=new THREE.SkinnedMesh(geometry,material('#225563'));
 mesh.bind(reference.skeleton,reference.bindMatrix); mesh.frustumCulled=false; reference.parent!.add(mesh); return mesh;
}

/** An original concierge design over the licensed, articulated human base. */
export function dressDagmar(gltf: GLTF) {
 const body=gltf.scene.getObjectByName('Superhero_Female') as THREE.SkinnedMesh;
 if (!body?.isSkinnedMesh) throw new Error('Dagmar skeleton is missing');
 gltf.scene.updateMatrixWorld(true);
 const bones=Object.fromEntries(body.skeleton.bones.map(b=>[b.name,b]));
 body.frustumCulled=false;
 const geometry=body.geometry.clone(); body.geometry=geometry;
 const positions=geometry.getAttribute('position');
 // Adapt the superhero base to Dagmar's softer proportions while retaining
 // the licensed joint locations and every original skin weight.
 for(let i=0;i<positions.count;i++) {
  const y=positions.getY(i),x=positions.getX(i);
  if(y>.115&&y<.565){const centre=Math.sign(x)*.1114,blend=Math.sin((y-.115)/.45*Math.PI)*.25;positions.setX(i,centre+(x-centre)*(1-blend));}
 }
 positions.needsUpdate=true;
 const colours: number[]=[];
 for(let i=0;i<positions.count;i++) {
  const x=positions.getX(i), y=positions.getY(i), z=positions.getZ(i);
  let colour=skin;
  if(y<.10)colour=shoe;
  else if(y>.57&&y<1.12)colour=teal;
  else if(y>=1.12&&y<1.45&&Math.abs(x)<.65)colour=(Math.abs(x)<.10&&z>.03)?teal:cream;
  colours.push(colour.r,colour.g,colour.b);
 }
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));
 const bodyMaterial=material('#ffffff',.9);bodyMaterial.vertexColors=true;body.material=bodyMaterial;

 // Tailored cloth is a smooth outer surface, not the anatomical base painted
 // beige. A continuous shoulder and elbow skin avoids detached rigid sleeves.
 const cloth=(points:number[],indices:number[],weights:(p:THREE.Vector3)=>[string,number][])=>{
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.setIndex(indices);g.computeVertexNormals();
  const mesh=skinGeometry(g,body,weights);mesh.material=material('#e5d6bd');(mesh.material as THREE.MeshStandardMaterial).side=THREE.DoubleSide;return mesh;
 };
 const profile=[[1.075,.184,.139],[1.14,.169,.130],[1.22,.174,.137],[1.31,.199,.151],[1.40,.195,.118],[1.455,.179,.097],[1.49,.066,.060]];
 const jacketPoints:number[]=[],jacketIds:number[]=[],jacketSides=40;
 profile.forEach(([y,rx,rz],row)=>{
  const gap=y>1.40?.47:.25;
  for(let col=0;col<=jacketSides;col++) {
   const a=Math.PI/2+gap+col/jacketSides*(Math.PI*2-gap*2);
   jacketPoints.push(Math.cos(a)*rx,y,Math.sin(a)*rz-.029);
   if(row<profile.length-1&&col<jacketSides){const i=row*(jacketSides+1)+col,j=i+jacketSides+1;jacketIds.push(i,j,i+1,i+1,j,j+1);}
  }
 });
 cloth(jacketPoints,jacketIds,p=>{
  if(p.y<1.12){const w=THREE.MathUtils.clamp((p.y-1.07)/.05,0,1);return [['pelvis',1-w],['spine_01',w]];}
  if(p.y<1.26){const w=(p.y-1.12)/.14;return [['spine_01',1-w],['spine_02',w]];}
  const w=THREE.MathUtils.clamp((p.y-1.26)/.13,0,1);return [['spine_02',1-w],['spine_03',w]];
 });
 for(const side of [-1,1]) {
  const points:number[]=[],ids:number[]=[],rows=18,sides=20;
  for(let row=0;row<=rows;row++)for(let col=0;col<=sides;col++) {
   const t=row/rows,x=.145+.470*t,r=.078-.034*t,a=col/sides*Math.PI*2;
   points.push(side*x,1.417+Math.cos(a)*r,-.055+Math.sin(a)*r);
   if(row<rows&&col<sides){const i=row*(sides+1)+col,j=i+sides+1;ids.push(i,j,i+1,i+1,j,j+1);}
  }
  const suffix=side===1?'l':'r';
  cloth(points,ids,p=>{const w=THREE.MathUtils.clamp((Math.abs(p.x)-.335)/.105,0,1);return [[`upperarm_${suffix}`,1-w],[`lowerarm_${suffix}`,w]];});
 }

 // A skirt with a smooth hem and gradual pelvis/thigh weights.
 const skirtPositions: number[]=[], skirtIndices: number[]=[], rings=12, sides=48;
 for(let row=0;row<=rings;row++) {
  const t=row/rings,y=1.10-.55*t,rx=.161+.104*Math.pow(t,.75),rz=.113+.060*t;
  for(let col=0;col<=sides;col++) {
   const theta=col/sides*Math.PI*2,pleat=1+.014*Math.cos(theta*12)*t;
   skirtPositions.push(Math.cos(theta)*rx*pleat,y,Math.sin(theta)*rz*pleat-.029);
   if(row<rings&&col<sides){const a=row*(sides+1)+col,b=a+sides+1;skirtIndices.push(a,b,a+1,a+1,b,b+1);}
  }
 }
 const skirtGeometry=new THREE.BufferGeometry();skirtGeometry.setAttribute('position',new THREE.Float32BufferAttribute(skirtPositions,3));skirtGeometry.setIndex(skirtIndices);skirtGeometry.computeVertexNormals();
 const skirt=skinGeometry(skirtGeometry,body,p=>{const lower=THREE.MathUtils.clamp((1.04-p.y)/.55,0,.36);return [['pelvis',1-lower],[p.x>0?'thigh_l':'thigh_r',lower]];});
 (skirt.material as THREE.MeshStandardMaterial).side=THREE.DoubleSide;

 const torso=attachedInRestPose(bones.spine_03),head=attachedInRestPose(bones.Head);
 const pearl=material('#fff5dc',.3),gold=material('#ac8350',.38),hair=material('#bdb9b1'),hairLight=material('#ddd9d0'),hairShade=material('#96938d');
 // Lapels, buttons, waist belt and pearls are authored for Dagmar, not a stock
 // character's identity. All attachment transforms use the actual bind pose.
 for(const side of [-1,1]) {
  const shape=new THREE.Shape();shape.moveTo(side*.07,1.43);shape.lineTo(side*.13,1.35);shape.lineTo(side*.088,1.21);shape.lineTo(side*.034,1.40);shape.closePath();
  const lapel=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.007,bevelEnabled:true,bevelSize:.003,bevelThickness:.002,bevelSegments:1,steps:1}),material('#eee1cc'));lapel.position.z=.127;torso.add(lapel);
  ellipsoid(head,pearl,[side*.086,1.571,.015],[.008,.010,.008]);
 }
 for(let i=0;i<15;i++){const a=i/14*Math.PI;ellipsoid(torso,pearl,[Math.cos(a)*.064,1.438-Math.sin(a)*.024,.034+Math.sin(a)*.065],[.006,.006,.006]);}
 for(let i=0;i<2;i++)ellipsoid(torso,gold,[.106,1.18+i*.064,.133],[.005,.005,.002]);
 for(const side of [-1,1]) {
  const foot=attachedInRestPose(bones[side===1?'foot_l':'foot_r']),x=side*.1114,pump=material('#173b43',.48);
  ellipsoid(foot,pump,[x,.034,.064],[.044,.027,.080]);ellipsoid(foot,pump,[x,.052,-.004],[.042,.032,.058]);
  const heel=new THREE.Mesh(new THREE.BoxGeometry(.029,.039,.038),pump);heel.position.set(x,.016,-.075);foot.add(heel);
  ellipsoid(foot,gold,[x,.079,.033],[.015,.003,.008]);
 }
 line(torso,[[-.15,1.10,.092],[0,1.10,.125],[.15,1.10,.092]],.009,material('#1c434f'));

 // Sculpted silver bob: a scalp, back volume and curved locks with a side part.
 const cap=new THREE.Mesh(new THREE.SphereGeometry(.109,28,20,0,Math.PI*2,0,1.40),hair);
 cap.position.set(0,1.664,-.015);cap.scale.set(1.03,1.03,1.06);head.add(cap);
 const back=new THREE.Mesh(new THREE.SphereGeometry(.112,24,20,Math.PI/2,Math.PI,0,2.65),hairShade);back.position.set(0,1.652,-.027);back.scale.set(1.05,1.10,.94);head.add(back);
 for(const side of [-1,1])for(let i=0;i<8;i++) {
  const offset=i*.008;
  line(head,[[side*(.014+offset*.30),1.773-offset*.12,.022+offset*.35],[side*(.070+offset*.35),1.733,.069-offset*.38],[side*(.103+offset*.16),1.651,.016-offset*.58],[side*(.097+offset*.22),1.594,-.011-offset*.36],[side*.069,1.577,-.013-offset*.35]],.0105,i%3===0?hairLight:hair);
 }

 // Facial morph targets deform the lower face and eyelids, independently of
 // the body rig. Lip contours and the mouth cavity share the same pose values.
 const base=Float32Array.from(positions.array as ArrayLike<number>),jaw=new Float32Array(base.length),blink=new Float32Array(base.length),smile=new Float32Array(base.length);
 for(let i=0;i<positions.count;i++) {
  const x=base[i*3],y=base[i*3+1],z=base[i*3+2];
  if(z>.045&&y>1.535&&y<1.60) {
   const w=Math.exp(-Math.pow(x/.046,4))*Math.exp(-Math.pow((y-1.572)/.026,2));
   jaw[i*3+1]=-.014*w;jaw[i*3+2]=.002*w;
   smile[i*3]=Math.sign(x)*.006*w;smile[i*3+1]=.003*w*Math.min(1,Math.abs(x)/.018);
  }
  if(z>.045&&Math.abs(Math.abs(x)-.030)<.023&&Math.abs(y-1.657)<.019) {
   const w=Math.exp(-Math.pow((Math.abs(x)-.030)/.016,4));blink[i*3+1]=(1.655-y)*w;
  }
 }
 geometry.morphTargetsRelative=true;geometry.morphAttributes.position=[new THREE.Float32BufferAttribute(jaw,3),new THREE.Float32BufferAttribute(blink,3),new THREE.Float32BufferAttribute(smile,3)];
 body.updateMorphTargets();body.morphTargetDictionary={jawOpen:0,blink:1,smile:2};
 const mouth=ellipsoid(head,material('#4b2021'),[0,1.581,.096],[.027,.001,.008]);
 const teeth=ellipsoid(head,material('#fff4dc'),[0,1.582,.102],[.020,.002,.002]);
 const lipsMaterial=material('#a76360');
 const makeLip=()=>{const g=new THREE.BufferGeometry();const verts=new Float32Array(33*7*3);g.setAttribute('position',new THREE.BufferAttribute(verts,3));const ids=[];for(let i=0;i<32;i++)for(let j=0;j<6;j++){const a=i*7+j,b=a+7;ids.push(a,b,a+1,a+1,b,b+1);}g.setIndex(ids);const mesh=new THREE.Mesh(g,lipsMaterial);head.add(mesh);return mesh;};
 const upperLip=makeLip(),lowerLip=makeLip();
 function face(pose: {open:number;round:number;wide:number;press:number}, eyelids: number, smiling: number) {
  const open=THREE.MathUtils.clamp(pose.open*(1-pose.press),0,1),rx=.027+.011*pose.wide-.010*pose.round,ry=.0012+.014*open+.006*pose.round;
  const cy=1.581-.004*open;
  body.morphTargetInfluences![0]=open;body.morphTargetInfluences![1]=eyelids;body.morphTargetInfluences![2]=smiling;
  mouth.position.y=cy;mouth.scale.set(rx,ry,.009);teeth.position.y=cy+ry*.5;teeth.scale.set(rx*.75,Math.min(.003,ry*.35),.002);teeth.visible=open>.16;
  for(const [mesh,lower] of [[upperLip,false],[lowerLip,true]] as const) {
   const p=mesh.geometry.getAttribute('position');
   for(let i=0;i<=32;i++)for(let j=0;j<=6;j++) {
    const a=i/32*Math.PI+(lower?Math.PI:0),b=j/6*Math.PI*2;
    const radius=.0023;
    p.setXYZ(i*7+j,Math.cos(a)*(rx+radius*Math.cos(b)),cy+Math.sin(a)*(ry+radius*Math.cos(b))+smiling*.0015*Math.abs(Math.cos(a)),.105+radius*Math.sin(b)-.012*Math.pow(Math.cos(a),2));
   }
   p.needsUpdate=true;mesh.geometry.computeVertexNormals();
  }
 }
 face({open:0,round:0,wide:0,press:0},0,.4);
 return {bones,body,face,skirt};
}

export function createTerrier() {
 const dog=new THREE.Group(),fur=material('#e9dcc5'),white=material('#f3ead8'),tan=material('#b49370'),dark=material('#332a25'),collar=material('#225563');
 const trunk=ellipsoid(dog,fur,[0,.205,0],[.12,.14,.095]);
 const head=new THREE.Group();head.position.set(0,.35,.045);dog.add(head);
 ellipsoid(head,white,[0,0,0],[.10,.096,.090]);
 for(const side of [-1,1]) {
  const ear=ellipsoid(head,tan,[side*.077,-.026,-.001],[.033,.080,.029]);ear.rotation.z=side*.35;
  ellipsoid(head,dark,[side*.039,.018,.078],[.012,.014,.008]);
  ellipsoid(head,white,[side*.038,-.035,.079],[.048,.035,.033]);
 }
 ellipsoid(head,dark,[0,-.018,.111],[.024,.017,.013]);
 ellipsoid(head,material('#ae716b'),[0,-.063,.088],[.019,.022,.007]);
 const band=new THREE.Mesh(new THREE.TorusGeometry(.074,.011,6,24),collar);band.rotation.x=Math.PI/2;band.position.set(0,.289,.025);dog.add(band);
 ellipsoid(dog,material('#b69453',.38),[0,.276,.103],[.013,.017,.003]);
 const legs:THREE.Group[]=[];
 for(const side of [-1,1])for(const fore of [-1,1]) {
  const leg=new THREE.Group();leg.position.set(side*.069,.16,fore*.058);dog.add(leg);legs.push(leg);
  ellipsoid(leg,fur,[0,-.035,0],[.034,.065,.032]);ellipsoid(leg,white,[0,-.113,.014],[.037,.032,.046]);
 }
 const tail=new THREE.Group();tail.position.set(0,.20,-.087);dog.add(tail);
 line(tail,[[0,0,0],[0,.055,-.025],[0,.115,-.026],[0,.13,-.005]],.022,white);
 return {dog,update:(time:number,walking:boolean)=>{tail.rotation.z=Math.sin(time*8)*.18;head.rotation.z=Math.sin(time*.7)*.035;trunk.scale.y=.14*(1+Math.sin(time*2.2)*.012);legs.forEach((leg,i)=>leg.rotation.x=walking?Math.sin(time*8+(i===0||i===3?0:Math.PI))*.42:0);}};
}
