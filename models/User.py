from bson.objectid import ObjectId

###
### create
###

def create_by_facebook_id(db, facebook_id, doc):
    doc.pop('id')
    doc['facebook_id'] = facebook_id
    return db.users.users.insert(doc)

###
### find
###

def find_by_facebook_id(db, facebook_id):
    spec = {'facebook_id': facebook_id}
    return find(db, spec)

def find_by_id(db, user_id):
    spec = { '_id': ObjectId(user_id) }
    return find(db, spec)

def find(db, spec):
    user = db.users.users.find_one(spec)
    if user:
        user['id'] = str(user.pop('_id'))
    return user
