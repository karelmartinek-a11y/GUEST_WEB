"""Create the local Dagmar rig from two author-supplied CC0 archives.

Usage: python3 scripts/prepare-dagmar-assets.py MOTION.zip CHARACTERS.zip
The Standard downloads on quaternius.itch.io require neither an account nor payment.
No download token, account data, texture hotlink or runtime CDN is retained.
"""
import hashlib
import json
from pathlib import Path
import struct
import sys
import zipfile

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public/media/dagmar'
OUT.mkdir(parents=True, exist_ok=True)
motion_archive, character_archive = [zipfile.ZipFile(p) for p in sys.argv[1:3]]
motion_path = next(p for p in motion_archive.namelist() if p.endswith('/UAL1_Standard.glb'))
character_path = next(p for p in character_archive.namelist() if p.endswith('/Godot - UE/Superhero_Female_FullBody.gltf'))
raw = motion_archive.read(motion_path)
size = struct.unpack_from('<I', raw, 12)[0]
motion = json.loads(raw[20:20 + size])
motion_binary = raw[28 + size:]
model = json.loads(character_archive.read(character_path))
binary = bytearray(character_archive.read(str(Path(character_path).parent / model['buffers'][0]['uri'])))

def quat_product(a, b):
    x,y,z,w=a; X,Y,Z,W=b
    return [w*X+x*W+y*Z-z*Y, w*Y-x*Z+y*W+z*X, w*Z+x*Y-y*X+z*W, w*W-x*X-y*Y-z*Z]

def accessor(document, blob, index):
    a = document['accessors'][index]
    v = document['bufferViews'][a['bufferView']]
    width = {'SCALAR':1, 'VEC3':3, 'VEC4':4}[a['type']]
    assert a['componentType'] == 5126 and not a.get('sparse')
    stride = v.get('byteStride', width*4)
    offset = v.get('byteOffset',0)+a.get('byteOffset',0)
    return [list(struct.unpack_from('<'+'f'*width, blob, offset+i*stride)) for i in range(a['count'])]

def append(values, kind):
    while len(binary)%4:binary.append(0)
    offset=len(binary)
    for value in values:binary.extend(struct.pack('<'+'f'*len(value),*value))
    model['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':len(binary)-offset})
    a={'bufferView':len(model['bufferViews'])-1,'componentType':5126,'count':len(values),'type':kind}
    if kind=='SCALAR':a.update(min=[min(v[0] for v in values)],max=[max(v[0] for v in values)])
    model['accessors'].append(a)
    return len(model['accessors'])-1

targets={n.get('name'):i for i,n in enumerate(model['nodes'])}
model['animations']=[]
selected={'Idle_Loop':'idle','Walk_Formal_Loop':'walk','Idle_Talking_Loop':'talk','Interact':'present'}
for source in motion['animations']:
    if source['name'] not in selected:continue
    animation={'name':selected[source['name']],'channels':[],'samplers':[]}
    for channel in source['channels']:
        source_node=motion['nodes'][channel['target']['node']]
        name=source_node['name'];path=channel['target']['path']
        if name not in targets or path=='scale' or (path=='translation' and name!='pelvis'):continue
        sampler=source['samplers'][channel['sampler']]
        values=accessor(motion,motion_binary,sampler['output'])
        target_node=model['nodes'][targets[name]]
        if path=='rotation':
            rest=source_node.get('rotation',[0,0,0,1]);target=target_node.get('rotation',[0,0,0,1])
            correction=quat_product(target,[-rest[0],-rest[1],-rest[2],rest[3]])
            values=[quat_product(correction,q) for q in values]
        else:
            rest=source_node.get('translation',[0,0,0]);target=target_node.get('translation',[0,0,0])
            ratio=target[2]/rest[2]
            values=[[target[i]+(q[i]-rest[i])*ratio for i in range(3)]for q in values]
        times=accessor(motion,motion_binary,sampler['input'])
        animation['channels'].append({'sampler':len(animation['samplers']),'target':{'node':targets[name],'path':path}})
        animation['samplers'].append({'input':append(times,'SCALAR'),'output':append(values,'VEC4' if path=='rotation' else 'VEC3'),'interpolation':'LINEAR'})
    model['animations'].append(animation)

