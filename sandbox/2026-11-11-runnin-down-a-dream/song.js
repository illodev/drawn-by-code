// The song's clock, measured on the track (librosa beat tracking + per-bar analysis; see
// brief.md). 169.97 BPM, steady from the first bar to the fade. Beat 0 is the guitar's
// pickup bar; the band comes in on beat 4.
const Song = (() => {
    const BPM = 169.97, OFFSET = 0.356, BEAT = 60 / BPM, BAR = BEAT * 4, FPS = 24;
    const snap = (s) => Math.round(s * FPS) / FPS; // cuts and hits land on frames
    const beat = (n) => OFFSET + n * BEAT;
    const bar = (n) => OFFSET + n * BAR;
    // on frames: a beat, a bar's first beat (what the picture is cut and hit on)
    const b = (n) => snap(beat(n)), B = (n) => snap(bar(n));
    // Drawings change on twos, but each event's clock starts on its own frame, so a hit never
    // waits for the next even frame: twos(t, at) is t held on the drawing, counted from `at`.
    const twos = (t, at) => at + Math.floor((t - at) * 12 + 1e-6) / 12;
    // Something that pops in on a hit: 0 before `at`; on the hit's own frame it is already
    // there at 0.6 of its size (a pop that starts from nothing is seen a drawing late), then
    // it overshoots and settles within `dur`.
    const pop = (t, at, dur = 0.25) => {
        if (t < at - 1e-6) return 0;
        const u = Math.max(0, Math.min(1, (twos(t, at) - at) / dur)), c1 = 1.7, c3 = c1 + 1;
        return 0.6 + 0.4 * (1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2));
    };
    // the beat we are in at t: { k, since (in beats, on twos), pulse (1 on the beat, falling) }
    const pulseAt = (t, decay = 3.2) => {
        let k = Math.floor((t - OFFSET) / BEAT + 0.5);
        if (b(k) > t + 1e-6) k--;
        const since = (twos(t, b(k)) - b(k)) / BEAT;
        return { k, since, pulse: Math.exp(-since * decay) };
    };
    // the four notes of the guitar's pickup, then the band
    const LICK = [0.505, 1.045, 1.411, 1.579].map(snap);
    const BAND_IN = snap(beat(4)); // 1.75
    // sections, as bars [from, to) (bar n starts at OFFSET + n · BAR)
    const SECTIONS = [
        ['pickup', 0, 1], ['riff', 1, 12], ['verse 1', 12, 25], ['chorus 1', 25, 34], ['riff', 34, 39],
        ['verse 2', 39, 54], ['chorus 2', 54, 63], ['riff', 63, 65], ['break', 65, 78], ['verse 3', 78, 93],
        ['chorus 3', 93, 102], ['riff', 102, 106], ['chorus 4', 106, 115], ['riff', 115, 119], ['bridge', 119, 129],
        ['solo', 129, 179], ['fade', 179, 185],
    ];
    const END = 262; // the fade is silent by here (4:22); what follows on the file is the CD's spoken interlude
    return { BPM, OFFSET, BEAT, BAR, FPS, snap, beat, bar, b, B, twos, pop, pulseAt, LICK, BAND_IN, SECTIONS, END };
})();
