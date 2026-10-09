"""Bake the CC BY Rain studio character for the static web guide.

Run with Blender 4.5 in background, with auto-execution disabled, after opening
Rain v3.3's rain_v3.2.blend. Native rig constraints and corrective shapes are
evaluated offline. No embedded Python from the downloaded file is executed.
The source archive and generated intermediate .blend files stay outside Git.
"""
import bpy
import json
import re
from pathlib import Path
from mathutils import Vector, Matrix

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache/dagmar'
rig = bpy.data.objects['RIG-rain']
if bpy.context.object and bpy.context.object.mode != 'OBJECT':
    bpy.ops.object.mode_set(mode='OBJECT')
rig.pose.bones['Properties_Character_Rain']['Quality'] = 2
for index, angle in [(2,-.85),(3,-.35),(4,-.15)]:
    bone = rig.pose.bones[f'FK-Hair_Ponytail{index}']
    bone.rotation_mode = 'XYZ';bone.rotation_euler.x = angle
for obj in bpy.data.objects:
    if obj.type == 'MESH' and obj.name.startswith('GEO-rain-'):
        for mod in obj.modifiers:
            if mod.type == 'SUBSURF':
                mod.driver_remove('levels')
                mod.driver_remove('render_levels')
                # Teeth and shoe details are already modelled in the base mesh.
                mod.levels = mod.render_levels = (0 if any(part in obj.name for part in ['gums_', 'shoes']) else 1)
bpy.context.view_layer.update()
originals = [o for o in bpy.data.objects if o.type == 'MESH'
             and o.name.startswith('GEO-rain-') and not o.hide_render
             and o.name != 'GEO-rain-eye_cornea']
deps = bpy.context.evaluated_depsgraph_get()
web = bpy.data.collections.new('Rain web export')
bpy.context.scene.collection.children.link(web)

def snapshot(obj):
    bpy.context.view_layer.update()
    mesh = bpy.data.meshes.new_from_object(obj.evaluated_get(deps),
                                         preserve_all_data_layers=True, depsgraph=deps)
    if obj.name == 'GEO-rain-eyebrows':
        # Lift the inner ends of Rain's strong neutral brow into a gentler arch.
        for vertex in mesh.vertices:
            t = min(1,max(0,(abs(vertex.co.x)-.018)/.068))
            vertex.co.z += .012*(1-t)-.004*t
    return mesh

def reset_face():
    for name in ['MSTR-Jaw', 'MSTR-Mouth', 'MSTR-LowerLip', 'MSTR-UpperLip']:
        rig.pose.bones[name].matrix_basis = Matrix.Identity(4)
    for side in ['L', 'R']:
        for prefix in ['ACT-Lips_Corner.', 'MSTR-Eyering_Upper.',
                       'MSTR-Eyering_Lower.', 'MSTR-Eyebrow.',
                       'ACT-Eyelid_Upper.', 'ACT-Eyelid_Lower.']:
            rig.pose.bones[prefix + side].matrix_basis = Matrix.Identity(4)

def expression(name):
    reset_face()
    jaw = rig.pose.bones['MSTR-Jaw']
    jaw.rotation_mode = 'XYZ'
    if name == 'open':
        jaw.rotation_euler.x = .30
    elif name == 'round':
        jaw.rotation_euler.x = .16
        rig.pose.bones['MSTR-Mouth'].scale.x = .72
        rig.pose.bones['MSTR-Mouth'].scale.y = 1.14
        rig.pose.bones['MSTR-Mouth'].location.z = .003
    elif name == 'wide':
        jaw.rotation_euler.x = .10
        rig.pose.bones['MSTR-Mouth'].scale.x = 1.18
    elif name == 'press':
        rig.pose.bones['MSTR-LowerLip'].location.y = .0025
        rig.pose.bones['MSTR-UpperLip'].location.y = -.0025
    elif name == 'blink':
        for side in ['L', 'R']:
            rig.pose.bones['ACT-Eyelid_Upper.' + side].location.y = -.025
            rig.pose.bones['ACT-Eyelid_Lower.' + side].location.y = .008
    elif name == 'smile':
        for side in ['L', 'R']:
            rig.pose.bones['ACT-Lips_Corner.' + side].location.y = .023
            rig.pose.bones['ACT-Lips_Corner.' + side].location.z = .008
    elif name == 'brow':
        for side in ['L', 'R']:
            rig.pose.bones['MSTR-Eyebrow.' + side].location.y = .006
    bpy.context.view_layer.update()

facial = {'head', 'eyes', 'eye_dots', 'eyebrows', 'eyelashes',
          'gums_lower', 'gums_upper', 'tongue'}
objects = []
for original in originals:
    reset_face()
    mesh = snapshot(original)
    obj = bpy.data.objects.new(original.name.replace('GEO-rain-', 'Rain-'), mesh)
    web.objects.link(obj)
    obj.matrix_world = original.matrix_world.copy()
    for group in original.vertex_groups:
        obj.vertex_groups.new(name=group.name)
    part = original.name.removeprefix('GEO-rain-')
    if part in facial:
        obj.shape_key_add(name='Basis')
        for name in ['open', 'round', 'wide', 'press', 'blink', 'smile', 'brow']:
            expression(name)
            posed = snapshot(original)
            assert len(mesh.vertices) == len(posed.vertices), (part, name, 'changed topology')
            movement = max((a.co-b.co).length for a,b in zip(mesh.vertices, posed.vertices))
            if movement > .000001:
                key = obj.shape_key_add(name=name)
                for vert, target in zip(posed.vertices, key.data):
                    target.co = vert.co
            bpy.data.meshes.remove(posed)
        reset_face()
    objects.append((original, obj, part))
    print('Evaluated', part, len(mesh.vertices), 'vertices', flush=True)

