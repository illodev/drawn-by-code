#!/bin/sh
# Cuts the generated track (private/audio/music-eleven2.mp3, not committed) by 2 s bars so its
# sections land on the edit: build 0–6, the end of the riser 6–10, the drop on 10, groove to
# 46, the final hit and chord 46–50. Output: private/audio/music-cut.wav
cd "$(dirname "$0")/private/audio" || exit 1
ffmpeg -v error -y -i music-eleven2.mp3 -filter_complex "\
[0:a]atrim=0:6.03,asetpts=PTS-STARTPTS[a];\
[0:a]atrim=18:22.03,asetpts=PTS-STARTPTS[b];\
[0:a]atrim=24:40.03,asetpts=PTS-STARTPTS[c];\
[0:a]atrim=26:46.03,asetpts=PTS-STARTPTS[d];\
[0:a]atrim=46:50,asetpts=PTS-STARTPTS[e];\
[a][b]acrossfade=d=0.03[ab];[ab][c]acrossfade=d=0.03[abc];[abc][d]acrossfade=d=0.03[abcd];[abcd][e]acrossfade=d=0.03[out]" \
-map "[out]" -ar 44100 music-cut.wav && echo private/audio/music-cut.wav
