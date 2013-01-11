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
    soles = db.sole.sole.find({'course_id': course_id}).sort('day', ASCENDING)
    r = []
    for s in soles:
        s['id'] = str(s.pop('_id'))
        r.append(s)
    return r

def create_new_sole(db, doc):
    doc['student_ids'] = [doc.get('user_id')]
    return db.sole.sole.insert(doc)

def join_sole_by_id(db, sole_id, user_id):
    spec = { '_id': ObjectId(sole_id) }
    doc = {'$addToSet': {'student_ids': user_id}}
    resp = db.sole.sole.update(spec, doc, upsert=False, safe=True)
    if resp.get(''):
        return False
    return True
