#!/bin/sh
# Renders the plate at the reference's size and puts crops of it beside the reference's:
#   sh tools/crops.sh [name x y ...]  → out/crops/all-cmp.png
set -e
cd "$(dirname "$0")/.."
node ../../engine/render.mjs scene.js --at 1 --size 1280 --out out/stills 2>&1 | grep -E "rror" || true
[ $# -eq 0 ] && set -- mtn 560 120 lake 200 60 city 940 460
list=""
while [ $# -ge 3 ]; do
  ffmpeg -v error -y -i ref/atlas-4.png -vf "crop=320:180:$2:$3,scale=800:450" out/crops/a.png
  ffmpeg -v error -y -i out/stills/t_1.00s.png -vf "crop=320:180:$2:$3,scale=800:450" out/crops/b.png
  ffmpeg -v error -y -i out/crops/a.png -i out/crops/b.png -filter_complex hstack out/crops/$1-cmp.png
  list="$list -i out/crops/$1-cmp.png"; last=out/crops/$1-cmp.png; n=$((${n:-0}+1)); shift 3
done
if [ "$n" -gt 1 ]; then ffmpeg -v error -y $list -filter_complex vstack=inputs=$n out/crops/all-cmp.png; else cp "$last" out/crops/all-cmp.png; fi
