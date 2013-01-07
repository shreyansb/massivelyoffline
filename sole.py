def get(db, limit=20):
    soles = db.sole.sole.find().limit(limit)
    r = []
    for s in soles:
        s['id'] = str(s.pop('_id'))
        r.append(s)
    return r

def get_by_class_id(db, class_id):
    soles = db.sole.sole.find({'course': class_id}).limit(10)
    r = []
    for s in soles:
        s['id'] = str(s.pop('_id'))
        r.append(s)
    return r

def insert(db, doc):
    return db.sole.sole.insert(doc)
