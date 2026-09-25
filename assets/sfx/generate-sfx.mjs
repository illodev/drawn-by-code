// Generates the sound effects with ElevenLabs (endpoint /v1/sound-generation).
//
//   ELEVENLABS_API_KEY=... node generate-sfx.mjs            # the missing ones
//   ELEVENLABS_API_KEY=... node generate-sfx.mjs stamp pop  # redo these
//
// The key comes from the ELEVENLABS_API_KEY environment variable and never goes in the repo.
import fs from 'node:fs';
const KEY = (process.env.ELEVENLABS_API_KEY || '').trim();
if (!KEY) {
    console.error('Missing ELEVENLABS_API_KEY');
    process.exit(1);
}
const SFX = {
    ticket: ['a single small paper receipt flicked through a door mail slot, quick crisp paper swish, dry, close', 0.6],
    box_rumble: ['a cardboard box stuffed with papers rattling and shaking on a wooden shelf, building tension', 2],
    box_burst: ['cardboard box bursting open, lid popping off, dozens of paper sheets exploding into the air, cartoon', 1.6],
    accordion: ['long paper sheets unfolding fast like an accordion, crisp paper whoosh', 0.7],
    calc_glitch: ['broken pocket calculator making glitchy wrong beeps, cartoon', 0.7],
    stamp: ['heavy rubber stamp slammed down hard on paper on a wooden desk, punchy thump', 0.4],
    paper_swirl: ['whirlwind of paper sheets fluttering and swirling around a room', 2.5],
    glitch: ['short digital glitch stutter, quick', 0.3],
    vortex: ['cartoon whoosh sucking everything into a vortex, fast rising', 0.8],
    catch: ['quick cartoon whoosh ending in a paper snap as a hand catches a flying paper', 0.5],
    box_unfold: ['cardboard box flaps unfolding one after another, soft cardboard creaks and flaps', 1.4],
    reveal: ['warm soft reveal, a paper card popping up with a gentle marimba note, cartoon', 0.9],
    typing: ['fast typing on a smartphone touch screen, soft taps', 0.8],
    tap: ['single finger tap on a phone screen, soft click', 0.25],
    pop: ['cartoon pop as a small character appears, cute and quick', 0.35],
    padlock: ['small metal padlock snapping shut, satisfying click', 0.35],
    boing: ['cartoon rubber bounce boing as something rebounds off metal', 0.6],
    van: ['small delivery van driving past quickly on a street, short', 1.1],
    stapler: ['office stapler stapling paper, crisp click', 0.3],
    shutter: ['smartphone camera shutter sound', 0.3],
    swoosh_in: ['several paper receipts swooshing into a folder, quick', 0.6],
    page_flips: ['calendar pages being torn off and flipping rapidly', 1],
    tick: ['mechanical wall clock ticking, steady and clear', 2.5],
    scribble: ['felt-tip marker writing quickly on paper, squeaky strokes', 1],
    zip: ['a zipper pulled closed quickly', 0.4],
    coins: ['a few coins jingling onto a table, pleasant', 0.7],
    drawer_thud: ['muffled thud from inside a closed wooden drawer, something bumping inside', 0.4],
    wheel: ['pottery wheel spinning, soft whirring hum with wet clay', 1.5],
    scan: ['friendly scanner sweep, soft rising digital beeps as a document is read', 0.9],
    inflate: ['cartoon inflate, quick soft puff as something gets a bit bigger', 0.5],
    flyby: ['cartoon superhero flying past quickly, airy whoosh left to right', 1.4],
    whoosh_close: ['whoosh approaching the camera fast and getting louder, ending in a soft whump', 1.6],
    spin_rise: ['psychedelic swirling whoosh that spins faster and rises, then settles', 6],
    // saas-promo
    paper_rain: ['many sheets of paper and envelopes falling and piling onto a wooden desk, rustling thuds, busy', 2.5],
    paper_land: ['a single stack of papers landing flat on a wooden desk, soft slap', 0.4],
    suck_up: ['cartoon vacuum whoosh sucking dozens of paper sheets up into the air, rising, ends with a soft pop', 2],
    button_click: ['soft satisfying click of a big rubber button being pressed', 0.3],
    phone_buzz: ['smartphone vibrating on a wooden desk, two short buzzes', 0.8],
    bell_ding: ['small desk service bell ding, bright and friendly', 0.8],
    mail_clank: ['paper envelope dropped into a metal mailbox slot, the flap clanks shut', 0.6],
    paper_fold: ['a sheet of paper being folded quickly three times into a paper plane, crisp creases', 0.8],
    plane_whoosh: ['light paper plane flying past, soft airy whoosh', 0.9],
    page_turn: ['a single calendar page flipped over, crisp paper flap', 0.5],
    brass_ring: ['a brass telescope focusing ring turned slowly by hand, fine metallic friction, close and quiet', 0.8],
    ball_knock: ['a small brass ball dropped a short height onto a wooden table, one dry knock with no bounce', 0.4],
    pencil_circle: ['a graphite pencil drawing one quick circle on paper, soft scratch', 0.7],
    glass_set: ['a small glass dish set down gently on a wooden laboratory bench, a light clink', 0.4],
    magnet_slide: ['a steel bar sliding into a cardboard tube wound with wire, soft metallic scrape', 0.6],
    chalk_tap: ['a piece of chalk tapping twice on a blackboard', 0.4],
    chime_ok: ['soft friendly confirmation chime, two rising marimba notes', 0.7],
};
const only = process.argv.slice(2);
for (const [name, [text, dur]] of Object.entries(SFX)) {
    if (only.length && !only.includes(name)) continue;
    const out = `${name}.mp3`;
    if (fs.existsSync(out) && !only.length) continue;
    const res = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': KEY },
        body: JSON.stringify({ text, duration_seconds: Math.max(0.5, dur), prompt_influence: 0.45 }),
    });
    if (!res.ok) {
        console.log(`FAILED ${name}: ${res.status} ${(await res.text()).slice(0, 200)}`);
        continue;
    }
    fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
    console.log(`ok ${name}`);
}
