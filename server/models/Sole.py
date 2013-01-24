from pymongo import ASCENDING, GEO2D
from bson.objectid import ObjectId

_ID = '_id'
A_ID = 'id'
A_COURSE_ID = 'course_id'
A_USER_ID = 'user_id'
A_STUDENT_IDS = 'student_ids'
A_NUM_STUDENTS = 'num_students'
A_LOC = 'loc'
A_LAT = 'lat'
A_LON = 'lon'
A_TIME = 'time'
A_DAY = 'day'

def ensure_index(db):
    r = []
    r.append(db.sole.sole.ensure_index([("loc", GEO2D)]))
    return r

def get(db, lat=None, lon=None, limit=20):
    spec = {
        A_NUM_STUDENTS: {'$gt': 0}
    }
    if lat and lon:
        spec[A_LOC] = generate_within_query(lat, lon)
    r = db.sole.sole.find(spec).limit(limit)
    return format_cursor_as_list(r)

def get_by_course_id(db, course_id, lat=None, lon=None):
    spec = {
        A_COURSE_ID: course_id,
        A_NUM_STUDENTS: {'$gt': 0}
    }
    if lat and lon:
        spec[A_LOC] = generate_within_query(lat, lon)
    r = db.sole.sole.find(spec).sort(A_DAY, ASCENDING)
    return format_cursor_as_list(r)

def get_by_id(db, sole_id):
    spec = { _ID: ObjectId(sole_id) }
    s = db.sole.sole.find_one(spec)
    s[A_ID] = str(s.pop(_ID))
    return s

def create_new_sole(db, doc):
    doc[A_LOC] = loc_from_lat_lon(doc.get(A_LAT), doc.get(A_LON))
    doc[A_STUDENT_IDS] = [doc.get(A_USER_ID)]
    doc[A_NUM_STUDENTS] = 1
    return db.sole.sole.insert(doc)

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

