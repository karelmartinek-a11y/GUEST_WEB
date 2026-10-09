// Build-time tools live in the ignored cache; see docs/makehuman-preparation.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {NodeIO} from '../.cache/dagmar/asset-tools/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../.cache/dagmar/asset-tools/node_modules/@gltf-transform/extensions/dist/index.js';
import {meshopt,prune,resample} from '../.cache/dagmar/asset-tools/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptEncoder} from '../.cache/dagmar/asset-tools/node_modules/meshoptimizer/index.js';

const work=path.resolve(process.argv[2]||'.cache/dagmar/makehuman');
const textureDir=path.join(work,'web-textures');fs.mkdirSync(textureDir,{recursive:true});
await MeshoptEncoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const document=await io.read(path.join(work,'dagmar-realistic.glb'));
for(const [i,texture]of document.getRoot().listTextures().entries()){
 const input=path.join(textureDir,`${i}.source`);fs.writeFileSync(input,texture.getImage());
 const output=execFileSync('python3',['-c',`from PIL import Image
import sys
im=Image.open(sys.argv[1]);im.thumbnail((2048,2048),Image.Resampling.LANCZOS)
alpha='A' in im.getbands() and im.getchannel('A').getextrema()[0]<255
output=sys.argv[1]+('.png' if alpha else '.jpg')
if alpha: im.save(output,optimize=True)
else: im.convert('RGB').save(output,quality=90,subsampling=0)
print(output)
`,input],{encoding:'utf8'}).trim();
 texture.setImage(fs.readFileSync(output)).setMimeType(output.endsWith('.png')?'image/png':'image/jpeg');
}
// MakeSkin connects alpha even on opaque maps. glTF BLEND would disable depth
// writes and expose the teeth/back of the head through the skin in Three.js.
for(const material of document.getRoot().listMaterials()){
 const cutout=/\.(long01|eyebrow001|eyelashes01)$/.test(material.getName());
 material.setAlphaMode(cutout?'MASK':'OPAQUE');
 if(cutout)material.setAlphaCutoff(.35);
}
await document.transform(resample(),prune(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:12,quantizeTexcoord:14}));
const bytes=await io.writeBinary(document),sha256=crypto.createHash('sha256').update(bytes).digest('hex');
const modelPath=`public/media/dagmar/realistic-${sha256.slice(0,12)}.glb`;fs.writeFileSync(modelPath,bytes);
const poster=path.join(work,'dagmar-realistic-poster.webp');
execFileSync('python3',['-c',"from PIL import Image;import sys;Image.open(sys.argv[1]).save(sys.argv[2],quality=93,method=6)",path.join(work,'dagmar-realistic-poster.png'),poster]);
const posterBytes=fs.readFileSync(poster),posterSha=crypto.createHash('sha256').update(posterBytes).digest('hex');
const posterPath=`public/media/dagmar/realistic-${posterSha.slice(0,12)}.webp`;fs.writeFileSync(posterPath,posterBytes);
const asset={url:`/${modelPath.slice(7)}`,sha256,bytes:bytes.length,poster:{url:`/${posterPath.slice(7)}`,sha256:posterSha,bytes:posterBytes.length}};
fs.writeFileSync('src/dagmar/asset.json',JSON.stringify(asset,null,2)+'\n');
const evidence=JSON.parse(fs.readFileSync('docs/dagmar-animation-sources.json'));
evidence.output={path:modelPath,sha256,bytes:bytes.length};
evidence.poster={path:posterPath,sha256:posterSha,bytes:posterBytes.length,license:'CC0-1.0'};
fs.writeFileSync('docs/dagmar-animation-sources.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(asset,null,2));
