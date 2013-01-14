def get_courses(db):
    c = db.courses.coursera.find()
    r = []
    for o in c:
        o['id'] = str(o.pop('_id'))
        # TODO create this on write
        o['text'] = ", ".join([o.get('name', ''), o.get('uni', ''), o.get('prof', '')])
        r.append(o)
    return r
