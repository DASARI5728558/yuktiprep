from PIL import ImageQt
import sys
import os
os.environ["PADDLE_WITH_ONEDNN"] = "0"
import re
import json
from pathlib import Path
from PIL import Image

# Ensure standard output and file writing support UTF-8 on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

DEVANAGARI_RANGE = range(0x0900, 0x097F + 1)

def has_devanagari(text: str) -> bool:
    return any(ord(ch) in DEVANAGARI_RANGE for ch in text)

def count_devanagari(text: str) -> int:
    return sum(1 for ch in text if ord(ch) in DEVANAGARI_RANGE)

def clean_text(text: str) -> str:
    """Clean OCR spacing, punctuation artifacts, and noise symbols."""
    if not text:
        return ""
    text = re.sub(r'0%0|\$2\$|TUKU-\d+', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def merge_boxes_into_lines(boxes, y_thresh=12.0):
    """Cluster boxes that share similar vertical center (cy) and sort left-to-right."""
    if not boxes:
        return []

    sorted_boxes = sorted(boxes, key=lambda b: b['cy'])
    lines = []
    current_line = [sorted_boxes[0]]

    for b in sorted_boxes[1:]:
        avg_cy = sum(item['cy'] for item in current_line) / len(current_line)
        if abs(b['cy'] - avg_cy) <= y_thresh:
            current_line.append(b)
        else:
            current_line.sort(key=lambda item: item['box'][0])
            lines.append(current_line)
            current_line = [b]

    if current_line:
        current_line.sort(key=lambda item: item['box'][0])
        lines.append(current_line)

    return lines

def is_option_marker(text: str):
    """Check if text starts with (a), (b), (c), (d), etc."""
    cleaned = text.strip()
    match = re.match(r'^\(?([a-dA-D])\)?[.\-:\s]\s*(.*)$', cleaned)
    if match:
        return match.group(1).lower(), match.group(2).strip()

    match_standalone = re.match(r'^\(([a-dA-D])\)$', cleaned)
    if match_standalone:
        return match_standalone.group(1).lower(), ""

    match_empty = re.match(r'^\(\)\s*(.*)$', cleaned)
    if match_empty:
        return 'c', match_empty.group(1).strip()

    return None, cleaned

def extract_line_tokens(line_boxes, current_q_num=None):
    """Parse a horizontal line of boxes into question start, options, or text."""
    line_text = " ".join(b['text'].strip() for b in line_boxes if b['text'].strip())
    first_token = line_boxes[0]['text'].strip()

    # Question start detection (e.g. "1.", "Q.1", "1-", etc.)
    q_match = re.match(r'^(?:Q\.?\s*)?(\d{1,3})\s*[.:\-)](.*)$', line_text)
    
    is_sub_statement = False
    if q_match:
        cand_num = int(q_match.group(1))
        if current_q_num is not None and cand_num < current_q_num:
            is_sub_statement = True

    if q_match and not is_sub_statement:
        q_num = int(q_match.group(1))
        rem = q_match.group(2).strip()
        return ('QUESTION_START', q_num, rem)

    m_box = re.match(r'^(\d{1,3})[.:\-)]?$', first_token)
    if m_box and not is_sub_statement:
        cand_num = int(m_box.group(1))
        if current_q_num is None or cand_num >= current_q_num:
            rem = " ".join(b['text'].strip() for b in line_boxes[1:]).strip()
            return ('QUESTION_START', cand_num, rem)

    # Option detection (including inline multi-options like (a) ... (b) ...)
    inline_opts = list(re.finditer(r'(?:\b|\()([a-dA-D])\)\s*', line_text))
    if len(inline_opts) > 1:
        opts_in_line = []
        for i, m in enumerate(inline_opts):
            key = m.group(1).lower()
            start = m.end()
            end = inline_opts[i + 1].start() if i + 1 < len(inline_opts) else len(line_text)
            val = line_text[start:end].strip()
            opts_in_line.append((key, val))
        return ('OPTIONS', opts_in_line, line_text)

    opts_in_line = []
    for b in line_boxes:
        b_txt = b['text'].strip()
        if not b_txt:
            continue
        opt_key, opt_val = is_option_marker(b_txt)
        if opt_key:
            opts_in_line.append((opt_key, opt_val))
        else:
            if opts_in_line:
                prev_k, prev_v = opts_in_line[-1]
                opts_in_line[-1] = (prev_k, f"{prev_v} {b_txt}".strip())

    if opts_in_line:
        return ('OPTIONS', opts_in_line, line_text)

    return ('TEXT', None, line_text)

def parse_stacked_questions(boxes):
    """
    Parse the complete page while preserving:
    - question number
    - English question
    - Hindi question
    - marks
    - answer-word instruction
    - all text belonging to the question

    English and Hindi are kept separately based on Devanagari detection.
    """

    header_keywords = [
        'part-i',
        'भाग-i',
        'general studies',
        'सामान्य अध्ययन',
    ]

    # ---------------------------------------------------------
    # 1. Remove only obvious page/header noise
    # ---------------------------------------------------------
    valid_boxes = []

    for b in boxes:
        text = b['text'].strip()

        if not text:
            continue

        lower = text.lower()

        if any(keyword in lower for keyword in header_keywords):
            continue

        valid_boxes.append(b)

    # ---------------------------------------------------------
    # 2. Convert OCR boxes into properly ordered lines
    # ---------------------------------------------------------
    lines = merge_boxes_into_lines(
        valid_boxes,
        y_thresh=14.0
    )

    # ---------------------------------------------------------
    # 3. Store ALL lines belonging to each question
    # ---------------------------------------------------------
    question_blocks = {}

    current_q_num = None

    for line_boxes in lines:

        line_text = " ".join(
            b['text'].strip()
            for b in line_boxes
            if b['text'].strip()
        ).strip()

        if not line_text:
            continue

        # -----------------------------------------------------
        # Detect question number
        # Examples:
        # Q1स्व-... (no dot/space)
        # Q1.
        # Q2.
        # 1.
        # Q.3
        # -----------------------------------------------------
        q_match = re.match(
            r'^(?:Q(?:uestion|\.)?\s*)?(\d{1,3})[.:\-)]\s*(.*)$',
            line_text,
            flags=re.IGNORECASE
        )

        if q_match:
            q_num = int(q_match.group(1))
            remaining_text = q_match.group(2).strip()

            # Start a NEW question
            current_q_num = q_num

            if current_q_num not in question_blocks:
                question_blocks[current_q_num] = []

            # Keep text appearing on same line as Q number
            if remaining_text:
                question_blocks[current_q_num].append(
                    remaining_text
                )

            continue

        # -----------------------------------------------------
        # Ignore anything before first question
        # -----------------------------------------------------
        if current_q_num is None:
            continue

        # -----------------------------------------------------
        # IMPORTANT:
        # Keep EVERYTHING.
        #
        # This preserves:
        # 10
        # (Answer in 150 words)
        # Hindi instructions
        # English instructions
        # etc.
        # -----------------------------------------------------
        question_blocks[current_q_num].append(line_text)

    # ---------------------------------------------------------
    # 4. Convert blocks into English/Hindi sections (with sub-part support like (a), (b), (c), (i), (ii))
    # ---------------------------------------------------------
    results = []

    for q_num, lines_for_question in sorted(question_blocks.items()):
        # Check if this question has sub-parts like (a), (b), (c)
        has_subparts = any(re.match(r'^\([a-e]\)', l.strip()) for l in lines_for_question)

        def split_metadata(text_str):
            # Extract marks like 10, 15, 20 or answer word limits
            marks = re.findall(r'\b(10|15|20)\b', text_str)
            words = re.findall(r'(?:answer\s+in\s+\d+\s+words?|उत्तर\s*.*?\d+\s*शब्द)', text_str, flags=re.IGNORECASE)
            meta = " ".join(marks + words)
            return clean_text(meta)

        if has_subparts:
            # Segment into sub-parts: (a), (b), (c)...
            subpart_blocks = []
            cur_part_label = None
            cur_part_lines = []

            for line in lines_for_question:
                sub_m = re.match(r'^\(([a-e])\)\s*(.*)$', line.strip())
                if sub_m:
                    if cur_part_label:
                        subpart_blocks.append((cur_part_label, cur_part_lines))
                    cur_part_label = f"({sub_m.group(1)})"
                    cur_part_lines = [sub_m.group(2).strip()] if sub_m.group(2).strip() else []
                else:
                    if cur_part_label:
                        cur_part_lines.append(line)
                    else:
                        cur_part_lines.append(line)
            if cur_part_label:
                subpart_blocks.append((cur_part_label, cur_part_lines))

            eng_subparts = []
            hin_subparts = []

            for part_label, p_lines in subpart_blocks:
                p_eng = [l for l in p_lines if not has_devanagari(l)]
                p_hin = [l for l in p_lines if has_devanagari(l)]

                if p_eng:
                    eng_subparts.append(f"{part_label} " + " ".join(p_eng))
                if p_hin:
                    hin_subparts.append(f"{part_label} " + " ".join(p_hin))

            results.append({
                "number": q_num,
                "english": {
                    "question": clean_text("\n".join(eng_subparts)),
                    "metadata": split_metadata(" ".join(lines_for_question))
                },
                "hindi": {
                    "question": clean_text("\n".join(hin_subparts)),
                    "metadata": split_metadata(" ".join(lines_for_question))
                }
            })

        else:
            english_lines = []
            hindi_lines = []

            for text in lines_for_question:
                if has_devanagari(text):
                    hindi_lines.append(text)
                else:
                    english_lines.append(text)

            def extract_clean_q(lines):
                q_lines = []
                m_lines = []
                for line in lines:
                    clean = line.strip()
                    if re.fullmatch(r'(?:10|15|20)\s*(?:marks?)?', clean, flags=re.IGNORECASE):
                        m_lines.append(clean)
                    elif re.search(r'answer\s+in\s+\d+\s+words?|उत्तर\s*.*?\d+\s*शब्द', clean, flags=re.IGNORECASE):
                        m_lines.append(clean)
                    else:
                        q_lines.append(clean)
                return clean_text(" ".join(q_lines)), clean_text(" ".join(m_lines))

            eng_q, eng_m = extract_clean_q(english_lines)
            hin_q, hin_m = extract_clean_q(hindi_lines)

            results.append({
                "number": q_num,
                "english": {
                    "question": eng_q,
                    "metadata": eng_m
                },
                "hindi": {
                    "question": hin_q,
                    "metadata": hin_m
                }
            })

    return results


def extract_upside_downside_paper(image_path: str):
    """
    Extracts questions when English is top / Hindi is bottom (stacked vertically).
    """
    print(f"[1/3] Initializing PaddleOCR...")
    from paddleocr import PaddleOCR

    ocr = PaddleOCR(
        lang="hi",
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False
    )

    print(f"[2/3] Running OCR on {image_path}...")
    predict_res = ocr.predict(str(image_path))[0]
    rec_boxes = predict_res.get("rec_boxes", [])
    rec_texts = predict_res.get("rec_texts", [])

    boxes = []
    for box, text in zip(rec_boxes, rec_texts):
        x1, y1, x2, y2 = box
        boxes.append({
            'box': box,
            'text': text,
            'cx': (x1 + x2) / 2.0,
            'cy': (y1 + y2) / 2.0
        })

    print(f"[3/3] Parsing upside-downside (English top / Hindi bottom) questions...")
    results = parse_stacked_questions(boxes)
    return results

def load_input_image_paths(file_path: str):
    image_paths = []
    created_temp_files = []
    if file_path.lower().endswith(".pdf"):
        import pymupdf
        import tempfile
        import time
        doc = pymupdf.open(file_path)
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            pix = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), alpha=False)
            tmp_path = os.path.join(tempfile.gettempdir(), f"yukti_page_{int(time.time()*1000)}_{page_idx}.png")
            pix.save(tmp_path)
            image_paths.append(tmp_path)
            created_temp_files.append(tmp_path)
        doc.close()
    else:
        image_paths.append(file_path)
    return image_paths, created_temp_files

