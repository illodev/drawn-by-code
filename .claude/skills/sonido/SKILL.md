---
name: sonido
description: Música, efectos de sonido y mezcla para los vídeos de illomotion. Úsala al elegir o cortar música, al sincronizar la animación con el ritmo, al colocar efectos (sfx) o generar nuevos con ElevenLabs, y al añadir el audio al MP4.
---

# Sonido

El vídeo se monta **sobre la música**, no al revés: primero el tempo, después los cortes.

## Música

- Averigua el BPM y el primer golpe (`beatOffset`). A 120 BPM un golpe = 0,5 s y un
  compás de 4 = 2 s. Declara `bpm` y `beatOffset` en la escena.
- Si la pista no encaja en duración, córtala por compases con ffmpeg (ver
  `referencias/fube-la-caja-y-el-torno/audio/cortar-musica.sh` y `corte-v3.filter`):
  intro suave → entrada fuerte → groove → vuelta de la intro → golpe final.
- Deja 1,5–2,5 s al final para leer la frase de cierre.
- Licencias: Pixabay permite uso comercial sin atribución, pero **no redistribuir la
  pista suelta**; no la subas al repo (sí el script de corte). Si YouTube la reclama por
  Content ID, se disputa con la licencia.

## Efectos

- Biblioteca en `assets/sfx/` (33 efectos de papel, oficina y cartoon). Los prompts con
  que se generaron están en `assets/sfx/generar-sfx.mjs`: para uno nuevo, añádelo a `SFX`
  y ejecuta `ELEVENLABS_API_KEY=… node assets/sfx/generar-sfx.mjs nombre`. La clave nunca
  va al repo. Uso comercial de ElevenLabs = plan de pago.
- Cada acción visible con peso lleva su sonido (impactos, apariciones, escritura), pero
  no todo: los efectos de fondo a -13/-17 dB, los golpes a -4/-6 dB.
- Colócalos en el **fotograma del contacto**, no en el del inicio del movimiento.

## Mezcla

`audio.json` en la carpeta del experimento:

```json
{ "music": "musica-corte.mp3", "musicDb": -2, "duration": 6.5, "sfxDir": "../../assets/sfx",
  "cues": [["pop", 1.0, -10], ["stamp", 2.5, -4], ["scribble", 3.0, -15]] }
```

`node engine/mix.mjs sandbox/x/audio.json` → `mezcla.wav`; con `audio: { mix: 'mezcla.wav' }`
en la escena, `render.mjs` la añade sola. Si mueves un plano, mueve sus cues.

## Lecciones

- 2026-09-23 · la-caja-y-el-torno · Un silencio a mitad de vídeo parece un fallo técnico: si la música para, que sea en un golpe claro y breve.
