import os

from brubeck.request_handling import Brubeck, WebMessageHandler
from brubeck.connections import WSGIConnection

class DemoHandler(WebMessageHandler):
    def get(self):
        self.set_body("Hello, from Brubeck!")
        return self.render()

config = {
    'msg_conn': WSGIConnection(int(os.environ.get('PORT', 6767))),
    'handler_tuples': [
        (r'^/', DemoHandler)
    ]
}

if __name__ == '__main__':
    app = Brubeck(**config)
    app.run()
