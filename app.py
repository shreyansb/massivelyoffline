import logging
import sole
import sample_responses
import ujson as json
from flask import Flask, render_template, request
from data.US import zipcodes
from pymongo import MongoClient

app = Flask(__name__)
db = MongoClient()

@app.route("/", methods=["GET"])
def get_home():
    return render_template("home.html")

@app.route("/zip/<zipcode>", methods=["GET"])
def get_zip(zipcode):
    info = zipcodes.get(zipcode)
    return json.dumps(info)

@app.route("/courses", methods=["GET"])
def get_courses():
    all = db.courses.coursera.find()
    r = []
    for o in all:
        o['id'] = str(o.pop('_id'))
        # TODO create this on write
        o['text'] = ", ".join([o.get('name', ''), o.get('prof', ''), o.get('uni', '')])
        r.append(o)
    return json.dumps(r)

@app.route("/sole", methods=["POST"])
def post_sole():
    zipcode = request.values.get('zip')
    loc = zipcodes.get(zipcode)
    # TODO modify sole data to match sample_responses.sole
    s = {
        'course': request.values.get('id'),
        'zip': zipcode,
        'desc': request.values.get('description'),
        'ppl': request.values.get('ppl'),
        'loc': loc,
    }
    sole.insert(db, s)
    return json.dumps({'status':'ok'})

@app.route("/sole", methods=["GET"])
def get_sole():
    r = sole.get(db, limit=10)
    return json.dumps(r)

@app.route("/sole/<class_id>", methods=["GET"])
def get_soles_for_class_id(class_id):
    #r = sole.get_by_class_id(db, class_id)
    # TODO real response
    r = sample_responses.soles
    return json.dumps(r)

if __name__ == "__main__":
    app.run()
    logging.info("app started")
