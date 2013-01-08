def get(db, limit=20):
    soles = db.sole.sole.find().limit(limit)
    r = []
    for s in soles:
        s['id'] = str(s.pop('_id'))
        r.append(s)
    return r

def get_by_course_id(db, course_id):
    soles = db.sole.sole.find({'course_id': course_id}).limit(10)
    r = []
    for s in soles:
        s['id'] = str(s.pop('_id'))
        r.append(s)
    return r

def create_new_sole(db, doc):
    doc['student_ids'] = [doc.get('user_id')]
    return db.sole.sole.insert(doc)
