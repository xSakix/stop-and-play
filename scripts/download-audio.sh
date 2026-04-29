#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# download-audio.sh
#
# Downloads the production royalty-free looping tracks from Pixabay.
# All tracks are licensed under the Pixabay Content License, which permits
# use in apps and commercial products without attribution.
#   https://pixabay.com/service/license-summary/
#
# Requires: curl
#
# Usage:
#   chmod +x scripts/download-audio.sh
#   ./scripts/download-audio.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

OUTDIR="$(dirname "$0")/../assets/tracks"

# ── Track catalogue ───────────────────────────────────────────────────────────
# Replace these URLs with the direct MP3 download links obtained from Pixabay.
# Steps:
#  1. Visit https://pixabay.com/music/ and search for a looping track
#  2. Click the track → "Free Download" → copy the direct .mp3 URL
#  3. Paste the URL next to the matching variable below
#
# Requirements per track:
#   - Looping / loop-ready (no hard ending)
#   - Duration ≥ 60 seconds
#   - ≤ 5 MB (128kbps MP3)
#   - Pixabay Content License (no attribution required)

GROOVE_URL=""   # e.g. upbeat funk / groove loop
PARTY_URL=""    # e.g. upbeat pop / party loop
DANCE_URL=""    # e.g. electronic / dance loop

# ── Download ──────────────────────────────────────────────────────────────────
download() {
  local name="$1" url="$2" out="${OUTDIR}/${1}.mp3"

  if [[ -z "$url" ]]; then
    echo "  ⚠️  ${name}: URL not set — edit this script and add the download URL"
    return
  fi

  if [[ -f "$out" ]]; then
    echo "  ⏭  ${name}.mp3 already exists — skipping"
    return
  fi

  echo "  ⬇️  Downloading ${name}.mp3 …"
  curl -fsSL --progress-bar -o "$out" "$url"
  SIZE=$(du -sh "$out" | cut -f1)
  echo "  ✅  ${name}.mp3  (${SIZE})"
}

echo "🎵  Downloading production audio tracks to ${OUTDIR}/"
download "groove" "$GROOVE_URL"
download "party"  "$PARTY_URL"
download "dance"  "$DANCE_URL"

echo ""
echo "✅  Done. Update assets/tracks/LICENCES.md with track details."
