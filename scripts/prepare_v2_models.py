"""Place the v2 base hardware in the supplied MJCF's articulated frames.

The left view mirrors the right base geometry into the left simulation frames;
it is explicitly a preview, not an export of the left manufacturing variant.
"""
import json
import math
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'src/orcahand_hardware/orca_v2/base'
DESCRIPTION = ROOT / 'src/orcahand_description/v2/models/mjcf'
OUT = ROOT / 'public/models/v2'
OUT.mkdir(parents=True, exist_ok=True)

def vector(node, key, default='0 0 0'):
    return [float(x) for x in node.get(key, default).split()]

def rotation(node):
    w, x, y, z = vector(node, 'quat', '1 0 0 0')
    norm = math.sqrt(w*w+x*x+y*y+z*z)
    w, x, y, z = (v/norm for v in (w,x,y,z))
    return [math.atan2(2*(w*x+y*z), 1-2*(x*x+y*y)), math.asin(max(-1,min(1,2*(w*y-z*x)))), math.atan2(2*(w*z+x*y),1-2*(y*y+z*z))]

def rotate(node, point):
    w,x,y,z=vector(node,'quat','1 0 0 0')
    norm=math.sqrt(w*w+x*x+y*y+z*z)
    w,x,y,z=(v/norm for v in (w,x,y,z))
    a,b,c=point
    return [(1-2*y*y-2*z*z)*a+(2*x*y-2*z*w)*b+(2*x*z+2*y*w)*c,
            (2*x*y+2*z*w)*a+(1-2*x*x-2*z*z)*b+(2*y*z-2*x*w)*c,
            (2*x*z-2*y*w)*a+(2*y*z+2*x*w)*b+(1-2*x*x-2*y*y)*c]

DIGITS={'t':'thumb','i':'index','m':'middle','r':'ring','p':'pinky'}

def hardware(mesh, group):
    # Shared middle-finger parts also form the ring finger in the source model.
    code={'thumb':'T','index':'I','middle':'M','ring':'M','pinky':'P'}.get(group)
    if 'Logo' in mesh: return None
    if 'ForeArmStructure' in mesh: return '04_ForeArm/ForeArmStructure_Dynamixel_TwoFans.stl','tower_main','Forearm frame','structure'
    if 'TopTower' in mesh: return '03_Wrist/WristStructure_Dynamixel.stl','tower_wrist','Wrist support','structure'
    if 'Carpals' in mesh: return '02_Carpals/R-Carpals.stl','palm','Palm frame','structure'
    if 'Skin' in mesh:
        segment = 'dp' if 'DP' in mesh else 'pp'
        file = 'T-DP_Skin.stl' if code=='T' and segment=='dp' else f'{segment.upper()}-Skin_{code}-{segment.upper()}-Skin_Skin.stl'
        return f'09_Skin/{file}',f'{group}_{"ip" if segment=="dp" and code!="T" else segment}_skin',f'{group.title()} {"fingertip" if segment=="dp" else "proximal phalanx"} skin','skin'
    if '-TP-' in mesh: segment,file,label='cmc','T-TP-R','trapezium'
    elif '-AP' in mesh: segment,file,label='mp',('R-T-AP' if code=='T' else 'I-AP-R' if code=='I' else f'{code}-AP'),'abduction segment'
    elif '-PP' in mesh: segment,file,label='pp',f'{code}-PP','proximal phalanx'
    elif '-IP' in mesh: segment,file,label='ip',f'{code}-IP','intermediate phalanx'
    elif '-DP' in mesh: segment,file,label='dp','T-DP','distal phalanx'
    else: raise ValueError(mesh)
    return f'01_Fingers/{file}.stl',f'{group}_{segment}',f'{group.title()} {label}','structure'

