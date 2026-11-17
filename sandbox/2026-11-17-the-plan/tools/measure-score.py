"""Measures a generated score without anyone hearing it: the tempo and where its beats fall
against the film's half-second grid, the level per second (whole band and below 150 Hz), and
the strongest onsets, so the take can be laid under the picture by measurement.
  python tools/measure-score.py private/score.mp3 [offset_seconds]
"""
import sys, subprocess, numpy as np
f = sys.argv[1]; off = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
sr = 22050
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
print('length %.2f s, peak %.1f dBFS' % (len(x) / sr, 20 * np.log10(np.abs(x).max() + 1e-9)))
# onset strength: rise of the spectrum's magnitude, 10 ms hops
n, hop = 1024, 220
frames = np.lib.stride_tricks.sliding_window_view(x, n)[::hop] * np.hanning(n)
mag = np.abs(np.fft.rfft(frames, axis=1))
flux = np.maximum(0, np.diff(np.log1p(mag * 30), axis=0)).sum(1)
dt = hop / sr
# tempo: which beat length do the onsets repeat at?
best = []
for bpm in np.arange(60, 181, 0.5):
    lag = 60 / bpm / dt; i = int(round(lag))
    best.append((np.corrcoef(flux[:-i], flux[i:])[0, 1], bpm))
best.sort(reverse=True); print('tempo candidates:', ', '.join('%.1f (%.2f)' % (b, c) for c, b in best[:6]))
# phase on the film's grid: onset energy at φ + k·0.5 s
for beat in (0.5, 0.25):
    ph = np.arange(0, beat, 0.01); e = [flux[((np.arange(p + off, len(flux) * dt - 0.01, beat)) / dt).astype(int)].mean() for p in ph]
    print('grid of %.2f s: strongest phase %.2f s (%.2fx the mean)' % (beat, ph[int(np.argmax(e))], max(e) / np.mean(e)))
# level per second: whole band, and below 150 Hz
freqs = np.fft.rfftfreq(n, 1 / sr); low = mag[:, freqs < 150]
sec = int(1 / dt)
print('s   all  low  onsets')
for s in range(int(len(flux) * dt)):
    a = frames[s * sec:(s + 1) * sec]; rms = 20 * np.log10(np.sqrt((a ** 2).mean()) + 1e-9); lo = 20 * np.log10(low[s * sec:(s + 1) * sec].mean() + 1e-9)
    fl = flux[s * sec:(s + 1) * sec]; pk = np.argsort(fl)[-2:]
    print('%2d %5.1f %5.1f  %s' % (s + off, rms, lo, ' '.join('%.2f' % (s + off + p * dt) for p in sorted(pk))))
