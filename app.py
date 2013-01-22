import ujson as json

from utils import auth, geo
from models import Course, Sole, User

from flask import Flask, render_template, request
from pymongo import MongoClient

app = Flask(__name__)
db = MongoClient()

@app.route("/", methods=["GET"])
def get_home():
    loc = geo.loc_from_ip(request.remote_addr)
    user, err = auth.get_user(db, request)
    formatted_user = User.filter_user_attrs(user)
    params = {
        'loc': json.dumps(loc),
        'user': json.dumps(formatted_user)
    }
    return render_template("index.html", **params)

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
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    r = Sole.get(db, lat, lon, limit=10)
    return json.dumps(r)

@app.route("/sole/<sole_id>", methods=["GET"])
def get_sole_by_id(sole_id):
    """Returns details of a specific sole"""
    return []

@app.route("/course/<course_id>/sole/<sole_id>", methods=["PATCH"])
def patch_sole(course_id, sole_id):
    data = json.loads(request.data)
    user, err = auth.get_user(db, request, data)

    if not user:
        return json_error("User not found")

    sole = Sole.get_by_id(db, sole_id)
    if not sole:
        return json_error("that study group doesn't exist")


    # if the new set of student ids makes sense, use them
    current_sids = sole.get(Sole.A_STUDENT_IDS)
    new_sids = data.get(Sole.A_STUDENT_IDS)
    user_id = user.get('id')
    resp = None
    if (set(current_sids) - set(new_sids)) == set([user_id]):
        resp = Sole.leave_sole_by_id(db, sole_id, user_id)
    elif (set(new_sids) - set(current_sids)) == set([user_id]):
        resp = Sole.join_sole_by_id(db, sole_id, user_id)
    else:
        return json_error("Invalid new student_ids")

    # return the new model
    if resp:
        s = Sole.get_by_id(db, sole_id)
        ns = User.update_sole_with_students(db, s)
        return json.dumps(ns)
    else:
        return json_error("Some other error")

@app.route("/course/<course_id>/sole", methods=["POST"])
def post_sole(course_id):
    """Create a new sole.
    Expects a course_id, location, date, and time
    """
    data = json.loads(request.data)
    user, err = auth.get_user(db, request, data)

    if not user:
        return json_error("User not found")

    user_id = str(user.get('id'))

    # TODO validate
    s = {
        'day': data.get('day'),
        'time': data.get('time'),
        'lon': data.get('lon'),
        'lat': data.get('lat'),
        'address': data.get('address'),
        'course_id': data.get('course_id'),
        'user_id': user_id
    }
    app.logger.info(s)
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
