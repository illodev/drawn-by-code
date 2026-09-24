#!/bin/sh
# Cuts the generated track (private/audio/music-eleven2.mp3, not committed) by 2 s bars so its
# sections land on the edit: build 0–6, the end of the riser 6–10, the drop on 10, groove to
# 46, the final hit and chord 46–50. The track stops dead at 48.5, so its last half second
# is thrown through a delay in time (echoes every eighth note, 250 ms) that rings out in its
# own key and fades by 50. Output: private/audio/music-cut.wav
cd "$(dirname "$0")/private/audio" || exit 1
ffmpeg -v error -y -i music-eleven2.mp3 -filter_complex "\
[0:a]atrim=0:6.03,asetpts=PTS-STARTPTS[a];\
[0:a]atrim=18:22.03,asetpts=PTS-STARTPTS[b];\
[0:a]atrim=24:40.03,asetpts=PTS-STARTPTS[c];\
[0:a]atrim=26:46.03,asetpts=PTS-STARTPTS[d];\
[0:a]atrim=46:50,asetpts=PTS-STARTPTS[e];\
[a][b]acrossfade=d=0.03[ab];[ab][c]acrossfade=d=0.03[abc];[abc][d]acrossfade=d=0.03[abcd];[abcd][e]acrossfade=d=0.03,asplit[m][t];\
[m]atrim=0:48.03,asetpts=PTS-STARTPTS[body];\
[t]atrim=48:48.5,asetpts=PTS-STARTPTS,apad=pad_dur=1.6,aecho=1:0.9:250|500|750|1000|1250:0.55|0.4|0.28|0.18|0.1,afade=t=out:st=0.6:d=1.4[tail];\
[body][tail]acrossfade=d=0.03[out]" \
-map "[out]" -ar 44100 music-cut.wav && echo private/audio/music-cut.wav
