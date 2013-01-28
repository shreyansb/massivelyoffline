from pymongo import ASCENDING, GEO2D
from bson.objectid import ObjectId
import datetime
import re

###
### module attrs
###

_ID = '_id'
A_ID = 'id'
A_COURSE_ID = 'course_id'
A_USER_ID = 'user_id'

A_STUDENT_IDS = 'student_ids'
A_NUM_STUDENTS = 'num_students'

A_LOC = 'loc'
A_LAT = 'lat'
A_LON = 'lon'
A_ADDRESS = 'address'

A_DAY = 'day'
A_TIME = 'time'
A_TZ = 'tz'

###
### indexes
###

def ensure_index(db):
    r = []
    r.append(db.sole.sole.ensure_index([(A_LOC, GEO2D)]))
    return r

###
### find
###

def find(db, lat=None, lon=None, limit=20):
    spec = basic_find_spec(lat, lon)
    r = db.sole.sole.find(spec).limit(limit)
    return format_cursor_as_list(r)

def find_by_course_id(db, course_id, lat=None, lon=None):
    spec = basic_find_spec(lat, lon)
    spec[A_COURSE_ID] = course_id
    r = db.sole.sole.find(spec).sort(A_DAY, ASCENDING)
    return format_cursor_as_list(r)

def find_by_id(db, sole_id):
    spec = { _ID: ObjectId(sole_id) }
    s = db.sole.sole.find_one(spec)
    s[A_ID] = str(s.pop(_ID))
    return s

def basic_find_spec(lat=None, lon=None):
    today = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    spec = {
        A_NUM_STUDENTS: {'$gt': 0},
        A_DAY: {'$gte': today}
    }
    if lat and lon:
        spec[A_LOC] = generate_within_query(lat, lon)
    return spec

###
### insert
###

def create_new_sole(db, doc):
    doc[A_LOC] = loc_from_lat_lon(doc.get(A_LAT), doc.get(A_LON))
    doc[A_STUDENT_IDS] = [doc.get(A_USER_ID)]
    doc[A_NUM_STUDENTS] = 1
    return db.sole.sole.insert(doc)

###
### update
###

def join_sole_by_id(db, sole_id, user_id):
    spec = { _ID: ObjectId(sole_id) }
    doc = {
        '$addToSet': {A_STUDENT_IDS: user_id},
        '$inc': {A_NUM_STUDENTS: 1}
    }
    return update(db, spec, doc)

def leave_sole_by_id(db, sole_id, user_id):
    spec = { _ID: ObjectId(sole_id) }
    doc = {
        '$pull': {A_STUDENT_IDS: user_id},
        '$inc': {A_NUM_STUDENTS: -1}
    }
    return update(db, spec, doc)

def update(db, spec, doc):
    """ Return True if the update happened, False if it did not
    """
    resp = db.sole.sole.update(spec, doc, upsert=False, safe=True)
    if (resp.get('updatedExisting') == False):
        return False
    return True

###
### helpers: format data, modify specs, etc.
###

def format_cursor_as_list(c):
    r = []
    for o in c:
        o[A_ID] = str(o.pop(_ID))
        r.append(o)
    return r

def loc_from_lat_lon(lat, lon):
    return [float(lon), float(lat)]

def generate_within_query(lat, lon, miles=1000):
    loc = loc_from_lat_lon(lat, lon)
    radius_of_earth_in_miles = 3963.192
    distance = miles / radius_of_earth_in_miles
    q = {
        '$within': {
            '$center': [loc, distance]
        }
    }
    return q

###
### Validation
###

def format_params_for_create(user_id, params):
    """ given params sent in with a POST request,
    return a doc that is ready to be stored in the database
    """
    s = {
        A_TIME: params.get(A_TIME),
        A_LON: params.get(A_LON),
        A_LAT: params.get(A_LAT),
        A_ADDRESS: params.get(A_ADDRESS),
        A_COURSE_ID: params.get(A_COURSE_ID),
        A_USER_ID: user_id
    }
    day = params.get(A_DAY)
    m = re.match("([\d]{4}-[\d]{2}-[\d]{2})\s\((.*)\)", day)
    if m:
        s[A_DAY] = m.group(1)
        s[A_TZ] = m.group(2)
    return s

def validate_params_for_create(params):
    for k, v in params.iteritems():
        if not v:
            return "missing attribute"
    check_for = [A_DAY, A_TZ]
    for k in check_for:
        if k not in params:
            return "incorrectly formatted day"
    return None 
