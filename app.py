import logging
import ujson as json
from flask import Flask, render_template, request
from data.US import zipcodes
from pymongo import MongoClient

app = Flask(__name__)
c = MongoClient()
db = c.courses.coursera

@app.route("/zip/<zipcode>", methods=["GET"])
def get_zip(zipcode):
    info = zipcodes.get(zipcode)
    return json.dumps(info)

@app.route("/", methods=["GET"])
def get_home():
    return render_template("home.html")

@app.route("/courses", methods=["GET"])
def get_courses():
    all = db.find()
    results = []
    for o in all:
        o['id'] = str(o.pop('_id'))
        o['text'] = ", ".join([o.get('name', ''), o.get('prof', ''), o.get('uni', '')])
        results.append(o)
    return json.dumps(results)

@app.route("/courses", methods=["POST"])
def post_course():
    logging.warning(request.values)
    return json.dumps({"status": "ok"})

if __name__ == "__main__":
    app.run()
    logging.info("app started")
