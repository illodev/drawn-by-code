#!/bin/sh
# micrograph-test · the soundtrack.
#   sh sandbox/2026-11-17-micrograph-test/mix-sound.sh        → mix.wav next to this file
#
# Score: a generated piece (ElevenLabs Music v2.5, 39 s, one prompt describing the film's
# arc at 120 BPM in D minor; take 3 of four, chosen by measuring: see review.md, round 3).
# It lives in private/music/ and is never committed. Laid from second 0, uncut: measured,
# it is in D throughout, its beats fall on the half seconds (so on every cut), it grows
# while the first image forms (accents at 2.5–3.5 s, as the colour arrives), dips under the
# serial sections (where the slices' own ticks are the pulse), has a sixteenth-note pulse in
# the budding shot and onsets at 29.6 s (the pinch) and 31.5 s (the last cut).
# What it lacks is an ending: it fades from 33 s and the title comes at 35. So its tail is
# raised (up to 7 dB, from the last cut) and the synthesised ending of music.mjs (a wide
# D minor and the title's bells) is laid over it.
# Without the private take, the whole score is the synthesised one (music.mjs).
#
# Under either score, the synthesised sound design (sound-design.mjs); one static gain and a
# limiter at 4x that does not renormalise (alimiter's level=false).
set -e
cd "$(dirname "$0")"
node sound-design.mjs out/sound-design.wav
MASTER="aresample=176400,alimiter=limit=0.84:level=false:attack=2:release=60,aresample=44100,atrim=end=37.5"
TAKE=private/music/take3.mp3
if [ -f "$TAKE" ]; then
  node music.mjs out/ending.wav --ending
  GAIN_DB=${GAIN_DB:-3.5}
  ffmpeg -v error -y -i "$TAKE" -i out/ending.wav -i out/sound-design.wav -filter_complex \
    "[0:a]aresample=44100,atrim=end=37.5,volume='pow(10,7*clip((t-31.5)/3,0,1)/20)':eval=frame,afade=t=out:st=37.1:d=0.4[m0];[1:a]volume=-2dB[m1];[2:a]volume=-6dB[s];[m0][m1][s]amix=inputs=3:normalize=0,volume=${GAIN_DB}dB,$MASTER[out]" \
    -map "[out]" -c:a pcm_s16le mix.wav
else
  node music.mjs out/music.wav
  GAIN_DB=${GAIN_DB:-3.5}
  ffmpeg -v error -y -i out/music.wav -i out/sound-design.wav -filter_complex \
    "[0:a]anull[m];[1:a]volume=-5dB[s];[m][s]amix=inputs=2:normalize=0,volume=${GAIN_DB}dB,$MASTER[out]" \
    -map "[out]" -c:a pcm_s16le mix.wav
fi
ffmpeg -nostats -i mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^ +(I|LRA|Peak):"
