#!/usr/bin/env python3
"""Regenerates public/og-image.png, the social share card.

One-off tooling, not part of the site build. Run it only when the wording or
branding on the card changes:

    python3 -m pip install Pillow
    python3 scripts/og-image.py

Replace public/og-image.png with a properly designed asset any time — nothing
else needs to change, the layout references it by path.
"""
from PIL import Image, ImageDraw, ImageFont

W, H, S = 1200, 630, 2           # final size, and supersampling factor
PAD = 80

INK        = "#131c24"           # brand dark, matches the site's dark sections
WHITE      = "#ffffff"
RED        = "#b3261e"           # fills only (see DESIGN.md accent split)
ACCENT_TXT = "#e2564a"           # the accent as type: 4.65:1 on the dark ground
GREY       = "#9aa4ad"
FAINT      = (255, 255, 255, 10)  # the site's .grid-dark-overlay

FONTS = "/mnt/skills/examples/canvas-design/canvas-fonts"
sans = lambda px: ImageFont.truetype(f"{FONTS}/WorkSans-Bold.ttf", px * S)
mono = lambda px: ImageFont.truetype(f"{FONTS}/IBMPlexMono-Regular.ttf", px * S)

img = Image.new("RGB", (W * S, H * S), INK)
d = ImageDraw.Draw(img, "RGBA")

# 56px grid overlay, as on the site's dark sections.
for x in range(0, W * S, 56 * S):
    d.line([(x, 0), (x, H * S)], fill=FAINT, width=S)
for y in range(0, H * S, 56 * S):
    d.line([(0, y), (W * S, y)], fill=FAINT, width=S)


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


# --- Logo lockup -----------------------------------------------------------
diamond(PAD * S + 7 * S, 84 * S, 7 * S, RED)
x = tracked((PAD * S + 24 * S, 70 * S), "FRONTIER", sans(26), WHITE, 0.01)
tracked((x + 9 * S, 70 * S), "MFG", sans(26), ACCENT_TXT, 0.01)

# --- The site's .tick rule -------------------------------------------------
for i in range(8):
    x0 = PAD * S + i * 9 * S
    d.rectangle([x0, 210 * S, x0 + 1.5 * S, 219 * S], fill=RED)

# --- Eyebrow, headline -----------------------------------------------------
tracked((PAD * S, 238 * S), "AUTOMATION & MANUFACTURING CONSULTING", mono(15), ACCENT_TXT, 0.16)

for i, line in enumerate(["Bring your shop floor", "into the age of data."]):
    d.text((PAD * S, (282 + i * 70) * S), line, font=sans(60), fill=WHITE)

# --- Footer rule and location line ----------------------------------------
d.line([(PAD * S, 500 * S), ((W - PAD) * S, 500 * S)], fill=(255, 255, 255, 26), width=S)
tracked((PAD * S, 528 * S), "SURREY, BC", mono(16), WHITE, 0.1)
tracked((PAD * S + 152 * S, 528 * S),
        "SERVING VANCOUVER & THE LOWER MAINLAND", mono(16), GREY, 0.1)

img.resize((W, H), Image.LANCZOS).save("public/og-image.png", optimize=True)
print(f"wrote public/og-image.png ({W}x{H})")
