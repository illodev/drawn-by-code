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
    // When the voices are in, as [from, to] seconds. Measured on the track, not heard: the verses'
    // lead sits in the middle of the mix and the choruses' stacked voices and the «ooh» backing
    // at its sides, so the level of mid against side (and of side alone) per sixteenth, compared
    // with the riff's bars, shows them. Good to about a sixteenth (0.09 s); the user corrects by ear.
    const LEAD = [
        [18.0, 22.45], [24.4, 25.4], [26.45, 34.35], // verse 1
        [35.4, 35.95], [36.3, 37.05], [39.1, 40.55], [41.3, 42.5], [44.85, 45.9], [46.95, 48.1], // chorus 1: «Yeah», then five phrases in alternate bars
        [56.35, 57.0], [57.5, 57.75], [59.6, 63.55], [66.0, 66.4], [67.85, 68.25], [68.8, 69.1], [70.55, 72.05], [73.75, 74.85], [76.05, 76.6], // verse 2
        [76.34, 76.9], [77.24, 78.0], [80.04, 81.5], [82.24, 83.45], [85.8, 86.85], [87.9, 89.05], // chorus 2
        [111.95, 112.3], [112.6, 113.0], [114.7, 117.05], [117.6, 118.0], [123.2, 123.55], [123.9, 124.15], [126.8, 127.4], [127.95, 128.45], [128.9, 129.95], // verse 3
        [131.4, 131.95], [132.3, 133.05], [135.1, 136.55], [137.3, 138.5], [140.85, 141.9], [142.95, 144.1], // chorus 3
        [149.76, 150.3], [150.66, 151.4], [153.46, 154.9], [155.66, 156.86], [159.2, 160.25], [161.3, 162.45], // chorus 4
    ];
    // the backing voices' «ooh» (the break, the bridge, parts of the solo); in the choruses they sing the lead's phrases
    const OOH = [[92.2, 103.4], [104.9, 109.0], [168.4, 178.2], [182.6, 189.5], [194.3, 195.2], [196.7, 200.8], [202.3, 205.0], [206.7, 209.3]];
    const CHORUS = [[35.4, 48.1], [76.34, 89.05], [131.4, 144.1], [149.76, 162.45]];
    const within = (list, t) => list.some(([a, c]) => t >= a - 1e-6 && t < c);
    const singing = (t) => within(LEAD, t); // Tom's mouth
    const backing = (t) => within(OOH, t) || (within(CHORUS, t) && within(LEAD, t)); // Benmont's and Stan's
    const END = 262; // the fade is silent by here (4:22); what follows on the file is the CD's spoken interlude
    return { BPM, OFFSET, BEAT, BAR, FPS, snap, beat, bar, b, B, twos, pop, pulseAt, LICK, BAND_IN, SECTIONS, LEAD, OOH, singing, backing, END };
})();
