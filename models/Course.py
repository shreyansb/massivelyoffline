def get_courses(db):
    c = db.courses.coursera.find()
    r = []
    for o in c:
        o['id'] = str(o.pop('_id'))
        # TODO create this on write
        o['text'] = ", ".join([o.get('name', ''), o.get('uni', ''), o.get('prof', '')])
        r.append(o)
    return r

def get_course_by_id(db, course_id):
    c = db.courses.coursera.find({'id': course_id})
    return c
