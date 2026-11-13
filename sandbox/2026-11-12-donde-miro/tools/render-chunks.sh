#!/bin/sh
# Renders the film in three chunks side by side, joins them and adds the voice.
#   sh sandbox/2026-11-12-donde-miro/tools/render-chunks.sh [size, default 1280]
set -e
cd "$(dirname "$0")/../../.."
S=sandbox/2026-11-12-donde-miro
SIZE=${1:-1280}
mkdir -p $S/out/chunks
node engine/render.mjs $S/scene.js --size $SIZE --from 0 --to 34 --audio none --out $S/out/chunks/a.mp4 > $S/out/chunks/a.log 2>&1 &
node engine/render.mjs $S/scene.js --size $SIZE --from 34 --to 68 --audio none --out $S/out/chunks/b.mp4 > $S/out/chunks/b.log 2>&1 &
node engine/render.mjs $S/scene.js --size $SIZE --from 68 --to 103 --audio none --out $S/out/chunks/c.mp4 > $S/out/chunks/c.log 2>&1 &
wait
for f in a b c; do echo "$f $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 $S/out/chunks/$f.mp4) frames"; done
# --to is inclusive: a chunk carries the next one's first frame. Cut each to its own
# count before joining, or every join repeats a frame and the picture runs late.
ffmpeg -v error -y -i $S/out/chunks/a.mp4 -c copy -frames:v 816 $S/out/chunks/a2.mp4
ffmpeg -v error -y -i $S/out/chunks/b.mp4 -c copy -frames:v 816 $S/out/chunks/b2.mp4
printf "file 'a2.mp4'\nfile 'b2.mp4'\nfile 'c.mp4'\n" > $S/out/chunks/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $S/out/chunks/list.txt -i $S/mix.wav -c:v copy -c:a aac -b:a 192k -shortest $S/out/donde-miro.mp4
echo "$S/out/donde-miro.mp4"
