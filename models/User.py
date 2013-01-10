
def find_by_facebook_id(db, facebook_id):
    spec = {'facebook_id': facebook_id}
    return db.users.users.find_one(spec)
