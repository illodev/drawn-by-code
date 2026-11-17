# Writes data/lut.json into the atlas kit as its default palette (between the LUT markers).
#   python3 tools/embed-lut.py data/lut.json ../../styles/atlas/atlas.js
import sys, json, re
d = json.load(open(sys.argv[1])); p = sys.argv[2]; s = open(p).read()
# calibration against our own render (tools/score.py): the lines and the relief's detail darken
# the ground the table was read from, so the table is lifted by the measured ratio
gain = [float(v) for v in sys.argv[3].split(',')] if len(sys.argv) > 3 else [1, 1, 1]
d['rgb'] = [[[min(255, c[k] * gain[k]) for k in range(3)] for c in row] for row in d['rgb']]
rows = ',\n'.join('            ' + ','.join('%d,%d,%d' % tuple(round(v) for v in c) for c in row) for row in d['rgb'])
block = '        rgb: [ // LUT begin\n' + rows + '\n        ], // LUT end'
s = re.sub(r"        rgb: \[.*?\],( // LUT end)?", lambda m: block, s, count=1, flags=re.S)
s = re.sub(r"line: \[[\d., ]+\],(\s+// a contour line)", lambda m: 'line: [%s],%s' % (', '.join('%.3f' % v for v in [d['line'][0] * 1.03, d['line'][1] * 0.99, d['line'][2] * 0.95]), m.group(1)), s, count=1)
open(p, 'w').write(s)
print('embedded', d['nh'], 'x', d['ns'])
