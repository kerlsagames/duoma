#!/usr/bin/env python3
"""
Bake flat cut-paper Positions art with accurate poses.
Pink F = long navy hair. Blue M = short navy hair only.
"""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path("/workspace/assets/images/positions")
OUT.mkdir(parents=True, exist_ok=True)
SIZE = 768
PINK = (255, 158, 181, 255)
BLUE = (110, 156, 255, 255)
HAIR = (27, 39, 68, 255)
GROUND = (240, 228, 212, 255)
WHITE = (255, 255, 255, 255)


def canvas():
    img = Image.new("RGBA", (SIZE, SIZE), WHITE)
    d = ImageDraw.Draw(img)
    d.ellipse((110, 500, 658, 680), fill=GROUND)
    return img, d


def oval(d, cx, cy, rx, ry, fill, rot=0):
    pts = []
    rad = math.radians(rot)
    for i in range(56):
        a = (i / 56) * math.tau
        x, y = rx * math.cos(a), ry * math.sin(a)
        xr = x * math.cos(rad) - y * math.sin(rad)
        yr = x * math.sin(rad) + y * math.cos(rad)
        pts.append((cx + xr, cy + yr))
    d.polygon(pts, fill=fill)


def capsule(d, x1, y1, x2, y2, thick, fill):
    dx, dy = x2 - x1, y2 - y1
    length = math.hypot(dx, dy) or 1
    ux, uy = dx / length, dy / length
    px, py = -uy * thick, ux * thick
    d.polygon(
        [
            (x1 + px, y1 + py),
            (x2 + px, y2 + py),
            (x2 - px, y2 - py),
            (x1 - px, y1 - py),
        ],
        fill=fill,
    )
    r = thick
    d.ellipse((x1 - r, y1 - r, x1 + r, y1 + r), fill=fill)
    d.ellipse((x2 - r, y2 - r, x2 + r, y2 + r), fill=fill)


def head(d, cx, cy, r, fill):
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=fill)


def hair_short(d, cx, cy):
    # tight crop / short curls over top of head
    oval(d, cx, cy - 16, 28, 18, HAIR, 0)
    oval(d, cx - 10, cy - 8, 14, 12, HAIR, -20)
    oval(d, cx + 10, cy - 8, 14, 12, HAIR, 20)


def hair_long(d, cx, cy, side=1):
    # long wavy cascade
    oval(d, cx, cy - 14, 30, 20, HAIR, 0)
    oval(d, cx + side * 18, cy + 10, 22, 34, HAIR, side * 25)
    oval(d, cx + side * 28, cy + 40, 18, 36, HAIR, side * 15)
    oval(d, cx + side * 22, cy + 70, 16, 28, HAIR, side * 10)


def body(d, joints, fill, *, long_hair=False, hair_side=1, thick=20):
    j = joints
    # draw limbs under torso
    for a, b, t in [
        ("sl", "el", thick - 2),
        ("el", "hl", thick - 3),
        ("sr", "er", thick - 2),
        ("er", "hr", thick - 3),
        ("hip", "kl", thick),
        ("kl", "fl", thick - 1),
        ("hip", "kr", thick),
        ("kr", "fr", thick - 1),
    ]:
        if a in j and b in j:
            capsule(d, *j[a], *j[b], t, fill)
    # torso
    if "chest" in j and "hip" in j:
        cx = (j["chest"][0] + j["hip"][0]) / 2
        cy = (j["chest"][1] + j["hip"][1]) / 2
        dx = j["hip"][0] - j["chest"][0]
        dy = j["hip"][1] - j["chest"][1]
        rot = math.degrees(math.atan2(dy, dx)) - 90
        oval(d, cx, cy, 36, 52, fill, rot)
        # soft chest volume for F
        if long_hair:
            oval(d, j["chest"][0] - 12, j["chest"][1] + 6, 14, 12, fill, -10)
            oval(d, j["chest"][0] + 12, j["chest"][1] + 6, 14, 12, fill, 10)
    if "head" in j:
        head(d, *j["head"], 26, fill)
        if long_hair:
            hair_long(d, *j["head"], side=hair_side)
        else:
            hair_short(d, *j["head"])


def save(img: Image.Image, key: str):
    # slight blur then paste for softer cut-paper edges
    soft = img.filter(ImageFilter.GaussianBlur(0.6))
    path = OUT / f"{key}.png"
    soft.convert("RGB").save(path, "PNG", optimize=True)
    print("ok", key, path.stat().st_size)


# ---------- poses ----------

