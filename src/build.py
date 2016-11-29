import tornado.web
import TeamCityRequests as tcr


class BuildHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get(self, build_id):
        uri = '/guestAuth/app/rest/builds/id:' + build_id
        result = tcr.make_request(uri)
        self.write(result['payload_json'])
