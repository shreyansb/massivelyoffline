import random
import ujson as json

import geo
import sample_data
from models import Course
from models import Sole

from flask import Flask, render_template, request
from pymongo import MongoClient

app = Flask(__name__)
db = MongoClient()

# TODO users and authentication
# TODO validate inputs

@app.route("/", methods=["GET"])
def get_home():
    loc = geo.loc_from_ip(request.remote_addr)
    return render_template("home.html", loc=json.dumps(loc))

###
### Course routes
###

@app.route("/course", methods=["GET"])
def get_courses():
    r = Course.get_courses(db)
    return json.dumps(r)

@app.route("/course/<course_id>/sole", methods=["GET"])
def get_soles_for_course(course_id):
    r = Sole.get_by_course_id(db, course_id)
    nr = []
    for i in r:
        i['students'] = []
        sids = i.get('student_ids', [i.get('user_id')])
        for sid in sids:
            # TODO real users
            i['students'].append(sample_data.users.get(sid))
        nr.append(i)
    return json.dumps(nr)

@app.route("/course/<course_id>", methods=["GET"])
def get_course_by_id(course_id):
    r = Course.get_course_by_id(course_id)
    return json.dumps(r)

###
### Sole routes
###

@app.route("/sole", methods=["GET"])
def get_soles():
    """Get a bunch of recent soles
    filter by location
    """
    r = Sole.get(db, limit=10)
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
    
    r = Sole.create_new_sole(db, s)
    return json.dumps({'id': str(r)})

@app.route("/sole/<sole_id>", methods=["GET"])
def get_sole_by_id(sole_id):
    """Returns details of a specific sole"""
    return []

@app.route("/sole/<sole_id>/join", methods=["PUT"])
def join_sole_by_id(sole_id):
    # TODO validate inputs
    user_id = random.choice(sample_data.users.keys())
    Sole.join_sole_by_id(db, sole_id, user_id)
    return json.dumps({'user_id': user_id, 'id': sole_id})

if __name__ == "__main__":
    app.run(debug=True)
