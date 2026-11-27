#!/bin/sh
# Gets the environment ready to render: Node dependencies and ffmpeg.
# Run by the SessionStart hook (.claude/settings.json) on every session; it is idempotent.
cd "$(dirname "$0")/.." || exit 0
# installs when any dependency in package.json is missing (a new one was added since)
node -e "const p=require('./package.json');process.exit(Object.keys(p.dependencies||{}).every((d)=>require('fs').existsSync('node_modules/'+d))?0:1)" 2>/dev/null \
    || npm install --silent --no-audit --no-fund >/dev/null 2>&1 || echo "setup: npm install failed"
if ! command -v ffmpeg >/dev/null 2>&1; then
    # no apt or brew at hand: the static imageio-ffmpeg binary is enough
    if pip install -q imageio-ffmpeg >/dev/null 2>&1; then
        bin=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())" 2>/dev/null)
        [ -n "$bin" ] && ln -sf "$bin" /usr/local/bin/ffmpeg 2>/dev/null || echo "setup: use FFMPEG_PATH=$bin"
    else
        echo "setup: missing ffmpeg (brew install ffmpeg / apt install ffmpeg)"
    fi
fi
exit 0
