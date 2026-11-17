# malaga-atlas

- **Style:** atlas
- **Format:** 16:9 · 12 s · 24 fps
- **Purpose / audience:** the atlas style on a real place, for the user's educational video.
  After the style test, the user asked: «Can you do it of Málaga? Of that one, what fits
  least for me is the city, which doesn't look as much like the reference in its details.»
- **One-line idea:** Málaga as a plate of the atlas; the plate is printed, then the water
  leaves the Limonero reservoir and runs down the Guadalmedina through the city to the sea,
  with the camera after it, and the camera pulls back to the whole plate.
- **References:** the style's plate (`sandbox/2026-11-17-atlas-test/ref/atlas-4.png`), above
  all its town: blocks of lots threaded by white streets.
- **Data (open, fetched by `tools/fetch.py` into `private/`, not committed):**
  - relief: AWS Terrain Tiles (Terrarium; SRTM, EU-DEM © Copernicus and others), z12,
    ≈ 30.6 m a map px, frame centred on 4.455° W 36.735° N (`tools/frame.json`);
  - the map: OpenStreetMap standard tiles z13 (© OpenStreetMap contributors, ODbL; tiles
    CC BY-SA), read by colour into the sea, the reservoirs, built-up land, fields and main
    roads (`tools/derive.py`); the courses of the Guadalhorce and the Guadalmedina from
    Nominatim; the streams from the relief's own drainage.
  - `python3 tools/fetch.py && python3 tools/derive.py` rebuilds `private/`; the scene does
    not run without it.
- **On-screen text (literal, Spanish):** `MÁLAGA`, `MAR MEDITERRÁNEO`, `Río Guadalhorce`,
  `Guadalmedina`, `EMBALSE DEL LIMONERO`, `EMBALSE DE CASASOLA`, `MONTES DE MÁLAGA`,
  `CÁRTAMA`, `ALHAURÍN DE LA TORRE`, `TORREMOLINOS`, `RINCÓN DE LA VICTORIA`, `0 5 10 km`, and
  the credit `Relieve: AWS Terrain Tiles · Mapa: © colaboradores de OpenStreetMap`.
- **Claims:** none beyond the map itself. The red route is the water's way down the
  Guadalmedina from the Limonero's dam to the sea (the river's course), not a canal.
- **Music / rhythm:** none yet.
- **Must NOT happen:** a town of scattered houses on a pale ground; roads or streams drawn in
  broken pieces; pale halos where a few houses stand in the hills; the camera past the frame.

## Shot list

| Time | Shot | What happens |
|---|---|---|
| 0–1.5 | Printed | The relief and the sea come up out of the paper, then the ink, then the lettering. |
| 1.5–2 | The plate | The whole plate holds. |
| 2–3.3 | In | The camera goes in onto the Limonero's dam (zoom 2). |
| 3–8 | The water | The red route runs from the dam down the Guadalmedina through the city to the sea; the camera follows its front, easing out to 1.7. |
| 8.6–10.8 | Out | Back to the whole plate. |
| 10.8–12 | Hold | The plate, the route drawn. |
