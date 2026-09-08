"""Knock out black backdrops and pin loader layers onto shared canvases."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

DOWNLOADS = Path("/Users/user2/Downloads")
DST = Path("/Users/user2/Documents/recipe/frontend/public/loaders")
PREVIEW = Path("/Users/user2/Documents/recipe/frontend/scripts/loader-preview")
SIZE = 1400

SOURCES = {
    "shopping-pad": "ChatGPT Image Sep 7, 2026, 10_37_17 PM.png",
    "shopping-pen": "ChatGPT Image Sep 7, 2026, 10_37_28 PM.png",
    "search-cards": "ChatGPT Image Sep 7, 2026, 10_37_38 PM.png",
    "search-lens": "ChatGPT Image Sep 7, 2026, 10_37_46 PM.png",
    "search-filter": "ChatGPT Image Sep 7, 2026, 10_37_56 PM.png",
    "collection-cards": "ChatGPT Image Sep 7, 2026, 10_38_08 PM.png",
    "collection-ribbon": "ChatGPT Image Sep 7, 2026, 10_38_22 PM.png",
    "collection-chat": "ChatGPT Image Sep 7, 2026, 10_38_34 PM.png",
    "collection-heart": "ChatGPT Image Sep 7, 2026, 10_38_44 PM.png",
    "recipe-box": "ChatGPT Image Sep 7, 2026, 10_38_54 PM.png",
    "recipe-tab-desserts": "ChatGPT Image Sep 7, 2026, 10_52_15 PM.png",
    "recipe-tab-mains": "ChatGPT Image Sep 7, 2026, 10_52_21 PM.png",
    "recipe-card": "ChatGPT Image Sep 7, 2026, 10_52_27 PM.png",
}

# (cx, cy, target_h) on the 1400 canvas. Height drives scale.
LAYOUTS = {
    "shopping-pad": (680, 730, 1000),
    "shopping-pen": (1045, 600, 740),
    "search-cards": (640, 690, 980),
    "search-lens": (490, 620, 540),
    "search-filter": (1085, 1035, 280),
    "collection-cards": (700, 680, 1000),
    "collection-ribbon": (990, 230, 440),
    "collection-chat": (1130, 1045, 210),
    "collection-heart": (290, 1090, 220),
    "recipe-tab-desserts": (560, 520, 760),
    "recipe-tab-mains": (650, 575, 720),
    "recipe-card": (720, 555, 660),
    "recipe-box": (700, 990, 580),
}

SCENES = {
    "shopping": ["shopping-pad", "shopping-pen"],
    "search": ["search-cards", "search-filter", "search-lens"],
    "collection": ["collection-cards", "collection-ribbon", "collection-chat", "collection-heart"],
    "recipe": ["recipe-tab-desserts", "recipe-tab-mains", "recipe-card", "recipe-box"],
}


def is_backdrop(r: int, g: int, b: int) -> bool:
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    sat = max(r, g, b) - min(r, g, b)
    return lum <= 18 and sat <= 16


def knock_out_black(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    seen = [[False] * w for _ in range(h)]
    backdrop = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y][x]:
            continue
        seen[y][x] = True
        r, g, b, _a = px[x, y]
        if not is_backdrop(r, g, b):
            continue
        backdrop[y][x] = True
        q.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))

    out = Image.new("RGBA", (w, h))
    dest = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            dest[x, y] = (r, g, b, 0 if backdrop[y][x] else a)
    alpha = out.split()[-1].filter(ImageFilter.GaussianBlur(0.8))
    out.putalpha(alpha)
    return out


def trim(im: Image.Image, pad: int = 10) -> Image.Image:
    bbox = im.split()[-1].getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    return im.crop((
        max(0, x0 - pad),
        max(0, y0 - pad),
        min(im.width, x1 + pad),
        min(im.height, y1 + pad),
    ))


def place(im: Image.Image, cx: float, cy: float, target_h: float) -> Image.Image:
    scale = target_h / im.height
    nw, nh = max(1, int(im.width * scale)), max(1, int(im.height * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(im, (int(round(cx - nw / 2)), int(round(cy - nh / 2))))
    return canvas


def main() -> None:
    DST.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)
    layers: dict[str, Image.Image] = {}
    for name, filename in SOURCES.items():
        src = DOWNLOADS / filename
        raw = knock_out_black(Image.open(src))
        cut = trim(raw)
        cx, cy, target_h = LAYOUTS[name]
        pinned = place(cut, cx, cy, target_h)
        dest = DST / f"{name}.png"
        pinned.save(dest, optimize=True)
        layers[name] = pinned
        print(f"{name:24} cut={cut.size[0]}x{cut.size[1]} -> {dest.name}")

    for scene, names in SCENES.items():
        sheet = Image.new("RGBA", (SIZE, SIZE), (227, 207, 178, 255))
        for name in names:
            sheet.alpha_composite(layers[name])
        preview = PREVIEW / f"{scene}.png"
        sheet.save(preview)
        print(f"preview {preview.name}")


if __name__ == "__main__":
    main()
