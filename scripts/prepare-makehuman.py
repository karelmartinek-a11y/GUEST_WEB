import bpy, sys, json, math
from pathlib import Path
from mathutils import Vector, Matrix

args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
WORK=Path(args[0] if args else '.cache/dagmar/makehuman').resolve()
ASSETS=WORK/'downloads/assets'
sys.path.insert(0,str(WORK/'mpfb2-2.0.17/src'))
import mpfb
# Keep this build isolated from the user's installed Blender extensions/settings.
original_extension_path=bpy.utils.extension_path_user
bpy.utils.extension_path_user=lambda package,*a,**k: str(WORK/'mpfb-user') if package=='mpfb' else original_extension_path(package,*a,**k)
preferences={'mpfb_user_data':str(WORK/'mpfb-user'),'mpfb_second_root':str(ASSETS),'mh_auto_user_data':False}
mpfb.get_preference=lambda name: preferences.get(name)
mpfb.register()
from mpfb.services import HumanService, TargetService, FaceService, ExportService, MaterialService
from mpfb.entities.material.makeskinmaterial import MakeSkinMaterial

bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
macro=TargetService.get_default_macro_info_dict()
macro.update(gender=0.0,age=.57,muscle=.38,weight=.52,height=.5,proportions=.5,cupsize=.38,firmness=.45)
macro['race']={'caucasian':1.0,'african':0.0,'asian':0.0}
body=HumanService.create_human(macro_detail_dict=macro)
body.name='Dagmar-body'
for target,value in [('head/head-oval',.23),('chin/chin-width-decr',.16),('chin/chin-bones-decr',.13)]:
    TargetService.load_target(body,str(WORK/'mpfb2-2.0.17/src/mpfb/data/targets'/(target+'.target.gz')),weight=value)
TargetService.bake_targets(body)
HumanService.set_character_skin(str(ASSETS/'skins/young_caucasian_female/young_caucasian_female.mhmat'),body,skin_type='MAKESKIN')
rig=HumanService.add_builtin_rig(body,'game_engine');rig.name='Dagmar'

def part(folder,name,kind):
    obj=HumanService.add_mhclo_asset(str(ASSETS/folder/name/(name+'.mhclo')),body,asset_type=kind,subdiv_levels=1)
    obj.name='Dagmar-'+name
    return obj

eyes=part('eyes','high-poly','Eyes')
skin=MakeSkinMaterial();skin.populate_from_mhmat(str(ASSETS/'eyes/materials/brownlight.mhmat'))
eyes.data.materials.clear();mat=MaterialService.create_empty_material('Dagmar-eyes',eyes);skin.apply_node_tree(mat)
part('eyebrows','eyebrow001','Eyebrows')
part('eyelashes','eyelashes01','Eyelashes')
part('teeth','teeth_base','Teeth')
part('tongue','tongue01','Tongue')
hair=part('hair','long01','Hair')
outfit=part('clothes','female_casualsuit01','Clothes')
shoes=part('clothes','shoes03','Clothes')

# Plain hotel clothing: reuse the authored garment mesh with simple PBR fabrics.
def fabric(name,color):
    m=bpy.data.materials.new(name);m.use_nodes=True
    n=m.node_tree.nodes.get('Principled BSDF');n.inputs['Base Color'].default_value=(*color,1);n.inputs['Roughness'].default_value=.85
    m.diffuse_color=(*color,1);return m
outfit.data.materials.clear()
outfit.data.materials.append(fabric('Dagmar-teal-fabric',(.025,.19,.16)))
outfit.data.materials.append(fabric('Dagmar-navy-fabric',(.035,.045,.065)))
parents=list(range(len(outfit.data.vertices)))
def root(i):
    while parents[i]!=i:parents[i]=parents[parents[i]];i=parents[i]
    return i
