# Native MIT Rocketbox avatar/poses; Blender 4.5, --disable-autoexec. See docs/rocketbox-preparation.md.
import bpy
from pathlib import Path
import sys
W=Path(sys.argv[sys.argv.index('--')+1]).resolve()
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.fbx(filepath=str(W/'rocketbox/Assets/Avatars/Adults/Female_Adult_01/Export/Female_Adult_01_facial.fbx'),use_anim=True,automatic_bone_orientation=False)
texture=W/'rocketbox/Assets/Avatars/Adults/Female_Adult_01/Textures'
for image in bpy.data.images:
 file=texture/Path(image.filepath.replace('\\','/')).name
 if file.exists():image.filepath=str(file);image.reload()
for o in bpy.data.objects:
 if o.type=='MESH':
  for p in o.data.polygons:p.use_smooth=True
  if o.data.shape_keys:
   for k in o.data.shape_keys.key_blocks:k.value=0
   for name,value in {'AK_44_MouthSmileLeft':.8,'AK_45_MouthSmileRight':.8,'AK_07_CheekSquintLeft':.18,'AK_08_CheekSquintRight':.18,'AK_04_BrowOuterUpLeft':.08,'AK_05_BrowOuterUpRight':.08}.items():
    if name in o.data.shape_keys.key_blocks:o.data.shape_keys.key_blocks[name].value=value
for m in bpy.data.materials:
 if m.use_nodes:
  bsdf=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
  if bsdf:bsdf.inputs['Roughness'].default_value=.75;bsdf.inputs['Metallic'].default_value=0
import bpy,json,math
from mathutils import Matrix,Vector
from pathlib import Path
import sys
W=Path(sys.argv[sys.argv.index('--')+1]).resolve()
rig=next(o for o in bpy.data.objects if o.type=='ARMATURE');meshes=[o for o in bpy.data.objects if o.type=='MESH']
for m in meshes:
 if m.data.shape_keys:
  keep={'Basis','AA_VI_01_PP','AA_VI_10_aa','AA_VI_11_E','AA_VI_13_O','AA_VI_14_U','AK_44_MouthSmileLeft','AK_45_MouthSmileRight','AK_07_CheekSquintLeft','AK_08_CheekSquintRight','AK_04_BrowOuterUpLeft','AK_05_BrowOuterUpRight','AK_09_EyeBlinkLeft','AK_10_EyeBlinkRight'}
  for k in list(m.data.shape_keys.key_blocks)[::-1]:
   if k.name not in keep:m.shape_key_remove(k)
for image in bpy.data.images:
 if image.size[0]>1024:image.scale(1024,1024)
 if image.source=='FILE':image.pack()
# A facial rig belongs to this avatar. Body clips must not impose another avatar's facial proportions.
body=[p for p in rig.pose.bones if not any(a.name=='Bip01 Head' for a in p.parent_recursive)]
rig.animation_data_clear()
for p in rig.pose.bones:p.matrix_basis.identity();p.rotation_mode='QUATERNION'
scene=bpy.context.scene;scene.render.fps=30
clips={'idle':'f_idle_breathe_01','listen':'f_gestic_listen_relaxed_01','talk':'f_gestic_talk_relaxed_01','present':'f_invite_sit','walk':'f_walk_slow_01'}
metadata=[]
for label,filename in clips.items():
 before=set(bpy.data.objects)
 bpy.ops.import_scene.fbx(filepath=str(W/'rocketbox/Assets/Animations'/('all_animations_max_motextr_xy' if label=='walk' else 'all_animations_max_motextr_static')/f'{filename}.max.fbx'),use_anim=True,automatic_bone_orientation=False)
 imported=set(bpy.data.objects)-before;source=next(o for o in imported if o.type=='ARMATURE')
 start,end=map(int,source.animation_data.action.frame_range)
 if label=='talk':start,end=31,300
 if label=='listen':start,end=31,420
 scene.frame_set(start);bpy.context.view_layer.update()
 origin=(source.matrix_world@source.pose.bones['Bip01 Pelvis'].matrix).translation.copy()
 scene.frame_set(end);bpy.context.view_layer.update()
 finish=(source.matrix_world@source.pose.bones['Bip01 Pelvis'].matrix).translation.copy()
 speed=Vector((finish.x-origin.x,finish.y-origin.y,0)).length/((end-start)/30)
 poses=[]
 for frame in range(start,end+1):
  scene.frame_set(frame);bpy.context.view_layer.update();transform=rig.matrix_world.inverted()@source.matrix_world
  if label=='walk':
   current=(source.matrix_world@source.pose.bones['Bip01 Pelvis'].matrix).translation
   shift=Vector((origin.x-current.x,origin.y-current.y,0))
   transform=rig.matrix_world.inverted()@Matrix.Translation(shift)@source.matrix_world
  desired={p.name:transform@source.pose.bones[p.name].matrix for p in body}
  basis={}
  for p in body:
   if p.parent and p.parent.name in desired:b=p.bone.convert_local_to_pose(desired[p.name],p.bone.matrix_local,parent_matrix=desired[p.parent.name],parent_matrix_local=p.parent.bone.matrix_local,invert=True)
   else:b=p.bone.matrix_local.inverted()@desired[p.name]
   basis[p.name]=b
  poses.append(basis)
 for o in imported:bpy.data.objects.remove(o,do_unlink=True)
 rig.animation_data_create();action=bpy.data.actions.new(label);rig.animation_data.action=action
 for frame,basis in enumerate(poses,1):
  for name,matrix in basis.items():
   p=rig.pose.bones[name];p.matrix_basis=matrix
   p.keyframe_insert(data_path='location',frame=frame);p.keyframe_insert(data_path='rotation_quaternion',frame=frame);p.keyframe_insert(data_path='scale',frame=frame)
 track=rig.animation_data.nla_tracks.new();track.name=label;strip=track.strips.new(label,1,action);track.mute=True
 rig.animation_data.action=None
 metadata.append({'name':label,'duration':(end-start)/30,'source':filename+'.max.fbx','frames':end-start+1,'bodyBones':len(body),'sourceSpeedMetresPerSecond':speed if label=='walk' else None})
 print('BAKED',label,flush=True)
bpy.ops.object.select_all(action='DESELECT')
for o in [rig]+meshes:o.select_set(True)
bpy.context.view_layer.objects.active=rig
# Enable NLA tracks solely for exporting each strip as its own clip.
for track in rig.animation_data.nla_tracks:track.mute=False
scene.frame_set(1)
bpy.ops.export_scene.gltf(filepath=str(W/'release/dagmar-rocketbox.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_frame_range=False,export_force_sampling=True,export_morph=True,export_morph_normal=False,export_morph_tangent=False,export_image_format='AUTO',export_materials='EXPORT',export_skins=True,export_yup=True)
(W/'release/clips.json').write_text(json.dumps(metadata,indent=2)+'\n')
print('ROCKETBOX_EXPORT_DONE',flush=True)
