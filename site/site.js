// drawn-by-code · the site's behaviour. The data is at the top: a new film or style adds one
// line. Nothing runs a scene when the page loads: films are posters until played (one video
// element, in a dialog), styles are stills until pressed (one iframe at a time, running the
// style's own template through site/embed.html, removed when the dialog closes). The old page
// ran sixteen live scenes on the page's own thread and froze browsers for seconds at a time.
(() => {
    const ROOT = document.documentElement.dataset.root;
    const GH = 'https://github.com/illodev/drawn-by-code';
    const $ = (s, el = document) => el.querySelector(s);
    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    // --- data -----------------------------------------------------------------------------
    // [id, sandbox folder, title, style, seconds, sound, description]   (site/build.mjs reads the
    // first two fields of every line to copy the film: keep them first, in this form)
    const FEATURE = ['runnin-down-a-dream', '2026-11-11-runnin-down-a-dream', 'Runnin’ Down a Dream', '’90s cereal ad', 264, 'silent', ''];
    const FILMS = [
        ['red-thread', '2026-11-04-red-thread', 'The Red Thread', 'sumi-e', 68, 'with sound',
            'A river village splits in two when a black sleeve drops broadsheets into every pair of hands; two children’s kite string becomes a new bridge. Japanese ink on washi, every brushstroke drawn in code.'],
        ['physics-history', '2026-09-25-physics-history', 'A Brief History of Physics', 'risograph', 67, 'with sound',
            'Galileo’s eye at the telescope pulls back to a rooftop in Padua; Jupiter becomes the apple a cat pushes onto Newton’s head, and on through Faraday, Curie, Einstein and a box where the cat is alive and dead. One chain of objects, one cat.'],
        ['pyramid-engraving', '2026-09-26-pyramid-engraving', 'The pyramid that makes skies', 'engraving', 64, 'with sound',
            'A plate of the «Description de l’Égypte» comes alive: the pyramid opens into thousands of floating blocks and the camera flies, without a cut, through a temple’s rooms to a seed that holds a sky of its own.'],
    ];
    // [id, sandbox folder, title, style, seconds]
    const STUDIES = [
        ['opus5-riso', '2026-09-24-opus5-riso', 'opus5-riso', 'risograph', 28],
        ['what-do-you-love', '2026-09-24-what-do-you-love', 'what do you love?', 'paper cutout', 28],
    ];
    const EXPERIMENTS = 15; // rows in sandbox/INDEX.md

    // [folder, name, look, shape of its template ('square' | 'wide'), heavy (WebGL raymarching: a smaller canvas)]
    const STYLES = [
        ['cereal-ad', '’90s cereal ad', 'A Saturday-morning TV spot on VHS: cel boxes, spinning sunbursts, extruded letters that hop, tape noise on a CRT.', 'square', 0],
        ['sumi-e', 'Sumi-e', 'Japanese ink on washi: one black in many greys, dry-brush streaks, mist, vermilion as the only colour.', 'wide', 0],
        ['risograph', 'Risograph', 'Four spot inks, halftone plates, overprints that make the other colours, misregistration.', 'square', 0],
        ['engraving', 'Engraving', 'A plate of the «Description de l’Égypte»: charcoal tone on toothed paper, masonry stone by stone.', 'wide', 1],
        ['paper-cutout', 'Paper cutout', 'Torn paper, marker fill, grain and handwriting; real hands that hold things the right way round.', 'wide', 0],
        ['clay3d', 'Clay 3D', 'Plasticine puppets raymarched in WebGL: lumpy pressed-on pieces, fingerprints, studio light.', 'wide', 1],
        ['felt3d', 'Felt 3D', 'Needle-felted wool: a halo of stray fibres on every silhouette, glass-bead eyes, stitched mouths.', 'wide', 1],
        ['tabletop3d', 'Tabletop 3D', 'An office in miniature: a paper clip, an eraser, a stapler, photographed like stop motion.', 'wide', 1],
        ['comic', 'Comic', 'Brush-ink outlines with tapered ends, flat print colours on newsprint, Ben-Day dots, balloons.', 'wide', 0],
        ['70s-poster', '70s poster', 'Flat acid colours, thick outlines, concentric echoes, sunbursts and melting letters.', 'wide', 0],
        ['liquid-light', 'Liquid light', 'The oil-and-ink projections of 60s concerts: blobs that flow, merge and shift colour.', 'wide', 0],
        ['pixel-art', 'Pixel art', 'Crisp pixels on a low-res grid, sprites as string maps, tiny lives in ten-frame loops.', 'wide', 0],
        ['clay', 'Clay', 'Plasticine in 2D: pieces lit from the top left, fingerprints, tool marks and a waxy sheen.', 'wide', 0],
        ['kaleidoscope', 'Kaleidoscope', 'Radial mirror symmetry; pieces born at the centre, rotation and colour cycling.', 'wide', 0],
        ['line', 'Line', 'A black line on white paper that wobbles on purpose, at twelve drawings a second.', 'wide', 0],
    ];
    const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];

    // [where it was said, what the person said (their words), what it became, the file it was written into]
    const NOTES = [
        ['runnin-down-a-dream · round 11', 'Casi todos los errores son de fallos de capas',
            'Layers got a review pass of their own, by reviewers who had not drawn the film: every shot at full size, every overlap cropped. Twenty-nine drawing-order faults found, twenty-five fixed before the final render.',
            '.claude/skills/review/SKILL.md'],
        ['saas-promo · round 2', 'Sus manos cogen el café al revés',
            'A skill of its own for hands: a photo reference for every grip, the hand drawn by side and view, one skin, and a hand check sheet a person approves before any render.',
            '.claude/skills/hands/SKILL.md'],
        ['red-thread · round 12', 'No entiendo en qué momento pasa todo a mal',
            'An allegorical cause shown whole from the start explains nothing. It is revealed in steps, each a readable close-up, and the whole figure only when the camera pulls back.',
            '.claude/skills/animate/SKILL.md'],
    ];

    // --- helpers ------------------------------------------------------------------------------
    const videoOf = (id, dir) => `${ROOT}sandbox/${dir}/render/${id}.mp4`;
    const folder = (dir) => `${GH}/tree/main/sandbox/${dir}`;
    const len = (s) => (s >= 100 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s} s`);
    const byId = new Map([FEATURE, ...FILMS, ...STUDIES].map((f) => [f[0], f]));

    // --- the page ------------------------------------------------------------------------------
    $('#counts').textContent = `${STYLES.length} styles · ${EXPERIMENTS} experiments · every lesson public`;
    $('#style-count').textContent = WORDS[STYLES.length] ?? String(STYLES.length);

    $('#film-list').innerHTML = FILMS.map(([id, dir, title, style, s, sound, text], i) => `
        <article class="film">
          <button class="pic" type="button" data-film="${id}" aria-label="Play ${esc(title)}">
            <img src="media/${id}.jpg" alt="" loading="lazy" width="1600" height="900">
            <span class="play"><i aria-hidden="true"></i>Play · ${len(s)}</span>
          </button>
          <div>
            <span class="num">${String(i + 2).padStart(2, '0')} · ${esc(style)} · ${len(s)} · ${sound}</span>
            <h3>${esc(title)}</h3>
            <p>${esc(text)}</p>
            <div class="links"><button type="button" data-film="${id}">Watch</button><a href="${folder(dir)}/review.md">Notes</a><a href="${folder(dir)}">Code</a></div>
          </div>
        </article>`).join('');

    $('#study-list').insertAdjacentHTML('afterbegin', STUDIES.map(([id, dir, title, style, s]) => `
        <div>
          <button class="pic" type="button" data-film="${id}" aria-label="Play ${esc(title)}">
            <img src="media/${id}.jpg" alt="" loading="lazy" width="900" height="900">
            <span class="play"><i aria-hidden="true"></i>Play · ${len(s)}</span>
          </button>
          <h4>${esc(title)}</h4>
          <span class="meta">study · ${esc(style)} · ${len(s)} · <a href="${folder(dir)}">code</a></span>
        </div>`).join(''));

    $('#style-grid').innerHTML = STYLES.map(([dir, name], i) => `
        <button class="st" type="button" data-style="${i}" aria-label="Run ${esc(name)} live">
          <img src="media/styles/${dir}.jpg" alt="" loading="lazy" width="640" height="480">
          <span class="st-cap"><b>${esc(name)}</b><span>▶ live</span></span>
        </button>`).join('');

    $('#note-list').innerHTML = NOTES.map(([where, said, became, file]) => `
        <article>
          <span class="meta">${esc(where)}</span>
          <q lang="es">${esc(said)}</q>
          <p>${esc(became)}</p>
          <a href="${GH}/blob/main/${file}">${esc(file)}</a>
        </article>`).join('');

    // --- one film at a time ---------------------------------------------------------------------
    const player = $('#player'), pv = $('#player-video');
    const openFilm = (id) => {
        const f = byId.get(id);
        if (!f) return;
        pv.src = videoOf(f[0], f[1]);
        pv.poster = `media/${f[0]}.jpg`;
        $('#player-title').textContent = f[2];
        player.showModal();
        pv.play().catch(() => {}); // the poster and the controls stay if the browser refuses
    };
    // closing a film lets go of it: the browser stops downloading and frees the decoder
    player.addEventListener('close', () => {
        pv.pause();
        pv.removeAttribute('src');
        pv.load();
    });

    // --- one style at a time ----------------------------------------------------------------------
    const live = $('#live'), stage = $('#live-stage'), read = $('#live-read');
    let current = null; // { id, iframe }
    addEventListener('message', (e) => {
        const m = e.data;
        if (!m || m.src !== 'dbc' || !current || m.id !== current.id) return;
        if (m.type === 'ready') current.iframe.contentWindow?.postMessage({ cmd: 'play' }, '*');
        if (m.type === 'frame') {
            stage.classList.add('on');
            read.textContent = `t = ${m.t.toFixed(2)} s · frame ${m.frame} · painted in ${m.ms.toFixed(1)} ms`;
        }
        if (m.type === 'error') read.textContent = 'this browser could not run it: the still stays';
    });
    const openStyle = (i) => {
        const [dir, name, look, shape, heavy] = STYLES[i];
        const small = innerWidth < 700, id = 'live-' + dir;
        stage.className = 'live-stage' + (shape === 'square' ? ' square' : '');
        stage.innerHTML = `<img src="media/styles/${dir}.jpg" alt="">`;
        $('#live-name').textContent = name;
        $('#live-look').textContent = look;
        $('#live-code').href = `${GH}/tree/main/styles/${dir}`;
        // the raymarched ones compile their shaders on the first frame, and the page waits with them: say so first
        read.textContent = heavy ? 'compiling its shaders: this one takes a few seconds…' : 'loading the kit…';
        const ifr = document.createElement('iframe');
        ifr.title = `${name}, running live`;
        ifr.src = `embed.html?scene=${encodeURIComponent(`styles/${dir}/template.js`)}&id=${id}&max=${heavy ? (small ? 420 : 640) : (small ? 640 : 960)}&after=loop`;
        stage.append(ifr);
        current = { id, iframe: ifr };
        live.showModal();
    };
    // closing removes the iframe: its scene, canvas and WebGL context go with it
    live.addEventListener('close', () => {
        current = null;
        stage.innerHTML = '';
    });

    // --- clicks --------------------------------------------------------------------------------
    document.addEventListener('click', (e) => {
        const film = e.target.closest('[data-film]'), style = e.target.closest('[data-style]'), close = e.target.closest('[data-close]');
        if (film) openFilm(film.dataset.film);
        else if (style) openStyle(Number(style.dataset.style));
        else if (close) close.closest('dialog').close();
        else if (e.target === player || e.target === live) e.target.close(); // a click on the backdrop
    });
})();
