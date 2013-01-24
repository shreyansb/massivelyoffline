import gmailer

def send(to, subject, text, cc=None, bcc=None, reply_to=None, attach=None,
         html=None, pre=False, custom_headers=None):

    return gmailer.mail(to, subject, text, cc=cc, bcc=bcc, reply_to=reply_to,
                        attach=attach, html=html, pre=False, custom_headers=custom_headers)
