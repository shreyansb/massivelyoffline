import random
import ujson as json

import facebook
import sole
import course
import geo
import sample_data

from flask import Flask, render_template, request
from data.US import zipcodes
from pymongo import MongoClient

app = Flask(__name__)
db = MongoClient()

# TODO users and authentication
# TODO validate inputs

@app.route("/", methods=["GET"])
def get_home():
    loc = geo.loc_from_ip(request.remote_addr)
    app.logger.info(request.cookies)
    app.logger.info(facebook.get_facebook_data(request))
    return render_template("home.html", loc=json.dumps(loc))

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

@app.route("/course/<course_id>/sole", methods=["GET"])
def get_soles_for_course(course_id):
    #r = sample_data.soles
    r = sole.get_by_course_id(db, course_id)
    nr = []
    for i in r:
        i['students'] = []
        sids = i.get('student_ids', [i.get('user_id')])
        for sid in sids:
            i['students'].append(sample_data.users.get(sid))
        nr.append(i)
    app.logger.info(nr)
    return json.dumps(nr)

@app.route("/course/<course_id>", methods=["GET"])
def get_course_by_id(course_id):
    r = course.get_course_by_id(course_id)
    return json.dumps(r)

###
### Sole routes
###

@app.route("/sole", methods=["GET"])
def get_soles():
    """Get a bunch of recent soles
    filter by location
    """
    r = sole.get(db, limit=10)
    return json.dumps(r)

@app.route("/sole", methods=["POST"])
def post_sole():
    """Create a new sole.
    Expects a course_id, location, date, and time
    """
    s = {
        'day': request.form.get('day'),
        'time': request.form.get('time'),
        'lon': request.form.get('lon'),
        'lat': request.form.get('lat'),
        'course_id': request.form.get('course_id'),
        'user_id': random.choice(sample_data.users.keys())
    }
    for k, v in s.iteritems():
        if not v:
            return json.dumps({'error':'missing attribute'}), 400
    
    r = sole.create_new_sole(db, s)
    return json.dumps({'id': str(r)})

@app.route("/sole/<sole_id>", methods=["GET"])
def get_sole_by_id(sole_id):
    """Returns details of a specific sole"""
    return []

@app.route("/sole/<sole_id>/join", methods=["PUT"])
def join_sole_by_id(sole_id):
    # TODO validate inputs
    user_id = random.choice(sample_data.users.keys())
    sole.join_sole_by_id(db, sole_id, user_id)
    return json.dumps({'user_id': user_id, 'id': sole_id})

if __name__ == "__main__":
    app.run(debug=True)
