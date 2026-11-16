# Fidelity of the drawings in code to their sheets · round 39

`sh tools/score.sh <renders of dev/fidelity at 3840>`: each sheet beside its drawing in code on the same green, both blurred a little (a line a pixel out does not count; a lost detail or a wrong colour does). «Off»: the share of the sheet that differs by more than 34 levels. «Gaps» (`tools/gaps.py`): places inside a figure, of two sheet pixels or more, where the drawing shows the ground. Two of them are stray marks of the generator taken out on purpose (`FLAWS` in `tools/green.py`: `milo-leap`, `pip-leap`), and one is ground the sheet itself shows inside a strap (`hoagie-leap`).

| Sheet | off before | off after | mean before | mean after | gaps |
|---|---|---|---|---|---|
| `kit-sheet` | 0.61 % | 0.45 % | 7.73 | 7.60 | 0 |
| `kit-drop-a` | 0.44 % | 0.32 % | 7.16 | 7.00 | 1 |
| `kit-drop-b` | 0.54 % | 0.38 % | 7.32 | 7.17 | 0 |
| `kit-ride` | 0.56 % | 0.36 % | 7.42 | 7.18 | 0 |
| `hoagie-sheet` | 0.74 % | 0.49 % | 9.64 | 9.43 | 0 |
| `hoagie-keys` | 0.80 % | 0.31 % | 7.30 | 6.93 | 0 |
| `hoagie-seq-turn` | 0.82 % | 0.47 % | 7.54 | 7.34 | 0 |
| `hoagie-seq-thumb` | 1.12 % | 0.55 % | 7.49 | 7.01 | 0 |
| `milo-sheet` | 0.72 % | 0.23 % | 7.34 | 6.94 | 0 |
| `milo-keys` | 0.64 % | 0.31 % | 7.13 | 6.89 | 0 |
| `pip-sheet` | 0.34 % | 0.24 % | 10.19 | 10.10 | 0 |
| `pip-keys` | 0.40 % | 0.26 % | 8.25 | 8.11 | 0 |
| `dot-sheet` | 0.29 % | 0.24 % | 6.19 | 6.15 | 0 |
| `dot-keys` | 0.59 % | 0.40 % | 6.79 | 6.65 | 0 |
| `captain-sheet` | 0.44 % | 0.30 % | 7.59 | 7.37 | 0 |
| `captain-keys` | 0.47 % | 0.40 % | 7.19 | 7.11 | 0 |
| `hoagie-seq-tween` | 0.98 % | 0.50 % | 8.84 | 8.53 | 0 |
| `hoagie-run` | 0.87 % | 0.29 % | 7.41 | 7.07 | 0 |
| `milo-run` | 1.17 % | 0.26 % | 7.36 | 6.79 | 0 |
| `kit-skate` | 0.87 % | 0.34 % | 7.95 | 7.59 | 0 |
| `pip-scoot` | 0.62 % | 0.25 % | 7.48 | 7.19 | 3 |
| `captain-flap` | 0.36 % | 0.23 % | 7.59 | 7.47 | 0 |
| `hoagie-leap` | 0.92 % | 0.34 % | 7.72 | 7.37 | 1 |
| `milo-leap` | 1.21 % | 0.40 % | 7.61 | 7.09 | 2 |
| `kit-leap` | 0.88 % | 0.31 % | 7.77 | 7.36 | 0 |
| `pip-leap` | 0.73 % | 0.29 % | 8.06 | 7.72 | 1 |
| `kit-land` | (new) | 0.41 % | | 7.16 | 0 |

All 26 sheets that existed before: off 0.70 % → 0.34 %, mean difference 7.69 → 7.43; 8 gaps in all 27 sheets.
