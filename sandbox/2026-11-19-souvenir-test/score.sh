#!/bin/sh
# Round 8: the score, cut to the film from one ElevenLabs take (private/r8/take<N>.mp3, the
# user's; not committed). Usage: sh score.sh <take> <offset> [guitar]  →  private/bso.wav
#   take 1, offset 2.27: its two swells crest at 10.00 and 15.00 s, so they land on the
#     guitar's mouth (7.72 s) and on the last world going by at full speed (12.75 s)
#   take 4, offset 1.65: its one hit (14.40 s) lands on the last world (12.75 s)
#   take 5, offset 0 (the one asked for with the guitar as the thread): its strongest hit
#     (6.70 s) falls as the guitar is in focus (6.6 s), and it stops playing at 12.75 s, as
#     the last world goes by: its last chord rings out over the landing on the moon
#   guitar: the round-6 solo flamenco guitar (private/score-take1.mp3, in E) laid on top,
#     a whole tone down to the orchestra's D, from 1.34 s in: its opening chord rings as the
#     night lifts, its strum (9.04 s in the take) falls on the guitar's mouth, and it plays
#     over the build until it gives way to the orchestra's crest (out by 14.4 s)
# Level: one static gain to −16 LUFS, then a limiter at 4× (true peak), a 0.4 s fade-in and
# the film's own fade into the night over its last 0.9 s.
set -e
cd "$(dirname "$0")"
T=${1:-1}; O=${2:-2.27}; L=16.75
IN=private/r8/take$T.mp3
lufs() { ffmpeg -i "$1" -af ebur128 -f null - 2>&1 | awk '/Integrated loudness/{f=1} f&&/I:/{print $2; exit}'; }
ffmpeg -v error -y -ss $O -t $L -i $IN -af "afade=t=in:d=0.4" -ar 48000 -ac 2 private/r8/orch.wav
if [ "$3" = guitar ]; then
  ffmpeg -v error -y -ss 1.34 -t $L -i private/score-take1.mp3 -af "rubberband=pitch=0.8908987:tempo=1,afade=t=out:st=13.0:d=1.4" -ar 48000 -ac 2 private/r8/gtr.wav
  # the guitar a step over the orchestra (each to its own level first)
  GO=$(node -e "console.log((-21 - ($(lufs private/r8/orch.wav))).toFixed(2))")
  GG=$(node -e "console.log((-19 - ($(lufs private/r8/gtr.wav))).toFixed(2))")
  ffmpeg -v error -y -i private/r8/orch.wav -i private/r8/gtr.wav -filter_complex "[0]volume=${GO}dB[o];[1]volume=${GG}dB[g];[o][g]amix=inputs=2:normalize=0:duration=first" private/r8/cut$T.wav
else
  cp private/r8/orch.wav private/r8/cut$T.wav
fi
ffmpeg -v error -y -i private/r8/cut$T.wav -af "afade=t=out:st=15.85:d=0.9" private/r8/cutf.wav
I=$(lufs private/r8/cutf.wav)
G=$(node -e "console.log((-16 - ($I)).toFixed(2))")
ffmpeg -v error -y -i private/r8/cutf.wav -af "volume=${G}dB,aresample=192000,alimiter=limit=0.84:level=false:attack=2:release=60,aresample=48000" -c:a pcm_s16le private/bso.wav
echo "take $T from $O s${3:+ + $3}: integrated $I LUFS, gain $G dB → private/bso.wav"
