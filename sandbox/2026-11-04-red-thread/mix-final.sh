#!/bin/sh
# The ElevenLabs score (private/audio/score.mp3, take 3 of four, picked by measuring each
# take's loudness per second against the film's shape) under the synthesized effects
# (sfx.wav, about 9 dB down so they accompany and never cover it) → mix.wav, which scene.js
# plays. The mix is brought to about -15.5 LUFS by one static gain, then a gentle limiter.
set -e
cd "$(dirname "$0")"
node music.mjs --sfx
ffmpeg -v error -y -i private/audio/score.mp3 -i sfx.wav -filter_complex \
  "[0:a]atrim=0:68,asetpts=PTS-STARTPTS,afade=t=out:st=66.8:d=1.2[m];[1:a]volume=0.35[s];[m][s]amix=inputs=2:duration=longest:normalize=0[o]" \
  -map "[o]" -ar 44100 private/audio/premix.wav
I=$(ffmpeg -i private/audio/premix.wav -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1 | awk '{print $2}')
G=$(python3 -c "print(-15.5 - ($I))")
ffmpeg -v error -y -i private/audio/premix.wav -af "volume=${G}dB,aresample=176400,alimiter=limit=0.79:attack=5:release=80:level=false,aresample=44100" mix.wav
echo "mix.wav (premix $I LUFS, gain $G dB)"
