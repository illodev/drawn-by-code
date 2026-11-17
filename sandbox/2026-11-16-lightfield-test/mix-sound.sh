#!/bin/sh
# lightfield-test · the soundtrack: the synthesised score (music.mjs) plus the synthesised
# sound design (sound-design.mjs), mixed with one static gain and a peak limiter.
#   sh sandbox/2026-11-16-lightfield-test/mix-sound.sh        → mix.wav next to this file
# Nothing here is third-party audio: both stems are made by code in this folder.
set -e
cd "$(dirname "$0")"
node music.mjs out/music.wav
node sound-design.mjs out/sound-design.wav
# one measured gain (set so the mix sits near -18 LUFS: an ambient piece with quiet shots),
# then a limiter at 4x that does not renormalise (alimiter's level=false)
GAIN_DB=${GAIN_DB:-2}
ffmpeg -v error -y -i out/music.wav -i out/sound-design.wav -filter_complex \
  "[0:a]volume=0dB[m];[1:a]volume=-3dB[s];[m][s]amix=inputs=2:normalize=0,volume=${GAIN_DB}dB,aresample=176400,alimiter=limit=0.84:level=false:attack=2:release=60,aresample=44100,atrim=end=30.5" \
  -c:a pcm_s16le mix.wav
ffmpeg -v error -i mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
