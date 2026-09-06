"""Knock out white backdrops and pin clock layers for a pendulum horologe."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

SRC = Path("/Users/user2/.cursor/projects/Users-user2-Documents-recipe/assets")
DST = Path("/Users/user2/Documents/recipe/frontend/public/marks")
SIZE = 1200
# Dial sits high so a pendulum can hang below it.
FACE_CX = 600
FACE_CY = 400
FACE_DIAM = 620


def knock_out_white(im: Image.Image) -> Image.Image:
    rgb = im.convert("RGB")
    w, h = rgb.size
    src = rgb.load()
    alpha = Image.new("L", (w, h), 0)
    dest = alpha.load()
    for y in range(h):
        for x in range(w):
            r, g, b = src[x, y]
            mx, mn = max(r, g, b), min(r, g, b)
            sat = mx - mn
            if mn > 232 or (mn > 220 and sat < 10 and mx > 236):
                dest[x, y] = 0
            else:
                dest[x, y] = 255
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.6))
    out = rgb.copy()
    out.putalpha(alpha)
    return out


def opaque(im: Image.Image, thresh: int = 20) -> list[list[bool]]:
    a = im.split()[-1].load()
    w, h = im.size
    return [[a[x, y] > thresh for x in range(w)] for y in range(h)]


def flood_exterior(ok: list[list[bool]]) -> list[list[bool]]:
    h, w = len(ok), len(ok[0])
    seen = [[False] * w for _ in range(h)]
    q = deque()
    for x in range(w):
        q.append((0, x))
        q.append((h - 1, x))
    for y in range(h):
        q.append((y, 0))
        q.append((y, w - 1))
    while q:
        y, x = q.popleft()
        if y < 0 or y >= h or x < 0 or x >= w or seen[y][x] or ok[y][x]:
            continue
        seen[y][x] = True
        q.extend(((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)))
    return seen


def interior_hole_center(im: Image.Image) -> tuple[float, float] | None:
    ok = opaque(im)
    exterior = flood_exterior(ok)
    h, w = len(ok), len(ok[0])
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            if not ok[y][x] and not exterior[y][x]:
                xs.append(x)
                ys.append(y)
    if len(xs) < 30:
        return None
    return sum(xs) / len(xs), sum(ys) / len(ys)


def mass_center(im: Image.Image) -> tuple[float, float, int, int, int, int]:
    a = im.split()[-1].load()
    w, h = im.size
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            if a[x, y] > 20:
                xs.append(x)
                ys.append(y)
    return (
        sum(xs) / len(xs),
        sum(ys) / len(ys),
        min(xs),
        max(xs),
        min(ys),
        max(ys),
    )


def compose(im: Image.Image, src_cx: float, src_cy: float, dest_cx: float, dest_cy: float, scale: float = 1.0) -> Image.Image:
    if scale != 1.0:
        nw, nh = max(1, int(im.width * scale)), max(1, int(im.height * scale))
        im = im.resize((nw, nh), Image.Resampling.LANCZOS)
        src_cx *= scale
        src_cy *= scale
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(
        im,
        (int(round(dest_cx - src_cx)), int(round(dest_cy - src_cy))),
    )
    return canvas


def process_face(src: Path, dest: Path) -> None:
    im = knock_out_white(Image.open(src))
    cx, cy, minx, maxx, miny, maxy = mass_center(im)
    diam = max(maxx - minx, maxy - miny)
    scale = FACE_DIAM / diam
    compose(im, cx, cy, FACE_CX, FACE_CY, scale).save(dest)
    print(f"wrote {dest.name}  centre=({cx:.1f},{cy:.1f}) scale={scale:.3f}")


def process_hand(src: Path, dest: Path, max_up: float) -> None:
    im = knock_out_white(Image.open(src))
    hole = interior_hole_center(im)
    if hole:
        cx, cy = hole
        how = "hole"
    else:
        ok = opaque(im)
        h, w = len(ok), len(ok[0])
        lo = int(h * 0.45)
        best_y, best_w = lo, 0
        for y in range(lo, h):
            width = sum(ok[y])
            if width > best_w:
                best_w, best_y = width, y
        xs = [x for x in range(w) if ok[best_y][x]]
        cx = sum(xs) / len(xs) if xs else w / 2
        cy = float(best_y)
        how = "hub"
    _cx, _cy, _minx, _maxx, miny, _maxy = mass_center(im)
    reach = cy - miny
    scale = (max_up / reach) if reach > 0 and reach > max_up else 1.0
    compose(im, cx, cy, FACE_CX, FACE_CY, scale).save(dest)
    print(f"wrote {dest.name}  pivot={how} ({cx:.1f},{cy:.1f}) scale={scale:.3f}")


def process_pendulum(src: Path, dest: Path) -> None:
    im = knock_out_white(Image.open(src))
    hole = interior_hole_center(im)
    cx, cy, minx, maxx, miny, maxy = mass_center(im)
    if hole:
        px, py = hole
        how = "hole"
    else:
        # Top of the rod is the hang point.
        px, py = cx, float(miny + 8)
        how = "top"
    hang_y = FACE_CY + FACE_DIAM / 2 - 8
    reach = maxy - py
    room = SIZE - hang_y - 36
    scale = (room / reach) if reach > room else 1.0
    compose(im, px, py, FACE_CX, hang_y, scale).save(dest)
    print(f"wrote {dest.name}  hang={how} ({px:.1f},{py:.1f}) scale={scale:.3f}")


def main() -> None:
    DST.mkdir(parents=True, exist_ok=True)
    process_face(SRC / "clock-face.png", DST / "clock-face.png")
    process_hand(SRC / "clock-hour.png", DST / "clock-hour.png", max_up=165)
    process_hand(SRC / "clock-minute.png", DST / "clock-minute.png", max_up=240)
    process_hand(SRC / "clock-second.png", DST / "clock-second.png", max_up=275)
    process_pendulum(SRC / "clock-pendulum.png", DST / "clock-pendulum.png")


if __name__ == "__main__":
    main()
