// flock-sim.js · a deterministic 3D flock that follows a leader path.
//
// Plain ES3 on purpose (no let/const, arrows, forEach, JSON): the same file runs inside
// After Effects (ExtendScript, through Flock.jsx), in Node and in the drawn-by-code engine,
// so the engine preview and the After Effects bake are the same numbers.
//
//   var r = FlockSim.run({ leaderX: [...], leaderY: [...], fps: 24, count: 80, seed: 7 });
//   r.birds[i].x[f], .y[f], .z[f]       position per frame (comp px; z > 0 = farther away)
//   r.birds[i].rot[f]                   rotation in degrees (AE: clockwise, y down)
//   r.birds[i].face[f]                  -1 … 1: horizontal scale factor (< 0 mirrored; through 0
//                                       while turning around level)
//   r.birds[i].up[f]                    1 | -1: vertical scale sign (-1 = upside down, the other
//                                       of two equivalent poses, chosen so rotation stays smooth)
//   r.birds[i].sx[f], .sy[f]            the resulting scale in %, depth included
//   r.birds[i].ds[f]                    depth scale (1 = on the leader's plane)
//   r.birds[i].phase[f]                 flap phase in cycles, ever increasing
//   r.birds[i].size, .offset            per-bird randoms: size in [-1, 1], phase offset in [0, 1)
//   r.center.x[f], r.center.y[f]        centroid of the flock
//   r.center.radius[f], .heading[f]     its RMS size (px) and axis of travel (degrees; period 180)
//   r.center.radiusRef                  its typical (median) RMS size (px)
//   r.center.radiusSum[f]               running sum (∫ dt) of its RMS size
//   r.center.axisX[f], .axisY[f]        running sums (∫ dt) of its axis of travel as a doubled-angle
//                                       vector (cos 2h, sin 2h), shortened when it barely moves
//   r.birds[i].sumX[f], .sumY[f]        running sums (∫ dt) of the bird's offset from the centre
//                                       (the live shape controls average both over a window)
//   r.order                             bird indices, nearest (on average) first = top layer
//
// leaderX/leaderY are the leader's comp-space position sampled once per frame from the
// first baked frame on; `frames` (default: all of them) is how many frames to bake. One shared
// force steers the flock's centre to a point on the leader's own path, `place` behind it:
// place 100 (default) = the leader flies at the front of the flock, 0 = in its middle,
// negative = behind it (in % of the flock's radius). `lead` (s, default 0) shifts that point
// further ahead in time; samples must then run past the bake by that much. Before the first
// frame the leader is extrapolated along its starting velocity, so after the pre-roll the
// flock is already formed and travelling.
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
        return v < a ? a : (v > b ? b : v);
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

    // The leader from its samples: position and velocity at any time (extrapolated before the
    // first sample along its starting velocity, held after the last), the distance it has
    // travelled along its path, and when it had travelled a given distance.
    function makeLeader(LX, LY, fps) {
        var FL = LX.length, dtF = 1 / fps, f, VX = [], VY = [], ARC = [0], vmax = 0;
        for (f = 0; f < FL; f++) {
            var fa = f > 0 ? f - 1 : f, fb = f < FL - 1 ? f + 1 : f;
            VX[f] = fb === fa ? 0 : (LX[fb] - LX[fa]) / ((fb - fa) * dtF);
            VY[f] = fb === fa ? 0 : (LY[fb] - LY[fa]) / ((fb - fa) * dtF);
            var sp = sqrt(VX[f] * VX[f] + VY[f] * VY[f]);
            if (sp > vmax) vmax = sp;
            if (f > 0) ARC[f] = ARC[f - 1] + sqrt((LX[f] - LX[f - 1]) * (LX[f] - LX[f - 1]) + (LY[f] - LY[f - 1]) * (LY[f] - LY[f - 1]));
        }
        var v0 = sqrt(VX[0] * VX[0] + VY[0] * VY[0]), tEnd = (FL - 1) * dtF;
        function at(tau, out) {
            if (tau <= 0) {
                out[0] = LX[0] + VX[0] * tau;
                out[1] = LY[0] + VY[0] * tau;
                out[2] = VX[0];
                out[3] = VY[0];
                return;
            }
            var u = tau * fps, k = floor(u);
            if (k >= FL - 1) {
                out[0] = LX[FL - 1];
                out[1] = LY[FL - 1];
                out[2] = VX[FL - 1];
                out[3] = VY[FL - 1];
                return;
            }
            var w = u - k;
            out[0] = LX[k] + (LX[k + 1] - LX[k]) * w;
            out[1] = LY[k] + (LY[k + 1] - LY[k]) * w;
            out[2] = VX[k] + (VX[k + 1] - VX[k]) * w;
            out[3] = VY[k] + (VY[k + 1] - VY[k]) * w;
        }
        function arcAt(tau) {
            if (tau <= 0) return v0 * tau;
            var u = tau * fps, k = floor(u);
            if (k >= FL - 1) return ARC[FL - 1];
            return ARC[k] + (ARC[k + 1] - ARC[k]) * (u - k);
        }
        // the first time the leader had travelled distance a (the path's arc length only grows).
        // The simulation asks for ever later times, so the search walks on from where it last
        // stopped: one or two steps, where bisecting cost 32 (in After Effects' slow expression
        // engine the preview's guess went from ~25 to ~110 ms a frame).
        var hint = 0;
        function timeAtArc(a) {
            if (a <= 0) return v0 > 1e-6 ? a / v0 : 0;
            if (a >= ARC[FL - 1]) return tEnd;
            while (hint > 0 && ARC[hint] >= a) hint--;
            while (hint < FL - 2 && ARC[hint + 1] < a) hint++;
            // ARC[hint] < a <= ARC[hint + 1]: the segment where it happened
            var seg = ARC[hint + 1] - ARC[hint];
            return (hint + (seg > 0 ? (a - ARC[hint]) / seg : 0)) * dtF;
        }
        return { at: at, arcAt: arcAt, timeAtArc: timeAtArc, vmax: vmax };
    }

    // How far behind the leader, along its path, the flock's centre is steered (px): place in %
    // of the flock's typical RMS radius, about 0.6 of R = S * N^(1/3) * 0.9.
    function behindOf(place, S, N) {
        return (place / 100) * 0.6 * S * Math.pow(N, 1 / 3) * 0.9;
    }

    // The point the flock's centre is steered to at time t: on the leader's path, `behind` px
    // back from where the leader is at t + lead (out: x, y, vx, vy).
    function targetAt(LD, t, lead, behind, out) {
        var tn = t + lead;
        LD.at(behind !== 0 ? LD.timeAtArc(LD.arcAt(tn) - behind) : tn, out);
    }

    function run(o) {
        var LX = o.leaderX, LY = o.leaderY;
        var FL = LX.length;                                      // leader samples (may run past the bake)
        if (!FL || LY.length !== FL) throw new Error('FlockSim: leaderX and leaderY need the same, non-zero length');
        var F = Math.min(FL, Math.max(1, Math.round(num(o.frames, FL))));   // frames to bake
        var fps = num(o.fps, 24);
        var lead = Math.max(0, num(o.lead, 0));                  // the target this far ahead in time (s)
        var place = clamp(num(o.place, 100), -300, 300);         // the leader in the flock: 100 front, 0 middle
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

        // The leader (velocity by central differences, its top speed, its path's length).
        var LD = makeLeader(LX, LY, fps), vLmax = LD.vmax;

        // Speeds scale with the leader (they have to keep up) and with the spacing (birds
        // never hover: a still leader makes them circle it).
        var cruise = Math.max(vLmax, S * 6);
        var vMax = cruise * 1.6, vMin = cruise * 0.4;
        var band = clamp(num(o.speedBand, 0.12), 0, 1);           // ± share of the flock's mean speed
        var aMax = cruise * 3.2;
        var sepR = S, percR = S * 2.5, cell = percR, percR2 = percR * percR;
        var Tf = 6 * Math.pow(0.1, follow);                     // follow spring period: 6 s loose, 1.9 s at 50, 0.6 s tight
        var wf = TAU / Tf, kf = wf * wf, df = 0.6 * wf;
        var R = S * Math.pow(N, 1 / 3) * 0.9;                   // the flock's own radius (dead zone)
        var behind = behindOf(place, S, N);
        var kSep = cruise * 10, tAli = 0.5, kCoh = 1.2;
        var kTurb = turb * cruise * 2.6;
        var waves = makeWaves(rand, S * 5, S * 14);
        var tauV = 0.12;                                         // orientation smoothing (s)
        var wMax = Math.PI;                                      // fastest turn: 180°/s

        // State: flat arrays, fastest in ExtendScript.
        var px = [], py = [], pz = [], vx = [], vy = [], vz = [], sx = [], sy = [], sz = [];
        var L = [0, 0, 0, 0];
        var steps = Math.round(preroll * fps) * sub;
        var t0 = -steps * dt;
        targetAt(LD, t0, lead, behind, L);                       // the flock starts around its target
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
        var CX, CY, CZ;
        function step(t) {
            targetAt(LD, t, lead, behind, L);
            // birds of a flock fly at nearly the same speed: this step's band around the
            // flock's mean speed (a turning flock then turns on parallel paths, like real
            // ones, instead of spinning with its outer birds racing round); and the flock's
            // centre, which the follow force steers
            var mS = 0;
            CX = 0;
            CY = 0;
            CZ = 0;
            for (i = 0; i < N; i++) {
                mS += sqrt(vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i]);
                CX += px[i];
                CY += py[i];
                CZ += pz[i];
            }
            mS /= N;
            CX /= N;
            CY /= N;
            CZ /= N;
            var lo = Math.max(vMin, mS * (1 - band)), hi = Math.min(vMax, mS * (1 + band));
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
                // follow: one spring, the same for every bird, steers the flock's centre to the
                // target on the leader's path (z = 0 is the leader's plane), so the leader sits
                // where `place` says (pulling each bird to the leader instead left that to chance:
                // round 9 measured the leader behind the flock 56-100 % of the time). Each bird
                // is held to the centre with a soft dead zone the size of the flock (no squeezing
                // into a ball) and matches the target's velocity.
                var cx0 = CX - xi, cy0 = CY - yi, cz0 = CZ - zi;
                var cd = sqrt(cx0 * cx0 + cy0 * cy0 + cz0 * cz0) || 0.001;
                var ck = cd > R ? (kf * (cd - R + R * 0.1)) / cd : kf * 0.1;
                var fx = (L[0] - CX) * kf + cx0 * ck + (L[2] - vx[i]) * df;
                var fy = (L[1] - CY) * kf + cy0 * ck + (L[3] - vy[i]) * df;
                var fz = (0 - CZ) * kf + cz0 * ck + (0 - vz[i]) * df;
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
                var cl = s > hi ? hi / s : (s < lo ? lo / s : 1);
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
            birds.push({
                x: [], y: [], z: [], vx: [], vy: [], vz: [],
                size: rand() * 2 - 1, offset: rand(), rate: 1 + 0.12 * (rand() * 2 - 1),
                // turn-arounds differ per bird (0.3-0.5 s, triggered at 15-35 % of sideways
                // speed), so a flock that reverses never goes edge-on all in the same frame
                flip: 0.3 + 0.2 * rand(), hyst: 0.15 + 0.2 * rand()
            });
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
        var maxTurn = 240;                                      // pitch: at most 240°/s (10° a frame at 24 fps)
        var cx = [], cy = [];
        for (f = 0; f < F; f++) {
            cx[f] = 0;
            cy[f] = 0;
        }
        for (i = 0; i < N; i++) {
            var B = birds[i];
            B.rot = [];
            B.face = [];
            B.up = [];
            B.sx = [];
            B.sy = [];
            B.ds = [];
            B.phase = [];
            var flipRate = 2 / B.flip;                          // a full turn-around (-1 → 1) in B.flip s
            var face = B.vx[0] < 0 ? -1 : 1, target = face, ph = B.offset, pitch = 0;
            var rot = 0, side = 1;                              // side: which of the two equivalent poses
            for (f = 0; f < F; f++) {
                var hx = B.vx[f], hy = B.vy[f], hz = B.vz[f];
                var hxy = sqrt(hx * hx + hy * hy);
                var h3 = sqrt(hx * hx + hy * hy + hz * hz) || 1;
                // Pitch follows the screen-space heading, trusted less when the bird flies
                // mostly toward or away from the camera, and never faster than maxTurn.
                var pt = (Math.atan2(hy, Math.abs(hx)) * 180) / Math.PI;
                if (f === 0) pitch = pt;
                else {
                    var dp = (pt - pitch) * clamp((2 * hxy) / h3, 0, 1);
                    pitch += clamp(dp, -maxTurn * dtF, maxTurn * dtF);
                }
                // Which way it should face. Steep, it flips as its heading crosses vertical
                // (a small margin against flicker), so the flip never jumps the rotation;
                // level, it waits until 15-35 % of its speed is sideways (per bird).
                if (hxy > 1e-6) {
                    var h = hx / hxy, hy0 = Math.abs(pitch) > 55 ? 0.05 : B.hyst;
                    if (h > hy0) target = 1;
                    else if (h < -hy0) target = -1;
                }
                // Turning around. Pointing up or down (|pitch| > 55°), mirroring only swaps
                // which side the wings are on: it happens at once. Level turns, towards or
                // away from the camera, squash through the turn (where the Turn Width floor
                // and the head-on drawing come in), faster the steeper the bird. (Round 1
                // squashed every flip: a flock diving through vertical went edge-on together,
                // 38 % of the birds in one frame.)
                if (f > 0) {
                    // instant only from a settled pose: a squash already under way finishes
                    // (faster when steep), or snapping mid-way would jump the rotation
                    if (Math.abs(pitch) > 55 && Math.abs(face) === 1) face = target;
                    else {
                        var rate = flipRate / Math.max(0.12, Math.cos((pitch * Math.PI) / 180));
                        if (face < target) face = Math.min(target, face + rate * dtF);
                        else if (face > target) face = Math.max(target, face - rate * dtF);
                    }
                }
                // Two poses draw the same bird: (rotation r, mirrored by face) and (r + 180°,
                // mirrored by -face, upside down). Keep the one whose rotation is closest to
                // the last frame's, so an instant flip never spins the layer (AE interpolates
                // rotation between keys, and motion blur would smear the spin).
                var rN = face * pitch;
                if (f === 0) {
                    rot = rN;
                    side = 1;
                } else {
                    var ra = rN, rb = rN + 180;
                    while (ra - rot > 180) ra -= 360;
                    while (ra - rot < -180) ra += 360;
                    while (rb - rot > 180) rb -= 360;
                    while (rb - rot < -180) rb += 360;
                    var keep = side === 1 ? ra : rb, other = side === 1 ? rb : ra, prev = rot;
                    if (Math.abs(other - rot) + 1 < Math.abs(keep - rot)) {
                        side = -side;
                        rot = other;
                    } else rot = keep;
                    // and never faster than 600°/s (25° a frame at 24 fps): when a flip
                    // catches up with a heading the pitch filter was lagging, it turns
                    // over a few frames instead of snapping
                    rot = prev + clamp(rot - prev, -600 * dtF, 600 * dtF);
                }
                var dsc = clamp(Math.pow(2, -B.z[f] / zUnit), 0.25, 4);
                B.rot[f] = rot;
                B.face[f] = face * side;                        // signed width: < 0 = mirrored
                B.up[f] = side;                                 // -1 = drawn upside down (back flipped)
                B.ds[f] = dsc;
                B.sy[f] = 100 * dsc * side;
                B.sx[f] = 100 * dsc * face * side * faces;
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

        // For the live shape controls: the flock's size (RMS distance from the centroid, on
        // screen) and its heading (the axis of the centroid's travel, smoothed both ways over
        // ~0.4 s).
        var rad = [], hd = [], hvx = [], hvy = [];
        for (f = 0; f < F; f++) {
            var s2 = 0;
            for (i = 0; i < N; i++) {
                var ddx = birds[i].x[f] - cx[f], ddy = birds[i].y[f] - cy[f];
                s2 += ddx * ddx + ddy * ddy;
            }
            rad[f] = sqrt(s2 / N);
            var fa2 = f > 0 ? f - 1 : f, fb2 = f < F - 1 ? f + 1 : f;
            hvx[f] = fb2 === fa2 ? 0 : (cx[fb2] - cx[fa2]) / ((fb2 - fa2) * dtF);
            hvy[f] = fb2 === fa2 ? 0 : (cy[fb2] - cy[fa2]) / ((fb2 - fa2) * dtF);
        }
        var aH = 1 - Math.exp(-dtF / 0.4);
        for (f = 1; f < F; f++) {
            hvx[f] += (hvx[f - 1] - hvx[f]) * (1 - aH);
            hvy[f] += (hvy[f - 1] - hvy[f]) * (1 - aH);
        }
        for (f = F - 2; f >= 0; f--) {
            hvx[f] += (hvx[f + 1] - hvx[f]) * (1 - aH);
            hvy[f] += (hvy[f + 1] - hvy[f]) * (1 - aH);
        }
        // The shape controls stretch along an axis, and an axis has no front: a flock that
        // reverses keeps its axis. So the heading is unwrapped with a period of 180°, trusted
        // in proportion to the flock's speed, and turns at most 240°/s.
        var prevA = null;
        for (f = 0; f < F; f++) {
            var hs = sqrt(hvx[f] * hvx[f] + hvy[f] * hvy[f]);
            var ang = (Math.atan2(hvy[f], hvx[f]) * 180) / Math.PI;
            if (prevA === null) prevA = ang;
            else {
                var dA = ang - prevA;
                while (dA > 90) dA -= 180;
                while (dA < -90) dA += 180;
                dA *= clamp(hs / (0.3 * cruise), 0, 1);
                prevA += clamp(dA, -240 * dtF, 240 * dtF);
            }
            hd[f] = prevA;
        }
        // Running sums (trapezoids), so an expression gets the mean over any window from two
        // samples: the axis of travel as a doubled-angle vector (an axis has no front),
        // trusted like the heading; the flock's radius; and each bird's offset from the centre.
        var axX = [0], axY = [0], rSum = [0], ux0 = 0, uy0 = 0;
        for (f = 0; f < F; f++) {
            var tr = clamp(sqrt(hvx[f] * hvx[f] + hvy[f] * hvy[f]) / (0.3 * cruise), 0, 1);
            var h2 = 2 * Math.atan2(hvy[f], hvx[f]);
            var ux = tr * Math.cos(h2), uy = tr * Math.sin(h2);
            if (f > 0) {
                axX[f] = axX[f - 1] + ((ux0 + ux) / 2) * dtF;
                axY[f] = axY[f - 1] + ((uy0 + uy) / 2) * dtF;
                rSum[f] = rSum[f - 1] + ((rad[f - 1] + rad[f]) / 2) * dtF;
            }
            ux0 = ux;
            uy0 = uy;
        }
        for (i = 0; i < N; i++) {
            var Bs = birds[i], ox0 = 0, oy0 = 0;
            Bs.sumX = [0];
            Bs.sumY = [0];
            for (f = 0; f < F; f++) {
                var ox = Bs.x[f] - cx[f], oy = Bs.y[f] - cy[f];
                if (f > 0) {
                    Bs.sumX[f] = Bs.sumX[f - 1] + ((ox0 + ox) / 2) * dtF;
                    Bs.sumY[f] = Bs.sumY[f - 1] + ((oy0 + oy) / 2) * dtF;
                }
                ox0 = ox;
                oy0 = oy;
            }
        }
        var rs = rad.slice(0);
        rs.sort(function (a, b) {
            return a - b;
        });
        return {
            frames: F,
            fps: fps,
            birds: birds,
            order: order,
            center: { x: cx, y: cy, radius: rad, heading: hd, radiusRef: rs[floor(F / 2)], radiusSum: rSum, axisX: axX, axisY: axY },
            stats: { cruise: cruise, vMin: vMin, vMax: vMax, leaderMax: vLmax, steps: steps + (F - 1) * sub }
        };
    }

    // A rough guess at where the flock's centre goes, cheap enough for an expression (After
    // Effects' expressions run plain loops ~300x slower than V8: the full simulation took 5-47 s
    // a frame there). One "average bird" under the flock's shared follow spring (the centre's
    // own force: the pulls holding birds to the centre cancel out on average), the same seeded
    // turbulence and the speed and turn limits, no neighbours, on the leader's plane. Returns
    // { x: [], y: [] } per frame and the cruise speed.
    function guess(o) {
        var LX = o.leaderX, LY = o.leaderY, FL = LX.length;
        var F = Math.min(FL, Math.max(1, Math.round(num(o.frames, FL))));
        var fps = num(o.fps, 24), lead = Math.max(0, num(o.lead, 0)), place = clamp(num(o.place, 100), -300, 300);
        var N = Math.max(1, Math.round(num(o.count, 80))), S = Math.max(2, num(o.spacing, 40));
        var follow = clamp(num(o.follow, 50), 0, 100) / 100, turb = clamp(num(o.turbulence, 40), 0, 100) / 100;
        var preroll = Math.max(0, num(o.preroll, 3)), sub = 2, dtF = 1 / fps, dt = dtF / sub, f, k;
        var LD = makeLeader(LX, LY, fps), behind = behindOf(place, S, N);
        // the simulation's constants and its turbulence (the same seeded waves, drawn first)
        var cruise = Math.max(LD.vmax, S * 6), vMax = cruise * 1.6, vMin = cruise * 0.4, aMax = cruise * 3.2;
        var wf = TAU / (6 * Math.pow(0.1, follow)), kf = wf * wf, df = 0.6 * wf;
        var kTurb = turb * cruise * 2.6, waves = makeWaves(rng(num(o.seed, 1) * 7919 + 13), S * 5, S * 14);
        var t = -Math.round(preroll * fps) * dtF, L = [0, 0, 0, 0];
        targetAt(LD, t, lead, behind, L);
        var x = L[0], y = L[1], vx = L[2], vy = L[3];
        if (sqrt(vx * vx + vy * vy) < vMin) {
            vx = vMin;
            vy = 0;
        }
        function step() {
            targetAt(LD, t, lead, behind, L);
            var ax = (L[0] - x) * kf + (L[2] - vx) * df + kTurb * wave(waves[0], x, y, 0, t);
            var ay = (L[1] - y) * kf + (L[3] - vy) * df + kTurb * wave(waves[1], x, y, 0, t);
            var am = sqrt(ax * ax + ay * ay);
            if (am > aMax) {
                ax *= aMax / am;
                ay *= aMax / am;
            }
            var v2 = vx * vx + vy * vy || 1e-6, par = (ax * vx + ay * vy) / v2, lx = ax - par * vx, ly = ay - par * vy;
            var lm = sqrt(lx * lx + ly * ly), lc = sqrt(v2) * Math.PI;
            if (lm > lc) {
                ax = par * vx + (lx * lc) / lm;
                ay = par * vy + (ly * lc) / lm;
            }
            var nvx = vx + ax * dt, nvy = vy + ay * dt, s = sqrt(nvx * nvx + nvy * nvy) || 0.001;
            var cl = s > vMax ? vMax / s : (s < vMin ? vMin / s : 1);
            vx = nvx * cl;
            vy = nvy * cl;
            x += vx * dt;
            y += vy * dt;
            t += dt;
        }
        var steps = Math.round(preroll * fps) * sub, outX = [], outY = [];
        for (k = 0; k < steps; k++) step();
        outX.push(x);
        outY.push(y);
        for (f = 1; f < F; f++) {
            for (k = 0; k < sub; k++) step();
            outX.push(x);
            outY.push(y);
        }
        return { x: outX, y: outY, cruise: cruise };
    }

    // 2: nested ?: parenthesized (ExtendScript misread them); 3: speed band, running sums;
    // 4: the follow spring steers the flock's centre to a point behind the leader (place)
    return { run: run, guess: guess, rng: rng, behindOf: behindOf, version: 4 };
})();
