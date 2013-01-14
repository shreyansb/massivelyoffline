from pymongo import ASCENDING
from bson.objectid import ObjectId

_ID = '_id'
A_ID = 'id'
A_COURSE_ID = 'course_id'
A_USER_ID = 'user_id'
A_STUDENT_IDS = 'student_ids'
A_NUM_STUDENTS = 'num_students'
A_LOC = 'loc'
A_TIME = 'time'
A_DAY = 'day'

def get(db, limit=20):
    r = db.sole.sole.find().limit(limit)
    return format_cursor_as_list(r)

def get_by_course_id(db, course_id):
    spec = {
        A_COURSE_ID: course_id,
        A_NUM_STUDENTS: {'$gt': 0}
    }
    r = db.sole.sole.find(spec).sort(A_DAY, ASCENDING)
    return format_cursor_as_list(r)

def get_by_id(db, sole_id):
    spec = { _ID: ObjectId(sole_id) }
    s = db.sole.sole.find_one(spec)
    s[A_ID] = str(s.pop(_ID))
    return s

def create_new_sole(db, doc):
    doc[A_LOC] = [doc.get('lon'), doc.get('lat')]
    doc[A_STUDENT_IDS] = [doc.get(A_USER_ID)]
    doc[A_NUM_STUDENTS] = 1
    return db.sole.sole.insert(doc)

def join_sole_by_id(db, sole_id, user_id):
    """Add the :user_id to the list of students in the 
    sole with id :sole_id.
    Return True if the update happened, False if it did not for some reason, e.g.
    a sole with :sole_id doesn't exist
    """
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
