import logging
import time

from flask import Blueprint, request
from pathlib import Path
from tinydb import TinyDB, Query, where

bp = Blueprint("chords", __name__)

logging.basicConfig(level=logging.DEBUG)

DATABASE = "data/chords.json"

"""
Routes:
    /                       GET         show page
    /cat                    GET         return category list
    /cat                    POST        add new category
    /chords/<category>      GET         return chords for the category
    /chords                 POST        add new chords
    /chords                 DELETE      delete chords
    /stat                   POST        increase visit counter for chords
"""

@bp.route("/")
def index():
    """Show page."""
    page = Path("static/chords.html").read_text()
    return page, 200


@bp.route("/cat", methods=["GET"])
def list_categories():
    """Return existing categories as JSON list."""
    db = TinyDB(DATABASE)
    return list(db.tables()), 200


@bp.route("/cat", methods=["POST"])
def add_category():
    """Adds new category table."""
    data = request.form
    logging.info(f"Add category, table={data['cat-name']}")
    db = TinyDB(DATABASE)
    try:
        table = db.table(data["cat-name"])
        table.truncate()
        return "", 200
    except Exception as e:
        logging.warn("Error while adding category:", e)
        return "Error", 500


@bp.route("/chords/<category>")
def get_chords(category):
    """Return all active chords."""
    db = TinyDB(DATABASE)
    table = db.table(category)
    Chords = Query()
    results = table.search(Chords.deleted_at == None)
    return results, 200


@bp.route("/chords", methods=["POST"])
def add_chords():
    """Add new chords entry to the category."""
    data = request.form
    logging.info(f"Add chords: {data}")

    db = TinyDB(DATABASE)
    table = db.table(data["category"])
    table.upsert({
        "artist": data["artist"],
        "song": data["song"],
        "url": data["url"],
        "visit_count": 0,
        "deleted_at": None
    }, Query().url == data["url"])
    return "", 200


@bp.route("/chords", methods=["DELETE"])
def delete_chords():
    """Mark chords deleted in the category."""
    data = request.form
    logging.info(f"Delete chords: {data}")

    db = TinyDB(DATABASE)
    table = db.table(data["category"])
    table.update({"deleted_at": int(time.time())}, where("url") == data["url"])
    return "", 200


@bp.route("/stat", methods=["POST"])
def count_link():
    """Increase visit counter for a link"""
    url = request.form["url"]
    category = request.form["category"]

    db = TinyDB(DATABASE)
    table = db.table(category)
    q = Query()

    response = table.get(q.url == url)
    count = response["visit_count"] + 1
    table.update({"visit_count": count}, q.url == url)
    return "", 200
