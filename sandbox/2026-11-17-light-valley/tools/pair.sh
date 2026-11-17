#!/bin/sh
# Reference | ours, the same box at zoom: sh pair.sh x y w h zoom out.png [still]
E=sandbox/2026-11-17-light-valley; S=${7:-$E/out/stills/t_5.50s.png}
ffmpeg -loglevel error -y -i $E/ref/street-lit.png -i $S -filter_complex "[0:v]scale=1280:720,crop=$3:$4:$1:$2,scale=iw*$5:ih*$5:flags=neighbor[a];[1:v]scale=1280:720,crop=$3:$4:$1:$2,scale=iw*$5:ih*$5:flags=neighbor[b];[a][b]hstack" $6
