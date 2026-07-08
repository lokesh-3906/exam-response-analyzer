from typing import Dict, List, Optional, Union


def calculate_score(results: Union[Dict[str, int], List[Dict[str, Optional[str]]], None]) -> int:
    """Calculate the total score using the comparison results.

    Correct answers earn +1, while wrong and skipped answers earn 0.
    """
    if not results:
        return 0

    if isinstance(results, dict):
        if {"correct", "wrong", "skipped"}.issubset(results.keys()):
            return int(results.get("correct", 0))
        return 0

    if isinstance(results, list):
        score = 0
        for item in results:
            selected = (item.get("selected") or "").upper().strip()
            correct = (item.get("correct") or "").upper().strip()
            if selected and correct and selected == correct:
                score += 1
        return score

    return 0
