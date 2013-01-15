import ujson as json

import auth
import facebook
import geo
from models import Course
from models import Sole
from models import User

from flask import Flask, render_template, request
from pymongo import MongoClient

app = Flask(__name__)
db = MongoClient()

@app.route("/", methods=["GET"])
def get_home():
    loc = geo.loc_from_ip(request.remote_addr)
    params = {
        'loc': json.dumps(loc)
    }
    fb_d, err = facebook.get_data_from_cookie(request)
    params['facebook_id'] = fb_d.get('user_id', '')
    return render_template("home.html", **params)

###
### Course routes
###

@app.route("/course", methods=["GET"])
def get_courses():
    r = Course.get_courses(db)
    return json.dumps(r)

@app.route("/course/<course_id>/sole", methods=["GET"])
def get_soles_for_course(course_id):
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    r = Sole.get_by_course_id(db, course_id, lat, lon)
    nr = User.update_soles_with_students(db, r)
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

@app.route("/sole/<sole_id>", methods=["GET"])
def get_sole_by_id(sole_id):
    """Returns details of a specific sole"""
    return []

@app.route("/sole", methods=["POST"])
def post_sole():
    """Create a new sole.
    Expects a course_id, location, date, and time
    """
    user, err = auth.get_user(db, request)

    if not user:
        return json_error("User not found")

    user_id = str(user.get('id'))

    # TODO validation
    s = {
        'day': request.form.get('day'),
        'time': request.form.get('time'),
        'lon': request.form.get('lon'),
        'lat': request.form.get('lat'),
        'course_id': request.form.get('course_id'),
        'user_id': user_id
    }
    for k, v in s.iteritems():
        if not v:
            return json_error("missing attribute")
    
    sole_id = Sole.create_new_sole(db, s)

    s = Sole.get_by_id(db, sole_id)
    ss = User.update_sole_with_students(db, s)

    return json.dumps(ss)

@app.route("/sole/<sole_id>/join", methods=["PUT"])
def join_sole_by_id(sole_id):
    user, err = auth.get_user(db, request)
    if err:
        return json_error(err)
    user_id = str(user.get('id'))

    resp = Sole.join_sole_by_id(db, sole_id, user_id)
    if not resp:
        return json_error("Couldn't join sole. Check sole id")

    return json.dumps({
        'user_id': user_id, 
        'id': sole_id,
        'facebook_id': user.get('facebook_id')
    })

@app.route("/sole/<sole_id>/leave", methods=["PUT"])
def leave_sole_by_id(sole_id):
    user, err = auth.get_user(db, request)
    if err:
        return json_error(err)
    user_id = str(user.get('id'))

    resp = Sole.leave_sole_by_id(db, sole_id, user_id)
    if not resp:
        return json_error("Couldn't leave sole. Check sole id")

    s = Sole.get_by_id(db, sole_id)
    if not s:
        return json_error("Sole not found")

    resp = {
        'user_id': user_id, 
        'id': sole_id,
        'facebook_id': user.get('facebook_id')
    }

    if not s.get(Sole.A_STUDENT_IDS):
        resp['remove'] = 1

    return json.dumps(resp)

def json_error(msg):
    return json.dumps({'error': msg}), 400

if __name__ == "__main__":
    app.run(debug=True)
