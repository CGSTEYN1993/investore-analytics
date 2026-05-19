"""Auto-crop landing-page screenshots so content fills the preview frame.

The PNGs in `frontend/public/screenshots/` were captured at 3200x1800 but
the actual app content only occupies the upper-left portion of the frame
(the right and bottom are empty/background). This script detects the
rightmost column and bottom-most row containing real content and crops
to those bounds plus a small padding.

To re-crop, the script reads from `_original/` (full-resolution backups)
on every run, so it is fully idempotent.
"""
from pathlib import Path
from PIL import Image
import numpy as np

SRC_DIR = Path(__file__).resolve().parent.parent / "public" / "screenshots"
BACKUP_DIR = SRC_DIR / "_original"
PAD = 16                # px of padding to keep after the main content block
MIN_KEEP_FRAC = 0.25    # never crop below 25% of original width/height
BG_TOL = 14             # per-channel tolerance when matching the background colour
WINDOW = 50             # px window for rolling density
DENSITY_THRESH = 0.04   # fraction of window pixels that must be non-bg to be "dense"
GAP_REQUIRED = 80       # px of sustained low-density to declare end of content block


def _bg_colour(arr: np.ndarray) -> np.ndarray:
    """Estimate the background colour from the rightmost 3% of columns."""
    h, w, _ = arr.shape
    strip = arr[:, int(w * 0.97) :, :].reshape(-1, 3)
    return np.median(strip, axis=0).astype(np.int16)


def _end_of_content(counts: np.ndarray, total: int) -> int:
    """Scan outward from the centre of the axis. Return the index where
    the main content block ends — i.e. the first position past the centre
    where rolling density stays below DENSITY_THRESH for GAP_REQUIRED
    consecutive positions. This deliberately stops BEFORE thin scrollbar
    strips that live in the empty zone on the far edge.
    """
    n = counts.size
    csum = np.concatenate([[0], np.cumsum(counts)])
    # rolling[i] = density (fraction) over window ending at i (inclusive).
    rolling = np.zeros(n, dtype=np.float32)
    rolling[WINDOW - 1 :] = (csum[WINDOW:] - csum[:-WINDOW]) / (WINDOW * total)

    centre = n // 2
    gap_run = 0
    for i in range(centre, n):
        if rolling[i] < DENSITY_THRESH:
            gap_run += 1
            if gap_run >= GAP_REQUIRED:
                # End of content is where the gap started.
                return i - GAP_REQUIRED
        else:
            gap_run = 0
    # No sustained gap found — content extends to the edge.
    return n - 1


def crop_one(src_path: Path, dst_path: Path) -> None:
    img = Image.open(src_path).convert("RGB")
    arr = np.asarray(img)
    h, w, _ = arr.shape

    bg = _bg_colour(arr)
    diff = np.abs(arr.astype(np.int16) - bg).max(axis=2)
    is_content = diff > BG_TOL

    col_counts = is_content.sum(axis=0)
    row_counts = is_content.sum(axis=1)

    last_col = _end_of_content(col_counts, h)
    last_row = _end_of_content(row_counts, w)

    crop_w = max(min(w, last_col + PAD), int(w * MIN_KEEP_FRAC))
    crop_h = max(min(h, last_row + PAD), int(h * MIN_KEEP_FRAC))

    cropped = img.crop((0, 0, crop_w, crop_h))
    cropped.save(dst_path, optimize=True)
    print(
        f"  {src_path.name}: {w}x{h} -> {crop_w}x{crop_h} "
        f"({crop_w / w:.0%} x {crop_h / h:.0%})"
    )


def main() -> None:
    if not BACKUP_DIR.exists():
        # First-ever run: back up the current PNGs before destructive cropping.
        BACKUP_DIR.mkdir(parents=True)
        for p in SRC_DIR.glob("*.png"):
            (BACKUP_DIR / p.name).write_bytes(p.read_bytes())
        print(f"Backed up originals to {BACKUP_DIR}")

    pngs = sorted(BACKUP_DIR.glob("*.png"))
    if not pngs:
        print(f"No PNGs found in {BACKUP_DIR}")
        return
    print(f"Cropping {len(pngs)} screenshot(s) from {BACKUP_DIR} -> {SRC_DIR}:")
    for p in pngs:
        crop_one(p, SRC_DIR / p.name)


if __name__ == "__main__":
    main()
