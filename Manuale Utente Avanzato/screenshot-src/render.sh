#!/usr/bin/env bash
# Titan manual screenshot renderer via headless Chrome.
# Headless has a virtual display (no physical-screen cap), so device-scale-factor 2
# yields crisp, complete 2560x1600 PNGs. virtual-time-budget lets Tailwind's Play CDN
# JIT pass and the webfonts settle before the shot is taken.
#
# Usage:  ./render.sh [name ...]      (no args = render every figure)
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
FIGDIR="$HERE/figures"
OUTDIR="$HERE/../screenshots"
mkdir -p "$OUTDIR"

if [ "$#" -gt 0 ]; then
  NAMES=("$@")
else
  NAMES=()
  for f in "$FIGDIR"/*.html; do NAMES+=("$(basename "$f" .html)"); done
fi

for name in "${NAMES[@]}"; do
  name="${name%.html}"
  in="$FIGDIR/$name.html"
  out="$OUTDIR/$name.png"
  [ -f "$in" ] || { echo "  SKIP (missing): $name"; continue; }
  # Convert to a file:// URL with forward slashes and a drive prefix.
  winpath="$(cygpath -w "$in")"
  url="file:///$(echo "$winpath" | sed 's#\\#/#g')"
  "$CHROME" \
    --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=2 \
    --window-size=1280,800 \
    --default-background-color=00000000 \
    --virtual-time-budget=5000 \
    --screenshot="$(cygpath -w "$out")" \
    "$url" >/dev/null 2>&1 || true
  if [ -f "$out" ]; then
    echo "  -> $name.png"
  else
    echo "  FAILED: $name"
  fi
done
