# Automatic review · sandbox/2026-11-19-souvenir-test/dev/dome/scene.js

960×540 px · 24 fps · 8.92 s · 214 frames

## Warnings

- **Non-deterministic** at 4.88 s: the frame changes depending on what was painted before (leftover state, Math.random, Date, a badly keyed cache).

## Motion

Energy per second (how much the image changes):

```
▃███▇██▆▁
0    5    
```

No still stretches of 1 s or more.

Large jumps outside cuts (can be normal in dense patterns; check whether they bother): 1.50 s.

## Speed

Painting: 3102 ms/frame cold, 3044 ms warm → full render ≈ 651 s at this size.

> Slow: cache static elements with `Motion.sprite` and lower the texture density.

## Contact sheet

![sheet](sheet.jpg)
