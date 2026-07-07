#!/usr/bin/env python3
# Genera il banner premium di Titan Edition (SVG) — logo, versione, slogan.
# Palette Titan Blue; motivo visuale ad anelli orbitali (eco del logo) al posto
# dello spettro/equalizzatore di RLMP. Logo PNG incorporato in base64.
#
# Uso:  python build-banner.py
import base64, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
LOGO = ROOT / "src" / "renderer" / "src" / "assets" / "logo.png"
VERSION = "2.1.7"
OUT = pathlib.Path(__file__).resolve().parent / f"banner-titan-v{VERSION}.svg"
W, H = 2520, 1080

# Ancore layout
LOGO_CX, LOGO_CY, LOGO_S = 640, 540, 600
TX = 1130  # colonna testo (left-aligned)

def orbital_rings():
    """Anelli orbitali diagonali, tenui, dietro il blocco testo (eco del logo)."""
    rings = []
    cx, cy = 1740, 560
    for i, (rx, ry, op) in enumerate([(560, 210, 0.10), (440, 165, 0.07), (300, 112, 0.05)]):
        rings.append(
            f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" '
            f'stroke="url(#ringStroke)" stroke-width="2.5" opacity="{op}" '
            f'transform="rotate(-24 {cx} {cy})"/>'
        )
    return "\n    ".join(rings)

def build_svg(logo_uri):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="Runtime TelegramBot Desktop Titan Edition v{VERSION}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="{W}" y2="{H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#070b18"/>
      <stop offset="0.5" stop-color="#050710"/>
      <stop offset="1" stop-color="#03040a"/>
    </linearGradient>
    <linearGradient id="titanBlue" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7cc4ff"/>
      <stop offset="0.5" stop-color="#3b82f6"/>
      <stop offset="1" stop-color="#2563eb"/>
    </linearGradient>
    <linearGradient id="titleLight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#aecbf7"/>
    </linearGradient>
    <linearGradient id="ringStroke" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4cd7f6"/>
      <stop offset="1" stop-color="#3b82f6"/>
    </linearGradient>
    <linearGradient id="hair" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.03"/>
      <stop offset="0.5" stop-color="#4cd7f6" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.03"/>
    </linearGradient>
    <radialGradient id="auraCyan" cx="600" cy="560" r="620" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#22d3ee" stop-opacity="0.20"/>
      <stop offset="0.55" stop-color="#0ea5e9" stop-opacity="0.06"/>
      <stop offset="1" stop-color="#0ea5e9" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="auraBlue" cx="2160" cy="180" r="900" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#3b82f6" stop-opacity="0.14"/>
      <stop offset="0.5" stop-color="#2563eb" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#2563eb" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="logoGlow" cx="{LOGO_CX}" cy="{LOGO_CY}" r="420" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#4cd7f6" stop-opacity="0.28"/>
      <stop offset="0.55" stop-color="#3b82f6" stop-opacity="0.08"/>
      <stop offset="1" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="{W//2}" cy="{H//2}" r="1500" gradientUnits="userSpaceOnUse">
      <stop offset="0.6" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.45"/>
    </radialGradient>
    <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.5" fill="#4cd7f6" opacity="0.05"/>
    </pattern>
    <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="30" stdDeviation="44" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
  </defs>

  <!-- Fondo -->
  <rect width="{W}" height="{H}" fill="url(#bg)"/>
  <rect width="{W}" height="{H}" fill="url(#dots)"/>
  <rect width="{W}" height="{H}" fill="url(#auraCyan)"/>
  <rect width="{W}" height="{H}" fill="url(#auraBlue)"/>

  <!-- Motivo anelli orbitali -->
  <g>
    {orbital_rings()}
  </g>

  <!-- Logo -->
  <circle cx="{LOGO_CX}" cy="{LOGO_CY}" r="420" fill="url(#logoGlow)"/>
  <rect x="{LOGO_CX - LOGO_S//2 + 14}" y="{LOGO_CY - LOGO_S//2 + 34}" width="{LOGO_S - 28}" height="{LOGO_S - 28}" rx="96" fill="#000000" opacity="0.5"/>
  <image xlink:href="{logo_uri}" href="{logo_uri}" x="{LOGO_CX - LOGO_S//2}" y="{LOGO_CY - LOGO_S//2}" width="{LOGO_S}" height="{LOGO_S}"/>
  <rect x="{LOGO_CX - LOGO_S//2}" y="{LOGO_CY - LOGO_S//2}" width="{LOGO_S}" height="{LOGO_S}" rx="102" fill="none" stroke="#4cd7f6" stroke-opacity="0.22" stroke-width="2"/>

  <!-- Separatore verticale -->
  <line x1="1024" y1="300" x2="1024" y2="780" stroke="#4cd7f6" stroke-opacity="0.16" stroke-width="2"/>

  <!-- Titolo unico "Runtime TelegramBot Desktop Titan Edition" su più righe,
       stesso font (Segoe UI Black), gradienti, EDITION in blu. -->
  <text x="{TX}" y="316" font-family="Segoe UI Black, Segoe UI, Helvetica, Arial, sans-serif" font-size="66" font-weight="900" letter-spacing="4" fill="url(#titleLight)">RUNTIME TELEGRAMBOT DESKTOP</text>
  <text x="{TX - 8}" y="506" font-family="Segoe UI Black, Segoe UI, Helvetica, Arial, sans-serif" font-size="180" font-weight="900" letter-spacing="2" fill="url(#titleLight)">TITAN</text>
  <text x="{TX}" y="624" font-family="Segoe UI Black, Segoe UI, Helvetica, Arial, sans-serif" font-size="108" font-weight="900" letter-spacing="14" fill="url(#titanBlue)">EDITION</text>

  <!-- Badge versione -->
  <g>
    <rect x="{TX}" y="672" width="188" height="52" rx="26" fill="none" stroke="#2b3a52" stroke-width="1.5"/>
    <circle cx="{TX + 30}" cy="698" r="6" fill="#4ade80"/>
    <text x="{TX + 52}" y="707" font-family="Consolas, Menlo, monospace" font-size="26" font-weight="700" letter-spacing="2" fill="#c7d4ea">v {VERSION}</text>
  </g>

  <!-- Slogan -->
  <text x="{TX}" y="810" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="42" font-style="italic" font-weight="400" fill="#9fb0cc">Always On. <tspan font-weight="700" fill="#4cd7f6">Fully Automated.</tspan></text>

  <!-- Piattaforme supportate -->
  <text x="{W - 120}" y="972" text-anchor="end" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="6" fill="#3b82f6">WINDOWS &#183; LINUX</text>

  <!-- Vignettatura + barra superiore -->
  <rect width="{W}" height="{H}" fill="url(#vignette)"/>
  <rect x="0" y="0" width="{W}" height="6" fill="url(#titanBlue)"/>
</svg>
'''

def main():
    logo_uri = "data:image/png;base64," + base64.b64encode(LOGO.read_bytes()).decode()
    OUT.write_text(build_svg(logo_uri), encoding="utf-8")
    print("OK", OUT, f"{OUT.stat().st_size//1024} KB")

if __name__ == "__main__":
    main()
