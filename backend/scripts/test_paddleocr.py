import sys
from pathlib import Path

from paddleocr import PaddleOCR


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("python test_paddleocr.py <image_path>")
        sys.exit(1)

    image_path = Path(sys.argv[1])

    if not image_path.exists():
        print(f"Image not found: {image_path}")
        sys.exit(1)

    print(f"Testing image: {image_path}")

    ocr = PaddleOCR(
        lang="hi",
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
    )

    print("Running OCR...")

    results = ocr.predict(str(image_path))

    print("\n========== OCR RESULT ==========\n")

    for page_result in results:
        texts = page_result["rec_texts"]
        for text in texts:
            print(text)

    print("\n========== END ==========\n")


if __name__ == "__main__":
    main()