from flask import Flask

from chords import chords

app = Flask(__name__)
app.config["TESTING"] = True
app.register_blueprint(chords.bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0")
