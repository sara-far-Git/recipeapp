"""Trim the isolated loader pieces into centered square symbols."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

SRC = Path("/Users/user2/Documents/recipe/frontend/public/loaders")
DST = Path("/Users/user2/Documents/recipe/frontend/public/symbols")
SIZE = 512

PIECES = {
    "heart": "collection-heart.png",
    "chat": "collection-chat.png",
    "lens": "search-lens.png",
    "filter": "search-filter.png",
    "ribbon": "collection-ribbon.png",
    "pad": "shopping-pad.png",
    "pen": "shopping-pen.png",
    "card": "recipe-card.png",
    "box": "recipe-box.png",
}


def trim(im: Image.Image, pad: int = 6) -> Image.Image:
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


def square(im: Image.Image) -> Image.Image:
    side = max(im.width, im.height)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((side - im.width) // 2, (side - im.height) // 2))
    return canvas.resize((SIZE, SIZE), Image.Resampling.LANCZOS)


def main() -> None:
    DST.mkdir(parents=True, exist_ok=True)
    for name, filename in PIECES.items():
        cut = square(trim(Image.open(SRC / filename).convert("RGBA")))
        dest = DST / f"{name}.png"
        cut.save(dest, optimize=True)
        print(f"{name:8} {cut.size[0]}x{cut.size[1]} -> {dest.name}")


if __name__ == "__main__":
    main()
