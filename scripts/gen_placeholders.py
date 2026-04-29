#!/usr/bin/env python3
"""
Generates minimal silent MPEG1 Layer3 32kbps 32kHz mono MP3 placeholder files.
Each frame is a valid sync-word + header + zero-filled payload.
Zero payload decodes as silence on all compliant MPEG decoders.

These are DEVELOPMENT PLACEHOLDERS only — replace before shipping.
See assets/tracks/LICENCES.md for requirements and sourcing instructions.
"""
import os
import sys

OUTDIR = os.path.join(os.path.dirname(__file__), "..", "assets", "tracks")
DURATION_SECS = 62   # slightly over 60s to satisfy the ≥60s AC

# MPEG1 Layer3 32kbps 32000Hz mono frame
#   sync           : 0xFF 0xFB  (MPEG1, Layer3, no CRC)
#   bitrate+rate   : 0x18       (32kbps=0001, 32000Hz=10, no padding, private=0)
#   channel mode   : 0xC0       (mono=11, mode_ext=00, no copyright, no original)
FRAME_HEADER  = bytes([0xFF, 0xFB, 0x18, 0xC0])
FRAME_SIZE    = 144            # bytes: 144 × bitrate / sample_rate = 144 × 32000 / 32000
SAMPLES_PER_FRAME = 1152       # constant for MPEG1 Layer3
FRAMES_PER_SEC    = 32000 / SAMPLES_PER_FRAME   # ≈ 27.78

frame = FRAME_HEADER + bytes(FRAME_SIZE - len(FRAME_HEADER))
num_frames = int(DURATION_SECS * FRAMES_PER_SEC) + 1

tracks = ["groove", "party", "dance"]

for name in tracks:
    path = os.path.join(OUTDIR, f"{name}.mp3")
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        print(f"  ⏭  {name}.mp3 already exists — skipping")
        continue
    with open(path, "wb") as f:
        for _ in range(num_frames):
            f.write(frame)
    size_kb = os.path.getsize(path) // 1024
    print(f"  ✅  {name}.mp3  ({size_kb} KB, {DURATION_SECS}s placeholder)")

print("\nPlaceholder tracks generated. Replace with real audio before shipping.")
print("See assets/tracks/LICENCES.md for sourcing instructions.")
