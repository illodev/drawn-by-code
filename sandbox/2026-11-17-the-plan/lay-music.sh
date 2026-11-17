#!/bin/sh
# Lays the generated score (private/score.mp3, not committed) under the film, by measurement
# (tools/measure-score.py):
# - it plays at 119.74 BPM: 0.22 % faster puts its beats on the film's half-second grid
#   all the way (they were 0.10 s late by the end);
# - it starts half a second in: its sections were asked for in whole bars (8, 12, 20, 32, 36,
#   44, 48, 52 s) and the film's stretches begin at 8.5, 20.5 and 36.5 s, so three of its
#   changes fall on cuts, and its last stab (52.0 s of the take) on the cut to the title block
#   at 52.5 s; every beat stays on the grid;
# - its last chord dies by 53.7 s: the stab and its tail are thrown through a delay in time
#   (an echo on every beat, each quieter) that carries on under the lettering to 55.6 s;
# - one static gain to about -16 LUFS and a limiter that only catches peaks.
# (ffmpeg 6.1: `adelay` followed by `apad`/`atrim` lost its delay here; the half second is
# joined on as silence instead.)
# Output: private/mix.wav (56 s), which scene.js points at.
cd "$(dirname "$0")/private" || exit 1
ffmpeg -v error -y -i score.mp3 -filter_complex "\
[0:a]aresample=44100,aformat=channel_layouts=stereo,atempo=1.0022,asplit[m][t];\
[m]atrim=0:51.97,asetpts=PTS-STARTPTS[body];\
[t]atrim=51.94:53.15,asetpts=PTS-STARTPTS,apad=pad_dur=2.2,aecho=1:0.9:500|1000|1500|2000:0.5|0.32|0.2|0.12,afade=t=out:st=1.9:d=1.5[tail];\
[body][tail]acrossfade=d=0.03,volume=${GAIN:--1}dB,aresample=176400,alimiter=limit=0.84:level=false:attack=2:release=40,aresample=44100[main];\
anullsrc=r=44100:cl=stereo,atrim=0:0.5[head];[head][main]concat=n=2:v=0:a=1,apad=whole_dur=56,atrim=0:56[out]" \
-map "[out]" -ac 2 mix.wav && echo private/mix.wav
