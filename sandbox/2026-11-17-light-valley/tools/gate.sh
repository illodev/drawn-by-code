#!/bin/sh
# Render the last state, run the detail gate against the reference, print the tile maps.
# usage: sh sandbox/2026-11-17-light-valley/tools/gate.sh [t=5.5] [python]
E=sandbox/2026-11-17-light-valley; T=${1:-5.5}; PY=${2:-python3}
node engine/detail.mjs $E/scene.js $E/out/street-lit.mp4 --times $T --grid 12 2>&1 | grep -E "colour|tiles|FAIL|PASS" | head -6
node engine/render.mjs $E/scene.js --at $T --size 1280 >/dev/null 2>&1
$PY -I $E/tools/tilemap.py $E/review/detail/tiles.json
$PY -I $E/tools/lumdiff.py $E/ref/street-lit.png $E/out/stills/t_${T}0s.png | head -13
