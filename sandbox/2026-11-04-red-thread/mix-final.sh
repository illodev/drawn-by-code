#!/bin/sh
# Round 14: the score is Japanese lo-fi (koto, shakuhachi, shamisen over dusty beats, all in
# D), one ElevenLabs piece per scene with its own rhythm (a calm boom-bap, no drums under
# the sleeve, a half-time trap beat, double time in the quarrel, rain and no drums, a
# building mid-tempo beat for the bridge, a breath and the full beat for the ending), each
# laid at its scene's first second, cut 0.4 s into the next and crossfaded there. The takes
# live in private/audio/lofi/ (never committed); SEGS lists which plays each scene. Under it,
# the synthesized effects (sfx.wav, about 9 dB down). The mix is brought to about -15.5 LUFS
# by one static gain, then a limiter.
set -e
cd "$(dirname "$0")"
node music.mjs --sfx
# take  start  end   gain(dB)
SEGS="A1 0 12 0
B2 12 18 6
C1 18 26 -6
D1 26 32 -4
E2 32 43 8
F4 43 58 0
G1 58 68 0"
IN=""; F=""; L=""; i=0
echo "$SEGS" > /tmp/rt-segs.txt
while read take s e gain; do
  IN="$IN -i private/audio/lofi/$take.mp3"
  d=$(python3 -c "print($e - $s + 0.4)")
  fo=$(python3 -c "print($e - $s)")
  fi_=$( [ "$s" = "0" ] && echo 0.01 || echo 0.25 )
  ms=$(python3 -c "print(int(max(0, $s - 0.2) * 1000))")
  F="$F[$i:a]atrim=0:$d,asetpts=PTS-STARTPTS,volume=${gain}dB,afade=t=in:d=$fi_,afade=t=out:st=$fo:d=0.4,adelay=${ms}|${ms}[m$i];"
  L="$L[m$i]"
  i=$((i+1))
done < /tmp/rt-segs.txt
n=$i
ffmpeg -v error -y $IN -i sfx.wav -filter_complex \
  "${F}${L}amix=inputs=$n:duration=longest:normalize=0,atrim=0:68,afade=t=out:st=66.8:d=1.2[m];[$n:a]volume=0.35[s];[m][s]amix=inputs=2:duration=longest:normalize=0[o]" \
  -map "[o]" -ar 44100 private/audio/premix.wav
I=$(ffmpeg -i private/audio/premix.wav -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1 | awk '{print $2}')
G=$(python3 -c "print(-15.5 - ($I))")
ffmpeg -v error -y -i private/audio/premix.wav -af "volume=${G}dB,aresample=176400,alimiter=limit=0.79:attack=5:release=80:level=false,aresample=44100" mix.wav
echo "mix.wav (premix $I LUFS, gain $G dB)"
