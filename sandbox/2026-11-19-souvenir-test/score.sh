#!/bin/sh
# The film's score: one generated take of solo flamenco guitar (ElevenLabs Music v2.5, 64 s,
# instrumental; the prompt is in review.md, round 6), laid from second 0 uncut: its
# rasgueado falls at 9.0–9.3 s (the guitar comes into focus at 9.7) and its last chord at
# 59.0 s (the olive grove leaves the frame and the moon is alone at 59.0).
# The take is the user's and is not committed: it lives in private/score-take1.mp3.
#   sh score.sh   → private/score.wav (63 s), which scene.js mixes in when it is there
# What is done to it, by measurement (nobody here has listened):
#   - its first chord decays to −46 dBFS by second 8, under four strata of the passage:
#     the tail is lifted, 0 dB at 1 s to +14 dB at 8 s, back to 0 just before the strum;
#   - one static gain to about −15 LUFS and a limiter at 4× for the few strums that then
#     pass −1.5 dBFS (the mp3 decodes to +2.7 dBFS at its loudest);
#   - cut at 63 s with the last 0.4 s faded (the take is already at −38 dBFS there).
cd "$(dirname "$0")" || exit 1
ffmpeg -v error -y -i private/score-take1.mp3 -af "\
volume='pow(10,(if(lt(t,8.86),14*clip((t-1)/7,0,1),if(lt(t,8.98),14*(8.98-t)/0.12,0)))/20)':eval=frame,\
volume=-1.2dB,aresample=192000,alimiter=limit=0.84:level=false:attack=2:release=60,aresample=48000,\
atrim=0:63,afade=t=out:st=62.6:d=0.4" -c:a pcm_s16le private/score.wav
