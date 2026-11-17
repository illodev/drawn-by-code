"""pier-pressure · a test: Hoagie's bar in Blender. He is built in 3D from simple solids by this
script (flat colours, no light: every material is an emission; an ink outline from Freestyle)
and posed frame by frame from key poses, the way cast/hoagie-model.js does it in 2D: what 3D
adds is that he can turn. Renders PNG frames with a transparent background, to be laid over the
shot's own background (dev/hoagie-stage).

  <python with bpy> blender/hoagie.py <out dir> [first frame] [last frame] [width]

Blender as a Python module: pip install bpy (5.3 here). Rendered with Cycles on the CPU, one
sample (emission needs no more); nothing here needs a graphics card.
"""
import math
import sys

import bpy
from mathutils import Vector

OUT = sys.argv[1]
F0 = int(sys.argv[2]) if len(sys.argv) > 2 else 0
F1 = int(sys.argv[3]) if len(sys.argv) > 3 else 47
WIDTH = int(sys.argv[4]) if len(sys.argv) > 4 else 1920

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = 1
sc.cycles.use_denoising = False
sc.cycles.filter_width = 1.5
sc.render.resolution_x, sc.render.resolution_y = WIDTH, WIDTH * 9 // 16
sc.render.resolution_percentage = 100
sc.render.film_transparent = True
sc.view_settings.view_transform = 'Standard'
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'

# --- paints (the model sheet's, as in cast/hoagie-model.js) ---------------------------------------
lin = lambda c: ((c + 0.055) / 1.055) ** 2.4 if c > 0.04045 else c / 12.92
def paint(name, hexa):
    rgb = [lin(int(hexa[i:i + 2], 16) / 255) for i in (1, 3, 5)]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs[0].default_value = (*rgb, 1)
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(e.outputs[0], o.inputs[0])
    return m

P = {n: paint(n, h) for n, h in dict(skin='#f3bd90', hair='#ecbd66', orange='#e86924', olive='#6f7549', navy='#253250', white='#fffdf6', nose='#de7c84', mouth='#571f25',
                                    grey='#8d8e93', greyd='#55565c', lens='#27304d', strap='#2b2a2c', yolk='#e9b23b', freckle='#b56b3d', ink='#120c0e', red='#d5323a', metal='#c9cbd0').items()}

lines = bpy.data.collections.new('lines')      # what gets an ink outline
plain = bpy.data.collections.new('plain')      # what does not (pupils, petals, freckles, stripes)
sc.collection.children.link(lines)
sc.collection.children.link(plain)

def place(ob, parent, loc, scale=(1, 1, 1), rot=(0, 0, 0), mat=None, outline=True):
    for c in list(ob.users_collection):
        c.objects.unlink(ob)
    (lines if outline else plain).objects.link(ob)
    ob.parent = parent
    ob.location, ob.scale, ob.rotation_euler = loc, scale, rot
    if mat and hasattr(ob.data, 'materials'):
        ob.data.materials.append(P[mat])
    return ob

def empty(name, parent, loc):
    e = bpy.data.objects.new(name, None)
    sc.collection.objects.link(e)
    return place(e, parent, loc)

