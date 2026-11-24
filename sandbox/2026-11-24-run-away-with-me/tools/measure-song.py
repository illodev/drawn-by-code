"""Measures the song so the film can be cut on its jumps without anyone hearing it.

  python3 -I tools/measure-song.py private/song.mp3 out/song-measure.json

Prints and writes: the tempo fitted to a hundredth and the phase of the beat grid, which
beat of the four is the bar's first, the level per bar in five bands (all, bass < 150 Hz,
low mids 150-700, mids 700-3000, highs > 4 kHz) and the centre-minus-side level (a lead
voice sits in the centre), section boundaries found from how much each bar differs from the
ones before it, and the jumps: rises and drops of level between beats, bars where the bass
leaves or comes back, and the strongest single hits.
"""
import sys, json, subprocess, numpy as np

f = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else None
sr = 22050
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '2', '-ar', str(sr), '-f', 'f32le', '-'],
                     capture_output=True).stdout
st = np.frombuffer(raw, np.float32).reshape(-1, 2)
mid = st.mean(1); side = (st[:, 0] - st[:, 1]) / 2
dur = len(mid) / sr

n, hop = 2048, 220                      # 10 ms hops
dt = hop / sr
win = np.hanning(n)
def stft(x):
    fr = np.lib.stride_tricks.sliding_window_view(x, n)[::hop] * win
    return np.abs(np.fft.rfft(fr, axis=1)).astype(np.float32)
M = stft(mid); S = stft(side)
freqs = np.fft.rfftfreq(n, 1 / sr)
T = np.arange(len(M)) * dt + n / 2 / sr  # centre of each hop

def band(lo, hi, X=M):
    k = (freqs >= lo) & (freqs < hi)
    return (X[:, k] ** 2).sum(1)
bands = {
    'all': band(20, 11000), 'bass': band(20, 150), 'lowmid': band(150, 700),
    'mid': band(700, 3000), 'high': band(4000, 11000),
}
vocal_c = band(200, 4000, M); vocal_s = band(200, 4000, S)
db = lambda e: 10 * np.log10(e + 1e-10)

# onset strength (spectral flux on a log magnitude), and a bass-only flux for kicks
L = np.log1p(M * 30)
flux = np.maximum(0, np.diff(L, axis=0, prepend=L[:1])).sum(1)
kb = freqs < 150
bflux = np.maximum(0, np.diff(L[:, kb], axis=0, prepend=L[:1, kb])).sum(1)

def comb(sig, period, phase):
    ts = np.arange(phase, dur - 0.05, period)
    return np.interp(ts, T, sig).mean()

# tempo: coarse by autocorrelation, then fine by a comb over the whole song
best = []
for bpm in np.arange(90, 181, 0.5):
    lag = int(round(60 / bpm / dt))
    best.append((np.corrcoef(flux[:-lag], flux[lag:])[0, 1], bpm))
best.sort(reverse=True)
coarse = best[0][1]
if coarse < 100: coarse *= 2
fine = []
for bpm in np.arange(coarse - 3, coarse + 3, 0.01):
    p = 60 / bpm
    ph = np.arange(0, p, 0.005)
    sc = [comb(flux, p, q) for q in ph]
    i = int(np.argmax(sc)); fine.append((sc[i], bpm, ph[i]))
fine.sort(reverse=True)
_, bpm, phase = fine[0]
beat = 60 / bpm
# check the drift: phase fitted on each quarter of the song
drift = []
for a, b in [(0, .25), (.25, .5), (.5, .75), (.75, 1)]:
    t0, t1 = a * dur, b * dur
    ph = np.arange(0, beat, 0.005)
    sc = [np.interp(np.arange(t0 + ((q - t0) % beat), t1, beat), T, flux).mean() for q in ph]
    drift.append(round(float(ph[int(np.argmax(sc))]), 3))

beats = np.arange(phase, dur, beat)
# which of the four beats starts the bar: the kick is strongest on 1 (and 3); sections change on 1
bk = np.interp(beats, T, bflux)
on = [bk[k::4].mean() for k in range(4)]
first = int(np.argmax(on))
# prefer the one of (k, k+2) where the level changes most across the bar line
def change_at(k):
    idx = np.arange(k, len(beats) - 1, 4)
    e = np.interp(beats, T, db(bands['all']))
    return np.abs(e[idx] - e[idx - 1]).mean() if len(idx) else 0
cand = [first, (first + 2) % 4]
first = max(cand, key=change_at)
bar0 = beats[first] - 4 * beat * np.floor(beats[first] / (4 * beat))
bars = np.arange(bar0, dur, 4 * beat)

