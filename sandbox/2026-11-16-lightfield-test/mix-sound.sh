#!/bin/sh
# lightfield-test · the soundtrack.
#   sh sandbox/2026-11-16-lightfield-test/mix-sound.sh        → mix.wav next to this file
#
# Score: a generated piece (ElevenLabs Music v2.5, 33 s, one prompt describing the film's
# arc; take 2 of four, chosen by measuring: see review.md, round 8). It lives in
# private/music/ and is never committed. Laid from second 0, uncut: measured, its own
# sections fall on the film's cuts (the celesta arpeggio comes up at 11.5–12 s with the
# prism, the pulses at 19 s with the slits, peaking at 22–24.5 s as the photons gather; it
# breathes out to almost nothing at 26–27 s while the cold bulb is switched on, and its
# closing chord lands at 27.00 s, on the title; it has rung out by 30.5 s).
# What it lacks is an event at totality (8.4 s: it is fading there), so the synthesised
# D minor ninth of music.mjs is laid over it from 8.35 s to the cut at 12 (same key: the
# take is in D throughout).
# Without the private take, the whole score is the synthesised one (music.mjs).
# Under either, the synthesised sound design (sound-design.mjs), and one static gain plus a
# limiter at 4x that does not renormalise (alimiter's level=false).
set -e
cd "$(dirname "$0")"
node sound-design.mjs out/sound-design.wav
TAKE=private/music/take2.mp3
if [ -f "$TAKE" ]; then
  node music.mjs out/totality.wav --totality
  # (the take's closing chord is its quietest swell and the film's last word: it is raised 5 dB,
  # the step taken at 26.95 s, inside the take's own near-silence before the chord)
  GAIN_DB=${GAIN_DB:-3.5}
  ffmpeg -v error -y -i "$TAKE" -i out/totality.wav -i out/sound-design.wav -filter_complex \
    "[0:a]aresample=44100,atrim=end=30.5,volume=5dB:enable='gte(t,26.95)',afade=t=out:st=30.2:d=0.3[m];[1:a]volume=-4dB[t];[2:a]volume=-5dB[s];[m][t][s]amix=inputs=3:normalize=0,volume=${GAIN_DB}dB,aresample=176400,alimiter=limit=0.84:level=false:attack=2:release=60,aresample=44100,atrim=end=30.5" \
    -c:a pcm_s16le mix.wav
else
  node music.mjs out/music.wav
  GAIN_DB=${GAIN_DB:-2}
  ffmpeg -v error -y -i out/music.wav -i out/sound-design.wav -filter_complex \
    "[0:a]volume=0dB[m];[1:a]volume=-3dB[s];[m][s]amix=inputs=2:normalize=0,volume=${GAIN_DB}dB,aresample=176400,alimiter=limit=0.84:level=false:attack=2:release=60,aresample=44100,atrim=end=30.5" \
    -c:a pcm_s16le mix.wav
fi
ffmpeg -nostats -i mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^ +(I|LRA|Peak):"
