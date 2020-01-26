import os
import socket
import sys
import json

# tornado eference: https://siguniang.wordpress.com/2015/09/23/websocket-server-using-tornado/
import tornado.ioloop
import tornado.web
import tornado.websocket

from settings import *

# 以下自作クラス
from modules.motor_controller import MotorController
from modules.monitor import Monitor

# HACK: グローバル変数を消す
motor_controller = MotorController()
monitor = Monitor()

class WebSocketControllerHandler(tornado.websocket.WebSocketHandler):

    def open(self):
        print("Websocket controller opened")

    def on_message(self, message):
        self.write_message(message)
        print(message)
        self.__control(message)

    def on_close(self):
        print("Websocket controller closed")
    
    def __control(seld, message):
        message_dict = json.loads(message)
        if not "operation" in message_dict: print("operation not found"); return
        if not "motor" in message_dict["operation"]: print("motor not found"); return
        if not "brake" in message_dict["operation"]: print("brake not found"); return
        if message_dict["operation"]["brake"] == 1:
            motor_controller.apply_brake()
            print("Applyed brake")
            return
        x, y = message_dict["operation"]["motor"]["x"], message_dict["operation"]["motor"]["y"]
        motor_controller.apply_operation(value_x=x, value_y=y)
        print("Applyed x: %f, y: %f" % (x, y))

class WebSocketMonitorHundler(tornado.websocket.WebSocketHandler):
    def open(self):
        print("Websocket monitor opened")

    def on_message(self, message):
        response_data = {}
        monitor.update_wlan0_status()
        response_data["signal-level"], response_data["signal-value"] = monitor.get_wlan0_level()
        reply = json.dumps(response_data)
        self.write_message(reply)
        print("message: %s" % message)
        print("reply: %s" % reply)

    def on_close(self):
        print("Websocket monitor closed")


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        print("MainHubdler")
        self.render('server.html', hostName=HOST_NAME, title="WebSocket")

class MobilePageHundler(tornado.web.RequestHandler):
    def get(self):
        print("MobilePageHubdler")
        self.render('mobile.html', hostName=HOST_NAME, title="mobile")

class PcPageHundler(tornado.web.RequestHandler):
    def get(self):
        print("PcPageHundler")
        self.render('pc.html', title="pc", momoPort=8080)

def make_app(debug=False):
    print("Server started")
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/mobile", MobilePageHundler),
        (r"/pc", PcPageHundler),
        (r"/ws/controller", WebSocketControllerHandler),
        (r"/ws/monitor", WebSocketMonitorHundler),
    ],
        template_path=os.path.join('', 'templates'),
        static_path=os.path.join('', 'static'),
        title="WebSocket",
        debug=debug
    )

def get_options(op):
    """
    コマンドライン引数のオプションを検索し、オプションの値を取得する

    Parameters
    ----------
    op : string
        オプション (例："-p"
    
    Returns
    -------
    op_value : String
        オプションが見つかったら、オプションの後ろに指定されている値を返す
        見つからなかったらNoneを返す
    """
    args = sys.argv
    is_find = False  # 当該オプションを見つけた場合はフラグを立てる
    for val in args:
        if is_find: return val
        if val == op: is_find = True
    return None

if __name__ == "__main__":
    port = get_options("-p")
    if port != None and port.isdecimal(): port = int(port)
    else: port = 8080
    print("Listen port: %d" % port)
    app = make_app(debug=True)
    app.listen(port)
    tornado.ioloop.IOLoop.current().start()
