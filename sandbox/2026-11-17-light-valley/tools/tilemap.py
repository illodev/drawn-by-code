# Print the detail gate's tiles as two 12×12 maps: colour difference and texture ratio
import json, sys
t = json.load(open(sys.argv[1])); n = max(x['gx'] for x in t) + 1
for key, fmt in (('colour', '{:4.0f}'), ('texture', '{:4.1f}')):
    print(key)
    for gy in range(n):
        row = sorted([x for x in t if x['gy'] == gy], key=lambda x: x['gx'])
        print(' '.join(fmt.format(x[key]) for x in row))