for edge in outfit.data.edges:parents[root(edge.vertices[0])]=root(edge.vertices[1])
tops={}
for v in outfit.data.vertices:tops[root(v.index)]=max(tops.get(root(v.index),0),v.co.z)
for poly in outfit.data.polygons:poly.material_index=0 if tops[root(poly.vertices[0])]>1.2 else 1
for cloth in [outfit,shoes]:
    group='Delete.'+cloth.name.removeprefix('Dagmar-')
    if group in body.vertex_groups:
        mask=body.modifiers.new('Covered by '+cloth.name,'MASK');mask.vertex_group=group;mask.invert_vertex_group=True

FaceService.load_targets(body,load_microsoft_visemes=False,load_meta_visemes=True,load_arkit_faceunits=True)
FaceService.interpolate_targets(body)
meshes=[o for o in bpy.data.objects if o.type=='MESH']
for obj in meshes:
    for poly in obj.data.polygons:poly.use_smooth=True
    # Retain the source skin and PBR materials, reduce the shiny default skin.
    for mat in obj.data.materials:
        if mat and mat.use_nodes:
            for node in mat.node_tree.nodes:
                if node.type=='BSDF_PRINCIPLED':
                    if obj==body:node.inputs['Roughness'].default_value=.52
                    if obj==eyes:node.inputs['Roughness'].default_value=.18
    if obj.data.shape_keys:
        keys=obj.data.shape_keys.key_blocks
        for key in keys:key.value=0
        for name in ['mouthSmileLeft','mouthSmileRight']:
            if name in keys:keys[name].value=.65
        for name in ['cheekSquintLeft','cheekSquintRight']:
            if name in keys:keys[name].value=.14

# Relax the shoulders and arms using the fitted rig.
for suffix,sign in [('l',1),('r',-1)]:
    pb=rig.pose.bones['upperarm_'+suffix]
    desired=Vector((sign*.20,-.025,-.78))
    original=pb.tail-pb.head
    rotate=original.rotation_difference(desired)
    posed=rotate.to_matrix().to_4x4()@pb.matrix
    posed.translation=pb.head.copy();pb.matrix=posed
bpy.context.view_layer.update()

scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=720;scene.render.resolution_y=1080;scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.world.color=(.3,.3,.3)
scene.view_settings.view_transform='AgX'
def aim(obj,point):obj.rotation_euler=(Vector(point)-obj.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(.15,-5.5,1.1));camera=bpy.context.object
camera.data.type='ORTHO';camera.data.ortho_scale=2.08;aim(camera,(0,0,.91));scene.camera=camera
for loc,power,size in [((-3,-4,5),600,4),((3,-2,3),350,3),((1,3,4),700,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc);light=bpy.context.object
    light.data.energy=power;light.data.shape='DISK';light.data.size=size;aim(light,(0,0,1))
inventory={'macro':macro,'meshes':[{ 'name':o.name,'vertices':len(o.data.vertices),'materials':[m.name for m in o.data.materials], 'morphs':[k.name for k in o.data.shape_keys.key_blocks] if o.data.shape_keys else []} for o in meshes], 'bones':[b.name for b in rig.data.bones]}
(WORK/'inventory.json').write_text(json.dumps(inventory,indent=2)+'\n')
bpy.ops.wm.save_as_mainfile(filepath=str(WORK/'dagmar-realistic-native.blend'))
for name,location in [('front',(.15,-5.5,1.1)),('side',(5.5,-.5,1.1)),('back',(.15,5.5,1.1))]:
    camera.location=location;aim(camera,(0,0,.91))
    scene.render.filepath=str(WORK/('dagmar-realistic-'+name+'.png'));bpy.ops.render.render(write_still=True)
camera.location=(.02,-5.5,1.62);camera.data.ortho_scale=.62;aim(camera,(0,0,1.55))
scene.render.resolution_x=800;scene.render.resolution_y=850;scene.render.filepath=str(WORK/'dagmar-realistic-face.png');bpy.ops.render.render(write_still=True)
print('REALISTIC_PREVIEW_DONE',flush=True)
