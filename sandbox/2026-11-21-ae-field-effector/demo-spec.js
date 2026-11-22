// demo-spec.js - the demo that make-demo.jsx builds in After Effects and scene.js previews in
// the engine, in one place so the two can't drift apart. Plain ES3.
//
// Two comps of 4.5 s, each a 13 x 7 grid of "Tile" precomps (a rounded square whose dot
// grows over the precomp's 1 s work area) and one field keyed across it with Easy Ease:
//   Sphere field: pops, pushes, tints and scrubs the tiles it passes (with a little edge noise)
//   Linear field: a wipe that turns squares into diamonds, through a Custom curve that overshoots
// Colours are 0-255. Field keys are [time, x, y]; Custom Curve keys are [time, value].
var FX_DEMO = {
    fps: 24,
    shot: 4.5,
    size: [1920, 1080],
    grid: { cols: 13, rows: 7, step: 128, tile: 96, radius: 18, dot: 60, box: 120 },
    colors: { bg: [239, 233, 223], tile: [34, 48, 74], dot: [239, 233, 223] },
    work: 1,
    shots: [
        {
            name: 'Sphere field',
            keys: [[0, -120, 200], [4.5, 2040, 880]],
            P: { shape: 1, size: 330, falloff: 70, curve: 2, strength: 100, invert: 0, edgeNoise: 30, noiseSize: 160, noiseSpeed: 0.6, seed: 1, blend: 1 },
            custom: null,
            ch: { strength: 100, offsetX: 0, offsetY: 0, push: 22, scale: 135, rotation: 0, opacity: 100, tint: 55, tintColor: [255, 107, 41] },
            tint: true,
            time: true
        },
        {
            name: 'Linear field',
            keys: [[0, 150, 540], [4.5, 2300, 540]],
            P: { shape: 3, size: 520, falloff: 100, curve: 5, strength: 100, invert: 0, edgeNoise: 0, noiseSize: 150, noiseSpeed: 0.5, seed: 1, blend: 1 },
            custom: [[0, 0], [0.55, 118], [1, 100]],
            ch: { strength: 100, offsetX: 0, offsetY: 0, push: 0, scale: 75, rotation: 45, opacity: 100, tint: 0, tintColor: [255, 107, 41] },
            tint: false,
            time: false
        }
    ]
};
