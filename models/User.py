from bson.objectid import ObjectId

A_FACEBOOK_ID = 'facebook_id'

###
### create
###

def create_by_facebook_id(db, facebook_id, doc):
    doc.pop('id')
    doc[A_FACEBOOK_ID] = facebook_id
    return db.users.users.insert(doc)

###
### find
###

def find_by_facebook_id(db, facebook_id):
    spec = {A_FACEBOOK_ID: facebook_id}
    return find(db, spec)

def find_by_id(db, user_id):
    spec = { '_id': ObjectId(user_id) }
    return find(db, spec)

def find(db, spec):
    user = db.users.users.find_one(spec)
    if user:
        user['id'] = str(user.pop('_id'))
    return user

###
### insert users into other things
###

def update_soles_with_students(db, soles):
    nr = []
    for i in soles:
        nr.append(update_sole_with_students(db, i))
    return nr

def update_sole_with_students(db, s):
    s['students'] = []
    user_ids = s.get('student_ids', [s.get('user_id')])
    for user_id in user_ids:
        user = find_by_id(db, user_id)
        s['students'].append(user)
    return s

###
### filter
###

def filter_user_attrs(u):
    attrs_to_keep = ['first_name', 'last_name', 'name', 'id', 'facebook_id']
    nd = {}
    for k, v in u.iteritems():
        if k in attrs_to_keep:
            nd[k] = v
    return nd
