import sys
import os
import io
import json
import logging
import re

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("pdf_extractor")

class RapidOCRExtractor:
    _instance = None

    def __init__(self):
        self.engine = None
        self._loaded = False

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_model(self):
        if not self._loaded:
            try:
                from rapidocr_onnxruntime import RapidOCR
                self.engine = RapidOCR()
                self._loaded = True
                logger.info("[OCR] RapidOCR engine loaded successfully.")
            except Exception as e:
                logger.error(f"[OCR] Failed to load RapidOCR: {e}")
                self.engine = None

    def extract_boxes_from_image(self, image):
        """
        Extracts raw detection items with bounding boxes and text.
        Returns list of dicts: [{ 'box': [...], 'txt': str, 'score': float, ... }]
        """
        self.load_model()
        if self.engine is not None:
            try:
                import numpy as np
                img_np = np.array(image)
                result, _ = self.engine(img_np)
                if result:
                    items = []
                    for item in result:
                        if item and len(item) >= 2:
                            box = item[0]
                            txt = item[1].strip() if item[1] else ""
                            if txt:
                                x_coords = [pt[0] for pt in box]
                                y_coords = [pt[1] for pt in box]
                                items.append({
                                    "box": box,
                                    "txt": txt,
                                    "xmin": min(x_coords),
                                    "xmax": max(x_coords),
                                    "ymin": min(y_coords),
                                    "ymax": max(y_coords),
                                    "ycenter": (min(y_coords) + max(y_coords)) / 2.0,
                                    "xcenter": (min(x_coords) + max(x_coords)) / 2.0,
                                })
                    return items
            except Exception as ocr_err:
                logger.warning(f"[OCR] RapidOCR run failed: {ocr_err}")
        return []

def cluster_lines(items, line_threshold=14):
    """
    Groups OCR bounding boxes into lines by vertical proximity, then sorts horizontally left-to-right.
    """
    if not items:
        return []
    items_sorted = sorted(items, key=lambda it: it["ymin"])
    line_groups = []
    for it in items_sorted:
        if line_groups and abs(line_groups[-1][0]["ymin"] - it["ymin"]) < line_threshold:
            line_groups[-1].append(it)
        else:
            line_groups.append([it])
    
    formatted_lines = []
    for grp in line_groups:
        grp_sorted = sorted(grp, key=lambda it: it["xmin"])
        line_text = " ".join(it["txt"] for it in grp_sorted)
        if line_text.strip():
            formatted_lines.append(line_text.strip())
    return formatted_lines

def extract_page_with_layout(items, page_width, page_height):
    """
    Detects two-column vs single-column layout and formats text in natural reading order.
    """
    if not items:
        return ""

    midpoint = page_width / 2.0
    margin = page_width * 0.04

    left_items = []
    right_items = []
    spanning_header = []
    spanning_footer = []

    # Filter out or separate header/footer
    header_threshold = page_height * 0.08
    footer_threshold = page_height * 0.92

    for it in items:
        # Check if spanning header or footer
        if it["ymin"] < header_threshold and (it["xmax"] - it["xmin"]) > page_width * 0.6:
            spanning_header.append(it)
        elif it["ymax"] > footer_threshold:
            spanning_footer.append(it)
        elif it["xcenter"] < midpoint:
            left_items.append(it)
        else:
            right_items.append(it)

    # Check if this is indeed a 2-column page
    # If both columns have significant content, sort Left Column then Right Column
    is_two_column = len(left_items) >= 4 and len(right_items) >= 4

    parts = []
    if spanning_header:
        parts.extend(cluster_lines(spanning_header))

    if is_two_column:
        left_lines = cluster_lines(left_items)
        right_lines = cluster_lines(right_items)
        if left_lines:
            parts.extend(left_lines)
        if right_lines:
            parts.extend(right_lines)
    else:
        # Single column layout
        all_body = sorted(left_items + right_items, key=lambda it: it["ymin"])
        parts.extend(cluster_lines(all_body))

    if spanning_footer:
        parts.extend(cluster_lines(spanning_footer))

    return "\n".join(parts)

def extract_pdf(file_path: str, max_pages: int = 50):
    import pymupdf
    import pypdf
    from PIL import Image

    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File not found: {file_path}"}))
        sys.exit(1)

    with open(file_path, "rb") as f:
        file_bytes = f.read()

    pdf_doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    total_pages = len(pdf_doc)
    pages_to_process = min(total_pages, max_pages)
    text_parts = []
    pdf_reader = None

    for i in range(pages_to_process):
        page_num = i + 1
        page_text = ""

        # 1. Primary check: PyMuPDF native text
        try:
            mupdf_page = pdf_doc[i]
            page_text = mupdf_page.get_text().strip()
        except Exception:
            pass

        # 2. Secondary check: pypdf fallback for native text
        if not page_text or len(page_text) <= 20:
            try:
                if pdf_reader is None:
                    pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                if i < len(pdf_reader.pages):
                    alt_text = pdf_reader.pages[i].extract_text()
                    if alt_text and len(alt_text.strip()) > len(page_text):
                        page_text = alt_text.strip()
            except Exception:
                pass

        # 3. If selectable digital text found with meaningful content
        # Note: Scanned papers often have only "-- 1 of 40 --" or short gibberish
        cleaned_native = re.sub(r'--\s*\d+\s*of\s*\d+\s*--', '', page_text).strip()
        if len(cleaned_native) > 50:
            sys.stderr.write(f"[PDF] Page {page_num}/{total_pages}: Native digital text found ({len(page_text)} chars).\n")
            text_parts.append(f"--- Page {page_num} of {total_pages} ---\n{page_text}")
        else:
            # Scanned / image page -> RapidOCR High Accuracy with Column Sorting
            sys.stderr.write(f"[PDF OCR] Page {page_num}/{total_pages}: Running RapidOCR layout detection...\n")
            try:
                mupdf_page = pdf_doc[i]
                pix = mupdf_page.get_pixmap(matrix=pymupdf.Matrix(2, 2), alpha=False)
                image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                
                ocr_engine = RapidOCRExtractor.get_instance()
                items = ocr_engine.extract_boxes_from_image(image)
                
                ordered_page_text = extract_page_with_layout(items, pix.width, pix.height)
                if ordered_page_text.strip():
                    text_parts.append(f"--- Page {page_num} of {total_pages} ---\n{ordered_page_text.strip()}")
                else:
                    text_parts.append(f"--- Page {page_num} of {total_pages} ---\n")
            except Exception as ocr_err:
                sys.stderr.write(f"[PDF OCR] Failed on page {page_num}: {ocr_err}\n")
                text_parts.append(f"--- Page {page_num} of {total_pages} ---\n")

    pdf_doc.close()

    full_text = "\n\n".join(text_parts)
    print(json.dumps({
        "success": True,
        "totalPages": total_pages,
        "processedPages": pages_to_process,
        "text": full_text
    }))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    extract_pdf(sys.argv[1])