def ball(parent, loc, scale, mat, outline=True, bend=0.0, keep=None, seg=32):
    """An ellipsoid. bend: its ends lifted (a smile); keep: a test on unit-sphere points, the rest cut away."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=1)
    ob = bpy.context.object
    me = ob.data
    if bend or keep:
        import bmesh
        bm = bmesh.new()
        bm.from_mesh(me)
        if keep:
            bmesh.ops.delete(bm, geom=[v for v in bm.verts if not keep(v.co)], context='VERTS')
        for v in bm.verts:
            v.co.z += bend * v.co.x * v.co.x
        bm.to_mesh(me)
        bm.free()
    for p in me.polygons:
        p.use_smooth = True
    return place(ob, parent, loc, scale, mat=mat, outline=outline)

def tube(parent, loc, r, depth, mat, rot=(0, 0, 0), outline=True, r2=None):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=r, depth=depth)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=r, radius2=r2, depth=depth)
    ob = bpy.context.object
    for p in ob.data.polygons:
        p.use_smooth = len(p.vertices) == 4
    return place(ob, parent, loc, rot=rot, mat=mat, outline=outline)

def box(parent, loc, half, mat, rot=(0, 0, 0), outline=True):
    bpy.ops.mesh.primitive_cube_add(size=2)
    return place(bpy.context.object, parent, loc, half, rot, mat, outline)

def limb(name, parent, r, mat, n=3):
    """A limb or a strap: a tube along points that are set again every frame."""
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = r
    cu.bevel_resolution = 6
    cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(n - 1)
    for bp in sp.bezier_points:
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    ob = bpy.data.objects.new(name, cu)
    sc.collection.objects.link(ob)
    return place(ob, parent, (0, 0, 0), mat=mat)

def along(ob, pts):
    for bp, p in zip(ob.data.splines[0].bezier_points, pts):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = 'AUTO'

# --- Hoagie (metres; he is 1.32 tall; +X is our right, he faces −Y, towards the camera) ----------
root = empty('root', None, (0, 0, 0))
hips = empty('hips', root, (0, 0, 0.52))
chest = empty('chest', hips, (0, 0, 0.10))
neck = empty('neck', chest, (0, 0, 0.245))
feet = []
for side in (-1, 1):
    foot = empty('foot', root, (side * 0.1, 0.03, 0.03))     # turns about the ball of the foot
    foot.rotation_euler = (0, 0, side * 0.3)
    feet.append(foot)
    # (chunky shoes, short socks, hardly any leg: as he is drawn)
    tube(foot, (0, 0.06, 0.27), 0.04, 0.12, 'skin')
    tube(foot, (0, 0.06, 0.19), 0.05, 0.12, 'white')
    tube(foot, (0, 0.06, 0.215), 0.0515, 0.03, 'navy', outline=False)
    ball(foot, (0, -0.03, -0.008), (0.1, 0.2, 0.03), 'white')                   # sole
    ball(foot, (0, 0.0, 0.055), (0.09, 0.17, 0.075), 'navy')                    # upper
    ball(foot, (0, -0.145, 0.04), (0.085, 0.075, 0.06), 'white')                # toe cap
    for i in range(3):
        tube(foot, (0, -0.05 + i * 0.04, 0.124 - i * 0.004), 0.011, 0.1, 'white', rot=(0, math.pi / 2, 0))
# shorts
ball(hips, (0, 0, -0.02), (0.215, 0.155, 0.11), 'olive')
for side in (-1, 1):
    tube(hips, (side * 0.1, 0, -0.14), 0.105, 0.2, 'olive')
    box(hips, (side * 0.2, -0.02, -0.13), (0.02, 0.06, 0.055), 'olive')
# shirt: the body, its two sleeves, its flowers printed on the front
ball(chest, (0, 0, 0.075), (0.218, 0.152, 0.205), 'orange')
tube(chest, (0, 0, -0.09), 0.215, 0.07, 'orange', r2=0.2)
for side in (-1, 1):
    tube(chest, (side * 0.225, 0, 0.15), 0.082, 0.13, 'orange', rot=(0, side * 2.0, 0), r2=0.062)
for fx, fz, r, a0 in [(0.11, 0.2, 0.046, 0.3), (-0.12, 0.02, 0.046, 1.0), (0.03, -0.03, 0.05, 0.5), (0.15, 0.03, 0.046, 0.1), (-0.04, 0.1, 0.036, 0.8), (-0.16, 0.14, 0.042, 0.4), (0.1, -0.1, 0.044, 0.2), (-0.08, -0.1, 0.042, 0.6)]:
    # on the body's surface: y from the ellipsoid
    k = 1 - (fx / 0.218) ** 2 - ((fz - 0.075) / 0.205) ** 2
    fy = -0.152 * math.sqrt(max(0.05, k)) - 0.004
    for i in range(5):
        a = a0 + i * math.tau / 5
        ball(chest, (fx + math.cos(a) * r * 0.62, fy, fz + math.sin(a) * r * 0.62), (r * 0.5, 0.006, r * 0.36), 'white', outline=False, seg=12).rotation_euler = (0, -a, 0)
    ball(chest, (fx, fy - 0.004, fz), (r * 0.25, 0.005, r * 0.25), 'yolk', outline=False, seg=12)
ball(chest, (0, -0.118, 0.215), (0.05, 0.03, 0.05), 'skin', outline=False)       # the open collar
# head
ball(neck, (0, 0, 0.19), (0.275, 0.2, 0.2), 'skin')
for side in (-1, 1):
    ball(neck, (side * 0.29, 0.02, 0.17), (0.055, 0.07, 0.1), 'skin')
ball(neck, (0, 0, 0.19), (0.279, 0.204, 0.204), 'hair', keep=lambda co: co.z > 0.42 - 0.25 * max(0.0, -co.y) * (1 - abs(co.x)))
cow = limb('cowlick', neck, 0.016, 'hair', 4)
eyes, pupils = [], []
for side in (-1, 1):
    eyes.append(ball(neck, (side * 0.082, -0.172, 0.235), (0.092, 0.04, 0.092), 'white'))
    pupils.append(ball(neck, (side * 0.045, -0.213, 0.232), (0.017, 0.008, 0.017), 'ink', outline=False, seg=12))
ball(neck, (0, -0.212, 0.172), (0.045, 0.04, 0.033), 'nose')
for fx, fz in [(-0.2, 0.235), (-0.215, 0.2), (-0.175, 0.205), (0.2, 0.235), (0.215, 0.2), (0.175, 0.205)]:
    ball(neck, (fx, -0.2 * math.sqrt(max(0.05, 1 - (fx / 0.275) ** 2 - ((fz - 0.19) / 0.2) ** 2)) - 0.003, fz), (0.008, 0.004, 0.008), 'freckle', outline=False, seg=8)
mouth = ball(neck, (0, -0.158, 0.083), (0.178, 0.05, 0.075), 'mouth', bend=0.42)
teeth = ball(neck, (0, -0.172, 0.108), (0.152, 0.045, 0.03), 'white', bend=0.5)
braces = [box(neck, (bx, -0.218 + abs(bx) * 0.14, 0.106 + 0.03 * 0.5 * (bx / 0.152) ** 2 * 1.0), (0.011, 0.004, 0.009), 'metal') for bx in (-0.1, -0.06, -0.02, 0.02, 0.06, 0.1)]
# the camcorder (its lens along its −Y), a hand on each side of it
camo = empty('camcorder', root, (0, -0.3, 0.9))
box(camo, (0, 0, 0), (0.055, 0.085, 0.06), 'grey')
box(camo, (0, 0.005, -0.035), (0.057, 0.087, 0.026), 'greyd')
tube(camo, (0, -0.115, 0.004), 0.047, 0.07, 'greyd', rot=(math.pi / 2, 0, 0))
tube(camo, (0, -0.152, 0.004), 0.034, 0.008, 'lens', rot=(math.pi / 2, 0, 0))
box(camo, (0.03, -0.086, 0.045), (0.014, 0.003, 0.006), 'red', outline=False)
grips = [ball(camo, (side * 0.068, 0.0, -0.012), (0.034, 0.052, 0.056), 'skin') for side in (-1, 1)]
# the thumb hand
fist = ball(root, (0.3, -0.1, 0.8), (0.074, 0.066, 0.074), 'skin')
thumb = ball(fist, (-0.15, 0, 1.35), (0.42, 0.46, 0.95), 'skin')
for i in range(3):
    tube(fist, (0.55, -0.72, 0.35 - i * 0.42), 0.09, 0.9, 'skin', rot=(0, math.pi / 2, 0))   # knuckles
armL, armR = limb('armL', root, 0.042, 'skin'), limb('armR', root, 0.042, 'skin')
strap = limb('strap', root, 0.011, 'strap', 5)

# the ink line
sc.render.use_freestyle = True
vl = bpy.context.view_layer
fs = vl.freestyle_settings
ls = fs.linesets.new('ink')
ls.linestyle = bpy.data.linestyles.new('ink')
ls.linestyle.thickness = 5.0 * WIDTH / 1920
ls.linestyle.color = (lin(0x12 / 255), lin(0x0c / 255), lin(0x0e / 255))
ls.select_silhouette = ls.select_border = ls.select_crease = True
ls.select_by_collection = True      # everything but what is in `plain`
ls.collection = plain
ls.collection_negation = 'EXCLUSIVE'
fs.crease_angle = math.radians(120)

camera = bpy.data.objects.new('camera', bpy.data.cameras.new('camera'))
sc.collection.objects.link(camera)
sc.camera = camera
camera.data.lens = 50
camera.data.sensor_fit = 'HORIZONTAL'
camera.data.sensor_width = 36
camera.location = (0.293, -4.07, 0.74)
camera.rotation_euler = (math.pi / 2, 0, 0)

# --- the poses -----------------------------------------------------------------------------------
# yaw: the whole of him about his feet (positive = turned to our left); crouch; toes 0…1; bow: the
# chest tipped towards us; twist: the chest about the spine; head: (yaw, tilt, nod); eye: the eyes'
# height (1 open, 0.08 shut); look: the pupils (x, z); mouth: (width, opening); cow: the cowlick's
# lean; cam: where the camcorder is (in him), camyaw: where its lens points (0 = straight ahead of
# him, 1.57 = to his right, our left); two: both hands on it; fist: where the thumb hand is; roll
REST = dict(yaw=0, crouch=0, toes=0, bow=0, twist=0, head=(0, 0, 0), eye=1, look=(0, 0), mouth=(1, 1), cow=0,
            cam=(-0.2, -0.17, 0.66), camyaw=1.35, two=0, fist=(0.33, -0.1, 0.9), roll=0, stretch=1)
FILM = dict(REST, cam=(-0.082, -0.33, 1.1), camyaw=0, two=1, mouth=(0.75, 0.25), head=(0, 0, 0.03))
ANT = dict(REST, crouch=0.075, bow=0.2, head=(0, 0.06, 0.12), eye=0.42, look=(0.012, -0.004), mouth=(0.8, 0.14), cow=0.4, fist=(0.3, 0.08, 0.5), roll=0.9, cam=(-0.2, -0.2, 0.6))
THRUST = dict(REST, toes=1, bow=-0.13, stretch=1.05, head=(0, -0.05, -0.1), eye=1.12, mouth=(1.05, 1.45), cow=-0.5, fist=(0.36, -0.52, 1.2), roll=-0.1, crouch=-0.01)
KEYS = [
    (0, dict(FILM, yaw=0.95, head=(-0.15, 0, 0.03)), None), (7, dict(FILM, yaw=0.95, head=(-0.15, 0, 0.03), crouch=0.008), 'in'),
    (10, dict(FILM, yaw=0.6, head=(-0.45, 0.03, 0.03), crouch=0.02), 'out'),          # the head leads the turn
    (14, dict(FILM, yaw=-0.06, head=(0.05, -0.02, 0.03), crouch=0.0, bow=0.06), 'in'), (17, dict(FILM, bow=0.1, crouch=0.012), 'in'),   # the lens at us
    (20, dict(FILM, cam=(-0.05, -0.3, 0.86), mouth=(0.26, 0.55), eye=1.12, head=(0, 0, -0.04)), 'in'),   # peeking over it
    (22, ANT, 'in'), (23, dict(ANT, crouch=0.09), None),
    (24, THRUST, 'pop'), (27, dict(THRUST, toes=0.8, stretch=1.03, fist=(0.36, -0.48, 1.18)), 'in'),
    (29, dict(REST, crouch=0.06, cow=0.5, head=(0, 0.04, 0.08), fist=(0.33, -0.12, 0.84)), 'in'),
    (31, dict(REST, crouch=-0.012, cow=-0.3, head=(0, -0.03, -0.05), fist=(0.33, -0.1, 0.93)), 'in'),
    (33, REST, 'in'), (34, dict(REST, eye=0.5), 'pop'), (35, dict(REST, eye=0.08), 'pop'), (36, dict(REST, eye=0.08), 'pop'),
    (37, dict(REST, crouch=0.035, head=(0, 0.03, 0.05), cow=0.2, fist=(0.32, -0.12, 0.82)), 'pop'),
    (39, dict(REST, crouch=-0.012, head=(0.12, -0.05, -0.06), cow=-0.3, fist=(0.34, -0.16, 0.96)), 'in'),
    (42, dict(REST, head=(0.08, -0.02, 0)), 'in'), (43, dict(REST, head=(0.08, -0.02, 0)), None),
    (46, dict(REST, crouch=0.05, eye=0.6, look=(0.014, -0.003), mouth=(0.8, 0.14), head=(0.2, 0.04, 0.06), yaw=-0.25), 'out'),
    (48, dict(REST, crouch=0.06, eye=0.6, look=(0.014, -0.003), mouth=(0.8, 0.14), head=(0.25, 0.04, 0.06), yaw=-0.35), None),
]
mix = lambda a, b, k: tuple(mix(x, y, k) for x, y in zip(a, b)) if isinstance(a, tuple) else a + (b - a) * k
def pose_at(f):
    i = next((n for n, (at, _, _) in enumerate(KEYS) if at > f), None)
    if i is None:
        return KEYS[-1][1]
    if i == 0:
        return KEYS[0][1]
    (f0, a, _), (f1, b, how) = KEYS[i - 1], KEYS[i]
    u = (f - f0) / (f1 - f0)
    k = 0 if how == 'pop' else 1 - (1 - u) ** 2 if how == 'in' else u * u if how == 'out' else u
    return {n: mix(a[n], b[n], k) for n in a}

def strike(p):
    lift = p['toes'] * 0.06
    root.rotation_euler = (0, 0, p['yaw'])
    for side, foot in zip((-1, 1), feet):
        foot.rotation_euler = (p['toes'] * 0.4, 0, side * 0.3)   # the heel comes up
        foot.location = (side * 0.1, 0.03 - p['toes'] * 0.06, 0.03 + p['toes'] * 0.012)
    hips.location = (0, 0, 0.52 - p['crouch'] + lift)
    chest.rotation_euler = (p['bow'], 0, p['twist'])
    chest.scale = (1, 1, p['stretch'])
    hy, ht, hn = p['head']
    neck.rotation_euler = (hn, ht, hy)
    for side, e, pu in zip((-1, 1), eyes, pupils):
        e.scale = (0.092, 0.04, 0.092 * max(0.08, p['eye']))
        pu.location = (side * 0.045 + p['look'][0], -0.213, 0.232 + p['look'][1])
        pu.hide_render = p['eye'] < 0.2
    mw, mo = p['mouth']
    mouth.scale = (0.178 * mw, 0.05, 0.075 * mo)
    mouth.location = (0, -0.158, 0.083 + 0.02 * (1 - min(1, mo)))
    show = mo > 0.45 and mw > 0.6
    teeth.hide_render = not show
    for b in braces:
        b.hide_render = not show
    c = p['cow']
    along(cow, [(0.0, 0, 0.385), (0.0 + c * 0.02, 0, 0.43), (0.02 + c * 0.05, 0, 0.455), (0.05 + c * 0.07, 0, 0.44)])
    camo.location = p['cam']
    camo.rotation_euler = (0, 0, p['camyaw'])
    grips[1].hide_render = p['two'] < 0.5
    fist.location = p['fist']
    fist.rotation_euler = (0, p['roll'], 0)
    fist.hide_render = armR.hide_render = False
    thumb.hide_render = p['roll'] > 0.6
    bpy.context.view_layer.update()
    inv = root.matrix_world.inverted()
    here = lambda ob, co=(0, 0, 0): inv @ (ob.matrix_world @ Vector(co))
    for side, arm in ((-1, armL), (1, armR)):
        s = here(chest, (side * 0.26, 0, 0.13))
        h = here(grips[0 if side < 0 else 1]) if (side < 0 or p['two'] >= 0.5) else Vector(p['fist']) + Vector((-0.02, 0.01, -0.03))
        e = (s + h) / 2 + Vector((side * 0.07, 0.03, -0.08 if h.z > s.z - 0.1 else -0.02))
        along(arm, [s, e, h])
    nl, nr = here(neck, (-0.1, -0.02, 0.03)), here(neck, (0.1, -0.02, 0.03))
    top = here(camo, (0, 0, 0.06))
    along(strap, [nl, (nl + top) / 2 + Vector((-0.05, -0.04, -0.03)), top, (nr + top) / 2 + Vector((0.05, -0.04, -0.03)), nr])

for f in range(F0, F1 + 1):
    strike(pose_at(f))
    sc.render.filepath = f'{OUT}/h_{f:03d}.png'
    bpy.ops.render.render(write_still=True)
    print('frame', f, flush=True)