# Bake the original material's colour graph, including vertex paint, into local
# textures. Emission baking excludes scene lighting; the browser lights the model.
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 1
scene.cycles.device = 'CPU'
scene.render.bake.use_clear = True
scene.render.bake.margin = 12
for original, obj, part in objects:
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    uv = obj.data.uv_layers.new(name='WebUV')
    source_uv = obj.data.uv_layers[0]
    for source, target in zip(source_uv.data, uv.data):
        target.uv = source.uv
        if part == 'head': target.uv.x -= 2
        if part == 'body': target.uv.x /= 2
    obj.data.uv_layers.active = source_uv
    source_uv.active_render = True
    size = 1024 if part in ['head', 'body', 'hair_main', 'jeans', 'eyes'] else 512
    image = bpy.data.images.new('Rain-web-' + part, width=size, height=size, alpha=False)
    baking = []
    for index, source_mat in enumerate(list(obj.data.materials)):
        mat = source_mat.copy()
        obj.data.materials[index] = mat
        tree = mat.node_tree
        # Pin every original implicit texture coordinate to its original UV map.
        coord = tree.nodes.new('ShaderNodeUVMap')
        coord.uv_map = source_uv.name
        for node in list(tree.nodes):
            if node.type == 'TEX_IMAGE' and not node.inputs['Vector'].is_linked:
                tree.links.new(coord.outputs['UV'], node.inputs['Vector'])
            if node.type == 'TEX_COORD':
                for link in list(node.outputs['UV'].links):
                    tree.links.new(coord.outputs['UV'], link.to_socket)
        output = next(n for n in tree.nodes if n.type == 'OUTPUT_MATERIAL' and n.is_active_output)
        principled = next((n for n in tree.nodes if n.type == 'BSDF_PRINCIPLED'
                          and any(l.to_node == output for socket in n.outputs for l in socket.links)), None)
        if principled is None:
            principled = next((n for n in tree.nodes if n.type in ['BSDF_PRINCIPLED','EMISSION','BSDF_DIFFUSE']),None)
        base = (principled.inputs.get('Base Color') or principled.inputs.get('Color')) if principled else None
        emit = tree.nodes.new('ShaderNodeEmission')
        if base and base.is_linked:
            tree.links.new(base.links[0].from_socket, emit.inputs['Color'])
        elif base:
            emit.inputs['Color'].default_value = base.default_value
        else:
            emit.inputs['Color'].default_value = source_mat.diffuse_color
        tree.links.new(emit.outputs[0], output.inputs['Surface'])
        target = tree.nodes.new('ShaderNodeTexImage')
        target.image = image
        tree.nodes.active = target
        baking.append(mat)
    bpy.ops.object.bake(type='EMIT', uv_layer='WebUV')
    image.filepath_raw = str(CACHE / ('rain-' + part + '.png'))
    image.file_format = 'PNG'
    image.save()
    image.pack()
    mat = bpy.data.materials.new('Rain ' + part)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    texture = mat.node_tree.nodes.new('ShaderNodeTexImage')
    texture.image = image
    mat.node_tree.links.new(texture.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = .64
    if part in ['eyes', 'eye_dots']:
        bsdf.inputs['Roughness'].default_value = .16
        bsdf.inputs['Coat Weight'].default_value = .5
    if part.startswith('hair'):
        bsdf.inputs['Roughness'].default_value = .53
    if part in ['head', 'body']:
        bsdf.inputs['Roughness'].default_value = .62
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons:
        polygon.material_index = 0
        polygon.use_smooth = True
    for name in [layer.name for layer in obj.data.uv_layers]:
        if name != 'WebUV' and obj.data.uv_layers.get(name):
            obj.data.uv_layers.remove(obj.data.uv_layers[name])
    obj.data.uv_layers.active = obj.data.uv_layers['WebUV']
    obj.data.uv_layers['WebUV'].active_render = True
    # Colour has already been baked; avoid multiplying the paint a second time.
    for name in [attr.name for attr in obj.data.color_attributes]:
        if obj.data.color_attributes.get(name):
            obj.data.color_attributes.remove(obj.data.color_attributes[name])
    print('Baked colour', part, flush=True)

# Preserve native joint positions and original skin weights for the motion pass.
native = {b.name: {'head': list(b.head_local), 'tail': list(b.tail_local),
                   'posedMatrix': [list(row)for row in rig.pose.bones[b.name].matrix],
                   'posedHead': list(rig.pose.bones[b.name].head),
                   'posedTail': list(rig.pose.bones[b.name].tail),
                   'parent': b.parent.name if b.parent else None} for b in rig.data.bones}
(CACHE / 'rain-native-joints.json').write_text(json.dumps(native))
for original, obj, part in objects:
    obj['rainPart'] = part
for obj in list(bpy.data.objects):
    if obj.name not in {o.name for _,o,_ in objects}: bpy.data.objects.remove(obj, do_unlink=True)
bpy.ops.wm.save_as_mainfile(filepath=str(CACHE / 'rain-web-base.blend'))
print('Saved baked Rain web base', flush=True)
