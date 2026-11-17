// micrograph-test · shot 1 · Section: a thin section through a cluster of virions, some of
// them budding, tinted orange on pale blue. Built on the user's reference still
// (private/section169.png, not committed: the still cropped to 16:9). Measured on it: where
// every particle is and how big (placed on a 960 × 540 copy, in pixels, below), the colour
// across a cut particle from its centre out (interior, the dark membrane, the rose fringe,
// the pale halo, the blue field) and across one that lies outside the section (a ghost).
window.MGT = window.MGT ?? {};
MGT.section = {
    // the instant that reproduces the reference still (local seconds)
    MATCH: 3.5,
    // lobes of cut particles, measured: centre x, y (px on a 960 × 540 copy of the still),
    // mean luminance of the interior, share of the inside that is dark granules, body number
    // (two lobes with the same number are one budding body), and the outline: 32 radii (px)
    // from the centre to the far edge of the dark membrane, counter-clockwise from 3 o'clock
    LOBES: [
        [283, 31, 0.38, 0.53, 0, [38, 39, 44, 47, 45, 39, 35, 28, 32, 36, 36, 39, 45, 48, 49, 44, 38, 35, 34, 36, 38, 36, 32, 35, 32, 32, 32, 31, 31, 30, 32, 36]],   // top
        [204, 141, 0.48, 0.50, 1, [49, 48, 49, 46, 44, 43, 42, 48, 47, 41, 47, 46, 49, 46, 46, 50, 46, 45, 46, 46, 45, 45, 44, 44, 45, 46, 48, 45, 46, 46, 48, 50]],   // left, up
        [154, 293, 0.49, 0.15, 2, [77, 55, 52, 42, 56, 50, 50, 55, 42, 44, 60, 63, 64, 66, 62, 64, 58, 55, 62, 58, 56, 48, 50, 61, 40, 42, 45, 68, 56, 60, 66, 65]],   // left, middle (hardly a membrane)
        [321, 282, 0.64, 0.37, 3, [78, 77, 79, 81, 83, 85, 87, 89, 91, 93, 85, 82, 75, 74, 70, 69, 73, 72, 74, 78, 81, 84, 88, 92, 96, 99, 104, 98, 96, 89, 84, 78]],   // the big one …
        [400, 168, 0.39, 0.62, 3, [46, 48, 47, 47, 47, 48, 50, 52, 55, 58, 54, 34, 62, 59, 59, 59, 59, 60, 59, 58, 57, 56, 55, 54, 53, 52, 52, 51, 52, 49, 50, 45]],   // … and its bud
        [529, 122, 0.35, 0.57, 4, [70, 68, 63, 65, 61, 61, 63, 65, 66, 66, 66, 75, 79, 83, 87, 91, 92, 81, 70, 67, 65, 57, 58, 72, 85, 97, 89, 80, 87, 86, 80, 39]],   // the bean
        [493, 297, 0.60, 0.42, 5, [74, 71, 68, 68, 75, 73, 72, 64, 67, 67, 69, 73, 73, 72, 69, 68, 68, 66, 65, 62, 68, 64, 56, 69, 66, 41, 75, 80, 66, 52, 38, 78]],   // centre
        [734, 359, 0.42, 0.64, 6, [48, 48, 49, 51, 51, 50, 52, 54, 57, 59, 58, 56, 54, 58, 52, 54, 52, 49, 49, 48, 54, 52, 53, 52, 53, 57, 61, 61, 61, 58, 50, 50]],   // right, low
        [613, 402, 0.39, 0.58, 7, [61, 57, 54, 54, 53, 50, 56, 60, 66, 69, 68, 66, 65, 64, 63, 60, 58, 62, 60, 58, 56, 54, 54, 60, 58, 62, 65, 72, 34, 34, 62, 63]],   // low, middle
        [491, 444, 0.65, 0.38, 8, [62, 58, 56, 54, 52, 53, 56, 54, 58, 66, 61, 63, 63, 62, 62, 62, 61, 61, 61, 60, 52, 51, 52, 60, 58, 58, 62, 68, 68, 71, 67, 63]],   // the low pair …
        [377, 428, 0.16, 0.99, 8, [48, 48, 49, 49, 47, 45, 40, 38, 41, 35, 34, 30, 31, 29, 28, 29, 29, 30, 30, 35, 33, 37, 37, 36, 41, 48, 50, 47, 47, 47, 48, 48]],   // … and its dark bud
        [868, 287, 0.39, 0.65, 9, [53, 48, 45, 45, 45, 46, 45, 46, 48, 46, 53, 53, 52, 53, 52, 48, 48, 46, 47, 44, 43, 51, 49, 45, 48, 49, 50, 51, 52, 52, 54, 53]],   // right
        [33, 457, 0.44, 0.35, 10, [34, 30, 38, 38, 40, 38, 40, 46, 45, 46, 44, 42, 42, 42, 42, 40, 38, 36, 36, 40, 42, 42, 40, 36, 39, 38, 36, 36, 36, 34, 34, 34]],   // left edge, low
    ],
    // the tone in and round each of those lobes: mean luminance measured in 6 rings (0–0.35,
    // –0.62, –0.82, –1 of the outline's radius inside it; –1.15, –1.35 outside it, leaving out
    // what falls inside another lobe) × 16 sectors (centred every 22.5°, from 3 o'clock)
    TONE: [
        [0.31, 0.38, 0.30, 0.30, 0.37, 0.49, 0.46, 0.43, 0.43, 0.40, 0.41, 0.32, 0.31, 0.30, 0.30, 0.23, 0.21, 0.33, 0.38, 0.46, 0.50, 0.51, 0.51, 0.42, 0.45, 0.43, 0.48, 0.34, 0.26, 0.19, 0.25, 0.21, 0.15, 0.22, 0.33, 0.41, 0.45, 0.47, 0.29, 0.24, 0.22, 0.26, 0.19, 0.15, 0.17, 0.16, 0.08, 0.08, 0.29, 0.33, 0.30, 0.32, 0.41, 0.41, 0.20, 0.20, 0.24, 0.36, 0.21, 0.33, 0.31, 0.31, 0.30, 0.28, 0.67, 0.61, 0.38, 0.55, 0.55, 0.55, 0.31, 0.45, 0.58, 0.63, 0.49, 0.55, 0.53, 0.57, 0.66, 0.66, 0.79, 0.79, 0.68, 0.73, 0.73, 0.73, 0.64, 0.76, 0.75, 0.74, 0.70, 0.71, 0.68, 0.76, 0.76, 0.76],
        [0.52, 0.43, 0.45, 0.36, 0.39, 0.47, 0.42, 0.41, 0.43, 0.51, 0.58, 0.57, 0.59, 0.61, 0.63, 0.60, 0.43, 0.31, 0.28, 0.22, 0.35, 0.39, 0.40, 0.47, 0.51, 0.47, 0.53, 0.55, 0.61, 0.57, 0.50, 0.54, 0.19, 0.26, 0.26, 0.29, 0.32, 0.26, 0.28, 0.24, 0.24, 0.13, 0.19, 0.16, 0.15, 0.06, 0.08, 0.24, 0.26, 0.25, 0.27, 0.31, 0.27, 0.33, 0.19, 0.18, 0.24, 0.22, 0.24, 0.28, 0.26, 0.20, 0.30, 0.24, 0.64, 0.65, 0.63, 0.57, 0.60, 0.65, 0.49, 0.50, 0.54, 0.65, 0.70, 0.72, 0.65, 0.64, 0.69, 0.65, 0.81, 0.81, 0.79, 0.79, 0.80, 0.82, 0.76, 0.76, 0.79, 0.83, 0.82, 0.80, 0.80, 0.80, 0.81, 0.79],
        [0.51, 0.48, 0.54, 0.57, 0.59, 0.63, 0.55, 0.52, 0.55, 0.42, 0.45, 0.51, 0.43, 0.45, 0.48, 0.54, 0.47, 0.49, 0.52, 0.49, 0.57, 0.52, 0.57, 0.51, 0.49, 0.46, 0.38, 0.52, 0.40, 0.38, 0.41, 0.45, 0.47, 0.46, 0.40, 0.37, 0.39, 0.39, 0.45, 0.46, 0.38, 0.34, 0.34, 0.32, 0.30, 0.37, 0.39, 0.44, 0.43, 0.30, 0.31, 0.40, 0.28, 0.40, 0.46, 0.51, 0.49, 0.44, 0.44, 0.41, 0.27, 0.28, 0.36, 0.50, 0.45, 0.39, 0.59, 0.69, 0.71, 0.76, 0.73, 0.75, 0.72, 0.66, 0.73, 0.66, 0.37, 0.38, 0.63, 0.62, 0.70, 0.72, 0.76, 0.79, 0.80, 0.83, 0.86, 0.85, 0.84, 0.83, 0.79, 0.73, 0.71, 0.66, 0.76, 0.77],
        [0.67, 0.65, 0.64, 0.64, 0.67, 0.71, 0.72, 0.71, 0.67, 0.63, 0.65, 0.66, 0.76, 0.75, 0.75, 0.72, 0.53, 0.55, 0.51, 0.53, 0.56, 0.45, 0.55, 0.60, 0.60, 0.53, 0.55, 0.64, 0.74, 0.74, 0.65, 0.56, 0.37, 0.34, 0.28, 0.41, 0.39, 0.31, 0.27, 0.17, 0.18, 0.24, 0.42, 0.46, 0.49, 0.52, 0.33, 0.19, 0.27, 0.30, 0.21, 0.29, 0.18, 0.21, 0.20, 0.22, 0.18, 0.19, 0.26, 0.24, 0.15, 0.13, 0.12, 0.23, 0.64, 0.67, 0.50, 0.21, 0.56, 0.63, 0.67, 0.65, 0.59, 0.63, 0.70, 0.63, 0.63, 0.53, 0.62, 0.61, 0.64, 0.75, 0.57, 0.44, 0.72, 0.80, 0.80, 0.78, 0.71, 0.75, 0.78, 0.76, 0.74, 0.60, 0.74, 0.68],
        [0.40, 0.41, 0.48, 0.47, 0.52, 0.51, 0.49, 0.45, 0.44, 0.41, 0.28, 0.49, 0.51, 0.43, 0.42, 0.43, 0.19, 0.22, 0.25, 0.30, 0.22, 0.39, 0.42, 0.43, 0.48, 0.26, 0.31, 0.23, 0.34, 0.35, 0.41, 0.27, 0.12, 0.08, 0.11, 0.16, 0.27, 0.33, 0.28, 0.26, 0.17, 0.30, 0.27, 0.11, 0.10, 0.13, 0.16, 0.11, 0.30, 0.30, 0.26, 0.30, 0.24, 0.29, 0.23, 0.24, 0.25, 0.22, 0.35, 0.24, 0.35, 0.26, 0.23, 0.27, 0.50, 0.50, 0.47, 0.56, 0.57, 0.52, 0.56, 0.56, 0.55, 0.34, 0.53, 0.38, 0.59, 0.61, 0.58, 0.63, 0.70, 0.55, 0.40, 0.69, 0.75, 0.77, 0.80, 0.77, 0.72, 0.47, 0.67, 0.45, 0.70, 0.75, 0.75, 0.79],
        [0.18, 0.26, 0.38, 0.44, 0.42, 0.38, 0.38, 0.36, 0.35, 0.39, 0.43, 0.39, 0.30, 0.29, 0.27, 0.16, 0.44, 0.52, 0.51, 0.49, 0.51, 0.51, 0.50, 0.54, 0.33, 0.24, 0.23, 0.24, 0.23, 0.25, 0.24, 0.28, 0.31, 0.12, 0.23, 0.36, 0.31, 0.35, 0.40, 0.43, 0.33, 0.24, 0.13, 0.17, 0.25, 0.14, 0.27, 0.36, 0.14, 0.20, 0.27, 0.23, 0.24, 0.28, 0.27, 0.27, 0.10, 0.21, 0.35, 0.56, 0.35, 0.36, 0.31, 0.25, 0.61, 0.60, 0.65, 0.63, 0.65, 0.62, 0.57, 0.47, 0.46, 0.56, 0.69, 0.68, 0.41, 0.41, 0.64, 0.54, 0.71, 0.77, 0.77, 0.77, 0.80, 0.80, 0.81, 0.79, 0.63, 0.55, 0.76, 0.69, 0.46, 0.45, 0.67, 0.74],
        [0.59, 0.61, 0.59, 0.65, 0.74, 0.77, 0.75, 0.74, 0.74, 0.73, 0.71, 0.61, 0.66, 0.64, 0.55, 0.51, 0.50, 0.45, 0.41, 0.53, 0.66, 0.70, 0.59, 0.59, 0.58, 0.42, 0.46, 0.36, 0.45, 0.61, 0.53, 0.40, 0.41, 0.22, 0.17, 0.11, 0.24, 0.28, 0.26, 0.18, 0.25, 0.11, 0.16, 0.30, 0.38, 0.46, 0.42, 0.46, 0.18, 0.29, 0.37, 0.32, 0.21, 0.17, 0.16, 0.17, 0.17, 0.28, 0.31, 0.40, 0.19, 0.31, 0.26, 0.21, 0.48, 0.61, 0.56, 0.49, 0.64, 0.58, 0.62, 0.62, 0.58, 0.55, 0.56, 0.58, 0.48, 0.37, 0.23, 0.24, 0.67, 0.65, 0.53, 0.46, 0.69, 0.78, 0.77, 0.73, 0.62, 0.71, 0.73, 0.67, 0.57, 0.63, 0.41, 0.55],
        [0.53, 0.52, 0.55, 0.53, 0.53, 0.48, 0.44, 0.43, 0.33, 0.31, 0.38, 0.37, 0.41, 0.47, 0.49, 0.51, 0.41, 0.36, 0.45, 0.50, 0.43, 0.37, 0.25, 0.22, 0.30, 0.24, 0.21, 0.21, 0.31, 0.37, 0.42, 0.46, 0.18, 0.11, 0.17, 0.22, 0.13, 0.10, 0.08, 0.04, 0.02, 0.02, 0.05, 0.02, 0.06, 0.18, 0.26, 0.19, 0.32, 0.25, 0.28, 0.25, 0.19, 0.19, 0.28, 0.25, 0.16, 0.23, 0.24, 0.22, 0.25, 0.27, 0.30, 0.26, 0.65, 0.63, 0.62, 0.68, 0.63, 0.61, 0.60, 0.55, 0.54, 0.57, 0.52, 0.64, 0.62, 0.62, 0.58, 0.62, 0.71, 0.76, 0.76, 0.76, 0.79, 0.75, 0.54, 0.70, 0.69, 0.61, 0.68, 0.77, 0.78, 0.74, 0.75, 0.69],
        [0.24, 0.19, 0.30, 0.43, 0.49, 0.44, 0.46, 0.41, 0.41, 0.46, 0.43, 0.43, 0.34, 0.39, 0.46, 0.43, 0.23, 0.31, 0.32, 0.40, 0.49, 0.51, 0.43, 0.47, 0.36, 0.27, 0.30, 0.29, 0.37, 0.46, 0.46, 0.37, 0.19, 0.09, 0.10, 0.22, 0.27, 0.45, 0.47, 0.35, 0.22, 0.17, 0.15, 0.16, 0.22, 0.28, 0.50, 0.37, 0.18, 0.21, 0.28, 0.26, 0.23, 0.25, 0.26, 0.29, 0.32, 0.31, 0.26, 0.30, 0.31, 0.21, 0.45, 0.23, 0.57, 0.58, 0.64, 0.66, 0.51, 0.49, 0.37, 0.59, 0.55, 0.45, 0.64, 0.69, 0.71, 0.46, 0.33, 0.50, 0.66, 0.63, 0.72, 0.64, 0.64, 0.65, 0.34, 0.61, 0.64, 0.45, 0.69, 0.75, 0.78, 0.74, 0.75, 0.77],
        [0.73, 0.73, 0.72, 0.68, 0.72, 0.73, 0.71, 0.73, 0.72, 0.72, 0.71, 0.71, 0.67, 0.67, 0.66, 0.73, 0.60, 0.60, 0.54, 0.51, 0.52, 0.51, 0.52, 0.54, 0.57, 0.60, 0.63, 0.62, 0.61, 0.54, 0.58, 0.61, 0.16, 0.24, 0.21, 0.15, 0.21, 0.29, 0.42, 0.40, 0.38, 0.15, 0.15, 0.16, 0.12, 0.28, 0.33, 0.22, 0.20, 0.24, 0.28, 0.23, 0.22, 0.21, 0.17, 0.25, 0.20, 0.18, 0.26, 0.22, 0.20, 0.23, 0.13, 0.16, 0.60, 0.49, 0.59, 0.55, 0.55, 0.59, 0.44, 0.15, 0.11, 0.41, 0.61, 0.60, 0.60, 0.63, 0.62, 0.56, 0.65, 0.47, 0.66, 0.68, 0.54, 0.69, 0.69, 0.23, 0.13, 0.57, 0.73, 0.75, 0.76, 0.75, 0.78, 0.73],
        [0.27, 0.24, 0.23, 0.22, 0.13, 0.14, 0.08, 0.08, 0.21, 0.27, 0.29, 0.22, 0.09, 0.12, 0.18, 0.25, 0.24, 0.16, 0.22, 0.15, 0.10, 0.06, 0.07, 0.07, 0.13, 0.11, 0.09, 0.11, 0.06, 0.09, 0.13, 0.15, 0.16, 0.17, 0.18, 0.10, 0.13, 0.14, 0.11, 0.08, 0.13, 0.12, 0.08, 0.12, 0.15, 0.09, 0.09, 0.16, 0.18, 0.13, 0.24, 0.34, 0.31, 0.35, 0.28, 0.33, 0.27, 0.26, 0.32, 0.29, 0.28, 0.22, 0.13, 0.08, 0.20, 0.21, 0.52, 0.62, 0.45, 0.55, 0.55, 0.50, 0.55, 0.54, 0.55, 0.51, 0.47, 0.51, 0.33, 0.09, 0.13, 0.33, 0.70, 0.72, 0.60, 0.63, 0.66, 0.67, 0.70, 0.63, 0.70, 0.69, 0.67, 0.70, 0.55, 0.21],
        [0.54, 0.48, 0.49, 0.51, 0.44, 0.38, 0.34, 0.35, 0.31, 0.34, 0.43, 0.41, 0.38, 0.39, 0.49, 0.53, 0.37, 0.33, 0.40, 0.45, 0.43, 0.47, 0.30, 0.34, 0.31, 0.17, 0.15, 0.22, 0.27, 0.45, 0.43, 0.25, 0.23, 0.21, 0.16, 0.21, 0.29, 0.25, 0.16, 0.14, 0.08, 0.06, 0.06, 0.09, 0.11, 0.17, 0.19, 0.18, 0.34, 0.30, 0.26, 0.34, 0.26, 0.31, 0.24, 0.22, 0.22, 0.29, 0.30, 0.26, 0.28, 0.19, 0.27, 0.28, 0.63, 0.56, 0.49, 0.63, 0.53, 0.55, 0.60, 0.55, 0.65, 0.57, 0.50, 0.44, 0.57, 0.53, 0.67, 0.67, 0.77, 0.71, 0.65, 0.71, 0.69, 0.71, 0.73, 0.73, 0.75, 0.73, 0.65, 0.56, 0.57, 0.76, 0.79, 0.74],
        [0.47, 0.45, 0.45, 0.49, 0.50, 0.45, 0.47, 0.55, 0.52, 0.48, 0.31, 0.42, 0.45, 0.32, 0.35, 0.39, 0.35, 0.36, 0.41, 0.45, 0.55, 0.42, 0.42, 0.52, 0.49, 0.48, 0.30, 0.36, 0.40, 0.40, 0.48, 0.41, 0.23, 0.18, 0.22, 0.29, 0.37, 0.52, 0.54, 0.47, 0.50, 0.37, 0.27, 0.26, 0.24, 0.23, 0.27, 0.23, 0.37, 0.40, 0.28, 0.28, 0.23, 0.40, 0.54, 0.50, 0.41, 0.14, 0.22, 0.35, 0.28, 0.34, 0.31, 0.37, 0.58, 0.67, 0.54, 0.52, 0.46, 0.27, 0.43, 0.52, 0.52, 0.52, 0.39, 0.56, 0.48, 0.59, 0.60, 0.69, 0.75, 0.78, 0.73, 0.67, 0.70, 0.45, 0.28, 0.65, 0.65, 0.65, 0.55, 0.67, 0.64, 0.73, 0.74, 0.77],
    ],
    // particles outside the section's plane: x, y, radii (px), tilt, how faint (0 solid … 1 nearly gone), how dark
    GHOSTS: [
        [633, 260, 68, 59, -1.25, 0.0, 0.1], [688, 118, 62, 50, 0, 0.0, 0.5], [538, 212, 40, 34, 0, 0.0, 0.8], [256, 511, 31, 29, 0, 0.0, 0],
        [765, 485, 38, 36, 0, 0.55, 0], [850, 368, 38, 36, 0, 0.15, 0], [762, 215, 30, 27, 0, 0.3, 0.5],
    ],
    // wisps of thin matter in the field: x, y, radius (px), weight
    CLOUDS: [[35, 148, 60, 2.2], [800, 15, 75, 0.7], [340, 528, 60, 1], [905, 185, 50, 0.7], [60, 335, 40, 0.15], [700, 20, 60, 0.7]],
    // the outlines as the shader uses them (frame heights). A ray that hit a granule or missed
    // the membrane leaves a notch: a median of five takes it out, a light average rounds the rest
    radii() {
        const med5 = (r) => r.map((_, i) => [-2, -1, 0, 1, 2].map((k) => r[(i + k + 32) % 32]).sort((x, y) => x - y)[2]);
        const avg3 = (r) => r.map((_, i) => (r[(i + 31) % 32] + 2 * r[i] + r[(i + 1) % 32]) / 4);
        return this.LOBES.map((e) => avg3(med5(e[5])).map((r) => r / 540));
    },
    // the tables for the shader: a row of tone per lobe, then a row of outline per lobe, 96 wide
    get data() {
        const pad = (r) => [...r, ...new Array(96 - r.length).fill(0)];
        return { data: [...this.TONE.flat(), ...this.radii().flatMap(pad)], width: 96 };
    },
    get glsl() {
        const f = (x) => x.toFixed(4), X = (x) => (x - 480) / 540, Y = (y) => (270 - y) / 540, R = (r) => r / 540;
        const L = this.LOBES, G = this.GHOSTS, C = this.CLOUDS;
        const rad = this.radii();
        return `
#define NL ${L.length}
#define NG ${G.length}
#define NCL ${C.length}
const vec4 LA[NL] = vec4[NL](${L.map((e, i) => `vec4(${[X(e[0]), Y(e[1]), e[2], e[3]].map(f).join(', ')})`).join(', ')});
const vec2 LB[NL] = vec2[NL](${L.map((e, i) => `vec2(${f(e[4])}, ${f(rad[i].reduce((x, y) => x + y, 0) / 32)})`).join(', ')});
// (the tables are data: row i = the tone of lobe i, 96 wide; row NL + i = its outline, 32 radii)
const float RING[6] = float[6](0.175, 0.485, 0.72, 0.91, 1.075, 1.25);
// the measured tone of lobe i at angle a and x = distance from its centre in outline radii
float tone(int i, float a, float x) {
    float g = fract(a / 6.2831853) * 16.0, u = fract(g), y = clamp(x, RING[0], RING[5]);
    int k = int(floor(g)), k1 = (k + 1) % 16, r0 = 0;
    u = u * u * (3.0 - 2.0 * u);
    for (int r = 1; r < 5; r++) if (y >= RING[r]) r0 = r;
    float v0 = mix(datum(r0 * 16 + k, i), datum(r0 * 16 + k1, i), u), v1 = mix(datum((r0 + 1) * 16 + k, i), datum((r0 + 1) * 16 + k1, i), u);
    return mix(v0, v1, (y - RING[r0]) / (RING[r0 + 1] - RING[r0]));
}
float outline(int i, float a) {
    float g = fract(a / 6.2831853) * 32.0, u = fract(g);
    int k = int(floor(g));
    u = u * u * (3.0 - 2.0 * u);
    return mix(datum(k, NL + i), datum((k + 1) % 32, NL + i), u);
}
const vec4 GA[NG] = vec4[NG](${G.map((e) => `vec4(${[X(e[0]), Y(e[1]), R(e[2]), R(e[3])].map(f).join(', ')})`).join(', ')});
const vec3 GF[NG] = vec3[NG](${G.map((e) => `vec3(${f(e[4])}, ${f(e[5])}, ${f(e[6])})`).join(', ')});
const vec4 CL[NCL] = vec4[NCL](${C.map((e) => `vec4(${[X(e[0]), Y(e[1]), R(e[2]), e[3]].map(f).join(', ')})`).join(', ')});
#define T uA[0]
#define STAGE vec2(uA[1], uA[2])
#define U uA[3]        // seconds from the match instant: everything is where it was measured at 0
#define WASH uA[4]     // the colourist's wash: 0 = the raw grey image, 1 = fully tinted
#define ZOOM uA[5]
const vec2 ZC = vec2(0.024, -0.05);   // what the next magnification closes in on
// the inks (sRGB, each pure at its own luminance)
const vec3 ORANGE = vec3(0.80, 0.49, 0.29), UMBER = vec3(0.34, 0.25, 0.19), ROSE = vec3(0.58, 0.36, 0.40);
const vec3 BLUSH = vec3(0.84, 0.75, 0.74), SKY = vec3(0.735, 0.815, 0.985), VIOLET = vec3(0.60, 0.61, 0.83), MAUVE = vec3(0.72, 0.47, 0.44);
// one cut body: d = distance to its outline (negative inside), R = its size, m = the mean
// luminance measured inside it, dk = the measured share of dark granules, l = a point fixed to it
void cut(float d, float R, float m, float dk, float tn, vec2 l, float seed, inout float s, inout vec3 ink) {
    float g0 = grainy(l, 0.021, seed + 6.0, 0.3), g1 = grainy(l, 0.0105, seed, 0.6), g2 = grainy(l, 0.0052, seed + 3.0, 0.8);
    float x = clamp(-d / R, 0.0, 1.0);                                // 0 at the outline, 1 at the centre
    float pale = smoothstep(0.5, 0.66, m), thin = smoothstep(0.3, 0.1, dk);   // thin: hardly a membrane (leftmid)
    // the inside: darker towards the membrane, mottled, with dense granules in clumps (a
    // coarse field decides where, a finer one frays them); a pale particle keeps them near
    // the membrane and a clear middle, a dark one is mostly granules
    // the inside takes the tone measured there (tn), and on it the granules: clumps that a
    // coarse field places and a finer one frays, zero on average so the tone holds; a pale
    // particle keeps them near the membrane, a dark one has them everywhere
    float near = mix(1.0, mix(0.85, 0.20, pale), smoothstep(0.10, 0.45, x));
    float gran = clamp(0.30 * g0 + 0.65 * g1 + 0.30 * g2, -1.0, 1.0) * near;
    float clump = max(gran, 0.0) * 1.7 - 0.27;                          // dark clumps on a lighter ground, zero on average
    float inner = tn * 1.05 * (1.0 - mix(0.40, 0.70, smoothstep(0.25, 0.7, dk)) * clump);
    grit = mix(grit, 0.20 * g2 + 0.08 * g1, inside(d, 0.004));
    // the membrane: a dark band just inside the outline, lumpy, never of one thickness
    float w = 0.0062 * (1.0 + 0.7 * g1) * mix(1.0, 0.5, thin), band = 0.85 * shell(d + 0.0065 + 0.002 * g2, w);   // (its breadth is in the tone)
    // outside it: a rose fringe of spikes, then a pale halo where the stain was kept away
    float fr = smoothstep(0.018, 0.0, d + 0.003 * g1) * (0.85 + 0.2 * g1);
    float halo = smoothstep(0.042, 0.018, d);
    float body = inside(d, 0.003);
    s = mix(s, 0.79, halo * (1.0 - body));
    ink = mix(ink, BLUSH, halo);
    s = mix(s, mix(0.74, 0.44, fr), fr * (1.0 - body));
    ink = mix(ink, ROSE, clamp(fr, 0.0, 1.0) * (1.0 - body));
    s = mix(s, inner, body);
    ink = mix(ink, mix(ORANGE, MAUVE, 0.5 * thin), body);
    s = mix(s, 0.09, clamp(band, 0.0, 1.0) * mix(1.0, 0.6, thin));
    ink = mix(ink, UMBER, 0.85 * clamp(band, 0.0, 1.0));
}
void specimen(vec2 p, out float s, out vec3 ink) {
    vec2 q = (p - ZC) / ZOOM + ZC - STAGE;
    // ---- the field: pale, even, with wisps of thin matter
    float wisp = 0.0;
    for (int i = 0; i < NCL; i++) wisp += CL[i].w * exp(-dot(q - CL[i].xy, q - CL[i].xy) / (CL[i].z * CL[i].z));
    wisp *= smoothstep(0.22, 0.62, fbm(q * 7.0 + 2.0 + 0.02 * T));
    s = 0.805 + 0.02 * (fbm(q * 3.0) - 0.5) - 0.24 * wisp - 0.06 * smoothstep(0.0, -0.45, q.y) * smoothstep(0.35, -0.35, q.x);
    ink = mix(SKY, VIOLET, clamp(1.6 * wisp, 0.0, 1.0));
    grit = 0.035 * grainy(q, 0.0058, 1.0, 0.6) * (1.0 + 4.0 * wisp);
    // the cluster sits in a thin pool of its own matter, pinkish and a little denser than the field
    vec2 pc = (q - vec2(0.13, -0.03)) / vec2(0.60, 0.40);
    float pool = smoothstep(1.0, 0.45, length(pc) + 0.25 * (fbm(q * 4.0 + 11.0) - 0.5));
    s = mix(s, 0.69, 0.9 * pool);
    ink = mix(ink, BLUSH, 0.9 * pool);
    // ---- particles outside the section: soft mauve discs, no membrane. Only the nearest one
    // is shaded (they never overlap): a renderer that runs every branch pays for every
    // grain field it meets, so choose first and grain once
    {
        float gd = 1e3, gR = 0.1, gk = 1.0, gz = 0.0, gs = 0.0;
        vec2 gq = q;
        for (int i = 0; i < NG; i++) {
            vec3 h = hash3(vec2(float(i), 41.0));
            vec2 c = GA[i].xy + (h.xy - 0.5) * 0.010 * U, l = rot(GF[i].x) * (q - c);
            float d = body(l, GA[i].zw, float(i) + 20.0, 0.11, T * 0.5);
            if (d < gd) { gd = d; gq = l; gR = min(GA[i].z, GA[i].w); gk = 1.0 - GF[i].y; gz = GF[i].z; gs = float(i); }
        }
        float g1 = grainy(gq, 0.010, gs + 30.0, 0.6), g2 = grainy(gq, 0.0052, gs + 33.0, 0.8), g0 = grainy(gq, 0.022, gs + 36.0, 0.3);
        float d = gd + 0.006 * g1 + 0.008 * grainy(gq, 0.03, gs + 39.0, 0.2);   // no clean edge: it is out of the plane
        float in1 = inside(d + 0.004, 0.014), halo = smoothstep(0.06, 0.0, d);
        float v = mix(0.43, 0.52, smoothstep(0.0, 0.8, -d / gR)) * (1.0 - 0.3 * gz) * (1.0 + 0.06 * g0) * (1.0 - 0.55 * smoothstep(0.2, 0.7, 0.15 * g0 + g1 * 0.7 + g2 * 0.35));
        s = mix(s, 0.82, halo * 0.8 * gk);
        ink = mix(ink, BLUSH, halo * gk);
        s = mix(s, mix(0.74, v, gk), in1 * mix(0.55, 1.0, gk));
        ink = mix(ink, MAUVE, in1 * mix(0.5, 1.0, gk));
        grit = mix(grit, 0.24 * g2 + 0.12 * g1, in1 * gk);
    }
    // ---- the cut particles; two lobes of one body are joined by a neck. Again only the
    // nearest body is shaded
    float d = 1e3, m = 0.5, dk = 0.5, R = 0.1, seed = 0.0, tn = 0.5, dmin = 1e3, tout = 0.8, xout = 9.0;
    float bd = 1e3, bm = 0.5, bdk = 0.5, bR = 0.1, bseed = 0.0, btn = 0.5;
    vec2 l = q, bl = q;
    for (int i = 0; i < NL; i++) {
        bool first = i == 0 || LB[i].x != LB[i - 1].x;
        if (first) {
            if (d < bd) { bd = d; bm = m; bdk = dk; bR = R; bseed = seed; btn = tn; bl = l; }
            d = 1e3;
        }
        vec3 h = hash3(vec2(LB[i].x, 57.0));
        vec2 c = LA[i].xy + (h.xy - 0.5) * 0.008 * U;
        // a bud pulls away from its parent as the shot runs
        if (!first) c += normalize(LA[i].xy - LA[i - 1].xy) * 0.0045 * U;
        vec2 li = q - c;
        float a = atan(li.y, li.x);
        float ro = outline(i, a) * (1.0 + 0.012 * sin(T * 0.6 + 3.0 * a + float(i)));   // it breathes
        float di = length(li) - ro, ti = tone(i, a, length(li) / ro);
        if (di < dmin) { dmin = di; tout = ti; xout = length(li) / ro; }
        if (first) { d = di; m = LA[i].z; dk = LA[i].w; R = LB[i].y; l = li; seed = float(i) + 5.0; tn = ti; }
        else {
            float k = 0.045, hh = clamp(0.5 + 0.5 * (d - di) / k, 0.0, 1.0);
            m = mix(m, LA[i].z, hh);
            dk = mix(dk, LA[i].w, hh);
            tn = mix(tn, ti, hh);
            R = mix(R, LB[i].y, hh);
            l = mix(l, li, step(0.5, hh));
            d = smin(d, di, k);
        }
    }
    if (d < bd) { bd = d; bm = m; bdk = dk; bR = R; bseed = seed; btn = tn; bl = l; }
    cut(bd, bR, bm, bdk, btn, bl, bseed, s, ink);
    // just outside a particle (its fringe, its halo, the dark gap where two nearly touch)
    // the tone is the one measured round the nearest lobe
    float ow = smoothstep(1.36, 1.22, xout) * smoothstep(-0.001, 0.004, dmin);
    s = mix(s, tout, ow);
    ink = mix(ink, ROSE, ow * smoothstep(0.62, 0.42, tout));
    // the body with a second membrane folded inside it (the bean at the top)
    {
        vec2 li = rot(-0.3) * (q - LA[5].xy - (hash3(vec2(4.0, 57.0)).xy - 0.5) * 0.008 * U - vec2(-0.004, -0.020));
        float gi = grainy(li, 0.009, 78.0, 0.6);
        float di = body(li, vec2(0.070, 0.031), 77.0, 0.10, T * 0.5) + 0.003 * gi;
        float ring = shell(di, 0.0055 * (1.0 + 0.4 * gi)) + 0.6 * shell(di + 0.015, 0.004);
        s = mix(s, 0.09, clamp(ring, 0.0, 1.0));
        ink = mix(ink, UMBER, 0.7 * clamp(ring, 0.0, 1.0));
    }
    // ---- the wash: until the colourist reaches a place it is the raw grey image
    float front = smoothstep(0.0, 0.25, WASH * 3.3 - 0.5 - (p.x / uAspect + 0.5) - 0.9 * (fbm(p * 3.0 + 7.0) - 0.5) - 0.25 * (0.5 - p.y));
    ink = mix(vec3(lum(ink)), ink, front);
}
`;
    },
    frame(t, edge) {
        const M = this.MATCH, u = t - M;
        const a = [t, 0.002 * u, 0.001 * u, u, Ease.inOut(Ease.seg(t, 1.3, 2.9)), 1 + 0.9 * edge.out];
        // the image arrives out of focus; the operator pulls it in, a little too far, and back
        const defocus = Motion.keys([[0, 3.4], [0.9, 0.0], [1.2, 0.7], [1.6, 0.1]], t, Ease.inOut) + 0.05 * Math.sin(t * 1.2) + 2.6 * edge.out;
        const detector = {
            soft: 0.9, defocus, fringe: 0.3 + 0.3 * defocus, fringeWidth: 2.5,
            noise: { amount: 0.045, power: 0.4, floor: 0.001, size: 4.6, live: 0.6, hold: 2, sharp: 0.6, fine: 0.3 },
            bleed: 1.8, light: [1, 1 - 0.13 * a[4], 1 - 0.32 * a[4]],   // (highlights burn to cream only once tinted)
            // the beam comes on at the start of the film and dips at the change of magnification
            gain: (0.12 + 0.88 * Ease.out(Ease.seg(t, 0, 0.6))) * (1 - 0.7 * edge.out),
        };
        return { a, detector, stage: [a[1], a[2]] };
    },
    overlay(g, t, env) {
        Micrograph.databar(g, env, { x: env.W - 56 - 316, len: 316, label: '200 nm', font: 'VT323', size: 34, colour: '#141a2c', shadow: 'rgba(255,255,255,0.5)', alpha: Ease.seg(t, 0.5, 0.9) * (1 - Ease.seg(t, 5.1, 5.25)) });
    },
};
