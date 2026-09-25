#!/bin/sh
# Prepares the score for the v2 film (67 s) from the generated tracks in private/audio/ (not
# committed): the opening title's flourish (0–3.5 s, fading into the score), the score from
# 3.0 s (Galileo's quiet opening raised 4 dB; ducked 8 dB under the payoffs — the spark,
# the worlds' collapse, the cat's pop — so their effects cut through; never ducked in the
# black hole, where a dip read as a fault), and the closing title's cue from 60.6 s to the
# end. Output: private/audio/music-cut.wav
cd "$(dirname "$0")/private/audio" || exit 1
ffmpeg -v error -y -i sting-intro.mp3 -i music-eleven.mp3 -i sting-outro.mp3 -filter_complex "\
[0:a]atrim=0:3.6,asetpts=PTS-STARTPTS,afade=t=out:st=2.9:d=0.7,aresample=44100[a];\
[1:a]atrim=0:58.0,asetpts=PTS-STARTPTS,\
volume='(if(lt(t,12.8),1.6,if(lt(t,13.3),1.6-0.6*(t-12.8)/0.5,1)))*(1-0.6*(between(t,29.0,29.6)+between(t,53.95,54.35)+between(t,54.5,54.9)))':eval=frame,\
afade=t=out:st=56.3:d=1.5,adelay=3000|3000,aresample=44100[b];\
[2:a]atrim=0:6.4,asetpts=PTS-STARTPTS,afade=t=in:d=0.15,afade=t=out:st=5.6:d=0.8,adelay=60600|60600,aresample=44100[c];\
[a][b][c]amix=inputs=3:normalize=0:duration=longest,atrim=0:67" -ar 44100 music-cut.wav && echo private/audio/music-cut.wav
