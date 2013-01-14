from pymongo import ASCENDING
from bson.objectid import ObjectId

def get(db, limit=20):
    soles = db.sole.sole.find().limit(limit)
    r = []
    for s in soles:
        s['id'] = str(s.pop('_id'))
        r.append(s)
    return r

def get_by_course_id(db, course_id):
    spec = {
        'course_id': course_id,
        'num_students': {'$gt': 0}
    }
    soles = db.sole.sole.find(spec).sort('day', ASCENDING)
    r = []
    for s in soles:
        s['id'] = str(s.pop('_id'))
        r.append(s)
    return r

def get_by_id(db, sole_id):
    spec = { '_id': ObjectId(sole_id) }
    s = db.sole.sole.find_one(spec)
    s['id'] = str(s.pop('_id'))
    return s

def create_new_sole(db, doc):
    doc['student_ids'] = [doc.get('user_id')]
    doc['num_students'] = 1
    return db.sole.sole.insert(doc)

def join_sole_by_id(db, sole_id, user_id):
    """Add the :user_id to the list of students in the 
    sole with id :sole_id.
    Return True if the update happened, False if it did not for some reason, e.g.
    a sole with :sole_id doesn't exist
    """
    spec = { '_id': ObjectId(sole_id) }
    doc = {
        '$addToSet': {'student_ids': user_id},
        '$inc': {'num_students': 1}
    }
    resp = db.sole.sole.update(spec, doc, upsert=False, safe=True)
    if (resp.get('updatedExisting') == False):
        return False
    return True

def leave_sole_by_id(db, sole_id, user_id):
    spec = { '_id': ObjectId(sole_id) }
    doc = {
        '$pull': {'student_ids': user_id},
        '$inc': {'num_students': -1}
    }
    resp = db.sole.sole.update(spec, doc, upsert=False, safe=True)
    if (resp.get('updatedExisting') == False):
        return False
    return True
