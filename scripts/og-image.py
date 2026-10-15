#!/usr/bin/env python3
"""Regenerates public/og-image.png, the social share card.

One-off tooling, not part of the site build. Run it from the repo root, after
`npm install` (it reads the site's own fonts from node_modules/@fontsource),
only when the wording or branding on the card changes:

    python3 -m pip install Pillow
    python3 scripts/og-image.py

Replace public/og-image.png with a properly designed asset any time — nothing
else needs to change, the layout references it by path.
"""
from PIL import Image, ImageDraw, ImageFont

W, H, S = 1200, 630, 2           # final size, and supersampling factor
PAD = 80

# Tokens from src/styles/global.css
INK    = "#15181B"
PAPER  = "#F5F6F7"
STEEL  = "#8A939C"
SAFETY = "#F47B20"
GRID_MINOR = (138, 147, 156, 13)  # 5%
GRID_MAJOR = (138, 147, 156, 20)  # 8%

FONTS = "node_modules/@fontsource"
display = lambda px: ImageFont.truetype(f"{FONTS}/barlow-condensed/files/barlow-condensed-latin-700-normal.woff", px * S)
mono = lambda px: ImageFont.truetype(f"{FONTS}/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff", px * S)

img = Image.new("RGB", (W * S, H * S), INK)
d = ImageDraw.Draw(img, "RGBA")

# Blueprint grid, as on the site's dark bands: 24px minor, 120px major.
for step, fill in ((24, GRID_MINOR), (120, GRID_MAJOR)):
    for x in range(0, W * S, step * S):
        d.line([(x, 0), (x, H * S)], fill=fill, width=S)
    for y in range(0, H * S, step * S):
        d.line([(0, y), (W * S, y)], fill=fill, width=S)


def tracked(xy, text, font, fill, em=0.0):
    """Draws text with letter-spacing, which PIL has no native support for."""
    x, y = xy
    extra = em * font.size
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += d.textlength(ch, font=font) + extra
    return x


def diamond(cx, cy, r, fill):
    d.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], fill=fill)


def dimension(x0, x1, y, color):
    """The site's dimension line: end ticks, arrowheads, a thin rule."""
    d.line([(x0, y), (x1, y)], fill=color, width=S)
    for x in (x0, x1):
        d.line([(x, y - 8 * S), (x, y + 8 * S)], fill=color, width=S)
    a = 9 * S
    d.polygon([(x0, y), (x0 + a, y - 3.5 * S), (x0 + a, y + 3.5 * S)], fill=color)
    d.polygon([(x1, y), (x1 - a, y - 3.5 * S), (x1 - a, y + 3.5 * S)], fill=color)


# --- Logo lockup -----------------------------------------------------------
diamond(PAD * S + 8 * S, 86 * S, 8 * S, SAFETY)
x = tracked((PAD * S + 26 * S, 68 * S), "FRONTIER", display(34), PAPER, 0.04)
tracked((x + 8 * S, 68 * S), "MFG", display(34), SAFETY, 0.04)

# --- Label, headline, dimension line --------------------------------------
tracked((PAD * S, 196 * S), "AUTOMATION & SYSTEMS INTEGRATION", mono(16), SAFETY, 0.14)
for i, line in enumerate(["PRACTICAL AUTOMATION", "FOR BC MANUFACTURERS."]):
    d.text((PAD * S, (226 + i * 94) * S), line, font=display(104), fill=PAPER)
dimension(PAD * S, (W - PAD) * S, 448 * S, STEEL)

# --- Location line ----------------------------------------------------------
x = tracked((PAD * S, 506 * S), "BASED IN SURREY, BC", mono(16), SAFETY, 0.12)
tracked((x + 24 * S, 506 * S), "SERVING METRO VANCOUVER & THE FRASER VALLEY", mono(16), STEEL, 0.12)

# --- Hazard stripe along the bottom edge -----------------------------------
top, h, band = (H - 12) * S, 12 * S, 14 * S
d.rectangle([0, top, W * S, H * S], fill=INK)
for x0 in range(-h, W * S + h, band * 2):
    d.polygon([(x0, H * S), (x0 + band, H * S), (x0 + band + h, top), (x0 + h, top)], fill=SAFETY)

img.resize((W, H), Image.LANCZOS).save("public/og-image.png", optimize=True)
print(f"wrote public/og-image.png ({W}x{H})")
