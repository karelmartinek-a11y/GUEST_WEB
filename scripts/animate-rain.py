"""Fit CC0 Quaternius body motion to the baked CC BY Rain model.

Blender background input: .cache/dagmar/rain-web-base.blend.
Requires the locally extracted Universal Animation Library Standard GLB.
"""
import bpy
import json
import re
from pathlib import Path
from mathutils import Vector, Quaternion, Matrix

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache/dagmar'
native = json.loads((CACHE / 'rain-native-joints.json').read_text())
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
bpy.ops.import_scene.gltf(filepath=str(CACHE / 'quaternius-standard/Universal Animation Library[Standard]/Unreal-Godot/UAL1_Standard.glb'))
source = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
source.animation_data_clear()
source.data.pose_position = 'REST'

mapping = {'pelvis':'DEF-Pelvis', 'spine_01':'DEF-Spine1',
           'spine_02':'DEF-Spine2', 'spine_03':'DEF-Spine3',
           'neck_01':'DEF-Neck', 'Head':'DEF-Head'}
for side, suffix in [('L','l'), ('R','r')]:
    for target, bone in [('clavicle','DEF-Clavicle'), ('upperarm','FK-Upperarm'),
                         ('lowerarm','FK-Forearm'), ('hand','DEF-Hand'),
                         ('thigh','FK-Thigh'), ('calf','FK-Shin'),
                         ('foot','FK-Foot'), ('ball','DEF-Toe'), ('ball_leaf','DEF-Toe')]:
        mapping[target+'_'+suffix] = bone+'.'+side
    for finger in ['index','middle','ring','pinky','thumb']:
        for i in range(1,5):
            mapping[finger+f'_{i:02d}'+('_leaf' if i==4 else '')+'_'+suffix] = (
                'FK-'+finger.title()+str(min(i,3))+'.'+side)

data = bpy.data.armatures.new('Rain web skeleton')
rig = bpy.data.objects.new('Rain', data)
bpy.context.scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
for bone in source.data.bones:
    target = data.edit_bones.new(bone.name)
    matrix = bone.matrix_local.copy()
    joint = native.get(mapping.get(bone.name, ''))
    if joint:
        matrix.translation = Vector(joint['head'])
        length = max(.008, (Vector(joint['tail'])-Vector(joint['head'])).length)
    else:
        matrix.translation = Vector((0,0,0))
        length = .1
    # Preserve the motion author's bone axes; fit only the neutral joint origins.
    target.length = length
    target.matrix = matrix
    if bone.parent: target.parent = data.edit_bones[bone.parent.name]
    target.use_deform = True
for i in range(1,5):
    joint = native[f'DEF-Hair_Ponytail{i}']
    bone = data.edit_bones.new(f'hair_{i:02d}')
    bone.length = max(.008,(Vector(joint['posedTail'])-Vector(joint['posedHead'])).length)
    bone.matrix = Matrix(joint['posedMatrix'])
    bone.parent = data.edit_bones['Head' if i==1 else f'hair_{i-1:02d}']
bpy.ops.object.mode_set(mode='OBJECT')

def weight_target(name):
    side = 'l' if name.endswith('.L') else 'r' if name.endswith('.R') else None
    plain = name.removesuffix('.L').removesuffix('.R')
    hair = re.search(r'Hair_Ponytail(\d)',plain)
    if hair: return f'hair_{int(hair[1]):02d}'
    if 'Head' in plain: return 'Head'
    for stem, target in [('Upperarm','upperarm'), ('Forearm','lowerarm'),
                         ('Thigh','thigh'), ('Shin','calf'), ('Clavicle','clavicle'),
                         ('Foot','foot'), ('Toe','ball'), ('Hand','hand'), ('Wrist','hand')]:
        if stem in plain and side: return target+'_'+side
    for finger in ['Index','Middle','Ring','Pinky','Thumb']:
        if finger in plain and side:
            number = re.search(finger+r'(\d)',plain)
            i = int(number[1]) if number else 1
            if finger != 'Thumb': i -= 1
            if i <= 0: return 'hand_'+side
            return finger.lower()+f'_{min(i,3):02d}_'+side
    if 'Spine3' in plain: return 'spine_03'
    if 'Spine2' in plain: return 'spine_02'
    if 'Spine1' in plain: return 'spine_01'
    if 'Neck' in plain: return 'neck_01'
    if 'Pelvis' in plain or 'Hips' in plain: return 'pelvis'
    if 'Scarf' in plain: return 'spine_03'
    return None

for mesh in meshes:
    part = mesh['rainPart']
    rigid_head = part in ['head','eyes','eye_dots','eyebrows','eyelashes',
                         'gums_lower','gums_upper','tongue'] or (part.startswith('hair') and part!='hair_ponytail')
    names = {g.index:g.name for g in mesh.vertex_groups}
    weights = []
    for vertex in mesh.data.vertices:
        merged = {}
        if rigid_head:
            merged['Head'] = 1
        else:
            for group in vertex.groups:
                target = weight_target(names[group.group])
                if target: merged[target] = merged.get(target,0)+group.weight
        if not merged:
            merged['Head' if vertex.co.z>1.36 else 'spine_03' if vertex.co.z>1.17 else 'pelvis'] = 1
        ordered = sorted(merged.items(), key=lambda pair:pair[1], reverse=True)[:4]
        total = sum(weight for _,weight in ordered)
        weights.append([(name,weight/total)for name,weight in ordered])
    mesh.vertex_groups.clear()
    groups = {b.name:mesh.vertex_groups.new(name=b.name)for b in data.bones}
    for i, row in enumerate(weights):
        for name, weight in row: groups[name].add([i],weight,'REPLACE')
    modifier = mesh.modifiers.new('Rain skin','ARMATURE')
    modifier.object = rig
    mesh.parent = rig
    print('Skinned',part,len(weights),flush=True)

