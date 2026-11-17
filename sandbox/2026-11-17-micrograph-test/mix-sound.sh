#!/bin/sh
# micrograph-test · the soundtrack: a score, a clock, a narrator. No sound effects (the user,
# round 4: «Can it be done without effects? Just the music, with the ticking of time»).
#   sh sandbox/2026-11-17-micrograph-test/mix-sound.sh        → mix.wav next to this file
#
# Score: a generated piece (ElevenLabs Music v2.5, 39 s, one prompt describing the film's
# arc at 120 BPM in D minor; take 3 of four, chosen by measuring: see review.md, round 3).
# It lives in private/music/ and is never committed. Laid from second 0, uncut: it is in D
# throughout and its beats fall on the half seconds, so on every cut. It fades from 33 s and
# the title comes at 35: its tail is raised (up to 7 dB, from the last cut) and the
# synthesised ending of music.mjs (a wide D minor and the title's bells) is laid over it.
# Without the private take, the whole score is the synthesised one (music.mjs).
#
# The ticking (sound-design.mjs): a clock, one tick a second on the half seconds, and a tick
# per slice in the serial sections.
#
# Narrator (round 4): seven lines, one per shot, generated one by one (ElevenLabs v4, the
# deep documentary voice of the lightfield film, «[deep voice] [slowly]»), in private/voice/
# (never committed). Each is placed by the second its first sound is heard:
#    1.30  Look closer. | Life begins by swallowing.                 (second half at 3.34: the lobes are closing on the bacterium)
#    7.00  One guest stayed. | It burns in you still.                (the mitochondrion: second half at 9.42)
#   11.30  Smaller still… | things that are not quite alive.         (it starts 0.2 s before the magnification changes)
#   16.30  A machine with one instruction… | copy me.                (between two hits of the score, 16.02 and 20.01; the first half ends as the sheath is about to contract; «copy me» at 19.30, as the head begins to empty)
#   21.10  It carries nothing but a message.                         (it starts over the emptied phage, 0.4 s before the cut to the single virion, and ends at 23.88: the score has a hit at 24.03, which would have covered «message»)
#   28.56  It leaves… | wearing the skin of its reader.              («leaves» ends at 29.60, where the bud pinches off; the rest runs over the cut)
#   32.75  And we have only just learned to look.                    («look» as the title forms, 35.0–36.0)
# Under the voice the score comes down 6 dB (a quarter second down before a line, 0.6 s up
# after it; the last two lines are bridged). The clock is not ducked: it keeps its level. Without private/voice/ there is
# no narrator.
set -e
cd "$(dirname "$0")"
node sound-design.mjs out/sound-design.wav
V=private/voice
ramp() { echo "clip((t-($1-0.25))/0.25,0,1)*clip(($2+0.6-t)/0.6,0,1)"; }
if [ -f "$V/l1b.mp3" ]; then
  DUCK="1-0.5*min(1,$(ramp 1.3 5.48)+$(ramp 7.0 10.88)+$(ramp 11.3 15.39)+$(ramp 16.3 19.98)+$(ramp 21.1 23.88)+$(ramp 28.56 35.75))"
  # each take starts with a breath of silence: the delay is the line's second minus that
  VOICE_IN="-i $V/l1b.mp3 -i $V/l2b.mp3 -i $V/l3b.mp3 -i $V/l4a.mp3 -i $V/l5a.mp3 -i $V/l6b.mp3 -i $V/l7b.mp3"
  VOICE_FG="[v1]adelay=1050:all=1[a1];[v2]adelay=6810:all=1[a2];[v3]adelay=11110:all=1[a3];[v4]adelay=16140:all=1[a4];[v5]adelay=20950:all=1[a5];[v6]adelay=28410:all=1[a6];[v7]adelay=32580:all=1[a7];[a1][a2][a3][a4][a5][a6][a7]amix=inputs=7:normalize=0,aresample=44100,highpass=f=70,acompressor=threshold=-24dB:ratio=2.5:attack=8:release=160:makeup=2,volume=6.5dB,apad=whole_dur=37.5[vox]"
else
  DUCK="1"
  VOICE_IN="-f lavfi -t 37.5 -i anullsrc=r=44100:cl=stereo"
  VOICE_FG="[v1]anull[vox]"
fi
MASTER="aresample=176400,alimiter=limit=0.84:level=false:attack=2:release=60,aresample=44100,atrim=end=37.5"
TAKE=private/music/take3.mp3
GAIN_DB=${GAIN_DB:--0.5}
if [ -f "$TAKE" ]; then
  node music.mjs out/ending.wav --ending
  N=3
  SCORE_IN="-i $TAKE -i out/ending.wav"
  SCORE_FG="[0:a]aresample=44100,atrim=end=37.5,volume='pow(10,7*clip((t-31.5)/3,0,1)/20)':eval=frame,afade=t=out:st=37.1:d=0.4[m0];[1:a]volume=-2dB[m1];[m0][m1]amix=inputs=2:normalize=0[m];[2:a]volume=-3dB[s]"
else
  node music.mjs out/music.wav
  N=2
  SCORE_IN="-i out/music.wav"
  SCORE_FG="[0:a]anull[m];[1:a]volume=-3dB[s]"
fi
# name the voice inputs after the score and ticking inputs
for i in 1 2 3 4 5 6 7; do VOICE_FG=$(echo "$VOICE_FG" | sed "s/\[v$i\]/[$((N+i-1)):a]/"); done
ffmpeg -v error -y $SCORE_IN -i out/sound-design.wav $VOICE_IN -filter_complex \
  "$SCORE_FG;[m]volume='$DUCK':eval=frame[md];[md][s]amix=inputs=2:normalize=0,asplit[bed][bed2];$VOICE_FG;[vox]asplit[vox1][vox2];[bed][vox1]amix=inputs=2:normalize=0,volume=${GAIN_DB}dB,$MASTER[out]" \
  -map "[out]" -c:a pcm_s16le mix.wav -map "[bed2]" -t 37.5 -c:a pcm_s16le out/stem-bed.wav -map "[vox2]" -t 37.5 -c:a pcm_s16le out/stem-voice.wav
# (the two stems are only for checking the voice against what is under it)
ffmpeg -nostats -i mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^ +(I|LRA|Peak):"
