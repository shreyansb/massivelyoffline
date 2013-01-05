import logging
import ujson as json
from flask import Flask, render_template
from US import zipcodes
from pymongo import MongoClient

app = Flask(__name__)
c = MongoClient()
db = c.sole_db.sole_coll

@app.route("/zip/<zipcode>", methods=["GET"])
def get_zip(zipcode):
    info = zipcodes.get(zipcode)
    return json.dumps(info)

@app.route("/", methods=["GET"])
def get_home():
    return render_template("home.html")

@app.route("/sole", methods=["GET"])
def get_sole():
    all = db.find()
    results = [o for o in all]
    return json.dumps(results)

if __name__ == "__main__":
    app.run()
