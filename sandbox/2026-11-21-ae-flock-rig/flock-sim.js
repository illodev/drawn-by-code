// flock-sim.js · a deterministic 3D flock that follows a leader path.
//
// Plain ES3 on purpose (no let/const, arrows, forEach, JSON): the same file runs inside
// After Effects (ExtendScript, through Flock.jsx), in Node and in the drawn-by-code engine,
// so the engine preview and the After Effects bake are the same numbers.
//
//   var r = FlockSim.run({ leaderX: [...], leaderY: [...], fps: 24, count: 80, seed: 7 });
//   r.birds[i].x[f], .y[f], .z[f]       position per frame (comp px; z > 0 = farther away)
//   r.birds[i].rot[f]                   rotation in degrees (AE: clockwise, y down)
//   r.birds[i].sx[f], .sy[f]            scale in % (sx < 0 = mirrored to face the other way)
//   r.birds[i].ds[f]                    depth scale (1 = on the leader's plane)
//   r.birds[i].phase[f]                 flap phase in cycles, ever increasing
//   r.birds[i].size, .offset            per-bird randoms: size in [-1, 1], phase offset in [0, 1)
//   r.center.x[f], r.center.y[f]        centroid of the flock
//   r.order                             bird indices, nearest (on average) first = top layer
//
// leaderX/leaderY are the leader's comp-space position sampled once per frame from the
// first baked frame on; `frames` (default: all of them) is how many frames to bake, so the
// samples can run past the bake for `lead`, the time the flock aims ahead on the leader's
// path (0 = it trails the leader). Before the first frame the leader is extrapolated along
// its starting velocity, so after the pre-roll the flock is already formed and travelling.
var FlockSim = (function () {
    var TAU = Math.PI * 2;
    // Local aliases: a global lookup per call is the slow part of the inner loop in ExtendScript.
    var sqrt = Math.sqrt, floor = Math.floor, sin = Math.sin;

    // Park-Miller: exact in doubles, so ExtendScript, V8 and the browser agree bit for bit.
    function rng(seed) {
        var s = (floor(Math.abs(seed)) % 2147483646) + 1;
        return function () {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
        };
    }

    function clamp(v, a, b) {
        return v < a ? a : v > b ? b : v;
    }

    function num(v, d) {
        return typeof v === 'number' && !isNaN(v) ? v : d;
    }

    // Turbulence: a few travelling sine waves per axis with seeded directions. Smooth in
    // space and time, cheap (native Math.sin) and identical in every engine.
    function makeWaves(rand, lambdaMin, lambdaMax) {
        var axes = [], a, k, dx, dy, dz, len, lam, per;
        for (a = 0; a < 3; a++) {
            var w = [];
            for (k = 0; k < 4; k++) {
                dx = rand() * 2 - 1;
                dy = rand() * 2 - 1;
                dz = rand() * 2 - 1;
                len = sqrt(dx * dx + dy * dy + dz * dz) || 1;
                lam = lambdaMin + (lambdaMax - lambdaMin) * rand();
                per = 2 + 3 * rand();
                w.push({
                    kx: (dx / len) * (TAU / lam),
                    ky: (dy / len) * (TAU / lam),
                    kz: (dz / len) * (TAU / lam),
                    w: TAU / per,
                    ph: TAU * rand()
                });
            }
            axes.push(w);
        }
        return axes;
    }

    function wave(ws, x, y, z, t) {
        var s = 0, i, q;
        for (i = 0; i < ws.length; i++) {
            q = ws[i];
            s += sin(q.kx * x + q.ky * y + q.kz * z + q.w * t + q.ph);
        }
        return s * 0.5; // 4 waves → roughly [-1, 1] most of the time
    }

    function run(o) {
        var LX = o.leaderX, LY = o.leaderY;
        var FL = LX.length;                                      // leader samples (may run past the bake)
        if (!FL || LY.length !== FL) throw new Error('FlockSim: leaderX and leaderY need the same, non-zero length');
        var F = Math.min(FL, Math.max(1, Math.round(num(o.frames, FL))));   // frames to bake
        var fps = num(o.fps, 24);
        var lead = Math.max(0, num(o.lead, 0));                  // the flock aims this far ahead on the path (s)
        var N = Math.max(1, Math.round(num(o.count, 80)));
        var S = Math.max(2, num(o.spacing, 40));                // typical gap between neighbours (px)
        var follow = clamp(num(o.follow, 50), 0, 100) / 100;
        var turb = clamp(num(o.turbulence, 40), 0, 100) / 100;
        var glide = clamp(num(o.glide, 50), 0, 100) / 100;
        var preroll = Math.max(0, num(o.preroll, 3));
        var sub = Math.max(1, Math.round(num(o.substeps, 2)));
        var cycle = Math.max(1 / fps, num(o.cycle, 0.5));        // flap cycle of the bird (s)
        var faces = o.faces === -1 ? -1 : 1;                     // the bird is drawn facing right (1) or left (-1)
        var zUnit = S * Math.max(0.5, num(o.depthUnit, 5));      // this far behind = half size
        var rand = rng(num(o.seed, 1) * 7919 + 13);

        var dtF = 1 / fps, dt = dtF / sub;
        var f, i, j;

        // Leader velocity per frame (central differences), and its top speed.
        var LVX = [], LVY = [], vLmax = 0;
        for (f = 0; f < FL; f++) {
            var fa = f > 0 ? f - 1 : f, fb = f < FL - 1 ? f + 1 : f;
            var span = (fb - fa) * dtF || dtF;
            LVX[f] = fb === fa ? 0 : (LX[fb] - LX[fa]) / span;
            LVY[f] = fb === fa ? 0 : (LY[fb] - LY[fa]) / span;
            var sp = sqrt(LVX[f] * LVX[f] + LVY[f] * LVY[f]);
            if (sp > vLmax) vLmax = sp;
        }

        // Speeds scale with the leader (they have to keep up) and with the spacing (birds
        // never hover: a still leader makes them circle it).
        var cruise = Math.max(vLmax, S * 6);
        var vMax = cruise * 1.6, vMin = cruise * 0.4;
        var aMax = cruise * 3.2;
        var sepR = S, percR = S * 2.5, cell = percR, percR2 = percR * percR;
        var Tf = 6 * Math.pow(0.1, follow);                     // follow spring period: 6 s loose, 1.9 s at 50, 0.6 s tight
        var wf = TAU / Tf, kf = wf * wf, df = 0.6 * wf;
        var R = S * Math.pow(N, 1 / 3) * 0.9;                   // the flock's own radius (dead zone)
        var kSep = cruise * 10, tAli = 0.5, kCoh = 1.2;
        var kTurb = turb * cruise * 2.6;
        var waves = makeWaves(rand, S * 5, S * 14);
        var tauV = 0.12;                                         // orientation smoothing (s)
        var wMax = Math.PI;                                      // fastest turn: 180°/s

        function leaderAt(tau, out) {
            if (tau <= 0) {
                out[0] = LX[0] + LVX[0] * tau;
                out[1] = LY[0] + LVY[0] * tau;
                out[2] = LVX[0];
                out[3] = LVY[0];
                return;
            }
            var u = tau * fps, k = floor(u);
            if (k >= FL - 1) {
                out[0] = LX[FL - 1];
                out[1] = LY[FL - 1];
                out[2] = LVX[FL - 1];
                out[3] = LVY[FL - 1];
                return;
            }
            var w = u - k;
            out[0] = LX[k] + (LX[k + 1] - LX[k]) * w;
            out[1] = LY[k] + (LY[k + 1] - LY[k]) * w;
            out[2] = LVX[k] + (LVX[k + 1] - LVX[k]) * w;
            out[3] = LVY[k] + (LVY[k + 1] - LVY[k]) * w;
        }

        // State: flat arrays, fastest in ExtendScript.
        var px = [], py = [], pz = [], vx = [], vy = [], vz = [], sx = [], sy = [], sz = [];
        var L = [0, 0, 0, 0];
        var steps = Math.round(preroll * fps) * sub;
        var t0 = -steps * dt;
        leaderAt(t0, L);
        var r0 = S * Math.pow(N, 1 / 3) * 0.75;
        for (i = 0; i < N; i++) {
            // uniform in a ball
            var ux, uy, uz, uu;
            do {
                ux = rand() * 2 - 1;
                uy = rand() * 2 - 1;
                uz = rand() * 2 - 1;
                uu = ux * ux + uy * uy + uz * uz;
            } while (uu > 1);
            px[i] = L[0] + ux * r0;
            py[i] = L[1] + uy * r0;
            pz[i] = uz * r0;
            vx[i] = L[2] + (rand() * 2 - 1) * cruise * 0.3;
            vy[i] = L[3] + (rand() * 2 - 1) * cruise * 0.3;
            vz[i] = (rand() * 2 - 1) * cruise * 0.2;
            var s0 = sqrt(vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i]);
            if (s0 < vMin) {
                var ang = TAU * rand();
                vx[i] = Math.cos(ang) * vMin;
                vy[i] = Math.sin(ang) * vMin;
            }
            sx[i] = vx[i];
            sy[i] = vy[i];
            sz[i] = vz[i];
        }

        var ax = [], ay = [], az = [];
        var aSm = 1 - Math.exp(-dt / tauV);

        // Neighbour search: a dense grid over the flock's bounding box (at most 16 cells a
        // side) with linked lists per cell. Dense integer indices stay fast in ExtendScript,
        // where hashed keys get converted to strings on every lookup.
        var next = [], cellOf = [], head = [];
        function step(t) {
            leaderAt(t + lead, L);
            var mnx = px[0], mny = py[0], mnz = pz[0], mxx = mnx, mxy = mny, mxz = mnz;
            for (i = 1; i < N; i++) {
                if (px[i] < mnx) mnx = px[i];
                else if (px[i] > mxx) mxx = px[i];
                if (py[i] < mny) mny = py[i];
                else if (py[i] > mxy) mxy = py[i];
                if (pz[i] < mnz) mnz = pz[i];
                else if (pz[i] > mxz) mxz = pz[i];
            }
            var ext = Math.max(mxx - mnx, mxy - mny, mxz - mnz);
            var cs = Math.max(cell, ext / 15.5);
            var nx = floor((mxx - mnx) / cs) + 1, ny = floor((mxy - mny) / cs) + 1, nz = floor((mxz - mnz) / cs) + 1;
            var nxy = nx * ny, nc = nxy * nz, c, gx, gy, gz, ci, cj, ck;
            for (c = 0; c < nc; c++) head[c] = -1;
            for (i = 0; i < N; i++) {
                c = floor((px[i] - mnx) / cs) + floor((py[i] - mny) / cs) * nx + floor((pz[i] - mnz) / cs) * nxy;
                cellOf[i] = c;
                next[i] = head[c];
                head[c] = i;
            }
            for (i = 0; i < N; i++) {
                var xi = px[i], yi = py[i], zi = pz[i];
                c = cellOf[i];
                gz = floor(c / nxy);
                gy = floor((c - gz * nxy) / nx);
                gx = c - gz * nxy - gy * nx;
                var sepX = 0, sepY = 0, sepZ = 0, aliX = 0, aliY = 0, aliZ = 0, cohX = 0, cohY = 0, cohZ = 0, wsum = 0;
                for (ck = gz > 0 ? gz - 1 : 0; ck <= gz + 1 && ck < nz; ck++) {
                    for (cj = gy > 0 ? gy - 1 : 0; cj <= gy + 1 && cj < ny; cj++) {
                        for (ci = gx > 0 ? gx - 1 : 0; ci <= gx + 1 && ci < nx; ci++) {
                            for (j = head[ci + cj * nx + ck * nxy]; j !== -1; j = next[j]) {
                                if (j === i) continue;
                                var dx = xi - px[j], dy = yi - py[j], dz = zi - pz[j];
                                var d2 = dx * dx + dy * dy + dz * dz;
                                if (d2 >= percR2) continue;
                                var d = sqrt(d2) || 0.001;
                                var w = 1 - d / percR;
                                aliX += vx[j] * w;
                                aliY += vy[j] * w;
                                aliZ += vz[j] * w;
                                cohX += px[j] * w;
                                cohY += py[j] * w;
                                cohZ += pz[j] * w;
                                wsum += w;
                                if (d < sepR) {
                                    var q = (1 - d / sepR) / d;
                                    sepX += dx * q;
                                    sepY += dy * q;
                                    sepZ += dz * q;
                                }
                            }
                        }
                    }
                }
                // follow: a damped spring to the leader (z = 0 is the leader's plane) with a
                // soft dead zone the size of the flock, so a tight follow pulls the flock along
                // without squeezing it into a ball
                var ex = L[0] - xi, ey = L[1] - yi, ez = 0 - zi;
                var ed = sqrt(ex * ex + ey * ey + ez * ez) || 0.001;
                var ek = ed > R ? (kf * (ed - R + R * 0.1)) / ed : kf * 0.1;
                var fx = ex * ek + (L[2] - vx[i]) * df;
                var fy = ey * ek + (L[3] - vy[i]) * df;
                var fz = ez * ek + (0 - vz[i]) * df;
                var mx = fx + sepX * kSep, my = fy + sepY * kSep, mz = fz + sepZ * kSep;
                if (wsum > 0) {
                    mx += (aliX / wsum - vx[i]) / tAli + (cohX / wsum - xi) * kCoh;
                    my += (aliY / wsum - vy[i]) / tAli + (cohY / wsum - yi) * kCoh;
                    mz += (aliZ / wsum - vz[i]) / tAli + (cohZ / wsum - zi) * kCoh;
                }
                if (kTurb > 0) {
                    mx += kTurb * wave(waves[0], xi, yi, zi, t);
                    my += kTurb * wave(waves[1], xi, yi, zi, t);
                    mz += kTurb * wave(waves[2], xi, yi, zi, t);
                }
                var am = sqrt(mx * mx + my * my + mz * mz);
                if (am > aMax) {
                    mx *= aMax / am;
                    my *= aMax / am;
                    mz *= aMax / am;
                }
                ax[i] = mx;
                ay[i] = my;
                az[i] = mz;
            }
            for (i = 0; i < N; i++) {
                // a bird cannot turn on the spot: the sideways part of the acceleration is
                // capped at speed × wMax (a minimum turn radius), the rest changes its speed
                var v2 = vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i] || 1e-6;
                var par = (ax[i] * vx[i] + ay[i] * vy[i] + az[i] * vz[i]) / v2;
                var lx = ax[i] - par * vx[i], ly = ay[i] - par * vy[i], lz = az[i] - par * vz[i];
                var lm = sqrt(lx * lx + ly * ly + lz * lz), lcap = sqrt(v2) * wMax;
                if (lm > lcap) {
                    ax[i] = par * vx[i] + (lx * lcap) / lm;
                    ay[i] = par * vy[i] + (ly * lcap) / lm;
                    az[i] = par * vz[i] + (lz * lcap) / lm;
                }
                var nvx = vx[i] + ax[i] * dt, nvy = vy[i] + ay[i] * dt, nvz = vz[i] + az[i] * dt;
                var s = sqrt(nvx * nvx + nvy * nvy + nvz * nvz) || 0.001;
                var cl = s > vMax ? vMax / s : s < vMin ? vMin / s : 1;
                vx[i] = nvx * cl;
                vy[i] = nvy * cl;
                vz[i] = nvz * cl;
                px[i] += vx[i] * dt;
                py[i] += vy[i] * dt;
                pz[i] += vz[i] * dt;
                sx[i] += (vx[i] - sx[i]) * aSm;
                sy[i] += (vy[i] - sy[i]) * aSm;
                sz[i] += (vz[i] - sz[i]) * aSm;
            }
        }

        var birds = [];
        for (i = 0; i < N; i++) {
            birds.push({ x: [], y: [], z: [], vx: [], vy: [], vz: [], size: rand() * 2 - 1, offset: rand(), rate: 1 + 0.12 * (rand() * 2 - 1) });
        }
        function record(f) {
            for (i = 0; i < N; i++) {
                var b = birds[i];
                b.x[f] = px[i];
                b.y[f] = py[i];
                b.z[f] = pz[i];
                b.vx[f] = sx[i];
                b.vy[f] = sy[i];
                b.vz[f] = sz[i];
            }
        }

        var st, t = t0;
        for (st = 0; st < steps; st++) {
            step(t);
            t += dt;
        }
        record(0);
        for (f = 1; f < F; f++) {
            for (st = 0; st < sub; st++) {
                step(t);
                t += dt;
            }
            record(f);
            if (o.progress && f % 10 === 0) o.progress(f / F);
        }

        // Orientation, facing, depth scale and flap phase, from the smoothed velocities.
        var flipRate = 2 / 0.3;                                 // a full turn-around (-1 → 1) takes 0.3 s
        var maxTurn = 240;                                      // pitch: at most 240°/s (10° a frame at 24 fps)
        var cx = [], cy = [];
        for (f = 0; f < F; f++) {
            cx[f] = 0;
            cy[f] = 0;
        }
        for (i = 0; i < N; i++) {
            var B = birds[i];
            B.rot = [];
            B.sx = [];
            B.sy = [];
            B.ds = [];
            B.phase = [];
            var face = B.vx[0] < 0 ? -1 : 1, target = face, ph = B.offset, pitch = 0;
            for (f = 0; f < F; f++) {
                var hx = B.vx[f], hy = B.vy[f], hz = B.vz[f];
                var hxy = sqrt(hx * hx + hy * hy);
                var h3 = sqrt(hx * hx + hy * hy + hz * hz) || 1;
                if (hxy > 1e-6) {
                    var h = hx / hxy;
                    if (h > 0.25) target = 1;
                    else if (h < -0.25) target = -1;
                }
                if (f > 0) {
                    if (face < target) face = Math.min(target, face + flipRate * dtF);
                    else if (face > target) face = Math.max(target, face - flipRate * dtF);
                }
                // Pitch follows the screen-space heading, trusted less when the bird flies
                // mostly toward or away from the camera, and never faster than maxTurn.
                var pt = (Math.atan2(hy, Math.abs(hx)) * 180) / Math.PI;
                if (f === 0) pitch = pt;
                else {
                    var dp = (pt - pitch) * clamp((2 * hxy) / h3, 0, 1);
                    pitch += clamp(dp, -maxTurn * dtF, maxTurn * dtF);
                }
                var dsc = clamp(Math.pow(2, -B.z[f] / zUnit), 0.25, 4);
                B.rot[f] = face * pitch;
                B.ds[f] = dsc;
                B.sy[f] = 100 * dsc;
                B.sx[f] = 100 * dsc * face * faces;
                // flap: faster climbing, slower (gliding) diving
                var climb = -hy / h3;
                var mod = climb > 0 ? 1 + 0.5 * glide * climb : 1 - 0.75 * glide * -climb;
                if (f > 0) ph += (B.rate * mod * dtF) / cycle;
                B.phase[f] = ph;
                cx[f] += B.x[f] / N;
                cy[f] += B.y[f] / N;
            }
        }
        // Layer order for a 2D comp, which never re-sorts: nearest on average first (on top).
        var order = [], meanZ = [];
        for (i = 0; i < N; i++) {
            var zs = 0;
            for (f = 0; f < F; f++) zs += birds[i].z[f];
            meanZ[i] = zs / F;
            order.push(i);
        }
        order.sort(function (a, b) {
            return meanZ[a] - meanZ[b] || a - b;
        });
        return {
            frames: F,
            fps: fps,
            birds: birds,
            order: order,
            center: { x: cx, y: cy },
            stats: { cruise: cruise, vMin: vMin, vMax: vMax, leaderMax: vLmax, steps: steps + (F - 1) * sub }
        };
    }

    return { run: run, rng: rng, version: 1 };
})();
