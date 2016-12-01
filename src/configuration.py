import tornado.web
import TeamCityRequests as tcRequest


class ConfigurationBuildHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get(self, config_id):
        result = get_builds(config_id)
        self.write(result['payload_json'])


class ConfigurationTriggerHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get(self, config_id):
        result = tcRequest.start_build(config_id)
        self.write('Build trigger sent')


def get_builds(configuration_id):
    uri = '/app/rest/buildTypes/id:' + configuration_id + '/builds/?locator=defaultFilter:false'
    return tcRequest.make_request(uri)


def get_build_steps(configuration_id):
    uri = '/app/rest/buildTypes/id:' + configuration_id + '/steps/'
    return tcRequest.make_request(uri)