def avg_db(sig, t0, t1):
    k = (T >= t0) & (T < t1)
    return float(db(sig[k].mean())) if k.any() else -100.0

rows = []
for i, t0 in enumerate(bars):
    t1 = t0 + 4 * beat
    r = {'bar': i, 't': round(float(t0), 3)}
    for name, sig in bands.items():
        r[name] = round(avg_db(sig, t0, t1), 1)
    r['centre'] = round(avg_db(vocal_c, t0, t1) - avg_db(vocal_s, t0, t1), 1)
    rows.append(r)

# section boundaries: a bar that differs from the four before it in its band profile
feat = np.array([[r['all'], r['bass'], r['lowmid'], r['mid'], r['high'], r['centre']] for r in rows])
nov = np.zeros(len(rows))
for i in range(2, len(rows) - 1):
    a = feat[max(0, i - 4):i].mean(0); b = feat[i:i + 2].mean(0)
    nov[i] = np.abs(a - b).sum()
thr = np.median(nov) + 1.2 * nov.std()
cuts = [i for i in range(1, len(rows) - 1) if nov[i] > thr and nov[i] >= nov[i - 1] and nov[i] >= nov[i + 1]]

# jumps on the beat grid: level per beat, and the change from one beat to the next
per_beat = []
for t0 in beats:
    per_beat.append({k: avg_db(v, t0 - 0.05, t0 + beat - 0.05) for k, v in bands.items()})
jumps = []
for i in range(1, len(beats)):
    a, b = per_beat[i - 1], per_beat[i]
    d = b['all'] - a['all']; dbass = b['bass'] - a['bass']
    if abs(d) >= 5 or abs(dbass) >= 9:
        kind = 'rise' if d > 0 or dbass > 0 else 'drop'
        jumps.append({'t': round(float(beats[i]), 3), 'beat': i, 'kind': kind,
                      'all': round(d, 1), 'bass': round(dbass, 1)})
# the strongest single hits (onsets far above their neighbourhood)
w = int(2 / dt)
loc = np.convolve(flux, np.ones(w) / w, mode='same')
ratio = flux / (loc + 1e-6)
pk = [i for i in range(1, len(flux) - 1) if flux[i] >= flux[i - 1] and flux[i] >= flux[i + 1]]
pk.sort(key=lambda i: -flux[i] * ratio[i])
hits, taken = [], []
for i in pk:
    if all(abs(T[i] - u) > 0.4 for u in taken):
        taken.append(T[i]); hits.append({'t': round(float(T[i]), 3), 'ratio': round(float(ratio[i]), 2),
                                         'off_grid': round(float((T[i] - phase + beat / 2) % beat - beat / 2), 3)})
    if len(hits) >= 40: break
hits.sort(key=lambda h: h['t'])

res = {'duration': round(dur, 3), 'bpm': round(float(bpm), 2), 'beat': round(float(beat), 5),
       'phase': round(float(phase), 3), 'phase_by_quarter': drift, 'bar0': round(float(bar0), 3),
       'first_beat_of_bar': first, 'bars': rows, 'section_cuts': [rows[i]['t'] for i in cuts],
       'section_cut_bars': cuts, 'jumps': jumps, 'hits': hits}

print('length %.2f s · tempo %.2f BPM (beat %.4f s) · grid phase %.3f s · per quarter %s'
      % (dur, bpm, beat, phase, drift))
print('bar 0 at %.3f s (beat %d of the grid is the first of the bar) · %d bars' % (bar0, first, len(rows)))
print('\nbar  time    all  bass lowm  mid high centre')
for i, r in enumerate(rows):
    mark = '  <== section' if i in cuts else ''
    print('%3d %6.2f %6.1f %5.1f %5.1f %5.1f %5.1f %5.1f%s' % (r['bar'], r['t'], r['all'], r['bass'], r['lowmid'], r['mid'], r['high'], r['centre'], mark))
print('\njumps between beats (>= 5 dB overall or >= 9 dB of bass):')
for j in jumps:
    print('  %7.3f s  beat %3d  %-4s  all %+5.1f  bass %+5.1f' % (j['t'], j['beat'], j['kind'], j['all'], j['bass']))
print('\nstrongest hits:')
print('  ' + '  '.join('%.2f(%+.2f)' % (h['t'], h['off_grid']) for h in hits))
if out:
    json.dump(res, open(out, 'w'), indent=1)
    print('\nwrote', out)
