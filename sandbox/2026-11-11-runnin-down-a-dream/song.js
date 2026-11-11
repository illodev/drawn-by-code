// The song's clock, measured on the track (librosa beat tracking + per-bar analysis; see
// brief.md). 169.97 BPM, steady from the first bar to the fade. Beat 0 is the guitar's
// pickup bar; the band comes in on beat 4.
const Song = (() => {
    const BPM = 169.97, OFFSET = 0.356, BEAT = 60 / BPM, BAR = BEAT * 4, FPS = 24;
    const snap = (s) => Math.round(s * FPS) / FPS; // cuts and hits land on frames
    const beat = (n) => OFFSET + n * BEAT;
    const bar = (n) => OFFSET + n * BAR;
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
    return { BPM, OFFSET, BEAT, BAR, FPS, snap, beat, bar, LICK, BAND_IN, SECTIONS, END };
})();
