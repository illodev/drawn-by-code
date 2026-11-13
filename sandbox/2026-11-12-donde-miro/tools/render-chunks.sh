#!/bin/sh
# Renders the film in three chunks side by side, joins them and adds the sound.
#   sh sandbox/2026-11-12-donde-miro/tools/render-chunks.sh [size, default 1920]
set -e
cd "$(dirname "$0")/../../.."
S=sandbox/2026-11-12-donde-miro
SIZE=${1:-1920}
A=11; B=22; END=32; FPS=24
mkdir -p $S/out/chunks
node engine/render.mjs $S/scene.js --size $SIZE --from 0 --to $A --audio none --out $S/out/chunks/a.mp4 > $S/out/chunks/a.log 2>&1 &
node engine/render.mjs $S/scene.js --size $SIZE --from $A --to $B --audio none --out $S/out/chunks/b.mp4 > $S/out/chunks/b.log 2>&1 &
node engine/render.mjs $S/scene.js --size $SIZE --from $B --to $END --audio none --out $S/out/chunks/c.mp4 > $S/out/chunks/c.log 2>&1 &
wait
# --to is inclusive: a chunk carries the next one's first frame. Cut each to its own
# count before joining, or every join repeats a frame and the picture runs late.
ffmpeg -v error -y -i $S/out/chunks/a.mp4 -c copy -frames:v $((A * FPS)) $S/out/chunks/a2.mp4
ffmpeg -v error -y -i $S/out/chunks/b.mp4 -c copy -frames:v $(((B - A) * FPS)) $S/out/chunks/b2.mp4
printf "file 'a2.mp4'\nfile 'b2.mp4'\nfile 'c.mp4'\n" > $S/out/chunks/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $S/out/chunks/list.txt -i $S/mix.wav -c:v copy -c:a aac -b:a 192k $S/out/donde-miro.mp4
echo "$(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 $S/out/donde-miro.mp4) frames · $S/out/donde-miro.mp4"
