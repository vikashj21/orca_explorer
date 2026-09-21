"""Package every v1 extended visual mesh and the original URDF kinematic tree."""
import json
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'src/orcahand_description'
OUT = ROOT / 'public/models'

def vec(element, key, default='0 0 0'):
    return [float(n) for n in (element.get(key, default) if element is not None else default).split()]

def origin(element):
    return {'xyz': vec(element, 'xyz'), 'rpy': vec(element, 'rpy')}

def describe(key):
    if key.startswith('tower_'):
        names = {'main': ('Forearm frame', 'The main support structure beneath the wrist. It holds the hand assembly and provides the mechanical foundation for the base components.'), 'hull': ('Forearm housing', 'The outer enclosure around the base. Hide this piece to inspect the supporting frame and the components packaged inside it.'), 'text': ('Orca wordmark', 'The separate lettering mesh on the forearm housing. This is a visual identity component and shares the fixed tower link.'), 'fans': ('Cooling fans', 'The fan assembly packaged in the forearm. Fans circulate air to help remove heat from the enclosed hardware. Individual fan blades and motors are not separately modeled.'), 'u2d2': ('U2D2 interface board', 'The communication interface included in the extended model. This mesh represents the board assembly; its individual electronic components are not independently selectable.'), 'camera': ('Camera assembly', 'The camera and mounting assembly included in the extended model. Its placement is fixed relative to the forearm, so it stays with the base as the wrist moves.')}
        return (*names[key.removeprefix('tower_')], 'base', 'electronics' if key in ['tower_u2d2','tower_camera','tower_fans'] else 'structure')
    skin = key.endswith('_skin')
    clean = key.removesuffix('_skin')
    if clean == 'palm':
        return ('Palm skin' if skin else 'Palm frame', 'The outer contact surface over the palm. Removing it reveals the structural palm mesh beneath.' if skin else 'The central structural body of the hand. It connects the wrist to all five finger chains and carries their joint attachment points.', 'palm', 'skin' if skin else 'structure')
    finger, segment = clean.split('_')
    labels = {'mp':'metacarpal', 'pp':'proximal phalanx', 'ip':'intermediate phalanx', 'dp':'distal phalanx'}
    functions = {'mp':'The base segment connecting this digit to the palm. It supports the joint chain that positions the finger.', 'pp':'The first long segment of the digit. It transfers motion from the base toward the outer finger segments.', 'ip':'The next segment toward the fingertip. Its joint allows the outer finger to bend relative to the proximal segment.', 'dp':'The final modeled structural segment of the thumb. It carries the thumb tip and follows the distal joint.'}
    desc = f'The contact covering over the {finger} {labels[segment]}. It is attached to the same rigid link as the underlying segment and moves with it.' if skin else functions[segment]
    return (f'{finger.title()} {labels[segment]}' + (' skin' if skin else ''), desc, finger, 'skin' if skin else 'structure')

for side in ['right', 'left']:
    source_file = SOURCE / f'v1/models/urdf/orcahand_{side}_extended.urdf'
    robot = ET.parse(source_file).getroot()
    mjcf = ET.parse(SOURCE / f'v1/models/mjcf/orcahand_{side}_extended.mjcf').getroot()
    materials = {m.get('name'): vec(m, 'rgba')[:3] for m in mjcf.findall('asset/material')}
    defaults = {d.get('class'): d.find('geom').get('material') for d in mjcf.findall('.//default') if d.find('geom') is not None and d.find('geom').get('material')}
    source_colors = {}
    for geom in mjcf.findall('.//worldbody//geom'):
        if not geom.get('mesh', '').startswith(f'{side}_visual_'):
            continue
        material = geom.get('material') or defaults[geom.get('class')]
        source_colors[geom.get('mesh')] = '#' + ''.join(f'{round(c * 255):02x}' for c in materials[material])

    joints = []
    for j in robot.findall('joint'):
        limit = j.find('limit')
        joints.append({'id':j.get('name'), 'type':j.get('type'), 'parent':j.find('parent').get('link'), 'child':j.find('child').get('link'), **origin(j.find('origin')), 'axis':vec(j.find('axis'),'xyz','1 0 0'), 'lower':float(limit.get('lower')) if limit is not None else 0, 'upper':float(limit.get('upper')) if limit is not None else 0})
    by_child = {j['child']:j for j in joints}
    parts = []
    for link in robot.findall('link'):
        for visual in link.findall('visual'):
            mesh = visual.find('geometry/mesh')
            mesh_file = SOURCE / mesh.get('filename').split('package://orcahand_description/')[1]
            assert mesh_file.exists(), mesh_file
            name = visual.get('name')
            key = name.removeprefix(f'{side}_visual_').removesuffix('_mesh')
            title, description, group, layer = describe(key)
            target = OUT / side / mesh_file.name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(mesh_file, target)
            # Fixed offset bodies are URDF frames, not additional physical pieces.
            cursor = link.get('name')
            joint = None
            while cursor in by_child:
                candidate = by_child[cursor]
                if candidate['type'] == 'revolute':
                    joint = candidate['id']
                    break
                cursor = candidate['parent']
            mass = link.find('inertial/mass')
            parts.append({'id':key, 'name':title, 'description':description, 'group':group, 'layer':layer, 'link':link.get('name'), 'joint':joint, 'linkMass':float(mass.get('value')) if mass is not None else None, 'mesh':f'/models/{side}/{mesh_file.name}', 'sourceMesh':name, 'sourceColor':source_colors[name], 'scale':vec(mesh,'scale','1 1 1'), **origin(visual.find('origin'))})
    collisions = []
    for link in robot.findall('link'):
        for collision in link.findall('collision'):
            mesh = collision.find('geometry/mesh')
            if mesh is None:
                continue
            mesh_file = SOURCE / mesh.get('filename').split('package://orcahand_description/')[1]
            assert mesh_file.exists(), mesh_file
            target = OUT / side / 'collision' / mesh_file.name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(mesh_file, target)
            name = collision.get('name')
            key = name.removeprefix(f'{side}_collision_').removesuffix('_mesh')
            collisions.append({'id':key, 'link':link.get('name'), 'mesh':f'/models/{side}/collision/{mesh_file.name}', 'scale':vec(mesh,'scale','1 1 1'), **origin(collision.find('origin'))})
    exclusions = [[e.get('body1'), e.get('body2')] for e in mjcf.findall('contact/exclude')]
    data = {'collisions':collisions, 'collisionExclusions':exclusions, 'side':side, 'version':'v1 extended', 'links':[l.get('name') for l in robot.findall('link')], 'joints':joints, 'parts':parts}
    (OUT / f'{side}.json').write_text(json.dumps(data,indent=2)+'\n')
    shutil.copyfile(source_file, OUT / f'{side}.urdf')
    print(f'{side}: {len(parts)} visual pieces, {sum(j["type"] == "revolute" for j in joints)} movable joints')
shutil.copyfile(SOURCE/'LICENSE', ROOT/'public/licenses/orcahand.txt')
shutil.copyfile(ROOT/'src/human-atlas/LICENSE', ROOT/'public/licenses/human-atlas.txt')
