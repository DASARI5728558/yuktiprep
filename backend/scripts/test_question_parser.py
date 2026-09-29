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
    """Clean OCR spacing, punctuation artifacts, and noise symbols."""
    if not text:
        return ""
    # Remove exam noise like 0%0, page markings
    text = re.sub(r'0%0', '', text)
    text = re.sub(r'\$2\$', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def merge_boxes_into_lines(boxes, y_thresh=12.0):
    """
    Cluster boxes that are on roughly the same horizontal text line (cy difference <= y_thresh)
    and sort them left-to-right (by x1).
    """
    if not boxes:
        return []

    # Sort boxes primarily by vertical center cy
    sorted_boxes = sorted(boxes, key=lambda b: b['cy'])
    
    lines = []
    current_line = [sorted_boxes[0]]

    for b in sorted_boxes[1:]:
        # If within vertical tolerance of the current line's average cy
        avg_cy = sum(item['cy'] for item in current_line) / len(current_line)
        if abs(b['cy'] - avg_cy) <= y_thresh:
            current_line.append(b)
        else:
            # Sort current line left-to-right
            current_line.sort(key=lambda item: item['box'][0])
            lines.append(current_line)
            current_line = [b]

    if current_line:
        current_line.sort(key=lambda item: item['box'][0])
        lines.append(current_line)

    return lines

def is_option_marker(text: str):
    """
    Check if text starts with an option identifier like (a), (b), (c), (d), (e), (), etc.
    Returns (option_key, remaining_text) or (None, text).
    """
    cleaned = text.strip()

    # Exact match for standard (a), (b), (c), (d), (e)
    match = re.match(r'^\(?([a-eA-E])\)?[.\-:\s]\s*(.*)$', cleaned)
    if match:
        key = match.group(1).lower()
        if key == 'e': key = 'c'  # Common OCR quirk where (c) is misread as (e)
        content = match.group(2).strip()
        return key, content

    # Standalone "(a)" or "(e)"
    match_standalone = re.match(r'^\(([a-eA-E])\)$', cleaned)
    if match_standalone:
        key = match_standalone.group(1).lower()
        if key == 'e': key = 'c'
        return key, ""

    # Common OCR quirk where '(c)' becomes '()'
    match_empty_paren = re.match(r'^\(\)\s*(.*)$', cleaned)
    if match_empty_paren:
        return 'c', match_empty_paren.group(1).strip()

    return None, cleaned

def extract_line_tokens(line_boxes):
    """
    Extracts structured tokens from a line of horizontal bounding boxes.
    Can be:
      - Question starter: e.g. "1.", "1 ", "Q1.", etc.
      - Option: e.g. "(a) Option A", "(b) Option B"
      - Normal continuation text
    """
    line_text = " ".join(b['text'].strip() for b in line_boxes if b['text'].strip())
    first_token = line_boxes[0]['text'].strip()

    # Check if this line starts with question number like "1.", "1 ", "Q1.", "2 "
    q_num_match = re.match(r'^(?:Q(?:uestion|\.)?\s*)?(\d{1,3})(?:[.:\-)]|\s+)(.*)$', line_text)
    if q_num_match:
        cand_str = q_num_match.group(1)
        rem = q_num_match.group(2).strip()
        if cand_str.isdigit():
            q_num = int(cand_str)
            if 1 <= q_num <= 200:
                return ('QUESTION_START', q_num, rem)

    if re.match(r'^\d{1,3}\.?$', first_token):
        q_num = int(re.sub(r'\D', '', first_token))
        rem = " ".join(b['text'].strip() for b in line_boxes[1:]).strip()
        return ('QUESTION_START', q_num, rem)

    # Check for options in the line
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
                prev_key, prev_val = opts_in_line[-1]
                opts_in_line[-1] = (prev_key, f"{prev_val} {b_txt}".strip())

    if opts_in_line:
        return ('OPTIONS', opts_in_line, line_text)

    return ('TEXT', None, line_text)

def parse_column_into_questions(column_boxes):
    """
    Group boxes into lines, then group lines into structured questions.
    """
    header_keywords = ['part-i', 'भाग-i', 'general studies', 'सामान्य अध्ययन', 'tuku-09', 'page']
    valid_boxes = []
    for b in column_boxes:
        txt = b['text'].strip()
        if any(h in txt.lower() for h in header_keywords):
            continue
        valid_boxes.append(b)

    lines = merge_boxes_into_lines(valid_boxes, y_thresh=14.0)

    questions = {}
    current_q_num = None
    current_mode = 'question'
    current_opt_key = None

    for line_boxes in lines:
        token_type, data, text = extract_line_tokens(line_boxes)

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

        # If text/options appear before explicit Q1 header on column, default to Q1
        if current_q_num is None:
            if token_type in ('TEXT', 'OPTIONS'):
                current_q_num = 1
                questions[current_q_num] = {
                    "question_lines": [],
                    "options": {"a": "", "b": "", "c": "", "d": ""}
                }

        if token_type == 'OPTIONS':
            first_opt = data[0][0]
            # If option (a) arrives after we already filled options, it indicates the next question
            if first_opt == 'a' and questions[current_q_num]["options"].get('a'):
                current_q_num += 1
                if current_q_num not in questions:
                    questions[current_q_num] = {
                        "question_lines": [],
                        "options": {"a": "", "b": "", "c": "", "d": ""}
                    }
                # Check if previous lines were actually the question prompt for this new question
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
                # If we already have options (c) or (d), text following them belongs to the NEXT question
                if questions[current_q_num]["options"].get('c') or questions[current_q_num]["options"].get('d'):
                    if "pending_next_q" not in questions[current_q_num]:
                        questions[current_q_num]["pending_next_q"] = []
                    questions[current_q_num]["pending_next_q"].append(text)
                elif current_opt_key:
                    prev_val = questions[current_q_num]["options"][current_opt_key]
                    questions[current_q_num]["options"][current_opt_key] = f"{prev_val} {text}".strip()

    # Clean question text and option fields
    final_questions = {}
    for q_num, item in questions.items():
        q_text = clean_text(" ".join(item["question_lines"]))
        clean_opts = {k: clean_text(v) for k, v in item["options"].items()}
        final_questions[q_num] = {
            "question": q_text,
            "options": clean_opts
        }

    return final_questions

def extract_bilingual_paper(image_path: str):
    sys.stderr.write(f"[1/4] Initializing PaddleOCR (Hindi + English)...\n")
    from paddleocr import PaddleOCR
    
    ocr = PaddleOCR(
        lang="hi",
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False
    )

    sys.stderr.write(f"[2/4] Running OCR on {image_path}...\n")
    predict_res = ocr.predict(str(image_path))[0]
    
    rec_boxes = predict_res.get("rec_boxes", [])
    rec_texts = predict_res.get("rec_texts", [])
    
    with Image.open(image_path) as img:
        img_width, img_height = img.size

    column_split_x = img_width / 2.0
    sys.stderr.write(f"[INFO] Page dimensions: {img_width}x{img_height} | Column split at X = {column_split_x}\n")

    left_boxes = []
    right_boxes = []

    for box, text in zip(rec_boxes, rec_texts):
        x1, y1, x2, y2 = box
        cx = (x1 + x2) / 2.0
        cy = (y1 + y2) / 2.0
        item = {
            'box': box,
            'text': text,
            'cx': cx,
            'cy': cy
        }
        if cx < column_split_x:
            left_boxes.append(item)
        else:
            right_boxes.append(item)

    # Determine which column is Hindi vs English
    devanagari_range = range(0x0900, 0x097F + 1)
    def count_devanagari(box_list):
        return sum(1 for b in box_list for ch in b['text'] if ord(ch) in devanagari_range)

    if count_devanagari(right_boxes) >= count_devanagari(left_boxes):
        english_boxes = left_boxes
        hindi_boxes = right_boxes
    else:
        english_boxes = right_boxes
        hindi_boxes = left_boxes

    sys.stderr.write(f"[3/4] Parsing columns into questions and options...\n")
    parsed_english = parse_column_into_questions(english_boxes)
    parsed_hindi = parse_column_into_questions(hindi_boxes)

    sys.stderr.write(f"[4/4] Aligning Hindi and English pairs...\n")
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
    file_path = sys.argv[1] if len(sys.argv) > 1 else "upsc.jpg"
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        print(json.dumps([]))
        return

    try:
        image_paths, temp_files = load_input_image_paths(file_path)
        all_results = []

        for i, img_p in enumerate(image_paths):
            results = extract_bilingual_paper(img_p)
            for q in results:
                all_results.append(q)

        for tmp_f in temp_files:
            try:
                if os.path.exists(tmp_f):
                    os.remove(tmp_f)
            except Exception:
                pass

        if len(sys.argv) <= 1:
            output_json_path = "question_output.json"
            with open(output_json_path, "w", encoding="utf-8") as f:
                json.dump(all_results, f, ensure_ascii=False, indent=2)

        print(json.dumps(all_results, ensure_ascii=False, indent=2))
    except Exception as e:
        sys.stderr.write(f"Extraction failed: {e}\n")
        print(json.dumps([]))

if __name__ == "__main__":
    main()