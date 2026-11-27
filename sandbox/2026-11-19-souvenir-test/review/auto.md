# Automatic review · sandbox/2026-11-19-souvenir-test/scene.js

960×540 px · 24 fps · 16.75 s · 402 frames

## Warnings

- **Non-deterministic** at 3.33 s: the frame changes depending on what was painted before (leftover state, Math.random, Date, a badly keyed cache).
- **Flat frames** (a single color) at 16.67 s.

## Motion

Energy per second (how much the image changes):

```
▂▅▅▆▇▇▇██▇██▄▃▃▃▄
0    5    10   15   
```

No still stretches of 1 s or more.

Large jumps outside cuts (can be normal in dense patterns; check whether they bother): 7.33 s, 8.17 s, 8.33 s.

## Speed

Painting: 10637 ms/frame cold, 7099 ms warm → full render ≈ 2854 s at this size.

> Slow: cache static elements with `Motion.sprite` and lower the texture density.

## Contact sheet

![sheet](sheet.jpg)