def missionary():
    img, d = canvas()
    # F on back
    body(
        d,
        {
            "head": (210, 340),
            "chest": (300, 360),
            "hip": (430, 380),
            "sl": (280, 320),
            "el": (250, 300),
            "hl": (230, 330),
            "sr": (290, 400),
            "er": (270, 440),
            "hr": (250, 470),
            "kl": (520, 300),
            "fl": (580, 270),
            "kr": (530, 450),
            "fr": (590, 490),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
    )
    # M on top face-to-face
    body(
        d,
        {
            "head": (250, 300),
            "chest": (340, 330),
            "hip": (460, 360),
            "sl": (320, 290),
            "el": (300, 320),
            "hl": (310, 360),
            "sr": (330, 370),
            "er": (350, 400),
            "hr": (390, 420),
            "kl": (540, 320),
            "fl": (600, 300),
            "kr": (550, 420),
            "fr": (610, 440),
        },
        BLUE,
        thick=22,
    )
    save(img, "missionary")


def lotus():
    img, d = canvas()
    body(
        d,
        {
            "head": (384, 230),
            "chest": (384, 300),
            "hip": (384, 410),
            "sl": (330, 290),
            "el": (300, 340),
            "hl": (310, 390),
            "sr": (438, 290),
            "er": (468, 340),
            "hr": (458, 390),
            "kl": (290, 470),
            "fl": (330, 520),
            "kr": (478, 470),
            "fr": (438, 520),
        },
        BLUE,
        thick=22,
    )
    body(
        d,
        {
            "head": (384, 180),
            "chest": (384, 260),
            "hip": (384, 350),
            "sl": (330, 250),
            "el": (300, 300),
            "hl": (320, 340),
            "sr": (438, 250),
            "er": (468, 300),
            "hr": (448, 340),
            "kl": (290, 390),
            "fl": (240, 350),
            "kr": (478, 390),
            "fr": (528, 350),
        },
        PINK,
        long_hair=True,
    )
    save(img, "lotus")


def cowgirl():
    img, d = canvas()
    # M on back
    body(
        d,
        {
            "head": (250, 430),
            "chest": (340, 430),
            "hip": (470, 430),
            "sl": (330, 390),
            "el": (300, 360),
            "hl": (280, 390),
            "sr": (340, 470),
            "er": (310, 510),
            "hr": (290, 530),
            "kl": (560, 380),
            "fl": (620, 360),
            "kr": (560, 490),
            "fr": (620, 510),
        },
        BLUE,
        thick=22,
    )
    # F straddling upright
    body(
        d,
        {
            "head": (400, 170),
            "chest": (400, 250),
            "hip": (400, 350),
            "sl": (350, 240),
            "el": (320, 290),
            "hl": (340, 330),
            "sr": (450, 240),
            "er": (480, 290),
            "hr": (460, 330),
            "kl": (320, 420),
            "fl": (290, 480),
            "kr": (480, 420),
            "fr": (510, 480),
        },
        PINK,
        long_hair=True,
    )
    save(img, "cowgirl")


def folded():
    img, d = canvas()
    body(
        d,
        {
            "head": (220, 360),
            "chest": (300, 370),
            "hip": (400, 390),
            "sl": (280, 330),
            "el": (250, 310),
            "hl": (230, 340),
            "sr": (290, 410),
            "er": (270, 450),
            "hr": (250, 470),
            "kl": (360, 250),
            "fl": (320, 200),
            "kr": (420, 260),
            "fr": (400, 200),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
    )
    body(
        d,
        {
            "head": (280, 300),
            "chest": (360, 330),
            "hip": (460, 370),
            "sl": (340, 290),
            "el": (320, 320),
            "hl": (340, 360),
            "sr": (350, 370),
            "er": (380, 400),
            "hr": (420, 420),
            "kl": (540, 340),
            "fl": (600, 320),
            "kr": (550, 430),
            "fr": (610, 450),
        },
        BLUE,
        thick=22,
    )
    save(img, "folded")


def embrace():
    lotus()  # same family; rewrite file key
    img = Image.open(OUT / "lotus.png").convert("RGBA")
    save(img, "embrace")
    # rebuild distinct
    img, d = canvas()
    body(
        d,
        {
            "head": (384, 240),
            "chest": (384, 310),
            "hip": (384, 420),
            "sl": (330, 300),
            "el": (300, 350),
            "hl": (320, 400),
            "sr": (438, 300),
            "er": (468, 350),
            "hr": (448, 400),
            "kl": (300, 490),
            "fl": (340, 540),
            "kr": (468, 490),
            "fr": (428, 540),
        },
        BLUE,
        thick=22,
    )
    body(
        d,
        {
            "head": (384, 190),
            "chest": (384, 270),
            "hip": (384, 360),
            "sl": (330, 260),
            "el": (300, 310),
            "hl": (330, 350),
            "sr": (438, 260),
            "er": (468, 310),
            "hr": (438, 350),
            "kl": (300, 400),
            "fl": (250, 360),
            "kr": (468, 400),
            "fr": (518, 360),
        },
        PINK,
        long_hair=True,
    )
    save(img, "embrace")


def legsup():
    img, d = canvas()
    body(
        d,
        {
            "head": (210, 360),
            "chest": (300, 370),
            "hip": (420, 390),
            "sl": (280, 330),
            "el": (250, 310),
            "hl": (230, 340),
            "sr": (290, 410),
            "er": (270, 450),
            "hr": (250, 470),
            "kl": (500, 220),
            "fl": (540, 160),
            "kr": (540, 280),
            "fr": (600, 240),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
    )
    body(
        d,
        {
            "head": (270, 300),
            "chest": (350, 330),
            "hip": (450, 370),
            "sl": (330, 290),
            "el": (310, 320),
            "hl": (330, 360),
            "sr": (340, 370),
            "er": (370, 400),
            "hr": (410, 420),
            "kl": (530, 340),
            "fl": (580, 400),
            "kr": (540, 430),
            "fr": (590, 480),
        },
        BLUE,
        thick=22,
    )
    save(img, "legsup")


def doggy():
    img, d = canvas()
    body(
        d,
        {
            "head": (170, 360),
            "chest": (280, 330),
            "hip": (420, 350),
            "sl": (250, 300),
            "el": (200, 380),
            "hl": (180, 440),
            "sr": (260, 360),
            "er": (210, 420),
            "hr": (190, 470),
            "kl": (480, 430),
            "fl": (500, 500),
            "kr": (500, 410),
            "fr": (540, 480),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
        thick=21,
    )
    body(
        d,
        {
            "head": (520, 250),
            "chest": (530, 320),
            "hip": (540, 410),
            "sl": (490, 310),
            "el": (450, 350),
            "hl": (430, 380),
            "sr": (570, 310),
            "er": (560, 360),
            "hr": (540, 390),
            "kl": (560, 500),
            "fl": (570, 560),
            "kr": (500, 510),
            "fr": (490, 570),
        },
        BLUE,
        thick=22,
    )
    save(img, "doggy")


def spoon():
    img, d = canvas()
    body(
        d,
        {
            "head": (190, 340),
            "chest": (290, 360),
            "hip": (430, 380),
            "sl": (280, 320),
            "el": (330, 300),
            "hl": (380, 310),
            "sr": (290, 400),
            "er": (320, 430),
            "hr": (350, 450),
            "kl": (540, 340),
            "fl": (600, 320),
            "kr": (540, 440),
            "fr": (600, 460),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
    )
    body(
        d,
        {
            "head": (230, 290),
            "chest": (330, 320),
            "hip": (470, 340),
            "sl": (320, 280),
            "el": (370, 270),
            "hl": (420, 290),
            "sr": (330, 360),
            "er": (380, 370),
            "hr": (430, 360),
            "kl": (580, 300),
            "fl": (640, 280),
            "kr": (580, 400),
            "fr": (640, 420),
        },
        BLUE,
        thick=22,
    )
    save(img, "spoon")


def prone():
    img, d = canvas()
    body(
        d,
        {
            "head": (180, 380),
            "chest": (290, 390),
            "hip": (450, 400),
            "sl": (280, 350),
            "el": (240, 330),
            "hl": (210, 350),
            "sr": (290, 430),
            "er": (250, 460),
            "hr": (220, 480),
            "kl": (560, 360),
            "fl": (620, 340),
            "kr": (560, 450),
            "fr": (620, 470),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
    )
    body(
        d,
        {
            "head": (240, 320),
            "chest": (350, 340),
            "hip": (500, 360),
            "sl": (340, 300),
            "el": (310, 330),
            "hl": (330, 370),
            "sr": (350, 380),
            "er": (380, 400),
            "hr": (420, 410),
            "kl": (600, 320),
            "fl": (650, 300),
            "kr": (600, 420),
            "fr": (650, 440),
        },
        BLUE,
        thick=22,
    )
    save(img, "prone")


def kneel():
    img, d = canvas()
    body(
        d,
        {
            "head": (220, 340),
            "chest": (300, 320),
            "hip": (390, 370),
            "sl": (280, 290),
            "el": (230, 360),
            "hl": (200, 420),
            "sr": (290, 350),
            "er": (240, 400),
            "hr": (210, 450),
            "kl": (420, 500),
            "fl": (400, 560),
            "kr": (460, 490),
            "fr": (480, 550),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
        thick=21,
    )
    body(
        d,
        {
            "head": (520, 230),
            "chest": (520, 310),
            "hip": (520, 410),
            "sl": (470, 310),
            "el": (430, 350),
            "hl": (410, 380),
            "sr": (570, 310),
            "er": (560, 360),
            "hr": (540, 390),
            "kl": (490, 510),
            "fl": (470, 570),
            "kr": (550, 510),
            "fr": (570, 570),
        },
        BLUE,
        thick=22,
    )
    save(img, "kneel")


def edgerear():
    img, d = canvas()
    # cream bed edge
    d.rounded_rectangle((80, 300, 420, 360), radius=18, fill=GROUND)
    body(
        d,
        {
            "head": (160, 250),
            "chest": (240, 270),
            "hip": (360, 320),
            "sl": (220, 240),
            "el": (180, 220),
            "hl": (150, 240),
            "sr": (230, 300),
            "er": (200, 330),
            "hr": (180, 350),
            "kl": (400, 420),
            "fl": (390, 490),
            "kr": (440, 410),
            "fr": (460, 480),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
        thick=21,
    )
    body(
        d,
        {
            "head": (520, 220),
            "chest": (520, 300),
            "hip": (520, 410),
            "sl": (470, 300),
            "el": (430, 340),
            "hl": (400, 360),
            "sr": (570, 300),
            "er": (560, 350),
            "hr": (540, 380),
            "kl": (490, 520),
            "fl": (480, 580),
            "kr": (550, 520),
            "fr": (560, 580),
        },
        BLUE,
        thick=22,
    )
    save(img, "edgerear")


def standdog():
    img, d = canvas()
    d.rectangle((80, 120, 120, 560), fill=GROUND)  # wall
    body(
        d,
        {
            "head": (200, 380),
            "chest": (280, 340),
            "hip": (380, 330),
            "sl": (250, 360),
            "el": (180, 300),
            "hl": (140, 250),
            "sr": (270, 320),
            "er": (230, 280),
            "hr": (190, 240),
            "kl": (400, 450),
            "fl": (390, 530),
            "kr": (440, 440),
            "fr": (460, 520),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
        thick=21,
    )
    body(
        d,
        {
            "head": (520, 210),
            "chest": (520, 300),
            "hip": (520, 420),
            "sl": (470, 300),
            "el": (430, 340),
            "hl": (400, 360),
            "sr": (570, 300),
            "er": (560, 360),
            "hr": (540, 390),
            "kl": (490, 520),
            "fl": (480, 580),
            "kr": (550, 520),
            "fr": (560, 580),
        },
        BLUE,
        thick=22,
    )
    save(img, "standdog")


def chair():
    img, d = canvas()
    d.rounded_rectangle((300, 420, 480, 560), radius=16, fill=GROUND)
    body(
        d,
        {
            "head": (390, 230),
            "chest": (390, 310),
            "hip": (390, 420),
            "sl": (340, 300),
            "el": (310, 350),
            "hl": (330, 400),
            "sr": (440, 300),
            "er": (470, 350),
            "hr": (450, 400),
            "kl": (330, 520),
            "fl": (320, 580),
            "kr": (450, 520),
            "fr": (460, 580),
        },
        BLUE,
        thick=22,
    )
    body(
        d,
        {
            "head": (390, 170),
            "chest": (390, 250),
            "hip": (390, 350),
            "sl": (340, 240),
            "el": (310, 290),
            "hl": (330, 340),
            "sr": (440, 240),
            "er": (470, 290),
            "hr": (450, 340),
            "kl": (310, 390),
            "fl": (270, 350),
            "kr": (470, 390),
            "fr": (510, 350),
        },
        PINK,
        long_hair=True,
    )
    save(img, "chair")


def straddle():
    img, d = canvas()
    d.rounded_rectangle((160, 470, 620, 560), radius=20, fill=GROUND)  # couch
    body(
        d,
        {
            "head": (384, 230),
            "chest": (384, 310),
            "hip": (384, 420),
            "sl": (330, 300),
            "el": (300, 350),
            "hl": (320, 400),
            "sr": (438, 300),
            "er": (468, 350),
            "hr": (448, 400),
            "kl": (310, 500),
            "fl": (300, 560),
            "kr": (458, 500),
            "fr": (468, 560),
        },
        BLUE,
        thick=22,
    )
    body(
        d,
        {
            "head": (384, 170),
            "chest": (384, 250),
            "hip": (384, 350),
            "sl": (330, 240),
            "el": (300, 290),
            "hl": (330, 340),
            "sr": (438, 240),
            "er": (468, 290),
            "hr": (438, 340),
            "kl": (300, 390),
            "fl": (250, 350),
            "kr": (468, 390),
            "fr": (518, 350),
        },
        PINK,
        long_hair=True,
    )
    save(img, "straddle")


def throne():
    img, d = canvas()
    d.rounded_rectangle((300, 430, 480, 560), radius=16, fill=GROUND)
    # M seated
    body(
        d,
        {
            "head": (400, 230),
            "chest": (400, 310),
            "hip": (400, 420),
            "sl": (350, 300),
            "el": (320, 350),
            "hl": (340, 390),
            "sr": (450, 300),
            "er": (480, 350),
            "hr": (460, 390),
            "kl": (340, 520),
            "fl": (330, 580),
            "kr": (460, 520),
            "fr": (470, 580),
        },
        BLUE,
        thick=22,
    )
    # F facing away (reverse) — back toward viewer-ish, facing left
    body(
        d,
        {
            "head": (280, 200),
            "chest": (320, 270),
            "hip": (380, 360),
            "sl": (300, 250),
            "el": (270, 300),
            "hl": (290, 340),
            "sr": (350, 260),
            "er": (360, 310),
            "hr": (370, 350),
            "kl": (300, 420),
            "fl": (250, 450),
            "kr": (420, 400),
            "fr": (470, 430),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
    )
    save(img, "throne")


def couch():
    img, d = canvas()
    d.rounded_rectangle((140, 380, 520, 470), radius=18, fill=GROUND)
    d.rounded_rectangle((140, 280, 200, 470), radius=14, fill=GROUND)  # backrest
    body(
        d,
        {
            "head": (260, 250),
            "chest": (320, 280),
            "hip": (400, 340),
            "sl": (290, 260),
            "el": (230, 240),
            "hl": (190, 230),
            "sr": (310, 310),
            "er": (280, 350),
            "hr": (250, 370),
            "kl": (430, 430),
            "fl": (420, 500),
            "kr": (470, 420),
            "fr": (490, 490),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
        thick=21,
    )
    body(
        d,
        {
            "head": (540, 220),
            "chest": (540, 300),
            "hip": (540, 400),
            "sl": (490, 300),
            "el": (450, 340),
            "hl": (420, 360),
            "sr": (590, 300),
            "er": (580, 350),
            "hr": (560, 380),
            "kl": (510, 510),
            "fl": (500, 570),
            "kr": (570, 510),
            "fr": (580, 570),
        },
        BLUE,
        thick=22,
    )
    save(img, "couch")


def counter():
    img, d = canvas()
    d.rounded_rectangle((120, 290, 430, 360), radius=16, fill=GROUND)
    body(
        d,
        {
            "head": (220, 180),
            "chest": (280, 230),
            "hip": (360, 290),
            "sl": (250, 200),
            "el": (230, 240),
            "hl": (220, 280),
            "sr": (290, 260),
            "er": (280, 300),
            "hr": (270, 330),
            "kl": (430, 230),
            "fl": (490, 200),
            "kr": (440, 330),
            "fr": (500, 360),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
    )
    body(
        d,
        {
            "head": (520, 200),
            "chest": (520, 290),
            "hip": (520, 410),
            "sl": (470, 290),
            "el": (430, 300),
            "hl": (400, 310),
            "sr": (570, 290),
            "er": (560, 350),
            "hr": (540, 380),
            "kl": (490, 520),
            "fl": (480, 580),
            "kr": (550, 520),
            "fr": (560, 580),
        },
        BLUE,
        thick=22,
    )
    save(img, "counter")


def wall():
    img, d = canvas()
    d.rectangle((90, 120, 130, 560), fill=GROUND)
    body(
        d,
        {
            "head": (280, 180),
            "chest": (300, 270),
            "hip": (320, 400),
            "sl": (250, 260),
            "el": (220, 320),
            "hl": (230, 370),
            "sr": (350, 260),
            "er": (380, 320),
            "hr": (370, 370),
            "kl": (300, 500),
            "fl": (290, 570),
            "kr": (400, 460),
            "fr": (460, 430),  # hooked leg
        },
        PINK,
        long_hair=True,
    )
    body(
        d,
        {
            "head": (420, 200),
            "chest": (430, 290),
            "hip": (440, 410),
            "sl": (380, 290),
            "el": (350, 330),
            "hl": (340, 360),
            "sr": (480, 290),
            "er": (490, 350),
            "hr": (470, 390),
            "kl": (410, 520),
            "fl": (400, 580),
            "kr": (480, 520),
            "fr": (490, 580),
        },
        BLUE,
        thick=22,
    )
    save(img, "wall")


def lift():
    img, d = canvas()
    d.rectangle((90, 120, 130, 560), fill=GROUND)
    body(
        d,
        {
            "head": (400, 220),
            "chest": (400, 310),
            "hip": (400, 430),
            "sl": (350, 310),
            "el": (330, 370),
            "hl": (350, 400),
            "sr": (450, 310),
            "er": (470, 370),
            "hr": (450, 400),
            "kl": (370, 530),
            "fl": (360, 590),
            "kr": (430, 530),
            "fr": (440, 590),
        },
        BLUE,
        thick=24,
    )
    body(
        d,
        {
            "head": (400, 110),
            "chest": (400, 190),
            "hip": (400, 280),
            "sl": (350, 180),
            "el": (330, 230),
            "hl": (350, 260),
            "sr": (450, 180),
            "er": (470, 230),
            "hr": (450, 260),
            "kl": (320, 300),
            "fl": (280, 270),
            "kr": (480, 300),
            "fr": (520, 270),
        },
        PINK,
        long_hair=True,
    )
    save(img, "lift")


def bentstand():
    img, d = canvas()
    d.rounded_rectangle((80, 300, 380, 350), radius=14, fill=GROUND)
    body(
        d,
        {
            "head": (150, 250),
            "chest": (230, 270),
            "hip": (340, 320),
            "sl": (210, 240),
            "el": (170, 220),
            "hl": (140, 240),
            "sr": (220, 300),
            "er": (200, 330),
            "hr": (180, 350),
            "kl": (360, 420),
            "fl": (350, 500),
            "kr": (400, 410),
            "fr": (420, 490),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
        thick=21,
    )
    body(
        d,
        {
            "head": (520, 210),
            "chest": (520, 300),
            "hip": (520, 420),
            "sl": (470, 300),
            "el": (430, 340),
            "hl": (400, 360),
            "sr": (570, 300),
            "er": (560, 360),
            "hr": (540, 390),
            "kl": (490, 520),
            "fl": (480, 580),
            "kr": (550, 520),
            "fr": (560, 580),
        },
        BLUE,
        thick=22,
    )
    save(img, "bentstand")


def shower():
    img, d = canvas()
    d.rounded_rectangle((480, 420, 580, 480), radius=12, fill=GROUND)  # ledge
    body(
        d,
        {
            "head": (320, 180),
            "chest": (330, 270),
            "hip": (340, 400),
            "sl": (280, 260),
            "el": (260, 320),
            "hl": (270, 370),
            "sr": (380, 260),
            "er": (400, 320),
            "hr": (390, 370),
            "kl": (320, 500),
            "fl": (310, 570),
            "kr": (420, 460),
            "fr": (500, 450),  # foot on ledge
        },
        PINK,
        long_hair=True,
    )
    body(
        d,
        {
            "head": (430, 200),
            "chest": (440, 290),
            "hip": (450, 410),
            "sl": (390, 290),
            "el": (360, 330),
            "hl": (350, 360),
            "sr": (490, 290),
            "er": (500, 350),
            "hr": (480, 390),
            "kl": (420, 520),
            "fl": (410, 580),
            "kr": (490, 520),
            "fr": (500, 580),
        },
        BLUE,
        thick=22,
    )
    save(img, "shower")


def oral_kneel():
    img, d = canvas()
    # F standing/perched
    body(
        d,
        {
            "head": (480, 160),
            "chest": (480, 250),
            "hip": (480, 370),
            "sl": (430, 250),
            "el": (410, 310),
            "hl": (430, 350),
            "sr": (530, 250),
            "er": (550, 310),
            "hr": (530, 350),
            "kl": (440, 480),
            "fl": (430, 560),
            "kr": (520, 480),
            "fr": (530, 560),
        },
        PINK,
        long_hair=True,
    )
    # M kneeling, head at her hips/private
    body(
        d,
        {
            "head": (380, 360),  # at hip height
            "chest": (340, 420),
            "hip": (300, 500),
            "sl": (360, 400),
            "el": (400, 390),
            "hl": (440, 380),  # hands on her hips
            "sr": (320, 430),
            "er": (300, 470),
            "hr": (290, 500),
            "kl": (280, 560),
            "fl": (260, 610),
            "kr": (340, 560),
            "fr": (360, 610),
        },
        BLUE,
        thick=21,
    )
    save(img, "oral-kneel")


def facesit():
    img, d = canvas()
    # M on back
    body(
        d,
        {
            "head": (300, 460),
            "chest": (380, 450),
            "hip": (500, 440),
            "sl": (370, 410),
            "el": (340, 390),
            "hl": (320, 410),
            "sr": (390, 490),
            "er": (360, 520),
            "hr": (340, 540),
            "kl": (580, 400),
            "fl": (630, 380),
            "kr": (580, 500),
            "fr": (630, 520),
        },
        BLUE,
        thick=22,
    )
    # F kneeling over his face
    body(
        d,
        {
            "head": (300, 160),
            "chest": (300, 240),
            "hip": (300, 340),  # hips over his head
            "sl": (250, 230),
            "el": (230, 280),
            "hl": (250, 320),
            "sr": (350, 230),
            "er": (370, 280),
            "hr": (350, 320),
            "kl": (240, 420),
            "fl": (220, 480),
            "kr": (360, 420),
            "fr": (380, 480),
        },
        PINK,
        long_hair=True,
    )
    save(img, "facesit")


def sixtynine():
    img, d = canvas()
    # F head left
    body(
        d,
        {
            "head": (180, 340),
            "chest": (280, 350),
            "hip": (400, 370),
            "sl": (270, 310),
            "el": (300, 290),
            "hl": (360, 300),
            "sr": (280, 390),
            "er": (310, 410),
            "hr": (360, 420),
            "kl": (500, 320),
            "fl": (560, 300),
            "kr": (510, 440),
            "fr": (570, 460),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
    )
    # M opposite, head right, near her hips
    body(
        d,
        {
            "head": (560, 400),
            "chest": (460, 390),
            "hip": (340, 370),
            "sl": (470, 430),
            "el": (500, 450),
            "hl": (420, 400),
            "sr": (460, 350),
            "er": (430, 330),
            "hr": (400, 350),
            "kl": (240, 420),
            "fl": (180, 440),
            "kr": (240, 320),
            "fr": (180, 300),
        },
        BLUE,
        thick=21,
    )
    save(img, "sixtynine")


def edgeoral():
    img, d = canvas()
    d.rounded_rectangle((300, 280, 650, 340), radius=16, fill=GROUND)  # bed edge
    body(
        d,
        {
            "head": (520, 160),
            "chest": (500, 230),
            "hip": (450, 300),
            "sl": (460, 220),
            "el": (440, 260),
            "hl": (430, 290),
            "sr": (540, 220),
            "er": (560, 260),
            "hr": (550, 300),
            "kl": (400, 250),
            "fl": (360, 210),
            "kr": (520, 360),
            "fr": (560, 400),
        },
        PINK,
        long_hair=True,
    )
    # M kneeling between thighs, head at private
    body(
        d,
        {
            "head": (420, 360),
            "chest": (380, 420),
            "hip": (340, 500),
            "sl": (400, 400),
            "el": (430, 380),
            "hl": (460, 360),
            "sr": (360, 430),
            "er": (340, 470),
            "hr": (330, 500),
            "kl": (320, 560),
            "fl": (300, 610),
            "kr": (380, 560),
            "fr": (400, 610),
        },
        BLUE,
        thick=21,
    )
    save(img, "edgeoral")


def scissors():
    img, d = canvas()
    body(
        d,
        {
            "head": (170, 330),
            "chest": (270, 350),
            "hip": (390, 380),
            "sl": (260, 310),
            "el": (230, 290),
            "hl": (210, 310),
            "sr": (270, 390),
            "er": (250, 430),
            "hr": (230, 450),
            "kl": (500, 260),
            "fl": (560, 220),
            "kr": (480, 500),
            "fr": (520, 560),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
    )
    body(
        d,
        {
            "head": (600, 350),
            "chest": (500, 370),
            "hip": (380, 400),
            "sl": (510, 330),
            "el": (540, 310),
            "hl": (560, 330),
            "sr": (500, 410),
            "er": (520, 450),
            "hr": (540, 470),
            "kl": (280, 280),
            "fl": (220, 240),
            "kr": (300, 520),
            "fr": (260, 580),
        },
        BLUE,
        thick=21,
    )
    save(img, "scissors")


def cross():
    img, d = canvas()
    body(
        d,
        {
            "head": (200, 350),
            "chest": (300, 360),
            "hip": (440, 380),
            "sl": (290, 320),
            "el": (260, 300),
            "hl": (240, 320),
            "sr": (300, 400),
            "er": (280, 440),
            "hr": (260, 460),
            "kl": (540, 300),
            "fl": (600, 280),
            "kr": (540, 460),
            "fr": (600, 480),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
    )
    # M on side perpendicular
    body(
        d,
        {
            "head": (520, 200),
            "chest": (500, 280),
            "hip": (470, 390),
            "sl": (460, 270),
            "el": (430, 310),
            "hl": (450, 350),
            "sr": (540, 280),
            "er": (560, 330),
            "hr": (550, 370),
            "kl": (400, 480),
            "fl": (360, 540),
            "kr": (520, 500),
            "fr": (560, 560),
        },
        BLUE,
        thick=21,
    )
    save(img, "cross")


def bridge():
    img, d = canvas()
    body(
        d,
        {
            "head": (200, 400),
            "chest": (300, 320),
            "hip": (440, 340),
            "sl": (280, 300),
            "el": (250, 340),
            "hl": (230, 380),
            "sr": (300, 360),
            "er": (270, 400),
            "hr": (250, 430),
            "kl": (500, 420),
            "fl": (480, 510),
            "kr": (540, 400),
            "fr": (560, 490),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
    )
    body(
        d,
        {
            "head": (520, 200),
            "chest": (520, 290),
            "hip": (520, 400),
            "sl": (470, 290),
            "el": (440, 330),
            "hl": (450, 360),
            "sr": (570, 290),
            "er": (560, 340),
            "hr": (540, 370),
            "kl": (490, 510),
            "fl": (480, 570),
            "kr": (550, 510),
            "fr": (560, 570),
        },
        BLUE,
        thick=22,
    )
    save(img, "bridge")


def table():
    counter()
    img = Image.open(OUT / "counter.png")
    save(img.convert("RGBA"), "table")


def butterfly():
    img, d = canvas()
    d.rounded_rectangle((80, 340, 420, 400), radius=16, fill=GROUND)
    body(
        d,
        {
            "head": (200, 220),
            "chest": (260, 270),
            "hip": (340, 340),
            "sl": (230, 240),
            "el": (210, 280),
            "hl": (200, 310),
            "sr": (280, 290),
            "er": (270, 330),
            "hr": (260, 360),
            "kl": (420, 220),
            "fl": (480, 180),
            "kr": (450, 400),
            "fr": (520, 440),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
    )
    body(
        d,
        {
            "head": (540, 200),
            "chest": (540, 290),
            "hip": (540, 410),
            "sl": (490, 290),
            "el": (450, 310),
            "hl": (420, 330),
            "sr": (590, 290),
            "er": (580, 350),
            "hr": (560, 380),
            "kl": (510, 520),
            "fl": (500, 580),
            "kr": (570, 520),
            "fr": (580, 580),
        },
        BLUE,
        thick=22,
    )
    save(img, "butterfly")


def foldedpress():
    img, d = canvas()
    body(
        d,
        {
            "head": (220, 380),
            "chest": (300, 360),
            "hip": (400, 400),
            "sl": (280, 330),
            "el": (250, 310),
            "hl": (230, 340),
            "sr": (290, 400),
            "er": (270, 440),
            "hr": (250, 460),
            "kl": (340, 220),
            "fl": (300, 170),
            "kr": (420, 230),
            "fr": (400, 170),
        },
        PINK,
        long_hair=True,
        hair_side=-1,
    )
    body(
        d,
        {
            "head": (420, 220),
            "chest": (430, 300),
            "hip": (440, 400),
            "sl": (390, 290),
            "el": (370, 330),
            "hl": (390, 370),
            "sr": (470, 290),
            "er": (490, 340),
            "hr": (480, 380),
            "kl": (410, 510),
            "fl": (400, 570),
            "kr": (480, 510),
            "fr": (490, 570),
        },
        BLUE,
        thick=22,
    )
    save(img, "foldedpress")


def main():
    missionary()
    lotus()
    cowgirl()
    folded()
    embrace()
    legsup()
    doggy()
    spoon()
    prone()
    kneel()
    edgerear()
    standdog()
    chair()
    straddle()
    throne()
    couch()
    counter()
    wall()
    lift()
    bentstand()
    shower()
    oral_kneel()
    facesit()
    sixtynine()
    edgeoral()
    scissors()
    cross()
    bridge()
    table()
    butterfly()
    foldedpress()
    print("done", len(list(OUT.glob("*.png"))))


if __name__ == "__main__":
    main()
