# Detail gate · 2026-11-17-blueprint-test: PASS

1 instants, 12×12 tiles.

| check | value | limit |
|---|---|---|
| colour median | 6.0 | ≤ 8 ✓ |
| colour p90 | 11.3 | ≤ 27 ✓ |
| tiles too clean (%) | 0.7 | ≤ 6 ✓ |
| tiles too busy (%) | 1.4 | ≤ 12 ✓ |

Flagged tiles: **3** (colour > 35, or texture outside 0.6–1.6 of the reference).

| t | tile x,y | colour | texture (ours ÷ ref) | why |
|---|---|---|---|---|
| 13.50 | 10,0 | 6 | 0.59 | too clean |
| 13.50 | 9,1 | 7 | 1.79 | too busy |
| 13.50 | 9,9 | 8 | 1.70 | too busy |
