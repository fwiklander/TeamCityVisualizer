import tornado.web
import TeamCityRequests as tcRequest


class BuildHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get(self, build_id):
        result = get_build(build_id)
        self.write(result['payload_json'])


def get_build(build_id):
    uri = '/app/rest/builds/id:' + str(build_id)
    return tcRequest.make_request(uri)
    


def get_build_chain_to(build_id):
    uri = '/app/rest/builds?locator=snapshotDependency:(to:(id:' + str(build_id) + '),includeInitial:true),defaultFilter:false'
    return tcRequest.make_request(uri)


def get_build_chain_from(build_id):
    uri = '/app/rest/builds?locator=snapshotDependency:(from:(id:' + str(build_id) + '),includeInitial:true),defaultFilter:false'
    return tcRequest.make_request(uri)
