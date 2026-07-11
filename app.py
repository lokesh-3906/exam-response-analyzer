from flask import Flask, render_template, request
import os

from parser.extractor import extract_answers

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/upload", methods=["POST"])
def upload():

    if "pdf" not in request.files:
        return "No PDF uploaded."

    uploaded_pdf = request.files["pdf"]

    if uploaded_pdf.filename == "":
        return "No file selected."

    save_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        uploaded_pdf.filename
    )

    uploaded_pdf.save(save_path)

    answers = extract_answers(save_path)

    print("\n" + "=" * 60)
    print("EXTRACTED ANSWERS")
    print("=" * 60)

    for answer in answers:
        print(answer)

    print("=" * 60)
    print(f"Total Questions Found: {len(answers)}")
    print("=" * 60)

    return f"""
    <h2>Upload Successful!</h2>

    <p><strong>{uploaded_pdf.filename}</strong></p>

    <p>Questions Extracted: <strong>{len(answers)}</strong></p>

    <p>Check the terminal output.</p>
    """


if __name__ == "__main__":
    app.run(debug=True)