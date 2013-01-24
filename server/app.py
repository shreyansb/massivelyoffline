import ujson as json

from models import Course, Sole, User
from resq import resq
from utils import auth, facebook, geo
from utils.emailer import EmailGroup

from flask import Flask, render_template, request
from pymongo import MongoClient

app = Flask(__name__, static_folder="../static")
db = MongoClient()

###
### Home
###

@app.route("/", methods=["GET"])
def get_home():
    loc = geo.loc_from_ip(request.remote_addr)
    user, err = auth.get_user_from_request(db, request)
    formatted_user = User.filter_user_attrs(user)
    params = {
        'loc': json.dumps(loc),
        'user': json.dumps(formatted_user)
    }
    return render_template("index.html", **params)

### 
### User
###

@app.route("/user", methods=['POST'])
def create_user():
    data = json.loads(request.data)
    if not (data.get('email') or data.get('facebook_id')):
        return json_error("missing attribute: email or facebook_id")

    # get the user id from the signed request and compare it to the 
    # facebook profile information to see if we have access to this user
    sr = data.get('signed_request')
    fb_d, err = facebook.get_data_from_signed_request(sr)
    if err:
        return json_error(err)

    if fb_d.get('user_id') != data.get('facebook_id'):
        return json_error("invalid facebook cookie")

    # find the user in the database, return if found
    facebook_id = data.get('facebook_id')
    user = User.find_by_facebook_id(db, facebook_id)
    if user:
        return json.dumps(user)

    # otherwise create and return the new user
    user_id = User.create(db, data)
    if not user_id:
        return json_error("couldn't create user")

    user = User.find_by_id(db, user_id)
    app.logger.error(user_id)
    app.logger.error(user)
    return json.dumps(user)

@app.route("/user/<user_id>", methods=['PUT'])
def update_user():
    data = json.loads(request.data)
    app.logger.error(data)
    
###
### Course
###

@app.route("/course", methods=["GET"])
def get_courses():
    r = Course.get_courses(db)
    return json.dumps(r)

###
### Sole
###

@app.route("/course/<course_id>/sole", methods=["GET"])
def get_soles_for_course(course_id):
    """ Get a list of soles for the course,
    within a certain radius of the provided lat, lon
    """
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    r = Sole.get_by_course_id(db, course_id, lat, lon)
    nr = User.update_soles_with_students(db, r)
    return json.dumps(nr)

@app.route("/course/<course_id>/sole", methods=["POST"])
def post_sole(course_id):
    """Create a new sole.
    """
    user, err = auth.get_user_from_request(db, request)
    if err:
        return json_error(err)

    user_id = str(user.get('id'))

    # TODO validate
    data = json.loads(request.data)
    s = {
        'day': data.get('day'),
        'time': data.get('time'),
        'lon': data.get('lon'),
        'lat': data.get('lat'),
        'address': data.get('address'),
        'course_id': data.get('course_id'),
        'user_id': user_id
    }
    for k, v in s.iteritems():
        if not v:
            return json_error("missing attribute")
    
    sole_id = Sole.create_new_sole(db, s)

    s = Sole.find_by_id(db, sole_id)
    ss = User.update_sole_with_students(db, s)

    return json.dumps(ss)

@app.route("/course/<course_id>/sole/<sole_id>", methods=["PATCH"])
def patch_sole(course_id, sole_id):
    """ Join or leave a sole
    """
    user, err = auth.get_user_from_request(db, request)

    if not user:
        return json_error("User not found")

    sole = Sole.find_by_id(db, sole_id)
    if not sole:
        return json_error("that study group doesn't exist")

    # if the new set of student ids makes sense, use them
    data = json.loads(request.data)
    current_sids = sole.get(Sole.A_STUDENT_IDS)
    new_sids = data.get(Sole.A_STUDENT_IDS)
    user_id = user.get('id')
    resp = None
    action = None
    if (set(current_sids) - set(new_sids)) == set([user_id]):
        resp = Sole.leave_sole_by_id(db, sole_id, user_id)
        action = 'left'
    elif (set(new_sids) - set(current_sids)) == set([user_id]):
        resp = Sole.join_sole_by_id(db, sole_id, user_id)
        action = 'joined'
    else:
        return json_error("Invalid new student_ids")

    # return the new model
    if resp:
        s = Sole.find_by_id(db, sole_id)
        ns = User.update_sole_with_students(db, s)
        resq.enqueue(EmailGroup, action, sole_id, user_id)
        return json.dumps(ns)
    else:
        return json_error("Some other error")

###
### Request and response helpers
###

def json_error(msg):
    return json.dumps({'error': msg}), 400


if __name__ == "__main__":
    app.run(debug=True)
