#!/bin/sh
# tide · the mix: the score (an ElevenLabs take, private) with the sand's own sounds on the
# picture's cues. Inputs live in private/ (third-party audio, never committed).
#   sh sandbox/2026-11-04-tide/mix.sh  →  private/mix.wav
set -e
cd "$(dirname "$0")/private"
# cue: file second dB
CUES="wave 10.7 -5
wave 19.7 -9
wave 29.7 -9
wave 39.8 -7
pour 0.7 -14
pour 1.8 -14
pour 3.9 -15
pour 6.0 -17
pour 7.0 -17
pour 23.0 -17
pour 24.1 -17
pour 25.3 -16
pour 33.3 -17
pour 34.5 -17
wind 36.4 -6"
args="-i take4.mp3"; filt="[0:a]atrim=0:45,afade=t=in:d=0.6,afade=t=out:st=43.2:d=1.8,volume=-2dB[m];"
i=1; mixin="[m]"
echo "$CUES" | while read f s db; do echo "$f $s $db"; done > /dev/null
while read f s db; do
  args="$args -i $f.mp3"
  ms=$(awk "BEGIN{printf \"%d\", $s*1000}")
  filt="$filt[$i:a]volume=${db}dB,adelay=${ms}|${ms}[c$i];"
  mixin="$mixin[c$i]"
  i=$((i+1))
done <<CUEEOF
$CUES
CUEEOF
filt="${filt}${mixin}amix=inputs=$i:normalize=0,atrim=0:45,alimiter=limit=0.9[out]"
ffmpeg -loglevel error -y $args -filter_complex "$filt" -map "[out]" -ar 48000 -ac 2 mix.wav
echo "→ private/mix.wav"
