#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# generate-placeholder-audio.sh
#
# Generates silent looping MP3 placeholder tracks for local development.
# Requires: ffmpeg (brew install ffmpeg  /  apt install ffmpeg)
#
# These files are ONLY for running and testing the app locally before real
# royalty-free tracks are sourced. Do NOT ship these in the production build.
#
# Usage:
#   chmod +x scripts/generate-placeholder-audio.sh
#   ./scripts/generate-placeholder-audio.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

OUTDIR="$(dirname "$0")/../assets/tracks"
DURATION=60  # seconds — long enough to test the game loop

if ! command -v ffmpeg &>/dev/null; then
  echo "❌  ffmpeg not found. Install it first:"
  echo "     macOS:  brew install ffmpeg"
  echo "     Linux:  sudo apt install ffmpeg"
  exit 1
fi

echo "🎵  Generating ${DURATION}s silent placeholder tracks in ${OUTDIR}/"

for NAME in groove party dance; do
  OUT="${OUTDIR}/${NAME}.mp3"
  if [[ -f "$OUT" ]]; then
    echo "  ⏭  ${NAME}.mp3 already exists — skipping"
    continue
  fi
  # anullsrc = silent audio source; -q:a 9 = lowest quality (tiny file)
  ffmpeg -hide_banner -loglevel error \
    -f lavfi -i "anullsrc=r=44100:cl=stereo" \
    -t "$DURATION" \
    -codec:a libmp3lame -q:a 9 \
    "$OUT"
  SIZE=$(du -sh "$OUT" | cut -f1)
  echo "  ✅  ${NAME}.mp3  (${SIZE})"
done

echo ""
echo "Done. Run 'npx expo start' to test the app."
echo "Replace these files with real tracks before shipping — see assets/tracks/README.md"
