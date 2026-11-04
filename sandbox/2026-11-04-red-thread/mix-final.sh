#!/bin/sh
# Round 12: the score is one ElevenLabs piece per scene (traditional Japanese instruments
# only: koto, shakuhachi, shamisen, taiko), each generated a little longer than its scene,
# laid at the scene's first second, cut 0.4 s into the next scene and crossfaded there, so
# every change of mood lands on a cut. The takes live in private/audio/seg/ (never committed);
# which take plays each scene is listed in SEGS. Under it, the synthesized effects (sfx.wav,
# about 9 dB down). The mix is brought to about -15.5 LUFS by one static gain, then a limiter.
set -e
cd "$(dirname "$0")"
node music.mjs --sfx
# take  start  end   gain(dB)
SEGS="A2 0 12 3
B3 12 18 2
C1 18 26 0
D1 26 32 0
E3 32 43 6
F1 43 57 1
G1 57 68 0"
IN=""; F=""; L=""; i=0
echo "$SEGS" > /tmp/rt-segs.txt
while read take s e gain; do
  IN="$IN -i private/audio/seg/$take.mp3"
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
