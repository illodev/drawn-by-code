#!/bin/sh
# The film's score: one generated take of solo flamenco guitar (ElevenLabs Music v2.5, 64 s,
# instrumental; the prompt is in review.md, round 6). The take is the user's and is not
# committed: it lives in private/score-take1.mp3.
#   sh score.sh   → private/score.wav (30.5 s), which scene.js mixes in when it is there
# The take was made for a film of 63 s; since round 7 the film is 30.5 s, so the take is
# used from its start and joined to its own ending. By measurement (nobody here has
# listened):
#   - its strum falls at 9.0–9.3 s (the guitar comes into focus at 9.7): laid from second 0;
#   - its first chord decays to −46 dBFS by second 8, under four strata of the passage:
#     the tail is lifted, 0 dB at 1 s to +14 dB at 8 s, back to 0 just before the strum;
#   - the join: the take plays to 26.75 s, where it is in a softer stretch (−15 to −18 dBFS
#     from 26.55), and crosses over 0.2 s into its own last 4.4 s, which begin at −19 dBFS
#     just before the last chord (58.6 s of the take; the chord is at 59.0). The chord then
#     falls at 26.95 s: the last stratum leaves the frame at 26.5 and the signature is
#     coming up. It rings out to the end;
#   - one static gain to about −15 LUFS and a limiter at 4× for the few strums that then
#     pass −1.5 dBFS (the mp3 decodes to +2.7 dBFS at its loudest);
#   - cut at the film's length with the last half second faded.
cd "$(dirname "$0")" || exit 1
ffmpeg -v error -y -i private/score-take1.mp3 -filter_complex "\
[0:a]asplit=2[x][y];\
[x]atrim=0:26.75,asetpts=PTS-STARTPTS,volume='pow(10,(if(lt(t,8.86),14*clip((t-1)/7,0,1),if(lt(t,8.98),14*(8.98-t)/0.12,0)))/20)':eval=frame[a];\
[y]atrim=58.6:64,asetpts=PTS-STARTPTS[b];\
[a][b]acrossfade=d=0.2:c1=tri:c2=tri,volume=-1.2dB,aresample=192000,alimiter=limit=0.84:level=false:attack=2:release=60,aresample=48000,\
atrim=0:30.5,afade=t=out:st=30.0:d=0.5" -c:a pcm_s16le private/score.wav
