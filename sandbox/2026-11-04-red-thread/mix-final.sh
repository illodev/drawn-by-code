#!/bin/sh
# The ElevenLabs score (private/audio/score.mp3) under the synthesized effects (sfx.wav) →
# mix.wav, which scene.js plays. Run gen-music.mjs and `node music.mjs --sfx` first.
set -e
cd "$(dirname "$0")"
node music.mjs --sfx
ffmpeg -v error -y -i private/audio/score.mp3 -i sfx.wav -filter_complex \
  "[0:a]atrim=0:68,asetpts=PTS-STARTPTS,afade=t=out:st=66.5:d=1.5,volume=0.9[m];[1:a]volume=0.8[s];[m][s]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.89[o]" \
  -map "[o]" -ar 44100 mix.wav
echo mix.wav
