// Stretch A of the dance (0–4.1 s), keyed on the reference: timings read off strips at
// 1/15 s, poses checked with overlay.py and arm angles measured by silhouette fits at 144 px.
//   0–2.1    all three hunched, heads bowed (the side cats show the tops of their heads),
//            paws together hanging in front of the belly; the camera zooms in (dance.js).
//            The hat cat's head is lower and tipped forward, and comes up 0.6–1.2 (face
//            level, still holding its paws together).
//   2.0–2.27 the hat cat opens its arms first (paws up at shoulder height by 2.27);
//   2.07–2.4 the ginger's head comes up (2.07–2.33), then its arms open (2.33–2.4);
//   2.13–2.53 the glasses cat's head comes up (2.13–2.33), its arms open last (2.4–2.53).
//   2.5–3.8  arms out to the sides, forearms up, paws at chest/shoulder height; each cat's
//            arms at its own measured angles (neighbouring paws meet between the cats).
//            The hat cat meows: mouth open 2.5–3.03 and 3.3–4.0, a glance to its right at 3.13.
//   3.87–4.0 the arms rise towards the face (3.87), then come down in front (4.0), leading
//            into the shuffle (keys/segB.js, 4.2).
var DANCE_SEG_A = [
    [ // cat 0: ginger fold, image left
        [0, {"x": -0.34, "z": 0, "bob": 0, "yaw": 0, "pitch": -0.05, "roll": 0.03, "twist": 0, "bend": 0.3, "head": [0, 1.22, -0.05], "armL": [0.5, 0.0, 0.5, 1.0], "armR": [0.5, 0.0, 0.5, 1.0], "legL": [0, 0.08], "legR": [0, 0.08], "tail": [0.6, 0, 0.5], "mouth": 0}],
        [2.067, {"head": [0, 1.15, -0.05]}],
        [2.2, {"pitch": -0.05, "bend": 0.2, "head": [0, 0.6, 0]}],
        [2.333, {"head": [0, 0.1, 0], "armL": [0.45, 0.4, 1.1, 0.3], "armR": [0.45, 0.4, 1.1, 0.3]}],
        [2.4, {"x": -0.36, "pitch": 0, "bend": 0, "head": [0, 0, 0], "armL": [0.35, 1.4, 0.9, -1.4], "armR": [0.35, 1.4, 0.9, -1.4]}],
        [2.8, {"x": -0.38, "roll": 0.03, "armR": [0.2, 1.5, 0.9, -1.4]}],
        [3.2, {"armR": [0.2, 1.55, 0.85, -1.4]}],
        [3.6, {"roll": -0.02, "armR": [0.2, 1.5, 0.9, -1.4]}],
        [3.867, {"x": -0.4, "roll": 0.05, "armL": [0.6, 0.7, 1.6, -1.2], "armR": [0.6, 0.7, 1.6, -1.2]}],
        [4.0, {"armL": [0.8, 0.5, 0.8, -0.3], "armR": [0.3, 1.2, 0.5, -0.6]}],
    ],
    [ // cat 1: white with the cowboy hat, middle
        [0, {"x": -0.03, "z": 0, "bob": 0, "yaw": 0, "pitch": 0.35, "roll": 0.1, "twist": 0, "bend": 0.35, "head": [0, -0.2, 0], "armL": [0.5, 0.0, 0.5, 1.0], "armR": [0.5, 0.0, 0.5, 1.0], "legL": [0, 0.08], "legR": [0, 0.08], "tail": [0.6, 0, 0.5], "mouth": 0}],
        [0.6, {"head": [0, -0.2, 0]}],
        [1.2, {"pitch": 0.2, "roll": 0.05, "bend": 0.2, "head": [0, -0.35, 0]}],
        [2.0, {"head": [0, -0.3, 0], "armL": [0.5, 0.0, 0.5, 1.0], "armR": [0.5, 0.0, 0.5, 1.0]}],
        [2.133, {"armL": [0.5, 0.6, 1.0, -0.6], "armR": [0.5, 0.6, 1.0, -0.6]}],
        [2.267, {"x": -0.01, "pitch": 0, "roll": -0.03, "bend": 0, "head": [0, 0.05, 0], "armL": [0.35, 1.4, 0.9, -1.4], "armR": [0.35, 1.4, 0.9, -1.4]}],
        [2.333, {"mouth": 0}],
        [2.5, {"mouth": 0.7}],
        [2.567, {"mouth": 1}],
        [2.8, {"roll": -0.05}],
        [2.9, {"head": [0, 0.05, 0], "mouth": 0.8}],
        [3.033, {"mouth": 0.4}],
        [3.133, {"head": [-0.35, 0.05, 0], "mouth": 0}],
        [3.3, {"head": [0, 0.05, 0.1], "mouth": 0.7}],
        [3.5, {"mouth": 0.8}],
        [3.6, {"roll": 0.03}],
        [3.7, {"mouth": 1}],
        [3.867, {"x": -0.03, "roll": 0, "armL": [0.6, 0.7, 1.6, -1.2], "armR": [0.6, 0.7, 1.6, -1.2]}],
        [3.9, {"mouth": 0.8}],
        [4.0, {"armL": [0.8, 0.5, 0.8, -0.3], "armR": [0.8, 0.5, 0.8, -0.3], "mouth": 0.4}],
    ],
    [ // cat 2: white with patches and glasses, image right
        [0, {"x": 0.4, "z": 0, "bob": 0, "yaw": 0, "pitch": 0.1, "roll": 0.05, "twist": 0, "bend": 0.3, "head": [0, 1.05, 0.35], "armL": [0.5, 0.0, 0.5, 1.0], "armR": [0.5, 0.0, 0.5, 1.0], "legL": [0, 0.08], "legR": [0, 0.08], "tail": [0.6, 0, 0.5], "mouth": 0}],
        [2.133, {"head": [0, 1.0, 0.3]}],
        [2.267, {"bend": 0.2, "head": [0, 0.35, 0.1]}],
        [2.333, {"head": [0, 0.05, 0], "armL": [0.5, 0.0, 0.5, 1.0], "armR": [0.5, 0.0, 0.5, 1.0]}],
        [2.4, {"bend": 0.1, "armL": [0.5, 0.0, 0.5, 1.0], "armR": [0.5, 0.0, 0.5, 1.0]}],
        [2.467, {"armL": [0.45, 0.6, 1.0, -0.4], "armR": [0.45, 0.6, 1.0, -0.4]}],
        [2.533, {"pitch": 0, "bend": 0, "head": [0, 0, 0], "armL": [0.35, 1.4, 0.9, -1.4], "armR": [0.0, 1.5, 0.6, -1.4]}],
        [3.2, {"x": 0.42}],
        [3.6, {"x": 0.4}],
        [3.867, {"armL": [0.6, 0.7, 1.6, -1.2], "armR": [0.6, 0.7, 1.6, -1.2]}],
        [4.0, {"x": 0.38, "armL": [0.8, 0.5, 0.8, -0.3], "armR": [0.8, 0.5, 0.8, -0.3]}],
    ],
];
