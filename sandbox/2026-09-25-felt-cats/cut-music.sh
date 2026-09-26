#!/bin/sh
# Cuts our hoedown (gen-music.mjs) to the dance: the band's entry (track beat 15, 7.352 s)
# lands on the shuffle's first beat (4.099 s, the reference's beat 8), so the track starts
# 3.253 s in; it runs to the end and fades over the last third of a second (the meme loops).
cd "$(dirname "$0")"
ffmpeg -loglevel error -y -ss 3.253 -t 15.84 -i private/audio/hoedown2.mp3 -af "afade=t=out:st=15.5:d=0.34" -ar 48000 -ac 2 private/audio/music.wav
echo private/audio/music.wav
