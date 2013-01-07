import logging
import sole
import course
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

###
### Course routes
###

@app.route("/course", methods=["GET"])
def get_courses():
    r = course.get_courses(db)
    return json.dumps(r)

@app.route("/course/<course_id>", methods=["GET"])
def get_course_by_id(course_id):
    r = course.get_course_by_id(course_id)
    return json.dumps(r)

@app.route("/course/<course_id>/sole", methods=["GET"])
def get_soles_for_course():
    # TODO real response
    r = sample_responses.soles
    return json.dumps(r)

###
### Sole routes
###

@app.route("/sole", methods=["GET"])
def get_soles():
    """Get a bunch of recent soles"""
    r = sole.get(db, limit=10)
    return json.dumps(r)

@app.route("/sole", methods=["POST"])
def post_sole():
    """Create a new sole.
    Expects a course_id, location, date, and time
    """
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

@app.route("/sole/<sole_id>", methods=["GET"])
def get_sole_by_id(sole_id):
    """Returns details of a specific sole"""
    return []

@app.route("/sole/<sole_id>", methods=["PUT"])
def update_sole_by_id(sole_id):
    """Update the details of a sole.
    Usually used to add or remove a student"""
    return []

if __name__ == "__main__":
    app.run()
    logging.info("app started")
