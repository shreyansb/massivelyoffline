import gmailer
import logging
import resq

from dateutil.parser import parse as date_parse
from pymongo import MongoClient
from models import Course, Sole, User

def send(to, subject, text, cc=None, bcc=None, reply_to=None, attach=None,
         html=None, pre=False, custom_headers=None):
    """ abstracts away the details of our email provider. always use this method 
    instead of gmailer or other future mailers
    """
    return gmailer.mail(to, subject, text, cc=cc, bcc=bcc, reply_to=reply_to,
                        attach=attach, html=html, pre=False, custom_headers=custom_headers)

class EmailCreator():
    queue = resq.Q_EMAIL

    @staticmethod
    def perform(sole_id):
        """ Email the creator of a sole about its creation
        """
        sole, course, users = get_sole_course_and_user_information(sole_id)
        if not (sole and course and users):
            return
        

class EmailGroup():
    queue = resq.Q_EMAIL

    @staticmethod
    def perform(action, sole_id, user_id):
        """ Email the group about a person joining or leaving the group
        """
        sole, course, users = get_sole_course_and_user_information(sole_id, user_id)
        if not (sole and course and users):
            return
        
        # create email
        params = {
            'actor_name': users[user_id].get('name'),
            'course_name': course.get('name'),
            'day': format_date(date_parse(sole.get(Sole.A_DAY))),
            'time': sole.get(Sole.A_TIME),
            'address': sole.get(Sole.A_ADDRESS),
            'action': action
        }
        member_list = []
        if action == "joined":
            for k, v in users.iteritems():
                member_list.append(v)
        else:
            for k, v in users.iteritems():
                if k != user_id:
                    member_list.append(v)
        params['members'] = ', '.join(m.get('name') for m in member_list)

        to = 'info+group@massivelyoffline.org'
        cc = [m.get('email') for m in member_list]
        subject = "Re: %(course_name)s, on %(day)s at %(time)s" % params
        text = """Hi, 

%(actor_name)s has just %(action)s the group.
Current members: %(members)s

Reply-all to this email to chat with your fellow students.

Meeting time: %(day)s at %(time)s
Meeting near: %(address)s

Have a good meeting,
Massively Offline
        """
        text = text % params

        send(to, subject, text, cc=cc)
        logging.info("sent email to %s" % cc)


def get_sole_course_and_user_information(sole_id, user_id=None):
    db = MongoClient()

    # find the sole
    sole = Sole.find_by_id(db, sole_id)
    if not sole:
        None, None, None

    # find the course
    cid = sole.get(Sole.A_COURSE_ID)
    course = Course.find_by_id(db, cid)
    if not course:
        sole, None, None
    
    # find the user who did the action
    user_ids = set(sole.get(Sole.A_STUDENT_IDS))
    if not user_ids:
        # everyone has left the group!
        sole, course, None

    if user_id:
        user_ids.add(user_id)
    users = User.find_by_ids(db, user_ids, as_dict=True)
    return sole, course, users

def format_date(dt):
    day = dt.day
    if 4 <= day <= 20 or 24 <= day <= 30:
        suffix = "th"
    else:
        suffix = ["st", "nd", "rd"][day % 10 - 1]

    return "%s the %s%s" % (dt.strftime("%A"), day, suffix)
