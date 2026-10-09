import bpy,sys,json,bmesh
from pathlib import Path
from mathutils import Vector,Quaternion,Matrix
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
WORK=Path(args[0] if args else '.cache/dagmar/makehuman').resolve()
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(WORK/'mpfb2-2.0.17/src'))
import mpfb
original_extension_path=bpy.utils.extension_path_user
bpy.utils.extension_path_user=lambda package,*a,**k: str(WORK/'mpfb-user') if package=='mpfb' else original_extension_path(package,*a,**k)
mpfb.get_preference=lambda name: {'mpfb_user_data':str(WORK/'mpfb-user'),'mpfb_second_root':str(WORK/'downloads/assets')}.get(name)
mpfb.register()
from mpfb.services import ExportService
native=bpy.data.objects['Dagmar']
meshes=[o for o in bpy.data.objects if o.type=='MESH']
for bone in native.pose.bones:bone.matrix_basis.identity()
for obj in meshes:
    if obj.data.shape_keys:
        for key in obj.data.shape_keys.key_blocks:key.value=0
bpy.ops.import_scene.gltf(filepath=str(ROOT/'.cache/dagmar/quaternius-standard/Universal Animation Library[Standard]/Unreal-Godot/UAL1_Standard.glb'))
source=next(o for o in bpy.data.objects if o.type=='ARMATURE' and o!=native)
source.animation_data_clear();source.data.pose_position='REST'
def author_name(name):return 'Head' if name=='head' else 'root' if name=='Root' else name
def human_name(name):return 'head' if name=='Head' else 'Root' if name=='root' else name
# Put the fitted human into the animation author's neutral T-pose before binding.
# Preserve each human limb's roll; only align its longitudinal direction.
for suffix in ['l','r']:
    for stem in ['thigh','calf','foot','ball','upperarm','lowerarm','hand']:
        name=stem+'_'+suffix;pb=native.pose.bones[name];sb=source.data.bones.get(name)
        if sb:
            bpy.context.view_layer.update()
            delta=(pb.tail-pb.head).rotation_difference(sb.tail_local-sb.head_local)
            matrix=delta.to_matrix().to_4x4()@pb.matrix;matrix.translation=pb.head.copy();pb.matrix=matrix
bpy.context.view_layer.update()
joints={author_name(p.name):{'head':list(p.head),'tail':list(p.tail)} for p in native.pose.bones}

poses={
 'open':{'viseme_aa':.9},'round':{'viseme_O':.9,'viseme_U':.1},
 'wide':{'viseme_E':.9},'press':{'viseme_PP':.9},
 'blink':{'eyeBlinkLeft':1,'eyeBlinkRight':1},
 'smile':{'mouthSmileLeft':1,'mouthSmileRight':1,'cheekSquintLeft':.16,'cheekSquintRight':.16},
 'brow':{'browInnerUp':.2,'browOuterUpLeft':.06,'browOuterUpRight':.06}}
