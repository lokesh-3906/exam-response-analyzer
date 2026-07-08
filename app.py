from flask import Flask, render_template, request
import os

app = Flask(__name__)
app.secret_key = "dev-secret-key"
app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "uploads")
app.config["REPORTS_FOLDER"] = os.path.join(os.path.dirname(__file__), "reports")

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
os.makedirs(app.config["REPORTS_FOLDER"], exist_ok=True)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/result", methods=["POST"])
def result():
    return render_template("result.html", message="Submission received.")


if __name__ == "__main__":
    app.run(debug=True)
