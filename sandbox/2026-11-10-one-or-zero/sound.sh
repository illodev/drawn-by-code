#!/bin/sh
# Sound for the style test (10 s, 96 BPM).
#   music   private/cue-a.mp3: ElevenLabs Music v2.5, 20 s, instrumental (generated through
#           the user's connector; the prompt is in review.md). It is third-party audio and
#           is never committed. Measured: 96.00 BPM, the kick 0.49 s into the file, so the
#           cut starts there and every beat of the scene falls on one of its beats.
#   bed     synthesized here: the carriage's rumble and the two knocks of a rail joint every
#           two beats.
#   effects assets/sfx, placed by audio.json on the scene's own constants.
# The mix is brought to about -16 LUFS by one static gain, then limited.
set -e
cd "$(dirname "$0")"
[ -f private/cue-a.mp3 ] || { echo "private/cue-a.mp3 is missing: generate the cue first (review.md)"; exit 1; }
mkdir -p out
D=10
# the carriage: brown noise under 110 Hz that breathes, and a double knock every 1.25 s
ffmpeg -v error -y -f lavfi -i "anoisesrc=color=brown:duration=$D:sample_rate=44100:seed=7" \
  -f lavfi -i "aevalsrc='0.5*exp(-55*mod(t,1.25))*sin(2*PI*68*t)+0.4*gt(mod(t,1.25),0.13)*exp(-60*(mod(t,1.25)-0.13))*sin(2*PI*60*t)':d=$D:s=44100" \
  -filter_complex "[0:a]lowpass=f=110,lowpass=f=110,volume=5dB,tremolo=f=0.4:d=0.35[r];[1:a]volume=-3dB[k];[r][k]amix=inputs=2:normalize=0,aformat=channel_layouts=stereo[o]" \
  -map "[o]" out/bed.wav
# the music, from its first kick, with the bed under it; it fades with the last second
ffmpeg -v error -y -ss 0.48 -t $D -i private/cue-a.mp3 -i out/bed.wav \
  -filter_complex "[0:a]aresample=44100,volume=-9dB,afade=t=in:d=0.3,afade=t=out:st=9:d=1[m];[1:a]volume=-13dB,afade=t=in:d=0.5,afade=t=out:st=9:d=1[b];[m][b]amix=inputs=2:normalize=0[o]" \
  -map "[o]" out/music-bed.wav
node ../../engine/mix.mjs audio.json out/premix.wav
I=$(ffmpeg -hide_banner -i out/premix.wav -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1 | awk '{print $2}')
G=$(python3 -c "print(round(-16 - ($I), 2))")
ffmpeg -v error -y -i out/premix.wav -af "volume=${G}dB,aresample=176400,alimiter=limit=0.84:attack=5:release=80:level=false,aresample=44100" mix.wav
echo "mix.wav (premix $I LUFS, gain $G dB)"
