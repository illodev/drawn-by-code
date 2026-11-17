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
#
# Narrator (round 9): five lines, one per shot, generated one by one (ElevenLabs v4, a deep
# documentary voice, «[deep voice] [slowly]»), in private/voice/ (never committed). Each is
# placed by the second its first sound is heard:
#    0.70  Light never arrives. | It has always been on its way.        (the Sun shows at 2.4)
#    6.80  Hide the sun… | and it shows you what it was hiding.          (second half at 8.6: totality is 8.4)
#   13.60  White is every colour, | keeping a secret.                    (the fan opens 13.2–16.9)
#   19.60  One at a time, | light still knows the pattern.               (single photons, then the fingers)
#   24.10  And then… | we learned to make our own.                       (over the cut; «then» ends at 25.02, the switch clicks at 25.05, «we» at 25.30; «own» meets the chord at 27.0)
# Under the voice the score and the sound design come down 6 dB (a quarter second down
# before a line, 0.6 s up after it; the last two lines are bridged; nothing is ducked after
# 26.9 s, so the closing chord is whole). Without private/voice/ there is no narrator.
#
# Under either score, the synthesised sound design (sound-design.mjs); one static gain and a
# limiter at 4x that does not renormalise (alimiter's level=false).
set -e
cd "$(dirname "$0")"
node sound-design.mjs out/sound-design.wav
V=private/voice
# speech intervals in film seconds → the ducking envelope (1 = under a line)
ramp() { echo "clip((t-($1-0.25))/0.25,0,1)*clip(($2+0.6-t)/0.6,0,1)"; }
if [ -f "$V/l1a.mp3" ]; then
  DUCK="1-0.5*($(ramp 0.7 5.2)+$(ramp 6.8 10.6)+$(ramp 13.6 17.1)+clip((t-19.35)/0.25,0,1)*clip((27.0-t)/0.25,0,1))"
  # each take starts with a breath of silence: the delay is the line's second minus that
  VOICE_IN="-i $V/l1a.mp3 -i $V/l2a.mp3 -i $V/l3a.mp3 -i $V/l4a.mp3 -i $V/l5b.mp3"
  VOICE_FG="[v1]adelay=460:all=1[a1];[v2]adelay=6660:all=1[a2];[v3]adelay=13480:all=1[a3];[v4]adelay=19400:all=1[a4];[v5]adelay=23940:all=1[a5];[a1][a2][a3][a4][a5]amix=inputs=5:normalize=0,aresample=44100,highpass=f=70,acompressor=threshold=-24dB:ratio=2.5:attack=8:release=160:makeup=2,volume=6.5dB,apad=whole_dur=30.5[vox]"
else
  DUCK="1"
  VOICE_IN="-f lavfi -t 30.5 -i anullsrc=r=44100:cl=stereo"
  VOICE_FG="[v1]anull[vox]"
fi
MASTER="aresample=176400,alimiter=limit=0.84:level=false:attack=2:release=60,aresample=44100,atrim=end=30.5"
TAKE=private/music/take2.mp3
if [ -f "$TAKE" ]; then
  node music.mjs out/totality.wav --totality
  # (the take's closing chord is its quietest swell and the film's last word: it is raised 5 dB,
  # the step taken at 26.95 s, inside the take's own near-silence before the chord)
  GAIN_DB=${GAIN_DB:-0}
  N=3
  SCORE_IN="-i $TAKE -i out/totality.wav"
  SCORE_FG="[0:a]aresample=44100,atrim=end=30.5,volume=5dB:enable='gte(t,26.95)',afade=t=out:st=30.2:d=0.3[m0];[1:a]volume=-4dB[m1];[m0][m1]amix=inputs=2:normalize=0[m];[2:a]volume=-5dB[s]"
else
  node music.mjs out/music.wav
  GAIN_DB=${GAIN_DB:-1}
  N=2
  SCORE_IN="-i out/music.wav"
  SCORE_FG="[0:a]anull[m];[1:a]volume=-3dB[s]"
fi
# name the voice inputs after the score and sound-design inputs
VOICE_FG=$(echo "$VOICE_FG" | sed "s/\[v1\]/[$N:a]/; s/\[v2\]/[$((N+1)):a]/; s/\[v3\]/[$((N+2)):a]/; s/\[v4\]/[$((N+3)):a]/; s/\[v5\]/[$((N+4)):a]/")
ffmpeg -v error -y $SCORE_IN -i out/sound-design.wav $VOICE_IN -filter_complex \
  "$SCORE_FG;[m][s]amix=inputs=2:normalize=0,volume='$DUCK':eval=frame,asplit[bed][bed2];$VOICE_FG;[vox]asplit[vox1][vox2];[bed][vox1]amix=inputs=2:normalize=0,volume=${GAIN_DB}dB,$MASTER[out]" \
  -map "[out]" -c:a pcm_s16le mix.wav -map "[bed2]" -t 30.5 -c:a pcm_s16le out/stem-bed.wav -map "[vox2]" -t 30.5 -c:a pcm_s16le out/stem-voice.wav
# (the two stems are only for checking the voice against what is under it)
ffmpeg -nostats -i mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^ +(I|LRA|Peak):"
