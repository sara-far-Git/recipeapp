"""Knock out the cream backdrop from the complete loader illustrations."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

SRC = Path("/Users/user2/Documents/recipe/frontend/public/loaders")
KINDS = ("shopping", "search", "collection", "recipe")


def is_backdrop(r: int, g: int, b: int) -> bool:
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    sat = max(r, g, b) - min(r, g, b)
    return lum >= 244 and sat <= 22


def knock_out(im: Image.Image) -> Image.Image:
    rgb = im.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
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
        r, g, b = px[x, y]
        if not is_backdrop(r, g, b):
            continue
        backdrop[y][x] = True
        q.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))

    # Eat the anti-aliased cream halo around the object.
    grown = [row[:] for row in backdrop]
    for y in range(h):
        for x in range(w):
            if not backdrop[y][x]:
                continue
            for ny in (y - 1, y, y + 1):
                for nx in (x - 1, x, x + 1):
                    if 0 <= nx < w and 0 <= ny < h:
                        grown[ny][nx] = True
    backdrop = grown

    out = Image.new("RGBA", (w, h))
    dest = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            dest[x, y] = (r, g, b, 0 if backdrop[y][x] else 255)
    alpha = out.split()[-1].filter(ImageFilter.GaussianBlur(0.7))
    # Clear leftover cream at the frame edge.
    edge = 6
    apx = alpha.load()
    opx = out.load()
    for y in range(h):
        for x in range(w):
            if x >= edge and y >= edge and x < w - edge and y < h - edge:
                continue
            r, g, b, _a = opx[x, y]
            lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
            if lum >= 230:
                apx[x, y] = 0
    out.putalpha(alpha)
    bbox = alpha.getbbox()
    if bbox:
        x0, y0, x1, y1 = bbox
        pad = 8
        out = out.crop((
            max(0, x0 - pad),
            max(0, y0 - pad),
            min(w, x1 + pad),
            min(h, y1 + pad),
        ))
    return out


def main() -> None:
    for kind in KINDS:
        src = SRC / f"{kind}.png"
        dest = SRC / f"{kind}-scene.png"
        cut = knock_out(Image.open(src))
        cut.save(dest, optimize=True)
        print(f"{kind}: {cut.size[0]}x{cut.size[1]} -> {dest.name}")


if __name__ == "__main__":
    main()
