import os
from uuid import uuid4

from flask import Flask, jsonify, redirect, render_template, request, url_for
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.utils import secure_filename

from parser.compare import compare_answers
from parser.extractor import extract_responses
from parser.report import generate_report
from parser.score import calculate_score


class ValidationError(Exception):
    """Raised when uploaded files fail validation."""


app = Flask(__name__)
app.secret_key = "dev-secret-key"
app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "uploads")
app.config["REPORTS_FOLDER"] = os.path.join(os.path.dirname(__file__), "reports")
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
os.makedirs(app.config["REPORTS_FOLDER"], exist_ok=True)


def allowed_file(filename: str) -> bool:
    return filename.lower().endswith(".pdf")


def save_upload(upload_file) -> str:
    if upload_file is None or upload_file.filename == "":
        raise ValidationError("Please select a PDF file.")

    if not allowed_file(upload_file.filename):
        raise ValidationError("Only PDF files are allowed.")

    filename = f"{uuid4().hex}_{secure_filename(upload_file.filename)}"
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    upload_file.save(file_path)
    return file_path


def collect_upload_paths() -> list[str]:
    single_file = request.files.get("single_file")
    response_file = request.files.get("response_file")
    answer_key_file = request.files.get("answer_key_file")

    if single_file and single_file.filename:
        return [save_upload(single_file)]

    if response_file and response_file.filename and answer_key_file and answer_key_file.filename:
        return [save_upload(response_file), save_upload(answer_key_file)]

    if response_file and response_file.filename:
        raise ValidationError("Please upload an answer key PDF as well.")

    if answer_key_file and answer_key_file.filename:
        raise ValidationError("Please upload a response sheet PDF as well.")

    raise ValidationError("Please upload at least one PDF file.")


def run_placeholder_analysis(upload_paths: list[str]) -> dict:
    extracted_items = [extract_responses(path) for path in upload_paths]

    if len(extracted_items) >= 2:
        comparison_results = compare_answers(extracted_items[0], extracted_items[1])
    else:
        comparison_results = []

    score = calculate_score(comparison_results or extracted_items)
    report = generate_report({"score": score, "files": upload_paths})
    return {"score": score, "report": report, "files": upload_paths}


@app.errorhandler(413)
def handle_file_too_large(_):
    return jsonify({"success": False, "error": "File size exceeds the 20 MB limit."}), 413


@app.errorhandler(RequestEntityTooLarge)
def handle_request_too_large(_):
    return jsonify({"success": False, "error": "File size exceeds the 20 MB limit."}), 413


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        upload_paths = collect_upload_paths()
        run_placeholder_analysis(upload_paths)
    except ValidationError as exc:
        return jsonify({"success": False, "error": str(exc)}), 400
    except Exception as exc:  # pragma: no cover - defensive logging path
        app.logger.exception("Analysis failed")
        return jsonify({"success": False, "error": "Unable to process the uploaded files."}), 500

    return redirect(url_for("result", message="Analysis completed successfully."))


@app.route("/result", methods=["GET", "POST"])
def result():
    if request.method == "POST":
        return analyze()

    message = request.args.get("message", "Submission received.")
    return render_template("result.html", message=message)


if __name__ == "__main__":
    app.run(debug=True)
