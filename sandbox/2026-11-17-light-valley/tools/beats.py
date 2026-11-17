# The pulse of a score: onset strength (spectral flux) folded at the beat period, for the
# phase; checked over windows to see whether the tempo holds. python beats.py track.wav bpm from to
import sys, numpy as np
from scipy.io import wavfile
from scipy.signal import stft
sr, x = wavfile.read(sys.argv[1]); x = x.astype(np.float32); bpm = float(sys.argv[2]); a, b = float(sys.argv[3]), float(sys.argv[4])
f, t, Z = stft(x, sr, nperseg=1024, noverlap=1024 - 256)
S = np.log1p(np.abs(Z)); flux = np.maximum(0, np.diff(S, axis=1)).sum(0); tt = t[1:]
def phase(t0, t1, bpm):
    P = 60 / bpm; m = (tt >= t0) & (tt < t1)
    ang = 2 * np.pi * (tt[m] % P) / P; w = flux[m]
    z = (w * np.exp(1j * ang)).sum() / w.sum()
    return (np.angle(z) % (2 * np.pi)) / (2 * np.pi) * P, abs(z)
for bp in (bpm - 0.5, bpm - 0.25, bpm, bpm + 0.25, bpm + 0.5):
    ph, r = phase(a, b, bp); print(f'bpm {bp:6.2f}: phase {ph:.3f} s  strength {r:.3f}')
print('windows of 12 s at', bpm)
for t0 in np.arange(a, b, 12):
    ph, r = phase(t0, t0 + 12, bpm); print(f'  {t0:5.1f}-{t0+12:5.1f}: phase {ph:.3f}  strength {r:.3f}')