def main():
    if len(sys.argv) < 2:
        sys.stderr.write("Usage: python extract_upside_downside.py <pdf_or_image_path>\n")
        print(json.dumps([]))
        return

    input_path = sys.argv[1]
    if not os.path.exists(input_path):
        sys.stderr.write(f"Error: {input_path} not found.\n")
        print(json.dumps([]))
        return

    try:
        image_paths, temp_files = load_input_image_paths(input_path)
        all_results = []

        from paddleocr import PaddleOCR
        ocr = PaddleOCR(
            lang="hi",
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False
        )

        for i, img_path in enumerate(image_paths):
            sys.stderr.write(f"[PDF/Image] Processing Stacked Page {i+1}/{len(image_paths)}...\n")
            predict_res = ocr.predict(str(img_path))[0]
            rec_boxes = predict_res.get("rec_boxes", [])
            rec_texts = predict_res.get("rec_texts", [])

            boxes = []
            for box, text in zip(rec_boxes, rec_texts):
                x1, y1, x2, y2 = box
                boxes.append({
                    'box': box,
                    'text': text,
                    'cx': (x1 + x2) / 2.0,
                    'cy': (y1 + y2) / 2.0
                })

            results = parse_stacked_questions(boxes)

            for q in results:
                all_results.append({
                    "number": q["number"],
                    "english": q["english"],
                    "hindi": q["hindi"]
                })

        # Cleanup temp files
        for tmp_f in temp_files:
            try:
                if os.path.exists(tmp_f):
                    os.remove(tmp_f)
            except Exception:
                pass

        print(json.dumps(all_results, ensure_ascii=False, indent=2))
    except Exception as e:
        sys.stderr.write(f"Extraction failed: {e}\n")
        print(json.dumps([]))

if __name__ == "__main__":
    main()