for obj in meshes:
    if obj.data.shape_keys:
        blocks=obj.data.shape_keys.key_blocks
        basis=[v.co.copy() for v in blocks[0].data]
        combined={}
        for name,weights in poses.items():
            valid=[(blocks[k],w) for k,w in weights.items() if k in blocks]
            if not valid:continue
            coords=[b.copy() for b in basis]
            for key,weight in valid:
                for i,v in enumerate(key.data):coords[i]+=(v.co-basis[i])*weight
            if any((a-b).length>1e-6 for a,b in zip(coords,basis)):combined[name]=coords
        obj.shape_key_clear()
        if combined:
            obj.shape_key_add(name='Basis')
            for name,coords in combined.items():
                key=obj.shape_key_add(name=name)
                for i,v in enumerate(coords):key.data[i].co=v
    # Keep alpha strands in the source hair/eyelash maps. Use a glTF-native PBR
    # material graph instead of exporting Blender-specific MakeSkin nodes.
    for mat in obj.data.materials:
        if not mat or not mat.use_nodes:continue
        nodes=mat.node_tree.nodes;old=next((n for n in nodes if n.type=='BSDF_PRINCIPLED'),None)
        diffuse=next((n.image for n in nodes if n.type=='TEX_IMAGE' and n.image and (n.name=='diffuse' or 'diffuse' in n.name.lower())),None)
        if diffuse is None:continue
        rough=.52 if obj.name=='Dagmar-body' else .18 if 'high-poly' in obj.name else .68
        transparent=any(n.type=='TEX_IMAGE' and n.image==diffuse and n.outputs.get('Alpha') and n.outputs['Alpha'].is_linked for n in nodes)
        nodes.clear();output=nodes.new('ShaderNodeOutputMaterial');bsdf=nodes.new('ShaderNodeBsdfPrincipled');tex=nodes.new('ShaderNodeTexImage');tex.image=diffuse
        mat.node_tree.links.new(tex.outputs['Color'],bsdf.inputs['Base Color'])
        if transparent:mat.node_tree.links.new(tex.outputs['Alpha'],bsdf.inputs['Alpha']);mat.surface_render_method='DITHERED'
        bsdf.inputs['Roughness'].default_value=rough
        mat.node_tree.links.new(bsdf.outputs['BSDF'],output.inputs['Surface'])
    if obj.name=='Dagmar-body' and not any(m.type=='SUBSURF' for m in obj.modifiers):
        obj.modifiers.new('Skin subdivision','SUBSURF')
    for mod in obj.modifiers:
        mod.show_viewport=True
        if mod.type=='SUBSURF':mod.levels=mod.render_levels=1
    modifiers=[m.name for m in obj.modifiers if m.type in ['MASK','ARMATURE','SUBSURF']]
    ExportService._apply_modifiers_keep_shapekeys(obj,modifiers)
    for mod in list(obj.modifiers):obj.modifiers.remove(mod)
    if obj.name=='Dagmar-shoes03':
        # The source footwear includes tall sock cuffs. They intersect these
        # trousers, so retain the shoe and ankle mesh below the trouser hem.
        mesh=bmesh.new();mesh.from_mesh(obj.data)
        bmesh.ops.delete(mesh,geom=[v for v in mesh.verts if v.co.z>.14],context='VERTS')
        mesh.to_mesh(obj.data);mesh.free();obj.data.update()
    obj.parent=None;obj.matrix_world=Matrix.Identity(4)
    print('BAKED',obj.name,len(obj.data.vertices),flush=True)

data=bpy.data.armatures.new('Dagmar web skeleton');rig=bpy.data.objects.new('Dagmar-web',data);bpy.context.scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
for sb in source.data.bones:
    bone=data.edit_bones.new(sb.name);matrix=sb.matrix_local.copy();joint=joints.get(sb.name)
    if joint:
        matrix.translation=Vector(joint['head']);bone.length=max(.008,(Vector(joint['tail'])-Vector(joint['head'])).length)
    elif sb.parent and sb.parent.name in joints:
        matrix.translation=Vector(joints[sb.parent.name]['tail']);bone.length=.01
    else:matrix.translation=Vector((0,0,0));bone.length=.01
    bone.matrix=matrix
    if sb.parent:bone.parent=data.edit_bones[sb.parent.name]
bpy.ops.object.mode_set(mode='OBJECT')
for obj in meshes:
    old={g.index:author_name(g.name) for g in obj.vertex_groups}
    rows=[]
    for v in obj.data.vertices:
        row={}
        for g in v.groups:
            name=old[g.group]
            if name in data.bones:row[name]=row.get(name,0)+g.weight
        if not row:row={'Head' if v.co.z>1.38 else 'pelvis':1}
        chosen=sorted(row.items(),key=lambda i:i[1],reverse=True)[:4];total=sum(w for _,w in chosen)
        rows.append([(n,w/total) for n,w in chosen])
    obj.vertex_groups.clear();groups={b.name:obj.vertex_groups.new(name=b.name) for b in data.bones}
    for i,row in enumerate(rows):
        for n,w in row:groups[n].add([i],w,'REPLACE')
    obj.parent=rig;mod=obj.modifiers.new('Dagmar skin','ARMATURE');mod.object=rig

