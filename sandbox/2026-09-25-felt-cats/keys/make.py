# Writes the hand keys (keys/cat0.js …): the dance's structure read off the reference's
# contact sheets, coarse on purpose (the fit refines every drawing). Times in seconds.
#   0–1.6   heads bowed, paws together at the chest (the camera zooms in)
#   1.6–2.6 heads come up, arms open
#   2.6–4.1 arms out, paws up, waving
#   4.1–9.3 the shuffle: a sway to one side per beat (123 BPM), paws low, heads down
#   9.3–11.9 a full turn to the cats' right (profile, back, profile, front)
#   11.9–15.84 they come forward (the camera zooms out, then in), the white cat leading
import json, math
BEAT = 60 / 123
X = [-0.414, 0.0, 0.41]
def r(v): return round(v, 3)
ALL = []
for c in range(3):
    ph = [0.0, 0.5, 1.0][c] * 0  # in sync
    K = []
    K.append([0.0, dict(x=X[c], z=0, pitch=0.15, head=[0, 0.55, 0], armL=[0.9, 0.15, 1.6, 0.6], armR=[0.9, 0.15, 1.6, 0.6], mouth=0)])
    K.append([1.4, dict(head=[0, 0.5, 0])])
    K.append([2.0, dict(pitch=0.05, head=[0, 0.1, 0], armL=[0.7, 0.6, 1.3, 0.2], armR=[0.7, 0.6, 1.3, 0.2])])
    K.append([2.6, dict(pitch=0, head=[0, -0.12, 0], armL=[0.5, 1.3, 0.6, 0], armR=[0.5, 1.3, 0.6, 0], mouth=0.5 if c == 1 else 0)])
    t, s = 2.6 + BEAT, 1
    while t < 4.1:
        K.append([r(t), dict(roll=0.05 * s, head=[0, -0.12, 0.08 * s], armL=[0.5, 1.2 + 0.15 * s, 0.6, 0], armR=[0.5, 1.2 - 0.15 * s, 0.6, 0])])
        t += BEAT; s = -s
    t, s = 4.2, 1
    while t < 9.3:
        K.append([r(t), dict(twist=0.3 * s, roll=0.08 * s, head=[0.25 * s, 0.35, 0.1 * s], mouth=0,
                             armL=[0.7, 0.3 + 0.25 * s, 1.3, 0.4], armR=[0.7, 0.3 - 0.25 * s, 1.3, 0.4],
                             legL=[0.3 if s > 0 else 0, 0.08], legR=[0.3 if s < 0 else 0, 0.08])])
        t += BEAT; s = -s
    K.append([9.4, dict(yaw=0, twist=0, roll=0, head=[0, 0.1, 0], armL=[0.9, 0.3, 1.4, 0.3], armR=[0.9, 0.3, 1.4, 0.3], legL=[0, 0.08], legR=[0, 0.08])])
    for tt, y, lift in [(9.8, -1.57, 1), (10.25, -2.4, 0), (10.7, -3.14, 1), (11.0, -3.8, 0), (11.3, -4.71, 1), (11.6, -5.5, 0), (11.9, -6.283, 1)]:
        K.append([tt, dict(yaw=y, legL=[0.3 * lift, 0.08], legR=[0.3 * (1 - lift), 0.08])])
    z0 = 0
    t, s = 12.2, 1
    lead = [0.45, 0.8, 0.45][c]
    while t < 15.84:
        u = (t - 11.9) / (15.84 - 11.9)
        K.append([r(t), dict(z=r(lead * u), roll=0.05 * s, head=[0.1 * s, 0.1, 0.06 * s],
                             armL=[0.9 + 0.3 * s, 0.3, 1.5, 0.5], armR=[0.9 - 0.3 * s, 0.3, 1.5, 0.5],
                             legL=[0.35 if s > 0 else 0, 0.08], legR=[0.35 if s < 0 else 0, 0.08])])
        t += BEAT; s = -s
    ALL.append(K)
# split into the three stretches; each stretch starts with a full pose
import copy
REST = dict(x=0, z=0, bob=0, yaw=0, pitch=0, roll=0, twist=0, bend=0, head=[0, 0, 0], armL=[0.35, 0.15, 1.2, 0.3], armR=[0.35, 0.15, 1.2, 0.3], legL=[0, 0.08], legR=[0, 0.08], tail=[0.6, 0, 0.5], mouth=0)
for seg, (t0, t1) in {'A': (0, 4.1), 'B': (4.1, 9.3), 'C': (9.3, 16)}.items():
    with open(f'keys/seg{seg}.js', 'w') as f:
        f.write(f'// stretch {seg} ({t0}–{min(t1, 15.84)} s): hand keys per cat (first draft by keys/make.py)\nvar DANCE_SEG_{seg} = [\n')
        for c, K in enumerate(ALL):
            cur = copy.deepcopy(REST); rows = []
            for tt, o in K:
                cur = {**cur, **copy.deepcopy(o)}
                if t0 <= tt < t1: rows.append([tt, o if rows else copy.deepcopy(cur)])
            f.write(f'    [ // cat {c}\n')
            for tt, o in rows: f.write(f'        [{tt}, {json.dumps(o)}],\n')
            f.write('    ],\n')
        f.write('];\n')
print('ok')
