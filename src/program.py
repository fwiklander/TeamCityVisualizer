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
def make_app(debug_mode):
    return tornado.web.Application([(r"/configuration/(.+)/build/", configuration.ConfigurationBuildHandler),
                                    (r"/configuration/(.+)/trigger/", configuration.ConfigurationTriggerHandler),
                                    (r"/project/(.+)/history/(\d)", project.ProjectHistoryHandler),
                                    (r"/build/(.+)", build.BuildHandler),
                                    (r"/project/(.+)/currentBuildChain", project.CurrentBuildChainHandler),
                                    (r"/project/(.+)/lastCompleteBuildChain", project.LastCompleteBuildChainHandler),
                                    (r"/project/(.+)", project.ProjectHandler),
                                    (r"/(.*)", MainHandler)],
                                   debug=debug_mode,
                                   static_path=os.path.join(os.path.dirname(__file__), "static"))


def main(args):
    app_port = 8089
    tc_host = 'http://localhost'
    tc_port = '8888'
    tc_auth_type = 'guestAuth'
    debug_mode = False
    try:
        opts, args = getopt.getopt(args,"h:p:l:ad",["tcHost=","tcPort=", "httpAuth", "appPort=", "debug"])
    except getopt.GetoptError:
      print ('program.py -h <TeamCityHost> -p <TeamCityPort> -a [httpAuth] -l <applicationPort> -d [debug mode]')
      sys.exit(2)
    for (opt, arg) in opts:
        if opt in ('-h', '--tcHost'):
            tc_host = arg
        elif opt in ('-p', '--tcPort'):
            tc_port = arg
        elif opt in ('-a', '--httpAuth'):
            tc_auth_type = 'httpAuth'
            # Needs to be complemented with credentials
        elif opt in ('-l', '--appPort'):
            app_port = int(arg)
        elif opt in ('-d', '--debug'):
            debug_mode = True

    app = make_app(debug_mode)
    tcRequests.base_uri = tc_host + ':' + tc_port + '/' + tc_auth_type
    print ('App is listening on port ' + str(app_port))
    print ('Accessing TeamCity API at ' + tcRequests.base_uri)
    app.listen(app_port)
    tornado.ioloop.IOLoop.current().start()

        
if __name__ == "__main__":
    main(sys.argv[1:])