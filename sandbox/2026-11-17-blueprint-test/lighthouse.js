// The lighthouse, once, in metres: the elevation, the section and the plan are all drawn
// from it. Sheet coordinates are the reference still's pixels; 14 px = 1 m at 1:100.
const Sheet = { parts: [] };
const LH = (() => {
    const M = 14, GY = 525;
    const Y = (m) => GY - m * M;
    // heights above the ground line
    const H = { plinth: 5.0, belt: 5.6, neck: 25.3, neck1: 25.55, deck0: 26.7, deck: 27.0, rail: 28.2, sill: 29.3, sill1: 29.45, glass: 31.6, cornice: 31.85, dome: 33.3, ball: 33.68, tip: 34.3, top: 34.75, focal: 30.6 };
    const EL0 = 4.8; // the ground line's level above datum
    const FLOORS = [6.4, 12.8, 19.2]; // floors 1 to 3; the watch room's floor is the gallery level
    const WELL = 28.5; // the stair well's radius, px
    const WINDOWS = FLOORS.map((m) => m + 2.0); // centres of the windows, front and back: 1.1 m sills
    const shaft = (m) => 56 + ((39 - 56) * (m - H.belt)) / (H.neck - H.belt);
    const dome = (m) => 30.5 * Math.pow(Math.max(0, 1 - Math.pow((m - H.cornice) / (H.dome - H.cornice), 2)), 0.62) + 2.5;
    // the outer face's radius (px) at a height
    function r(m) {
        if (m < H.plinth) return 62 - (4 * m) / H.plinth;
        if (m < H.belt) return 59.5;
        if (m < H.neck) return shaft(m);
        if (m < H.neck1) return 40.5;
        if (m < H.deck0) { const s = (m - H.neck1) / (H.deck0 - H.neck1); return 39 + 7 * s * s; }
        if (m < H.deck) return 46.55;
        if (m < H.sill) return 33.5;
        if (m < H.sill1) return 34.5;
        if (m < H.glass) return 29.5;
        if (m < H.cornice) return 31.5;
        return dome(m);
    }
    // the profile as [radius, height] corners, ground to the top of the dome
    function profile() {
        const P = [[62, 0], [58, H.plinth], [59.5, H.plinth], [59.5, H.belt], [56, H.belt], [39, H.neck], [40.5, H.neck], [40.5, H.neck1], [39, H.neck1]];
        for (let i = 1; i <= 8; i++) { const m = H.neck1 + ((H.deck0 - H.neck1) * i) / 8; P.push([r(m - 1e-6), m]); }
        P.push([46.55, H.deck0], [46.55, H.deck], [33.5, H.deck], [33.5, H.sill], [34.5, H.sill], [34.5, H.sill1], [29.5, H.sill1], [29.5, H.glass], [31.5, H.glass], [31.5, H.cornice], [33, H.cornice]);
        for (let i = 0; i <= 14; i++) { const m = H.cornice + ((H.dome - H.cornice) * i) / 14; P.push([dome(m), m]); }
        return P;
    }
    const fig = (m) => m.toFixed(3);
    return { M, GY, Y, H, EL0, FLOORS, WELL, WINDOWS, r, shaft, dome, profile, fig };
})();
