// drawn-by-code · the site's behaviour: the live title and its readout, the films, the live
// plates of the styles (each an iframe running its template through site/embed.html), the
// source drawer, the ledger of notes. No framework; the data is at the top.
(() => {
    const ROOT = document.documentElement.dataset.root;
    const GH = 'https://github.com/illodev/drawn-by-code';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (s, el = document) => el.querySelector(s);
    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    // --- data -----------------------------------------------------------------------------
    // [id, sandbox folder, title, style, seconds, layout, description, study credit?]
    const FILMS = [
        ['physics-history', '2026-09-25-physics-history', 'A Brief History of Physics', 'risograph', 67, 'half',
            'Galileo’s eye at the telescope pulls back to a rooftop in Padua; Jupiter becomes the apple a cat pushes onto Newton’s head; its orbit winds into Faraday’s coil, and on to Curie, Einstein and a box where the cat is alive and dead in sixteen worlds. One chain of objects, one cat.'],
        ['pyramid-engraving', '2026-09-26-pyramid-engraving', 'The pyramid that makes skies', 'engraving', 64, 'half',
            'A plate of the «Description de l’Égypte» comes alive: the pyramid opens into thousands of floating blocks and the camera flies, without a cut, through a temple’s rooms to a seed that holds a sky of its own. 3D in WebGL, drawn in charcoal on old paper.'],
        ['saas-promo', '2026-09-24-saas-promo', 'Paperwork, cleared', 'paper cutout', 50, 'wide',
            'A product film for an invoicing app: a desk buried in paperwork is cleared block by block, with real hands, a paper interface and an office that is all torn edges. Built by parallel agents on one brief.'],
        ['coffee-first', '2026-09-24-coffee-first', 'Coffee first', 'paper cutout', 6, 'small',
            'A mug wakes up before its owner. The steam had to be born in the coffee, not beside the mug.'],
        ['opus5-riso', '2026-09-24-opus5-riso', 'opus5-riso', 'risograph', 28, 'square',
            'Four spot inks, halftone and misregistration from a simulated press, scored tile by tile against the original.', 'study'],
        ['what-do-you-love', '2026-09-24-what-do-you-love', 'what do you love?', 'paper cutout', 28, 'square',
            'Measured drawing by drawing until the differences only show when zooming in.', 'study'],
        ['exquisite-corpse', '2026-09-24-exquisite-corpse', 'Exquisite corpse', 'five styles', 30, 'square-ish',
            'One object travels through five styles joined by transitions: paper, a 70s poster, liquid light, a kaleidoscope and a line.'],
    ];
    const FEATURE = ['red-thread', '2026-11-04-red-thread', 'The Red Thread', 'sumi-e', 68,
        'A river village splits in two when a black sleeve drops broadsheets into every pair of hands; two children’s kite string becomes a new bridge. Japanese ink on washi, every brushstroke drawn in code; music by ElevenLabs.'];

    // [folder, name, look, approved?, kit lines, template lines, logical aspect]
    const STYLES = [
        ['paper-cutout', 'Paper cutout', 'Torn paper, marker fill, grain and handwriting; real hands that hold things the right way round.', 1, 613, 38],
        ['risograph', 'Risograph', 'Four spot inks, halftone plates, overprints that make the other colours, misregistration.', 1, 246, 28, 'square'],
        ['sumi-e', 'Sumi-e', 'Japanese ink on washi: one black in many greys, dry-brush streaks, mist, vermilion as the only colour.', 0, 1207, 39],
        ['engraving', 'Engraving', 'A plate of the «Description de l’Égypte»: charcoal tone on toothed paper, masonry stone by stone.', 0, 2313, 48, 'gl'],
        ['clay3d', 'Clay 3D', 'Plasticine puppets raymarched in WebGL: lumpy pressed-on pieces, fingerprints, studio light.', 0, 296, 35, 'gl'],
        ['70s-poster', '70s poster', 'Flat acid colours, thick outlines, concentric echoes, sunbursts and melting letters.', 1, 158, 22],
        ['comic', 'Comic', 'Brush-ink outlines with tapered ends, flat print colours on newsprint, Ben-Day dots, balloons.', 0, 646, 148],
        ['felt3d', 'Felt 3D', 'Needle-felted wool: a halo of stray fibres on every silhouette, glass-bead eyes, stitched mouths.', 0, 338, 50, 'gl'],
        ['liquid-light', 'Liquid light', 'The oil-and-ink projections of 60s concerts: blobs that flow, merge and shift colour.', 1, 169, 14],
        ['tabletop3d', 'Tabletop 3D', 'An office in miniature: a paper clip, an eraser, a stapler, photographed like stop motion.', 0, 521, 151, 'gl'],
        ['pixel-art', 'Pixel art', 'Crisp pixels on a low-res grid, sprites as string maps, tiny lives in ten-frame loops.', 0, 192, 87],
        ['clay', 'Clay', 'Plasticine in 2D: pieces lit from the top left, fingerprints, tool marks and a waxy sheen.', 0, 249, 29],
        ['kaleidoscope', 'Kaleidoscope', 'Radial mirror symmetry; pieces born at the centre, rotation and colour cycling.', 1, 53, 30],
        ['line', 'Line', 'A black line on white paper that wobbles on purpose, at twelve drawings a second.', 1, 74, 28],
    ];
    const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'];

    // [date, experiment folder, what the note found (a headline), what it became, file]
    const NOTES = [
        ['2026-11-04', '2026-11-04-red-thread', 'The mountains didn’t read as ink painting',
            'An ink landscape is painted as one opaque sheet: no parallax, mist made of paper, and every piece built the way the reference builds it, cropped three times larger first.',
            '.claude/skills/style-sumi-e/SKILL.md'],
        ['2026-09-24', '2026-09-24-saas-promo', 'Her hands held the coffee the wrong way round',
            'A skill of its own: a photo reference for every grip, the hand drawn by side and view, one skin, and a hand check sheet a person approves before any render.',
            '.claude/skills/hands/SKILL.md'],
        ['2026-09-24', '2026-09-24-coffee-first', 'The steam rose beside the mug, not from the coffee',
            'Whatever emanates is born at its source, and real phenomena are stylized from a real reference: the paper kit’s wisp was redrawn from a photo of steam.',
            'styles/paper-cutout/kit.js'],
        ['2026-09-24', '2026-09-24-what-do-you-love', 'A replica you have to zoom into to tell apart',
            'The detail gate: a replica is scored zone by zone against its reference, texture, colour and missing pieces, and must pass before anyone sees it.',
            'engine/detail.mjs'],
        ['2026-11-04', '2026-11-04-red-thread', 'A villager walked straight through the kite string',
            'A script checks every pair of figures against each other over the whole timeline, and every body against the string. Stills never showed it; the script found nineteen.',
            'sandbox/2026-11-04-red-thread/tools/check-overlap.mjs'],
    ];

    // --- the bar ---------------------------------------------------------------------------
    const bar = $('.bar');
    const onScroll = () => bar.classList.toggle('scrolled', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const navLinks = [...document.querySelectorAll('.bar nav a')];
    const sections = navLinks.map((a) => $(a.getAttribute('href')));
    const navObs = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => s && navObs.observe(s));

    // --- live scenes -----------------------------------------------------------------------
    const lives = new Map();   // id → { frame: iframe, onFrame }
    const embedUrl = (scene, id, o = {}) => `embed.html?scene=${encodeURIComponent(scene)}&id=${id}&max=${o.max ?? 960}&after=${o.after ?? 'loop'}`;
    addEventListener('message', (e) => {
        const m = e.data;
        if (!m || m.src !== 'dbc') return;
        const live = lives.get(m.id);
        if (!live) return;
        if (m.type === 'ready') live.onReady?.(m);
        if (m.type === 'frame') live.onFrame?.(m);
        if (m.type === 'error') live.onError?.(m);
    });
    const send = (iframe, msg) => iframe.contentWindow?.postMessage(msg, '*');

    // the title
    const hero = $('#hero');
    const scrub = $('#hero-scrub'), playBtn = $('#hero-play');
    const LOOP_FROM = 6, LOOP_TO = 30;      // after it is assembled, the carousel runs; at 30 s it rewinds to 6 s
    let heroPlaying = !reduced, heroVisible = true, heroReady = false;
    const setHeroPlaying = (p) => {
        heroPlaying = p;
        playBtn.classList.toggle('paused', !p);
        playBtn.setAttribute('aria-label', p ? 'Pause the title' : 'Play the title');
        if (heroReady) send(hero, { cmd: p && heroVisible ? 'play' : 'pause' });
    };
    lives.set('hero', {
        frame: hero,
        onReady: (m) => {
            heroReady = true;
            scrub.max = LOOP_TO * m.fps - 1;
            if (reduced) send(hero, { cmd: 'seek', t: 5.9 });
            setHeroPlaying(heroPlaying);
        },
        onError: (m) => {
            // the rendered cover keeps playing underneath; the readout says why
            console.warn('live title:', m.message);
            $('#r-ms').textContent = 'n/a';
            $('#stage').querySelector('.fallback')?.play().catch(() => {});
        },
        onFrame: (m) => {
            if (m.ms != null && !hero.parentNode.classList.contains('live-on')) {
                // the live title takes over from the rendered one at the same moment
                const v = hero.parentNode.querySelector('.fallback');
                hero.parentNode.classList.add('live-on');
                if (v) {
                    v.pause();
                    if (v.currentTime > 0.1 && !reduced) send(hero, { cmd: 'seek', t: v.currentTime });
                }
            }
            $('#r-t').textContent = m.t.toFixed(3).padStart(6, '0');
            $('#r-f').textContent = String(m.frame).padStart(3, '0');
            $('#r-ms').textContent = m.ms.toFixed(1);
            $('#r-rand').textContent = m.random;
            if (!scrubbing) {
                scrub.value = m.frame;
                scrub.style.setProperty('--p', (100 * m.frame / scrub.max).toFixed(2) + '%');
            }
            if (m.t >= LOOP_TO) send(hero, { cmd: 'seek', t: LOOP_FROM });
        },
    });
    hero.src = embedUrl(hero.dataset.scene, 'hero', { max: 1800, after: 'run' });
    let scrubbing = false;
    scrub.addEventListener('input', () => {
        scrubbing = true;
        setHeroPlaying(false);
        scrub.style.setProperty('--p', (100 * scrub.value / scrub.max).toFixed(2) + '%');
        send(hero, { cmd: 'seek', t: scrub.value / 24 });
    });
    scrub.addEventListener('change', () => { scrubbing = false; });
    playBtn.addEventListener('click', () => setHeroPlaying(!heroPlaying));
    new IntersectionObserver(([e]) => {
        heroVisible = e.isIntersecting;
        if (heroReady) send(hero, { cmd: heroPlaying && heroVisible ? 'play' : 'pause' });
    }).observe(hero);

    // --- films -----------------------------------------------------------------------------
    const videoOf = (id, dir) => `${ROOT}sandbox/${dir}/render/${id}.mp4`;
    const grid = $('#film-grid');
    grid.innerHTML = FILMS.map(([id, dir, title, style, s, layout, desc, study]) => `
        <article class="film ${layout === 'half' ? '' : layout === 'square-ish' ? 'small' : layout} reveal" data-film="${id}">
          <button class="poster" aria-label="Play ${esc(title)}">
            <img src="media/${id}.jpg" alt="" loading="lazy">
            <span class="playmark" aria-hidden="true"></span>
          </button>
          <h3>${esc(title)}${study ? '<span class="study">study</span>' : ''}</h3>
          <p class="by"><b>${style}</b> · ${s} s · <a href="${GH}/tree/main/sandbox/${dir}">notes &amp; code</a></p>
          <p class="desc">${esc(desc)}</p>
        </article>`).join('');
    const filmInfo = Object.fromEntries([FEATURE, ...FILMS].map(([id, dir, title, style, s, ...rest]) => [id, { id, dir, title, style, s, desc: id === FEATURE[0] ? FEATURE[5] : rest[1] }]));

    // hover: the poster becomes the film, muted, while the pointer rests on it
    const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
    document.querySelectorAll('[data-film] .poster').forEach((p) => {
        const f = filmInfo[p.closest('[data-film]').dataset.film];
        p.addEventListener('click', () => openFilm(f));
        if (!canHover || reduced) return;
        let v, timer;
        p.addEventListener('pointerenter', () => {
            timer = setTimeout(() => {
                v = document.createElement('video');
                Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'auto', src: videoOf(f.id, f.dir) });
                v.setAttribute('aria-hidden', 'true');
                p.insertBefore(v, p.querySelector('.playmark'));
                v.addEventListener('playing', () => p.classList.add('previewing'), { once: true });
                v.play().catch(() => {});
            }, 180);
        });
        p.addEventListener('pointerleave', () => {
            clearTimeout(timer);
            p.classList.remove('previewing');
            if (v) { const old = v; v = null; setTimeout(() => old.remove(), 400); old.pause(); }
        });
    });
    const player = $('#player'), pv = $('#player-video');
    function openFilm(f) {
        $('#player-title').textContent = f.title;
        $('#player-desc').textContent = `${f.style} · ${f.s} s — ${f.desc}`;
        pv.src = videoOf(f.id, f.dir);
        pv.poster = `media/${f.id}.jpg`;
        player.showModal();
        pv.play().catch(() => {});
    }
    player.addEventListener('close', () => { pv.pause(); pv.removeAttribute('src'); pv.load(); });
    player.addEventListener('click', (e) => { if (e.target === player) player.close(); });

    // --- the atlas -------------------------------------------------------------------------
    const plates = $('#plates');
    plates.innerHTML = STYLES.map(([dir, name, look, ok, kit, tpl, kind], i) => `
        <article class="plate reveal" data-style="${dir}">
          <div class="plate-frame${kind === 'square' ? ' square' : ''}" tabindex="0" role="button" aria-label="${esc(name)}: live template, press to pause or play">
            <span class="live-dot">live</span>
            <span class="wait">painting…</span>
          </div>
          <div class="plate-cap">
            <span class="pl">Pl. ${ROMAN[i]}</span>
            <h3>${esc(name)}</h3>
            <p>${esc(look)}</p>
          </div>
          <div class="plate-foot">
            <span class="status${ok ? '' : ' testing'}">${ok ? 'approved' : 'in testing'} · kit ${kit.toLocaleString('en')} lines</span>
            <button class="src" data-path="styles/${dir}/template.js">Read the source</button>
          </div>
        </article>`).join('') + `
        <article class="plate yours reveal">
          <div class="plate-frame">
            <a href="${GH}/blob/main/CONTRIBUTING.md"><span class="hand">The fifteenth plate<br>is yours to draw.</span><span>How to add a style →</span></a>
          </div>
          <div class="plate-cap">
            <span class="pl">Pl. XV</span>
            <h3>Your style</h3>
            <p>Woodcut, stained glass, isometric, anime, a look nobody has named yet: a kit, a template, a skill, by pull request.</p>
          </div>
        </article>`;

    // iframes are made when a plate comes near, and run only while it is on screen
    const plateState = new Map();
    const loadObs = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        loadObs.unobserve(e.target);
        const frame = e.target, art = frame.closest('.plate'), dir = art.dataset.style;
        const kind = STYLES.find((s) => s[0] === dir)[6];
        const id = 'pl-' + dir;
        const ifr = document.createElement('iframe');
        ifr.title = `${dir} template, drawn live`;
        ifr.setAttribute('tabindex', '-1');
        const st = { ifr, ready: false, visible: false, paused: reduced };
        plateState.set(frame, st);
        lives.set(id, {
            frame: ifr,
            onReady: () => { st.ready = true; frame.classList.add('loaded'); sync(frame); },
            onError: (m) => { frame.querySelector('.wait').textContent = 'could not run here'; console.warn(dir, m.message); },
        });
        // raymarched styles cost far more per pixel; phones get smaller canvases
        const small = innerWidth < 700;
        ifr.src = embedUrl(`styles/${dir}/template.js`, id, { max: kind === 'gl' ? (small ? 420 : 640) : (small ? 640 : 960) });
        frame.appendChild(ifr);
        playObs.observe(frame);
    }), { rootMargin: '600px 0px' });
    const sync = (frame) => {
        const st = plateState.get(frame);
        if (!st?.ready) return;
        const run = st.visible && !st.paused;
        send(st.ifr, { cmd: run ? 'play' : 'pause' });
        frame.classList.toggle('playing', run);
    };
    const playObs = new IntersectionObserver((es) => es.forEach((e) => {
        const st = plateState.get(e.target);
        if (!st) return;
        st.visible = e.intersectionRatio > 0.3;
        sync(e.target);
    }), { threshold: [0, 0.3, 0.6] });
    document.querySelectorAll('.plate:not(.yours) .plate-frame').forEach((f) => {
        loadObs.observe(f);
        const toggle = () => { const st = plateState.get(f); if (st) { st.paused = !st.paused; sync(f); } };
        f.addEventListener('click', toggle);
        f.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });

    // --- the source drawer -----------------------------------------------------------------
    const KW = /^(const|let|var|function|return|if|else|for|of|in|new|while|break|continue|true|false|null|undefined|this|async|await|typeof|class|extends|import|export|from)$/;
    function highlight(src) {
        const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(\s*\()?/g;
        let out = '', last = 0, m;
        while ((m = re.exec(src))) {
            out += esc(src.slice(last, m.index));
            if (m[1]) out += `<span class="tk-c">${esc(m[1])}</span>`;
            else if (m[2]) out += `<span class="tk-s">${esc(m[2])}</span>`;
            else if (m[3]) out += `<span class="tk-n">${m[3]}</span>`;
            else if (KW.test(m[4])) out += `<span class="tk-k">${m[4]}</span>${m[5] ?? ''}`;
            else if (m[5]) out += `<span class="tk-f">${m[4]}</span>${m[5]}`;
            else out += m[4];
            last = re.lastIndex;
        }
        out += esc(src.slice(last));
        // one span per line, for the line numbers (spans that cross lines are split)
        const lines = out.split('\n');
        let open = '';
        return lines.map((l) => {
            const line = open + l;
            const opens = (line.match(/<span class="[^"]+">/g) || []), closes = (line.match(/<\/span>/g) || []).length;
            open = opens.length > closes ? opens[opens.length - 1] : '';
            return `<span class="ln">${line}${open ? '</span>' : ''}</span>`;
        }).join('');
    }
    const drawer = $('#code');
    document.addEventListener('click', async (e) => {
        const b = e.target.closest('.src');
        if (!b) return;
        const path = b.dataset.path;
        $('#code-path').textContent = path;
        $('#code-gh').href = `${GH}/blob/main/${path}`;
        $('#code-text').innerHTML = '<span class="ln">loading…</span>';
        drawer.showModal();
        try {
            const src = await (await fetch(ROOT + path)).text();
            $('#code-text').innerHTML = highlight(src);
        } catch {
            $('#code-text').innerHTML = '<span class="ln">Could not load the file here: read it on GitHub.</span>';
        }
    });
    drawer.addEventListener('click', (e) => { if (e.target === drawer) drawer.close(); });

    // --- the ledger ------------------------------------------------------------------------
    $('#ledger').innerHTML = NOTES.map(([date, dir, found, became, file]) => `
        <article class="reveal">
          <p class="when">${date}<br><a href="${GH}/blob/main/sandbox/${dir}/review.md">${dir.slice(11)}</a></p>
          <h4>${esc(found)}</h4>
          <p class="became"><span class="label">Became</span>${esc(became)}<br><a href="${GH}/blob/main/${file}">${file}</a></p>
        </article>`).join('');

    // --- copy, reveal ----------------------------------------------------------------------
    document.querySelectorAll('.copy').forEach((b) => b.addEventListener('click', async () => {
        const text = $('#' + b.dataset.copy).innerText.split('\n').filter((l) => !l.trim().startsWith('#')).map((l) => l.replace(/\s+#.*$/, '')).join('\n');
        try { await navigator.clipboard.writeText(text); b.textContent = 'Copied'; setTimeout(() => (b.textContent = 'Copy'), 1600); } catch {}
    }));
    document.querySelectorAll('.chapter-head, .feature, .loop, .open, .start').forEach((el) => el.classList.add('reveal'));
    const revObs = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach((el) => revObs.observe(el));
})();
