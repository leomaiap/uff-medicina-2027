import cv2
import glob
import os
import time
import numpy as np
from PIL import Image
from rembg import new_session, remove

def perfect_matte(orig_bgr, ai_alpha):
    """
    Combines AI semantic segmentation mask with luminance connected components
    to recover lab coat folds, flying sleeves, and outstretched arms/hands
    without introducing dark background noise.
    """
    gray = cv2.cvtColor(orig_bgr, cv2.COLOR_BGR2GRAY)
    bright = (gray > 28).astype(np.uint8)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(bright, connectivity=8)
    clean_bright = np.zeros_like(bright)
    for i in range(1, num_labels):
        if stats[i, cv2.CC_STAT_AREA] > 300:
            clean_bright[labels == i] = 1

    combined = np.maximum(ai_alpha, clean_bright * 255)
    blurred = cv2.GaussianBlur(combined, (5, 5), 0)
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
        t_frame = time.time()
        fname = os.path.basename(fpath)
        out_path = os.path.join(dst_dir, fname)

        # 1. Load image
        img_pil = Image.open(fpath).convert('RGB')
        orig_bgr = cv2.imread(fpath)

        # 2. Semantic segmentation via u2net
        ai_mask = remove(img_pil, session=session, only_mask=True)
        ai_alpha = np.array(ai_mask)

        # 3. Hybrid recovery of cut off limbs and coat fabric
        alpha = perfect_matte(orig_bgr, ai_alpha)

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