for side in ['right','left']:
    links=['world']; joints=[]; parts=[]
    def add_part(file, key, name, layer, link, nearest, xyz, rpy, group):
        source=BASE/file
        assert source.exists(),source
        target=OUT/'hardware'/file
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(source,target)
        short={'thumb':'T','index':'I','middle':'M','ring':'R','pinky':'P'}.get(group)
        segment=key.removeprefix(group+'_').removesuffix('_skin')
        abbreviation=f'{short}-{dict(mp="AP",cmc="TP",pp="PP",ip="IP",dp="DP").get(segment,segment.upper())}' if short else None
        if layer=='skin': abbreviation=f'{short}-{"DP" if segment in ("ip","dp") else "PP"} skin' if short else None
        parts.append(dict(id=key,name=name,description=(f'{name} from the ORCA v2 base hardware. '+('This contact covering follows the underlying finger segment.' if layer=='skin' else 'Select or isolate it to inspect the printable structure and its connection to the hand.')),group=group,layer=layer,link=link,joint=nearest,linkMass=None,mesh='/models/v2/hardware/'+file,sourceMesh='orca_v2/base/'+file,sourceColor='#eeeeee' if layer=='skin' else '#353535',scale=[-.001 if side=='left' else .001,.001,.001],xyz=xyz,rpy=rpy,abbreviation=abbreviation))
    def walk(body,parent,nearest=None,group='base'):
        link=body.get('name'); links.append(link)
        joint=body.find('joint')
        if joint is not None:
            original=joint.get('name').removeprefix(side+'_')
            if original!='wrist':
                digit,kind=original.split('-');group=DIGITS[digit];nearest=f'{side}_{group}_{kind}'
            else: group='palm';nearest=f'{side}_wrist'
            pivot=vector(joint,'pos'); offset=rotate(body,pivot); pos=[a+b for a,b in zip(vector(body,'pos'),offset)]
            anchor=link+'_pivot';links.append(anchor)
            lower,upper=vector(joint,'range')
            joints.append(dict(id=nearest,type='revolute',parent=parent,child=anchor,xyz=pos,rpy=rotation(body),axis=vector(joint,'axis'),lower=lower,upper=upper))
            joints.append(dict(id=link+'_offset',type='fixed',parent=anchor,child=link,xyz=[-v for v in pivot],rpy=[0,0,0],axis=[1,0,0],lower=0,upper=0))
        else:
            joints.append(dict(id=link+'_fixed',type='fixed',parent=parent,child=link,xyz=vector(body,'pos'),rpy=rotation(body),axis=[1,0,0],lower=0,upper=0))
        for geom in body.findall('geom'):
            item=hardware(geom.get('mesh'),group)
            if item:
                file,key,name,layer=item
                add_part(file,key,name,layer,link,nearest,vector(geom,'pos'),rotation(geom),group)
                if key=='palm':
                    add_part('09_Skin/Carpals_R-Carpals_Skin.stl','palm_skin','Palm skin','skin',link,nearest,[0,0,0],[0,0,0],'palm')
                    add_part('02_Carpals/CORE-R.stl','palm_core','Palm core','structure',link,nearest,[0,0,0],[0,0,0],'palm')
        for child in body.findall('body'):walk(child,link,nearest,group)
    for body in ET.parse(DESCRIPTION/f'orcahand_{side}_body.xml').getroot().findall('body'):walk(body,'world')
    order={'palm' :0,'thumb':1,'index':2,'middle':3,'ring':4,'pinky':5,'base':6}
    parts.sort(key=lambda p:order[p['group']])
    # Use the actual displayed surfaces, including skins.
    collisions=[{key:p[key] for key in ['id','link','mesh','scale','xyz','rpy']} for p in parts]
    mjcf=ET.parse(DESCRIPTION/f'orcahand_{side}.mjcf').getroot()
    exclusions=[[e.get('body1'),e.get('body2')] for e in mjcf.findall('contact/exclude')]
    assert all(link in links for pair in exclusions for link in pair)
    data=dict(side=side,version='v2 base',orientation=[0,0,0],links=links,joints=joints,parts=parts,collisions=collisions,collisionExclusions=exclusions)
    (OUT/f'{side}.json').write_text(json.dumps(data,indent=2)+'\n')
    shutil.copyfile(DESCRIPTION/f'orcahand_{side}_body.xml',OUT/f'{side}-reference.xml')
    print(f'v2 {side}: {len(parts)} base hardware pieces; {sum(j["type"]=="revolute" for j in joints)} joints')
shutil.copyfile(ROOT/'src/orcahand_hardware/LICENSE',ROOT/'public/licenses/orcahand-hardware.txt')
