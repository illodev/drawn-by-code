// The Málaga plate: everything drawn over the relief, in map px (z12 Web Mercator, ≈ 30.6 m a
// pixel). The data is derived by tools/fetch.py and tools/derive.py into private/ (open data:
// AWS Terrain Tiles, OpenStreetMap); placements of the lettering are here.
const Malaga = (() => {
    const DIR = '/sandbox/2026-11-17-malaga-atlas/private/';
    const loadImage = (src) => new Promise((ok, ko) => { const im = new Image(); im.onload = () => ok(im); im.onerror = ko; im.src = src; });
    const pixels = (im) => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, im.width, im.height).data; };
    async function load(env) {
        const meta = await (await fetch(DIR + 'height.json')).json();
        const vec = await (await fetch(DIR + 'vectors.json')).json();
        const height = await Atlas.load(DIR + 'height.u16', meta, DIR + 'tint.u16');
        const [urbanIm, densIm, fieldIm] = await Promise.all(['urban.png', 'urban-density.png', 'fields.png'].map((f) => loadImage(DIR + f)));
        const W = meta.size[0], H = meta.size[1];
        const dens = pixels(densIm), fields = pixels(fieldIm);
        const at2 = (arr, x, y) => { const X = Math.round(x * 2), Y = Math.round(y * 2); return X < 0 || Y < 0 || X >= W * 2 || Y >= H * 2 ? 0 : arr[(Y * W * 2 + X) * 4] / 255; };
        const G = vec.grain;
        const angleAt = (x, y) => { const i = Math.min(G.w - 1, Math.max(0, Math.floor((x * 2) / G.cell))), j = Math.min(G.h - 1, Math.max(0, Math.floor((y * 2) / G.cell))); return G.theta[j * G.w + i]; };
        const centre = vec.places['Málaga'];
        // the town, drawn once at 3 × map px: its pale ground, then its blocks and lots
        const S = 3, city = document.createElement('canvas');
        city.width = W * S; city.height = H * S;
        const c = city.getContext('2d');
        c.scale(S, S);
        // the mask is a grey PNG (opaque everywhere): its brightness becomes the ground's alpha
        const ground = document.createElement('canvas');
        ground.width = urbanIm.width; ground.height = urbanIm.height;
        const gx = ground.getContext('2d');
        const um = pixels(urbanIm), img = gx.createImageData(ground.width, ground.height);
        const pale = [0xef, 0xe8, 0xd8];
        for (let i = 0; i < um.length; i += 4) { img.data[i] = pale[0]; img.data[i + 1] = pale[1]; img.data[i + 2] = pale[2]; const d = dens[i] / 255, e = Math.min(1, Math.max(0, (d - 0.3) / 0.3)); img.data[i + 3] = Math.round((um[i] / 255) * e * e * (3 - 2 * e) * 235); }
        gx.putImageData(img, 0, 0);
        c.filter = 'blur(0.6px)';
        c.drawImage(ground, 0, 0, W, H);
        c.filter = 'none';
        const list = Atlas.gridBlocks(0, 0, W, H, angleAt, {
            seed: 7, block: 11, street: 1.3, district: 56, aspect: 1.2,
            blockAt: (x, y) => 0.72 + 0.28 * Math.min(1, Math.hypot(x - centre[0], y - centre[1]) / 70),
        }).filter((q) => {
            // a block is there or not as a whole (blocks and streets, not a scatter of lots)
            const d = at2(dens, q.x, q.y), h = Math.abs(Math.sin(q.seed * 12.9898) * 43758.5453) % 1;
            return d > 0.04 && h < Math.min(1, d * 1.8);
        });
        Atlas.blocks(c, list, { lot: 2.6, keep: (x, y) => { const d = at2(dens, x, y); return d < 0.5 ? d * 1.5 : 1; }, empty: 0.04 });
        // the water's way: the Guadalmedina from the Limonero's dam to the sea
        const lim = vec.lakes.reduce((best, p) => { const cx = p.reduce((s, q) => s + q[0], 0) / p.length; return Math.abs(cx - 705) < Math.abs(best.cx - 705) ? { p, cx } : best; }, { p: null, cx: 1e9 }).p;
        const dam = lim.reduce((a, q) => (q[1] > a[1] ? q : a), lim[0]);
        const med = vec.rivers.filter((r) => r.name.includes('Guadalmedina')).map((r) => r.pts).flat();
        const nearest = (p) => med.reduce((b, q, i) => (Math.hypot(q[0] - p[0], q[1] - p[1]) < b.d ? { d: Math.hypot(q[0] - p[0], q[1] - p[1]), i } : b), { d: 1e9, i: 0 }).i;
        const i0 = nearest(dam), i1 = med.reduce((b, q, i) => (q[1] > med[b][1] ? i : b), 0);
        let route = i0 <= i1 ? med.slice(i0, i1 + 1) : med.slice(i1, i0 + 1).reverse();
        route = [dam, ...route];
        return { height, vec, city, W, H, at2, fields, route, dam, centre };
    }
    function draw(g, M, o = {}) {
        const { vec, W, H } = M;
        const ink = o.ink ?? 1, letters = o.letters ?? 1;
        g.save();
        g.globalAlpha = ink;
        // fields on the valley floors (OSM farmland, orchards, meadows on low, gentle ground)
        Atlas.fields(g, 0, 0, W, H, (x, y) => M.at2(M.fields, x, y) > 0.5, { cell: 16, row: 13, angle: -0.12, alpha: 0.65, edgeAlpha: 0.4, fill: 0.7, seed: 9 });
        // the sea and the reservoirs, with their waterlines: printed with the relief (the sea is no
        // flat khaki before the ink comes)
        g.globalAlpha = o.water ?? ink;
        for (const c of vec.coast) Atlas.lake(g, c, { lines: [[0, 1.1, 1], [3.2, 0.9, 0.8], [5.8, 0.8, 0.55], [8.8, 0.7, 0.35]] });
        for (const l of vec.lakes) Atlas.lake(g, l, { lines: [[0, 0.9, 1], [2.4, 0.7, 0.75], [4.2, 0.6, 0.5]] });
        g.globalAlpha = ink;
        // rivers: the streams the relief collects, then the two named rivers
        for (const r of vec.rivers) if (!r.name) Atlas.river(g, r.pts, r.w, { width: 0.8, edge: false, color: '#6aa6c6' });
        // the town
        g.drawImage(M.city, 0, 0, W, H);
        for (const r of vec.rivers) if (r.name) Atlas.river(g, r.pts, r.w, { width: 0.75, edge: false, color: '#5f9fc6' });
        // roads: motorways and trunk roads as main roads, the rest as thin double lines
        const long = (l) => l.length > 1 && Atlas.lengths(l).pop() > 14;            // no stubs
        for (const l of vec.roads.primary) if (long(l)) Atlas.road(g, l, { main: true, width: 2.1, core: '#f7f3ea', edge: '#a9a192' });
        for (const k of ['trunk', 'motorway']) for (const l of vec.roads[k]) if (long(l)) Atlas.road(g, l, { main: true, width: 3.0 });
        // the water's way, drawn up to where the water has got
        if ((o.route ?? 0) > 0) Atlas.dashed(g, M.route, { upto: o.route, dash: 9, gap: 4.6, width: 2.8 });
        g.restore();
        g.save();
        g.globalAlpha = letters;
        const P = vec.places;
        Atlas.label(g, 'MÁLAGA', 842, 484, { size: 26, spacing: 0.08, weight: 500 });
        Atlas.label(g, 'MAR MEDITERRÁNEO', 1000, 600, { size: 17, italic: true, spacing: 0.32, color: '#3e5a66' });
        Atlas.label(g, 'Río Guadalhorce', 268, 392, { size: 14, italic: true, angle: -0.06, color: '#3e5a66' });
        Atlas.label(g, 'Guadalmedina', 726, 300, { size: 13, italic: true, angle: -1.42, color: '#3e5a66' });
        Atlas.label(g, 'EMBALSE DEL LIMONERO', 796, 236, { size: 10.5, spacing: 0.32 });
        Atlas.label(g, 'EMBALSE DE CASASOLA', 600, 84, { size: 10.5, spacing: 0.32 });
        Atlas.label(g, 'MONTES DE MÁLAGA', 880, 150, { size: 15, spacing: 0.5 });
        Atlas.label(g, 'CÁRTAMA', P['Cártama'][0], P['Cártama'][1] + 16, { size: 12, spacing: 0.12 });
        Atlas.label(g, 'ALHAURÍN DE LA TORRE', 290, 548, { size: 11, spacing: 0.12 });
        Atlas.label(g, 'TORREMOLINOS', 668, 690, { size: 12, spacing: 0.12 });
        Atlas.label(g, 'RINCÓN DE LA VICTORIA', P['Rincón de la Victoria'][0] - 20, P['Rincón de la Victoria'][1] + 24, { size: 11, spacing: 0.12 });
        Atlas.scaleBar(g, 870, 668, 10000 / vec.mpp, { size: 15, tick: 6, above: 12, width: 1.5, unitGap: 15 });
        Atlas.label(g, 'Relieve: AWS Terrain Tiles · Mapa: © colaboradores de OpenStreetMap', 1255, 700, { size: 7.5, align: 'right', color: '#5a5048' });
        g.restore();
    }
    return { load, draw };
})();
