#!/bin/sh
# Prepares the score for the v2 film from the generated track (private/audio/music-eleven.mp3,
# not committed): 58 s long; ducked while the camera falls into the black hole and the
# frame is black (Einstein 5.2–7.0, film 43.8–45.6), so the dive and the cube's edges are
# heard; a 1.5 s fade to the end. Output: private/audio/music-cut.wav
cd "$(dirname "$0")/private/audio" || exit 1
ffmpeg -v error -y -i music-eleven.mp3 -af "atrim=0:58.0,asetpts=PTS-STARTPTS,\
volume='if(between(t,43.6,45.9), 0.18+0.82*max(0,1-min(t-43.6,45.9-t)/0.35), 1)':eval=frame,\
afade=t=out:st=56.3:d=1.5" -ar 44100 music-cut.wav && echo private/audio/music-cut.wav
