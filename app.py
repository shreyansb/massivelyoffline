import logging
import ujson as json
from flask import Flask, render_template, request
from data.US import zipcodes
from pymongo import MongoClient

app = Flask(__name__)
db = MongoClient()
sole_db = db.sole
course_db = db.courses

@app.route("/zip/<zipcode>", methods=["GET"])
def get_zip(zipcode):
    info = zipcodes.get(zipcode)
    return json.dumps(info)

@app.route("/", methods=["GET"])
def get_home():
    return render_template("home.html")

@app.route("/courses", methods=["GET"])
def get_courses():
    all = course_db.coursera.find()
    r = []
    for o in all:
        o['id'] = str(o.pop('_id'))
        o['text'] = ", ".join([o.get('name', ''), o.get('prof', ''), o.get('uni', '')])
        r.append(o)
    return json.dumps(r)

@app.route("/sole", methods=["POST"])
def post_sole():
    zipcode = request.values.get('zip')
    loc = zipcodes.get(zipcode)
    sole = {
        'course': request.values.get('id'),
        'zip': zipcode,
        'desc': request.values.get('description'),
        'ppl': request.values.get('ppl'),
        'loc': loc,
    }
    logging.warning(sole)
    sole_db.sole.insert(sole)
    return json.dumps({'status':'ok'})

@app.route("/sole", methods=["GET"])
def get_sole():
    logging.warning("get sole")
    soles = sole_db.sole.find().limit(10)
    r = []
    for s in soles:
        s['id'] = str(s.pop('_id'))
        r.append(s)
    logging.warning(r)
    return json.dumps(r)

if __name__ == "__main__":
    app.run()
    logging.info("app started")
