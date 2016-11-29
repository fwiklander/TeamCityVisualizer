import sys
import getopt
import tornado.ioloop
import tornado.web
import os.path
import project
import configuration
import build
import TeamCityRequests as tcRequests


class MainHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get(self, project_id):
        self.render(os.path.join(template_path, 'index.html'), project_id=project_id)


template_path = os.path.join(os.path.dirname(__file__), 'templates')
def make_app():
    return tornado.web.Application([(r"/configuration/(.+)/build/", configuration.ConfigurationBuildHandler),
                                    (r"/configuration/(.+)/trigger/", configuration.ConfigurationTriggerHandler),
                                    (r"/project/(.+)/history/(\d)", project.ProjectHistoryHandler),
                                    (r"/build/(.+)", build.BuildHandler),
                                    (r"/project/(.+)/currentBuildChain", project.CurrentBuildChainHandler),
                                    (r"/project/(.+)", project.ProjectHandler),
                                    (r"/(.*)", MainHandler)],
                                   debug=True,
                                   static_path=os.path.join(os.path.dirname(__file__), "static"))


def main(args):
    app_port = 8089
    tc_host = 'http://localhost'
    tc_port = '8888'
    tc_auth_type = 'guestAuth'
    try:
        opts, args = getopt.getopt(args,"h:p:l:a",["tcHost=","tcPort=", "httpAuth", "appPort="])
    except getopt.GetoptError:
      print ('program.py -h <TeamCityHost> -p <TeamCityPort> -a -l <applicationPort>')
      sys.exit(2)
    for (opt, arg) in opts:
        if opt in ('-h', '--tcHost'):
            tc_host = arg
        elif opt in ('-p', '--tcPort'):
            tc_port = arg
        elif opt in ('-a', '--authType'):
            tc_auth_type = 'httpAuth'
            # Needs to be complemented with credentials
        elif opt in ('-l', '--appPort'):
            app_port = int(arg)

    app = make_app()
    tcRequests.base_uri = tc_host + ':' + tc_port + '/' + tc_auth_type
    print ('App is listening on port ' + str(app_port))
    print ('Accessing TeamCity API at ' + tcRequests.base_uri)
    app.listen(app_port)
    tornado.ioloop.IOLoop.current().start()

        
if __name__ == "__main__":
    main(sys.argv[1:])