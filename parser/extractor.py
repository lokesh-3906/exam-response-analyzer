import re
import pdfplumber


def extract_answers(pdf_path):
    """
    Extract question numbers and chosen options from a Digialm response sheet.
    Returns:
        [
            {"question": 1, "chosen": 1},
            {"question": 2, "chosen": 4},
            ...
        ]
    """

    text = ""

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    # Pattern:
    # Q.1
    # ...
    # Chosen Option :1
    pattern = r"Q\.(\d+).*?Chosen Option\s*:\s*(\d+)"

    matches = re.findall(pattern, text, re.DOTALL)

    answers = []

    for question, chosen in matches:
        answers.append({
            "question": int(question),
            "chosen": int(chosen)
        })

    return answers