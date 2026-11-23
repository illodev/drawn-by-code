#!/bin/sh
# Round 8: the score, cut to the film from one ElevenLabs take (private/r8/take<N>.mp3, the
# user's; not committed). Usage: sh score.sh <take> <offset>  →  private/bso.wav (16.75 s)
#   take 1, offset 2.27: its two swells crest at 10.00 and 15.00 s, so they land on the
#     guitar's mouth (7.72 s) and on the last world going by at full speed (12.75 s)
#   take 4, offset 1.65: its one hit (14.40 s) lands on the last world (12.75 s)
# Level: one static gain to −16 LUFS, then a limiter at 4× (true peak), a 0.4 s fade-in and
# the film's own fade into the night over its last 0.9 s.
set -e
cd "$(dirname "$0")"
T=${1:-1}; O=${2:-2.27}; L=16.75
IN=private/r8/take$T.mp3
ffmpeg -v error -y -ss $O -t $L -i $IN -af "afade=t=in:d=0.4,afade=t=out:st=15.85:d=0.9" -ar 48000 -ac 2 private/r8/cut$T.wav
I=$(ffmpeg -i private/r8/cut$T.wav -af ebur128 -f null - 2>&1 | awk '/Integrated loudness/{f=1} f&&/I:/{print $2; exit}')
G=$(node -e "console.log((-16 - ($I)).toFixed(2))")
ffmpeg -v error -y -i private/r8/cut$T.wav -af "volume=${G}dB,aresample=192000,alimiter=limit=0.84:level=false:attack=2:release=60,aresample=48000" -c:a pcm_s16le private/bso.wav
echo "take $T from $O s: integrated $I LUFS, gain $G dB → private/bso.wav"
