// Stream-power erosion for the atlas style: carves a heightfield into the sharp ridges and
// branching valleys of real mountains (Braun & Willett 2013, the «FastScape» scheme), so a
// soft or made-up surface reads like a surveyed one under the relief shading.
//
//   const r = AtlasErode.erode({ w, h, height, uplift, base, iters: 120 })  → { z, area }
//
// Every step: a priority flood from the base level (the sea, a plain, the map's edge) gives
// each cell its receiver (where its water goes) and an order from the outlets upward, filling
// pits on the way; the drainage area is summed down that tree; then each cell is lowered
// toward its receiver by the stream-power law, implicitly (stable at any step):
//   z_i ← (z_i + dt·U_i + F·z_r) / (1 + F),   F = dt·K·A_i^m / dist(i, r)
// Big rivers (large A) cut flat valleys, ridges (A ≈ 1) stay steep: the dendritic pattern
// comes out by itself. Deterministic: no randomness at all. Works in the browser and in node.
const AtlasErode = (() => {
    function erode(o) {
        const { w, h } = o, N = w * h;
        const z = Float32Array.from(o.height);
        const U = o.uplift ?? new Float32Array(N).fill(o.u ?? 0.001);
        const base = o.base ?? edges(w, h);
        const K = o.K ?? 0.001, m = o.m ?? 0.45, dt = o.dt ?? 20, iters = o.iters ?? 100, eps = o.eps ?? 1e-4;
        const diff = o.diffusion ?? 0;
        const rec = new Int32Array(N), order = new Int32Array(N), A = new Float32Array(N), dist = new Float32Array(N);
        const seen = new Uint8Array(N);
        const hk = new Float64Array(N + 1), hi = new Int32Array(N + 1);
        const DX = [-1, 0, 1, -1, 1, -1, 0, 1], DY = [-1, -1, -1, 0, 0, 1, 1, 1];
        const DD = DX.map((dx, k) => Math.hypot(dx, DY[k]));
        for (let it = 0; it < iters; it++) {
            // priority flood from the base level
            let size = 0, n = 0;
            seen.fill(0);
            const push = (i) => {
                let c = ++size; hk[c] = z[i]; hi[c] = i;
                while (c > 1 && hk[c >> 1] > hk[c]) { const p = c >> 1; [hk[c], hk[p]] = [hk[p], hk[c]]; [hi[c], hi[p]] = [hi[p], hi[c]]; c = p; }
            };
            const pop = () => {
                const top = hi[1];
                hk[1] = hk[size]; hi[1] = hi[size]; size--;
                let c = 1;
                for (;;) {
                    const l = c * 2, r = l + 1;
                    let s = c;
                    if (l <= size && hk[l] < hk[s]) s = l;
                    if (r <= size && hk[r] < hk[s]) s = r;
                    if (s === c) break;
                    [hk[c], hk[s]] = [hk[s], hk[c]]; [hi[c], hi[s]] = [hi[s], hi[c]]; c = s;
                }
                return top;
            };
            for (let i = 0; i < N; i++) if (base[i]) { seen[i] = 1; rec[i] = i; dist[i] = 1; push(i); }
            while (size) {
                const i = pop();
                order[n++] = i;
                const x = i % w, y = (i / w) | 0;
                for (let k = 0; k < 8; k++) {
                    const xx = x + DX[k], yy = y + DY[k];
                    if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
                    const j = yy * w + xx;
                    if (seen[j]) continue;
                    seen[j] = 1;
                    rec[j] = i;
                    dist[j] = DD[k];
                    if (z[j] <= z[i]) z[j] = z[i] + eps;          // fill a pit on the way
                    push(j);
                }
            }
            // drainage area, summed from the tips down
            A.fill(1);
            for (let k = n - 1; k >= 0; k--) { const i = order[k], r = rec[i]; if (r !== i) A[r] += A[i]; }
            // stream power, from the outlets up (each receiver is already updated)
            for (let k = 0; k < n; k++) {
                const i = order[k];
                if (base[i]) continue;
                const r = rec[i], F = (dt * K * Math.pow(A[i], m)) / dist[i];
                z[i] = (z[i] + dt * U[i] + F * z[r]) / (1 + F);
            }
            // a little hillslope creep rounds what is too sharp to stand
            if (diff > 0) {
                const t = Float32Array.from(z);
                for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
                    const i = y * w + x;
                    if (base[i]) continue;
                    z[i] = t[i] + diff * (t[i - 1] + t[i + 1] + t[i - w] + t[i + w] - 4 * t[i]);
                }
            }
            if (o.progress) o.progress(it, iters);
        }
        return { z, area: A, rec };
    }
    function edges(w, h) {
        const b = new Uint8Array(w * h);
        for (let x = 0; x < w; x++) { b[x] = 1; b[(h - 1) * w + x] = 1; }
        for (let y = 0; y < h; y++) { b[y * w] = 1; b[y * w + w - 1] = 1; }
        return b;
    }
    return { erode, edges };
})();
