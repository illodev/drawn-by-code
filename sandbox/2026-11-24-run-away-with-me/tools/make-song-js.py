"""Writes song.js: the song as numbers a scene can read at any t, so the picture can breathe
with the music and every cue sits on its measured second. No audio and no lyrics in it.

  python3 -I tools/make-song-js.py private/song.mp3 out/song-measure.json song.js

Song.bpm, Song.beat, Song.bar0, Song.B(n) (the second bar n starts), Song.beatAt(T),
Song.env(name, T) for name in all, bass, mid, high, kick (0..1 per frame at 24 fps, smoothed
like a VU meter: fast attack, slow release), and Song.cue (the named moments of brief.md).
"""
import sys, json, subprocess, numpy as np

f, measure, out = sys.argv[1:4]
m = json.load(open(measure))
sr, fps = 22050, 24
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'],
                                 capture_output=True).stdout, np.float32)
n, hop = 2048, sr // (fps * 4)                     # four analysis hops per frame
fr = np.lib.stride_tricks.sliding_window_view(x, n)[::hop] * np.hanning(n)
M = np.abs(np.fft.rfft(fr, axis=1)).astype(np.float32)
F = np.fft.rfftfreq(n, 1 / sr)
T = (np.arange(len(M)) * hop + n / 2) / sr
def band(lo, hi): k = (F >= lo) & (F < hi); return 10 * np.log10((M[:, k] ** 2).sum(1) + 1e-10)
L = np.log1p(M * 30); kb = F < 150
kick = np.maximum(0, np.diff(L[:, kb], axis=0, prepend=L[:1, kb])).sum(1)
series = {'all': band(20, 11000), 'bass': band(20, 150), 'mid': band(700, 3000), 'high': band(4000, 11000), 'kick': kick}
nfr = int(np.ceil(m['duration'] * fps))
tf = np.arange(nfr) / fps
res = {}
for name, s in series.items():
    v = np.interp(tf, T, s)
    lo, hi = np.percentile(v, 5), np.percentile(v, 98)
    v = np.clip((v - lo) / (hi - lo + 1e-9), 0, 1)
    # VU: instant attack, release of ~0.25 s (kick: 0.12 s)
    rel = np.exp(-1 / (fps * (0.12 if name == 'kick' else 0.25)))
    o = np.zeros_like(v); acc = 0.0
    for i, a in enumerate(v):
        acc = a if a > acc else acc * rel + a * (1 - rel)
        o[i] = acc
    res[name] = [round(float(a), 3) for a in o]

cue = {
    'firstNote': 0.43, 'verse1': 16.55, 'pillQuiet': 24.62, 'pillBack': 32.68, 'pre1': 46.80,
    'gap1': 62.94, 'chorus1': 64.95, 'out1': 77.0, 'out2': 93.0, 'blackBar': 97.22, 'verse2': 99.24,
    'pre2': 113.36, 'gap2': 129.49, 'chorus2': 131.51, 'out3': 143.6, 'out4': 159.6,
    'bridgeA': 163.78, 'bridgeB': 179.91, 'build': 192.01, 'riser': 196.04, 'final': 198.06,
    'out5': 209.2, 'out6': 226.2, 'lastHit': 246.47, 'silence': 250.5,
}
js = f"""// The song as numbers (tools/make-song-js.py): tempo, bars, band levels per frame, cues.
// Generated: do not edit by hand. No audio and no lyrics here.
const Song = (() => {{
    const bpm = {m['bpm']}, beat = {m['beat']}, bar0 = {m['bar0']}, fps = {fps};
    const E = {json.dumps(res, separators=(',', ':'))};
    const B = (n) => bar0 + n * 4 * beat;
    const beatAt = (T) => (T - bar0) / beat;
    const env = (name, T) => {{ const a = E[name], i = T * fps, j = Math.max(0, Math.min(a.length - 2, Math.floor(i))), u = Math.max(0, Math.min(1, i - j)); return a[j] + (a[j + 1] - a[j]) * u; }};
    const cue = {json.dumps(cue)};
    return {{ bpm, beat, bar0, fps, B, beatAt, env, cue, duration: {m['duration']} }};
}})();
"""
open(out, 'w').write(js)
print('wrote', out, '%.0f KB' % (len(js) / 1024))
