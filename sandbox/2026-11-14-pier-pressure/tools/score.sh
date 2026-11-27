#!/bin/sh
# fidelity of every sheet's drawing in code: sh tools/score.sh <dir of renders of dev/fidelity at i+0.5 s, 3840 wide>
i=0
for n in $(sed -n "s/^const NAMES = \[\(.*\)\];/\1/p" dev/fidelity/scene.js | tr -d "' " | tr ',' ' '); do
  f=$(printf "%s/t_%d.50s.png" "$1" "$i")
  python3 -I tools/fidelity.py ref/$n.png "$f" /dev/null.png --worst 0 2>/dev/null | head -1
  i=$((i+1))
done