clips = {'Idle_Loop':'idle','Walk_Formal_Loop':'walk','Idle_Talking_Loop':'talk','Interact':'present'}
rig.animation_data_create()
fps = bpy.context.scene.render.fps = 24
for original, name in clips.items():
    action = bpy.data.actions[original].copy()
    action.name = 'Rain-'+name
    # Rain's shorter legs and torso need proportionate root bob, not source offsets.
    ratio = native['DEF-Pelvis']['head'][2]/source.data.bones['pelvis'].head_local.z
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for curve in bag.fcurves:
                    if curve.data_path.endswith('.location'):
                        for key in curve.keyframe_points:
                            key.co.y *= ratio
                            key.handle_left.y *= ratio
                            key.handle_right.y *= ratio
                if name in clips.values():
                    rotations = {}
                    for curve in bag.fcurves:
                        if curve.data_path.endswith('.rotation_quaternion'):
                            rotations.setdefault(curve.data_path,{})[curve.array_index] = curve
                    for path, curves in rotations.items():
                        if len(curves) != 4: continue
                        bone_name = path.split('"')[1]
                        relaxed = any(f in bone_name for f in ['index_','middle_','ring_','pinky_','thumb_'])
                        if not relaxed and not (name=='idle' and bone_name in ['pelvis','thigh_l','thigh_r']): continue
                        for i in range(len(curves[0].keyframe_points)):
                            q = Quaternion([curves[j].keyframe_points[i].co.y for j in range(4)])
                            if relaxed: q = Quaternion().slerp(q,.28 if name=='idle' else .45)
                            elif bone_name == 'pelvis': q = Quaternion().slerp(q,.45)
                            else:
                                angles = q.to_euler('XYZ');angles.z *= .25;q = angles.to_quaternion()
                            for j in range(4):
                                key = curves[j].keyframe_points[i]
                                shift = q[j]-key.co.y
                                key.co.y = q[j];key.handle_left.y += shift;key.handle_right.y += shift
    rig.animation_data.action = action
    rig.animation_data.action_slot = action.slots[0]
    track = rig.animation_data.nla_tracks.new()
    track.name = name
    start,end = action.frame_range
    strip = track.strips.new(name, int(start), action)
    strip.action_slot = action.slots[0]
    strip.name = name
    track.mute = True
rig.animation_data.action = None
for obj in list(bpy.data.objects):
    if obj != rig and obj not in meshes: bpy.data.objects.remove(obj,do_unlink=True)
for track in rig.animation_data.nla_tracks: track.mute = False
bpy.ops.object.select_all(action='DESELECT')
rig.select_set(True)
for mesh in meshes: mesh.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.wm.save_as_mainfile(filepath=str(CACHE/'rain-web-animated.blend'))
bpy.ops.export_scene.gltf(filepath=str(CACHE/'rain-candidate.glb'), export_format='GLB',
    use_selection=True, export_animations=True, export_animation_mode='NLA_TRACKS',
    export_force_sampling=True, export_frame_range=False, export_frame_step=1,
    export_skins=True, export_morph=True, export_morph_normal=True,
    export_morph_tangent=False, export_extras=True, export_yup=True,
    export_copyright='Rain Rig (CC) Blender Foundation | studio.blender.org. Adapted for web. Body motion: Quaternius, CC0 1.0.')
print('Exported Rain candidate',flush=True)

# A matching, motion-free fallback; this is a render of the licensed web model.
for track in rig.animation_data.nla_tracks: track.mute = track.name != 'idle'
for mesh in meshes:
    if mesh.data.shape_keys:
        for key in mesh.data.shape_keys.key_blocks:
            key.value = .78 if key.name=='smile' else 0
scene = bpy.context.scene
scene.frame_set(19)
scene.render.engine = 'CYCLES';scene.cycles.samples = 24;scene.cycles.use_denoising = True
scene.render.resolution_x = 640;scene.render.resolution_y = 960;scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.world = bpy.data.worlds.new('Rain studio');scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.35,.4,.5,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .5
for name,position,power,size in [('Key',(-2,-3,4),300,4),('Fill',(2,-2,2),160,3),('Rim',(1,2,3),300,3)]:
    light = bpy.data.lights.new(name,'AREA');light.energy = power;light.shape='DISK';light.size=size
    obj=bpy.data.objects.new(name,light);scene.collection.objects.link(obj);obj.location=position
    obj.rotation_euler=(Vector((0,0,1.1))-obj.location).to_track_quat('-Z','Y').to_euler()
camera=bpy.data.objects.new('Rain portrait',bpy.data.cameras.new('Rain portrait'));scene.collection.objects.link(camera)
camera.data.type='ORTHO';camera.data.ortho_scale=1.82;camera.location=(0,-4,.84)
camera.rotation_euler=(Vector((0,0,.84))-camera.location).to_track_quat('-Z','Y').to_euler();scene.camera=camera
scene.render.filepath=str(CACHE/'rain-poster.png');bpy.ops.render.render(write_still=True)
