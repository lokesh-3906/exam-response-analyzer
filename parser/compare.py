from typing import Dict, List, Optional


def _answer_value(item: Optional[Dict[str, Optional[str]]]) -> Optional[str]:
    if not item:
        return None
    return (item.get("correct") or item.get("selected") or "").upper().strip() or None


def compare_answers(expected: List[Dict[str, Optional[str]]], submitted: List[Dict[str, Optional[str]]]) -> Dict[str, int]:
    """Compare expected answers with submitted answers.

    Missing or incomplete questions are treated as skipped.
    """
    expected_map = {item["question"]: item for item in expected if item.get("question") is not None}
    submitted_map = {item["question"]: item for item in submitted if item.get("question") is not None}

    all_questions = sorted(set(expected_map) | set(submitted_map))
    counts = {"correct": 0, "wrong": 0, "skipped": 0}

    for question in all_questions:
        expected_answer = _answer_value(expected_map.get(question))
        submitted_answer = _answer_value(submitted_map.get(question))

        if expected_answer and submitted_answer:
            if submitted_answer == expected_answer:
                counts["correct"] += 1
            else:
                counts["wrong"] += 1
        else:
            counts["skipped"] += 1

    return counts
