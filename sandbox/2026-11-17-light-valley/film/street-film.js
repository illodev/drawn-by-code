// Shot 10 · The street (42–51 s): the style test, retimed to the score's bars. The four
// street lamps on the beats from the farthest, the windows after them, the near lamp on the
// next bar, the door on the last; then the family stands in the light.
(() => {
    const C = Corriente;
    C.STREET_T = { L1: 9, L2: 18, L3: 27, L4: 36, L6: 45, door: 72, win: (x) => Math.round(x * 1.9) };
    C.shots.street = (blk, t, d) => Street.draw(blk, d, C.STREET_T);
})();
