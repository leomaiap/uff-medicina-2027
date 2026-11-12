import cv2
import glob
import os
import time
import numpy as np
from PIL import Image
from rembg import new_session, remove

def perfect_matte(orig_bgr, ai_alpha, gender='female', frame_idx=1):
    """
    Combines AI semantic segmentation mask with luminance connected components
    to recover lab coat folds, flying sleeves, and outstretched arms/hands
    without introducing dark background noise. Also fixes the dark t-shirt
    cut-off on lower torso/belly for female frames 1 to 6.
    """
    gray = cv2.cvtColor(orig_bgr, cv2.COLOR_BGR2GRAY)
    bright = (gray > 28).astype(np.uint8)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(bright, connectivity=8)
    clean_bright = np.zeros_like(bright)
    for i in range(1, num_labels):
        if stats[i, cv2.CC_STAT_AREA] > 300:
            clean_bright[labels == i] = 1

    combined = np.maximum(ai_alpha, clean_bright * 255)

    # Anatomical waist / lower torso correction for female initial frames
    if gender == 'female' and frame_idx <= 6:
        # Fill internal shadow gaps under arm (y=670..715)
        for y in range(670, 715):
            row = combined[y, :]
            fg = np.where(row > 10)[0]
            if len(fg):
                min_x = fg.min()
                max_x = min(fg.max(), 1050)
                combined[y, min_x:max_x] = 255

        # Smooth waist curve from under elbow/forearm down to base (y=710..900)
        pts_y = np.array([710, 730, 760, 820, 900])
        pts_x = np.array([530, 580, 595, 590, 585])
        poly = np.poly1d(np.polyfit(pts_y, pts_x, 3))

        for y in range(710, 900):
            lx = int(np.clip(poly(y), 500, 700))
            row = combined[y, :]
            fg = np.where(row > 10)[0]
            rx = fg.max() if len(fg) else 980
            combined[y, lx:rx] = 255
            if lx > 2:
                combined[y, lx-1] = 170
                combined[y, lx-2] = 70
                combined[y, :lx-2] = 0

    blurred = cv2.GaussianBlur(combined, (3, 3), 0)
    final_alpha = np.where(combined > 240, 255, blurred)
    return final_alpha.astype(np.uint8)

def process_sequence(gender, session, base_dir):
    src_dir = os.path.join(base_dir, 'assets', 'transformation', gender)
    dst_dir = os.path.join(base_dir, 'assets', 'transformation', f'{gender}_transparent')
    os.makedirs(dst_dir, exist_ok=True)

    files = sorted(glob.glob(os.path.join(src_dir, 'frame_*.webp')))
    total = len(files)
    print(f"[{gender.upper()}] Starting generation for {total} frames into {dst_dir}...")
    t_start = time.time()

    for idx, fpath in enumerate(files, 1):
        fname = os.path.basename(fpath)
        out_path = os.path.join(dst_dir, fname)

        # 1. Load image
        img_pil = Image.open(fpath).convert('RGB')
        orig_bgr = cv2.imread(fpath)

        # 2. Semantic segmentation via u2net
        ai_mask = remove(img_pil, session=session, only_mask=True)
        ai_alpha = np.array(ai_mask)

        # 3. Hybrid recovery of cut off limbs and coat fabric + torso correction
        alpha = perfect_matte(orig_bgr, ai_alpha, gender=gender, frame_idx=idx)

        # 4. Merge RGBA
        b, g, r = cv2.split(orig_bgr)
        rgba = cv2.merge([b, g, r, alpha])
        rgba_rgb = cv2.cvtColor(rgba, cv2.COLOR_BGRA2RGBA)
        out_pil = Image.fromarray(rgba_rgb)

        # 5. Save as WebP with high quality
        out_pil.save(out_path, 'WEBP', quality=82, method=4)

        if idx % 10 == 0 or idx == total:
            elapsed = time.time() - t_start
            fps = idx / elapsed
            print(f"[{gender.upper()}] {idx}/{total} frames done ({fps:.1f} fps, {elapsed:.1f}s elapsed)")

    print(f"[{gender.upper()}] Finished {total} frames in {time.time() - t_start:.1f}s.\n")

def main():
    base_dir = '/home/antigravity/leomaiap/uff-medicina-2027'
    print("Initializing u2net model session...")
    t0 = time.time()
    session = new_session('u2net')
    print(f"u2net session ready in {time.time() - t0:.2f}s.")

    process_sequence('female', session, base_dir)
    process_sequence('male', session, base_dir)
    print("ALL SEQUENCES PROCESSED SUCCESSFULLY!")

if __name__ == '__main__':
    main()