# Keep only the original eye colour texture. Skin, clothes and hair are modelled
# locally, rather than shipping all seven multi-megabyte texture maps.
eye=next(m for m in model['materials'] if m['name']=='MI_Eyes')
eye_texture=model['textures'][eye['pbrMetallicRoughness']['baseColorTexture']['index']]
eye_image=model['images'][eye_texture['source']]
eye_bytes=character_archive.read(str(Path(character_path).parent/eye_image['uri']))
while len(binary)%4:binary.append(0)
model['bufferViews'].append({'buffer':0,'byteOffset':len(binary),'byteLength':len(eye_bytes)})
binary.extend(eye_bytes)
model['images']=[{'mimeType':'image/png','bufferView':len(model['bufferViews'])-1}]
model['textures']=[{'source':0}]
for material in model['materials']:
    name=material['name']
    material.clear();material['name']=name
    material['pbrMetallicRoughness']={'baseColorFactor':[.79,.57,.42,1],'metallicFactor':0,'roughnessFactor':.82}
    if name=='MI_Eyes':material['pbrMetallicRoughness']={'baseColorTexture':{'index':0},'metallicFactor':0,'roughnessFactor':.45}
    if name=='MI_Hair_2':material['pbrMetallicRoughness']['baseColorFactor']=[.29,.26,.23,1]
model.pop('extensionsUsed',None);model.pop('extensionsRequired',None)
model['buffers']=[{'byteLength':len(binary)}]
model['asset']['copyright']='Base mesh and body animations: Quaternius, CC0 1.0. Dagmar styling: Hotel CHODOV ASC.'
encoded=json.dumps(model,separators=(',',':')).encode()
encoded+=b' '*((-len(encoded))%4);binary+=b'\0'*((-len(binary))%4)
glb=struct.pack('<III',0x46546c67,2,28+len(encoded)+len(binary))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(binary),0x004e4942)+binary
(OUT/'dagmar-rig.glb').write_bytes(glb)
for archive,name in [(motion_archive,'motions-CC0.txt'),(character_archive,'base-CC0.txt')]:
    license_path=next(p for p in archive.namelist()if Path(p).name.lower().startswith('license')and p.lower().endswith('.txt'))
    (OUT/name).write_bytes(archive.read(license_path))
sha=lambda data:hashlib.sha256(data).hexdigest()
evidence={
    'verifiedOn':'2026-10-09','license':'CC0-1.0','licenseUrl':'https://creativecommons.org/publicdomain/zero/1.0/',
    'author':'Quaternius','registrationRequired':False,'paidContentUsed':False,
    'sources':[
        {'url':'https://quaternius.itch.io/universal-animation-library','archiveSha256':sha(Path(sys.argv[1]).read_bytes()),'member':motion_path,'memberSha256':sha(raw),'clips':list(selected)},
        {'url':'https://quaternius.itch.io/universal-base-characters','archiveSha256':sha(Path(sys.argv[2]).read_bytes()),'member':character_path,'memberSha256':sha(character_archive.read(character_path))}
    ],
    'output':{'path':'public/media/dagmar/dagmar-rig.glb','sha256':sha(glb),'bytes':len(glb)},
    'changes':['Retargeted four body clips to female base rest pose','Removed unused texture maps','Packed the local rig and eye texture into GLB'],
    'originalDesign':'Original grey bob, beige jacket, teal dress, pearls and terrier are authored in src/dagmar/model.ts; original supplied illustration remains a fallback.',
    'speechTiming':'Browser speech boundary events with estimated viseme timing; no microphone, remote speech service or facial capture.'
}
(ROOT/'docs/dagmar-animation-sources.json').write_text(json.dumps(evidence,indent=2)+'\n')
print('Prepared',len(glb),'bytes;',len(model['animations']),'licensed animations;',sha(glb))
