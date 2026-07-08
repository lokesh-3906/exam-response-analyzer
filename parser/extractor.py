import re
from typing import Dict, List, Optional, Tuple

import pdfplumber


QUESTION_OPTION_PATTERNS = [
    re.compile(r"(?i)\b(?:question\s*\#?\s*|q\s*)?(?P<question>\d{1,3})\s*(?:[.:\-–)]\s*)?(?P<option>[A-D])\b"),
    re.compile(r"(?i)\b(?P<question>\d{1,3})\s*(?:[.:\-–)]\s*)?(?P<option>[A-D])\b"),
]


def _extract_pdf_text(file_path: str) -> str:
    """Extract text from a text-based PDF file using pdfplumber."""
    with pdfplumber.open(file_path) as pdf:
        pages = [page.extract_text() or "" for page in pdf.pages]
    return "\n".join(pages).strip()


def _iter_question_option_pairs(text: str) -> List[Tuple[int, str]]:
    """Find question number and option pairs from OCR/text content."""
    matches: List[Tuple[int, str]] = []

    for pattern in QUESTION_OPTION_PATTERNS:
        for match in pattern.finditer(text):
            question = int(match.group("question"))
            option = match.group("option").upper()
            matches.append((question, option))

        if matches:
            break

    return _deduplicate_pairs(matches)


def _deduplicate_pairs(pairs: List[Tuple[int, str]]) -> List[Tuple[int, str]]:
    seen = set()
    unique_pairs: List[Tuple[int, str]] = []
    for pair in pairs:
        if pair in seen:
            continue
        seen.add(pair)
        unique_pairs.append(pair)
    return unique_pairs


def _build_entry(question: int, option: Optional[str], is_correct: bool) -> Dict[str, Optional[str]]:
    return {
        "question": question,
        "selected": option if not is_correct else None,
        "correct": option if is_correct else None,
    }


def extract_responses(file_path: str, exam_type: str = "ap_eamcet") -> List[Dict[str, Optional[str]]]:
    """Extract question/option information from a text-based PDF.

    The parser is generic enough to support additional exam formats later.
    For AP EAMCET-style response sheets, the extracted value is treated as the
    candidate selected option. For answer-key PDFs, the same parser can be used
    by passing the correct option through a future format-specific adapter.
    """
    text = _extract_pdf_text(file_path)
    if not text:
        return []

    pairs = _iter_question_option_pairs(text)
    if not pairs:
        return []

    if exam_type.lower() == "ap_eamcet":
        return [{"question": question, "selected": option, "correct": None} for question, option in pairs]

    return [{"question": question, "selected": None, "correct": option} for question, option in pairs]
