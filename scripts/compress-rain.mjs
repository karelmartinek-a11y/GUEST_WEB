// Build-time only; install pinned tools into the ignored cache as documented.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {NodeIO} from '../.cache/dagmar/asset-tools/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../.cache/dagmar/asset-tools/node_modules/@gltf-transform/extensions/dist/index.js';
import {meshopt,prune,resample} from '../.cache/dagmar/asset-tools/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptEncoder} from '../.cache/dagmar/asset-tools/node_modules/meshoptimizer/index.js';

await MeshoptEncoder.ready;
execFileSync('python3',['-c',`from PIL import Image
from pathlib import Path
cache=Path('.cache/dagmar')
for p in cache.glob('rain-*.png'):
 if p.stem.startswith(('rain-web','rain-native','rain-final','rain-app','rain-poster')): continue
 Image.open(p).convert('RGB').save(cache/('Rain-web-'+p.stem.removeprefix('rain-')+'.jpg'),quality=92,subsampling=0)
Image.open(cache/'rain-poster.png').save(cache/'rain-poster.webp',quality=93,method=6)
`]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const document=await io.read('.cache/dagmar/rain-candidate.glb');
// Baked opaque colour maps compress well as JPEG; preserve full alpha when needed.
for(const texture of document.getRoot().listTextures()) {
 const file=`.cache/dagmar/${texture.getName()}.jpg`;
 if(fs.existsSync(file))texture.setImage(fs.readFileSync(file)).setMimeType('image/jpeg');
}
await document.transform(resample(),prune(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:12,quantizeTexcoord:14}));
const bytes=await io.writeBinary(document);
const sha=crypto.createHash('sha256').update(bytes).digest('hex');
const path=`public/media/dagmar/rain-${sha.slice(0,12)}.glb`;
fs.writeFileSync(path,bytes);
const posterBytes=fs.readFileSync('.cache/dagmar/rain-poster.webp');
const posterSha=crypto.createHash('sha256').update(posterBytes).digest('hex');
const posterPath=`public/media/dagmar/rain-${posterSha.slice(0,12)}.webp`;
fs.writeFileSync(posterPath,posterBytes);
const poster={url:`/${posterPath.replace(/^public\//,'')}`,sha256:posterSha,bytes:posterBytes.length};
fs.writeFileSync('src/dagmar/asset.json',JSON.stringify({url:`/${path.replace(/^public\//,'')}`,sha256:sha,bytes:bytes.length,poster},null,2)+'\n');
const evidence=JSON.parse(fs.readFileSync('docs/dagmar-animation-sources.json'));
evidence.output={path,sha256:sha,bytes:bytes.length};
evidence.poster={path:posterPath,sha256:posterSha,bytes:posterBytes.length,license:'CC-BY-4.0'};
if(!evidence.changes.includes('Posed and skinned the ponytail with four joints for gentle secondary motion'))
 evidence.changes.push('Posed and skinned the ponytail with four joints for gentle secondary motion');
fs.writeFileSync('docs/dagmar-animation-sources.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({path,sha256:sha,bytes:bytes.length}));
