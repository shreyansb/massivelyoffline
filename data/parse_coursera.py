from pymongo import MongoClient
from bs4 import BeautifulSoup

# the data
file_path = "data/etc/coursera_courses.html"
soup = BeautifulSoup(open(file_path))

# the database
c = MongoClient()
db = c.courses.coursera

# parsing rules as of Jan 5, 2013
for c in soup.find_all("div", class_="coursera-course-listing-box"):
    img = c.find('img', class_="coursera-course-listing-icon").get('src')
    prof = c.find('h4', class_="coursera-course-listing-instructor").get_text()
    course_link = c.find('a', class_="internal-home")
    course_url = course_link.get('href')
    course_name = course_link.get_text()
    meta = c.find('div', class_="coursera-course-listing-meta")
    timing = meta.get_text()
    uni = c.find('a', class_="coursera-course-listing-university")
    uni_name = uni.img.span.get_text()
    uni_img = uni.img.get('src')
    cd = {
        'img': img,
        'prof': prof,
        'url': course_url,
        'name': course_name,
        'timing': timing,
        'uni': uni_name,
        'uni_img': uni_img
    }
    dbr = db.insert(cd)
    print cd
    print dbr

