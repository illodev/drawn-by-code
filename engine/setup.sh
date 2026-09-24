#!/bin/sh
# Deja el entorno listo para renderizar: dependencias de Node y ffmpeg.
# Lo ejecuta el hook SessionStart (.claude/settings.json) en cada sesión; es idempotente.
cd "$(dirname "$0")/.." || exit 0
[ -d node_modules/playwright-core ] || npm install --silent --no-audit --no-fund >/dev/null 2>&1 || echo "setup: npm install falló"
if ! command -v ffmpeg >/dev/null 2>&1; then
    # sin apt ni brew a mano: el binario estático de imageio-ffmpeg basta
    if pip install -q imageio-ffmpeg >/dev/null 2>&1; then
        bin=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())" 2>/dev/null)
        [ -n "$bin" ] && ln -sf "$bin" /usr/local/bin/ffmpeg 2>/dev/null || echo "setup: usa FFMPEG_PATH=$bin"
    else
        echo "setup: falta ffmpeg (brew install ffmpeg / apt install ffmpeg)"
    fi
fi
exit 0
