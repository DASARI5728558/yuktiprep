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


def clean_text(text: str) -> str:
    """Clean OCR spacing and noise symbols."""
    if not text:
        return ""
    text = re.sub(r'0%0', '', text)
    text = re.sub(r'\$2\$', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def merge_boxes_into_lines(boxes, y_thresh=12.0):
    """Cluster boxes that share similar vertical center (cy)."""
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
    match_paren = re.match(r'^\(([a-dA-D])\)[.\-:\s]*\s*(.*)$', cleaned)
    if match_paren:
        return match_paren.group(1).lower(), match_paren.group(2).strip()

    match_delim = re.match(r'^([a-dA-D])[\).\-:\s]\s*(.*)$', cleaned)
    if match_delim:
        return match_delim.group(1).lower(), match_delim.group(2).strip()

    match_empty = re.match(r'^\(\)\s*(.*)$', cleaned)
    if match_empty:
        return 'c', match_empty.group(1).strip()

    return None, cleaned


def extract_line_tokens(line_boxes, current_q_num=None, in_statement_mode=False):
    """Parse a horizontal line of boxes into question start, options, or text."""
    line_text = " ".join(b['text'].strip() for b in line_boxes if b['text'].strip())
    first_token = line_boxes[0]['text'].strip()

    # Question start detection:
    # 1) Line starts with "5. ", "5.", "5 - ", "Q.5"
    q_match = re.match(r'^(?:Q\.?\s*)?(\d{1,3})\s*[.:\-)](.*)$', line_text)
    
    # Check if this might be a sub-statement (1. 2. 3. 4. or I. II.) inside an existing question
    # E.g. in Question 4: "1. मालेगिटी शिवालय...", "2. हुचिमल्लिगुड़ी..."
    is_sub_statement = False
    if q_match:
        cand_num = int(q_match.group(1))
        # If candidate number is 1, 2, 3, 4 while we are already in Question 3 or 4, it is a statement list!
        if current_q_num is not None and cand_num <= current_q_num:
            is_sub_statement = True

    if q_match and not is_sub_statement:
        q_num = int(q_match.group(1))
        rem = q_match.group(2).strip()
        return ('QUESTION_START', q_num, rem)

    # 2) First box is purely "5." or "5"
    m_box = re.match(r'^(\d{1,3})[.:\-)]?$', first_token)
    if m_box:
        cand_num = int(m_box.group(1))
        if current_q_num is not None and cand_num <= current_q_num:
            is_sub_statement = True
        if not is_sub_statement and (current_q_num is None or cand_num >= current_q_num):
            rem = " ".join(b['text'].strip() for b in line_boxes[1:]).strip()
            return ('QUESTION_START', cand_num, rem)

    # Option detection
    opts_in_line = []
    # Also support inline multi-options like (a) ... (b) ... or (A) ... (B) ...
    inline_opts = list(re.finditer(r'(?:\(([a-dA-D])\)|(?:\b|\()([a-dA-D])[\).\-:\s])\s*', line_text))
    if len(inline_opts) > 1:
        for i, m in enumerate(inline_opts):
            key = (m.group(1) or m.group(2)).lower()
            start = m.end()
            end = inline_opts[i + 1].start() if i + 1 < len(inline_opts) else len(line_text)
            val = line_text[start:end].strip()
            opts_in_line.append((key, val))
        return ('OPTIONS', opts_in_line, line_text)

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


def parse_page_boxes_to_questions(boxes, num_columns=2, split_x=None):
    """
    Parses a page's bounding boxes into questions.
    Works for 1-column or 2-column page layouts.
    """
    # Filter header/footer labels
    footer_keywords = ['tdmn-a-aso', '(2-a)', '(1-a)', 'part-i', 'भाग-i', 'general studies']
    filtered = []
    for b in boxes:
        txt = b['text'].strip()
        if any(kw in txt.lower() for kw in footer_keywords):
            continue
        filtered.append(b)

    if num_columns == 2 and split_x:
        col1 = [b for b in filtered if b['cx'] < split_x]
        col2 = [b for b in filtered if b['cx'] >= split_x]
        column_groups = [col1, col2]
    else:
        column_groups = [filtered]

    questions = {}

    for col_boxes in column_groups:
        lines = merge_boxes_into_lines(col_boxes, y_thresh=14.0)
        current_q_num = None
        current_mode = 'question'
        current_opt_key = None

        for line_boxes in lines:
            token_type, data, text = extract_line_tokens(line_boxes, current_q_num=current_q_num)

            if token_type == 'QUESTION_START':
                current_q_num = data
                current_mode = 'question'
                current_opt_key = None
                if current_q_num not in questions:
                    questions[current_q_num] = {
                        "question_lines": [],
                        "options": {"a": "", "b": "", "c": "", "d": ""}
                    }
                if text:
                    questions[current_q_num]["question_lines"].append(text)
                continue

            if current_q_num is None:
                continue

            if token_type == 'OPTIONS':
                first_opt = data[0][0]
                if first_opt == 'a' and questions[current_q_num]["options"].get('a'):
                    current_q_num += 1
                    if current_q_num not in questions:
                        questions[current_q_num] = {
                            "question_lines": [],
                            "options": {"a": "", "b": "", "c": "", "d": ""}
                        }
                    prev_q = current_q_num - 1
                    if prev_q in questions and questions[prev_q].get("pending_next_q"):
                        questions[current_q_num]["question_lines"].extend(questions[prev_q].pop("pending_next_q"))

                current_mode = 'option'
                for opt_key, opt_val in data:
                    current_opt_key = opt_key
                    questions[current_q_num]["options"][opt_key] = opt_val
                continue

            if token_type == 'TEXT':
                if current_mode == 'question':
                    questions[current_q_num]["question_lines"].append(text)
                elif current_mode == 'option':
                    if questions[current_q_num]["options"].get('c') or questions[current_q_num]["options"].get('d'):
                        if "pending_next_q" not in questions[current_q_num]:
                            questions[current_q_num]["pending_next_q"] = []
                        questions[current_q_num]["pending_next_q"].append(text)
                    elif current_opt_key:
                        prev_val = questions[current_q_num]["options"][current_opt_key]
                        questions[current_q_num]["options"][current_opt_key] = f"{prev_val} {text}".strip()

    final_questions = {}
    for q_num, item in questions.items():
        q_text = clean_text(" ".join(item["question_lines"]))
        clean_opts = {k: clean_text(v) for k, v in item["options"].items()}
        final_questions[q_num] = {
            "question": q_text,
            "options": clean_opts
        }
    return final_questions


def extract_page_ocr(ocr, image_path: str):
    """Runs PaddleOCR on a single image and returns structured items with dimensions."""
    predict_res = ocr.predict(str(image_path))[0]
    rec_boxes = predict_res.get("rec_boxes", [])
    rec_texts = predict_res.get("rec_texts", [])

    with Image.open(image_path) as img:
        img_width, img_height = img.size

    items = []
    for box, text in zip(rec_boxes, rec_texts):
        x1, y1, x2, y2 = box
        items.append({
            'box': box,
            'text': text,
            'cx': (x1 + x2) / 2.0,
            'cy': (y1 + y2) / 2.0
        })

    return items, img_width, img_height


def parse_page_by_page_bilingual(english_page_path: str, hindi_page_path: str):
    """
    Parses separate pages where one page contains English and the other page contains Hindi.
    Matches questions by question number.
    Auto-detects language per page using Devanagari script character count.
    """
    sys.stderr.write(f"[1/4] Initializing PaddleOCR...\n")
    from paddleocr import PaddleOCR

    ocr = PaddleOCR(
        lang="hi",
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False
    )

    sys.stderr.write(f"[2/4] Processing Page 1: {english_page_path}...\n")
    boxes1, w1, h1 = extract_page_ocr(ocr, english_page_path)

    sys.stderr.write(f"[3/4] Processing Page 2: {hindi_page_path}...\n")
    boxes2, w2, h2 = extract_page_ocr(ocr, hindi_page_path)

    devanagari_range = range(0x0900, 0x097F + 1)
    def count_devanagari(box_list):
        return sum(1 for b in box_list for ch in b['text'] if ord(ch) in devanagari_range)

    dev1 = count_devanagari(boxes1)
    dev2 = count_devanagari(boxes2)

    if dev1 > dev2:
        sys.stderr.write(f"--> Auto-detected Page 1 as Hindi ({dev1} Devanagari chars) and Page 2 as English\n")
        parsed_hindi = parse_page_boxes_to_questions(boxes1, num_columns=2, split_x=w1 / 2.0)
        parsed_english = parse_page_boxes_to_questions(boxes2, num_columns=2, split_x=w2 / 2.0)
    else:
        sys.stderr.write(f"--> Auto-detected Page 1 as English and Page 2 as Hindi ({dev2} Devanagari chars)\n")
        parsed_english = parse_page_boxes_to_questions(boxes1, num_columns=2, split_x=w1 / 2.0)
        parsed_hindi = parse_page_boxes_to_questions(boxes2, num_columns=2, split_x=w2 / 2.0)

    sys.stderr.write(f"[4/4] Aligning English and Hindi pairs across pages...\n")
    all_q_nums = sorted(set(list(parsed_english.keys()) + list(parsed_hindi.keys())))
    results = []

    for q_num in all_q_nums:
        eng = parsed_english.get(q_num, {"question": "", "options": {"a": "", "b": "", "c": "", "d": ""}})
        hin = parsed_hindi.get(q_num, {"question": "", "options": {"a": "", "b": "", "c": "", "d": ""}})
        results.append({
            "number": q_num,
            "english": eng,
            "hindi": hin
        })

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
    all_temp = []
    all_results = []
    
    try:
        if len(sys.argv) >= 3:
            file1 = sys.argv[1]
            file2 = sys.argv[2]
            sys.stderr.write(f"Front Page/File (English): {file1}\n")
            sys.stderr.write(f"Back Page/File (Hindi): {file2}\n")

            imgs1, temps1 = load_input_image_paths(file1)
            imgs2, temps2 = load_input_image_paths(file2)
            all_temp = temps1 + temps2

            min_len = min(len(imgs1), len(imgs2))
            for i in range(min_len):
                results = parse_page_by_page_bilingual(imgs1[i], imgs2[i])
                all_results.extend(results)
        else:
            file_path = sys.argv[1] if len(sys.argv) > 1 else "upsc.jpg"
            sys.stderr.write(f"Input file: {file_path}\n")
            if file_path.lower().endswith(".pdf"):
                imgs, temps = load_input_image_paths(file_path)
                all_temp = temps
                if len(imgs) == 1:
                    all_results = parse_page_by_page_bilingual(imgs[0], imgs[0])
                else:
                    for i in range(0, len(imgs) - 1, 2):
                        sys.stderr.write(f"[PDF] Pairing Page {i+1} (English) with Page {i+2} (Hindi)...\n")
                        results = parse_page_by_page_bilingual(imgs[i], imgs[i+1])
                        all_results.extend(results)
            else:
                eng_path = sys.argv[1] if len(sys.argv) > 1 else "upsc.jpg"
                hin_path = "canvas.png"
                all_results = parse_page_by_page_bilingual(eng_path, hin_path)

        if len(sys.argv) <= 1:
            output_json_path = "page_by_page_output.json"
            with open(output_json_path, "w", encoding="utf-8") as f:
                json.dump(all_results, f, ensure_ascii=False, indent=2)

            output_txt_path = "page_by_page_output.txt"
            with open(output_txt_path, "w", encoding="utf-8") as f:
                for q in all_results:
                    f.write(f"=== Question {q['number']} ===\n")
                    f.write(f"[English]\nQ: {q['english']['question']}\n")
                    for k, v in q['english']['options'].items():
                        f.write(f"  ({k}) {v}\n")
                    f.write(f"\n[Hindi]\nQ: {q['hindi']['question']}\n")
                    for k, v in q['hindi']['options'].items():
                        f.write(f"  ({k}) {v}\n")
                    f.write("\n" + "=" * 45 + "\n\n")

            sys.stderr.write(f"\n[SUCCESS] Extracted {len(all_results)} paired questions!\n")

        print(json.dumps(all_results, ensure_ascii=False, indent=2))
    finally:
        for tmp_f in all_temp:
            try:
                if os.path.exists(tmp_f):
                    os.remove(tmp_f)
            except Exception:
                pass


if __name__ == "__main__":
    main()
