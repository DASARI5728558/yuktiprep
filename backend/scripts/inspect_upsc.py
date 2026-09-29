import sys
import os
os.environ["PADDLE_WITH_ONEDNN"] = "0"
os.environ["FLAGS_use_onednn"] = "0"
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import pymupdf
import tempfile
from PIL import Image
from paddleocr import PaddleOCR

ocr = PaddleOCR(lang="hi", use_doc_orientation_classify=False, use_doc_unwarping=False, use_textline_orientation=False)

doc = pymupdf.open("upsc.pdf")
print(f"Total Pages in upsc.pdf: {len(doc)}")

devanagari_range = range(0x0900, 0x097F + 1)
def count_devanagari(text):
    return sum(1 for ch in text if ord(ch) in devanagari_range)

for idx in range(len(doc)):
    page = doc[idx]
    pix = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), alpha=False)
    tmp_path = os.path.join(tempfile.gettempdir(), f"inspect_page_{idx}.png")
    pix.save(tmp_path)
    
    predict_res = ocr.predict(tmp_path)[0]
    rec_boxes = predict_res.get("rec_boxes", [])
    rec_texts = predict_res.get("rec_texts", [])
    
    with Image.open(tmp_path) as img:
        w, h = img.size
        
    dev_count = count_devanagari(" ".join(rec_texts))
    left_dev = sum(count_devanagari(t) for b, t in zip(rec_boxes, rec_texts) if (b[0]+b[2])/2 < w/2)
    right_dev = sum(count_devanagari(t) for b, t in zip(rec_boxes, rec_texts) if (b[0]+b[2])/2 >= w/2)
    
    print(f"\n--- PAGE {idx+1} (Width: {w}, Height: {h}) ---")
    print(f"Total Boxes: {len(rec_boxes)} | Total Devanagari chars: {dev_count}")
    print(f"Left Col Devanagari: {left_dev} | Right Col Devanagari: {right_dev}")
    
    left_boxes = [(b, t) for b, t in zip(rec_boxes, rec_texts) if (b[0]+b[2])/2 < w/2]
    right_boxes = [(b, t) for b, t in zip(rec_boxes, rec_texts) if (b[0]+b[2])/2 >= w/2]
    
    print(" Left Column Lines (first 25):")
    for b, t in sorted(left_boxes, key=lambda x: (x[0][1]+x[0][3])/2)[:25]:
        print(f"   [cy={(b[1]+b[3])/2:.1f}] {t}")
        
    print(" Right Column Lines (first 25):")
    for b, t in sorted(right_boxes, key=lambda x: (x[0][1]+x[0][3])/2)[:25]:
        print(f"   [cy={(b[1]+b[3])/2:.1f}] {t}")

    try:
        os.remove(tmp_path)
    except Exception:
        pass
doc.close()