rig.animation_data_create();clips={'Idle_Loop':'idle','Walk_Formal_Loop':'walk','Idle_Talking_Loop':'talk','Interact':'present'}
for original,name in clips.items():
    action=bpy.data.actions[original].copy();action.name='Dagmar-'+name
    ratio=joints['pelvis']['head'][2]/source.data.bones['pelvis'].head_local.z
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                rotations={}
                for curve in bag.fcurves:
                    if curve.data_path.endswith('.location'):
                        for key in curve.keyframe_points:key.co.y*=ratio;key.handle_left.y*=ratio;key.handle_right.y*=ratio
                    if curve.data_path.endswith('.rotation_quaternion'):rotations.setdefault(curve.data_path,{})[curve.array_index]=curve
                for path,curves in rotations.items():
                    if len(curves)!=4:continue
                    bone=path.split('"')[1];finger=any(n in bone for n in ['index_','middle_','ring_','pinky_','thumb_'])
                    if not finger and not(name=='idle' and bone in ['pelvis','thigh_l','thigh_r']):continue
                    for i in range(len(curves[0].keyframe_points)):
                        q=Quaternion([curves[j].keyframe_points[i].co.y for j in range(4)])
                        if finger:q=Quaternion().slerp(q,.28 if name=='idle' else .45)
                        elif bone=='pelvis':q=Quaternion().slerp(q,.45)
                        else:e=q.to_euler('XYZ');e.z*=.25;q=e.to_quaternion()
                        for j in range(4):
                            key=curves[j].keyframe_points[i];shift=q[j]-key.co.y;key.co.y=q[j];key.handle_left.y+=shift;key.handle_right.y+=shift
    rig.animation_data.action=action;rig.animation_data.action_slot=action.slots[0]
    track=rig.animation_data.nla_tracks.new();track.name=name;start,end=action.frame_range
    strip=track.strips.new(name,int(start),action);strip.action_slot=action.slots[0];strip.name=name;track.mute=True
rig.animation_data.action=None
for obj in list(bpy.data.objects):
    if obj not in meshes and obj!=rig and obj.type not in ['CAMERA','LIGHT']:bpy.data.objects.remove(obj,do_unlink=True)
for track in rig.animation_data.nla_tracks:track.mute=False
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for obj in meshes:obj.select_set(True)
bpy.context.view_layer.objects.active=rig;bpy.context.scene.render.fps=24
bpy.ops.wm.save_as_mainfile(filepath=str(WORK/'dagmar-realistic-web.blend'))
bpy.ops.export_scene.gltf(filepath=str(WORK/'dagmar-realistic.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_frame_range=False,export_frame_step=1,export_skins=True,export_morph=True,export_morph_normal=True,export_morph_tangent=False,export_extras=False,export_yup=True,export_copyright='Dagmar: MakeHuman Community assets and Mika Suominen facial targets (CC0 1.0). Body motion: Quaternius (CC0 1.0).')
for track in rig.animation_data.nla_tracks:track.mute=track.name!='idle'
for obj in meshes:
    if obj.data.shape_keys:
        for key in obj.data.shape_keys.key_blocks:key.value=.7 if key.name=='smile' else 0
scene=bpy.context.scene;scene.frame_set(19)
camera=scene.camera;camera.data.ortho_scale=1.95;camera.location=(0,-4,.88);camera.rotation_euler=(Vector((0,0,.88))-camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.resolution_x=640;scene.render.resolution_y=960
scene.render.filepath=str(WORK/'dagmar-realistic-poster.png');bpy.ops.render.render(write_still=True)
print('REALISTIC_EXPORT_DONE',flush=True)
